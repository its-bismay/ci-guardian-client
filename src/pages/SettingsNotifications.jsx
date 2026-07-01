import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export default function SettingsNotifications() {
  const [linking, setLinking] = useState(false);
  const [linkCode, setLinkCode] = useState(null);
  const [linkError, setLinkError] = useState(null);
  const queryClient = useQueryClient();

  const { data: channels } = useQuery({
    queryKey: ['notification-channels'],
    queryFn: () => api.get('/notifications/channels'),
  });

  const { data: preferences } = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: () => api.get('/notifications/preferences'),
  });

  const prefsMutation = useMutation({
    mutationFn: (prefs) => api.patch('/notifications/preferences', prefs),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notification-preferences'] }),
  });

  const telegramChannel = channels?.find((c) => c.channel_type === 'telegram');

  const connectTelegram = async () => {
    setLinkError(null);
    setLinking(true);
    try {
      await api.post('/notifications/telegram/setup-webhook');
      const r = await api.post('/notifications/telegram/link-code');
      setLinkCode(r.code);
      window.open(r.url, '_blank');
    } catch {
      setLinkError('Could not connect to Telegram. Please try again later.');
      setLinking(false);
    }
  };

  const checkConnection = async () => {
    try {
      const r = await api.get('/notifications/telegram/status');
      if (r.connected) {
        queryClient.invalidateQueries({ queryKey: ['notification-channels'] });
        setLinking(false);
        setLinkCode(null);
      } else {
        setLinkError('Not connected yet. Send the code to the bot on Telegram.');
      }
    } catch { /* ignore */ }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Notification Settings</h1>

      <div className="card bg-base-100 shadow-sm border border-base-300 mb-6">
        <div className="card-body">
          <h2 className="card-title">Telegram</h2>
          {telegramChannel?.verified ? (
            <div className="alert alert-success">Telegram connected — you will receive build alerts here.</div>
          ) : linkCode ? (
            <div>
              <ol className="steps steps-vertical mb-4">
                <li className="step step-primary">Open Telegram</li>
                <li className="step step-primary">Search for the CI Guardian bot</li>
                <li className="step">Send the code below to the bot</li>
              </ol>
              <div className="bg-base-300 rounded-lg p-4 mb-3 text-center">
                <p className="text-sm text-base-content/50 mb-1">Send this to the bot:</p>
                <code className="text-xl font-bold select-all">/start {linkCode}</code>
              </div>
              {linkError && <div className="alert alert-error text-sm mb-2">{linkError}</div>}
              <button onClick={checkConnection} className="btn btn-primary btn-sm">
                I sent the code — check connection
              </button>
              <button onClick={() => { setLinking(false); setLinkCode(null); }} className="btn btn-ghost btn-sm ml-2">
                Cancel
              </button>
            </div>
          ) : (
            <div>
              <p className="text-base-content/70 mb-3">
                Get notified on Telegram when a CI build fails.
              </p>
              {linkError && <div className="alert alert-error text-sm mb-3">{linkError}</div>}
              <button onClick={connectTelegram} className="btn btn-primary" disabled={linking}>
                {linking ? <span className="loading loading-spinner loading-xs" /> : 'Connect Telegram'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-300">
        <div className="card-body">
          <h2 className="card-title mb-4">Per-Repo Preferences</h2>
          {!preferences || preferences.length === 0 ? (
            <p className="text-base-content/50">No repos configured yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Repo</th>
                    <th>Failure</th>
                    <th>Success</th>
                    <th>PR Comment</th>
                  </tr>
                </thead>
                <tbody>
                  {preferences.map((p) => (
                    <tr key={p.id}>
                      <td>{p.repo_name || 'All repos'}</td>
                      <td>
                        <input
                          type="checkbox"
                          className="toggle toggle-sm"
                          checked={p.notify_on_failure}
                          onChange={() =>
                            prefsMutation.mutate({
                              ...p,
                              notify_on_failure: !p.notify_on_failure,
                            })
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          className="toggle toggle-sm"
                          checked={p.notify_on_success}
                          onChange={() =>
                            prefsMutation.mutate({
                              ...p,
                              notify_on_success: !p.notify_on_success,
                            })
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          className="toggle toggle-sm"
                          checked={p.post_pr_comment}
                          onChange={() =>
                            prefsMutation.mutate({
                              ...p,
                              post_pr_comment: !p.post_pr_comment,
                            })
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
