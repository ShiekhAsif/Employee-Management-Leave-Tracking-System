import { useState, type FormEvent } from 'react';
import { getErrorMessage } from '../api';
import { useAuth } from '../AuthContext';

export default function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('Admin@12345');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email.trim(), password);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-shell">
      <section className="login-art-panel">
        <div className="brand brand-light"><span className="brand-mark">P</span><span>PeopleDesk</span></div>
        <div className="login-art-copy">
          <span className="eyebrow">PEOPLE OPERATIONS, SIMPLIFIED</span>
          <h1>Good teams<br />make great work.</h1>
          <p>One organized place to manage your people, track time off, and keep everyone moving forward.</p>
        </div>
        <div className="art-decoration" aria-hidden="true">
          <div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" />
          <div className="art-card"><div className="art-avatar">JD</div><div><b>Team overview</b><small>Everything in sync</small></div><span className="art-check">✓</span></div>
          <div className="art-stat"><span>LEAVE REQUESTS</span><b>12 <em>+4 this week</em></b><div className="mini-bars"><i /><i /><i /><i /><i /><i /><i /></div></div>
        </div>
        <div className="login-footnote">A calmer way to manage the work behind the work.</div>
      </section>

      <section className="login-form-panel">
        <div className="login-form-wrap">
          <span className="mobile-brand"><span className="brand-mark">P</span> PeopleDesk</span>
          <div className="form-intro"><span className="eyebrow">WELCOME BACK</span><h2>Sign in to your workspace</h2><p>Enter your account details to continue.</p></div>
          <form onSubmit={handleSubmit} className="auth-form">
            <label htmlFor="email">Work email</label>
            <input id="email" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" required />
            <div className="label-row"><label htmlFor="password">Password</label><span>Demo environment</span></div>
            <input id="password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            {error && <div className="alert alert-error">{error}</div>}
            <button className="button button-primary button-wide" type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'} <span aria-hidden="true">→</span></button>
          </form>
          <div className="demo-credentials"><b>Demo accounts</b><div><span>Admin</span><code>admin@example.com</code><code>Admin@12345</code></div><div><span>Employee</span><code>employee@example.com</code><code>Employee@123</code></div></div>
          <p className="login-legal">By signing in, you agree to follow your organization's access and data policies.</p>
        </div>
      </section>
    </main>
  );
}
