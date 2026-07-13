import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../engines/people/authContext';

export function RequireAuth() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="center-screen">
        <p className="muted">Checking session…</p>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export function RequirePermission({ permission }: { permission: string }) {
  const { can, loading } = useAuth();
  if (loading) return null;
  if (!can(permission)) {
    return (
      <div className="panel">
        <h2>Access denied</h2>
        <p className="muted">Missing permission: {permission}</p>
      </div>
    );
  }
  return <Outlet />;
}
