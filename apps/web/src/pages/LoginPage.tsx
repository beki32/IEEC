import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSession } from '../lib/session';

const demos = [
  { email: 'leader@ieec.demo', label: 'Follow-Up Leader' },
  { email: 'assistant@ieec.demo', label: 'Assistant Leader' },
  { email: 'minister@ieec.demo', label: 'Follow-Up Minister' },
];

export function LoginPage() {
  const { login } = useSession();
  const navigate = useNavigate();
  const [email, setEmail] = useState('leader@ieec.demo');
  const [error, setError] = useState('');

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const result = login(email);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    navigate('/app');
  }

  return (
    <div className="main">
      <section className="hero">
        <p className="badge">IEEC YA Connect</p>
        <h1>Sign in to shepherd people well</h1>
        <p>Demo mode uses seeded accounts. Firebase Auth can replace this when env config is provided.</p>
      </section>
      <div className="panel" style={{ maxWidth: 460 }}>
        <form className="grid" onSubmit={onSubmit}>
          <label>
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </label>
          <label>
            Password
            <input type="password" value="demo-password" readOnly />
          </label>
          {error ? <p className="error">{error}</p> : null}
          <button type="submit">Sign in</button>
        </form>
        <div className="demo-accounts">
          <p className="muted">Quick demo accounts</p>
          {demos.map((d) => (
            <button key={d.email} type="button" onClick={() => setEmail(d.email)}>
              {d.label}: {d.email}
            </button>
          ))}
        </div>
        <p className="muted" style={{ marginTop: '1rem' }}>
          Or <Link to="/register">register a newcomer</Link> without an account.
        </p>
      </div>
    </div>
  );
}
