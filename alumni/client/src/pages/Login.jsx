// Login.jsx — Alumni portal login
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../api/AuthContext.jsx';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  useEffect(() => {
    document.body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    return () => { document.body.style.background = ''; };
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(username, password);
      showToast('Login successful!', 'success');
      setTimeout(() => navigate('/'), 1000);
    } catch (err) {
      showToast(err.message || 'Invalid credentials', 'error');
    } finally {
      setLoading(false);
    }
  };

  const floatingLogos = Array.from({ length: 15 }, (_, i) => {
    const size = i % 13 === 0 ? 'xlarge' : i % 7 === 0 ? 'large' : i % 6 === 0 ? 'medium' : 'small';
    const img = i % 2 === 0 ? '/pns.png' : '/40.png';
    return <img key={i} src={img} alt="Logo" className={`floating-logo ${size}`} />;
  });

  return (
    <>
      <div className="floating-logos">{floatingLogos}</div>
      {toast && <div className={`toast show ${toast.type}`}>{toast.message}</div>}
      <div className="wrapper" style={{ height: 420, zIndex: 1 }}>
        <div className="form-header">
          <div className="titles">
            <div className="title-login" style={{ top: '50%', opacity: 1 }}>Alumni Login</div>
          </div>
        </div>
        <form className="login-form" onSubmit={handleLogin} style={{ opacity: 1 }}>
          <div className="input-box">
            <input type="text" className="input-field" value={username}
              onChange={e => setUsername(e.target.value)} required />
            <label className="label">Username</label>
            <i className='bx bx-user icon'></i>
          </div>
          <div className="input-box">
            <input type="password" className="input-field" value={password}
              onChange={e => setPassword(e.target.value)} required />
            <label className="label">Password</label>
            <i className='bx bx-lock-alt icon'></i>
          </div>
          <div className="input-box">
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Signing in...' : <>Sign In <i className='bx bx-log-in'></i></>}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
