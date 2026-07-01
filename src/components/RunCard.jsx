import { Link } from 'react-router-dom';

const statusIcon = {
  success: '🟢',
  failure: '🔴',
  cancelled: '⚪',
  timed_out: '🟡',
  in_progress: '🟡',
  queued: '⚪',
};

export default function RunCard({ run }) {
  return (
    <div className="card bg-base-100 shadow-sm border border-base-300">
      <div className="card-body p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{statusIcon[run.conclusion] || '⚪'}</span>
            <span className="font-semibold">{run.repo_full_name || 'repo'}</span>
            <span className="text-sm text-base-content/70">·</span>
            <span className="badge badge-outline badge-sm">{run.branch}</span>
          </div>
          <span className="text-xs text-base-content/50">
            {run.finished_at ? new Date(run.finished_at).toLocaleString() : 'In progress'}
          </span>
        </div>
        <p className="text-sm font-medium mt-1">{run.workflow_name}</p>
        {run.summary && (
          <p className="text-sm text-base-content/70 mt-1 italic">"{run.summary}"</p>
        )}
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-base-content/50">
            {run.duration_seconds ? `${Math.floor(run.duration_seconds / 60)}m ${run.duration_seconds % 60}s` : ''}
          </span>
          <Link to={`/runs/${run.id}`} className="btn btn-primary btn-xs">
            {run.has_report ? 'View Report' : 'View Run'}
          </Link>
        </div>
      </div>
    </div>
  );
}
