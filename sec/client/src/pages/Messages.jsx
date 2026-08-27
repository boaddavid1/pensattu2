// Messages.jsx — Bulk SMS messaging (ported from messages.php)
import { useState, useEffect } from 'react';
import { secApi } from '../api/secApi.js';

export default function Messages() {
  const [message, setMessage] = useState('');
  const [recipientGroup, setRecipientGroup] = useState('all');
  const [logs, setLogs] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    secApi.messageLogs().then(data => setLogs(data.logs)).catch(err => setError(err.message));
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    setError('');
    setResult(null);
    try {
      const data = await secApi.sendMessage({ message, recipient_group: recipientGroup });
      setResult(data);
      setMessage('');
      const logsData = await secApi.messageLogs();
      setLogs(logsData.logs);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
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
          SMS sent: {result.sent} delivered, {result.failed} failed, {result.total} total recipients.
        </div>
      )}

      <div className="card">
        <h3>Send Bulk SMS</h3>
        <form onSubmit={handleSend}>
          <div className="form-group">
            <label>Recipient Group</label>
            <select value={recipientGroup} onChange={e => setRecipientGroup(e.target.value)}>
              <option value="all">All Members</option>
              <option value="members">Members Only</option>
              <option value="officers">Officers Only</option>
            </select>
          </div>
          <div className="form-group">
            <label>Message</label>
            <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4} maxLength={500}
              placeholder="Type your message here..." required />
            <small style={{ color: 'var(--dark-grey)' }}>{message.length}/500 characters</small>
          </div>
          <button type="submit" className="btn btn-primary" disabled={sending}>
            {sending ? 'Sending...' : <><i className='bx bxs-send'></i> Send SMS</>}
          </button>
        </form>
      </div>

      <div className="table-data">
        <div className="order">
          <div className="head"><h3>SMS History</h3></div>
          {logs.length === 0 ? (
            <div className="empty-state"><i className='bx bxs-message'></i><p>No messages sent yet</p></div>
          ) : (
            <table>
              <thead><tr><th>Recipient</th><th>Message</th><th>Status</th><th>Sent By</th><th>Date</th></tr></thead>
              <tbody>
                {logs.map(l => (
                  <tr key={l.id}>
                    <td style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.recipient}</td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.message}</td>
                    <td><span className={`badge ${l.status === 'sent' ? 'badge-green' : l.status === 'failed' ? 'badge-red' : 'badge-yellow'}`}>{l.status}</span></td>
                    <td>{l.sent_by || '-'}</td>
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
