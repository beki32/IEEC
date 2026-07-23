import { NavLink, Navigate, Outlet, Route, Routes, useNavigate } from 'react-router-dom';
import { Permissions, type Team } from '@ieec/shared';
import { SessionProvider, useSession } from './lib/session';
import { demoStore } from './lib/demoStore';
import { ADMIN_MENUS, SHARED_MENUS, TEAM_MODULE_MENUS, type MenuItem } from './lib/teamMenus';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { QueuePage } from './pages/QueuePage';
import { AssignedPage } from './pages/AssignedPage';
import { PersonProfilePage } from './pages/PersonProfilePage';
import { AdminRolesPage } from './pages/AdminRolesPage';
import { CalendarPage } from './pages/CalendarPage';
import { ChatPage } from './pages/ChatPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ModulePlaceholderPage } from './pages/ModulePlaceholderPage';

function visible(items: MenuItem[], has: (p: string) => boolean) {
  return items.filter((item) => !item.anyOf || item.anyOf.some((p) => has(p)));
}

function CmsShell() {
  const { person, organization, logout, has, myTeams, activeTeam, setActiveTeam, unreadCount, refresh } =
    useSession();
  const navigate = useNavigate();
  if (!person) return <Navigate to="/login" replace />;

  const moduleMenus = visible(
    TEAM_MODULE_MENUS[activeTeam?.moduleKey ?? 'generic'] ?? TEAM_MODULE_MENUS.generic,
    has,
  );
  const sharedMenus = visible(SHARED_MENUS, has);
  const adminMenus = visible(ADMIN_MENUS, has);

  function onTeamChange(teamId: string) {
    setActiveTeam(teamId);
    refresh();
    navigate('/app');
  }

  return (
    <div className="cms-shell">
      <aside className="cms-sidebar">
        <div className="cms-brand">
          <div className="brand">IEEC YA Connect</div>
          <div className="muted" style={{ fontSize: '0.8rem' }}>
            {organization?.name}
          </div>
        </div>

        <label className="team-switcher">
          <span className="muted">Active team</span>
          <select
            value={activeTeam?.id ?? ''}
            onChange={(e) => onTeamChange(e.target.value)}
            aria-label="Switch team"
          >
            {myTeams.length === 0 ? <option value="">No team memberships</option> : null}
            {myTeams.map((team: Team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </label>

        <nav className="cms-nav">
          <div className="nav-section-label">
            {activeTeam?.name ?? 'Team'} modules
          </div>
          {moduleMenus.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}>
              {item.label}
            </NavLink>
          ))}

          <div className="nav-section-label">Organization</div>
          {sharedMenus.map((item) => (
            <NavLink key={item.to} to={item.to}>
              {item.label}
              {item.to === '/app/notifications' && unreadCount > 0 ? (
                <span className="nav-count">{unreadCount}</span>
              ) : null}
            </NavLink>
          ))}

          {adminMenus.length ? (
            <>
              <div className="nav-section-label">Admin</div>
              {adminMenus.map((item) => (
                <NavLink key={item.to} to={item.to}>{item.label}</NavLink>
              ))}
            </>
          ) : null}
        </nav>

        <div className="cms-sidebar-foot">
          <div className="muted" style={{ fontSize: '0.85rem' }}>
            {person.firstName} {person.lastName}
          </div>
          <NavLink to="/register">Public register</NavLink>
          <button
            type="button"
            className="linkish"
            onClick={() => {
              demoStore.reset();
              void logout().then(() => {
                window.location.href = '/login';
              });
            }}
          >
            Reset demo
          </button>
          <button
            type="button"
            className="linkish"
            onClick={() => {
              void logout();
            }}
          >
            Sign out
          </button>
        </div>
      </aside>

      <div className="cms-main">
        <header className="cms-topbar">
          <div>
            <div className="cms-context">
              {activeTeam ? `${activeTeam.name} · ${activeTeam.moduleKey}` : 'No active team'}
            </div>
            <div className="muted" style={{ fontSize: '0.85rem' }}>
              Multi-team CMS shell — membership ≠ chat membership
            </div>
          </div>
          <div className="row">
            <NavLink className="notif-bell" to="/app/notifications">
              Notifications
              {unreadCount > 0 ? <span className="nav-count">{unreadCount}</span> : null}
            </NavLink>
            {has(Permissions.rolesManage) ? (
              <NavLink to="/app/admin/roles">RBAC</NavLink>
            ) : null}
          </div>
        </header>
        <main className="main cms-content">
          <Outlet />
        </main>
      </div>
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
        <Route path="/app" element={<CmsShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="assigned" element={<AssignedPage />} />
          <Route path="queue" element={<QueuePage />} />
          <Route path="people/:personId" element={<PersonProfilePage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="modules/:moduleKey" element={<ModulePlaceholderPage />} />
          <Route path="admin/roles" element={<AdminRolesPage />} />
        </Route>
      </Routes>
    </SessionProvider>
  );
}
