import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSession } from '../lib/session';
import { isDemoMode } from '../lib/firebase';

const demos = [
  { email: 'leader@ieec.demo', label: 'Follow-Up Leader' },
  { email: 'assistant@ieec.demo', label: 'Assistant Leader' },
  { email: 'minister@ieec.demo', label: 'Follow-Up Minister' },
];

export function LoginPage() {
  const { login, mode } = useSession();
  const navigate = useNavigate();
  const [email, setEmail] = useState('leader@ieec.demo');
  const [password, setPassword] = useState('demo-password');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const demo = isDemoMode();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const result = await login(email, password);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    navigate('/app');
  }

  return (
    <div className="main">
      <section className="hero">
        <p className="badge">IEEC YA Connect · {mode}</p>
        <h1>Sign in to shepherd people well</h1>
        <p>
          {demo
            ? 'Demo mode uses seeded local accounts. Set VITE_USE_DEMO=false to use Firebase Auth.'
            : 'Firebase Auth mode — use emulator or project accounts (seed first).'}
        </p>
      </section>
      <div className="panel" style={{ maxWidth: 460 }}>
        <form className="grid" onSubmit={onSubmit}>
          <label>
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              readOnly={demo}
              required={!demo}
            />
          </label>
          {error ? <p className="error">{error}</p> : null}
          <button type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        </form>
        <div className="demo-accounts">
          <p className="muted">Quick accounts</p>
          {demos.map((d) => (
            <button
              key={d.email}
              type="button"
              onClick={() => {
                setEmail(d.email);
                setPassword('demo-password');
              }}
            >
              {d.label}: {d.email}
            </button>
          ))}
        </div>
        <p className="muted" style={{ marginTop: '1rem' }}>
          <Link to="/">Home</Link>
          {' · '}
          <Link to="/register">Register as a newcomer</Link>
        </p>
      </div>
    </div>
  );
}
