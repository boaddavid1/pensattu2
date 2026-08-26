import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApi } from './adminApi';

export default function AdminTeamYear() {
  const { year } = useParams();
  const navigate = useNavigate();
  const decodedYear = decodeURIComponent(year);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const data = await adminApi.list('team');
          if (cancelled) return;
          setItems(data);
          setLoading(false);
          return;
        } catch (err) {
          if (attempt < 3) {
            await new Promise((r) => setTimeout(r, 1000 * attempt));
          } else {
            if (!cancelled) {
              setError(err.message);
              setLoading(false);
            }
          }
        }
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  function startEdit(p) {
    navigate(`/admin/team/${p.id}/edit`, { state: { item: p } });
  }

  async function remove(id) {
    if (!window.confirm('Delete this team member?')) return;
    try {
      await adminApi.remove('team', id);
      setItems((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  const members = items.filter((p) => p.academic_year === decodedYear);

  if (loading) return <div className="admin-loading">Loading...</div>;

  return (
    <div>
      <div className="admin-page-header">
        <h2>Leadership Team — {decodedYear}</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-primary" onClick={() => navigate('/admin/team/new')}>+ Add Member</button>
          <button className="btn btn-ghost" onClick={() => navigate('/admin/team')}>← Back to list</button>
        </div>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <div className="admin-crud-grid">
        {members.map((p) => (
          <div key={p.id} className="admin-crud-card">
            <div className="admin-crud-card-img">
              {p.image_url ? (
                <img src={p.image_url} alt={p.name} />
              ) : (
                <div className="admin-pq-icon">👤</div>
              )}
            </div>
            <div className="admin-crud-card-body">
              <h3>{p.name}</h3>
              <div className="admin-crud-card-meta">
                <div className="admin-crud-card-meta-item">
                  <span className="admin-crud-card-meta-label">Role</span>
                  <span className="admin-crud-card-meta-value">{p.role}</span>
                </div>
                <div className="admin-crud-card-meta-item">
                  <span className="admin-crud-card-meta-label">Category</span>
                  <span className="admin-crud-card-meta-value">{p.category}</span>
                </div>
                {p.programme && (
                  <div className="admin-crud-card-meta-item">
                    <span className="admin-crud-card-meta-label">Programme</span>
                    <span className="admin-crud-card-meta-value">{p.programme}</span>
                  </div>
                )}
              </div>
              {p.description && <p className="admin-crud-card-desc">{p.description}</p>}
            </div>
            <div className="admin-crud-card-actions">
              <button className="admin-edit" onClick={() => startEdit(p)}>Edit</button>
              <button className="admin-delete" onClick={() => remove(p.id)}>Delete</button>
            </div>
          </div>
        ))}
        {members.length === 0 && <p className="admin-empty">No members found for {decodedYear}.</p>}
      </div>
    </div>
  );
}
