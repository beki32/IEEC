import { Permissions } from '@ieec/shared';
import { FormEvent, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Avatar } from '../components/Avatar';
import { matchesPersonSearch, TableSearch } from '../components/TableSearch';
import { demoStore } from '../lib/demoStore';
import { useSession } from '../lib/session';

export function QueuePage() {
  const { has, refresh } = useSession();
  const [, setTick] = useState(0);
  const state = demoStore.getState();

  const [assignJourneyId, setAssignJourneyId] = useState<string | null>(null);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState('');
  const [assignError, setAssignError] = useState('');
  const [query, setQuery] = useState('');

  if (!has(Permissions.newcomersViewUnassigned) && !has(Permissions.newcomersViewAll)) {
    return <Navigate to="/app" replace />;
  }

  // People who can receive Follow-Up assignments: ministers + leaders/assistants on FU roles
  const assignees = useMemo(() => {
    const assignableRoleIds = new Set(['role_fu_minister', 'role_fu_leader', 'role_fu_assistant']);
    return state.people
      .filter((p) =>
        p.recordStatus === 'active' &&
        state.roleAssignments.some(
          (ra) => ra.personId === p.id && ra.active && assignableRoleIds.has(ra.roleTemplateId),
        ),
      )
      .map((p) => {
        const role = state.roleTemplates.find((t) =>
          state.roleAssignments.some(
            (ra) => ra.personId === p.id && ra.active && ra.roleTemplateId === t.id && assignableRoleIds.has(t.id),
          ),
        );
        return { person: p, roleName: role?.name ?? 'Team member' };
      })
      .sort((a, b) => a.person.firstName.localeCompare(b.person.firstName));
  }, [state.people, state.roleAssignments, state.roleTemplates]);

  const rows = useMemo(
    () =>
      state.journeys
        .filter((j) =>
          j.isCurrentJourney ||
          ['awaiting_assignment', 'duplicate_review_required', 'assigned', 'active_follow_up', 'membership_approval_in_progress', 'inactive'].includes(j.journeyStatus),
        )
        .map((j) => {
          const person = state.people.find((p) => p.id === j.personId);
          const assignment = state.assignments.find((a) => a.journeyId === j.id && a.assignmentStatus === 'active');
          return { journey: j, person, assignment };
        })
        .filter((r) => r.person && r.person.currentMinistryStatus === 'newcomer'),
    [state.journeys, state.people, state.assignments],
  );

  const filteredRows = useMemo(
    () =>
      rows.filter(({ person, assignment, journey }) => {
        const assignee = assignment
          ? state.people.find((p) => p.id === assignment.assignedPersonId)
          : null;
        return matchesPersonSearch(query, [
          person?.firstName,
          person?.lastName,
          person ? `${person.firstName} ${person.lastName}` : null,
          person?.email.address,
          assignee?.firstName,
          assignee?.lastName,
          journey.journeyStatus,
        ]);
      }),
    [rows, query, state.people],
  );

  const assignJourney = assignJourneyId
    ? state.journeys.find((j) => j.id === assignJourneyId)
    : null;
  const assignPerson = assignJourney
    ? state.people.find((p) => p.id === assignJourney.personId)
    : null;
  const existingPrimary = assignJourneyId
    ? state.assignments.find(
      (a) => a.journeyId === assignJourneyId && a.assignmentStatus === 'active' && a.assignmentType === 'primary',
    )
    : null;

  function openAssign(journeyId: string) {
    const current = state.assignments.find(
      (a) => a.journeyId === journeyId && a.assignmentStatus === 'active' && a.assignmentType === 'primary',
    );
    setAssignJourneyId(journeyId);
    setSelectedAssigneeId(current?.assignedPersonId ?? '');
    setAssignError('');
  }

  function confirmAssign(e: FormEvent) {
    e.preventDefault();
    if (!assignJourneyId) return;
    if (!selectedAssigneeId) {
      setAssignError('Select a team member to assign.');
      return;
    }
    if (existingPrimary && existingPrimary.assignedPersonId !== selectedAssigneeId) {
      const ok = window.confirm(
        'This journey already has an active primary assignee. Reassign and keep history?',
      );
      if (!ok) return;
    }
    try {
      demoStore.assignNewcomer(assignJourneyId, selectedAssigneeId, 'primary');
      setAssignJourneyId(null);
      setSelectedAssigneeId('');
      setAssignError('');
      refresh();
      setTick((t) => t + 1);
    } catch (err) {
      setAssignError(err instanceof Error ? err.message : 'Assignment failed');
    }
  }

  function resolveDup(journeyId: string) {
    demoStore.resolveDuplicate(journeyId, 'create_new');
    refresh();
    setTick((t) => t + 1);
  }

  function bump() {
    refresh();
    setTick((t) => t + 1);
  }

  return (
    <div className="grid">
      <section className="hero">
        <h1>Follow-Up queue</h1>
        <p className="muted">Assign newcomers by choosing a team member from the list.</p>
      </section>
      <div className="panel">
        {assignees.length === 0 ? (
          <p className="error">No assignable Follow-Up team members found. Click Reset demo, then try again.</p>
        ) : (
          <p className="muted" style={{ marginBottom: '0.75rem' }}>
            {assignees.length} assignable team member(s) available.
          </p>
        )}
        <TableSearch
          value={query}
          onChange={setQuery}
          placeholder="Search people, email, assignee, status…"
          resultCount={filteredRows.length}
          totalCount={rows.length}
        />
        {rows.length > 0 && filteredRows.length === 0 ? (
          <p className="muted">No people match “{query.trim()}”.</p>
        ) : null}
        {filteredRows.length > 0 ? (
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
              {filteredRows.map(({ journey, person, assignment }) => {
                const assignee = assignment
                  ? state.people.find((p) => p.id === assignment.assignedPersonId)
                  : null;
                const canAssign =
                  has(Permissions.assignmentsCreate) &&
                  ['awaiting_assignment', 'assigned', 'active_follow_up', 'inactive'].includes(journey.journeyStatus);
                return (
                  <tr key={journey.id}>
                    <td>
                      <div className="person-cell">
                        <Avatar
                          name={`${person!.firstName} ${person!.lastName}`}
                          photoUrl={person!.photoUrl}
                          size="sm"
                        />
                        <div>
                          <strong>{person!.firstName} {person!.lastName}</strong>
                          <div className="muted">{person!.email.address}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${journey.journeyStatus.includes('duplicate') ? 'warn' : ''}`}>
                        {journey.journeyStatus}
                      </span>
                    </td>
                    <td>
                      {assignee ? (
                        <div className="person-cell">
                          <Avatar
                            name={`${assignee.firstName} ${assignee.lastName}`}
                            photoUrl={assignee.photoUrl}
                            size="sm"
                          />
                          <span>{assignee.firstName} {assignee.lastName}</span>
                        </div>
                      ) : (
                        'Unassigned'
                      )}
                    </td>
                    <td className="row">
                      <Link to={`/app/people/${person!.id}`}>Open</Link>
                      {journey.journeyStatus === 'duplicate_review_required' && has(Permissions.duplicateReview) ? (
                        <button type="button" className="secondary" onClick={() => resolveDup(journey.id)}>Mark not duplicate</button>
                      ) : null}
                      {canAssign ? (
                        <button type="button" onClick={() => openAssign(journey.id)}>
                          {assignment ? 'Reassign…' : 'Assign…'}
                        </button>
                      ) : null}
                      {journey.journeyStatus === 'membership_approval_in_progress' && has(Permissions.membershipReviewStart) ? (
                        <button type="button" onClick={() => { demoStore.approveMembership(journey.id); bump(); }}>
                          Approve member
                        </button>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : null}
      </div>

      {assignJourneyId && assignPerson ? (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="assign-title"
          onClick={() => setAssignJourneyId(null)}
        >
          <form
            className="modal-panel assign-modal grid"
            onClick={(e) => e.stopPropagation()}
            onSubmit={confirmAssign}
          >
            <h2 id="assign-title">
              {existingPrimary ? 'Reassign' : 'Assign'} {assignPerson.firstName} {assignPerson.lastName}
            </h2>
            <p className="muted">
              Pick a Follow-Up team member. Prior assignment history is kept on reassign.
            </p>

            <fieldset className="assignee-picker">
              <legend>
                Assign to <span className="error">*</span>
              </legend>
              {assignees.length === 0 ? (
                <p className="error">No assignable team members.</p>
              ) : (
                <div className="assignee-list" role="listbox" aria-label="Assignable team members">
                  {assignees.map(({ person, roleName }) => {
                    const selected = selectedAssigneeId === person.id;
                    const isCurrent = existingPrimary?.assignedPersonId === person.id;
                    const name = `${person.firstName} ${person.lastName}`;
                    return (
                      <button
                        key={person.id}
                        type="button"
                        role="option"
                        aria-selected={selected}
                        className={`assignee-option ${selected ? 'selected' : ''}`}
                        onClick={() => {
                          setSelectedAssigneeId(person.id);
                          setAssignError('');
                        }}
                      >
                        <Avatar name={name} photoUrl={person.photoUrl} size="md" />
                        <span className="assignee-meta">
                          <strong>{name}</strong>
                          <span className="muted">{roleName}</span>
                          {isCurrent ? <span className="badge ok">Current</span> : null}
                        </span>
                        <span className={`assignee-check ${selected ? 'on' : ''}`} aria-hidden="true">
                          {selected ? '✓' : ''}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </fieldset>

            {assignError ? <p className="error">{assignError}</p> : null}
            <div className="row">
              <button type="submit" disabled={!selectedAssigneeId || assignees.length === 0}>
                Confirm assignment
              </button>
              <button type="button" className="secondary" onClick={() => setAssignJourneyId(null)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
