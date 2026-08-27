import { useEffect, useState } from 'react';
import { auth } from './api';
import { uploadImageToCloudinary } from './cloudinaryUpload';

export default function Profile({ user, onBack, onLogout, onUserUpdate }) {
  const [tab, setTab] = useState('info');
  const [form, setForm] = useState({ full_name: user.full_name, email: user.email, profile_picture: user.profile_picture || '' });
  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ totalDownloads: 0, pastQuestions: 0, books: 0 });
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    try {
      const data = await auth.downloadHistory();
      setHistory(data);
      const pq = data.filter((d) => d.resource_type === 'past_question').length;
      const bk = data.filter((d) => d.resource_type === 'book').length;
      setStats({ totalDownloads: data.length, pastQuestions: pq, books: bk });
    } catch (err) {
      setError(err.message);
    }
  }

  async function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingPhoto(true);
    setError('');
    try {
      const url = await uploadImageToCloudinary(file);
      setForm((prev) => ({ ...prev, profile_picture: url }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function handleProfileSave(e) {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      const data = await auth.updateProfile({
        full_name: form.full_name,
        email: form.email,
        profile_picture: form.profile_picture,
      });
      auth.setToken(data.token);
      onUserUpdate(data.user);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordChange(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setError('New passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await auth.changePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
      setSuccess('Password changed successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const initials = (user.full_name || '?').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  const memberSince = user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Recently';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white font-sans">
      {/* Top Nav */}
      <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center shadow-lg shadow-amber-500/20">
              <svg className="w-5 h-5 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
            </div>
            <span className="text-lg font-bold tracking-tight">StudyVault</span>
          </button>
          <button onClick={onBack} className="text-slate-400 hover:text-amber-400 text-sm font-medium transition-colors">← Back to Library</button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Profile Header Card */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 mb-8 flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="relative">
            {form.profile_picture ? (
              <img src={form.profile_picture} alt={user.full_name} className="w-28 h-28 rounded-full object-cover border-4 border-amber-500/30 shadow-lg" />
            ) : (
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-slate-900 font-bold text-3xl shadow-lg">
                {initials}
              </div>
            )}
            <label className="absolute bottom-1 right-1 w-8 h-8 bg-amber-500 hover:bg-amber-400 rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-colors">
              <svg className="w-4 h-4 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              <input type="file" accept="image/*" onChange={handlePhotoChange} disabled={uploadingPhoto} className="hidden" />
            </label>
            {uploadingPhoto && <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center text-xs">...</div>}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold">{user.full_name}</h1>
            <p className="text-slate-400 text-sm mt-1">{user.email}</p>
            <p className="text-slate-600 text-xs mt-1">Member since {memberSince}</p>
            <div className="flex gap-4 mt-4 justify-center md:justify-start">
              <div className="bg-slate-900/50 rounded-lg px-4 py-2">
                <div className="text-xl font-bold text-amber-400">{stats.totalDownloads}</div>
                <div className="text-slate-500 text-xs">Downloads</div>
              </div>
              <div className="bg-slate-900/50 rounded-lg px-4 py-2">
                <div className="text-xl font-bold text-blue-400">{stats.pastQuestions}</div>
                <div className="text-slate-500 text-xs">Past Questions</div>
              </div>
              <div className="bg-slate-900/50 rounded-lg px-4 py-2">
                <div className="text-xl font-bold text-emerald-400">{stats.books}</div>
                <div className="text-slate-500 text-xs">Books</div>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && <div className="mb-6 bg-red-900/30 border border-red-700/50 text-red-300 px-4 py-3 rounded-xl text-sm">{error}</div>}
        {success && <div className="mb-6 bg-emerald-900/30 border border-emerald-700/50 text-emerald-300 px-4 py-3 rounded-xl text-sm">{success}</div>}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => setTab('info')} className={`px-5 py-2 rounded-full font-semibold text-sm transition-all ${tab === 'info' ? 'bg-amber-500 text-slate-900' : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700'}`}>Profile Info</button>
          <button onClick={() => setTab('password')} className={`px-5 py-2 rounded-full font-semibold text-sm transition-all ${tab === 'password' ? 'bg-amber-500 text-slate-900' : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700'}`}>Change Password</button>
          <button onClick={() => setTab('history')} className={`px-5 py-2 rounded-full font-semibold text-sm transition-all ${tab === 'history' ? 'bg-amber-500 text-slate-900' : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700'}`}>Download History</button>
        </div>

        {/* Tab Content */}
        {tab === 'info' && (
          <form onSubmit={handleProfileSave} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
              <input type="text" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Profile Picture</label>
              <div className="flex items-center gap-4">
                {form.profile_picture ? (
                  <img src={form.profile_picture} alt="Preview" className="w-16 h-16 rounded-full object-cover border-2 border-slate-600" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 text-xl font-bold">{initials}</div>
                )}
                <label className="cursor-pointer bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Choose Image
                  <input type="file" accept="image/*" onChange={handlePhotoChange} disabled={uploadingPhoto} className="hidden" />
                </label>
                {form.profile_picture && (
                  <button type="button" onClick={() => setForm({ ...form, profile_picture: '' })} className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors">Remove</button>
                )}
              </div>
            </div>
            <div className="pt-2">
              <button type="submit" disabled={loading || uploadingPhoto} className="bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-900 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-amber-500/20">
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}

        {tab === 'password' && (
          <form onSubmit={handlePasswordChange} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 space-y-5 max-w-lg">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Current Password</label>
              <input type="password" value={passwordForm.current_password} onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })} required className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">New Password</label>
              <input type="password" value={passwordForm.new_password} onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })} required minLength={6} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all" />
              <p className="text-slate-600 text-xs mt-1">Minimum 6 characters</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm New Password</label>
              <input type="password" value={passwordForm.confirm_password} onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })} required className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all" />
            </div>
            <div className="pt-2">
              <button type="submit" disabled={loading} className="bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-900 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-amber-500/20">
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </form>
        )}

        {tab === 'history' && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
            {history.length === 0 ? (
              <div className="text-center py-16">
                <span className="text-5xl block mb-4">📥</span>
                <p className="text-slate-500">No downloads yet. Browse the library and download some resources!</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-700/50">
                {history.map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-5 hover:bg-slate-800/50 transition-colors">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${item.resource_type === 'book' ? 'bg-emerald-500/10' : 'bg-blue-500/10'}`}>
                      {item.resource_type === 'book' ? '📖' : '📝'}
                    </div>
                    <div className="flex-1 min-w-0">
                      {item.resource_type === 'book' ? (
                        <>
                          <p className="font-medium truncate">{item.book_title || 'Unknown book'}</p>
                          {item.book_author && <p className="text-slate-500 text-sm">by {item.book_author}</p>}
                        </>
                      ) : (
                        <>
                          <p className="font-medium truncate">{item.course_code} — {item.course_title}</p>
                          <p className="text-slate-500 text-sm">{item.year} • {item.semester}</p>
                        </>
                      )}
                    </div>
                    <div className="text-slate-600 text-sm whitespace-nowrap">
                      {new Date(item.downloaded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Logout */}
        <div className="mt-8 text-center">
          <button onClick={onLogout} className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors">Log out of account</button>
        </div>
      </div>
    </div>
  );
}
