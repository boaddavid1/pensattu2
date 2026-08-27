import { useEffect, useState, useCallback } from 'react';
import { prayerApi } from './prayerApi';
import './prayer.css';

const USER_STATUS = 'Alumni';

const CATEGORY_LABELS = {
  healing: '🙏 Healing & Health',
  guidance: '🧭 Guidance & Wisdom',
  academics: '📚 Academics & Exams',
  family: '👨‍👩‍👧‍👦 Family & Relationships',
  career: '💼 Career & Finances',
  spiritual: '✝️ Spiritual Growth & Guidance',
  campus: '🎓 Campus Life & Fellowship',
  thanks: '🙌 Thanksgiving & Praise',
  other: '✨ Other',
};

const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS);

function formatDate(date) {
  if (!date) return '—';
  const d = new Date(String(date).replace(' ', 'T'));
  if (isNaN(d)) return String(date);
  return d.toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  });
}

export default function AdminPrayers() {
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, prayed: 0 });
  const [pagination, setPagination] = useState({ page: 1, perPage: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [appliedFilters, setAppliedFilters] = useState({ category: '', status: '', dateFrom: '', dateTo: '' });

  // Selection
  const [selected, setSelected] = useState(new Set());

  const buildQuery = useCallback((page, filters) => {
    const params = new URLSearchParams({ userStatus: USER_STATUS, page });
    if (filters.category) params.set('category', filters.category);
    if (filters.status) params.set('status', filters.status);
    if (filters.dateFrom) params.set('date_from', filters.dateFrom);
    if (filters.dateTo) params.set('date_to', filters.dateTo);
    return params.toString();
  }, []);

  const load = useCallback(async (page = 1, filters = appliedFilters) => {
    setLoading(true);
    setError('');
    try {
      const [listRes, statsRes] = await Promise.all([
        prayerApi.list(buildQuery(page, filters)),
        prayerApi.stats(`userStatus=${USER_STATUS}`),
      ]);
      setRequests(listRes.requests || []);
      setPagination(listRes.pagination || { page: 1, perPage: 20, total: 0, totalPages: 1 });
      setStats(statsRes);
      setSelected(new Set());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [appliedFilters, buildQuery]);

  useEffect(() => { load(1); /* eslint-disable-next-line */ }, []);

  function applyFilters(e) {
    e.preventDefault();
    const next = { category, status, dateFrom, dateTo };
    setAppliedFilters(next);
    load(1, next);
  }

  function resetFilters() {
    setCategory(''); setStatus(''); setDateFrom(''); setDateTo('');
    const next = { category: '', status: '', dateFrom: '', dateTo: '' };
    setAppliedFilters(next);
    load(1, next);
  }

  function toggleSelected(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) => {
      if (prev.size === requests.length) return new Set();
      return new Set(requests.map((r) => r.id));
    });
  }

  async function markPrayed(id) {
    try {
      await prayerApi.markPrayed(id, `userStatus=${USER_STATUS}`);
      setSuccess('Marked as prayed.');
      setTimeout(() => setSuccess(''), 3000);
      await load(pagination.page, appliedFilters);
    } catch (err) { setError(err.message); }
  }

  async function deletePrayer(id) {
    if (!window.confirm('Delete this prayer request?')) return;
    try {
      await prayerApi.remove(id, `userStatus=${USER_STATUS}`);
      setSuccess('Request deleted.');
      setTimeout(() => setSuccess(''), 3000);
      await load(pagination.page, appliedFilters);
    } catch (err) { setError(err.message); }
  }

  async function bulkPray() {
    const ids = [...selected];
    if (!ids.length) return alert('Please select at least one prayer request.');
    if (!window.confirm(`Mark ${ids.length} prayer request(s) as prayed?`)) return;
    try {
      await prayerApi.bulkPray({ ids, userStatus: USER_STATUS });
      setSuccess(`${ids.length} request(s) marked as prayed.`);
      setTimeout(() => setSuccess(''), 3000);
      await load(pagination.page, appliedFilters);
    } catch (err) { setError(err.message); }
  }

  async function bulkDelete() {
    const ids = [...selected];
    if (!ids.length) return alert('Please select at least one prayer request.');
    if (!window.confirm(`Delete ${ids.length} prayer request(s)?`)) return;
    try {
      await prayerApi.bulkDelete({ ids, userStatus: USER_STATUS });
      setSuccess(`${ids.length} request(s) deleted.`);
      setTimeout(() => setSuccess(''), 3000);
      await load(pagination.page, appliedFilters);
    } catch (err) { setError(err.message); }
  }

  function goToPage(page) {
    if (page < 1 || page > pagination.totalPages) return;
    load(page, appliedFilters);
  }

  return (
    <div>
      <div className="admin-prayer-page-header">
        <div>
          <h2>Operation Paga — Alumni Prayers</h2>
          <p>Manage anonymous prayer requests from alumni.</p>
        </div>
        <button className="admin-prayer-refresh" onClick={() => load(pagination.page, appliedFilters)} disabled={loading}>
          Refresh
        </button>
      </div>

      {success && <div className="admin-prayer-alert admin-prayer-alert-success">{success}</div>}
      {error && <div className="admin-prayer-error">{error}</div>}

      {/* Stats */}
      <div className="admin-prayer-stats-grid">
        <div className="admin-prayer-stat-card"><strong>{stats.total}</strong><span>Total Requests</span></div>
        <div className="admin-prayer-stat-card"><strong>{stats.pending}</strong><span>Pending</span></div>
        <div className="admin-prayer-stat-card"><strong>{stats.prayed}</strong><span>Prayed For</span></div>
      </div>

      {/* Filter Bar */}
      <form className="admin-prayer-filters" onSubmit={applyFilters}>
        <div className="admin-prayer-filter-group">
          <label>Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All Categories</option>
            {CATEGORY_OPTIONS.map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>
        <div className="admin-prayer-filter-group">
          <label>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="prayed">Prayed</option>
          </select>
        </div>
        <div className="admin-prayer-filter-group">
          <label>From Date</label>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        </div>
        <div className="admin-prayer-filter-group">
          <label>To Date</label>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>
        <div className="admin-prayer-filter-actions">
          <button type="submit" className="admin-prayer-btn admin-prayer-btn-blue">Apply Filters</button>
          <button type="button" className="admin-prayer-btn admin-prayer-btn-ghost" onClick={resetFilters}>Reset</button>
        </div>
      </form>

      {loading ? (
        <div className="admin-prayer-loading">Loading...</div>
      ) : requests.length === 0 ? (
        <div className="admin-prayer-empty">
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🙏</div>
          <h3>No Prayer Requests Found</h3>
          <p>There are no prayer requests matching your filters.</p>
        </div>
      ) : (
        <>
          {/* Bulk Actions */}
          <div className="admin-prayer-bulk-bar">
            <label className="admin-prayer-select-all">
              <input type="checkbox" checked={selected.size === requests.length && requests.length > 0} onChange={toggleAll} />
              <span>Select All</span>
            </label>
            <span className="admin-prayer-selected-count">{selected.size} selected</span>
            <button className="admin-prayer-btn admin-prayer-btn-green" onClick={bulkPray} disabled={!selected.size}>
              ✓ Mark Prayed
            </button>
            <button className="admin-prayer-btn admin-prayer-btn-red" onClick={bulkDelete} disabled={!selected.size}>
              🗑 Delete
            </button>
          </div>

          {/* Prayer Cards */}
          <div className="admin-prayer-grid">
            {requests.map((prayer) => (
              <div key={prayer.id} className="admin-prayer-card">
                <input
                  type="checkbox"
                  className="admin-prayer-checkbox"
                  checked={selected.has(prayer.id)}
                  onChange={() => toggleSelected(prayer.id)}
                />
                <div className="admin-prayer-card-header">
                  <span className="admin-prayer-badge admin-prayer-badge-category">
                    {CATEGORY_LABELS[prayer.category] || prayer.category}
                  </span>
                  <span className={`admin-prayer-badge admin-prayer-badge-status ${prayer.status}`}>
                    {prayer.status === 'pending' ? '⏳ Pending' : '✓ Prayed'}
                  </span>
                </div>
                <div className="admin-prayer-card-meta">
                  <span>📅 {formatDate(prayer.submitted_at)}</span>
                  {prayer.prayed_at && <span>✓ Prayed: {formatDate(prayer.prayed_at).split(',')[0]}</span>}
                </div>
                <div className="admin-prayer-card-text">{prayer.prayer_text}</div>
                <div className="admin-prayer-card-actions">
                  {prayer.status === 'pending' && (
                    <button className="admin-prayer-btn admin-prayer-btn-green admin-prayer-btn-sm" onClick={() => markPrayed(prayer.id)}>
                      ✓ Mark Prayed
                    </button>
                  )}
                  <button className="admin-prayer-btn admin-prayer-btn-red admin-prayer-btn-sm" onClick={() => deletePrayer(prayer.id)}>
                    🗑 Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="admin-prayer-pagination">
              <button onClick={() => goToPage(pagination.page - 1)} disabled={pagination.page <= 1}>« Prev</button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  className={p === pagination.page ? 'active' : ''}
                  onClick={() => goToPage(p)}
                >
                  {p}
                </button>
              ))}
              <button onClick={() => goToPage(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages}>Next »</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
