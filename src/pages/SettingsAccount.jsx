import useAuthStore from '../store/auth';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function SettingsAccount() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Account</h1>
      <div className="card bg-base-100 shadow-sm border border-base-300">
        <div className="card-body">
          <div className="flex items-center gap-4 mb-6">
            <div className="avatar">
              <div className="w-16 rounded-full">
                <img src={user?.avatar_url} alt={user?.github_username} />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold">{user?.github_username}</h2>
              <p className="text-sm text-base-content/60">{user?.email}</p>
            </div>
          </div>

          {!confirming ? (
            <button onClick={() => setConfirming(true)} className="btn btn-outline btn-error">
              Sign out
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm">Are you sure?</span>
              <button onClick={handleLogout} className="btn btn-error btn-sm">Confirm</button>
              <button onClick={() => setConfirming(false)} className="btn btn-ghost btn-sm">Cancel</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
