// Dashboard.jsx — Stats overview (ported from dashboard.php)
import { useState, useEffect } from 'react';
import { secApi } from '../api/secApi.js';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    secApi.dashboard().then(setData).catch(err => setError(err.message));
  }, []);

  if (error) return <div className="error-msg">{error}</div>;
  if (!data) return <div className="loading">Loading dashboard...</div>;

  const { stats, durations, levels, halls, recentMembers } = data;

  return (
    <>
      <div className="head-title">
        <div className="left">
          <h1>Dashboard</h1>
          <ul className="breadcrumb">
            <li><a className="active">PENSA TTU</a></li>
            <li><i className='bx bx-chevron-right'></i></li>
            <li><a>Dashboard</a></li>
          </ul>
        </div>
      </div>

      <ul className="box-info">
        <li>
          <i className='bx bxs-group'></i>
          <span className="text">
            <h3>{stats.total}</h3>
            <p>Total Registrations</p>
          </span>
        </li>
        <li>
          <i className='bx bxs-user-check'></i>
          <span className="text">
            <h3>{stats.members}</h3>
            <p>Members</p>
          </span>
        </li>
        <li>
          <i className='bx bxs-user-detail'></i>
          <span className="text">
            <h3>{stats.associates}</h3>
            <p>Associates</p>
          </span>
        </li>
      </ul>

      <ul className="box-info">
        <li>
          <i className='bx bxs-user' style={{ background: 'var(--light-blue)', color: 'var(--blue)' }}></i>
          <span className="text">
            <h3>{stats.male}</h3>
            <p>Male</p>
          </span>
        </li>
        <li>
          <i className='bx bxs-user' style={{ background: 'var(--light-orange)', color: 'var(--orange)' }}></i>
          <span className="text">
            <h3>{stats.female}</h3>
            <p>Female</p>
          </span>
        </li>
        <li>
          <i className='bx bxs-shield-alt-2' style={{ background: 'var(--light-yellow)', color: 'var(--yellow)' }}></i>
          <span className="text">
            <h3>{stats.officers}</h3>
            <p>Church Officers</p>
          </span>
        </li>
      </ul>

      <ul className="box-info">
        <li>
          <i className='bx bxs-graduation' style={{ background: 'var(--light-blue)', color: 'var(--blue)' }}></i>
          <span className="text">
            <h3>{stats.alumni}</h3>
            <p>Alumni</p>
          </span>
        </li>
        <li>
          <i className='bx bxs-calendar-plus' style={{ background: 'var(--light-orange)', color: 'var(--orange)' }}></i>
          <span className="text">
            <h3>{stats.recent}</h3>
            <p>New (30 days)</p>
          </span>
        </li>
      </ul>

      <div className="table-data">
        <div className="order">
          <div className="head">
            <h3>Recent Registrations</h3>
          </div>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Gender</th>
                <th>Type</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentMembers.length === 0 ? (
                <tr><td colSpan="4" style={{ textAlign: 'center', color: 'var(--dark-grey)' }}>No recent registrations</td></tr>
              ) : recentMembers.map(m => (
                <tr key={m.id}>
                  <td>{m.surname} {m.othernames}</td>
                  <td>{m.gender}</td>
                  <td><span className={`status ${m.membership_type}`}>{m.membership_type}</span></td>
                  <td>{new Date(m.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="todo">
          <div className="head">
            <h3>Program Duration</h3>
          </div>
          <ul className="todo-list">
            {Object.entries(durations).length === 0 ? (
              <li><span>No data</span></li>
            ) : Object.entries(durations).map(([dur, count]) => (
              <li key={dur} className="completed">
                <span>{dur}</span>
                <span className="badge badge-blue">{count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="table-data">
        <div className="order">
          <div className="head"><h3>Hall Distribution</h3></div>
          <table>
            <thead><tr><th>Hall</th><th>Count</th></tr></thead>
            <tbody>
              {Object.entries(halls).length === 0 ? (
                <tr><td colSpan="2" style={{ textAlign: 'center', color: 'var(--dark-grey)' }}>No hall data</td></tr>
              ) : Object.entries(halls).map(([hall, count]) => (
                <tr key={hall}><td>{hall}</td><td><span className="badge badge-blue">{count}</span></td></tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="todo">
          <div className="head"><h3>Education Level</h3></div>
          <ul className="todo-list">
            {Object.entries(levels).length === 0 ? (
              <li><span>No data</span></li>
            ) : Object.entries(levels).map(([lvl, count]) => (
              <li key={lvl} className="not-completed">
                <span>Level {lvl}</span>
                <span className="badge badge-orange">{count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
