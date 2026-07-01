import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Link } from 'react-router-dom';

export default function SettingsRepos() {
  const queryClient = useQueryClient();

  const { data: repos, isLoading } = useQuery({
    queryKey: ['repos'],
    queryFn: () => api.get('/github/repos'),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_monitored }) => api.post(`/github/repos/${id}/toggle`, { is_monitored }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['repos'] }),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Monitored Repos</h1>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-12 w-full" />)}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>Repository</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {repos?.map((r) => (
                <tr key={r.id}>
                  <td>
                    <Link to={`/dashboard/repos/${r.id}`} className="link link-hover font-medium">
                      {r.full_name}
                    </Link>
                  </td>
                  <td>
                    <span className={`badge ${r.is_monitored ? 'badge-success' : 'badge-ghost'}`}>
                      {r.is_monitored ? 'Active' : 'Paused'}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`btn btn-xs ${r.is_monitored ? 'btn-warning' : 'btn-primary'}`}
                      onClick={() => toggleMutation.mutate({ id: r.id, is_monitored: !r.is_monitored })}
                    >
                      {r.is_monitored ? 'Pause' : 'Resume'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {repos?.length === 0 && (
            <p className="text-center py-8 text-base-content/50">
              No repos installed. <Link to="/onboarding" className="link link-hover">Install the app</Link>.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
