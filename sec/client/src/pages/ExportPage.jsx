// ExportPage.jsx — Export data as CSV (ported from export_page.php)
import { useState } from 'react';
import { secApi } from '../api/secApi.js';

export default function ExportPage() {
  const [filter, setFilter] = useState('all');
  const [hall, setHall] = useState('');
  const [level, setLevel] = useState('');
  const [duration, setDuration] = useState('');

  const buildParams = () => {
    const params = new URLSearchParams({ format: 'csv' });
    if (filter !== 'all') {
      params.set('filter', filter);
      if (filter === 'hall' && hall) params.set('hall', hall);
      if (filter === 'level' && level) params.set('level', level);
      if (filter === 'duration' && duration) params.set('duration', duration);
    }
    return params.toString();
  };

  const handleExport = () => {
    const url = secApi.exportUrl(buildParams());
    // Open with auth token via fetch
    const token = sessionStorage.getItem('sec_admin_token');
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.blob())
      .then(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `members_export_${Date.now()}.csv`;
        a.click();
      });
  };

  const exportOptions = [
    { value: 'all', label: 'All Members', desc: 'Export every registered member' },
    { value: 'hall', label: 'By Hall', desc: 'Export members from a specific hall' },
    { value: 'level', label: 'By Level', desc: 'Export members at a specific education level' },
    { value: 'duration', label: 'By Program Duration', desc: 'Export HND, B-TECH, etc.' },
    { value: 'final', label: 'Final Year Students', desc: 'HND 300 + B-TECH 400' },
  ];

  return (
    <>
      <div className="head-title">
        <div className="left">
          <h1>Export Data</h1>
          <ul className="breadcrumb">
            <li><a className="active">PENSA TTU</a></li>
            <li><i className='bx bx-chevron-right'></i></li>
            <li><a>Export</a></li>
          </ul>
        </div>
      </div>

      <div className="card">
        <h3>Export Members as CSV</h3>
        <p style={{ color: 'var(--dark-grey)', marginBottom: 20 }}>Choose a filter and export member data as a CSV file (Excel-compatible).</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {exportOptions.map(opt => (
            <label key={opt.value} style={{
              display: 'block', padding: 16, borderRadius: 12, border: `2px solid ${filter === opt.value ? 'var(--blue)' : 'var(--grey)'}`,
              cursor: 'pointer', background: filter === opt.value ? 'var(--light-blue)' : 'var(--light)',
            }}>
              <input type="radio" name="filter" value={opt.value} checked={filter === opt.value}
                onChange={e => setFilter(e.target.value)} style={{ display: 'none' }} />
              <strong>{opt.label}</strong>
              <p style={{ fontSize: 13, color: 'var(--dark-grey)', marginTop: 4 }}>{opt.desc}</p>
            </label>
          ))}
        </div>

        {filter === 'hall' && (
          <div className="form-group" style={{ marginTop: 20 }}>
            <label>Hall Name</label>
            <input value={hall} onChange={e => setHall(e.target.value)} placeholder="e.g. Unity Hall" />
          </div>
        )}
        {filter === 'level' && (
          <div className="form-group" style={{ marginTop: 20 }}>
            <label>Education Level</label>
            <input value={level} onChange={e => setLevel(e.target.value)} placeholder="e.g. 100, 200" />
          </div>
        )}
        {filter === 'duration' && (
          <div className="form-group" style={{ marginTop: 20 }}>
            <label>Program Duration</label>
            <select value={duration} onChange={e => setDuration(e.target.value)}>
              <option value="">--</option>
              <option value="HND">HND</option>
              <option value="B-TECH">B-TECH</option>
              <option value="Diploma">Diploma</option>
              <option value="Certificate">Certificate</option>
            </select>
          </div>
        )}

        <button onClick={handleExport} className="btn btn-primary" style={{ marginTop: 20 }}>
          <i className='bx bx-download'></i> Download CSV
        </button>
      </div>
    </>
  );
}
