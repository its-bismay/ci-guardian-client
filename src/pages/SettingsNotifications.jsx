import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export default function SettingsNotifications() {
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

  const connectTelegram = async () => {
    const { url } = await api.post('/notifications/telegram/link-code');
    window.open(url, '_blank');
  };

  const telegramChannel = channels?.find((c) => c.channel_type === 'telegram');

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Notification Settings</h1>

      <div className="card bg-base-100 shadow-sm border border-base-300 mb-6">
        <div className="card-body">
          <h2 className="card-title">Telegram</h2>
          {telegramChannel?.verified ? (
            <div className="flex items-center justify-between">
              <span className="text-success">✅ Connected</span>
              <button className="btn btn-outline btn-sm">Disconnect</button>
            </div>
          ) : (
            <div>
              <p className="text-base-content/70 mb-3">
                Get instant CI alerts in Telegram.
              </p>
              <button onClick={connectTelegram} className="btn btn-primary">
                Connect Telegram
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
