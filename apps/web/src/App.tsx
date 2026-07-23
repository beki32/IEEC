import { NavLink, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { Permissions } from '@ieec/shared';
import { SessionProvider, useSession } from './lib/session';
import { demoStore } from './lib/demoStore';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { QueuePage } from './pages/QueuePage';
import { AssignedPage } from './pages/AssignedPage';
import { PersonProfilePage } from './pages/PersonProfilePage';
import { AdminRolesPage } from './pages/AdminRolesPage';

function Shell() {
  const { person, organization, logout, has } = useSession();
  if (!person) return <Navigate to="/login" replace />;

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <div className="brand">IEEC YA Connect</div>
          <div className="muted" style={{ fontSize: '0.85rem' }}>
            {organization?.name} · {person.firstName} {person.lastName}
          </div>
        </div>
        <nav className="nav">
          <NavLink to="/app" end>Dashboard</NavLink>
          <NavLink to="/app/assigned">Assigned</NavLink>
          {(has(Permissions.newcomersViewUnassigned) || has(Permissions.newcomersViewAll)) && (
            <NavLink to="/app/queue">Queue</NavLink>
          )}
          {has(Permissions.rolesManage) && <NavLink to="/app/admin/roles">RBAC</NavLink>}
          <NavLink to="/register">Public register</NavLink>
          <button
            type="button"
            className="linkish"
            onClick={() => {
              demoStore.reset();
              logout();
              window.location.href = '/login';
            }}
          >
            Reset demo
          </button>
          <button type="button" className="linkish" onClick={logout}>Sign out</button>
        </nav>
      </header>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <SessionProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/app" element={<Shell />}>
          <Route index element={<DashboardPage />} />
          <Route path="assigned" element={<AssignedPage />} />
          <Route path="queue" element={<QueuePage />} />
          <Route path="people/:personId" element={<PersonProfilePage />} />
          <Route path="admin/roles" element={<AdminRolesPage />} />
        </Route>
      </Routes>
    </SessionProvider>
  );
}
