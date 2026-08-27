// Halls.jsx — Members grouped by hall/residence (ported from halls.php)
import { useState, useEffect } from 'react';
import { secApi } from '../api/secApi.js';

export default function Halls() {
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    secApi.halls().then(data => { setHalls(data.halls); setLoading(false); }).catch(err => { setError(err.message); setLoading(false); });
  }, []);

  if (loading) return <div className="loading">Loading halls...</div>;
  if (error) return <div className="error-msg">{error}</div>;

  return (
    <>
      <div className="head-title">
        <div className="left">
          <h1>Halls</h1>
          <ul className="breadcrumb">
            <li><a className="active">PENSA TTU</a></li>
            <li><i className='bx bx-chevron-right'></i></li>
            <li><a>Halls</a></li>
          </ul>
        </div>
      </div>

      <div className="box-info">
        {halls.map((h, i) => (
          <li key={h.hall} style={{ cursor: 'pointer' }} onClick={() => setExpanded(expanded === h.hall ? null : h.hall)}>
            <i className='bx bx-building' style={{
              background: i % 3 === 0 ? 'var(--light-blue)' : i % 3 === 1 ? 'var(--light-yellow)' : 'var(--light-orange)',
              color: i % 3 === 0 ? 'var(--blue)' : i % 3 === 1 ? 'var(--yellow)' : 'var(--orange)',
            }}></i>
            <span className="text">
              <h3>{h.count}</h3>
              <p>{h.hall}</p>
            </span>
          </li>
        ))}
      </div>

      {expanded && halls.find(h => h.hall === expanded) && (
        <div className="table-data">
          <div className="order">
            <div className="head"><h3>{expanded} — Members</h3></div>
            <table>
              <thead><tr><th>Name</th><th>Gender</th><th>Contact</th><th>Program</th><th>Level</th></tr></thead>
              <tbody>
                {halls.find(h => h.hall === expanded).members.map(m => (
                  <tr key={m.id}>
                    <td>{m.surname} {m.othernames}</td>
                    <td>{m.gender}</td>
                    <td>{m.contact || '-'}</td>
                    <td>{m.program || '-'}</td>
                    <td>{m.education_level || '-'}</td>
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
