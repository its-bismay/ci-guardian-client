import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';

const STEPS = ['Install App', 'Select Repos', 'Connect Telegram'];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [repos, setRepos] = useState(null);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (params.get('installed') === '1') {
      setStep(1);
    }
  }, []);

  useEffect(() => {
    if (step === 1 && repos === null) {
      setError(null);
      api.get('/github/repos').then((data) => {
        setRepos(data);
        if (data.length === 0) setError('No repos found. Make sure you installed the app on at least one repo.');
      }).catch((err) => {
        setError(err.message || 'Failed to fetch repos. Try again.');
      });
    }
  }, [step]);

  const installApp = () => {
    api.get('/github/install-url').then((res) => {
      window.location.href = res.url;
    });
  };

  const toggleRepo = (id) => {
    setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
  };

  const saveRepos = async () => {
    setLoading(true);
    try {
      await Promise.all(selected.map((id) => api.post(`/github/repos/${id}/toggle`, { is_monitored: true })));
      setStep(2);
    } catch (err) {
      setError('Failed to save repo selection.');
    }
    setLoading(false);
  };

  const skip = () => navigate('/dashboard');

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="card bg-base-100 shadow-xl max-w-xl w-full">
        <div className="card-body p-8">
          {params.get('error') === 'auth_required' && (
            <div className="alert alert-warning mb-4 text-sm">Session expired. Please log in again.</div>
          )}
          <ul className="steps steps-horizontal mb-8 w-full">
            {STEPS.map((s, i) => (
              <li key={s} className={`step ${i <= step ? 'step-primary' : ''}`}>{s}</li>
            ))}
          </ul>

          {step === 0 && (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Install CI Guardian</h2>
              <p className="text-base-content/70 mb-6">
                Install the CI Guardian GitHub App to monitor your repos.
              </p>
              <button onClick={installApp} className="btn btn-primary btn-lg">
                Install GitHub App
              </button>
              <p className="mt-4">
                <button onClick={() => setStep(1)} className="link link-hover text-sm">
                  I already installed it
                </button>
              </p>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Select Repos to Monitor</h2>
              {error && <div className="alert alert-error mb-4 text-sm">{error}
                <button onClick={() => { setRepos(null); setError(null); }} className="btn btn-ghost btn-xs ml-2">Retry</button>
              </div>}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {repos === null && !error && <div className="flex justify-center py-4"><span className="loading loading-spinner" /></div>}
                {repos && repos.length === 0 && !error && <p className="text-base-content/50">No repos found. Make sure you granted access to at least one repo.</p>}
                {repos && repos.map((r) => (
                  <label key={r.id} className="flex items-center gap-3 p-2 hover:bg-base-200 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary"
                      checked={selected.includes(r.id)}
                      onChange={() => toggleRepo(r.id)}
                    />
                    <span>{r.full_name}</span>
                  </label>
                ))}
              </div>
              <div className="flex justify-between mt-6">
                <button onClick={() => setStep(0)} className="btn btn-ghost">Back</button>
                <button onClick={saveRepos} className="btn btn-primary" disabled={loading || selected.length === 0}>
                  {loading ? <span className="loading loading-spinner" /> : 'Continue'}
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Connect Telegram</h2>
              <p className="text-base-content/70 mb-6">
                Get CI alerts in Telegram (optional, skip if you prefer).
              </p>
              <button
                onClick={() => api.get('/notifications/telegram/link-code').then((r) => window.open(r.url, '_blank'))}
                className="btn btn-primary mb-4"
              >
                Connect Telegram
              </button>
              <div>
                <button onClick={skip} className="btn btn-ghost">Skip for now</button>
              </div>
              <p className="mt-4 text-sm text-base-content/50">
                You can always connect Telegram later in Settings.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
