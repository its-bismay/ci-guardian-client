import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import RunCard from '../components/RunCard';

export default function RepoRuns() {
  const { id } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ['runs', id],
    queryFn: () => api.get(`/runs?repo_id=${id}`),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Repo Runs</h1>
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-24 w-full" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {data?.runs?.map((run) => (
            <RunCard key={run.id} run={run} />
          ))}
          {data?.runs?.length === 0 && (
            <p className="text-base-content/50 text-center py-8">No runs for this repo yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
