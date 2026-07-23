import { Permissions } from '@ieec/shared';
import { FormEvent, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { demoStore } from '../lib/demoStore';
import { useSession } from '../lib/session';

function toLocalInputValue(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function defaultSaturdayWindow() {
  const start = new Date();
  start.setDate(start.getDate() + ((6 - start.getDay() + 7) % 7 || 7));
  start.setHours(18, 30, 0, 0);
  const end = new Date(start);
  end.setHours(21, 30, 0, 0);
  return { start: toLocalInputValue(start.toISOString()), end: toLocalInputValue(end.toISOString()) };
}

export function CalendarPage() {
  const { has, refresh } = useSession();
  const [tick, setTick] = useState(0);
  const canCreate = has(Permissions.calendarEventCreate) || has(Permissions.calendarEventManage);
  const canManage = has(Permissions.calendarEventManage);
  const canOverride = has(Permissions.calendarConflictOverride) || has(Permissions.rolesManage);

  const events = useMemo(() => {
    void tick;
    return demoStore.listCalendarEvents(true);
  }, [tick]);

  const defaults = defaultSaturdayWindow();
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [forceOverride, setForceOverride] = useState(false);
  const [form, setForm] = useState({
    title: 'IEEC YA Saturday Program',
    description: '',
    startAt: defaults.start,
    endAt: defaults.end,
    conflictPolicy: 'hard_block' as 'hard_block' | 'warning' | 'informational',
    eventPriority: 'organization_reserved',
    recurrenceWeeklySaturday: true,
  });

  function bump(msg?: string) {
    refresh();
    setTick((t) => t + 1);
    if (msg) setMessage(msg);
  }

  function onCreate(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const result = demoStore.createCalendarEvent({
        title: form.title,
        description: form.description,
        startAt: new Date(form.startAt).toISOString(),
        endAt: new Date(form.endAt).toISOString(),
        conflictPolicy: form.conflictPolicy,
        eventPriority: form.eventPriority,
        recurrenceWeeklySaturday: form.recurrenceWeeklySaturday,
        forceOverride,
      });
      setShowCreate(false);
      setForceOverride(false);
      const warn = result.warningConflicts.length
        ? ` (warning overlap: ${result.warningConflicts.map((c) => c.title).join(', ')})`
        : '';
      bump(`Event created${warn}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create event');
    }
  }

  function cancelEvent(eventId: string, title: string) {
    const reason = window.prompt(`Reason to cancel “${title}”?`) ?? '';
    if (!reason.trim()) return;
    try {
      demoStore.cancelCalendarEvent(eventId, reason);
      bump('Event cancelled');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cancel failed');
    }
  }

  return (
    <div className="grid">
      <section className="hero">
        <p className="badge">One organization calendar</p>
        <h1>Ministry calendar</h1>
        <p className="muted">
          Shared operational calendar (ADR-003). Saturday program is attendance-linked; hard-block conflicts protect reserved time.
        </p>
        {message ? <p className="success">{message}</p> : null}
        {error ? <p className="error">{error}</p> : null}
      </section>

      <div className="row">
        {canCreate ? (
          <button type="button" onClick={() => { setShowCreate(true); setError(''); }}>
            Create event
          </button>
        ) : null}
        <Link className="btn secondary" to="/app">Dashboard</Link>
      </div>

      <div className="panel">
        <h2>Upcoming & scheduled</h2>
        <table className="table">
          <thead>
            <tr>
              <th>When</th>
              <th>Event</th>
              <th>Priority / conflict</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <td>
                  <div>{new Date(event.startAt).toLocaleString()}</div>
                  <div className="muted">→ {new Date(event.endAt).toLocaleTimeString()}</div>
                </td>
                <td>
                  <strong>{event.title}</strong>
                  {event.description ? <div className="muted">{event.description}</div> : null}
                  {event.recurrence.enabled ? <div className="badge">Weekly Sat</div> : null}
                </td>
                <td>
                  <div>{event.eventPriority}</div>
                  <div className="muted">{event.conflictPolicy}</div>
                </td>
                <td>
                  <span className={`badge ${event.eventStatus === 'cancelled' ? 'warn' : 'ok'}`}>
                    {event.eventStatus}
                  </span>
                </td>
                <td className="row">
                  {canManage && event.eventStatus !== 'cancelled' ? (
                    <button type="button" className="secondary" onClick={() => cancelEvent(event.id, event.title)}>
                      Cancel
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreate ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={() => setShowCreate(false)}>
          <form className="modal-panel grid" onClick={(e) => e.stopPropagation()} onSubmit={onCreate}>
            <h2>Create calendar event</h2>
            <label>
              Title
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </label>
            <label>
              Description
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </label>
            <label>
              Start
              <input
                required
                type="datetime-local"
                value={form.startAt}
                onChange={(e) => setForm({ ...form, startAt: e.target.value })}
              />
            </label>
            <label>
              End
              <input
                required
                type="datetime-local"
                value={form.endAt}
                onChange={(e) => setForm({ ...form, endAt: e.target.value })}
              />
            </label>
            <label>
              Conflict policy
              <select
                value={form.conflictPolicy}
                onChange={(e) => setForm({ ...form, conflictPolicy: e.target.value as typeof form.conflictPolicy })}
              >
                <option value="hard_block">hard_block</option>
                <option value="warning">warning</option>
                <option value="informational">informational</option>
              </select>
            </label>
            <label>
              Priority
              <select
                value={form.eventPriority}
                onChange={(e) => setForm({ ...form, eventPriority: e.target.value })}
              >
                <option value="organization_reserved">organization_reserved (Saturday program)</option>
                <option value="normal">normal</option>
              </select>
            </label>
            <label className="row" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                checked={form.recurrenceWeeklySaturday}
                onChange={(e) => setForm({ ...form, recurrenceWeeklySaturday: e.target.checked })}
              />
              Weekly Saturday recurrence
            </label>
            {canOverride ? (
              <label className="row" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={forceOverride}
                  onChange={(e) => setForceOverride(e.target.checked)}
                />
                Force through hard conflict (override permission)
              </label>
            ) : null}
            {error ? <p className="error">{error}</p> : null}
            <div className="row">
              <button type="submit">Save event</button>
              <button type="button" className="secondary" onClick={() => setShowCreate(false)}>Cancel</button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
