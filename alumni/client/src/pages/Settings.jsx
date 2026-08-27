// Settings.jsx — Alumni portal settings (portal, SMS, AI config)
import { useState, useEffect } from 'react';
import { alumniApi } from '../api/alumniApi.js';

const settingSections = [
  { key: 'portal', label: 'Portal', icon: 'bxs-building' },
  { key: 'contact', label: 'Contact', icon: 'bxs-phone' },
  { key: 'sms', label: 'SMS', icon: 'bxs-message' },
  { key: 'ai', label: 'AI', icon: 'bxs-bot' },
  { key: 'display', label: 'Display', icon: 'bxs-palette' },
];

export default function Settings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeSection, setActiveSection] = useState('portal');
  const [testing, setTesting] = useState('');
  const [smsBalance, setSmsBalance] = useState(null);

  useEffect(() => {
    alumniApi.getSettings().then(data => {
      setSettings(data.settings);
      setLoading(false);
    }).catch(err => { setError(err.message); setLoading(false); });
  }, []);

  const handleSave = async (key) => {
    try {
      await alumniApi.updateSetting(key, settings[key]);
      setSuccess(`${key} updated successfully`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) { setError(err.message); }
  };

  const handleChange = (key, value) => {
    setSettings(s => ({ ...s, [key]: value }));
  };

  const handleTestSMS = async () => {
    setTesting('sms');
    try {
      const data = await alumniApi.testSMS();
      setSuccess(data.message || 'SMS test successful');
    } catch (err) { setError(err.message); }
    finally { setTesting(''); }
  };

  const handleTestAI = async () => {
    setTesting('ai');
    try {
      const data = await alumniApi.testAI();
      setSuccess(data.message || 'AI test successful');
    } catch (err) { setError(err.message); }
    finally { setTesting(''); }
  };

  const handleCheckBalance = async () => {
    setTesting('balance');
    try {
      const data = await alumniApi.checkSMSBalance();
      setSmsBalance(data.balance || data.error || 'Unknown');
    } catch (err) { setError(err.message); }
    finally { setTesting(''); }
  };

  if (loading) return <div className="loading">Loading settings...</div>;

  const sectionSettings = {
    portal: [
      { key: 'portal_name', label: 'Portal Name', type: 'text' },
      { key: 'portal_description', label: 'Description', type: 'textarea' },
    ],
    contact: [
      { key: 'contact_email', label: 'Contact Email', type: 'email' },
      { key: 'contact_phone', label: 'Contact Phone', type: 'text' },
      { key: 'portal_address', label: 'Address', type: 'textarea' },
    ],
    sms: [
      { key: 'sms_api_key', label: 'SMS API Key', type: 'password' },
      { key: 'sms_sender_id', label: 'Sender ID', type: 'text' },
      { key: 'sms_api_url', label: 'SMS API URL', type: 'text' },
    ],
    ai: [
      { key: 'ai_api_key', label: 'AI API Key (OpenAI)', type: 'password' },
      { key: 'ai_model', label: 'AI Model', type: 'text' },
      { key: 'ai_api_url', label: 'AI API URL', type: 'text' },
    ],
    display: [
      { key: 'items_per_page', label: 'Items Per Page', type: 'number' },
      { key: 'theme_color', label: 'Theme Color', type: 'color' },
    ],
  };

  return (
    <>
      <div className="head-title">
        <div className="left">
          <h1>Settings</h1>
          <ul className="breadcrumb">
            <li><a className="active">PENSA TTU</a></li>
            <li><i className='bx bx-chevron-right'></i></li>
            <li><a>Settings</a></li>
          </ul>
        </div>
      </div>

      {error && <div className="error-msg">{error}</div>}
      {success && <div className="success-msg">{success}</div>}

      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        {settingSections.map(s => (
          <button key={s.key} className={`btn ${activeSection === s.key ? 'btn-primary' : 'btn-back'}`}
            onClick={() => setActiveSection(s.key)}>
            <i className={`bx ${s.icon}`}></i> {s.label}
          </button>
        ))}
      </div>

      <div className="card">
        <h3>{settingSections.find(s => s.key === activeSection)?.label} Settings</h3>
        <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {sectionSettings[activeSection]?.map(s => (
            <div key={s.key} className="form-group">
              <label>{s.label}</label>
              {s.type === 'textarea' ? (
                <textarea value={settings[s.key] || ''} onChange={e => handleChange(s.key, e.target.value)} />
              ) : s.type === 'color' ? (
                <input type="color" value={settings[s.key] || '#3C91E6'} onChange={e => handleChange(s.key, e.target.value)} />
              ) : (
                <input type={s.type} value={settings[s.key] || ''} onChange={e => handleChange(s.key, e.target.value)} />
              )}
              <button className="btn btn-primary" style={{ marginTop: 8, padding: '4px 12px', fontSize: 12 }}
                onClick={() => handleSave(s.key)}>Save</button>
            </div>
          ))}
        </div>

        {activeSection === 'sms' && (
          <div style={{ marginTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={handleTestSMS} disabled={testing === 'sms'}>
              {testing === 'sms' ? 'Testing...' : 'Test SMS'}
            </button>
            <button className="btn btn-back" onClick={handleCheckBalance} disabled={testing === 'balance'}>
              {testing === 'balance' ? 'Checking...' : 'Check Balance'}
            </button>
            {smsBalance !== null && <span style={{ alignSelf: 'center' }}>Balance: <strong>{smsBalance}</strong></span>}
          </div>
        )}

        {activeSection === 'ai' && (
          <div style={{ marginTop: 24 }}>
            <button className="btn btn-primary" onClick={handleTestAI} disabled={testing === 'ai'}>
              {testing === 'ai' ? 'Testing...' : 'Test AI Connection'}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
