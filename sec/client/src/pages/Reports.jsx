// Reports.jsx — Report generation (ported from reports.php)
import { useState, useEffect } from 'react';
import { secApi } from '../api/secApi.js';

export default function Reports() {
  const [type, setType] = useState('membership');
  const [from, setFrom] = useState(new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10));
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams({ type, from, to });
    secApi.reports(params.toString()).then(setData).catch(err => setError(err.message));
  }, [type, from, to]);

  const reportTypes = [
    { value: 'membership', label: 'Membership' },
    { value: 'gender', label: 'Gender Distribution' },
    { value: 'hall', label: 'Hall Distribution' },
    { value: 'officers', label: 'Church Officers' },
    { value: 'attendance', label: 'Attendance' },
    { value: 'registration_trend', label: 'Registration Trend' },
  ];

  return (
    <>
      <div className="head-title">
        <div className="left">
          <h1>Reports</h1>
          <ul className="breadcrumb">
            <li><a className="active">PENSA TTU</a></li>
            <li><i className='bx bx-chevron-right'></i></li>
            <li><a>Reports</a></li>
          </ul>
        </div>
      </div>

      {error && <div className="error-msg">{error}</div>}

      <div className="card">
        <div className="filter-bar">
          <select value={type} onChange={e => setType(e.target.value)}>
            {reportTypes.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          {(type === 'attendance' || type === 'registration_trend') && (
            <>
              <input type="date" value={from} onChange={e => setFrom(e.target.value)} />
              <input type="date" value={to} onChange={e => setTo(e.target.value)} />
            </>
          )}
        </div>
      </div>

      {data && (
        <div className="table-data">
          <div className="order">
            <div className="head"><h3>{data.title}</h3></div>
            {data.data.length === 0 ? (
              <div className="empty-state"><i className='bx bxs-report'></i><p>No data for this report</p></div>
            ) : type === 'registration_trend' ? (
              <table>
                <thead><tr><th>Date</th><th>Count</th></tr></thead>
                <tbody>
                  {data.data.map((r, i) => <tr key={i}><td>{r.date}</td><td><span className="badge badge-blue">{r.count}</span></td></tr>)}
                </tbody>
              </table>
            ) : type === 'attendance' ? (
              <table>
                <thead><tr><th>Session</th><th>Date</th><th>Type</th><th>Attendance</th></tr></thead>
                <tbody>
                  {data.data.map((s, i) => (
                    <tr key={i}><td>{s.session_name}</td><td>{new Date(s.session_date).toLocaleDateString()}</td><td>{s.session_type}</td><td><span className="badge badge-green">{s.attendance_count}</span></td></tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table>
                <thead><tr><th>Label</th><th>Count</th><th>Percentage</th></tr></thead>
                <tbody>
                  {data.data.map((r, i) => (
                    <tr key={i}><td>{r.label}</td><td><span className="badge badge-blue">{r.count}</span></td><td>{r.pct}%</td></tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </>
  );
}
