import { useEffect, useState } from 'react';
import { adminApi } from './adminApi';

export default function AdminReadonly({ entity, title }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadItems();
  }, [entity]);

  async function loadItems() {
    setLoading(true);
    setError('');
    try {
      const data = await adminApi.list(entity);
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function remove(id) {
    if (!window.confirm('Delete this record?')) return;
    try {
      await adminApi.remove(entity, id);
      await loadItems();
    } catch (err) {
      setError(err.message);
    }
  }

  const columns = items.length ? Object.keys(items[0]).filter((c) => c !== 'id') : [];

  return (
    <div>
      <div className="admin-readonly-header">
        <div>
          <h2>{title}</h2>
          <p className="admin-intro">{items.length} record{items.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="admin-refresh" onClick={loadItems} disabled={loading}>
          Refresh
        </button>
      </div>

      {error && <div className="admin-error">{error}</div>}

      {loading ? (
        <div className="admin-loading">Loading...</div>
      ) : (
        <div className="admin-table-wrap admin-card">
          {items.length === 0 ? (
            <p className="admin-empty">No records yet.</p>
          ) : (
            <table className="admin-table admin-readonly-table">
              <thead>
                <tr>
                  {columns.map((col) => <th key={col}>{formatHeader(col)}</th>)}
                  <th className="admin-actions-col">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    {columns.map((col) => (
                      <td key={col} title={String(item[col] || '')}>
                        {formatCell(col, item[col])}
                      </td>
                    ))}
                    <td className="admin-actions-col">
                      <button className="admin-delete" onClick={() => remove(item.id)} title="Delete">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

function formatHeader(key) {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatCell(key, value) {
  if (value === null || value === undefined) return <span className="admin-cell-empty">—</span>;
  if (key === 'created_at' || key === 'subscribed_at') {
    return new Date(value).toLocaleString();
  }
  if (key === 'message' || key === 'description' || key === 'notes' || key === 'content') {
    return (
      <span className="admin-cell-text">{String(value)}</span>
    );
  }
  return String(value);
}
