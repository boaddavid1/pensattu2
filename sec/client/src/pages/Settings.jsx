// Settings.jsx — Admin user management + activity logs (ported from settings.php)
import { useState, useEffect, useCallback } from 'react';
import { secApi } from '../api/secApi.js';
import { useAuth } from '../api/AuthContext.jsx';

export default function Settings() {
  const { user } = useAuth();
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '', role: 'user' });
  const [showDelete, setShowDelete] = useState(null);
  const [logPage, setLogPage] = useState(1);
  const [logPagination, setLogPagination] = useState(null);

  const loadUsers = useCallback(async () => {
    try {
      const data = await secApi.listUsers();
      setUsers(data.users);
    } catch (err) { setError(err.message); }
  }, []);

  const loadLogs = useCallback(async () => {
    try {
      const data = await secApi.logs(`page=${logPage}&perPage=30`);
      setLogs(data.logs);
      setLogPagination(data.pagination);
    } catch (err) { setError(err.message); }
  }, [logPage]);

  useEffect(() => {
    if (tab === 'users') loadUsers();
    else if (tab === 'logs') loadLogs();
  }, [tab, loadUsers, loadLogs]);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await secApi.createUser(newUser);
      setShowAdd(false);
      setNewUser({ username: '', email: '', password: '', role: 'user' });
      loadUsers();
    } catch (err) { setError(err.message); }
  };

  const handleDelete = async (id) => {
    try {
      await secApi.deleteUser(id);
      setShowDelete(null);
      loadUsers();
    } catch (err) { setError(err.message); }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <>
      <div className="head-title">
        <div className="left">
          <h1>Settings</h1>
          <ul className="breadcrumb">
            <li><a className="active">PENSA TTU</a></li>
            <li><i className='bx bx-chevron-right'></i></li>
            <li><a>Settings</a></li>
          </ul>
        </div>
      </div>

      {error && <div className="error-msg">{error}</div>}

      <div className="filter-bar">
        <button className={`btn ${tab === 'users' ? 'btn-primary' : 'btn-back'}`} onClick={() => setTab('users')}>Users</button>
        <button className={`btn ${tab === 'logs' ? 'btn-primary' : 'btn-back'}`} onClick={() => setTab('logs')}>Activity Logs</button>
      </div>

      {tab === 'users' && (
        <div className="table-data">
          <div className="order">
            <div className="head">
              <h3>Admin Users</h3>
              {isAdmin && <button className="btn btn-primary" onClick={() => setShowAdd(true)}><i className='bx bx-plus'></i> Add User</button>}
            </div>
            <table>
              <thead><tr><th>Username</th><th>Email</th><th>Role</th><th>Created</th><th>Actions</th></tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>{u.username}</td>
                    <td>{u.email}</td>
                    <td><span className={`badge ${u.role === 'admin' ? 'badge-red' : 'badge-blue'}`}>{u.role}</span></td>
                    <td>{new Date(u.created_at).toLocaleDateString()}</td>
                    <td>
                      {isAdmin && u.id !== user?.id && (
                        <button className="btn btn-danger" style={{ padding: '4px 10px' }} onClick={() => setShowDelete(u)}>Delete</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'logs' && (
        <div className="table-data">
          <div className="order">
            <div className="head"><h3>Activity Logs</h3></div>
            <table>
              <thead><tr><th>User</th><th>Action</th><th>Details</th><th>IP</th><th>Date</th></tr></thead>
              <tbody>
                {logs.map(l => (
                  <tr key={l.id}>
                    <td>{l.username}</td>
                    <td><span className="badge badge-blue">{l.action}</span></td>
                    <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.details}</td>
                    <td>{l.ip_address}</td>
                    <td>{new Date(l.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {logPagination && logPagination.totalPages > 1 && (
              <div className="pagination">
                <button onClick={() => setLogPage(p => Math.max(1, p - 1))} disabled={logPage <= 1}>Prev</button>
                <span style={{ padding: '8px 14px' }}>Page {logPage} of {logPagination.totalPages}</span>
                <button onClick={() => setLogPage(p => Math.min(logPagination.totalPages, p + 1))} disabled={logPage >= logPagination.totalPages}>Next</button>
              </div>
            )}
          </div>
        </div>
      )}

      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Add Admin User</h2>
            <form onSubmit={handleAdd}>
              <div className="form-group"><label>Username</label><input value={newUser.username} onChange={e => setNewUser(u => ({ ...u, username: e.target.value }))} required /></div>
              <div className="form-group"><label>Email</label><input type="email" value={newUser.email} onChange={e => setNewUser(u => ({ ...u, email: e.target.value }))} required /></div>
              <div className="form-group"><label>Password</label><input type="password" value={newUser.password} onChange={e => setNewUser(u => ({ ...u, password: e.target.value }))} required /></div>
              <div className="form-group"><label>Role</label>
                <select value={newUser.role} onChange={e => setNewUser(u => ({ ...u, role: e.target.value }))}>
                  <option value="user">User</option><option value="admin">Admin</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-back" onClick={() => setShowAdd(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDelete && (
        <div className="modal-overlay" onClick={() => setShowDelete(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Delete User</h2>
            <p>Are you sure you want to delete <strong>{showDelete.username}</strong>?</p>
            <div className="modal-actions">
              <button className="btn btn-back" onClick={() => setShowDelete(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(showDelete.id)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
