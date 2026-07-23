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

function teamIcon(moduleKey: string) {
  switch (moduleKey) {
    case 'follow_up':
      return 'bi-people';
    case 'bible_study':
      return 'bi-book';
    case 'media':
      return 'bi-camera-video';
    case 'worship':
      return 'bi-music-note-beamed';
    default:
      return 'bi-grid';
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
    <div className="cms-shell d-flex min-vh-100">
      <aside className="cms-sidebar d-flex flex-column flex-shrink-0">
        <div className="px-3 pt-3 pb-2">
          <div className="cms-brand-title">IEEC YA Connect</div>
          <div className="small text-white-50">{organization?.name}</div>
        </div>

        <div className="px-3 py-2">
          <div className="cms-section-label">Your teams</div>
          <div className="list-group list-group-flush cms-team-list" role="listbox" aria-label="Select team">
            {myTeams.length === 0 ? (
              <div className="small text-white-50 px-2 py-2">No team memberships</div>
            ) : null}
            {myTeams.map((team: Team) => {
              const active = activeTeam?.id === team.id;
              return (
                <button
                  key={team.id}
                  type="button"
                  role="option"
                  aria-selected={active}
                  className={`list-group-item list-group-item-action cms-team-item ${active ? 'active' : ''}`}
                  onClick={() => onTeamChange(team.id)}
                >
                  <span className={`bi ${teamIcon(team.moduleKey)} me-2`} aria-hidden="true" />
                  <span className="cms-team-copy">
                    <strong>{team.name}</strong>
                    <small>{team.moduleKey.replace('_', ' ')}</small>
                  </span>
                  {active ? <span className="bi bi-check2 ms-auto" aria-hidden="true" /> : null}
                </button>
              );
            })}
          </div>
        </div>

        <nav className="cms-side-nav flex-grow-1 px-3 pb-2">
          <div className="cms-section-label mt-2">{activeTeam?.name ?? 'Team'} menu</div>
          <div className="nav nav-pills flex-column gap-1">
            {moduleMenus.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className="nav-link">
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="cms-section-label mt-3">Organization</div>
          <div className="nav nav-pills flex-column gap-1">
            {sharedMenus.map((item) => (
              <NavLink key={item.to} to={item.to} className="nav-link d-flex justify-content-between align-items-center">
                <span>{item.label}</span>
                {item.to === '/app/notifications' && unreadCount > 0 ? (
                  <span className="badge text-bg-warning rounded-pill">{unreadCount}</span>
                ) : null}
              </NavLink>
            ))}
            <button type="button" className="nav-link text-start d-flex justify-content-between align-items-center" onClick={() => openChat()}>
              <span>Chat</span>
              <span className="badge text-bg-light text-dark rounded-pill">popup</span>
            </button>
          </div>

          {adminMenus.length ? (
            <>
              <div className="cms-section-label mt-3">Admin</div>
              <div className="nav nav-pills flex-column gap-1">
                {adminMenus.map((item) => (
                  <NavLink key={item.to} to={item.to} className="nav-link">{item.label}</NavLink>
                ))}
              </div>
            </>
          ) : null}
        </nav>

        <div className="cms-sidebar-foot mt-auto px-3 py-3 border-top border-secondary-subtle">
          <div className="small text-white-50 mb-2">
            {person.firstName} {person.lastName}
          </div>
          <div className="d-flex flex-wrap gap-2">
            <NavLink className="btn btn-sm btn-outline-light" to="/register">Register</NavLink>
            <button
              type="button"
              className="btn btn-sm btn-outline-light"
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
              className="btn btn-sm btn-light"
              onClick={() => {
                void logout();
              }}
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>

      <div className="cms-main d-flex flex-column flex-grow-1 min-w-0">
        <header className="cms-topbar border-bottom bg-white px-3 px-lg-4 py-3 d-flex flex-wrap justify-content-between align-items-center gap-2 sticky-top">
          <div>
            <div className="cms-context d-flex align-items-center gap-2">
              <span className={`bi ${teamIcon(activeTeam?.moduleKey ?? 'generic')}`} aria-hidden="true" />
              {activeTeam ? activeTeam.name : 'No active team'}
            </div>
            <div className="text-secondary small">
              Click a team in the sidebar to switch modules — no dropdown.
            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <button type="button" className="btn btn-outline-success btn-sm" onClick={() => openChat()}>
              <span className="bi bi-chat-dots me-1" aria-hidden="true" />
              Chat
            </button>
            <NavLink className="btn btn-outline-secondary btn-sm position-relative" to="/app/notifications">
              <span className="bi bi-bell me-1" aria-hidden="true" />
              Alerts
              {unreadCount > 0 ? (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill text-bg-danger">
                  {unreadCount}
                </span>
              ) : null}
            </NavLink>
            {has(Permissions.rolesManage) ? (
              <NavLink className="btn btn-outline-secondary btn-sm" to="/app/admin/roles">RBAC</NavLink>
            ) : null}
          </div>
        </header>

        <main className="cms-content flex-grow-1 p-3 p-lg-4">
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
