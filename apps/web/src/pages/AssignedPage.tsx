import { Link } from 'react-router-dom';
import { demoStore } from '../lib/demoStore';
import { useSession } from '../lib/session';

export function AssignedPage() {
  const { person } = useSession();
  const state = demoStore.getState();
  const rows = state.assignments
    .filter((a) => a.assignedPersonId === person?.id && a.assignmentStatus === 'active')
    .map((a) => ({
      assignment: a,
      journey: state.journeys.find((j) => j.id === a.journeyId),
      newcomer: state.people.find((p) => p.id === a.newcomerPersonId),
    }));

  return (
    <div className="grid">
      <section className="hero">
        <h1>My assigned newcomers</h1>
        <p className="muted">Weekly report and Saturday attendance are separate records.</p>
      </section>
      <div className="panel">
        {rows.length === 0 ? <p className="muted">No active assignments.</p> : null}
        <table className="table">
          <thead>
            <tr>
              <th>Newcomer</th>
              <th>Journey</th>
              <th>Type</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ assignment, journey, newcomer }) => (
              <tr key={assignment.id}>
                <td>{newcomer ? `${newcomer.firstName} ${newcomer.lastName}` : assignment.newcomerPersonId}</td>
                <td><span className="badge">{journey?.journeyStatus}</span></td>
                <td>{assignment.assignmentType}</td>
                <td><Link to={`/app/people/${assignment.newcomerPersonId}`}>Open profile</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
