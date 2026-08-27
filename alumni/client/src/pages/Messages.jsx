// Messages.jsx — Send SMS to alumni with AI message generator
import { useState, useEffect } from 'react';
import { alumniApi } from '../api/alumniApi.js';

export default function Messages() {
  const [message, setMessage] = useState('');
  const [recipientGroup, setRecipientGroup] = useState('all');
  const [year, setYear] = useState('');
  const [logs, setLogs] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiTone, setAiTone] = useState('professional');
  const [aiOccasion, setAiOccasion] = useState('update');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    alumniApi.messageLogs('perPage=50').then(data => setLogs(data.logs)).catch(err => setError(err.message));
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    setError('');
    setResult(null);
    try {
      const data = await alumniApi.sendMessage({ message, recipient_group: recipientGroup, year });
      setResult(data);
      setMessage('');
      const logsData = await alumniApi.messageLogs('perPage=50');
      setLogs(logsData.logs);
    } catch (err) { setError(err.message); }
    finally { setSending(false); }
  };

  const handleAIGenerate = async (e) => {
    e.preventDefault();
    setAiLoading(true);
    setError('');
    try {
      const data = await alumniApi.generateAIMessage({ prompt: aiPrompt, tone: aiTone, occasion: aiOccasion });
      setMessage(data.message);
    } catch (err) { setError(err.message); }
    finally { setAiLoading(false); }
  };

  return (
    <>
      <div className="head-title">
        <div className="left">
          <h1>Messages</h1>
          <ul className="breadcrumb">
            <li><a className="active">PENSA TTU</a></li>
            <li><i className='bx bx-chevron-right'></i></li>
            <li><a>Messages</a></li>
          </ul>
        </div>
      </div>

      {error && <div className="error-msg">{error}</div>}
      {result && (
        <div className="success-msg">
          SMS sent: {result.sent} delivered, {result.failed} failed, {result.total} total.
        </div>
      )}

      {/* AI Message Generator */}
      <div className="card">
        <h3><i className='bx bxs-bot'></i> AI Message Generator</h3>
        <form onSubmit={handleAIGenerate} style={{ marginTop: 16 }}>
          <div className="form-group">
            <label>What is the message about?</label>
            <input type="text" value={aiPrompt} onChange={e => setAiPrompt(e.target.value)}
              placeholder="e.g. Alumni reunion next month" />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Tone</label>
              <select value={aiTone} onChange={e => setAiTone(e.target.value)}>
                <option value="professional">Professional</option>
                <option value="friendly">Friendly</option>
                <option value="formal">Formal</option>
                <option value="casual">Casual</option>
              </select>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Occasion</label>
              <select value={aiOccasion} onChange={e => setAiOccasion(e.target.value)}>
                <option value="update">General Update</option>
                <option value="reunion">Reunion</option>
                <option value="homecoming">Homecoming</option>
                <option value="donation">Donation Appeal</option>
                <option value="thanks">Thank You</option>
                <option value="event">Event Invitation</option>
                <option value="prayer">Prayer Meeting</option>
                <option value="news">News</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={aiLoading}>
            {aiLoading ? 'Generating...' : <><i className='bx bxs-magic'></i> Generate Message</>}
          </button>
        </form>
      </div>

      {/* Send SMS */}
      <div className="card">
        <h3>Send Bulk SMS</h3>
        <form onSubmit={handleSend}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Recipients</label>
              <select value={recipientGroup} onChange={e => setRecipientGroup(e.target.value)}>
                <option value="all">All Alumni</option>
                <option value="year">By Graduation Year</option>
              </select>
            </div>
            {recipientGroup === 'year' && (
              <div className="form-group" style={{ flex: 1 }}>
                <label>Year</label>
                <input type="number" value={year} onChange={e => setYear(e.target.value)} placeholder="e.g. 2024" />
              </div>
            )}
          </div>
          <div className="form-group">
            <label>Message</label>
            <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4} maxLength={480}
              placeholder="Type your SMS message..." required />
            <small style={{ color: 'var(--dark-grey)' }}>{message.length}/480 characters</small>
          </div>
          <button type="submit" className="btn btn-primary" disabled={sending}>
            {sending ? 'Sending...' : <><i className='bx bxs-send'></i> Send SMS</>}
          </button>
        </form>
      </div>

      {/* SMS History */}
      <div className="table-data">
        <div className="order">
          <div className="head"><h3>SMS History</h3></div>
          {logs.length === 0 ? (
            <div className="empty-state"><i className='bx bxs-message'></i><p>No messages sent yet</p></div>
          ) : (
            <table>
              <thead><tr><th>Recipient</th><th>Message</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                {logs.map(l => (
                  <tr key={l.id}>
                    <td>{l.recipient}</td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.message}</td>
                    <td><span className={`badge ${l.status === 'sent' ? 'badge-green' : 'badge-red'}`}>{l.status}</span></td>
                    <td>{new Date(l.sent_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
