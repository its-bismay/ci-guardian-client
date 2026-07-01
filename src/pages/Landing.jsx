import { Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

export default function Landing() {
  return (
    <div className="min-h-screen bg-base-200">
      <div className="navbar bg-base-100 border-b border-base-300">
        <div className="flex-1">
          <span className="btn btn-ghost text-xl font-bold">CI Guardian</span>
        </div>
        <div className="flex-none gap-2">
          <ThemeToggle />
          <Link to="/login" className="btn btn-primary">Get Started</Link>
        </div>
      </div>
      <div className="hero min-h-[80vh]">
        <div className="hero-content text-center max-w-3xl">
          <div>
            <h1 className="text-5xl font-bold">Stop Babysitting CI</h1>
            <p className="py-6 text-lg text-base-content/70">
              Auto-detect CI/CD failures, root-cause them with AI, and get the fix
              surfaced on your Dashboard, via Telegram, and as a PR comment —
              so you never have to wait on a pipeline again.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8 text-left">
              <div className="card bg-base-100 shadow-md">
                <div className="card-body">
                  <h3 className="card-title text-lg">🔍 Detect</h3>
                  <p className="text-sm text-base-content/70">Webhook-powered. The moment your CI run finishes, we pull the logs.</p>
                </div>
              </div>
              <div className="card bg-base-100 shadow-md">
                <div className="card-body">
                  <h3 className="card-title text-lg">🧠 Diagnose</h3>
                  <p className="text-sm text-base-content/70">AI analyzes logs + source code to find the actual root cause.</p>
                </div>
              </div>
              <div className="card bg-base-100 shadow-md">
                <div className="card-body">
                  <h3 className="card-title text-lg">🔧 Fix</h3>
                  <p className="text-sm text-base-content/70">Structured report with a proposed fix, delivered to you instantly.</p>
                </div>
              </div>
            </div>
            <Link to="/login" className="btn btn-primary btn-lg">Continue with GitHub</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
