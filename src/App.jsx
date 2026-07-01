import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import useAuthStore from './store/auth';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import RepoRuns from './pages/RepoRuns';
import RunReport from './pages/RunReport';
import SettingsRepos from './pages/SettingsRepos';
import SettingsNotifications from './pages/SettingsNotifications';
import SettingsAccount from './pages/SettingsAccount';
import Layout from './components/Layout';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuthStore();
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const { checkAuth, loading } = useAuthStore();

  useEffect(() => { checkAuth(); }, []);

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/onboarding"
        element={<ProtectedRoute><Onboarding /></ProtectedRoute>}
      />
      <Route element={<Layout />}>
        <Route
          path="/dashboard"
          element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
        />
        <Route
          path="/dashboard/repos/:id"
          element={<ProtectedRoute><RepoRuns /></ProtectedRoute>}
        />
        <Route
          path="/runs/:id"
          element={<ProtectedRoute><RunReport /></ProtectedRoute>}
        />
        <Route
          path="/settings/repos"
          element={<ProtectedRoute><SettingsRepos /></ProtectedRoute>}
        />
        <Route
          path="/settings/notifications"
          element={<ProtectedRoute><SettingsNotifications /></ProtectedRoute>}
        />
        <Route
          path="/settings/account"
          element={<ProtectedRoute><SettingsAccount /></ProtectedRoute>}
        />
      </Route>
    </Routes>
  );
}
