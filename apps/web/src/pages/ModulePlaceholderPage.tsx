import { Link, useParams } from 'react-router-dom';
import { useSession } from '../lib/session';

const COPY: Record<string, { title: string; body: string }> = {
  'bible-study': {
    title: 'Bible Study',
    body: 'Groups, classes, and attendance for this team will live here. Shared Calendar and Chat remain available from the sidebar.',
  },
  media: {
    title: 'Media',
    body: 'Media desk workflows will live here. You can still use org Calendar and Chat while this module is under construction.',
  },
  worship: {
    title: 'Worship',
    body: 'Worship planning will live here as a team module inside the same CMS shell.',
  },
};

export function ModulePlaceholderPage() {
  const { moduleKey } = useParams();
  const { activeTeam } = useSession();
  const copy = COPY[moduleKey ?? ''] ?? {
    title: activeTeam?.name ?? 'Team module',
    body: 'This ministry module is scaffolded in the multi-team CMS shell.',
  };

  return (
    <div className="grid">
      <section className="hero">
        <p className="badge">{activeTeam?.name ?? 'Team module'}</p>
        <h1>{copy.title}</h1>
        <p className="muted">{copy.body}</p>
      </section>
      <div className="panel">
        <p className="muted">
          People can belong to multiple teams. Switch teams in the sidebar to change module menus without losing org tools.
        </p>
        <Link className="btn" to="/app">Back to team home</Link>
      </div>
    </div>
  );
}
