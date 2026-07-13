import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '../engines/people/authContext';
import {
  createFollowUpEntry,
  listNewcomerJourneys,
} from '../modules/follow-up/followUpService';
import type { NewcomerJourney } from '../shared/types/domain';

export function FollowUpPage() {
  const { profile, user, can } = useAuth();
  const [journeys, setJourneys] = useState<NewcomerJourney[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJourneyId, setSelectedJourneyId] = useState('');
  const [summary, setSummary] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const organizationId = profile?.activeOrganizationId;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!organizationId) {
        setLoading(false);
        setError('No activeOrganizationId on user profile.');
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const rows = await listNewcomerJourneys(organizationId);
        if (!cancelled) {
          setJourneys(rows);
          if (rows[0]) setSelectedJourneyId(rows[0].id);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load journeys. Deploy indexes/rules and seed data if needed.',
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [organizationId]);

  async function onCreateEntry(event: FormEvent) {
    event.preventDefault();
    if (!organizationId || !user || !profile?.personId || !selectedJourneyId) return;
    const journey = journeys.find((row) => row.id === selectedJourneyId);
    if (!journey) return;
    setSaving(true);
    setMessage(null);
    try {
      await createFollowUpEntry({
        organizationId,
        journeyId: journey.id,
        personId: journey.personId,
        contactAt: new Date().toISOString(),
        contactMethod: 'phone_call',
        contactOutcome: 'reached',
        summary,
        createdByPersonId: profile.personId,
        actorUid: user.uid,
      });
      setSummary('');
      setMessage('Follow-up entry saved and audited.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to save entry');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <p className="eyebrow">Module</p>
        <h1>Follow-Up</h1>
        <p className="lede">
          First complete ministry module. Journeys, assignments, and entries reuse People + RBAC + Audit
          engines.
        </p>
      </header>

      {loading && <p className="muted">Loading journeys…</p>}
      {error && <p className="error">{error}</p>}

      <section className="panel">
        <h2>Newcomer journeys</h2>
        {journeys.length === 0 && !loading ? (
          <p className="muted">No journeys yet. Public registrations land in `publicRegistrations`.</p>
        ) : (
          <ul className="data-list">
            {journeys.map((journey) => (
              <li key={journey.id}>
                <strong>{journey.status}</strong>
                <span className="muted"> · person {journey.personId}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {can('follow_up.entry.create') && (
        <section className="panel">
          <h2>Log a follow-up entry</h2>
          <form className="stack" onSubmit={onCreateEntry}>
            <label>
              Journey
              <select
                value={selectedJourneyId}
                onChange={(e) => setSelectedJourneyId(e.target.value)}
                required
              >
                <option value="" disabled>
                  Select journey
                </option>
                {journeys.map((journey) => (
                  <option key={journey.id} value={journey.id}>
                    {journey.status} — {journey.personId}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Summary
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={4}
                required
              />
            </label>
            <button className="btn primary" type="submit" disabled={saving || !selectedJourneyId}>
              {saving ? 'Saving…' : 'Save entry'}
            </button>
            {message && <p className="muted">{message}</p>}
          </form>
        </section>
      )}
    </div>
  );
}
