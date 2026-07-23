import { NavLink, Navigate, Outlet, Route, Routes, useNavigate } from 'react-router-dom';
import { Permissions, type Team } from '@ieec/shared';
import { SessionProvider, useSession } from './lib/session';
import { demoStore } from './lib/demoStore';
import { ChatDockProvider, useChatDock } from './lib/chatDock';
import { ADMIN_MENUS, SHARED_MENUS, TEAM_MODULE_MENUS, type MenuItem } from './lib/teamMenus';
import { ChatDock } from './components/ChatDock';
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

function teamMark(moduleKey: string) {
  switch (moduleKey) {
    case 'follow_up':
      return 'FU';
    case 'bible_study':
      return 'BS';
    case 'media':
      return 'MD';
    case 'worship':
      return 'WP';
    default:
      return 'TM';
  }
}

function CmsShell() {
  const { person, organization, logout, has, myTeams, activeTeam, setActiveTeam, unreadCount, refresh } =
    useSession();
  const { openChat } = useChatDock();
  const navigate = useNavigate();
  if (!person) return <Navigate to="/login" replace />;

  const moduleMenus = visible(
    TEAM_MODULE_MENUS[activeTeam?.moduleKey ?? 'generic'] ?? TEAM_MODULE_MENUS.generic,
    has,
  );
  const sharedMenus = visible(
    SHARED_MENUS.filter((item) => item.to !== '/app/chat'),
    has,
  );
  const adminMenus = visible(ADMIN_MENUS, has);

  function onTeamChange(teamId: string) {
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

        <div className="cms-block">
          <div className="cms-section-label">Your teams</div>
          <div className="cms-team-list" role="listbox" aria-label="Select team">
            {myTeams.length === 0 ? (
              <div className="cms-empty">No team memberships</div>
            ) : null}
            {myTeams.map((team: Team) => {
              const active = activeTeam?.id === team.id;
              return (
                <button
                  key={team.id}
                  type="button"
                  role="option"
                  aria-selected={active}
                  className={`cms-team-item ${active ? 'active' : ''}`}
                  onClick={() => onTeamChange(team.id)}
                >
                  <span className="cms-team-mark" aria-hidden="true">{teamMark(team.moduleKey)}</span>
                  <span className="cms-team-copy">
                    <strong>{team.name}</strong>
                    <small>{team.moduleKey.replace('_', ' ')}</small>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <nav className="cms-side-nav">
          <div className="cms-section-label">{activeTeam?.name ?? 'Team'} menu</div>
          {moduleMenus.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className="cms-nav-link">
              {item.label}
            </NavLink>
          ))}

          <div className="cms-section-label">Organization</div>
          {sharedMenus.map((item) => (
            <NavLink key={item.to} to={item.to} className="cms-nav-link">
              <span>{item.label}</span>
              {item.to === '/app/notifications' && unreadCount > 0 ? (
                <span className="nav-count">{unreadCount}</span>
              ) : null}
            </NavLink>
          ))}
          <button type="button" className="cms-nav-link cms-nav-btn" onClick={() => openChat()}>
            <span>Chat</span>
            <span className="cms-pill">popup</span>
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
            <div className="cms-context">
              <span className="cms-team-mark inline">{teamMark(activeTeam?.moduleKey ?? 'generic')}</span>
              {activeTeam ? activeTeam.name : 'No active team'}
            </div>
            <div className="muted">Click a team in the sidebar to switch modules.</div>
          </div>
          <div className="row">
            <button type="button" className="secondary" onClick={() => openChat()}>
              Chat
            </button>
            <NavLink className="btn secondary" to="/app/notifications">
              Alerts{unreadCount > 0 ? ` (${unreadCount})` : ''}
            </NavLink>
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
