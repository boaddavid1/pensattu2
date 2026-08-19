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

  const columns = items.length ? Object.keys(items[0]) : [];

  return (
    <div>
      <h2>{title}</h2>
      {error && <div className="admin-error">{error}</div>}
      {loading ? (
        <div className="admin-loading">Loading...</div>
      ) : (
        <div className="admin-table-wrap admin-card">
          <table className="admin-table">
            <thead>
              <tr>
                {columns.map((col) => <th key={col}>{col}</th>)}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  {columns.map((col) => (
                    <td key={col}>
                      {col === 'created_at' || col === 'subscribed_at'
                        ? new Date(item[col]).toLocaleString()
                        : (item[col] || '-')}
                    </td>
                  ))}
                  <td className="admin-actions">
                    <button className="admin-delete" onClick={() => remove(item.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={columns.length + 1} className="admin-empty">No records yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
