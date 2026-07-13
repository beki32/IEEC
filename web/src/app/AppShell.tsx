import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../engines/people/authContext';

export function AppShell() {
  const { profile, logout, can } = useAuth();

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand-block">
          <p className="brand">IEEC YA Connect</p>
          <p className="brand-sub">Ministry platform</p>
        </div>
        <nav className="nav">
          <NavLink to="/" end>
            Home
          </NavLink>
          {can('follow_up.view') && <NavLink to="/follow-up">Follow-Up</NavLink>}
          <NavLink to="/register">Public registration</NavLink>
        </nav>
        <div className="sidebar-footer">
          <p className="muted small">{profile?.displayName || profile?.email}</p>
          <p className="muted small">{profile?.systemRole}</p>
          <button type="button" className="btn ghost" onClick={() => void logout()}>
            Sign out
          </button>
        </div>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
