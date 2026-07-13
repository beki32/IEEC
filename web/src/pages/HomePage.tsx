import { useAuth } from '../engines/people/authContext';

export function HomePage() {
  const { profile, can } = useAuth();

  return (
    <div className="page">
      <header className="page-header">
        <p className="eyebrow">Platform</p>
        <h1>Welcome{profile?.displayName ? `, ${profile.displayName}` : ''}</h1>
        <p className="lede">
          Active organization: {profile?.activeOrganizationId || 'not set'}. Permissions are evaluated
          from live role templates plus overrides (ADR-RBAC-001/002).
        </p>
      </header>

      <div className="metric-row">
        <article className="metric">
          <h3>System role</h3>
          <p>{profile?.systemRole || '—'}</p>
        </article>
        <article className="metric">
          <h3>Effective permissions</h3>
          <p>{profile?.effectivePermissions?.length ?? 0}</p>
        </article>
        <article className="metric">
          <h3>Follow-Up access</h3>
          <p>{can('follow_up.view') ? 'Granted' : 'Denied'}</p>
        </article>
      </div>

      <section className="panel">
        <h2>Core engines online</h2>
        <ul className="plain-list">
          <li>Organization · People · Authorization (RBAC)</li>
          <li>Audit · Configuration scaffolding</li>
          <li>Follow-Up module (first business module)</li>
        </ul>
      </section>
    </div>
  );
}
