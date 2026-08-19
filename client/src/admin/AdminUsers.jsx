import { useEffect, useState } from 'react';
import { adminApi } from './adminApi';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'admin' });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    try {
      const data = await adminApi.listUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function createUser(e) {
    e.preventDefault();
    try {
      await adminApi.createUser(form);
      setForm({ name: '', email: '', password: '', role: 'admin' });
      setShowForm(false);
      await loadUsers();
    } catch (err) {
      setError(err.message);
    }
  }

  async function removeUser(id) {
    if (!window.confirm('Delete this admin user?')) return;
    try {
      await adminApi.removeUser(id);
      await loadUsers();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <div className="admin-page-header">
        <h2>Admin Users</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Admin'}
        </button>
      </div>
      {error && <div className="admin-error">{error}</div>}
      {showForm && (
        <form className="admin-form admin-card" onSubmit={createUser}>
          <h3>New Admin User</h3>
          <div className="admin-form-grid">
            <label>
              Name
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </label>
            <label>
              Email
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </label>
            <label>
              Password
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            </label>
            <label>
              Role
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="admin">Admin</option>
                <option value="superadmin">Super Admin</option>
              </select>
            </label>
          </div>
          <div className="admin-form-actions">
            <button type="submit" className="btn btn-primary">Create User</button>
          </div>
        </form>
      )}
      {loading ? (
        <div className="admin-loading">Loading...</div>
      ) : (
        <div className="admin-table-wrap admin-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  <td className="admin-actions">
                    <button className="admin-delete" onClick={() => removeUser(user.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={5} className="admin-empty">No admin users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
