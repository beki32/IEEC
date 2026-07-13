import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../engines/people/authContext';

export function LoginPage() {
  const { login, user, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  if (!loading && user) return <Navigate to="/" replace />;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setLocalError(null);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Unable to sign in');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-layout">
      <section className="auth-hero">
        <p className="brand hero-brand">IEEC YA Connect</p>
        <h1>Shepherd people from first visit to ministry leadership.</h1>
        <p className="lede">
          Platform engines for people, scoped RBAC, audit, and Follow-Up — built for IEEC Young Adult.
        </p>
      </section>
      <section className="auth-panel">
        <h2>Sign in</h2>
        <form className="stack" onSubmit={onSubmit}>
          <label>
            Email
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {(localError || error) && <p className="error">{localError || error}</p>}
          <button className="btn primary" type="submit" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </section>
    </div>
  );
}
