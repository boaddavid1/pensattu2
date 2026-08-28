import { useEffect, useState } from 'react';
import { adminApi } from './adminApi';

const PAGE_SIZE = 25;

export default function AdminRegistrations() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [membership, setMembership] = useState('');
  const [gender, setGender] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [selected, setSelected] = useState(null); // full record

  useEffect(() => { loadStats(); }, []);
  useEffect(() => { loadList(); }, [page, search, membership, gender]);

  async function loadList() {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page, limit: PAGE_SIZE });
      if (search) params.set('search', search);
      if (membership) params.set('membership_type', membership);
      if (gender) params.set('gender', gender);
      const data = await adminApi.regList(params.toString());
      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadStats() {
    try { setStats(await adminApi.regStats()); } catch { /* ignore */ }
  }

  async function remove(id) {
    if (!window.confirm('Delete this registration? This cannot be undone.')) return;
    try {
      await adminApi.regRemove(id);
      if (selected?.id === id) setSelected(null);
      await loadList();
      await loadStats();
    } catch (err) {
      setError(err.message);
    }
  }

  async function view(id) {
    try {
      const data = await adminApi.regGet(id);
      setSelected(data);
    } catch (err) {
      setError(err.message);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="admin-readonly-header">
        <div>
          <h2>Registrations</h2>
          <p className="admin-intro">{total} registration{total !== 1 ? 's' : ''}</p>
        </div>
        <button className="admin-refresh" onClick={() => { loadList(); loadStats(); }} disabled={loading}>Refresh</button>
      </div>

      {stats && (
        <div className="admin-card" style={{ padding: 16, marginBottom: 16, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <Stat label="Total" value={stats.total} />
          <Stat label="Members" value={stats.membership?.member || 0} />
          <Stat label="Associates" value={stats.membership?.associate || 0} />
          <Stat label="Male" value={stats.gender?.male || 0} />
          <Stat label="Female" value={stats.gender?.female || 0} />
        </div>
      )}

      {error && <div className="admin-error">{error}</div>}

      <div className="admin-card" style={{ padding: 12, marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          className="admin-input"
          placeholder="Search name, contact, program..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          style={{ flex: 1, minWidth: 200 }}
        />
        <select className="admin-input" value={membership} onChange={(e) => { setMembership(e.target.value); setPage(1); }}>
          <option value="">All types</option>
          <option value="member">Member</option>
          <option value="associate">Associate</option>
        </select>
        <select className="admin-input" value={gender} onChange={(e) => { setGender(e.target.value); setPage(1); }}>
          <option value="">All genders</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </div>

      {loading ? (
        <div className="admin-loading">Loading...</div>
      ) : (
        <div className="admin-table-wrap admin-card">
          {items.length === 0 ? (
            <p className="admin-empty">No registrations yet.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th><th>Contact</th><th>Gender</th><th>Program</th><th>Level</th><th>Type</th><th>Created</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((r) => (
                  <tr key={r.id}>
                    <td>{r.surname} {r.othernames}</td>
                    <td>{r.contact}</td>
                    <td>{r.gender}</td>
                    <td>{r.program}</td>
                    <td>{r.education_level}</td>
                    <td>{r.membership_type}</td>
                    <td>{r.created_at ? new Date(r.created_at).toLocaleDateString() : ''}</td>
                    <td className="admin-actions-col">
                      <button className="admin-edit" onClick={() => view(r.id)}>View</button>
                      <button className="admin-delete" onClick={() => remove(r.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {totalPages > 1 && (
        <div className="admin-pager" style={{ marginTop: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="admin-refresh" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
          <span>Page {page} of {totalPages}</span>
          <button className="admin-refresh" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next →</button>
        </div>
      )}

      {selected && (
        <div className="admin-modal-backdrop" onClick={() => setSelected(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-head">
              <h3>{selected.surname} {selected.othernames}</h3>
              <button className="admin-modal-close" onClick={() => setSelected(null)}>×</button>
            </div>
            <div className="admin-modal-body">
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                {selected.photo_data && (
                  <img src={selected.photo_data} alt="Member" style={{ width: 140, height: 160, objectFit: 'cover', borderRadius: 8, border: '1px solid #ddd' }} />
                )}
                <div style={{ flex: 1, minWidth: 240 }}>
                  <Row label="Gender" value={selected.gender} />
                  <Row label="Date of Birth" value={selected.dob} />
                  <Row label="Contact" value={selected.contact} />
                  <Row label="Membership" value={selected.membership_type} />
                  <Row label="Program" value={selected.program} />
                  <Row label="Education Level" value={selected.education_level} />
                  <Row label="Program Duration" value={selected.program_duration} />
                  <Row label="Campus Residence" value={selected.campus_residence} />
                  <Row label="Residence" value={selected.campus_residence === 'yes' ? selected.campus_hall : selected.offcampus_location} />
                  <Row label="Room" value={selected.campus_residence === 'yes' ? selected.room_campus : selected.room_offcampus} />
                  <Row label="Landmark" value={selected.landmark} />
                  <Row label="District" value={selected.district} />
                  <Row label="District Pastor" value={selected.pastor} />
                  <Row label="Guardian" value={selected.guardian} />
                  <Row label="Guardian Contact" value={selected.guardian_contact} />
                  <Row label="Church Officer" value={selected.is_officer ? `Yes${selected.officer_role ? ' (' + selected.officer_role + ')' : ''}` : 'No'} />
                  <Row label="Departments" value={Array.isArray(selected.departments) ? selected.departments.join(', ') : ''} />
                  <Row label="Created" value={selected.created_at ? new Date(selected.created_at).toLocaleString() : ''} />
                </div>
              </div>
            </div>
            <div className="admin-modal-foot">
              <button className="admin-delete" onClick={() => remove(selected.id)}>Delete</button>
              <button className="admin-refresh" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 22, fontWeight: 700, color: '#13357e' }}>{value}</div>
      <div style={{ fontSize: 12, color: '#666', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', gap: 8, padding: '4px 0', borderBottom: '1px solid #f0f0f0' }}>
      <span style={{ fontWeight: 600, color: '#13357e', minWidth: 150 }}>{label}:</span>
      <span>{value || '—'}</span>
    </div>
  );
}
