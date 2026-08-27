// Dashboard.jsx — Stats overview with charts (ported from dashboard.php)
import { useState, useEffect } from 'react';
import { secApi } from '../api/secApi.js';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

const COLORS = ['#3c91e6', '#f5a623', '#27ae60', '#e74c3c', '#9b59b6', '#1abc9c', '#e67e22', '#34495e'];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    secApi.dashboard().then(setData).catch(err => setError(err.message));
  }, []);

  if (error) return <div className="error-msg">{error}</div>;
  if (!data) return <div className="loading">Loading dashboard...</div>;

  const { stats, durations, levels, halls, recentMembers } = data;

  // Chart data transforms
  const genderData = [
    { name: 'Male', value: stats.male },
    { name: 'Female', value: stats.female },
  ];
  const membershipData = [
    { name: 'Members', value: stats.members },
    { name: 'Associates', value: stats.associates },
  ];
  const durationData = Object.entries(durations)
    .filter(([k]) => k && k !== 'null')
    .map(([name, value]) => ({ name: name || 'Unknown', value }));
  const levelData = Object.entries(levels)
    .filter(([k]) => k && k !== 'null')
    .map(([name, value]) => ({ name: `Level ${name}`, value }))
    .sort((a, b) => parseInt(a.name.replace('Level ', '')) - parseInt(b.name.replace('Level ', '')));
  const hallData = Object.entries(halls)
    .filter(([k]) => k && k !== 'null')
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

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

      {/* Stat cards */}
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

      {/* Charts row 1: Gender pie + Membership pie */}
      <div className="table-data" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="order" style={{ padding: 24 }}>
          <div className="head"><h3>Gender Distribution</h3></div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={genderData}
                cx="50%" cy="50%"
                innerRadius={60} outerRadius={100}
                paddingAngle={4}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {genderData.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? '#3c91e6' : '#f5a623'} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="order" style={{ padding: 24 }}>
          <div className="head"><h3>Membership Type</h3></div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={membershipData}
                cx="50%" cy="50%"
                innerRadius={60} outerRadius={100}
                paddingAngle={4}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                <Cell fill="#27ae60" />
                <Cell fill="#e67e22" />
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts row 2: Education level bar + Program duration bar */}
      <div className="table-data" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 24 }}>
        <div className="order" style={{ padding: 24 }}>
          <div className="head"><h3>Education Level Distribution</h3></div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={levelData} margin={{ top: 20, right: 20, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--grey)" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" name="Members" radius={[8, 8, 0, 0]}>
                {levelData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="order" style={{ padding: 24 }}>
          <div className="head"><h3>Program Duration</h3></div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={durationData} margin={{ top: 20, right: 20, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--grey)" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" name="Members" radius={[8, 8, 0, 0]}>
                {durationData.map((_, i) => (
                  <Cell key={i} fill={COLORS[(i + 3) % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts row 3: Hall distribution horizontal bar */}
      <div className="table-data" style={{ marginTop: 24 }}>
        <div className="order" style={{ padding: 24 }}>
          <div className="head"><h3>Hall Distribution</h3></div>
          <ResponsiveContainer width="100%" height={Math.max(250, hallData.length * 40)}>
            <BarChart
              data={hallData}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 80, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--grey)" />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
              <Tooltip />
              <Bar dataKey="value" name="Members" radius={[0, 8, 8, 0]}>
                {hallData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent registrations table */}
      <div className="table-data" style={{ marginTop: 24 }}>
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
      </div>
    </>
  );
}
