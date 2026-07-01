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

  const setupWebhook = async () => {
    setLinkError(null);
    await api.post('/notifications/telegram/setup-webhook');
  };

  const connectTelegram = async () => {
    setLinkError(null);
    setLinking(true);
    try {
      await setupWebhook();
      const r = await api.get('/notifications/telegram/link-code');
      setLinkCode(r.code);
      window.open(r.url, '_blank');
    } catch (err) {
      setLinkError(err.message || 'Failed. Make sure TELEGRAM_BOT_TOKEN is set on Render.');
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
            <div className="flex items-center justify-between">
              <div>
                <span className="text-success font-semibold">Connected</span>
                <p className="text-sm text-base-content/50 mt-1">Chat ID: {telegramChannel.external_id}</p>
              </div>
            </div>
          ) : linkCode ? (
            <div>
              <p className="text-base-content/70 mb-2">Open Telegram and send this command to the bot:</p>
              <code className="text-lg font-bold bg-base-300 px-3 py-1 rounded select-all block mb-2">
                /start {linkCode}
              </code>
              {linkError && <div className="alert alert-error text-sm mb-2">{linkError}</div>}
              <button onClick={checkConnection} className="btn btn-primary btn-sm mr-2">
                Check connection
              </button>
              <button onClick={() => { setLinking(false); setLinkCode(null); }} className="btn btn-ghost btn-sm">
                Cancel
              </button>
            </div>
          ) : (
            <div>
              <p className="text-base-content/70 mb-3">
                Receive CI failure alerts directly on Telegram.
              </p>
              {linkError && <div className="alert alert-error text-sm mb-3">{linkError}</div>}
              <button onClick={connectTelegram} className="btn btn-primary" disabled={linking}>
                {linking ? <span className="loading loading-spinner loading-xs" /> : 'Connect Telegram'}
              </button>
              <p className="text-xs text-base-content/40 mt-2">
                Requires <code>TELEGRAM_BOT_TOKEN</code> env var and a bot created via BotFather.
              </p>
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
