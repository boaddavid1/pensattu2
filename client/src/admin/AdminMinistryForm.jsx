import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { adminApi } from './adminApi';
import { uploadImageToCloudinary } from '../cloudinaryUpload';
import './admin-ministry-editor.css';

const CATEGORY_OPTIONS = [
  'Worship & Creative Arts',
  'Hospitality & Protocol',
  'Outreach & Evangelism',
  'Prayer & Intercession',
  'Media & Tech',
  'Care & Discipleship',
  'Academic & Career',
  'Leadership & Administration',
];

const initialAssistant = () => ({
  id: `ast-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  name: '',
  role: '',
  image_url: '',
  phone: '',
  bio: '',
});

export default function AdminMinistryForm({ isNew: isNewProp }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isNew = isNewProp || id === 'new';
  const passedItem = location.state?.item;

  const [form, setForm] = useState({
    title: '',
    category: 'Worship & Creative Arts',
    meeting: '',
    venue: '',
    display_order: 1,
    is_active: 1,
    image_url: '',
    description: '',
    full_description: '',
    scripture: '',
    responsibilities: '',
    ideal_for: '',
    leader_name: '',
    leader_role: '',
    leader_image: '',
    leader_phone: '',
    leader_email: '',
    leader_bio: '',
  });

  const [assistants, setAssistants] = useState([]);
  const [activities, setActivities] = useState(['']);

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('basic');

  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingLeaderImg, setUploadingLeaderImg] = useState(false);
  const [uploadingAstIdx, setUploadingAstIdx] = useState(null);

  const bannerInputRef = useRef(null);
  const leaderInputRef = useRef(null);

  // Fetch or populate data
  useEffect(() => {
    setError('');

    function populate(item) {
      setForm({
        title: item.title || '',
        category: item.category || 'Worship & Creative Arts',
        meeting: item.meeting || '',
        venue: item.venue || '',
        display_order: item.display_order ?? 1,
        is_active: item.is_active ?? 1,
        image_url: item.image_url || '',
        description: item.description || '',
        full_description: item.full_description || item.fullDescription || '',
        scripture: item.scripture || '',
        responsibilities: item.responsibilities || '',
        ideal_for: item.ideal_for || item.idealFor || '',
        leader_name: item.leader_name || item.leader?.name || '',
        leader_role: item.leader_role || item.leader?.role || '',
        leader_image: item.leader_image || item.leader?.image_url || '',
        leader_phone: item.leader_phone || item.leader?.phone || '',
        leader_email: item.leader_email || item.leader?.email || '',
        leader_bio: item.leader_bio || item.leader?.bio || '',
      });

      // Parse assistants
      let astList = [];
      if (item.assistants) {
        if (typeof item.assistants === 'string') {
          try {
            astList = JSON.parse(item.assistants);
          } catch {
            astList = [];
          }
        } else if (Array.isArray(item.assistants)) {
          astList = item.assistants;
        }
      }
      setAssistants(Array.isArray(astList) ? astList : []);

      // Parse activities
      let actList = [];
      if (item.activities) {
        if (typeof item.activities === 'string') {
          try {
            actList = JSON.parse(item.activities);
          } catch {
            actList = item.activities.split('\n').filter(Boolean);
          }
        } else if (Array.isArray(item.activities)) {
          actList = item.activities;
        }
      }
      setActivities(Array.isArray(actList) && actList.length > 0 ? actList : ['']);
    }

    if (isNew) {
      setLoading(false);
      return;
    }

    if (passedItem) {
      populate(passedItem);
      setLoading(false);
      return;
    }

    // Fetch from backend
    adminApi
      .get('ministries', id)
      .then((data) => {
        populate(data);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load ministry details');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id, isNew, passedItem]);

  // Keyboard shortcut Ctrl+S / Cmd+S
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSubmit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  function handleChange(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  // Cover Banner Upload
  async function handleCoverUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    setError('');
    try {
      const url = await uploadImageToCloudinary(file, 'pensattu/ministries');
      handleChange('image_url', url);
    } catch (err) {
      setError(err.message || 'Banner upload failed');
    } finally {
      setUploadingImage(false);
    }
  }

  // Leader Photo Upload
  async function handleLeaderUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLeaderImg(true);
    setError('');
    try {
      const url = await uploadImageToCloudinary(file, 'pensattu/ministries/leaders');
      handleChange('leader_image', url);
    } catch (err) {
      setError(err.message || 'Leader photo upload failed');
    } finally {
      setUploadingLeaderImg(false);
    }
  }

  // Assistants handling
  function addAssistant() {
    setAssistants((prev) => [...prev, initialAssistant()]);
  }

  function updateAssistant(index, field, value) {
    setAssistants((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  }

  function removeAssistant(index) {
    setAssistants((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleAssistantUpload(index, e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAstIdx(index);
    setError('');
    try {
      const url = await uploadImageToCloudinary(file, 'pensattu/ministries/assistants');
      updateAssistant(index, 'image_url', url);
    } catch (err) {
      setError(err.message || 'Assistant photo upload failed');
    } finally {
      setUploadingAstIdx(null);
    }
  }

  // Activities handling
  function addActivity() {
    setActivities((prev) => [...prev, '']);
  }

  function updateActivity(index, value) {
    setActivities((prev) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  }

  function removeActivity(index) {
    setActivities((prev) => prev.filter((_, i) => i !== index));
  }

  function scrollToSection(sectionId, tabKey) {
    setActiveTab(tabKey);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  async function handleSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!form.title.trim()) {
      setError('Ministry title is required.');
      scrollToSection('sec-basic', 'basic');
      return;
    }

    setSaving(true);
    setError('');

    const cleanAssistants = assistants.filter((a) => a.name.trim() || a.role.trim());
    const cleanActivities = activities.map((a) => a.trim()).filter(Boolean);

    const payload = {
      ...form,
      display_order: Number(form.display_order) || 0,
      is_active: Number(form.is_active) ? 1 : 0,
      assistants: JSON.stringify(cleanAssistants),
      activities: JSON.stringify(cleanActivities),
    };

    try {
      if (isNew) {
        await adminApi.create('ministries', payload);
      } else {
        await adminApi.update('ministries', id, payload);
      }
      setSaveSuccess(true);
      setTimeout(() => {
        navigate('/control-panel/ministries');
      }, 700);
    } catch (err) {
      setError(err.message || 'Failed to save ministry');
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="ministry-editor-wrap" style={{ textAlign: 'center', padding: '100px 20px' }}>
        <div style={{ fontSize: '32px', marginBottom: '14px' }}>⏳</div>
        <h3 style={{ margin: 0, color: '#0f172a' }}>Loading Ministry Details...</h3>
        <p style={{ color: '#64748b', fontSize: '14px' }}>Fetching department profile from server</p>
      </div>
    );
  }

  return (
    <div className="ministry-editor-wrap">
      {/* ----------------- Breadcrumb Navigation ----------------- */}
      <div className="editor-top-nav">
        <nav className="editor-breadcrumb">
          <Link to="/control-panel/dashboard">Dashboard</Link>
          <span className="sep">/</span>
          <Link to="/control-panel/ministries">Departments &amp; Teams</Link>
          <span className="sep">/</span>
          <span className="current">{isNew ? 'New Department' : form.title || `Ministry #${id}`}</span>
        </nav>
      </div>

      {/* ----------------- Header Hero Bar ----------------- */}
      <div className="editor-header-bar">
        <div className="editor-header-main">
          <div className="editor-title-row">
            <h1 className="editor-title">
              {isNew ? 'New Department' : form.title || 'Edit Ministry'}
            </h1>
            <span className="editor-category-badge">
              🏷️ {form.category}
            </span>
            <span className={`editor-status-pill ${form.is_active ? 'active' : 'inactive'}`}>
              <span className="status-dot" />
              {form.is_active ? 'Published & Active' : 'Hidden / Draft'}
            </span>
          </div>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
            {isNew
              ? 'Configure leadership, meeting times, and department overview.'
              : `Managing public profile, leadership hierarchy, and regular activities.`}
          </p>
        </div>

        <div className="editor-header-actions">
          {!isNew && (
            <a
              href={`/departments-and-teams/${id}`}
              target="_blank"
              rel="noreferrer"
              className="btn-editor-live"
              title="Open public page in new tab"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              View on Site
            </a>
          )}

          <button
            type="button"
            className="btn-editor-cancel"
            onClick={() => navigate('/control-panel/ministries')}
          >
            Cancel
          </button>

          <button
            type="button"
            className="btn-editor-save"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? (
              <>Saving...</>
            ) : saveSuccess ? (
              <>✓ Saved!</>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {isNew ? 'Create Department' : 'Save Changes'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* ----------------- Section Jump Tabs ----------------- */}
      <div className="editor-section-nav">
        <button
          type="button"
          className={`editor-nav-tab ${activeTab === 'basic' ? 'active' : ''}`}
          onClick={() => scrollToSection('sec-basic', 'basic')}
        >
          <span>🏛️</span> Basic Details
        </button>
        <button
          type="button"
          className={`editor-nav-tab ${activeTab === 'media' ? 'active' : ''}`}
          onClick={() => scrollToSection('sec-media', 'media')}
        >
          <span>🖼️</span> Cover Banner
        </button>
        <button
          type="button"
          className={`editor-nav-tab ${activeTab === 'leader' ? 'active' : ''}`}
          onClick={() => scrollToSection('sec-leader', 'leader')}
        >
          <span>👤</span> Primary Leader
        </button>
        <button
          type="button"
          className={`editor-nav-tab ${activeTab === 'assistants' ? 'active' : ''}`}
          onClick={() => scrollToSection('sec-assistants', 'assistants')}
        >
          <span>👥</span> Assistant Leaders
          <span className="tab-count">{assistants.length}</span>
        </button>
        <button
          type="button"
          className={`editor-nav-tab ${activeTab === 'activities' ? 'active' : ''}`}
          onClick={() => scrollToSection('sec-activities', 'activities')}
        >
          <span>🗓️</span> Key Activities
          <span className="tab-count">{activities.filter(Boolean).length}</span>
        </button>
      </div>

      {/* ----------------- Error Banner ----------------- */}
      {error && (
        <div
          className="admin-error"
          style={{
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            borderRadius: '12px',
            padding: '14px 18px',
          }}
        >
          <span style={{ fontSize: '18px' }}>⚠️</span>
          <span style={{ flex: 1, fontWeight: 500 }}>{error}</span>
          <button
            type="button"
            onClick={() => setError('')}
            style={{ background: 'none', border: 'none', color: '#991B1B', cursor: 'pointer', fontWeight: 'bold' }}
          >
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* =========================================================================
            SECTION 1: Basic Information
            ========================================================================= */}
        <section id="sec-basic" className="editor-card">
          <div className="editor-card-header">
            <div className="editor-card-title-group">
              <h2 className="editor-card-title">
                <span className="editor-icon-badge">🏛️</span>
                Department Profile &amp; Meeting Schedule
              </h2>
              <p className="editor-card-subtitle">
                Core identity, public category classification, meeting intervals, and scriptural foundation.
              </p>
            </div>

            {/* iOS Style Active Toggle Switch */}
            <div
              className="editor-switch-container"
              onClick={() => handleChange('is_active', form.is_active ? 0 : 1)}
              title="Click to toggle department visibility"
            >
              <div className={`editor-switch-track ${form.is_active ? 'on' : ''}`}>
                <div className="editor-switch-thumb" />
              </div>
              <div className="editor-switch-label">
                <span className="editor-switch-title">
                  {form.is_active ? 'Active & Visible' : 'Hidden from Public'}
                </span>
                <span className="editor-switch-desc">
                  {form.is_active ? 'Shown in public menus' : 'Draft / offline mode'}
                </span>
              </div>
            </div>
          </div>

          <div className="editor-form-grid">
            <div className="editor-field full-width">
              <label className="editor-label">
                <span>Ministry / Department Title <span className="required">*</span></span>
                <span className="hint">Public name displayed across headers and cards</span>
              </label>
              <input
                type="text"
                className="editor-input"
                value={form.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="e.g. Counseling & Welfare Ministry"
                required
              />
            </div>

            <div className="editor-field">
              <label className="editor-label">
                <span>Category Classification</span>
                <span className="hint">Groups related departments</span>
              </label>
              <select
                className="editor-select"
                value={form.category}
                onChange={(e) => handleChange('category', e.target.value)}
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="editor-field">
              <label className="editor-label">
                <span>Display Order Index</span>
                <span className="hint">Lower numbers appear first</span>
              </label>
              <input
                type="number"
                className="editor-input"
                value={form.display_order}
                onChange={(e) => handleChange('display_order', e.target.value)}
                min="0"
              />
            </div>

            <div className="editor-field">
              <label className="editor-label">
                <span>Meeting Schedule &amp; Day</span>
                <span className="hint">e.g. Tuesdays, 4:00 PM</span>
              </label>
              <input
                type="text"
                className="editor-input"
                value={form.meeting}
                onChange={(e) => handleChange('meeting', e.target.value)}
                placeholder="e.g. Saturdays, 3:00 PM - 5:30 PM"
              />
            </div>

            <div className="editor-field">
              <label className="editor-label">
                <span>Meeting Venue / Room</span>
                <span className="hint">Physical location on campus</span>
              </label>
              <input
                type="text"
                className="editor-input"
                value={form.venue}
                onChange={(e) => handleChange('venue', e.target.value)}
                placeholder="e.g. Main Auditorium & Welfare Room"
              />
            </div>

            <div className="editor-field full-width">
              <label className="editor-label">
                <span>Short Summary Description</span>
                <span className="hint">Concise 1–2 sentence overview for cards and listings</span>
              </label>
              <textarea
                className="editor-textarea"
                rows={2}
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Ensuring no member walks alone. Providing compassionate pastoral care, emotional support, and welfare assistance..."
              />
            </div>

            <div className="editor-field full-width">
              <label className="editor-label">
                <span>Full In-Depth Description</span>
                <span className="hint">Displayed prominently on the ministry's dedicated page</span>
              </label>
              <textarea
                className="editor-textarea"
                rows={4}
                value={form.full_description}
                onChange={(e) => handleChange('full_description', e.target.value)}
                placeholder="The Counseling & Welfare Ministry offers confidential, biblically grounded counseling, welfare relief packages, academic encouragement, and sincere brotherhood..."
              />
            </div>

            <div className="editor-field full-width">
              <label className="editor-label">
                <span>Scripture Reference &amp; Verse</span>
                <span className="hint">Biblical guiding principle for this ministry</span>
              </label>
              <input
                type="text"
                className="editor-input"
                value={form.scripture}
                onChange={(e) => handleChange('scripture', e.target.value)}
                placeholder='e.g. Galatians 6:2 — "Bear ye one another&apos;s burdens, and so fulfil the law of Christ."'
              />
              {form.scripture && (
                <div className="scripture-preview-card">
                  <span className="quote-mark">&ldquo;</span>
                  <span>{form.scripture}</span>
                </div>
              )}
            </div>

            <div className="editor-field">
              <label className="editor-label">
                <span>Core Responsibilities</span>
                <span className="hint">What duties do members fulfill?</span>
              </label>
              <textarea
                className="editor-textarea"
                rows={3}
                value={form.responsibilities}
                onChange={(e) => handleChange('responsibilities', e.target.value)}
                placeholder="Providing confidential counseling; distributing emergency relief; visiting sick members in hospitals and hostels..."
              />
            </div>

            <div className="editor-field">
              <label className="editor-label">
                <span>Who Should Join (Ideal For)</span>
                <span className="hint">Target skills, temperament, or gifts</span>
              </label>
              <textarea
                className="editor-textarea"
                rows={3}
                value={form.ideal_for}
                onChange={(e) => handleChange('ideal_for', e.target.value)}
                placeholder="Empathetic listeners, caregivers, people with discerning hearts, and welfare volunteers..."
              />
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 2: Cover Banner & Media
            ========================================================================= */}
        <section id="sec-media" className="editor-card">
          <div className="editor-card-header">
            <div className="editor-card-title-group">
              <h2 className="editor-card-title">
                <span className="editor-icon-badge">🖼️</span>
                Cover Banner &amp; Media
              </h2>
              <p className="editor-card-subtitle">
                High-resolution banner photo displayed in the hero section and previews.
              </p>
            </div>
          </div>

          <div className="banner-upload-zone">
            <input
              type="file"
              ref={bannerInputRef}
              accept="image/*"
              onChange={handleCoverUpload}
              disabled={uploadingImage}
              style={{ display: 'none' }}
            />

            {form.image_url ? (
              <div className="banner-preview-box">
                <img src={form.image_url} alt="Department Banner" className="banner-preview-img" />
                <div className="banner-overlay-actions">
                  <div className="banner-info-badge">
                    <span>Aspect Ratio: 16:9 • High Quality</span>
                  </div>
                  <div className="banner-action-buttons">
                    <button
                      type="button"
                      className="btn-banner-action btn-banner-change"
                      onClick={() => bannerInputRef.current?.click()}
                      disabled={uploadingImage}
                    >
                      {uploadingImage ? 'Uploading...' : 'Change Banner'}
                    </button>
                    <button
                      type="button"
                      className="btn-banner-action btn-banner-remove"
                      onClick={() => handleChange('image_url', '')}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="banner-empty-dropzone"
                onClick={() => bannerInputRef.current?.click()}
              >
                <div className="dropzone-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
                <div className="dropzone-text">
                  <strong>
                    {uploadingImage ? 'Uploading cover photo...' : 'Click to upload department cover photo'}
                  </strong>
                  <span>Supports WebP, PNG, JPG up to 10MB (recommended 1200 × 630px)</span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* =========================================================================
            SECTION 3: Primary Ministry Leader
            ========================================================================= */}
        <section id="sec-leader" className="editor-card">
          <div className="editor-card-header">
            <div className="editor-card-title-group">
              <h2 className="editor-card-title">
                <span className="editor-icon-badge">👤</span>
                Primary Ministry Leader
              </h2>
              <p className="editor-card-subtitle">
                The lead minister, director, or head coordinator guiding this ministry.
              </p>
            </div>
          </div>

          <div className="leader-profile-layout">
            {/* Avatar Column */}
            <div className="leader-avatar-column">
              <div className="leader-avatar-circle">
                {form.leader_image ? (
                  <img src={form.leader_image} alt="Ministry Leader" className="leader-avatar-img" />
                ) : (
                  <span className="leader-avatar-placeholder">👤</span>
                )}
              </div>

              <input
                type="file"
                ref={leaderInputRef}
                accept="image/*"
                onChange={handleLeaderUpload}
                disabled={uploadingLeaderImg}
                style={{ display: 'none' }}
              />

              <button
                type="button"
                className="leader-photo-btn"
                onClick={() => leaderInputRef.current?.click()}
                disabled={uploadingLeaderImg}
              >
                {uploadingLeaderImg ? 'Uploading...' : form.leader_image ? 'Change Photo' : 'Upload Photo'}
              </button>

              {form.leader_image && (
                <button
                  type="button"
                  onClick={() => handleChange('leader_image', '')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ef4444',
                    fontSize: '11.5px',
                    cursor: 'pointer',
                    marginTop: '-4px',
                  }}
                >
                  Remove
                </button>
              )}
            </div>

            {/* Profile Inputs */}
            <div className="editor-form-grid">
              <div className="editor-field">
                <label className="editor-label">
                  <span>Leader Full Name</span>
                  <span className="hint">Include honorific e.g. Deaconess, Minister</span>
                </label>
                <input
                  type="text"
                  className="editor-input"
                  value={form.leader_name}
                  onChange={(e) => handleChange('leader_name', e.target.value)}
                  placeholder="e.g. Deaconess Sarah Owusu"
                />
              </div>

              <div className="editor-field">
                <label className="editor-label">
                  <span>Role / Leadership Portfolio</span>
                  <span className="hint">e.g. Welfare &amp; Care Secretary</span>
                </label>
                <input
                  type="text"
                  className="editor-input"
                  value={form.leader_role}
                  onChange={(e) => handleChange('leader_role', e.target.value)}
                  placeholder="e.g. Music Director &amp; Head of Worship"
                />
              </div>

              <div className="editor-field">
                <label className="editor-label">
                  <span>Phone / WhatsApp Contact</span>
                  <span className="hint">With country code</span>
                </label>
                <input
                  type="text"
                  className="editor-input"
                  value={form.leader_phone}
                  onChange={(e) => handleChange('leader_phone', e.target.value)}
                  placeholder="e.g. +233 54 990 4123"
                />
              </div>

              <div className="editor-field">
                <label className="editor-label">
                  <span>Official Email Address</span>
                  <span className="hint">For inquiries and pastoral care</span>
                </label>
                <input
                  type="email"
                  className="editor-input"
                  value={form.leader_email}
                  onChange={(e) => handleChange('leader_email', e.target.value)}
                  placeholder="e.g. welfare@pensattu.org"
                />
              </div>

              <div className="editor-field full-width">
                <label className="editor-label">
                  <span>Leader Biography &amp; Ministry Heart</span>
                  <span className="hint">Brief background, calling, and message to students</span>
                </label>
                <textarea
                  className="editor-textarea"
                  rows={2}
                  value={form.leader_bio}
                  onChange={(e) => handleChange('leader_bio', e.target.value)}
                  placeholder="Compassionate counselor committed to the emotional, spiritual, and physical well-being of all students..."
                />
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 4: Assistant Leaders ("Assistances")
            ========================================================================= */}
        <section id="sec-assistants" className="editor-card">
          <div className="editor-card-header">
            <div className="editor-card-title-group">
              <h2 className="editor-card-title">
                <span className="editor-icon-badge">👥</span>
                Assistant Leaders (&quot;Assistances&quot;)
              </h2>
              <p className="editor-card-subtitle">
                Deputies, assistant directors, section heads, and portfolio coordinators.
              </p>
            </div>

            <button
              type="button"
              className="btn-editor-live"
              onClick={addAssistant}
              style={{ background: '#f0fdf4', color: '#166534', borderColor: '#bbf7d0', fontWeight: 700 }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Assistant Leader
            </button>
          </div>

          {assistants.length === 0 ? (
            <div className="assistants-empty-state">
              <div className="empty-icon">👥</div>
              <p>No assistant leaders have been assigned to this department yet.</p>
              <button
                type="button"
                className="btn-editor-save"
                onClick={addAssistant}
                style={{ margin: '0 auto', fontSize: '13.5px', padding: '8px 18px' }}
              >
                + Add First Assistant
              </button>
            </div>
          ) : (
            <div className="assistant-cards-list">
              {assistants.map((ast, index) => (
                <div key={ast.id || index} className="assistant-card">
                  <div className="assistant-card-header">
                    <div className="assistant-card-badge">
                      <span className="assistant-number-tag">{index + 1}</span>
                      <span>{ast.role || 'Assistant Leader'}</span>
                    </div>

                    <button
                      type="button"
                      className="btn-remove-assistant"
                      onClick={() => removeAssistant(index)}
                      title="Remove this assistant leader"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                      Remove Assistant
                    </button>
                  </div>

                  <div className="assistant-card-body">
                    {/* Avatar */}
                    <div className="assistant-avatar-box">
                      <div className="assistant-avatar-circle">
                        {ast.image_url ? (
                          <img src={ast.image_url} alt={ast.name || 'Assistant'} />
                        ) : (
                          <span style={{ fontSize: '26px', color: '#94a3b8' }}>👤</span>
                        )}
                      </div>

                      <label className="assistant-photo-label">
                        {uploadingAstIdx === index ? 'Uploading...' : ast.image_url ? 'Change' : 'Add Photo'}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleAssistantUpload(index, e)}
                          disabled={uploadingAstIdx === index}
                          style={{ display: 'none' }}
                        />
                      </label>
                    </div>

                    {/* Inputs */}
                    <div className="editor-form-grid">
                      <div className="editor-field">
                        <label className="editor-label">
                          <span>Full Name <span className="required">*</span></span>
                        </label>
                        <input
                          type="text"
                          className="editor-input"
                          value={ast.name}
                          onChange={(e) => updateAssistant(index, 'name', e.target.value)}
                          placeholder="e.g. Bro. Stephen Coffie"
                          required
                        />
                      </div>

                      <div className="editor-field">
                        <label className="editor-label">
                          <span>Portfolio / Role</span>
                        </label>
                        <input
                          type="text"
                          className="editor-input"
                          value={ast.role}
                          onChange={(e) => updateAssistant(index, 'role', e.target.value)}
                          placeholder="e.g. Hostel &amp; Hospital Visitation Lead"
                        />
                      </div>

                      <div className="editor-field">
                        <label className="editor-label">
                          <span>Phone / WhatsApp Contact</span>
                        </label>
                        <input
                          type="text"
                          className="editor-input"
                          value={ast.phone}
                          onChange={(e) => updateAssistant(index, 'phone', e.target.value)}
                          placeholder="e.g. +233 24 881 2340"
                        />
                      </div>

                      <div className="editor-field">
                        <label className="editor-label">
                          <span>Scope / Responsibilities Note</span>
                        </label>
                        <input
                          type="text"
                          className="editor-input"
                          value={ast.bio}
                          onChange={(e) => updateAssistant(index, 'bio', e.target.value)}
                          placeholder="Organizes weekly check-in visits to sick students..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* =========================================================================
            SECTION 5: Key Regular Activities
            ========================================================================= */}
        <section id="sec-activities" className="editor-card">
          <div className="editor-card-header">
            <div className="editor-card-title-group">
              <h2 className="editor-card-title">
                <span className="editor-icon-badge">🗓️</span>
                Key Regular Activities
              </h2>
              <p className="editor-card-subtitle">
                Scheduled weekly or recurring sessions listed on the ministry profile page.
              </p>
            </div>

            <button
              type="button"
              className="btn-editor-live"
              onClick={addActivity}
              style={{ fontWeight: 600 }}
            >
              + Add Activity
            </button>
          </div>

          <div className="activities-list">
            {activities.map((act, idx) => (
              <div key={idx} className="activity-row">
                <span className="activity-badge">{String(idx + 1).padStart(2, '0')}</span>
                <input
                  type="text"
                  className="activity-input"
                  value={act}
                  onChange={(e) => updateActivity(idx, e.target.value)}
                  placeholder="e.g. Hospital and hostel visitation drives"
                />
                {activities.length > 1 && (
                  <button
                    type="button"
                    className="btn-remove-activity"
                    onClick={() => removeActivity(idx)}
                    title="Remove activity item"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              className="btn-add-activity-dashed"
              onClick={addActivity}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Another Regular Activity
            </button>
          </div>
        </section>

        {/* ----------------- Sticky Bottom Save Bar ----------------- */}
        <div className="editor-sticky-footer">
          <div className="footer-info">
            <span>Editing: <strong>{form.title || 'Department'}</strong></span>
            <span>•</span>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Press Ctrl + S to save</span>
          </div>

          <div className="footer-actions">
            <button
              type="button"
              className="btn-editor-cancel"
              onClick={() => navigate('/control-panel/ministries')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-editor-save"
              disabled={saving}
            >
              {saving ? 'Saving...' : saveSuccess ? '✓ Saved!' : isNew ? 'Create Department' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
