import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

type Slide = {
  eyebrow: string;
  title: string;
  lead?: string;
  body: ReactNode;
};

const slides: Slide[] = [
  {
    eyebrow: 'IEEC Young Adult Ministry',
    title: 'YA Connect — progress & workflow',
    lead: 'Follow-Up first. Mobile + web co-primary. One shared Firebase backend.',
    body: (
      <p className="briefing-note">Stakeholder briefing · Built with Cursor Cloud Agents + GitHub</p>
    ),
  },
  {
    eyebrow: 'Platform strategy',
    title: 'Can both be primary? Yes.',
    lead: 'Mobile and web are co-primary — same product, different strengths.',
    body: (
      <div className="briefing-grid">
        <article className="briefing-card">
          <h3>Mobile (iOS + Android)</h3>
          <ul>
            <li>Primary for ministers in the field</li>
            <li>Quick assign, reports, reminders</li>
            <li>Expo → TestFlight / App Store / Play</li>
          </ul>
        </article>
        <article className="briefing-card">
          <h3>Web</h3>
          <ul>
            <li>Primary for public registration &amp; church site</li>
            <li>Primary for leaders on larger screens</li>
            <li>Admin / CMS and stakeholder demos</li>
          </ul>
        </article>
      </div>
    ),
  },
  {
    eyebrow: 'Follow-Up workflow',
    title: '1 · Registration → queue',
    body: (
      <ol className="briefing-steps">
        <li><strong>Newcomer registers</strong> — public web form (no login), QR, or future mobile form.</li>
        <li><strong>Duplicate check</strong> — leaders review matches (no silent auto-merge).</li>
        <li><strong>Person + journey created</strong> — status = Newcomer; audited.</li>
        <li><strong>Leaders notified</strong> — Team Leader &amp; Assistant.</li>
        <li><strong>Unassigned queue</strong> — waiting for a Follow-Up minister.</li>
      </ol>
    ),
  },
  {
    eyebrow: 'Follow-Up workflow',
    title: '2 · Assign → first contact',
    body: (
      <ol className="briefing-steps">
        <li><strong>Leader / Assistant assigns</strong> primary minister (optional secondary).</li>
        <li><strong>Assignee notified</strong> in-app.</li>
        <li><strong>First follow-up deadline</strong> calculated.</li>
        <li><strong>Reassignment keeps history</strong> — prior work is not erased.</li>
        <li><strong>Statuses</strong> — pending, active, paused, reassigned, completed, cancelled.</li>
      </ol>
    ),
  },
  {
    eyebrow: 'Follow-Up workflow',
    title: '3 · Care loop (minister week)',
    body: (
      <div className="briefing-grid">
        <article className="briefing-card">
          <h3>Ministers</h3>
          <ul>
            <li>Open assigned people</li>
            <li>Contact (call / text / meet / WhatsApp)</li>
            <li>Log weekly follow-up report</li>
            <li>Method, outcome, summary, prayer, needs</li>
            <li>Next action + date; escalate if needed</li>
          </ul>
        </article>
        <article className="briefing-card">
          <h3>Alongside the report</h3>
          <ul>
            <li>Attendance (separate from weekly report)</li>
            <li>Bio / notes for ongoing context</li>
            <li>Team notes &amp; tasks</li>
            <li>Calendar + team chat</li>
          </ul>
        </article>
      </div>
    ),
  },
  {
    eyebrow: 'Follow-Up workflow',
    title: '4 · Leadership &amp; transition',
    body: (
      <>
        <div className="briefing-grid">
          <article className="briefing-card">
            <h3>Leaders / Assistants</h3>
            <ul>
              <li>Queue health &amp; overdue follow-ups</li>
              <li>Reassign when load or fit is wrong</li>
              <li>Review reports &amp; escalations</li>
              <li>Manage roles (RBAC)</li>
            </ul>
          </article>
          <article className="briefing-card">
            <h3>Journey outcomes</h3>
            <ul>
              <li>Continue, pause, close, or reopen</li>
              <li>Transition toward membership when ready</li>
              <li>Sensitive changes audited</li>
            </ul>
          </article>
        </div>
        <p className="briefing-flow">
          Register → Queue → Assign → Contact + report → Review → Transition
        </p>
      </>
    ),
  },
  {
    eyebrow: 'Roles',
    title: 'Who does what',
    body: (
      <div className="briefing-grid briefing-grid-3">
        <article className="briefing-card">
          <h3>Team Leader</h3>
          <p>Full queue, assign/reassign, overdue review, team membership, reports.</p>
        </article>
        <article className="briefing-card">
          <h3>Assistant Leader</h3>
          <p>View all, assign/reassign, create/update records, support the leader.</p>
        </article>
        <article className="briefing-card">
          <h3>Follow-Up Minister</h3>
          <p>Own assigned newcomers; log updates; reminders; escalate.</p>
        </article>
      </div>
    ),
  },
  {
    eyebrow: 'Shipped so far',
    title: 'What already works',
    body: (
      <div className="briefing-grid">
        <article className="briefing-card">
          <h3>Public web</h3>
          <ul>
            <li>Landing, prayer, about</li>
            <li>Newcomer registration (not staff signup)</li>
          </ul>
        </article>
        <article className="briefing-card">
          <h3>Staff Follow-Up (web prototype)</h3>
          <ul>
            <li>Queue, assign, profiles, reports</li>
            <li>Notifications, calendar, notes &amp; tasks</li>
            <li>Mobile Expo scaffold next for parity</li>
          </ul>
        </article>
      </div>
    ),
  },
  {
    eyebrow: 'Next',
    title: 'Recommended phases',
    body: (
      <ol className="briefing-steps">
        <li><strong>Mobile Follow-Up parity</strong> from Figma (co-primary with web).</li>
        <li><strong>Firebase production</strong> — live Auth/Firestore + staff invite.</li>
        <li><strong>TestFlight / internal Play</strong> for real Follow-Up use.</li>
        <li><strong>App Store / Play</strong> + keep web strong for public &amp; leaders.</li>
      </ol>
    ),
  },
  {
    eyebrow: 'Summary',
    title: 'Where we are',
    lead: 'Follow-Up first. One system. Mobile + web co-primary. Clear care loop from register to transition.',
    body: (
      <ul className="briefing-steps" style={{ listStyle: 'disc', paddingLeft: '1.2rem' }}>
        <li><strong>Done:</strong> monorepo, web prototype, mobile scaffold, Firebase scaffolding, this briefing.</li>
        <li><strong>Next:</strong> mobile Follow-Up UI, live Firebase, TestFlight.</li>
      </ul>
    ),
  },
];

