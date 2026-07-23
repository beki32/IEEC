import { Permissions, type AttendanceStatus } from '@ieec/shared';
import { FormEvent, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { demoStore } from '../lib/demoStore';
import { useSession } from '../lib/session';

type JourneyAction = 'inactive' | 'closed' | 'active_follow_up' | 'reopen';

const ACTION_COPY: Record<
  JourneyAction,
  { title: string; confirm: string; placeholder: string; nextStatus: string }
> = {
  inactive: {
    title: 'Mark journey inactive',
    confirm: 'Confirm inactive',
    placeholder: 'e.g. Travel, family situation, temporary pause…',
    nextStatus: 'inactive',
  },
  closed: {
    title: 'Close journey',
    confirm: 'Confirm close',
    placeholder: 'e.g. Moved away, declined follow-up, transferred…',
    nextStatus: 'closed',
  },
  active_follow_up: {
    title: 'Mark journey active again',
    confirm: 'Confirm active',
    placeholder: 'e.g. Returned from travel, ready to continue…',
    nextStatus: 'active_follow_up',
  },
  reopen: {
    title: 'Reopen closed journey',
    confirm: 'Confirm reopen',
    placeholder: 'e.g. Person asked to restart follow-up…',
    nextStatus: 'awaiting_assignment',
  },
};

export function PersonProfilePage() {
  const { personId } = useParams();
  const { has, person: me, refresh } = useSession();
  const [, setTick] = useState(0);
  const state = demoStore.getState();
  const person = state.people.find((p) => p.id === personId);

  // Latest journey for this person, including closed (needed for reopen)
  const journey = [...state.journeys]
    .filter((j) => j.personId === personId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];

  const assignment = state.assignments.find(
    (a) => a.newcomerPersonId === personId && a.assignmentStatus === 'active' && a.assignedPersonId === me?.id,
  ) ?? state.assignments.find((a) => a.newcomerPersonId === personId && a.assignmentStatus === 'active');

  const reports = state.reports.filter((r) => r.newcomerPersonId === personId);
  const attendance = state.attendance.filter((a) => a.personId === personId);
  const bios = state.bioEntries.filter((b) => b.personId === personId && b.recordStatus === 'active');
  const calendarEvents = demoStore
    .listCalendarEvents(false)
    .filter((e) => e.eventStatus === 'scheduled' || e.eventStatus === 'confirmed');
  const defaultEventId =
    calendarEvents.find((e) => e.eventPriority === 'organization_reserved')?.id ??
    calendarEvents[0]?.id ??
    '';

  const [summary, setSummary] = useState('');
  const [bio, setBio] = useState('');
  const [attStatus, setAttStatus] = useState<AttendanceStatus>('attended');
  const [selectedEventId, setSelectedEventId] = useState(defaultEventId);
  const [message, setMessage] = useState('');
  const [journeyAction, setJourneyAction] = useState<JourneyAction | null>(null);
  const [journeyReason, setJourneyReason] = useState('');
  const [journeyError, setJourneyError] = useState('');

  const selectedEvent =
    calendarEvents.find((e) => e.id === selectedEventId) ??
    calendarEvents.find((e) => e.id === defaultEventId) ??
    null;

  useEffect(() => {
    // Force users off stale localStorage seeds that predate reason/reopen UI
    demoStore.ensureLatestSeed();
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!selectedEventId || !calendarEvents.some((e) => e.id === selectedEventId)) {
      setSelectedEventId(defaultEventId);
    }
  }, [calendarEvents, defaultEventId, selectedEventId]);

  if (!person) {
    return <div className="main"><p>Person not found. <Link to="/app">Back</Link></p></div>;
  }

  const canOperateAssigned =
    assignment?.assignedPersonId === me?.id ||
    has(Permissions.newcomersViewAll);

  const status = journey?.journeyStatus ?? '';
  const canMarkInactive =
    has(Permissions.journeyMarkInactive) &&
    !!journey &&
    !['inactive', 'closed', 'transitioned_to_member'].includes(status);
  const canClose =
    has(Permissions.journeyClose) &&
    !!journey &&
    !['closed', 'transitioned_to_member'].includes(status);
  const canMarkActive =
    has(Permissions.journeyMarkInactive) &&
    !!journey &&
    status === 'inactive';
  const canReopen =
    has(Permissions.journeyReopen) &&
    !!journey &&
    status === 'closed';

  function bump() {
    refresh();
    setTick((t) => t + 1);
  }

  function onReport(e: FormEvent) {
    e.preventDefault();
    if (!journey || !assignment) return;
    if (!has(Permissions.reportsSubmit) && assignment.assignedPersonId !== me?.id) {
      setMessage('Missing report permission');
      return;
    }
    demoStore.submitReport({
      journeyId: journey.id,
      assignmentId: assignment.id,
      contactMade: true,
      expectedToAttend: 'yes',
      summary,
    });
    setSummary('');
    setMessage('Weekly report submitted (separate from attendance).');
    bump();
  }

  function onAttendance(e: FormEvent) {
    e.preventDefault();
    if (!journey || !selectedEvent) {
      setMessage('Select a calendar event before recording attendance.');
      return;
    }
    demoStore.recordAttendance({
      personId: person!.id,
      journeyId: journey.id,
      assignmentId: assignment?.id ?? null,
      calendarEventId: selectedEvent.id,
      status: attStatus,
    });
    setMessage(`Attendance saved for ${selectedEvent.title}: ${attStatus}`);
    bump();
  }

  function onBio(e: FormEvent) {
    e.preventDefault();
    if (!journey) return;
    demoStore.addBio({ personId: person!.id, journeyId: journey.id, content: bio });
    setBio('');
    setMessage('Bio entry added.');
    bump();
  }

  function startJourneyAction(action: JourneyAction) {
    setJourneyAction(action);
    setJourneyReason('');
    setJourneyError('');
    setMessage('');
  }

  function confirmJourneyAction(e: FormEvent) {
    e.preventDefault();
    if (!journey || !journeyAction) return;
    const reason = journeyReason.trim();
    if (!reason) {
      setJourneyError('Reason is required.');
      return;
    }
    try {
      const copy = ACTION_COPY[journeyAction];
      demoStore.updateJourneyStatus(journey.id, copy.nextStatus, reason, journeyAction);
      setMessage(`${copy.title} saved. Reason: ${reason}`);
      setJourneyAction(null);
      setJourneyReason('');
      setJourneyError('');
      bump();
    } catch (err) {
      setJourneyError(err instanceof Error ? err.message : 'Could not update journey');
    }
  }

  return (
    <div className="grid">
      <section className="hero">
        <Link to="/app/assigned" className="muted">← Back</Link>
        <p className="badge">Journey controls v3 · reason required</p>
        <h1>{person.firstName} {person.lastName}</h1>
        <p className="muted">
          Ministry status: <strong>{person.currentMinistryStatus}</strong>
          {journey ? <> · Journey: <span className="badge">{journey.journeyStatus}</span></> : null}
        </p>
        {message ? <p className="success">{message}</p> : null}
      </section>

      <div className="grid two">
        <div className="panel">
          <h2>Contact</h2>
          <p>{person.email.address}</p>
          <p>{person.phone.display}</p>
          <p className="muted">Prefers {person.contactPreference.method}</p>
        </div>
        <div className="panel">
          <h2>Journey actions</h2>
          <p className="muted">
            Inactive, close, activate again, and reopen all require a reason (modal + audit).
          </p>
          <div className="row">
            {has(Permissions.membershipRecommendationsSubmit) && journey && !['closed', 'transitioned_to_member'].includes(status) ? (
              <button type="button" className="secondary" onClick={() => { demoStore.submitMembershipRecommendation(journey.id, 'Ready for membership'); bump(); }}>
                Recommend membership
              </button>
            ) : null}

            {canMarkInactive ? (
              <button type="button" className="secondary" onClick={() => startJourneyAction('inactive')}>
                Mark inactive
              </button>
            ) : null}

            {canMarkActive ? (
              <button type="button" onClick={() => startJourneyAction('active_follow_up')}>
                Mark active again
              </button>
            ) : null}

            {canClose ? (
              <button type="button" className="danger" onClick={() => startJourneyAction('closed')}>
                Close journey
              </button>
            ) : null}

            {canReopen ? (
              <button type="button" onClick={() => startJourneyAction('reopen')}>
                Reopen journey
              </button>
            ) : null}
          </div>

          {!canMarkInactive && !canClose && !canMarkActive && !canReopen ? (
            <p className="muted" style={{ marginTop: '0.75rem' }}>
              No journey status actions available for this state/permission.
              Try leader login and click <strong>Reset demo</strong> in the top bar if buttons are missing.
            </p>
          ) : null}

          {journey?.lastStatusReason ? (
            <p className="muted" style={{ marginTop: '0.75rem' }}>
              Last status reason: <strong>{journey.lastStatusReason}</strong>
            </p>
          ) : null}
        </div>
      </div>

      {journeyAction ? (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="journey-reason-title"
          onClick={() => {
            setJourneyAction(null);
            setJourneyReason('');
            setJourneyError('');
          }}
        >
          <form
            className="modal-panel grid"
            onClick={(e) => e.stopPropagation()}
            onSubmit={confirmJourneyAction}
          >
            <h2 id="journey-reason-title">{ACTION_COPY[journeyAction].title}</h2>
            <p className="muted">A reason is required and will be audited. You cannot continue without one.</p>
            <label>
              Reason <span className="error">*</span>
              <textarea
                required
                autoFocus
                minLength={3}
                value={journeyReason}
                onChange={(e) => {
                  setJourneyReason(e.target.value);
                  setJourneyError('');
                }}
                placeholder={ACTION_COPY[journeyAction].placeholder}
              />
            </label>
            {journeyError ? <p className="error">{journeyError}</p> : null}
            <div className="row">
              <button type="submit">{ACTION_COPY[journeyAction].confirm}</button>
              <button
                type="button"
                className="secondary"
                onClick={() => {
                  setJourneyAction(null);
                  setJourneyReason('');
                  setJourneyError('');
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {canOperateAssigned && journey && assignment && !['closed', 'inactive'].includes(status) ? (
        <div className="grid two">
          <form className="panel grid" onSubmit={onReport}>
            <h2>Weekly report</h2>
            <p className="muted">Not for attendance. Friday due / Sat+ late.</p>
            <label>
              Summary
              <textarea required value={summary} onChange={(e) => setSummary(e.target.value)} />
            </label>
            <button type="submit">Submit report</button>
          </form>

          <form className="panel grid" onSubmit={onAttendance}>
            <h2>Saturday attendance</h2>
            <p className="muted">Pick the program event · unique person + calendar event</p>
            <label>
              Calendar event
              <select
                required
                value={selectedEvent?.id ?? ''}
                onChange={(e) => setSelectedEventId(e.target.value)}
              >
                {calendarEvents.length === 0 ? (
                  <option value="">No scheduled events</option>
                ) : null}
                {calendarEvents.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title} · {new Date(ev.startAt).toLocaleString()}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Status
              <select value={attStatus} onChange={(e) => setAttStatus(e.target.value as AttendanceStatus)}>
                <option value="attended">attended</option>
                <option value="did_not_attend">did_not_attend</option>
                <option value="unknown">unknown</option>
              </select>
            </label>
            <button type="submit" disabled={!selectedEvent}>Save attendance</button>
          </form>
        </div>
      ) : null}

      <form className="panel grid" onSubmit={onBio}>
        <h2>Add bio note</h2>
        <textarea required value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Pastoral / practical notes (non-sensitive)" />
        <button type="submit">Add bio</button>
      </form>

      <div className="grid two">
        <div className="panel">
          <h2>Reports</h2>
          {reports.length === 0 ? <p className="muted">None yet</p> : null}
          {reports.map((r) => (
            <div key={r.id} style={{ marginBottom: '0.75rem' }}>
              <span className="badge">{r.reportStatus}</span>
              <div>{String(r.dynamicResponses.summary ?? '')}</div>
              <div className="muted">{r.submittedAt}</div>
            </div>
          ))}
        </div>
        <div className="panel">
          <h2>Attendance</h2>
          {attendance.length === 0 ? <p className="muted">None yet</p> : null}
          {attendance.map((a) => (
            <div key={a.id} style={{ marginBottom: '0.5rem' }}>
              <span className="badge ok">{a.attendanceStatus}</span>
              <span className="muted"> · {new Date(a.programDate).toLocaleDateString()}</span>
            </div>
          ))}
          <h2 style={{ marginTop: '1rem' }}>Bio</h2>
          {bios.length === 0 ? <p className="muted">None yet</p> : null}
          {bios.map((b) => (
            <p key={b.id}>{b.content}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
