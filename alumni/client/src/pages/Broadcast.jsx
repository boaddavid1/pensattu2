// Broadcast.jsx — Upload CSV/Excel contacts, create groups, send/schedule SMS
import { useState, useEffect } from 'react';
import { alumniApi } from '../api/alumniApi.js';

export default function Broadcast() {
  const [groups, setGroups] = useState([]);
  const [scheduled, setScheduled] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [message, setMessage] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [sending, setSending] = useState(false);
  const [renameId, setRenameId] = useState(null);
  const [renameName, setRenameName] = useState('');

  const loadData = async () => {
    try {
      const [g, s] = await Promise.all([alumniApi.listContactGroups(), alumniApi.listScheduled()]);
      setGroups(g.groups);
      setScheduled(s.scheduled);
    } catch (err) { setError(err.message); }
  };

  useEffect(() => { loadData(); }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('group_name', file.name.replace(/\.[^.]+$/, ''));
      const data = await alumniApi.uploadContacts(formData);
      setSuccess(`Uploaded ${data.count} contacts`);
      loadData();
    } catch (err) { setError(err.message); }
    finally { setUploading(false); e.target.value = ''; }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!selectedGroup || !message.trim()) return;
    setSending(true);
    setError('');
    try {
      if (scheduleTime) {
        await alumniApi.scheduleBroadcast({ group_id: selectedGroup, message, schedule_time: scheduleTime });
        setSuccess('SMS scheduled successfully');
      } else {
        const data = await alumniApi.sendBroadcast({ group_id: selectedGroup, message });
        setSuccess(`Sent: ${data.sent} delivered, ${data.failed} failed`);
      }
      setMessage('');
      setScheduleTime('');
      loadData();
    } catch (err) { setError(err.message); }
    finally { setSending(false); }
  };

  const handleDeleteGroup = async (id) => {
    if (!confirm('Delete this contact group?')) return;
    try {
      await alumniApi.deleteContactGroup(id);
      loadData();
    } catch (err) { setError(err.message); }
  };

  const handleRename = async (id) => {
    try {
      await alumniApi.renameContactGroup(id, renameName);
      setRenameId(null);
      loadData();
    } catch (err) { setError(err.message); }
  };

  const handleCancelScheduled = async (id) => {
    if (!confirm('Cancel this scheduled message?')) return;
    try {
      await alumniApi.cancelScheduled(id);
      loadData();
    } catch (err) { setError(err.message); }
  };

  return (
    <>
      <div className="head-title">
        <div className="left">
          <h1>Broadcast</h1>
          <ul className="breadcrumb">
            <li><a className="active">PENSA TTU</a></li>
            <li><i className='bx bx-chevron-right'></i></li>
            <li><a>Broadcast</a></li>
          </ul>
        </div>
      </div>

      {error && <div className="error-msg">{error}</div>}
      {success && <div className="success-msg">{success}</div>}

      {/* Upload */}
      <div className="card">
        <h3><i className='bx bx-upload'></i> Upload Contact List</h3>
        <p style={{ color: 'var(--dark-grey)', marginBottom: 16 }}>Upload a CSV or Excel file with contacts. The file should have a column with phone numbers.</p>
        <input type="file" accept=".csv,.xlsx,.xls" onChange={handleUpload} disabled={uploading} />
        {uploading && <span style={{ marginLeft: 12, color: 'var(--blue)' }}>Uploading...</span>}
      </div>

      {/* Contact groups */}
      <div className="table-data">
        <div className="order">
          <div className="head"><h3>Contact Groups</h3></div>
          {groups.length === 0 ? (
            <div className="empty-state"><i className='bx bxs-group'></i><p>No contact groups yet</p></div>
          ) : (
            <table>
              <thead><tr><th>Group Name</th><th>Contacts</th><th>Created</th><th>Actions</th></tr></thead>
              <tbody>
                {groups.map(g => (
                  <tr key={g.id}>
                    <td>
                      {renameId === g.id ? (
                        <input value={renameName} onChange={e => setRenameName(e.target.value)}
                          onBlur={() => handleRename(g.id)} onKeyDown={e => e.key === 'Enter' && handleRename(g.id)} autoFocus />
                      ) : (
                        <span onClick={() => { setRenameId(g.id); setRenameName(g.group_name); }} style={{ cursor: 'pointer' }}>
                          {g.group_name}
                        </span>
                      )}
                    </td>
                    <td><span className="badge badge-blue">{g.contact_count}</span></td>
                    <td>{new Date(g.created_at).toLocaleDateString()}</td>
                    <td>
                      <button className="btn btn-primary" style={{ padding: '4px 10px', marginRight: 4 }}
                        onClick={() => setSelectedGroup(g.id)}>Select</button>
                      <button className="btn btn-danger" style={{ padding: '4px 10px' }}
                        onClick={() => handleDeleteGroup(g.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Send SMS */}
      <div className="card">
        <h3>Send Broadcast SMS</h3>
        {selectedGroup && <p style={{ color: 'var(--blue)', marginBottom: 12 }}>Selected group: {groups.find(g => g.id === selectedGroup)?.group_name}</p>}
        <form onSubmit={handleSend}>
          <div className="form-group">
            <label>Message</label>
            <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4} maxLength={480}
              placeholder="Type your broadcast message..." required />
            <small style={{ color: 'var(--dark-grey)' }}>{message.length}/480 characters</small>
          </div>
          <div className="form-group">
            <label>Schedule (optional — leave empty to send now)</label>
            <input type="datetime-local" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={sending || !selectedGroup}>
            {sending ? 'Sending...' : scheduleTime ? <><i className='bx bx-time'></i> Schedule</> : <><i className='bx bxs-send'></i> Send Now</>}
          </button>
        </form>
      </div>

      {/* Scheduled messages */}
      {scheduled.length > 0 && (
        <div className="table-data">
          <div className="order">
            <div className="head"><h3>Scheduled Messages</h3></div>
            <table>
              <thead><tr><th>Message</th><th>Recipients</th><th>Scheduled For</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {scheduled.map(s => (
                  <tr key={s.id}>
                    <td style={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.message}</td>
                    <td>{s.recipient_count}</td>
                    <td>{new Date(s.scheduled_at).toLocaleString()}</td>
                    <td><span className={`badge ${s.status === 'sent' ? 'badge-green' : 'badge-yellow'}`}>{s.status}</span></td>
                    <td>{s.status === 'pending' && <button className="btn btn-danger" style={{ padding: '4px 10px' }} onClick={() => handleCancelScheduled(s.id)}>Cancel</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
