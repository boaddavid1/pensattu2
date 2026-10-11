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
  const [successMsg, setSuccessMsg] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '', role: 'user' });
  const [editUser, setEditUser] = useState(null);
  const [showDelete, setShowDelete] = useState(null);
  const [updatingRoleId, setUpdatingRoleId] = useState(null);
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

  const handleRoleChange = async (targetUser, newRole) => {
    if (targetUser.role === newRole) return;
    if (targetUser.id === user?.id && newRole !== 'admin') {
      const ok = window.confirm("Warning: You are demoting your own account to 'User' (Read-only). You will immediately lose access to administrative pages like Settings, Attendance, and Messages. Are you sure?");
      if (!ok) return;
    }

    setUpdatingRoleId(targetUser.id);
    setError('');
    setSuccessMsg('');
    try {
      await secApi.updateUser(targetUser.id, { role: newRole });
      setSuccessMsg(`Role for ${targetUser.username} successfully changed to ${newRole === 'admin' ? 'Admin' : 'Read-only User'}.`);
      setUsers(prev => prev.map(u => u.id === targetUser.id ? { ...u, role: newRole } : u));
      if (targetUser.id === user?.id) {
        // If current user modified their own role, update session storage
        try {
          const current = JSON.parse(sessionStorage.getItem('sec_admin_user') || '{}');
          current.role = newRole;
          sessionStorage.setItem('sec_admin_user', JSON.stringify(current));
        } catch {}
      }
    } catch (err) {
      setError(err.message || 'Failed to change role');
    } finally {
      setUpdatingRoleId(null);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await secApi.createUser(newUser);
      setShowAdd(false);
      setNewUser({ username: '', email: '', password: '', role: 'user' });
      setSuccessMsg(`User ${newUser.username} added successfully!`);
      loadUsers();
    } catch (err) { setError(err.message); }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editUser) return;
    setError('');
    try {
      const payload = {
        username: editUser.username,
        email: editUser.email,
        role: editUser.role,
      };
      if (editUser.password && editUser.password.trim()) {
        payload.password = editUser.password.trim();
      }
      await secApi.updateUser(editUser.id, payload);
      setSuccessMsg(`User ${editUser.username} updated successfully!`);
      setEditUser(null);
      loadUsers();
    } catch (err) { setError(err.message); }
  };

  const handleDelete = async (id) => {
    setError('');
    try {
      await secApi.deleteUser(id);
      setShowDelete(null);
      setSuccessMsg('User deleted successfully.');
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

      {error && (
        <div className="error-msg" style={{ marginBottom: 16 }}>
          <i className='bx bx-error-circle' style={{ marginRight: 6 }}></i>
          {error}
        </div>
      )}

      {successMsg && (
        <div style={{ background: '#d4edda', color: '#155724', padding: '12px 16px', borderRadius: 8, marginBottom: 16, border: '1px solid #c3e6cb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className='bx bx-check-circle' style={{ fontSize: 20 }}></i>
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#155724' }}>
            <i className='bx bx-x'></i>
          </button>
        </div>
      )}

      <div className="filter-bar">
        <button className={`btn ${tab === 'users' ? 'btn-primary' : 'btn-back'}`} onClick={() => setTab('users')}>Users & Permissions</button>
        <button className={`btn ${tab === 'logs' ? 'btn-primary' : 'btn-back'}`} onClick={() => setTab('logs')}>Activity Logs</button>
      </div>

      {tab === 'users' && (
        <div className="table-data">
          <div className="order">
            <div className="head">
              <div>
                <h3 style={{ margin: 0 }}>Portal Users & Role Access</h3>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--dark-grey)' }}>
                  Change user roles below to grant full administrator control or restrict to read-only access.
                </p>
              </div>
              {isAdmin && (
                <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
                  <i className='bx bx-plus'></i> Add User
                </button>
              )}
            </div>
            <table>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role (Change Role)</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <strong>{u.username}</strong>
                      {u.id === user?.id && (
                        <span style={{ marginLeft: 8, fontSize: 11, background: '#eaf2f8', color: '#2980b9', padding: '2px 6px', borderRadius: 10, fontWeight: 600 }}>You</span>
                      )}
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <select
                          value={u.role || 'user'}
                          onChange={(e) => handleRoleChange(u, e.target.value)}
                          disabled={updatingRoleId === u.id || !isAdmin}
                          style={{
                            padding: '6px 12px',
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                            border: u.role === 'admin' ? '1px solid #e74c3c' : '1px solid #3498db',
                            color: u.role === 'admin' ? '#c0392b' : '#2980b9',
                            background: u.role === 'admin' ? '#fdedec' : '#ebf5fb',
                            outline: 'none',
                          }}
                          title="Click to switch role between Admin and Read-only User"
                        >
                          <option value="admin">Admin (Full Access)</option>
                          <option value="user">User (Read-only)</option>
                        </select>
                        {updatingRoleId === u.id && (
                          <span style={{ fontSize: 11, color: 'var(--dark-grey)' }}>Saving...</span>
                        )}
                      </div>
                    </td>
                    <td>{new Date(u.created_at).toLocaleDateString()}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {isAdmin && (
                        <>
                          <button
                            className="btn btn-warning"
                            style={{ padding: '4px 10px', marginRight: 6 }}
                            onClick={() => setEditUser({ id: u.id, username: u.username, email: u.email, role: u.role || 'user', password: '' })}
                            title="Edit user details and role"
                          >
                            <i className='bx bxs-edit' style={{ marginRight: 4 }}></i> Edit
                          </button>
                          {u.id !== user?.id && (
                            <button
                              className="btn btn-danger"
                              style={{ padding: '4px 10px' }}
                              onClick={() => setShowDelete(u)}
                              title="Delete user"
                            >
                              <i className='bx bxs-trash' style={{ marginRight: 4 }}></i> Delete
                            </button>
                          )}
                        </>
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

      {/* Add User Modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <h2>Add User</h2>
            <form onSubmit={handleAdd}>
              <div className="form-group">
                <label>Username</label>
                <input value={newUser.username} onChange={e => setNewUser(u => ({ ...u, username: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={newUser.email} onChange={e => setNewUser(u => ({ ...u, email: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" value={newUser.password} onChange={e => setNewUser(u => ({ ...u, password: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select value={newUser.role} onChange={e => setNewUser(u => ({ ...u, role: e.target.value }))}>
                  <option value="user">User (Read-only access)</option>
                  <option value="admin">Admin (Full access)</option>
                </select>
                <span style={{ fontSize: 11, color: 'var(--dark-grey)', marginTop: 4, display: 'block' }}>
                  Users have read-only permissions for Dashboard, Members, Halls, Alumni, and Reports.
                </span>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-back" onClick={() => setShowAdd(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editUser && (
        <div className="modal-overlay" onClick={() => setEditUser(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className='bx bxs-user-detail' style={{ color: 'var(--blue)' }}></i> Edit User & Role
              </h2>
              <button
                type="button"
                onClick={() => setEditUser(null)}
                style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--dark-grey)' }}
              >
                <i className='bx bx-x'></i>
              </button>
            </div>
            <form onSubmit={handleUpdateUser}>
              <div className="form-group" style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Username</label>
                <input
                  type="text"
                  value={editUser.username}
                  onChange={e => setEditUser(u => ({ ...u, username: e.target.value }))}
                  required
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--grey)' }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Email Address</label>
                <input
                  type="email"
                  value={editUser.email}
                  onChange={e => setEditUser(u => ({ ...u, email: e.target.value }))}
                  required
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--grey)' }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Role & Permissions</label>
                <select
                  value={editUser.role || 'user'}
                  onChange={e => setEditUser(u => ({ ...u, role: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--grey)', fontWeight: 600 }}
                >
                  <option value="admin">Admin — Full Administrative Access</option>
                  <option value="user">User — Read-Only Access</option>
                </select>
                <span style={{ fontSize: 11, color: 'var(--dark-grey)', marginTop: 4, display: 'block' }}>
                  {editUser.role === 'admin'
                    ? 'Admins can manage all records, advance levels, send SMS, and configure settings.'
                    : 'Users can only view Dashboard, Members, Halls, Alumni, and Reports.'}
                </span>
              </div>
              <div className="form-group" style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Reset Password (Optional)</label>
                <input
                  type="password"
                  placeholder="Leave blank to keep current password"
                  value={editUser.password || ''}
                  onChange={e => setEditUser(u => ({ ...u, password: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--grey)' }}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-back" onClick={() => setEditUser(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {showDelete && (
        <div className="modal-overlay" onClick={() => setShowDelete(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 450 }}>
            <h2>Delete User</h2>
            <p>Are you sure you want to delete user <strong>{showDelete.username}</strong> ({showDelete.email})?</p>
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
