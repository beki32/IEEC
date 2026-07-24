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
    <div className="register-shell login-shell">
      <aside
        className="register-aside"
        style={{
          backgroundImage:
            "linear-gradient(160deg, rgba(8,32,24,0.8), rgba(10,61,46,0.9)), url('https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=1400&q=80')",
        }}
      >
        <Link to="/" className="register-aside-brand">
          IEEC YA
        </Link>
        <div className="register-aside-copy">
          <p className="register-aside-kicker">Staff access · {mode}</p>
          <h1>Sign in to shepherd people well.</h1>
          <p>
            {demo
              ? 'Demo mode uses seeded local accounts. Use a quick account below to explore.'
              : 'Firebase Auth mode — use emulator or project accounts.'}
          </p>
        </div>
        <p className="register-aside-foot">IEEC YA Connect</p>
      </aside>

      <div className="register-content">
        <header className="register-content-top">
          <Link to="/" className="register-back">
            ← Home
          </Link>
          <Link to="/register" className="register-staff">
            Newcomer registration
          </Link>
        </header>

        <main className="register-main">
          <form className="register-form" onSubmit={onSubmit}>
            <div className="register-form-head">
              <h2>Staff sign in</h2>
              <p>Leaders, assistants, and ministers use this door.</p>
            </div>

            <div className="register-fields login-fields">
              <label className="register-span-2">
                <span className="register-label">Email</span>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                  autoComplete="username"
                />
              </label>
              <label className="register-span-2">
                <span className="register-label">Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  readOnly={demo}
                  required={!demo}
                  autoComplete="current-password"
                />
              </label>
            </div>

            {error ? <p className="register-alert">{error}</p> : null}

            <div className="register-actions">
              <button type="submit" className="register-submit" disabled={busy}>
                {busy ? 'Signing in…' : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="login-quick">
            <p className="register-label">Quick demo accounts</p>
            <div className="login-quick-list">
              {demos.map((d) => (
                <button
                  key={d.email}
                  type="button"
                  className="login-quick-btn"
                  onClick={() => {
                    setEmail(d.email);
                    setPassword('demo-password');
                  }}
                >
                  <strong>{d.label}</strong>
                  <span>{d.email}</span>
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
