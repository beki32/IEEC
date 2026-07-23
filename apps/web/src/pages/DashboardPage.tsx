import { Permissions } from '@ieec/shared';
import { Link } from 'react-router-dom';
import { demoStore } from '../lib/demoStore';
import { useSession } from '../lib/session';

export function DashboardPage() {
  const { person, permissions, has, activeTeam, myTeams, unreadCount } = useSession();
  const state = demoStore.getState();

  const unassigned = state.journeys.filter((j) =>
    ['awaiting_assignment', 'duplicate_review_required'].includes(j.journeyStatus),
  );
  const myAssignments = state.assignments.filter(
    (a) => a.assignedPersonId === person?.id && a.assignmentStatus === 'active',
  );
  const activeJourneys = state.journeys.filter((j) =>
    ['assigned', 'active_follow_up', 'membership_approval_in_progress'].includes(j.journeyStatus),
  );
  const isFollowUp = activeTeam?.moduleKey === 'follow_up';

  return (
    <div className="grid">
      <section className="hero">
        <p className="badge">{activeTeam ? `${activeTeam.name} workspace` : 'Workspace'}</p>
        <h1>Welcome, {person?.firstName}</h1>
        <p className="muted">
          You are on {myTeams.length} team(s). Switch teams in the sidebar to change module menus.
          Permissions loaded: {permissions.size}.
        </p>
      </section>

      <div className="grid two">
        {isFollowUp && (has(Permissions.newcomersViewUnassigned) || has(Permissions.newcomersViewAll)) ? (
          <div className="panel">
            <h2>Unassigned / review queue</h2>
            <p className="muted">{unassigned.length} journeys need attention</p>
            <Link className="btn" to="/app/queue">Open queue</Link>
          </div>
        ) : null}

        {isFollowUp ? (
          <div className="panel">
            <h2>My assigned newcomers</h2>
            <p className="muted">{myAssignments.length} active assignment(s)</p>
            <Link className="btn" to="/app/assigned">View assigned</Link>
          </div>
        ) : (
          <div className="panel">
            <h2>{activeTeam?.name ?? 'Team'} home</h2>
            <p className="muted">
              Team modules change with the sidebar switcher. Calendar, Chat, and Notifications stay shared.
            </p>
            {activeTeam?.moduleKey === 'bible_study' ? (
              <Link className="btn" to="/app/modules/bible-study">Open Bible Study</Link>
            ) : null}
            {activeTeam?.moduleKey === 'media' ? (
              <Link className="btn" to="/app/modules/media">Open Media desk</Link>
            ) : null}
          </div>
        )}

        <div className="panel">
          <h2>Notifications</h2>
          <p className="muted">{unreadCount} unread</p>
          <Link className="btn secondary" to="/app/notifications">Open inbox</Link>
        </div>

        <div className="panel">
          <h2>Ministry calendar</h2>
          <p className="muted">{state.calendarEvents.filter((e) => e.eventStatus !== 'cancelled').length} scheduled event(s)</p>
          <Link className="btn secondary" to="/app/calendar">Open calendar</Link>
        </div>

        <div className="panel">
          <h2>Chat</h2>
          <p className="muted">
            {demoStore.listMyChatChannels().length} channel(s) · membership ≠ team role
          </p>
          <Link className="btn secondary" to="/app/chat">Open chat</Link>
        </div>

        {isFollowUp && has(Permissions.newcomersViewAll) ? (
          <div className="panel">
            <h2>Active follow-up</h2>
            <p className="muted">{activeJourneys.length} journeys in progress</p>
            <Link className="btn secondary" to="/app/queue">Leader view</Link>
          </div>
        ) : null}

        {has(Permissions.rolesManage) ? (
          <div className="panel">
            <h2>Roles & permissions</h2>
            <p className="muted">Live templates, assignments, overrides</p>
            <Link className="btn secondary" to="/app/admin/roles">Manage RBAC</Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
