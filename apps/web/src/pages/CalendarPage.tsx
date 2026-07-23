import { Permissions, type CalendarEvent } from '@ieec/shared';
import { FormEvent, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { demoStore } from '../lib/demoStore';
import { useSession } from '../lib/session';

const CONFLICT_POLICY_HELP = {
  hard_block: 'Hard block — overlapping events are rejected unless someone has override permission (protects Saturday program).',
  warning: 'Warning — overlap is allowed, but leaders see a warning.',
  informational: 'Info only — overlap is noted; no block.',
} as const;

function conflictPolicyLabel(policy: string) {
  switch (policy) {
    case 'hard_block':
      return 'Hard block';
    case 'warning':
      return 'Warning';
    case 'informational':
      return 'Info only';
    default:
      return policy;
  }
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const DAY_NAME_TO_INDEX: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

type Occurrence = {
  key: string;
  event: CalendarEvent;
  start: Date;
  end: Date;
};

function toLocalInputValue(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function monthLabel(cursor: Date) {
  return cursor.toLocaleString(undefined, { month: 'long', year: 'numeric' });
}

function defaultWindowForDate(day: Date) {
  const start = new Date(day);
  start.setHours(18, 30, 0, 0);
  const end = new Date(day);
  end.setHours(21, 30, 0, 0);
  return { start: toLocalInputValue(start.toISOString()), end: toLocalInputValue(end.toISOString()) };
}

function buildMonthCells(cursor: Date) {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const first = new Date(year, month, 1);
  const startPad = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<{ date: Date; inMonth: boolean }> = [];

  for (let i = 0; i < startPad; i += 1) {
    const d = new Date(year, month, -startPad + i + 1);
    cells.push({ date: d, inMonth: false });
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ date: new Date(year, month, day), inMonth: true });
  }
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1].date;
    const next = new Date(last);
    next.setDate(last.getDate() + 1);
    cells.push({ date: next, inMonth: false });
  }
  return cells;
}

/** Expand weekly recurrence into visible occurrences for the month grid. */
function expandOccurrences(events: CalendarEvent[], cursor: Date): Occurrence[] {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);
  const out: Occurrence[] = [];

  for (const event of events) {
    if (event.eventStatus === 'cancelled') continue;
    const eventStart = new Date(event.startAt);
    const eventEnd = new Date(event.endAt);
    const durationMs = eventEnd.getTime() - eventStart.getTime();

    const weekly = event.recurrence?.enabled && event.recurrence.frequency === 'weekly';
    if (!weekly) {
      if (eventStart >= monthStart && eventStart <= monthEnd) {
        out.push({
          key: `${event.id}-${eventStart.toISOString()}`,
          event,
          start: eventStart,
          end: eventEnd,
        });
      }
      continue;
    }

    const wanted = new Set(
      (event.recurrence.daysOfWeek?.length ? event.recurrence.daysOfWeek : ['saturday']).map(
        (d) => DAY_NAME_TO_INDEX[d.toLowerCase()] ?? 6,
      ),
    );
    const hours = eventStart.getHours();
    const minutes = eventStart.getMinutes();

    for (let day = 1; day <= monthEnd.getDate(); day += 1) {
      const occ = new Date(year, month, day, hours, minutes, 0, 0);
      if (!wanted.has(occ.getDay())) continue;
      // Only show from original start date forward
      if (startOfDay(occ) < startOfDay(eventStart)) continue;
      out.push({
        key: `${event.id}-${occ.toISOString()}`,
        event,
        start: occ,
        end: new Date(occ.getTime() + durationMs),
      });
    }
  }

  return out.sort((a, b) => a.start.getTime() - b.start.getTime());
}

