import { FormEvent, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { demoStore } from '../lib/demoStore';
import { formatRelativeTime } from '../lib/formatTime';
import { useSession } from '../lib/session';

export function FollowUpNotesPage() {
  const { person, activeTeam, refresh, myTeams } = useSession();
  const [, setTick] = useState(0);
  const followUpTeam = useMemo(
    () => myTeams.find((t) => t.moduleKey === 'follow_up') ?? null,
    [myTeams],
  );

  const [noteTitle, setNoteTitle] = useState('');
  const [noteBody, setNoteBody] = useState('');
  const [noteError, setNoteError] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskError, setTaskError] = useState('');

  if (!person) return <Navigate to="/login" replace />;
  if (!followUpTeam) {
    return (
      <div className="grid">
        <section className="hero">
          <h1>Notes & tasks</h1>
          <p className="error">You need a Follow-Up team membership to use this page.</p>
        </section>
      </div>
    );
  }

  if (activeTeam && activeTeam.moduleKey !== 'follow_up') {
    return <Navigate to="/app" replace />;
  }

  const teamId = followUpTeam.id;
  const notes = demoStore.listMeetingNotes(teamId);
  const tasks = demoStore.listTeamTasks(teamId);
  const openTasks = tasks.filter((t) => !t.completed);
  const doneTasks = tasks.filter((t) => t.completed);

  function bump() {
    refresh();
    setTick((n) => n + 1);
  }

  function onAddNote(e: FormEvent) {
    e.preventDefault();
    setNoteError('');
    try {
      demoStore.addMeetingNote({
        teamId,
        title: noteTitle,
        body: noteBody,
      });
      setNoteTitle('');
      setNoteBody('');
      bump();
    } catch (err) {
      setNoteError(err instanceof Error ? err.message : 'Could not save note');
    }
  }

  function onAddTask(e: FormEvent) {
    e.preventDefault();
    setTaskError('');
    try {
      demoStore.addTeamTask({
        teamId,
        title: taskTitle,
      });
      setTaskTitle('');
      bump();
    } catch (err) {
      setTaskError(err instanceof Error ? err.message : 'Could not add task');
    }
  }

  return (
    <div className="grid">
      <section className="hero">
        <p className="badge">Follow-Up team</p>
        <h1>Meeting notes & tasks</h1>
        <p className="muted">
          Capture team meeting notes and track follow-through with a shared checklist.
        </p>
      </section>

      <div className="grid two notes-tasks-layout">
        <section className="panel">
          <h2>Meeting notes</h2>
          <form className="notes-form" onSubmit={onAddNote}>
            <label>
              Title
              <input
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="e.g. Saturday greeter huddle"
              />
            </label>
            <label>
              Notes
              <textarea
                value={noteBody}
                onChange={(e) => setNoteBody(e.target.value)}
                placeholder="Decisions, prayer points, people to follow up…"
                rows={4}
              />
            </label>
            {noteError ? <p className="error">{noteError}</p> : null}
            <button type="submit">Save note</button>
          </form>

          <ul className="notes-list">
            {notes.length === 0 ? <li className="muted">No meeting notes yet.</li> : null}
            {notes.map((note) => {
              const author = demoStore.getState().people.find((p) => p.id === note.createdByPersonId);
              return (
                <li key={note.id}>
                  <div className="notes-list-head">
                    <strong>{note.title}</strong>
                    <span className="muted">{formatRelativeTime(note.createdAt)}</span>
                  </div>
                  <p>{note.body}</p>
                  <span className="muted">
                    {author ? `${author.firstName} ${author.lastName}` : 'Team'}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="panel">
          <h2>Task checklist</h2>
          <p className="muted" style={{ marginBottom: '0.75rem' }}>
            {openTasks.length} open · {doneTasks.length} done
          </p>
          <form className="task-add-form" onSubmit={onAddTask}>
            <input
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="Add a task…"
              aria-label="New task"
            />
            <button type="submit">Add</button>
          </form>
          {taskError ? <p className="error">{taskError}</p> : null}

          <ul className="task-checklist">
            {tasks.length === 0 ? <li className="muted">No tasks yet. Add the first one.</li> : null}
            {tasks.map((task) => (
              <li key={task.id} className={task.completed ? 'done' : ''}>
                <label className="task-check-row">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => {
                      demoStore.toggleTeamTask(task.id);
                      bump();
                    }}
                  />
                  <span>{task.title}</span>
                </label>
                <div className="task-meta">
                  <span className="muted">{formatRelativeTime(task.createdAt)}</span>
                  <button
                    type="button"
                    className="linkish"
                    onClick={() => {
                      demoStore.deleteTeamTask(task.id);
                      bump();
                    }}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
