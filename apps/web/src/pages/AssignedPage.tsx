import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { matchesPersonSearch, TableSearch } from '../components/TableSearch';
import { demoStore } from '../lib/demoStore';
import { useSession } from '../lib/session';

export function AssignedPage() {
  const { person } = useSession();
  const state = demoStore.getState();
  const [query, setQuery] = useState('');

  const rows = useMemo(
    () =>
      state.assignments
        .filter((a) => a.assignedPersonId === person?.id && a.assignmentStatus === 'active')
        .map((a) => ({
          assignment: a,
          journey: state.journeys.find((j) => j.id === a.journeyId),
          newcomer: state.people.find((p) => p.id === a.newcomerPersonId),
        })),
    [state.assignments, state.journeys, state.people, person?.id],
  );

  const filtered = useMemo(
    () =>
      rows.filter(({ newcomer, assignment }) =>
        matchesPersonSearch(query, [
          newcomer?.firstName,
          newcomer?.lastName,
          newcomer ? `${newcomer.firstName} ${newcomer.lastName}` : null,
          newcomer?.email.address,
          assignment.newcomerPersonId,
        ]),
      ),
    [rows, query],
  );

  return (
    <div className="grid">
      <section className="hero">
        <h1>My assigned newcomers</h1>
        <p className="muted">Weekly report and Saturday attendance are separate records.</p>
      </section>
      <div className="panel">
        <TableSearch
          value={query}
          onChange={setQuery}
          placeholder="Search by name or email…"
          resultCount={filtered.length}
          totalCount={rows.length}
        />
        {rows.length === 0 ? <p className="muted">No active assignments.</p> : null}
        {rows.length > 0 && filtered.length === 0 ? (
          <p className="muted">No people match “{query.trim()}”.</p>
        ) : null}
        {filtered.length > 0 ? (
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
              {filtered.map(({ assignment, journey, newcomer }) => (
                <tr key={assignment.id}>
                  <td>
                    {newcomer ? `${newcomer.firstName} ${newcomer.lastName}` : assignment.newcomerPersonId}
                    {newcomer ? <div className="muted">{newcomer.email.address}</div> : null}
                  </td>
                  <td><span className="badge">{journey?.journeyStatus}</span></td>
                  <td>{assignment.assignmentType}</td>
                  <td><Link to={`/app/people/${assignment.newcomerPersonId}`}>Open profile</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </div>
    </div>
  );
}
