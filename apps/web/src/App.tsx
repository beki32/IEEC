import { NavLink, Navigate, Outlet, Route, Routes, useNavigate } from 'react-router-dom';
import { Permissions, type Team } from '@ieec/shared';
import { SessionProvider, useSession } from './lib/session';
import { demoStore } from './lib/demoStore';
import { ChatDockProvider, useChatDock } from './lib/chatDock';
import { ADMIN_MENUS, SHARED_MENUS, TEAM_MODULE_MENUS, type MenuItem } from './lib/teamMenus';
import { ChatDock } from './components/ChatDock';
import { NotificationsBell } from './components/NotificationsBell';
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

function teamMenusFor(team: Team, has: (p: string) => boolean) {
  return visible(TEAM_MODULE_MENUS[team.moduleKey] ?? TEAM_MODULE_MENUS.generic, has);
}

function CmsShell() {
  const { person, organization, logout, has, myTeams, activeTeam, setActiveTeam, refresh } =
    useSession();
  const { openChat } = useChatDock();
  const navigate = useNavigate();
  if (!person) return <Navigate to="/login" replace />;

  const sharedMenus = visible(
    SHARED_MENUS.filter((item) => item.to !== '/app/chat' && item.to !== '/app/notifications'),
    has,
  );
  const adminMenus = visible(ADMIN_MENUS, has);

  function onTeamSelect(teamId: string) {
    setActiveTeam(teamId);
    refresh();
    navigate('/app');
  }

  return (
    <div className="cms-shell">
      <aside className="cms-sidebar">
        <div className="cms-brand-block">
          <div className="cms-brand-title">IEEC YA Connect</div>
          <div className="cms-brand-sub">{organization?.name}</div>
        </div>

        <nav className="cms-side-nav">
          <div className="cms-section-label">Teams</div>
          {myTeams.length === 0 ? <div className="cms-empty">No team memberships</div> : null}

          <ul className="cms-team-nav">
            {myTeams.map((team: Team) => {
              const selected = activeTeam?.id === team.id;
              const menus = teamMenusFor(team, has);
              return (
                <li key={team.id} className={`cms-team-nav-item ${selected ? 'selected' : ''}`}>
                  <button
                    type="button"
                    className={`cms-team-link ${selected ? 'active' : ''}`}
                    aria-expanded={selected}
                    onClick={() => onTeamSelect(team.id)}
                  >
                    <span>{team.name}</span>
                    <span className="cms-team-chevron" aria-hidden="true">{selected ? '▾' : '▸'}</span>
                  </button>
                  {selected ? (
                    <div className="cms-team-submenu" role="group" aria-label={`${team.name} menu`}>
                      {menus.map((item) => (
                        <NavLink key={item.to} to={item.to} end={item.end} className="cms-nav-link nested">
                          {item.label}
                        </NavLink>
                      ))}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>

          <div className="cms-section-label">Organization</div>
          {sharedMenus.map((item) => (
            <NavLink key={item.to} to={item.to} className="cms-nav-link">
              {item.label}
            </NavLink>
          ))}
          <button type="button" className="cms-nav-link cms-nav-btn" onClick={() => openChat()}>
            Chat
          </button>

          {adminMenus.length ? (
            <>
              <div className="cms-section-label">Admin</div>
              {adminMenus.map((item) => (
                <NavLink key={item.to} to={item.to} className="cms-nav-link">{item.label}</NavLink>
              ))}
            </>
          ) : null}
        </nav>

        <div className="cms-sidebar-foot">
          <div className="cms-user">
            {person.firstName} {person.lastName}
          </div>
          <div className="cms-foot-actions">
            <NavLink to="/register">Register</NavLink>
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
              Reset
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
        </div>
      </aside>

      <div className="cms-main">
        <header className="cms-topbar">
          <div>
            <div className="cms-context">{activeTeam ? activeTeam.name : 'No active team'}</div>
            <div className="muted">Select a team in the sidebar to open its menu.</div>
          </div>
          <div className="cms-top-actions">
            <NotificationsBell />
            {has(Permissions.rolesManage) ? (
              <NavLink className="btn secondary" to="/app/admin/roles">RBAC</NavLink>
            ) : null}
          </div>
        </header>

        <main className="cms-content">
          <div className="cms-content-inner">
            <Outlet />
          </div>
        </main>
      </div>

      <ChatDock />
    </div>
  );
}

export default function App() {
  return (
    <SessionProvider>
      <ChatDockProvider>
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
      </ChatDockProvider>
    </SessionProvider>
  );
}
