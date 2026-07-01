import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useState } from 'react';

export default function RunReport() {
  const { id } = useParams();
  const [feedbackGiven, setFeedbackGiven] = useState(null);
  const queryClient = useQueryClient();

  const { data: run, isLoading } = useQuery({
    queryKey: ['run', id],
    queryFn: () => api.get(`/runs/${id}`),
  });

  const { data: report } = useQuery({
    queryKey: ['report', id],
    queryFn: () => api.get(`/reports/${id}`),
    enabled: !!run?.conclusion === 'failure',
  });

  const feedbackMutation = useMutation({
    mutationFn: (helpful) => api.post(`/reports/${id}/feedback`, { helpful }),
    onSuccess: () => setFeedbackGiven(true),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-12 w-64" />
        <div className="skeleton h-32 w-full" />
        <div className="skeleton h-48 w-full" />
      </div>
    );
  }

  if (!run) return <p className="text-center py-8 text-base-content/50">Run not found.</p>;

  const statusColor = {
    success: 'badge-success',
    failure: 'badge-error',
    cancelled: 'badge-ghost',
    timed_out: 'badge-warning',
    in_progress: 'badge-info',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            <Link to={`https://github.com/${run.repo_full_name}`} className="link link-hover">
              {run.repo_full_name}
            </Link>
            <span className="text-base-content/50 mx-2">/</span>
            {run.workflow_name}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <span className={`badge ${statusColor[run.conclusion] || 'badge-ghost'}`}>{run.conclusion}</span>
            <span className="text-sm text-base-content/60">{run.branch}</span>
            {run.commit_sha && (
              <span className="text-xs font-mono text-base-content/40">{run.commit_sha.slice(0, 7)}</span>
            )}
            {run.duration_seconds && (
              <span className="text-sm text-base-content/60">
                {Math.floor(run.duration_seconds / 60)}m {run.duration_seconds % 60}s
              </span>
            )}
          </div>
        </div>
        <a
          href={`https://github.com/${run.repo_full_name}/actions/runs/${run.github_run_id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline btn-sm"
        >
          Open in GitHub
        </a>
      </div>

      {run.conclusion !== 'failure' && (
        <div className="card bg-base-100 shadow-sm border border-base-300 p-8 text-center">
          <p className="text-lg">✅ This run {run.conclusion}.</p>
          {run.conclusion === 'success' && (
            <p className="text-sm text-base-content/50 mt-1">No analysis needed.</p>
          )}
        </div>
      )}

      {report && (
        <>
          <div className="card bg-base-100 shadow-sm border border-base-300 mb-4">
            <div className="card-body">
              <div className="flex items-center justify-between mb-2">
                <h2 className="card-title">Summary</h2>
                <div className="flex gap-2">
                  <span className={`badge ${report.is_flaky_guess ? 'badge-warning' : 'badge-info'}`}>
                    {report.category}
                  </span>
                  <span className="badge badge-outline">
                    {report.confidence}% confidence
                  </span>
                </div>
              </div>
              <p className="text-lg">{report.summary}</p>
              {report.is_flaky_guess && (
                <div className="alert alert-warning mt-2 text-sm">
                  ⚠️ This failure may be intermittent / flaky based on run history.
                </div>
              )}
            </div>
          </div>

          <div className="card bg-base-100 shadow-sm border border-base-300 mb-4">
            <div className="card-body">
              <h2 className="card-title">Root Cause</h2>
              <p className="text-base-content/80 whitespace-pre-wrap">{report.root_cause}</p>
            </div>
          </div>

          {report.evidence?.length > 0 && (
            <div className="card bg-base-100 shadow-sm border border-base-300 mb-4">
              <div className="card-body">
                <h2 className="card-title">Evidence</h2>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {report.evidence.map((e, i) => (
                    <li key={i} className="font-mono text-base-content/80">{e}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {report.proposed_fix && (
            <div className="card bg-base-100 shadow-sm border border-base-300 mb-4">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <h2 className="card-title">Proposed Fix</h2>
                  <button
                    className="btn btn-ghost btn-xs"
                    onClick={() => navigator.clipboard.writeText(report.proposed_fix)}
                  >
                    Copy fix
                  </button>
                </div>
                <pre className="bg-base-300 p-4 rounded-lg overflow-x-auto text-sm mt-2 whitespace-pre-wrap">
                  {report.proposed_fix}
                </pre>
              </div>
            </div>
          )}

          {report.pr_number && report.github_comment_id && (
            <div className="alert alert-success mb-4">
              <span>
                ✅ Posted to{' '}
                <a
                  href={`https://github.com/${run.repo_full_name}/pull/${report.pr_number}#issuecomment-${report.github_comment_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link link-hover font-semibold"
                >
                  PR #{report.pr_number}
                </a>
              </span>
            </div>
          )}

          <div className="card bg-base-100 shadow-sm border border-base-300">
            <div className="card-body">
              <h3 className="font-semibold mb-2">Was this analysis helpful?</h3>
              <div className="flex gap-3">
                <button
                  className={`btn ${feedbackGiven ? 'btn-disabled' : 'btn-outline btn-sm'}`}
                  onClick={() => feedbackMutation.mutate(true)}
                >
                  👍 Yes
                </button>
                <button
                  className={`btn ${feedbackGiven ? 'btn-disabled' : 'btn-outline btn-sm'}`}
                  onClick={() => feedbackMutation.mutate(false)}
                >
                  👎 No
                </button>
                {feedbackGiven && <span className="text-sm text-base-content/50 self-center">Thanks!</span>}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
