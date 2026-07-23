import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { demoStore } from '../lib/demoStore';

export function RegisterPage() {
  const [done, setDone] = useState<{ journeyId: string; duplicates: number } | null>(null);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    sex: 'female',
    contactMethod: 'text',
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const result = demoStore.registerNewcomer(form);
    setDone({
      journeyId: result.journey.id,
      duplicates: result.duplicateCandidateIds.length,
    });
  }

  return (
    <div className="main">
      <section className="hero">
        <p className="badge">Public registration</p>
        <h1>Welcome to IEEC YA</h1>
        <p>No account required. Leaders will assign a Follow-Up minister to walk with you.</p>
      </section>

      {done ? (
        <div className="panel">
          <h2>Registration received</h2>
          <p className="success">Thank you. Your journey id is {done.journeyId}.</p>
          {done.duplicates > 0 ? (
            <p className="muted">Possible existing match flagged for leader duplicate review (no auto-merge).</p>
          ) : (
            <p className="muted">You are in the unassigned Follow-Up queue.</p>
          )}
          <div className="row" style={{ marginTop: '1rem' }}>
            <Link className="btn" to="/login">Staff sign in</Link>
            <button className="secondary" type="button" onClick={() => setDone(null)}>Register another</button>
          </div>
        </div>
      ) : (
        <form className="panel grid two" onSubmit={onSubmit}>
          <label>First name<input required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></label>
          <label>Last name<input required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></label>
          <label>Email<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
          <label>Phone<input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
          <label>
            Sex
            <select value={form.sex} onChange={(e) => setForm({ ...form, sex: e.target.value })}>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="unspecified">Prefer not to say</option>
            </select>
          </label>
          <label>
            Preferred contact
            <select value={form.contactMethod} onChange={(e) => setForm({ ...form, contactMethod: e.target.value })}>
              <option value="text">Text</option>
              <option value="call">Call</option>
              <option value="email">Email</option>
            </select>
          </label>
          <div className="row">
            <button type="submit">Submit registration</button>
            <Link to="/login">Staff login</Link>
          </div>
        </form>
      )}
    </div>
  );
}
