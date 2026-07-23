import { Permissions } from '@ieec/shared';
import { useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { demoStore } from '../lib/demoStore';
import { useSession } from '../lib/session';

export function QueuePage() {
  const { has, refresh } = useSession();
  const [, setTick] = useState(0);
  const state = demoStore.getState();

  if (!has(Permissions.newcomersViewUnassigned) && !has(Permissions.newcomersViewAll)) {
    return <Navigate to="/app" replace />;
  }

  const ministers = useMemo(
    () => state.people.filter((p) => state.roleAssignments.some((ra) => ra.personId === p.id && ra.roleTemplateId === 'role_fu_minister')),
    [state.people, state.roleAssignments],
  );

  const rows = state.journeys
    .filter((j) => j.isCurrentJourney || ['awaiting_assignment', 'duplicate_review_required', 'assigned', 'active_follow_up', 'membership_approval_in_progress'].includes(j.journeyStatus))
    .map((j) => {
      const person = state.people.find((p) => p.id === j.personId);
      const assignment = state.assignments.find((a) => a.journeyId === j.id && a.assignmentStatus === 'active');
      return { journey: j, person, assignment };
    })
    .filter((r) => r.person);

  function assign(journeyId: string) {
    const ministerId = ministers[0]?.id;
    if (!ministerId) {
      alert('No Follow-Up minister seeded');
      return;
    }
    const existing = demoStore.getState().assignments.some(
      (a) => a.journeyId === journeyId && a.assignmentStatus === 'active' && a.assignmentType === 'primary',
    );
    if (existing && !confirm('This journey already has an active primary assignment. Reassign and keep history?')) {
      return;
    }
    demoStore.assignNewcomer(journeyId, ministerId, 'primary');
    refresh();
    setTick((t) => t + 1);
  }

  function resolveDup(journeyId: string) {
    demoStore.resolveDuplicate(journeyId, 'create_new');
    refresh();
    setTick((t) => t + 1);
  }

  return (
    <div className="grid">
      <section className="hero">
        <h1>Follow-Up queue</h1>
        <p className="muted">Assign newcomers, resolve duplicates, and open profiles.</p>
      </section>
      <div className="panel">
        <table className="table">
          <thead>
            <tr>
              <th>Person</th>
              <th>Status</th>
              <th>Assignee</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ journey, person, assignment }) => (
              <tr key={journey.id}>
                <td>
                  <strong>{person!.firstName} {person!.lastName}</strong>
                  <div className="muted">{person!.email.address}</div>
                </td>
                <td>
                  <span className={`badge ${journey.journeyStatus.includes('duplicate') ? 'warn' : ''}`}>
                    {journey.journeyStatus}
                  </span>
                </td>
                <td>
                  {assignment
                    ? state.people.find((p) => p.id === assignment.assignedPersonId)?.firstName ?? '—'
                    : 'Unassigned'}
                </td>
                <td className="row">
                  <Link to={`/app/people/${person!.id}`}>Open</Link>
                  {journey.journeyStatus === 'duplicate_review_required' && has(Permissions.duplicateReview) ? (
                    <button type="button" className="secondary" onClick={() => resolveDup(journey.id)}>Mark not duplicate</button>
                  ) : null}
                  {(journey.journeyStatus === 'awaiting_assignment' || journey.journeyStatus === 'assigned') &&
                  has(Permissions.assignmentsCreate) ? (
                    <button type="button" onClick={() => assign(journey.id)}>
                      {assignment ? 'Reassign' : 'Assign'} to minister
                    </button>
                  ) : null}
                  {journey.journeyStatus === 'membership_approval_in_progress' && has(Permissions.membershipReviewStart) ? (
                    <button type="button" onClick={() => { demoStore.approveMembership(journey.id); refresh(); setTick((t) => t + 1); }}>
                      Approve member
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
