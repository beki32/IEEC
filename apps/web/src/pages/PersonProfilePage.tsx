import { Permissions, type AttendanceStatus } from '@ieec/shared';
import { FormEvent, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { demoStore } from '../lib/demoStore';
import { useSession } from '../lib/session';

export function PersonProfilePage() {
  const { personId } = useParams();
  const { has, person: me, refresh } = useSession();
  const [, setTick] = useState(0);
  const state = demoStore.getState();
  const person = state.people.find((p) => p.id === personId);
  const journey = state.journeys.find((j) => j.personId === personId && (j.isCurrentJourney || !j.completedAt));
  const assignment = state.assignments.find(
    (a) => a.newcomerPersonId === personId && a.assignmentStatus === 'active' && a.assignedPersonId === me?.id,
  ) ?? state.assignments.find((a) => a.newcomerPersonId === personId && a.assignmentStatus === 'active');

  const reports = state.reports.filter((r) => r.newcomerPersonId === personId);
  const attendance = state.attendance.filter((a) => a.personId === personId);
  const bios = state.bioEntries.filter((b) => b.personId === personId && b.recordStatus === 'active');
  const event = state.calendarEvents[0];

  const [summary, setSummary] = useState('');
  const [bio, setBio] = useState('');
  const [attStatus, setAttStatus] = useState<AttendanceStatus>('attended');
  const [message, setMessage] = useState('');
  const [journeyAction, setJourneyAction] = useState<'inactive' | 'closed' | null>(null);
  const [journeyReason, setJourneyReason] = useState('');
  const [journeyError, setJourneyError] = useState('');

  if (!person) {
    return <div className="main"><p>Person not found. <Link to="/app">Back</Link></p></div>;
  }

  const canOperateAssigned =
    assignment?.assignedPersonId === me?.id ||
    has(Permissions.newcomersViewAll);

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
    if (!journey || !event) return;
    demoStore.recordAttendance({
      personId: person!.id,
      journeyId: journey.id,
      assignmentId: assignment?.id ?? null,
      calendarEventId: event.id,
      status: attStatus,
    });
    setMessage(`Attendance saved for Saturday program: ${attStatus}`);
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

  function startJourneyAction(action: 'inactive' | 'closed') {
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
      demoStore.updateJourneyStatus(journey.id, journeyAction, reason);
      setMessage(
        journeyAction === 'inactive'
          ? `Journey marked inactive. Reason: ${reason}`
          : `Journey closed. Reason: ${reason}`,
      );
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
          <div className="row">
            {has(Permissions.membershipRecommendationsSubmit) && journey ? (
              <button type="button" className="secondary" onClick={() => { demoStore.submitMembershipRecommendation(journey.id, 'Ready for membership'); bump(); }}>
                Recommend membership
              </button>
            ) : null}
            {has(Permissions.journeyMarkInactive) && journey && journey.journeyStatus !== 'inactive' && journey.journeyStatus !== 'closed' ? (
              <button type="button" className="secondary" onClick={() => startJourneyAction('inactive')}>
                Mark inactive
              </button>
            ) : null}
            {has(Permissions.journeyClose) && journey && journey.journeyStatus !== 'closed' ? (
              <button type="button" className="danger" onClick={() => startJourneyAction('closed')}>
                Close journey
              </button>
            ) : null}
          </div>

          {journeyAction && journey ? (
            <form className="grid" style={{ marginTop: '1rem' }} onSubmit={confirmJourneyAction}>
              <p className="muted">
                {journeyAction === 'inactive'
                  ? 'Marking inactive requires a reason (audited).'
                  : 'Closing a journey requires a reason (audited). Person record is kept.'}
              </p>
              <label>
                Reason <span className="error">*</span>
                <textarea
                  required
                  value={journeyReason}
                  onChange={(e) => {
                    setJourneyReason(e.target.value);
                    setJourneyError('');
                  }}
                  placeholder={
                    journeyAction === 'inactive'
                      ? 'e.g. Travel, family situation, temporary pause…'
                      : 'e.g. Moved away, declined follow-up, transferred…'
                  }
                />
              </label>
              {journeyError ? <p className="error">{journeyError}</p> : null}
              <div className="row">
                <button type="submit">
                  {journeyAction === 'inactive' ? 'Confirm inactive' : 'Confirm close'}
                </button>
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
          ) : null}

          {journey?.closureReason ? (
            <p className="muted" style={{ marginTop: '0.75rem' }}>
              Closure reason: {journey.closureReason}
            </p>
          ) : null}
        </div>
      </div>

      {canOperateAssigned && journey && assignment ? (
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
            <p className="muted">{event?.title} · unique person + calendar event</p>
            <label>
              Status
              <select value={attStatus} onChange={(e) => setAttStatus(e.target.value as AttendanceStatus)}>
                <option value="attended">attended</option>
                <option value="did_not_attend">did_not_attend</option>
                <option value="unknown">unknown</option>
              </select>
            </label>
            <button type="submit">Save attendance</button>
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
