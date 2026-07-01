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
  const [search, setSearch] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [telegramError, setTelegramError] = useState(null);
  const [telegramConnected, setTelegramConnected] = useState(false);
  const [telegramSent, setTelegramSent] = useState(false);
  const [polling, setPolling] = useState(false);
  const [telegramCode, setTelegramCode] = useState(null);
  const [telegramBot, setTelegramBot] = useState('');
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (params.get('installed') === '1') {
      setStep(1);
    }
  }, []);

  useEffect(() => {
    if (step === 1 && repos === null) {
      fetchRepos();
    }
  }, [step]);

  function fetchRepos() {
    setError(null);
    setRepos(null);
    api.get('/github/repos').then((data) => {
      setRepos(data);
      if (data.length === 0 && !params.get('sync_error') && !params.get('installed')) {
        setError('No repos found. Make sure you installed the app on at least one repo.');
      }
    }).catch((err) => {
      setError(err.message || 'Failed to fetch repos.');
    });
  }

  function syncRepos() {
    setSyncing(true);
    setError(null);
    api.post('/github/repos/sync').then(() => fetchRepos()).catch((err) => {
      setError(err.message || 'Failed to sync repos. Check your GitHub App configuration.');
    }).finally(() => setSyncing(false));
  }

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

  const connectTelegram = () => {
    setTelegramError(null);
    setTelegramSent(true);
    api.get('/notifications/telegram/link-code').then((r) => {
      setTelegramCode(r.code);
      setTelegramBot(r.url.match(/t\.me\/([^?]+)/)?.[1] || 'bot');
      window.location.href = r.url;
      pollTelegramStatus();
    }).catch((err) => {
      setTelegramError(err.message || 'Failed to get Telegram link.');
      setTelegramSent(false);
    });
  };

  function pollTelegramStatus() {
    setPolling(true);
    const interval = setInterval(async () => {
      try {
        const res = await api.get('/notifications/telegram/status');
        if (res.connected) {
          setTelegramConnected(true);
          setPolling(false);
          clearInterval(interval);
        }
      } catch { /* retry */ }
    }, 2000);
    setTimeout(() => { clearInterval(interval); setPolling(false); }, 120000);
  }

  const finish = () => navigate('/dashboard');

  const filtered = repos ? repos.filter((r) =>
    r.full_name.toLowerCase().includes(search.toLowerCase())
  ) : [];

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
              {params.get('sync_error') === '1' && (
                <div className="alert alert-warning mb-4 text-sm">
                  Repos installed but failed to sync from GitHub. <button onClick={syncRepos} className="btn btn-ghost btn-xs ml-2">{syncing ? <span className="loading loading-spinner loading-xs" /> : 'Retry'}</button>
                </div>
              )}
              {error && <div className="alert alert-error mb-4 text-sm">{error}
                <button onClick={syncRepos} className="btn btn-ghost btn-xs ml-2">{syncing ? <span className="loading loading-spinner loading-xs" /> : 'Retry Sync'}</button>
              </div>}
              <input
                type="text"
                placeholder="Search repos..."
                className="input input-bordered w-full mb-3"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {repos === null && !error && <div className="flex justify-center py-4"><span className="loading loading-spinner" /></div>}
                {repos && repos.length === 0 && !error && (
                  <p className="text-base-content/50 text-center py-4">
                    No repos found. <button onClick={syncRepos} className="link link-hover">{syncing ? 'Syncing...' : 'Sync from GitHub'}</button>
                  </p>
                )}
                {filtered.length === 0 && repos && repos.length > 0 && <p className="text-base-content/50 text-center py-4">No repos match your search.</p>}
                {filtered.map((r) => (
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
              {telegramError && <div className="alert alert-error mb-4 text-sm">{telegramError}</div>}
              <p className="text-base-content/70 mb-6">
                CI Guardian sends failure alerts to Telegram. <strong>This step is required.</strong>
              </p>
              {!telegramSent ? (
                <button onClick={connectTelegram} className="btn btn-primary btn-lg mb-4">
                  Connect Telegram
                </button>
              ) : telegramConnected ? (
                <div className="mb-4">
                  <div className="alert alert-success mb-4">✅ Telegram connected!</div>
                  <button onClick={finish} className="btn btn-primary btn-lg">
                    Go to Dashboard
                  </button>
                </div>
              ) : (
                <div className="mb-4">
                  <p className="text-base-content/70 mb-2">
                    Open Telegram and send this code to the bot:
                  </p>
                  <div className="text-lg font-mono font-bold bg-base-300 py-3 px-6 rounded-lg inline-block mb-4 select-all">
                    /start {telegramCode || '...'}
                  </div>
                  <p className="text-sm text-base-content/50 mb-4">
                    Search for <strong>@{telegramBot || 'ci_guardian_bot'}</strong> in Telegram and send the command above
                  </p>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    {polling && <span className="loading loading-spinner loading-sm text-primary" />}
                    <span className="text-sm text-base-content/50">
                      {polling ? 'Waiting for connection...' : ''}
                    </span>
                  </div>
                  {!polling && (
                    <button
                      onClick={() => {
                        setTelegramSent(false);
                        setTelegramConnected(false);
                        setTelegramCode(null);
                      }}
                      className="btn btn-ghost btn-sm"
                    >
                      Try again
                    </button>
                  )}
                  {!polling && (
                    <button onClick={() => pollTelegramStatus()} className="btn btn-primary btn-sm ml-2">
                      Check connection
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