export function BriefingPage() {
  const [index, setIndex] = useState(0);
  const slide = slides[index];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        setIndex((i) => Math.min(slides.length - 1, i + 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setIndex((i) => Math.max(0, i - 1));
      } else if (e.key === 'Home') setIndex(0);
      else if (e.key === 'End') setIndex(slides.length - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="briefing-page">
      <header className="briefing-top">
        <Link to="/" className="briefing-back">
          ← IEEC YA home
        </Link>
        <p className="briefing-counter">
          {index + 1} / {slides.length}
        </p>
      </header>

      <section className="briefing-slide" key={index}>
        <p className="briefing-eyebrow">{slide.eyebrow}</p>
        <h1>{slide.title}</h1>
        {slide.lead ? <p className="briefing-lead">{slide.lead}</p> : null}
        <div className="briefing-body">{slide.body}</div>
      </section>

      <footer className="briefing-controls">
        <button type="button" className="btn secondary" disabled={index === 0} onClick={() => setIndex((i) => i - 1)}>
          ← Prev
        </button>
        <button
          type="button"
          className="btn"
          disabled={index === slides.length - 1}
          onClick={() => setIndex((i) => i + 1)}
        >
          Next →
        </button>
        <p className="muted briefing-hint">Keys: ← → or Space</p>
      </footer>
    </div>
  );
}
