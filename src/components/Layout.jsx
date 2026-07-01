import { Outlet, Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/auth';
import ThemeToggle from './ThemeToggle';

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-base-200">
      <div className="navbar bg-base-100 border-b border-base-300 sticky top-0 z-50">
        <div className="flex-1">
          <Link to="/dashboard" className="btn btn-ghost text-xl font-bold">
            CI Guardian
          </Link>
        </div>
        <div className="flex-none gap-2">
          <ThemeToggle />
          <ul className="menu menu-horizontal px-1">
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/settings/repos">Settings</Link></li>
          </ul>
          {user && (
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                <div className="w-8 rounded-full">
                  <img src={user.avatar_url} alt={user.github_username} />
                </div>
              </div>
              <ul tabIndex={0} className="mt-3 z-50 p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
                <li><span className="font-medium">{user.github_username}</span></li>
                <li><Link to="/settings/account">Account</Link></li>
                <li><button onClick={handleLogout}>Logout</button></li>
              </ul>
            </div>
          )}
        </div>
      </div>
      <main className="p-4 max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
