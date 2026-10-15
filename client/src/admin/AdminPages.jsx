import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApi } from './adminApi';
import { uploadImageToCloudinary } from '../cloudinaryUpload';
import {
  DEFAULT_ABOUT_SETTINGS,
  DEFAULT_CONTACT_SETTINGS,
  DEFAULT_HOME_SETTINGS,
} from '../data/defaultPageSettings';
import './admin-pages.css';

export default function AdminPages() {
  const { activeTab: routeTab } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(
    routeTab && ['about', 'home', 'contact'].includes(routeTab) ? routeTab : 'about'
  );

  useEffect(() => {
    if (routeTab && ['about', 'home', 'contact'].includes(routeTab)) {
      setActiveTab(routeTab);
    }
  }, [routeTab]);

  function switchTab(tab) {
    setActiveTab(tab);
    navigate(`/control-panel/pages/${tab}`);
  }
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Page settings state
  const [aboutSettings, setAboutSettings] = useState(DEFAULT_ABOUT_SETTINGS);
  const [contactSettings, setContactSettings] = useState(DEFAULT_CONTACT_SETTINGS);
  const [homeSettings, setHomeSettings] = useState(DEFAULT_HOME_SETTINGS);

  // Hero slides state for Home page
  const [heroSlides, setHeroSlides] = useState([]);
  const [loadingSlides, setLoadingSlides] = useState(false);

  // Hidden file inputs
  const fileInputRef = useRef(null);
  const currentUploadTargetRef = useRef(null);

  useEffect(() => {
    loadAllSettings();
  }, []);

  // Auto-dismiss success notification
  useEffect(() => {
    if (!successMsg) return;
    const timer = setTimeout(() => setSuccessMsg(''), 4000);
    return () => clearTimeout(timer);
  }, [successMsg]);

  async function loadAllSettings() {
    setLoading(true);
    setErrorMsg('');
    try {
      const [aboutRes, contactRes, homeRes, slidesRes] = await Promise.all([
        adminApi.getPageSettings('about').catch(() => ({})),
        adminApi.getPageSettings('contact').catch(() => ({})),
        adminApi.getPageSettings('home').catch(() => ({})),
        adminApi.listHeroSlides().catch(() => []),
      ]);

      setAboutSettings((prev) => ({ ...prev, ...(aboutRes || {}) }));
      setContactSettings((prev) => ({ ...prev, ...(contactRes || {}) }));
      setHomeSettings((prev) => ({ ...prev, ...(homeRes || {}) }));
      setHeroSlides(Array.isArray(slidesRes) ? slidesRes : []);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load page settings.');
    } finally {
      setLoading(false);
    }
  }

  // Save current active tab settings
  async function handleSaveCurrentTab() {
    setSaving(true);
    setErrorMsg('');
    try {
      if (activeTab === 'about') {
        await adminApi.updatePageSettings('about', aboutSettings);
        setSuccessMsg('About page write-ups, media, and sections updated successfully!');
      } else if (activeTab === 'contact') {
        await adminApi.updatePageSettings('contact', contactSettings);
        setSuccessMsg('Contact page information and details updated successfully!');
      } else if (activeTab === 'home') {
        await adminApi.updatePageSettings('home', homeSettings);
        setSuccessMsg('Home page story and reasons updated successfully!');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  // Reset current active tab to factory defaults
  function handleResetToDefaults() {
    if (!window.confirm(`Reset all content on the ${activeTab.toUpperCase()} page back to default church text?`)) return;
    if (activeTab === 'about') setAboutSettings(DEFAULT_ABOUT_SETTINGS);
    else if (activeTab === 'contact') setContactSettings(DEFAULT_CONTACT_SETTINGS);
    else if (activeTab === 'home') setHomeSettings(DEFAULT_HOME_SETTINGS);
    setSuccessMsg(`Reset ${activeTab} page to default template. Click "Save Changes" to publish.`);
  }

  // Trigger file upload for any specific image field
  function triggerImageUpload(fieldPath) {
    currentUploadTargetRef.current = fieldPath;
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  }

  async function handleFileSelected(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const target = currentUploadTargetRef.current;
    if (!target) return;

    setUploadingField(target);
    setErrorMsg('');
    try {
      const url = await uploadImageToCloudinary(file, 'pensattu/pages');

      if (activeTab === 'about') {
        setAboutSettings((prev) => ({ ...prev, [target]: url }));
      } else if (activeTab === 'contact') {
        setContactSettings((prev) => ({ ...prev, [target]: url }));
      } else if (activeTab === 'home') {
        setHomeSettings((prev) => ({ ...prev, [target]: url }));
      }
      setSuccessMsg(`Image uploaded to Cloudinary for ${target.replace(/_/g, ' ')}!`);
    } catch (err) {
      setErrorMsg(err.message || 'Image upload failed. You can also paste an image URL directly.');
    } finally {
      setUploadingField(null);
      currentUploadTargetRef.current = null;
    }
  }

  // Array item helpers for About Page
  function updateAboutArrayItem(arrayKey, index, key, value) {
    setAboutSettings((prev) => {
      const list = [...(prev[arrayKey] || [])];
      list[index] = { ...list[index], [key]: value };
      return { ...prev, [arrayKey]: list };
    });
  }

  function addAboutArrayItem(arrayKey, emptyTemplate) {
    setAboutSettings((prev) => ({
      ...prev,
      [arrayKey]: [...(prev[arrayKey] || []), emptyTemplate],
    }));
  }

  function removeAboutArrayItem(arrayKey, index) {
    setAboutSettings((prev) => {
      const list = [...(prev[arrayKey] || [])];
      list.splice(index, 1);
      return { ...prev, [arrayKey]: list };
    });
  }

  // Public page URL preview helper
  const publicPageUrl =
    activeTab === 'about' ? '/about' : activeTab === 'contact' ? '/contact' : '/';

  if (loading) {
    return (
      <div className="admin-pages-container">
        <div className="ap-hero">
          <div>
            <h1 className="ap-hero-title">Site Pages & Content Studio</h1>
            <p className="ap-hero-subtitle">Loading page settings and content configurations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-pages-container">
      {/* Hidden file input for Cloudinary uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileSelected}
      />

      {/* ─── Hero Header & Global Actions ─── */}
      <div className="ap-hero">
        <div>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: '#0E4C92', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            CMS Studio • Live Content Management
          </span>
          <h1 className="ap-hero-title">Site Pages & Write-ups Studio</h1>
          <p className="ap-hero-subtitle">
            Customise titles, paragraphs, banners, stories, values, and community information across the public church pages.
          </p>
        </div>

        <div className="ap-hero-actions">
          <a
            href={publicPageUrl}
            target="_blank"
            rel="noreferrer"
            className="ap-view-site-link"
            title="Preview public page in new tab"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            View Live {activeTab.toUpperCase()}
          </a>

          <button
            type="button"
            className="ap-save-btn"
            onClick={handleSaveCurrentTab}
            disabled={saving}
          >
            {saving ? (
              <>Saving...</>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                Save {activeTab.toUpperCase()} Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* ─── Notification Alerts ─── */}
      {successMsg && (
        <div className="ag-alert success">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>✓ {successMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMsg('')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
          >
            ✕
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="ag-alert error">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>✕ {errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg('')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* ─── Page Tabs Bar ─── */}
      <div className="ap-tabs-bar">
        <div className="ap-tabs-list">
          <button
            type="button"
            className={`ap-tab-item ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => switchTab('about')}
          >
            📖 About Page Editor
          </button>
          <button
            type="button"
            className={`ap-tab-item ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => switchTab('home')}
          >
            🏠 Home Page Sections
          </button>
          <button
            type="button"
            className={`ap-tab-item ${activeTab === 'contact' ? 'active' : ''}`}
            onClick={() => switchTab('contact')}
          >
            ✉️ Contact & Visit Page
          </button>
        </div>

        <button
          type="button"
          className="ap-reset-btn"
          onClick={handleResetToDefaults}
          title="Reset to default text template"
        >
          ↺ Reset {activeTab} to Defaults
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          TAB 1: ABOUT PAGE CONTENT EDITOR
      ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'about' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Section 1: Hero Banner */}
          <div className="ap-section-card">
            <div className="ap-section-header">
              <h3 className="ap-section-title">
                <span>1. Hero Header Banner</span>
              </h3>
              <span className="ap-section-badge">Top of Page</span>
            </div>
            <div className="ap-section-body">
              <div className="ap-form-grid-2">
                <div className="ap-form-group">
                  <label className="ap-form-label">Eyebrow Tagline</label>
                  <input
                    type="text"
                    className="ap-form-input"
                    value={aboutSettings.hero_eyebrow || ''}
                    onChange={(e) => setAboutSettings({ ...aboutSettings, hero_eyebrow: e.target.value })}
                    placeholder="e.g. About PENSA TTU"
                  />
                </div>
                <div className="ap-form-group">
                  <label className="ap-form-label">Hero Background Image</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="text"
                      className="ap-form-input"
                      value={aboutSettings.hero_image || ''}
                      onChange={(e) => setAboutSettings({ ...aboutSettings, hero_image: e.target.value })}
                      placeholder="Image URL or upload below..."
                    />
                    <button
                      type="button"
                      className="ap-upload-file-btn"
                      onClick={() => triggerImageUpload('hero_image')}
                      disabled={uploadingField === 'hero_image'}
                    >
                      {uploadingField === 'hero_image' ? 'Uploading...' : 'Upload'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="ap-form-group">
                <label className="ap-form-label">Main Heading</label>
                <input
                  type="text"
                  className="ap-form-input"
                  value={aboutSettings.hero_title || ''}
                  onChange={(e) => setAboutSettings({ ...aboutSettings, hero_title: e.target.value })}
                  placeholder="e.g. A church built on showing up, not showing off."
                />
              </div>

              <div className="ap-form-group">
                <label className="ap-form-label">Subtitle / Introductory Paragraph</label>
                <textarea
                  className="ap-form-textarea"
                  rows={2}
                  value={aboutSettings.hero_subtitle || ''}
                  onChange={(e) => setAboutSettings({ ...aboutSettings, hero_subtitle: e.target.value })}
                  placeholder="Introductory text describing the community..."
                />
              </div>

              {aboutSettings.hero_image && (
                <div className="ap-image-preview-wrap" style={{ height: 140 }}>
                  <img src={aboutSettings.hero_image} alt="Hero banner preview" className="ap-image-preview" />
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Origins Story ("How We Started") */}
          <div className="ap-section-card">
            <div className="ap-section-header">
              <h3 className="ap-section-title">
                <span>2. Origins Story ("How We Started")</span>
              </h3>
              <span className="ap-section-badge">Split Story Section</span>
            </div>
            <div className="ap-section-body">
              <div className="ap-form-grid-2">
                <div className="ap-form-group">
                  <label className="ap-form-label">Section Eyebrow</label>
                  <input
                    type="text"
                    className="ap-form-input"
                    value={aboutSettings.story_eyebrow || ''}
                    onChange={(e) => setAboutSettings({ ...aboutSettings, story_eyebrow: e.target.value })}
                    placeholder="e.g. How we started"
                  />
                </div>
                <div className="ap-form-group">
                  <label className="ap-form-label">Story Section Title</label>
                  <input
                    type="text"
                    className="ap-form-input"
                    value={aboutSettings.story_title || ''}
                    onChange={(e) => setAboutSettings({ ...aboutSettings, story_title: e.target.value })}
                    placeholder="e.g. From a rented hall to a home for hundreds."
                  />
                </div>
              </div>

              <div className="ap-form-group">
                <label className="ap-form-label">Story Paragraph 1 (The Beginning)</label>
                <textarea
                  className="ap-form-textarea"
                  rows={2}
                  value={aboutSettings.story_p1 || ''}
                  onChange={(e) => setAboutSettings({ ...aboutSettings, story_p1: e.target.value })}
                />
              </div>

              <div className="ap-form-group">
                <label className="ap-form-label">Story Paragraph 2 (The Growth)</label>
                <textarea
                  className="ap-form-textarea"
                  rows={2}
                  value={aboutSettings.story_p2 || ''}
                  onChange={(e) => setAboutSettings({ ...aboutSettings, story_p2: e.target.value })}
                />
              </div>

              <div className="ap-form-group">
                <label className="ap-form-label">Story Paragraph 3 (Our Heart Today)</label>
                <textarea
                  className="ap-form-textarea"
                  rows={2}
                  value={aboutSettings.story_p3 || ''}
                  onChange={(e) => setAboutSettings({ ...aboutSettings, story_p3: e.target.value })}
                />
              </div>

              <div className="ap-form-grid-2">
                <div className="ap-form-group">
                  <label className="ap-form-label">Story Media Image</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="text"
                      className="ap-form-input"
                      value={aboutSettings.story_image || ''}
                      onChange={(e) => setAboutSettings({ ...aboutSettings, story_image: e.target.value })}
                      placeholder="Image URL..."
                    />
                    <button
                      type="button"
                      className="ap-upload-file-btn"
                      onClick={() => triggerImageUpload('story_image')}
                      disabled={uploadingField === 'story_image'}
                    >
                      {uploadingField === 'story_image' ? 'Uploading...' : 'Upload'}
                    </button>
                  </div>
                </div>

                <div className="ap-form-group">
                  <label className="ap-form-label">Story Action Button Text & Link</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="text"
                      className="ap-form-input"
                      value={aboutSettings.story_btn_text || ''}
                      onChange={(e) => setAboutSettings({ ...aboutSettings, story_btn_text: e.target.value })}
                      placeholder="Button text..."
                    />
                    <input
                      type="text"
                      className="ap-form-input"
                      value={aboutSettings.story_btn_link || ''}
                      onChange={(e) => setAboutSettings({ ...aboutSettings, story_btn_link: e.target.value })}
                      placeholder="/#team"
                    />
                  </div>
                </div>
              </div>

              {aboutSettings.story_image && (
                <div className="ap-image-preview-wrap" style={{ height: 160 }}>
                  <img src={aboutSettings.story_image} alt="Story section preview" className="ap-image-preview" />
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Core Values Cards */}
          <div className="ap-section-card">
            <div className="ap-section-header">
              <h3 className="ap-section-title">
                <span>3. Core Values ("What We Value")</span>
              </h3>
              <span className="ap-section-badge">{(aboutSettings.values_list || []).length} Values</span>
            </div>
            <div className="ap-section-body">
              <div className="ap-form-grid-2">
                <div className="ap-form-group">
                  <label className="ap-form-label">Values Eyebrow</label>
                  <input
                    type="text"
                    className="ap-form-input"
                    value={aboutSettings.values_eyebrow || ''}
                    onChange={(e) => setAboutSettings({ ...aboutSettings, values_eyebrow: e.target.value })}
                  />
                </div>
                <div className="ap-form-group">
                  <label className="ap-form-label">Values Main Title</label>
                  <input
                    type="text"
                    className="ap-form-input"
                    value={aboutSettings.values_title || ''}
                    onChange={(e) => setAboutSettings({ ...aboutSettings, values_title: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
                {(aboutSettings.values_list || []).map((val, idx) => (
                  <div key={idx} className="ap-item-card">
                    <div className="ap-item-card-header">
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#0A2E5C' }}>Value #{idx + 1}</span>
                      <button
                        type="button"
                        className="ap-remove-item-btn"
                        onClick={() => removeAboutArrayItem('values_list', idx)}
                      >
                        ✕ Remove
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        type="text"
                        style={{ width: 60 }}
                        className="ap-form-input"
                        placeholder="Icon"
                        value={val.ic || ''}
                        onChange={(e) => updateAboutArrayItem('values_list', idx, 'ic', e.target.value)}
                      />
                      <input
                        type="text"
                        className="ap-form-input"
                        placeholder="Value title..."
                        value={val.title || ''}
                        onChange={(e) => updateAboutArrayItem('values_list', idx, 'title', e.target.value)}
                      />
                    </div>

                    <textarea
                      className="ap-form-textarea"
                      rows={2}
                      placeholder="Description of this value..."
                      value={val.text || ''}
                      onChange={(e) => updateAboutArrayItem('values_list', idx, 'text', e.target.value)}
                    />
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="ap-add-item-btn"
                onClick={() => addAboutArrayItem('values_list', { ic: '✨', title: 'New Value', text: 'Value description...' })}
              >
                + Add Another Value Card
              </button>
            </div>
          </div>

          {/* Section 4: Key Stats Numbers Strip */}
          <div className="ap-section-card">
            <div className="ap-section-header">
              <h3 className="ap-section-title">
                <span>4. Key Numbers & Stats Strip</span>
              </h3>
              <span className="ap-section-badge">{(aboutSettings.stats_list || []).length} Stats</span>
            </div>
            <div className="ap-section-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                {(aboutSettings.stats_list || []).map((stat, idx) => (
                  <div key={idx} className="ap-item-card">
                    <div className="ap-item-card-header">
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#0A2E5C' }}>Stat #{idx + 1}</span>
                      <button
                        type="button"
                        className="ap-remove-item-btn"
                        onClick={() => removeAboutArrayItem('stats_list', idx)}
                      >
                        ✕
                      </button>
                    </div>

                    <input
                      type="text"
                      className="ap-form-input"
                      placeholder="e.g. 500+"
                      style={{ fontSize: 16, fontWeight: 800, color: '#0E4C92' }}
                      value={stat.value || ''}
                      onChange={(e) => updateAboutArrayItem('stats_list', idx, 'value', e.target.value)}
                    />
                    <input
                      type="text"
                      className="ap-form-input"
                      placeholder="Label e.g. Members"
                      value={stat.label || ''}
                      onChange={(e) => updateAboutArrayItem('stats_list', idx, 'label', e.target.value)}
                    />
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="ap-add-item-btn"
                onClick={() => addAboutArrayItem('stats_list', { value: '100+', label: 'New Statistic' })}
              >
                + Add Another Stat Box
              </button>
            </div>
          </div>

          {/* Section 5: Timeline Journey Milestones */}
          <div className="ap-section-card">
            <div className="ap-section-header">
              <h3 className="ap-section-title">
                <span>5. Journey Milestones Timeline</span>
              </h3>
              <span className="ap-section-badge">{(aboutSettings.timeline_list || []).length} Milestones</span>
            </div>
            <div className="ap-section-body">
              <div className="ap-form-grid-2">
                <div className="ap-form-group">
                  <label className="ap-form-label">Timeline Eyebrow</label>
                  <input
                    type="text"
                    className="ap-form-input"
                    value={aboutSettings.timeline_eyebrow || ''}
                    onChange={(e) => setAboutSettings({ ...aboutSettings, timeline_eyebrow: e.target.value })}
                  />
                </div>
                <div className="ap-form-group">
                  <label className="ap-form-label">Timeline Main Heading</label>
                  <input
                    type="text"
                    className="ap-form-input"
                    value={aboutSettings.timeline_title || ''}
                    onChange={(e) => setAboutSettings({ ...aboutSettings, timeline_title: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(aboutSettings.timeline_list || []).map((item, idx) => (
                  <div key={idx} className="ap-item-card">
                    <div className="ap-item-card-header">
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#0A2E5C' }}>Milestone #{idx + 1}</span>
                      <button
                        type="button"
                        className="ap-remove-item-btn"
                        onClick={() => removeAboutArrayItem('timeline_list', idx)}
                      >
                        ✕ Remove
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: 10 }}>
                      <input
                        type="text"
                        style={{ width: 100, fontWeight: 700 }}
                        className="ap-form-input"
                        placeholder="Year (e.g. 2014)"
                        value={item.year || ''}
                        onChange={(e) => updateAboutArrayItem('timeline_list', idx, 'year', e.target.value)}
                      />
                      <input
                        type="text"
                        className="ap-form-input"
                        placeholder="Milestone headline..."
                        value={item.title || ''}
                        onChange={(e) => updateAboutArrayItem('timeline_list', idx, 'title', e.target.value)}
                      />
                    </div>

                    <textarea
                      className="ap-form-textarea"
                      rows={2}
                      placeholder="Milestone description story..."
                      value={item.text || ''}
                      onChange={(e) => updateAboutArrayItem('timeline_list', idx, 'text', e.target.value)}
                    />
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="ap-add-item-btn"
                onClick={() => addAboutArrayItem('timeline_list', { year: '2027', title: 'New Milestone', text: 'Description of milestone...' })}
              >
                + Add Milestone Year
              </button>
            </div>
          </div>

          {/* Section 6: Beliefs & Convictions */}
          <div className="ap-section-card">
            <div className="ap-section-header">
              <h3 className="ap-section-title">
                <span>6. Convictions ("What We Believe")</span>
              </h3>
              <span className="ap-section-badge">{(aboutSettings.beliefs_list || []).length} Convictions</span>
            </div>
            <div className="ap-section-body">
              <div className="ap-form-grid-2">
                <div className="ap-form-group">
                  <label className="ap-form-label">Beliefs Eyebrow</label>
                  <input
                    type="text"
                    className="ap-form-input"
                    value={aboutSettings.beliefs_eyebrow || ''}
                    onChange={(e) => setAboutSettings({ ...aboutSettings, beliefs_eyebrow: e.target.value })}
                  />
                </div>
                <div className="ap-form-group">
                  <label className="ap-form-label">Beliefs Main Title</label>
                  <input
                    type="text"
                    className="ap-form-input"
                    value={aboutSettings.beliefs_title || ''}
                    onChange={(e) => setAboutSettings({ ...aboutSettings, beliefs_title: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
                {(aboutSettings.beliefs_list || []).map((item, idx) => (
                  <div key={idx} className="ap-item-card">
                    <div className="ap-item-card-header">
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#0A2E5C' }}>Conviction #{idx + 1}</span>
                      <button
                        type="button"
                        className="ap-remove-item-btn"
                        onClick={() => removeAboutArrayItem('beliefs_list', idx)}
                      >
                        ✕ Remove
                      </button>
                    </div>

                    <input
                      type="text"
                      className="ap-form-input"
                      placeholder="Title (e.g. Scripture, Grace)"
                      value={item.title || ''}
                      onChange={(e) => updateAboutArrayItem('beliefs_list', idx, 'title', e.target.value)}
                    />

                    <textarea
                      className="ap-form-textarea"
                      rows={3}
                      placeholder="What we believe regarding this doctrine..."
                      value={item.text || ''}
                      onChange={(e) => updateAboutArrayItem('beliefs_list', idx, 'text', e.target.value)}
                    />
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="ap-add-item-btn"
                onClick={() => addAboutArrayItem('beliefs_list', { title: 'New Belief', text: 'Doctrine description...' })}
              >
                + Add Another Belief Item
              </button>
            </div>
          </div>

          {/* Section 7: Bottom CTA Banner */}
          <div className="ap-section-card">
            <div className="ap-section-header">
              <h3 className="ap-section-title">
                <span>7. Call to Action Banner</span>
              </h3>
              <span className="ap-section-badge">Bottom of Page</span>
            </div>
            <div className="ap-section-body">
              <div className="ap-form-group">
                <label className="ap-form-label">CTA Headline</label>
                <input
                  type="text"
                  className="ap-form-input"
                  value={aboutSettings.cta_title || ''}
                  onChange={(e) => setAboutSettings({ ...aboutSettings, cta_title: e.target.value })}
                  placeholder="e.g. Come see it for yourself this Sunday."
                />
              </div>

              <div className="ap-form-grid-2">
                <div className="ap-form-group">
                  <label className="ap-form-label">Button Text</label>
                  <input
                    type="text"
                    className="ap-form-input"
                    value={aboutSettings.cta_btn_text || ''}
                    onChange={(e) => setAboutSettings({ ...aboutSettings, cta_btn_text: e.target.value })}
                    placeholder="Plan your visit"
                  />
                </div>
                <div className="ap-form-group">
                  <label className="ap-form-label">Button Link</label>
                  <input
                    type="text"
                    className="ap-form-input"
                    value={aboutSettings.cta_btn_link || ''}
                    onChange={(e) => setAboutSettings({ ...aboutSettings, cta_btn_link: e.target.value })}
                    placeholder="/#book or /contact"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TAB 2: HOME PAGE SECTIONS
      ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'home' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Section 1: Story Section */}
          <div className="ap-section-card">
            <div className="ap-section-header">
              <h3 className="ap-section-title">
                <span>1. Home Story Section</span>
              </h3>
              <span className="ap-section-badge">Movement Story</span>
            </div>
            <div className="ap-section-body">
              <div className="ap-form-grid-2">
                <div className="ap-form-group">
                  <label className="ap-form-label">Story Eyebrow</label>
                  <input
                    type="text"
                    className="ap-form-input"
                    value={homeSettings.story_eyebrow || ''}
                    onChange={(e) => setHomeSettings({ ...homeSettings, story_eyebrow: e.target.value })}
                  />
                </div>
                <div className="ap-form-group">
                  <label className="ap-form-label">Story Main Heading</label>
                  <input
                    type="text"
                    className="ap-form-input"
                    value={homeSettings.story_title || ''}
                    onChange={(e) => setHomeSettings({ ...homeSettings, story_title: e.target.value })}
                  />
                </div>
              </div>

              <div className="ap-form-group">
                <label className="ap-form-label">Story Paragraph 1</label>
                <textarea
                  className="ap-form-textarea"
                  rows={3}
                  value={homeSettings.story_p1 || ''}
                  onChange={(e) => setHomeSettings({ ...homeSettings, story_p1: e.target.value })}
                />
              </div>

              <div className="ap-form-group">
                <label className="ap-form-label">Story Paragraph 2</label>
                <textarea
                  className="ap-form-textarea"
                  rows={3}
                  value={homeSettings.story_p2 || ''}
                  onChange={(e) => setHomeSettings({ ...homeSettings, story_p2: e.target.value })}
                />
              </div>

              <div className="ap-form-grid-2">
                <div className="ap-form-group">
                  <label className="ap-form-label">Video File URL</label>
                  <input
                    type="text"
                    className="ap-form-input"
                    value={homeSettings.story_video_url || ''}
                    onChange={(e) => setHomeSettings({ ...homeSettings, story_video_url: e.target.value })}
                    placeholder="/videos/story.mp4 or Cloudinary video URL"
                  />
                </div>
                <div className="ap-form-group">
                  <label className="ap-form-label">Video Poster Image</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="text"
                      className="ap-form-input"
                      value={homeSettings.story_poster_url || ''}
                      onChange={(e) => setHomeSettings({ ...homeSettings, story_poster_url: e.target.value })}
                      placeholder="/images/pensafallback-bw.png"
                    />
                    <button
                      type="button"
                      className="ap-upload-file-btn"
                      onClick={() => triggerImageUpload('story_poster_url')}
                      disabled={uploadingField === 'story_poster_url'}
                    >
                      {uploadingField === 'story_poster_url' ? 'Uploading...' : 'Upload'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Why Section */}
          <div className="ap-section-card">
            <div className="ap-section-header">
              <h3 className="ap-section-title">
                <span>2. Why PENSA TTU Section</span>
              </h3>
              <span className="ap-section-badge">Reasons & Media</span>
            </div>
            <div className="ap-section-body">
              <div className="ap-form-grid-2">
                <div className="ap-form-group">
                  <label className="ap-form-label">Section Eyebrow</label>
                  <input
                    type="text"
                    className="ap-form-input"
                    value={homeSettings.why_eyebrow || ''}
                    onChange={(e) => setHomeSettings({ ...homeSettings, why_eyebrow: e.target.value })}
                  />
                </div>
                <div className="ap-form-group">
                  <label className="ap-form-label">Main Heading</label>
                  <input
                    type="text"
                    className="ap-form-input"
                    value={homeSettings.why_title || ''}
                    onChange={(e) => setHomeSettings({ ...homeSettings, why_title: e.target.value })}
                  />
                </div>
              </div>

              <div className="ap-form-group">
                <label className="ap-form-label">Lead Subheading Description</label>
                <textarea
                  className="ap-form-textarea"
                  rows={2}
                  value={homeSettings.why_desc || ''}
                  onChange={(e) => setHomeSettings({ ...homeSettings, why_desc: e.target.value })}
                />
              </div>

              <div className="ap-form-grid-2">
                <div className="ap-form-group">
                  <label className="ap-form-label">Tall Image</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="text"
                      className="ap-form-input"
                      value={homeSettings.why_image_tall || ''}
                      onChange={(e) => setHomeSettings({ ...homeSettings, why_image_tall: e.target.value })}
                    />
                    <button
                      type="button"
                      className="ap-upload-file-btn"
                      onClick={() => triggerImageUpload('why_image_tall')}
                      disabled={uploadingField === 'why_image_tall'}
                    >
                      {uploadingField === 'why_image_tall' ? 'Uploading...' : 'Upload'}
                    </button>
                  </div>
                </div>

                <div className="ap-form-group">
                  <label className="ap-form-label">Short Image</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="text"
                      className="ap-form-input"
                      value={homeSettings.why_image_short || ''}
                      onChange={(e) => setHomeSettings({ ...homeSettings, why_image_short: e.target.value })}
                    />
                    <button
                      type="button"
                      className="ap-upload-file-btn"
                      onClick={() => triggerImageUpload('why_image_short')}
                      disabled={uploadingField === 'why_image_short'}
                    >
                      {uploadingField === 'why_image_short' ? 'Uploading...' : 'Upload'}
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
                <label className="ap-form-label">Three Reasons List</label>
                {(homeSettings.why_reasons || []).map((r, idx) => (
                  <div key={idx} className="ap-item-card">
                    <div style={{ display: 'flex', gap: 10 }}>
                      <input
                        type="text"
                        style={{ width: 60, fontWeight: 700 }}
                        className="ap-form-input"
                        value={r.num || `0${idx + 1}`}
                        onChange={(e) => {
                          const updated = [...(homeSettings.why_reasons || [])];
                          updated[idx] = { ...updated[idx], num: e.target.value };
                          setHomeSettings({ ...homeSettings, why_reasons: updated });
                        }}
                      />
                      <input
                        type="text"
                        className="ap-form-input"
                        value={r.title || ''}
                        onChange={(e) => {
                          const updated = [...(homeSettings.why_reasons || [])];
                          updated[idx] = { ...updated[idx], title: e.target.value };
                          setHomeSettings({ ...homeSettings, why_reasons: updated });
                        }}
                      />
                    </div>
                    <textarea
                      className="ap-form-textarea"
                      rows={2}
                      value={r.text || ''}
                      onChange={(e) => {
                        const updated = [...(homeSettings.why_reasons || [])];
                        updated[idx] = { ...updated[idx], text: e.target.value };
                        setHomeSettings({ ...homeSettings, why_reasons: updated });
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TAB 3: CONTACT & VISIT PAGE
      ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'contact' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Section 1: Hero Banner */}
          <div className="ap-section-card">
            <div className="ap-section-header">
              <h3 className="ap-section-title">
                <span>1. Contact Hero Header</span>
              </h3>
              <span className="ap-section-badge">Banner</span>
            </div>
            <div className="ap-section-body">
              <div className="ap-form-grid-2">
                <div className="ap-form-group">
                  <label className="ap-form-label">Eyebrow</label>
                  <input
                    type="text"
                    className="ap-form-input"
                    value={contactSettings.hero_eyebrow || ''}
                    onChange={(e) => setContactSettings({ ...contactSettings, hero_eyebrow: e.target.value })}
                  />
                </div>
                <div className="ap-form-group">
                  <label className="ap-form-label">Hero Background Image</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="text"
                      className="ap-form-input"
                      value={contactSettings.hero_image || ''}
                      onChange={(e) => setContactSettings({ ...contactSettings, hero_image: e.target.value })}
                    />
                    <button
                      type="button"
                      className="ap-upload-file-btn"
                      onClick={() => triggerImageUpload('hero_image')}
                      disabled={uploadingField === 'hero_image'}
                    >
                      {uploadingField === 'hero_image' ? 'Uploading...' : 'Upload'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="ap-form-group">
                <label className="ap-form-label">Main Heading</label>
                <input
                  type="text"
                  className="ap-form-input"
                  value={contactSettings.hero_title || ''}
                  onChange={(e) => setContactSettings({ ...contactSettings, hero_title: e.target.value })}
                />
              </div>

              <div className="ap-form-group">
                <label className="ap-form-label">Hero Description</label>
                <textarea
                  className="ap-form-textarea"
                  rows={2}
                  value={contactSettings.hero_desc || ''}
                  onChange={(e) => setContactSettings({ ...contactSettings, hero_desc: e.target.value })}
                />
              </div>

              {contactSettings.hero_image && (
                <div className="ap-image-preview-wrap" style={{ height: 140 }}>
                  <img src={contactSettings.hero_image} alt="Contact hero preview" className="ap-image-preview" />
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Quick Information Cards */}
          <div className="ap-section-card">
            <div className="ap-section-header">
              <h3 className="ap-section-title">
                <span>2. Quick Info Cards (Visit, Call, Email, Service Times)</span>
              </h3>
              <span className="ap-section-badge">4 Cards</span>
            </div>
            <div className="ap-section-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
                {/* Visit Us */}
                <div className="ap-item-card">
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#0A2E5C' }}>📍 Visit Us Card</span>
                  <input
                    type="text"
                    className="ap-form-input"
                    placeholder="Card title..."
                    value={contactSettings.visit_title || 'Visit Us'}
                    onChange={(e) => setContactSettings({ ...contactSettings, visit_title: e.target.value })}
                  />
                  <textarea
                    className="ap-form-textarea"
                    rows={2}
                    placeholder="Physical address..."
                    value={contactSettings.visit_address || ''}
                    onChange={(e) => setContactSettings({ ...contactSettings, visit_address: e.target.value })}
                  />
                  <input
                    type="text"
                    className="ap-form-input"
                    placeholder="Directions link (#map or google map URL)"
                    value={contactSettings.visit_link || ''}
                    onChange={(e) => setContactSettings({ ...contactSettings, visit_link: e.target.value })}
                  />
                </div>

                {/* Call Us */}
                <div className="ap-item-card">
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#0A2E5C' }}>☎ Call Us Card</span>
                  <input
                    type="text"
                    className="ap-form-input"
                    placeholder="Card title..."
                    value={contactSettings.call_title || 'Call Us'}
                    onChange={(e) => setContactSettings({ ...contactSettings, call_title: e.target.value })}
                  />
                  <input
                    type="text"
                    className="ap-form-input"
                    placeholder="Hours note (e.g. Mon–Fri, 9am–5pm)"
                    value={contactSettings.call_hours || ''}
                    onChange={(e) => setContactSettings({ ...contactSettings, call_hours: e.target.value })}
                  />
                  <input
                    type="text"
                    className="ap-form-input"
                    placeholder="Phone number (+233...)"
                    value={contactSettings.call_phone || ''}
                    onChange={(e) => setContactSettings({ ...contactSettings, call_phone: e.target.value })}
                  />
                </div>

                {/* Email Us */}
                <div className="ap-item-card">
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#0A2E5C' }}>✉️ Email Us Card</span>
                  <input
                    type="text"
                    className="ap-form-input"
                    placeholder="Card title..."
                    value={contactSettings.email_title || 'Email Us'}
                    onChange={(e) => setContactSettings({ ...contactSettings, email_title: e.target.value })}
                  />
                  <input
                    type="text"
                    className="ap-form-input"
                    placeholder="Response time (e.g. Reply within 24 hours)"
                    value={contactSettings.email_note || ''}
                    onChange={(e) => setContactSettings({ ...contactSettings, email_note: e.target.value })}
                  />
                  <input
                    type="text"
                    className="ap-form-input"
                    placeholder="Email address..."
                    value={contactSettings.email_address || ''}
                    onChange={(e) => setContactSettings({ ...contactSettings, email_address: e.target.value })}
                  />
                </div>

                {/* Sunday Services */}
                <div className="ap-item-card">
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#0A2E5C' }}>🕊 Sunday Services Card</span>
                  <input
                    type="text"
                    className="ap-form-input"
                    placeholder="Card title..."
                    value={contactSettings.service_title || 'Sunday Services'}
                    onChange={(e) => setContactSettings({ ...contactSettings, service_title: e.target.value })}
                  />
                  <textarea
                    className="ap-form-textarea"
                    rows={2}
                    placeholder="Service times..."
                    value={contactSettings.service_times || ''}
                    onChange={(e) => setContactSettings({ ...contactSettings, service_times: e.target.value })}
                  />
                  <input
                    type="text"
                    className="ap-form-input"
                    placeholder="Action link (/#book)"
                    value={contactSettings.service_link || ''}
                    onChange={(e) => setContactSettings({ ...contactSettings, service_link: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Sticky Bottom Bar ─── */}
      <div className="ap-sticky-footer">
        <div>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Editing: <strong>{activeTab.toUpperCase()} Page</strong></span>
          <span style={{ fontSize: 12, opacity: 0.8, marginLeft: 12 }}>Changes are stored securely in database</span>
        </div>

        <button
          type="button"
          className="ap-save-btn"
          onClick={handleSaveCurrentTab}
          disabled={saving}
          style={{ background: '#ffffff', color: '#0A2E5C' }}
        >
          {saving ? 'Saving...' : `Save ${activeTab.toUpperCase()} Changes`}
        </button>
      </div>
    </div>
  );
}
