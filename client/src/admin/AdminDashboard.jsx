import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from './adminApi';

const statCards = [
  { key: 'ministries', label: 'Ministries', to: '/admin/ministries' },
  { key: 'sermons', label: 'Sermons', to: '/admin/sermons' },
  { key: 'team', label: 'Team', to: '/admin/team' },
  { key: 'events', label: 'Events', to: '/admin/events' },
  { key: 'announcements', label: 'Announcements', to: '/admin/announcements' },
  { key: 'notices', label: 'Notices', to: '/admin/notices' },
  { key: 'visits', label: 'Visits', to: '/admin/visits' },
  { key: 'subscribers', label: 'Subscribers', to: '/admin/subscribers' },
  { key: 'contacts', label: 'Messages', to: '/admin/contacts' },
  { key: 'gallery_albums', label: 'Albums', to: '/admin/gallery' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.stats()
      .then((res) => {
        setStats(res.stats);
        setActivity(res.recentActivity || []);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>
      <p className="admin-intro">Overview of everything happening on the PENSA TTU website.</p>
      {loading ? (
        <div className="admin-loading">Loading dashboard...</div>
      ) : (
        <>
          <div className="admin-stats-grid">
            {statCards.map((card) => (
              <Link key={card.key} to={card.to} className="admin-stat-card">
                <strong>{stats[card.key] ?? 0}</strong>
                <span>{card.label}</span>
              </Link>
            ))}
          </div>
          <h3 className="admin-section-title">Recent Activity</h3>
          <div className="admin-card">
            {activity.length === 0 ? (
              <p className="admin-empty">No recent activity.</p>
            ) : (
              <ul className="admin-activity-list">
                {activity.map((log) => (
                  <li key={log.id}>
                    <span className="admin-activity-action">{log.action}</span>
                    <span className="admin-activity-entity">{log.entity}</span>
                    <span className="admin-activity-user">by {log.name || 'Unknown'}</span>
                    <span className="admin-activity-time">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
