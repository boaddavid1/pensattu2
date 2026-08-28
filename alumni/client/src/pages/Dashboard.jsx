// Dashboard.jsx — Alumni dashboard with year grouping, stats, CRUD, import, export
import { useState, useEffect, useCallback } from 'react';
import { alumniApi } from '../api/alumniApi.js';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

const COLORS = ['#3c91e6', '#f5a623', '#27ae60', '#e74c3c', '#9b59b6', '#1abc9c'];

export default function Dashboard() {
  const [yearStats, setYearStats] = useState([]);
  const [totalStats, setTotalStats] = useState({ total: 0, males: 0, females: 0 });
  const [selectedYear, setSelectedYear] = useState(null);
  const [yearAlumni, setYearAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editAlumni, setEditAlumni] = useState(null);
  const [showDelete, setShowDelete] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [search, setSearch] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await alumniApi.dashboard();
      setYearStats(data.yearStats);
      setTotalStats(data.totalStats);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const loadYear = async (year) => {
    setSelectedYear(year);
    setSelectedIds(new Set());
    try {
      const data = await alumniApi.alumniByYear(year);
      setYearAlumni(data.alumni);
    } catch (err) { setError(err.message); }
  };

  const handleAdd = async (formData) => {
    try {
      await alumniApi.createAlumni(formData);
      setShowAdd(false);
      loadData();
      if (selectedYear) loadYear(selectedYear);
    } catch (err) { setError(err.message); }
  };

  const handleUpdate = async (formData) => {
    try {
      await alumniApi.updateAlumni(editAlumni.id, formData);
      setEditAlumni(null);
      if (selectedYear) loadYear(selectedYear);
      loadData();
    } catch (err) { setError(err.message); }
  };

  const handleDelete = async (id) => {
    try {
      await alumniApi.deleteAlumni(id);
      setShowDelete(null);
      if (selectedYear) loadYear(selectedYear);
      loadData();
    } catch (err) { setError(err.message); }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedIds.size} alumni?`)) return;
    try {
      await alumniApi.bulkDeleteAlumni([...selectedIds]);
      setSelectedIds(new Set());
      if (selectedYear) loadYear(selectedYear);
      loadData();
    } catch (err) { setError(err.message); }
  };

  const handleExport = (year) => {
    const token = localStorage.getItem('alumni_admin_token');
    fetch(alumniApi.exportAlumni(year), { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.blob())
      .then(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = year ? `class_of_${year}.csv` : `all_alumni.csv`;
        a.click();
      });
  };

  const toggleSelect = (id) => {
    const next = new Set(selectedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedIds(next);
  };

  const filteredAlumni = selectedYear
    ? yearAlumni.filter(a => !search || `${a.surname} ${a.othernames}`.toLowerCase().includes(search.toLowerCase()) || (a.contact || '').includes(search))
    : [];

  const genderData = [
    { name: 'Male', value: totalStats.males || 0 },
    { name: 'Female', value: totalStats.females || 0 },
  ];
  const yearChartData = yearStats.map(y => ({ name: y.graduation_year || 'Unknown', count: y.count, males: y.males, females: y.females }));

  return (
    <>
      <div className="head-title">
        <div className="left">
          <h1>Alumni Dashboard</h1>
          <ul className="breadcrumb">
            <li><a className="active">PENSA TTU</a></li>
            <li><i className='bx bx-chevron-right'></i></li>
            <li><a>Alumni</a></li>
          </ul>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn-download" onClick={() => handleExport(selectedYear || 'all')}>
            <i className='bx bx-download'></i> Export CSV
          </button>
          <button className="btn-download" onClick={() => setShowAdd(true)}>
            <i className='bx bxs-user-plus'></i> Add Alumni
          </button>
        </div>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {/* Total stats */}
      <ul className="box-info">
        <li>
          <i className='bx bxs-group'></i>
          <span className="text"><h3>{totalStats.total}</h3><p>Total Alumni</p></span>
        </li>
        <li>
          <i className='bx bxs-user' style={{ background: 'var(--light-blue)', color: 'var(--blue)' }}></i>
          <span className="text"><h3>{totalStats.males}</h3><p>Males</p></span>
        </li>
        <li>
          <i className='bx bxs-user' style={{ background: 'var(--light-orange)', color: 'var(--orange)' }}></i>
          <span className="text"><h3>{totalStats.females}</h3><p>Females</p></span>
        </li>
      </ul>

      {/* Charts */}
      <div className="table-data" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>
        <div className="order" style={{ padding: 24 }}>
          <div className="head"><h3>Gender Distribution</h3></div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={genderData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={4} dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}>
                <Cell fill="#3c91e6" />
                <Cell fill="#f5a623" />
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="order" style={{ padding: 24 }}>
          <div className="head"><h3>Alumni by Graduation Year</h3></div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={yearChartData} margin={{ top: 20, right: 20, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--grey)" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" name="Alumni" radius={[8, 8, 0, 0]}>
                {yearChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Year cards */}
      <div className="head-title" style={{ marginTop: 36 }}>
        <div className="left"><h2>Graduation Years</h2></div>
      </div>
      {loading ? <div className="loading">Loading...</div> : yearStats.length === 0 ? (
        <div className="empty-state"><i className='bx bxs-graduation'></i><p>No alumni records yet</p></div>
      ) : (
        <div className="box-info" style={{ marginTop: 12 }}>
          {yearStats.map((y, i) => {
            const colors = COLORS[i % COLORS.length];
            return (
              <li key={y.graduation_year} style={{ listStyle: 'none', cursor: 'pointer', transition: '0.3s',
                border: selectedYear === y.graduation_year ? `2px solid ${colors}` : '2px solid transparent' }}
                onClick={() => loadYear(y.graduation_year)}>
                <i className='bx bxs-graduation' style={{ background: `${colors}22`, color: colors, width: 60, height: 60, borderRadius: 10, fontSize: 28, display: 'flex', justifyContent: 'center', alignItems: 'center' }}></i>
                <span className="text">
                  <h3>{y.count}</h3>
                  <p>Class of {y.graduation_year}</p>
                  <p style={{ fontSize: 12, color: 'var(--dark-grey)' }}>{y.males}M / {y.females}F</p>
                </span>
              </li>
            );
          })}
        </div>
      )}

      {/* Selected year alumni table */}
      {selectedYear && (
        <div className="table-data" style={{ marginTop: 24 }}>
          <div className="order">
            <div className="head">
              <h3>Class of {selectedYear} ({filteredAlumni.length})</h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
                  style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--grey)' }} />
                {selectedIds.size > 0 && (
                  <button className="btn btn-danger" onClick={handleBulkDelete}>
                    Delete ({selectedIds.size})
                  </button>
                )}
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th><input type="checkbox" onChange={(e) => {
                    if (e.target.checked) setSelectedIds(new Set(filteredAlumni.map(a => a.id)));
                    else setSelectedIds(new Set());
                  }} /></th>
                  <th>Name</th>
                  <th>Gender</th>
                  <th>Contact</th>
                  <th>Program</th>
                  <th>Level</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAlumni.length === 0 ? (
                  <tr><td colSpan="8" style={{ textAlign: 'center', color: 'var(--dark-grey)' }}>No alumni found</td></tr>
                ) : filteredAlumni.map(a => (
                  <tr key={a.id}>
                    <td><input type="checkbox" checked={selectedIds.has(a.id)} onChange={() => toggleSelect(a.id)} /></td>
                    <td>
                      {a.profile_image && <img src={a.profile_image} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', marginRight: 6 }} />}
                      {a.surname} {a.othernames}
                    </td>
                    <td>{a.gender}</td>
                    <td>{a.contact || '-'}</td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.program || '-'}</td>
                    <td>{a.education_level || '-'}</td>
                    <td><span className={`badge ${a.alumni_status === 'active' ? 'badge-green' : 'badge-yellow'}`}>{a.alumni_status}</span></td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <button className="btn btn-warning" style={{ padding: '4px 10px', marginRight: 4 }} onClick={() => setEditAlumni(a)}>Edit</button>
                      <button className="btn btn-danger" style={{ padding: '4px 10px' }} onClick={() => setShowDelete(a)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit modal */}
      {(showAdd || editAlumni) && (
        <AlumniForm
          alumni={editAlumni}
          onSubmit={editAlumni ? handleUpdate : handleAdd}
          onClose={() => { setShowAdd(false); setEditAlumni(null); }}
        />
      )}

      {/* Delete confirm */}
      {showDelete && (
        <div className="modal-overlay" onClick={() => setShowDelete(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Delete Alumni</h2>
            <p>Delete <strong>{showDelete.surname} {showDelete.othernames}</strong>?</p>
            <div className="modal-actions">
              <button className="btn btn-back" onClick={() => setShowDelete(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(showDelete.id)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Reusable alumni form component
function AlumniForm({ alumni, onSubmit, onClose }) {
  const [form, setForm] = useState(alumni || {
    surname: '', othernames: '', gender: 'male', dob: '2000-01-01', contact: '',
    program: '', education_level: '', graduation_year: new Date().getFullYear(), graduation_level: '', alumni_status: 'active',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
        <h2>{alumni ? 'Edit Alumni' : 'Add Alumni'}</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group"><label>Surname *</label><input name="surname" value={form.surname} onChange={handleChange} required /></div>
            <div className="form-group"><label>Other Names</label><input name="othernames" value={form.othernames || ''} onChange={handleChange} /></div>
            <div className="form-group"><label>Gender</label>
              <select name="gender" value={form.gender || 'male'} onChange={handleChange}>
                <option value="male">Male</option><option value="female">Female</option>
              </select>
            </div>
            <div className="form-group"><label>Date of Birth</label><input type="date" name="dob" value={form.dob ? form.dob.slice(0, 10) : ''} onChange={handleChange} /></div>
            <div className="form-group"><label>Contact</label><input name="contact" value={form.contact || ''} onChange={handleChange} /></div>
            <div className="form-group"><label>Program</label><input name="program" value={form.program || ''} onChange={handleChange} /></div>
            <div className="form-group"><label>Education Level</label><input name="education_level" value={form.education_level || ''} onChange={handleChange} /></div>
            <div className="form-group"><label>Graduation Year</label><input type="number" name="graduation_year" value={form.graduation_year || ''} onChange={handleChange} /></div>
            <div className="form-group"><label>Graduation Level</label><input name="graduation_level" value={form.graduation_level || ''} onChange={handleChange} /></div>
            <div className="form-group"><label>Status</label>
              <select name="alumni_status" value={form.alumni_status || 'active'} onChange={handleChange}>
                <option value="active">Active</option><option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-back" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{alumni ? 'Update' : 'Add'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
