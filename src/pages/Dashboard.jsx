import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { connectSSE } from '../lib/sse';
import RunCard from '../components/RunCard';
import RepoFilter from '../components/RepoFilter';

export default function Dashboard() {
  const [repoFilter, setRepoFilter] = useState(null);
  const [liveRuns, setLiveRuns] = useState([]);

  const { data: repos } = useQuery({
    queryKey: ['repos'],
    queryFn: () => api.get('/github/repos'),
  });

  const { data: runsData } = useQuery({
    queryKey: ['runs', repoFilter],
    queryFn: () => api.get(`/runs?${repoFilter ? `repo_id=${repoFilter}` : ''}`),
  });

  useEffect(() => {
    const cleanup = connectSSE('/events/runs', (event) => {
      setLiveRuns((prev) => [event, ...prev].slice(0, 50));
    });
    return cleanup;
  }, []);

  const runs = liveRuns.length > 0 ? liveRuns : (runsData?.runs || []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <RepoFilter repos={repos} selected={repoFilter} onChange={setRepoFilter} />
      </div>

      {repos && repos.length === 0 ? (
        <div className="card bg-base-100 shadow-sm border border-base-300 p-12 text-center">
          <h3 className="text-lg font-semibold mb-2">No repos connected</h3>
          <p className="text-base-content/60 mb-4">
            Install the CI Guardian GitHub App and select repos to monitor.
          </p>
          <a href="/onboarding" className="btn btn-primary">
            Connect your first repo
          </a>
        </div>
      ) : runs.length === 0 ? (
        <div className="card bg-base-100 shadow-sm border border-base-300 p-12 text-center">
          <h3 className="text-lg font-semibold mb-2">No runs yet</h3>
          <p className="text-base-content/60 mb-4">
            Push a commit to a monitored repo and CI runs will appear here.
          </p>
          {repos && repos.length > 0 && (
            <p className="text-sm text-base-content/40">
              Monitoring {repos.length} repo{repos.length > 1 ? 's' : ''}
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {runs.map((run) => (
            <RunCard key={run.id} run={run} />
          ))}
        </div>
      )}
    </div>
  );
}
