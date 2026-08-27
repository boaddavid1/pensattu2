// Login.jsx — Login + Register page (ported from index.php)
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../api/AuthContext.jsx';

export default function Login() {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');
  const [agree, setAgree] = useState(false);

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  useEffect(() => {
    document.body.classList.add('login-page');
    return () => document.body.classList.remove('login-page');
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(loginEmail, loginPass);
      showToast('Login successful!', 'success');
      setTimeout(() => navigate('/'), 1000);
    } catch (err) {
      showToast(err.message || 'Invalid credentials', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!agree) { showToast('Please agree to terms & conditions', 'error'); return; }
    setLoading(true);
    try {
      const data = await register(regName, regEmail, regPass);
      showToast(data.message || 'Registration successful', 'success');
      setRegName(''); setRegEmail(''); setRegPass(''); setAgree(false);
      setTimeout(() => setMode('login'), 2000);
    } catch (err) {
      showToast(err.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const floatingLogos = Array.from({ length: 20 }, (_, i) => {
    const size = i % 13 === 0 ? 'xlarge' : i % 7 === 0 ? 'large' : i % 6 === 0 ? 'medium' : 'small';
    const img = i % 2 === 0 ? '/pns.png' : '/40.png';
    return <img key={i} src={img} alt="Logo" className={`floating-logo ${size}`} />;
  });

  return (
    <>
      <div className="floating-logos">{floatingLogos}</div>
      {toast && <div className={`toast show ${toast.type}`}>{toast.message}</div>}
      <div className="audit-badge">
        <i className='bx bx-check-shield'></i> All login attempts are logged
      </div>

      <div className="wrapper" style={{ height: mode === 'register' ? 580 : 500 }}>
        <div className="form-header">
          <div className="titles">
            <div className="title-login" style={{
              top: mode === 'login' ? '50%' : '-60px',
              opacity: mode === 'login' ? 1 : 0,
            }}>Login</div>
            <div className="title-register" style={{
              top: mode === 'register' ? '50%' : '50px',
              opacity: mode === 'register' ? 1 : 0,
            }}>Register</div>
          </div>
        </div>

        {mode === 'login' ? (
          <form className="login-form" onSubmit={handleLogin} style={{ opacity: 1 }}>
            <div className="input-box">
              <input type="text" className="input-field" value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)} required />
              <label className="label">Email or Username</label>
              <i className='bx bx-envelope icon'></i>
            </div>
            <div className="input-box">
              <input type="password" className="input-field" value={loginPass}
                onChange={e => setLoginPass(e.target.value)} required />
              <label className="label">Password</label>
              <i className='bx bx-lock-alt icon'></i>
            </div>
            <div className="input-box">
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Signing in...' : <>Sign In <i className='bx bx-log-in'></i></>}
              </button>
            </div>
            <div className="switch-form">
              <span>Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); setMode('register'); }}>Register</a></span>
            </div>
          </form>
        ) : (
          <form className="register-form" onSubmit={handleRegister} style={{ left: '50%', opacity: 1 }}>
            <div className="input-box">
              <input type="text" className="input-field" value={regName}
                onChange={e => setRegName(e.target.value)} required />
              <label className="label">Username</label>
              <i className='bx bx-user icon'></i>
            </div>
            <div className="input-box">
              <input type="email" className="input-field" value={regEmail}
                onChange={e => setRegEmail(e.target.value)} required />
              <label className="label">Email</label>
              <i className='bx bx-envelope icon'></i>
            </div>
            <div className="input-box">
              <input type="password" className="input-field" value={regPass}
                onChange={e => setRegPass(e.target.value)} required />
              <label className="label">Password</label>
              <i className='bx bx-lock-alt icon'></i>
            </div>
            <div className="form-cols">
              <div className="col-1">
                <input type="checkbox" id="agree" checked={agree}
                  onChange={e => setAgree(e.target.checked)} required />
                <label htmlFor="agree"> I agree to terms & conditions</label>
              </div>
            </div>
            <div className="input-box">
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Signing up...' : <>Sign Up <i className='bx bx-user-plus'></i></>}
              </button>
            </div>
            <div className="switch-form">
              <span>Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); setMode('login'); }}>Login</a></span>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
