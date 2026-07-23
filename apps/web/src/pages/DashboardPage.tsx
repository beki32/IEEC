import { Permissions } from '@ieec/shared';
import { Link } from 'react-router-dom';
import { demoStore } from '../lib/demoStore';
import { useSession } from '../lib/session';

export function DashboardPage() {
  const { person, permissions, has } = useSession();
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

  return (
    <div className="grid">
      <section className="hero">
        <h1>Welcome, {person?.firstName}</h1>
        <p className="muted">
          Permissions loaded: {permissions.size}. Role-driven UI — Security Rules must mirror these checks in production.
        </p>
      </section>

      <div className="grid two">
        {has(Permissions.newcomersViewUnassigned) || has(Permissions.newcomersViewAll) ? (
          <div className="panel">
            <h2>Unassigned / review queue</h2>
            <p className="muted">{unassigned.length} journeys need attention</p>
            <Link className="btn" to="/app/queue">Open queue</Link>
          </div>
        ) : null}

        <div className="panel">
          <h2>My assigned newcomers</h2>
          <p className="muted">{myAssignments.length} active assignment(s)</p>
          <Link className="btn" to="/app/assigned">View assigned</Link>
        </div>

        {has(Permissions.newcomersViewAll) ? (
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