export function CalendarPage() {
  const { has, refresh } = useSession();
  const [tick, setTick] = useState(0);
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDay, setSelectedDay] = useState<Date>(() => startOfDay(new Date()));
  const [selectedOccurrenceKey, setSelectedOccurrenceKey] = useState<string | null>(null);

  const canCreate = has(Permissions.calendarEventCreate) || has(Permissions.calendarEventManage);
  const canManage = has(Permissions.calendarEventManage);
  const canOverride = has(Permissions.calendarConflictOverride) || has(Permissions.rolesManage);

  const events = useMemo(() => {
    void tick;
    return demoStore.listCalendarEvents(true);
  }, [tick]);

  const occurrences = useMemo(() => expandOccurrences(events, cursor), [events, cursor]);
  const cells = useMemo(() => buildMonthCells(cursor), [cursor]);
  const today = startOfDay(new Date());

  const dayOccurrences = occurrences.filter((o) => sameDay(o.start, selectedDay));
  const selectedOccurrence =
    occurrences.find((o) => o.key === selectedOccurrenceKey) ??
    dayOccurrences[0] ??
    null;

  const defaults = defaultWindowForDate(selectedDay);
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

  function openCreateForDay(day: Date) {
    const win = defaultWindowForDate(day);
    setForm((prev) => ({ ...prev, startAt: win.start, endAt: win.end }));
    setShowCreate(true);
    setError('');
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
      const created = new Date(result.event.startAt);
      setCursor(new Date(created.getFullYear(), created.getMonth(), 1));
      setSelectedDay(startOfDay(created));
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
      setSelectedOccurrenceKey(null);
      bump('Event cancelled');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cancel failed');
    }
  }

  function shiftMonth(delta: number) {
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + delta, 1));
  }

  return (
    <div className="grid">
      <section className="hero">
        <p className="badge">One organization calendar</p>
        <h1>Ministry calendar</h1>
        <p className="muted">
          Month view of the shared calendar (ADR-003). Weekly Saturday programs expand across the month.
        </p>
        <p className="muted">
          <strong>Conflict policy</strong> controls what happens if two events overlap:
          Hard block stops the booking (used for Saturday program), Warning allows it with a notice,
          Info only just notes the overlap.
        </p>
        {message ? <p className="success">{message}</p> : null}
        {error ? <p className="error">{error}</p> : null}
      </section>

      <div className="row">
        {canCreate ? (
          <button type="button" onClick={() => openCreateForDay(selectedDay)}>
            Create event
          </button>
        ) : null}
        <button type="button" className="secondary" onClick={() => {
          const now = new Date();
          setCursor(new Date(now.getFullYear(), now.getMonth(), 1));
          setSelectedDay(startOfDay(now));
        }}>
          Today
        </button>
        <Link className="btn secondary" to="/app">Dashboard</Link>
      </div>

      <div className="cal-layout">
        <div className="panel cal-month-panel">
          <div className="cal-month-header">
            <button type="button" className="secondary" onClick={() => shiftMonth(-1)} aria-label="Previous month">
              ‹
            </button>
            <h2>{monthLabel(cursor)}</h2>
            <button type="button" className="secondary" onClick={() => shiftMonth(1)} aria-label="Next month">
              ›
            </button>
          </div>

          <div className="cal-weekdays">
            {WEEKDAYS.map((d) => (
              <div key={d} className="cal-weekday">{d}</div>
            ))}
          </div>

          <div className="cal-grid" role="grid" aria-label={`${monthLabel(cursor)} calendar`}>
            {cells.map(({ date, inMonth }) => {
              const dayOccs = occurrences.filter((o) => sameDay(o.start, date));
              const isSelected = sameDay(date, selectedDay);
              const isToday = sameDay(date, today);
              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  role="gridcell"
                  className={[
                    'cal-cell',
                    inMonth ? 'in-month' : 'out-month',
                    isSelected ? 'selected' : '',
                    isToday ? 'today' : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => {
                    setSelectedDay(startOfDay(date));
                    setSelectedOccurrenceKey(dayOccs[0]?.key ?? null);
                  }}
                  onDoubleClick={() => {
                    if (canCreate) openCreateForDay(date);
                  }}
                >
                  <div className="cal-cell-day">{date.getDate()}</div>
                  <div className="cal-cell-events">
                    {dayOccs.slice(0, 3).map((o) => (
                      <span
                        key={o.key}
                        className={`cal-chip ${o.event.eventPriority === 'organization_reserved' ? 'reserved' : ''}`}
                        title={o.event.title}
                      >
                        {o.event.title}
                      </span>
                    ))}
                    {dayOccs.length > 3 ? (
                      <span className="cal-more">+{dayOccs.length - 3} more</span>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
          <p className="muted cal-hint">Double-click a day to create an event{canCreate ? '' : ' (needs create permission)'}.</p>
        </div>

        <div className="panel cal-side">
          <h2>{selectedDay.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</h2>
          {dayOccurrences.length === 0 ? (
            <p className="muted">No events this day.</p>
          ) : (
            <ul className="cal-day-list">
              {dayOccurrences.map((o) => (
                <li key={o.key}>
                  <button
                    type="button"
                    className={`cal-day-item ${selectedOccurrence?.key === o.key ? 'active' : ''}`}
                    onClick={() => setSelectedOccurrenceKey(o.key)}
                  >
                    <strong>{o.event.title}</strong>
                    <span className="muted">
                      {o.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {' – '}
                      {o.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className={`badge ${o.event.conflictPolicy === 'hard_block' ? 'warn' : 'ok'}`}>
                      {conflictPolicyLabel(o.event.conflictPolicy)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {selectedOccurrence ? (
            <div className="cal-detail">
              <h3>{selectedOccurrence.event.title}</h3>
              {selectedOccurrence.event.description ? (
                <p className="muted">{selectedOccurrence.event.description}</p>
              ) : null}
              <p>
                {selectedOccurrence.start.toLocaleString()} → {selectedOccurrence.end.toLocaleTimeString()}
              </p>
              <div className="row">
                <span className="badge">{selectedOccurrence.event.eventPriority}</span>
                {selectedOccurrence.event.recurrence.enabled ? <span className="badge">Weekly</span> : null}
              </div>
              {canManage && selectedOccurrence.event.eventStatus !== 'cancelled' ? (
                <button
                  type="button"
                  className="secondary"
                  style={{ marginTop: '0.75rem' }}
                  onClick={() => cancelEvent(selectedOccurrence.event.id, selectedOccurrence.event.title)}
                >
                  Cancel event
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className="panel">
        <h2>All scheduled (list)</h2>
        <table className="table">
          <thead>
            <tr>
              <th>When</th>
              <th>Event</th>
              <th>Priority / conflict</th>
              <th>Status</th>
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
                  {event.recurrence.enabled ? <div className="badge">Weekly Sat</div> : null}
                </td>
                <td>
                  <div>{event.eventPriority === 'organization_reserved' ? 'Reserved program' : event.eventPriority}</div>
                  <div className="muted">{conflictPolicyLabel(event.conflictPolicy)}</div>
                </td>
                <td>
                  <span className={`badge ${event.eventStatus === 'cancelled' ? 'warn' : 'ok'}`}>
                    {event.eventStatus}
                  </span>
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
                <option value="hard_block">Hard block (reject overlaps)</option>
                <option value="warning">Warning (allow with warning)</option>
                <option value="informational">Info only (note overlap)</option>
              </select>
            </label>
            <p className="muted" style={{ margin: 0, fontSize: '0.85rem' }}>
              {CONFLICT_POLICY_HELP[form.conflictPolicy]}
            </p>
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
