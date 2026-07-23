import { Permissions } from '@ieec/shared';
import { Navigate } from 'react-router-dom';
import { demoStore } from '../lib/demoStore';
import { useSession } from '../lib/session';

export function AdminRolesPage() {
  const { has } = useSession();
  if (!has(Permissions.rolesManage)) return <Navigate to="/app" replace />;

  const state = demoStore.getState();

  return (
    <div className="grid">
      <section className="hero">
        <h1>Roles & permissions</h1>
        <p className="muted">Live templates — assigning a role grants all template permissions in scope. Deny overrides win.</p>
      </section>

      <div className="panel">
        <h2>Role templates</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Permissions</th>
            </tr>
          </thead>
          <tbody>
            {state.roleTemplates.map((t) => (
              <tr key={t.id}>
                <td>
                  <strong>{t.name}</strong>
                  <div className="muted">{t.description}</div>
                </td>
                <td className="muted">{t.permissions.length} keys</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="panel">
        <h2>Assignments</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Person</th>
              <th>Role</th>
              <th>Scope</th>
              <th>Active</th>
            </tr>
          </thead>
          <tbody>
            {state.roleAssignments.map((a) => {
              const person = state.people.find((p) => p.id === a.personId);
              const role = state.roleTemplates.find((t) => t.id === a.roleTemplateId);
              return (
                <tr key={a.id}>
                  <td>{person ? `${person.firstName} ${person.lastName}` : a.personId}</td>
                  <td>{role?.name}</td>
                  <td>{a.scopeType} / {a.teamId}</td>
                  <td>{a.active ? 'yes' : 'no'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="panel">
        <h2>Recent audit</h2>
        <table className="table">
          <thead>
            <tr>
              <th>When</th>
              <th>Action</th>
              <th>Entity</th>
            </tr>
          </thead>
          <tbody>
            {state.auditLogs.slice(0, 12).map((log) => (
              <tr key={log.id}>
                <td className="muted">{new Date(log.createdAt).toLocaleString()}</td>
                <td>{log.action}</td>
                <td>{log.entityType}:{log.entityId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
