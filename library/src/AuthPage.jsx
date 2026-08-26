import { useState } from 'react';
import { auth } from './api';

export default function AuthPage({ onSuccess, mode: initialMode }) {
  const [mode, setMode] = useState(initialMode || 'login');
  const [form, setForm] = useState({ full_name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = mode === 'login'
        ? await auth.login({ email: form.email, password: form.password })
        : await auth.register(form);
      auth.setToken(data.token);
      onSuccess(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pq-auth-page">
      <div className="pq-auth-card">
        <div className="pq-auth-header">
          <span className="pq-logo-icon">📚</span>
          <h2>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
          <p>{mode === 'login' ? 'Log in to download past questions' : 'Sign up to access the library'}</p>
        </div>

        {error && <div className="pq-auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="pq-auth-form">
          {mode === 'register' && (
            <label>
              Full Name
              <input
                type="text"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                required
              />
            </label>
          )}
          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={mode === 'register' ? 6 : 1}
            />
          </label>
          <button type="submit" className="pq-auth-submit" disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Log In' : 'Sign Up'}
          </button>
        </form>

        <p className="pq-auth-switch">
          {mode === 'login' ? (
            <>Don't have an account? <button onClick={() => { setMode('register'); setError(''); }}>Sign up</button></>
          ) : (
            <>Already have an account? <button onClick={() => { setMode('login'); setError(''); }}>Log in</button></>
          )}
        </p>
      </div>
    </div>
  );
}
