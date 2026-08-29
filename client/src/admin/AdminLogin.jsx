import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { adminApi, isLoggedIn, setToken } from './adminApi';
import './admin.css';

export default function AdminLogin() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (isLoggedIn()) return <Navigate to="/control-panel/dashboard" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await adminApi.login({ email: identifier, password });
      setToken(res.token);
      navigate('/control-panel/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-login">
      <div className="admin-login-card">
        <h1>PENSA TTU <span>Super Admin</span></h1>
        <form onSubmit={handleSubmit}>
          <label>
            Email or Username
            <input type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>
          {error && <div className="admin-error">{error}</div>}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
