// Attendance.jsx — Attendance tracking with sessions, check-in, visitors, AI (ported from attendance.php)
import { useState, useEffect } from 'react';
import { secApi } from '../api/secApi.js';

export default function Attendance() {
  const [sessions, setSessions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [newSession, setNewSession] = useState({ session_name: '', session_date: '', session_type: 'sunday', description: '' });
  const [checkinSearch, setCheckinSearch] = useState('');
  const [visitor, setVisitor] = useState({ name: '', contact: '', invited_by: '' });

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const data = await secApi.listSessions();
      setSessions(data.sessions);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const selectSession = async (id) => {
    try {
      const data = await secApi.getSession(id);
      setSelected(data);
    } catch (err) { setError(err.message); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await secApi.createSession(newSession);
      setShowCreate(false);
      setNewSession({ session_name: '', session_date: '', session_type: 'sunday', description: '' });
      loadSessions();
    } catch (err) { setError(err.message); }
  };

  const handleCheckin = async (regId) => {
    if (!regId || !selected) return;
    try {
      await secApi.checkin(selected.session.id, parseInt(regId));
      selectSession(selected.session.id);
    } catch (err) { setError(err.message); }
  };

  const handleAddVisitor = async (e) => {
    e.preventDefault();
    if (!selected) return;
    try {
      await secApi.addVisitor(selected.session.id, visitor);
      setVisitor({ name: '', contact: '', invited_by: '' });
      selectSession(selected.session.id);
    } catch (err) { setError(err.message); }
  };

  const handleAI = async (e) => {
    e.preventDefault();
    try {
      const data = await secApi.aiQuery(aiQuery);
      setAiAnswer(data.answer);
    } catch (err) { setError(err.message); }
  };

  return (
    <>
      <div className="head-title">
        <div className="left">
          <h1>Attendance</h1>
          <ul className="breadcrumb">
            <li><a className="active">PENSA TTU</a></li>
            <li><i className='bx bx-chevron-right'></i></li>
            <li><a>Attendance</a></li>
          </ul>
        </div>
        <button className="btn-download" onClick={() => setShowCreate(true)}>
          <i className='bx bx-plus'></i> New Session
        </button>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {/* AI Assistant */}
      <div className="card">
        <h3><i className='bx bxs-bot'></i> Attendance AI Assistant</h3>
        <form onSubmit={handleAI} style={{ display: 'flex', gap: 12, marginTop: 16 }}>
          <input type="text" placeholder="Ask: How many members? Total visitors? Next service?" value={aiQuery}
            onChange={e => setAiQuery(e.target.value)} style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid var(--input-border-color)' }} />
          <button type="submit" className="btn btn-primary">Ask</button>
        </form>
        {aiAnswer && <div className="success-msg" style={{ marginTop: 16 }}>{aiAnswer}</div>}
      </div>

      {/* Sessions list */}
      <div className="table-data">
        <div className="order">
          <div className="head"><h3>Sessions</h3></div>
          {loading ? <div className="loading">Loading...</div> : sessions.length === 0 ? (
            <div className="empty-state"><i className='bx bxs-calendar'></i><p>No sessions yet</p></div>
          ) : (
            <table>
              <thead><tr><th>Name</th><th>Date</th><th>Type</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {sessions.map(s => (
                  <tr key={s.id}>
                    <td>{s.session_name}</td>
                    <td>{new Date(s.session_date).toLocaleDateString()}</td>
                    <td>{s.session_type}</td>
                    <td><span className={`badge ${s.status === 'completed' ? 'badge-green' : s.status === 'ongoing' ? 'badge-blue' : 'badge-yellow'}`}>{s.status}</span></td>
                    <td><button className="btn btn-primary" onClick={() => selectSession(s.id)}>View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Selected session details */}
      {selected && (
        <div className="table-data">
          <div className="order">
            <div className="head"><h3>{selected.session.session_name} — {new Date(selected.session.session_date).toLocaleDateString()}</h3></div>
            <p style={{ marginBottom: 16 }}>Total attendance: <strong>{selected.count}</strong> ({selected.records.length} members + {selected.visitors.length} visitors)</p>

            <h4>Members Checked In</h4>
            <table style={{ marginTop: 12 }}>
              <thead><tr><th>Name</th><th>Contact</th><th>Time</th></tr></thead>
              <tbody>
                {selected.records.length === 0 ? <tr><td colSpan="3" style={{ color: 'var(--dark-grey)' }}>No members checked in</td></tr> :
                  selected.records.map(r => (
                    <tr key={r.id}><td>{r.surname} {r.othernames}</td><td>{r.contact || '-'}</td><td>{new Date(r.check_in_time).toLocaleTimeString()}</td></tr>
                  ))}
              </tbody>
            </table>

            <h4 style={{ marginTop: 20 }}>Quick Check-in (by Member ID)</h4>
            <form onSubmit={e => { e.preventDefault(); handleCheckin(checkinSearch); }} style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <input type="number" placeholder="Member ID" value={checkinSearch} onChange={e => setCheckinSearch(e.target.value)} style={{ padding: '8px', borderRadius: 8, border: '1px solid var(--input-border-color)' }} />
              <button type="submit" className="btn btn-success">Check In</button>
            </form>

            <h4 style={{ marginTop: 20 }}>Visitors</h4>
            <table style={{ marginTop: 12 }}>
              <thead><tr><th>Name</th><th>Contact</th><th>Invited By</th></tr></thead>
              <tbody>
                {selected.visitors.length === 0 ? <tr><td colSpan="3" style={{ color: 'var(--dark-grey)' }}>No visitors</td></tr> :
                  selected.visitors.map(v => <tr key={v.id}><td>{v.name}</td><td>{v.contact || '-'}</td><td>{v.invited_by || '-'}</td></tr>)}
              </tbody>
            </table>

            <form onSubmit={handleAddVisitor} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginTop: 16 }}>
              <input placeholder="Visitor name" value={visitor.name} onChange={e => setVisitor(v => ({ ...v, name: e.target.value }))} required style={{ padding: '8px', borderRadius: 8, border: '1px solid var(--input-border-color)' }} />
              <input placeholder="Contact" value={visitor.contact} onChange={e => setVisitor(v => ({ ...v, contact: e.target.value }))} style={{ padding: '8px', borderRadius: 8, border: '1px solid var(--input-border-color)' }} />
              <input placeholder="Invited by" value={visitor.invited_by} onChange={e => setVisitor(v => ({ ...v, invited_by: e.target.value }))} style={{ padding: '8px', borderRadius: 8, border: '1px solid var(--input-border-color)' }} />
              <button type="submit" className="btn btn-primary">Add Visitor</button>
            </form>
          </div>
        </div>
      )}

      {/* Create session modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>New Attendance Session</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group"><label>Session Name</label><input value={newSession.session_name} onChange={e => setNewSession(s => ({ ...s, session_name: e.target.value }))} required /></div>
              <div className="form-group"><label>Date</label><input type="date" value={newSession.session_date} onChange={e => setNewSession(s => ({ ...s, session_date: e.target.value }))} required /></div>
              <div className="form-group"><label>Type</label>
                <select value={newSession.session_type} onChange={e => setNewSession(s => ({ ...s, session_type: e.target.value }))}>
                  <option value="sunday">Sunday</option><option value="tuesday">Tuesday</option><option value="friday">Friday</option><option value="special">Special</option><option value="other">Other</option>
                </select>
              </div>
              <div className="form-group"><label>Description</label><textarea value={newSession.description} onChange={e => setNewSession(s => ({ ...s, description: e.target.value }))} /></div>
              <div className="modal-actions">
                <button type="button" className="btn btn-back" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
