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

export default function AdminPages({ defaultTab }) {
  const { activeTab: routeTab } = useParams();
  const navigate = useNavigate();
  const initialTab =
    routeTab && ['about', 'home', 'contact'].includes(routeTab)
      ? routeTab
      : defaultTab && ['about', 'home', 'contact'].includes(defaultTab)
      ? defaultTab
      : 'about';

  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (routeTab && ['about', 'home', 'contact'].includes(routeTab)) {
      setActiveTab(routeTab);
    } else if (defaultTab && ['about', 'home', 'contact'].includes(defaultTab)) {
      setActiveTab(defaultTab);
    }
  }, [routeTab, defaultTab]);

  function switchTab(tab) {
    setActiveTab(tab);
    navigate(`/control-panel/pages/${tab}`);
  }
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [lastSavedTime, setLastSavedTime] = useState('');

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
      setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
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

      if (target.startsWith('about_photos_')) {
        const photoIdx = parseInt(target.replace('about_photos_', ''), 10);
        updateAboutArrayItem('about_photos', photoIdx, 'src', url);
      } else if (target.startsWith('hero_slides_')) {
        const slideIdx = parseInt(target.replace('hero_slides_', ''), 10);
        updateHomeArrayItem('hero_slides', slideIdx, 'img', url);
      } else if (target.startsWith('steps_list_')) {
        const stepIdx = parseInt(target.replace('steps_list_', ''), 10);
        updateHomeArrayItem('steps_list', stepIdx, 'img', url);
      } else if (activeTab === 'about') {
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

  function moveAboutArrayItem(arrayKey, index, direction) {
    setAboutSettings((prev) => {
      const list = [...(prev[arrayKey] || [])];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= list.length) return prev;
      const temp = list[index];
      list[index] = list[targetIndex];
      list[targetIndex] = temp;
      return { ...prev, [arrayKey]: list };
    });
  }

  // Array item helpers for Home Page
  function updateHomeArrayItem(arrayKey, index, key, value) {
    setHomeSettings((prev) => {
      const list = [...(prev[arrayKey] || DEFAULT_HOME_SETTINGS[arrayKey] || [])];
      list[index] = { ...list[index], [key]: value };
      return { ...prev, [arrayKey]: list };
    });
  }

  function addHomeArrayItem(arrayKey, emptyTemplate) {
    setHomeSettings((prev) => ({
      ...prev,
      [arrayKey]: [...(prev[arrayKey] || DEFAULT_HOME_SETTINGS[arrayKey] || []), emptyTemplate],
    }));
  }

  function removeHomeArrayItem(arrayKey, index) {
    setHomeSettings((prev) => {
      const list = [...(prev[arrayKey] || DEFAULT_HOME_SETTINGS[arrayKey] || [])];
      list.splice(index, 1);
      return { ...prev, [arrayKey]: list };
    });
  }

  function moveHomeArrayItem(arrayKey, index, direction) {
    setHomeSettings((prev) => {
      const list = [...(prev[arrayKey] || DEFAULT_HOME_SETTINGS[arrayKey] || [])];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= list.length) return prev;
      const temp = list[index];
      list[index] = list[targetIndex];
      list[targetIndex] = temp;
      return { ...prev, [arrayKey]: list };
    });
  }

  function updateHomeTrailItem(index, value) {
    setHomeSettings((prev) => {
      const list = [...(prev.trail_items || DEFAULT_HOME_SETTINGS.trail_items || [])];
      list[index] = value;
      return { ...prev, trail_items: list };
    });
  }

  function addHomeTrailItem(value = 'New Highlight') {
    setHomeSettings((prev) => ({
      ...prev,
      trail_items: [...(prev.trail_items || DEFAULT_HOME_SETTINGS.trail_items || []), value],
    }));
  }

  function removeHomeTrailItem(index) {
    setHomeSettings((prev) => {
      const list = [...(prev.trail_items || DEFAULT_HOME_SETTINGS.trail_items || [])];
      list.splice(index, 1);
      return { ...prev, trail_items: list };
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
          TAB 1: COMPLETE ABOUT PAGE CONTENT STUDIO
      ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'about' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Quick Jump Section Navigator */}
          <div className="ap-section-nav">
            <span className="ap-section-nav-label">Jump to:</span>
            <button
              type="button"
              className="ap-section-nav-btn"
              onClick={() => document.getElementById('ap-sec-hero')?.scrollIntoView({ behavior: 'smooth' })}
            >
              1. Hero Banner
            </button>
            <button
              type="button"
              className="ap-section-nav-btn"
              onClick={() => document.getElementById('ap-sec-story')?.scrollIntoView({ behavior: 'smooth' })}
            >
              2. Our Story
            </button>
            <button
              type="button"
              className="ap-section-nav-btn"
              onClick={() => document.getElementById('ap-sec-mission')?.scrollIntoView({ behavior: 'smooth' })}
            >
              3. Vision & Mission
            </button>
            <button
              type="button"
              className="ap-section-nav-btn"
              onClick={() => document.getElementById('ap-sec-values')?.scrollIntoView({ behavior: 'smooth' })}
            >
              4. Core Values
            </button>
            <button
              type="button"
              className="ap-section-nav-btn"
              onClick={() => document.getElementById('ap-sec-stats')?.scrollIntoView({ behavior: 'smooth' })}
            >
              5. Numbers Strip
            </button>
            <button
              type="button"
              className="ap-section-nav-btn"
              onClick={() => document.getElementById('ap-sec-timeline')?.scrollIntoView({ behavior: 'smooth' })}
            >
              6. Timeline
            </button>
            <button
              type="button"
              className="ap-section-nav-btn"
              onClick={() => document.getElementById('ap-sec-beliefs')?.scrollIntoView({ behavior: 'smooth' })}
            >
              7. Beliefs
            </button>
            <button
              type="button"
              className="ap-section-nav-btn"
              onClick={() => document.getElementById('ap-sec-photos')?.scrollIntoView({ behavior: 'smooth' })}
            >
              8. Photo Showcase
            </button>
            <button
              type="button"
              className="ap-section-nav-btn"
              onClick={() => document.getElementById('ap-sec-cta')?.scrollIntoView({ behavior: 'smooth' })}
            >
              9. Bottom CTA
            </button>
            <a
              href="/about"
              target="_blank"
              rel="noreferrer"
              className="ap-section-nav-btn"
              style={{ background: '#0E4C92', color: '#fff', marginLeft: 'auto', textDecoration: 'none' }}
            >
              👁️ View Live About Page ↗
            </a>
          </div>

          {/* ─── Section 1: Hero Banner ─── */}
          <div id="ap-sec-hero" className="ap-section-card">
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
                  <div className="ap-input-with-btn">
                    <input
                      type="text"
                      className="ap-form-input"
                      value={aboutSettings.hero_image || ''}
                      onChange={(e) => setAboutSettings({ ...aboutSettings, hero_image: e.target.value })}
                      placeholder="Image URL or click Upload..."
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
                <label className="ap-form-label">Main Heading (H1)</label>
                <input
                  type="text"
                  className="ap-form-input"
                  value={aboutSettings.hero_title || ''}
                  onChange={(e) => setAboutSettings({ ...aboutSettings, hero_title: e.target.value })}
                  placeholder="e.g. A church built on showing up, not showing off."
                />
              </div>

              <div className="ap-form-group">
                <label className="ap-form-label">Subtitle / Introductory Statement</label>
                <textarea
                  className="ap-form-textarea"
                  rows={2}
                  value={aboutSettings.hero_subtitle || ''}
                  onChange={(e) => setAboutSettings({ ...aboutSettings, hero_subtitle: e.target.value })}
                  placeholder="Introductory text describing the community..."
                />
              </div>

              {aboutSettings.hero_image && (
                <div className="ap-image-preview-wrap" style={{ height: 160 }}>
                  <img src={aboutSettings.hero_image} alt="Hero banner preview" className="ap-image-preview" />
                </div>
              )}
            </div>
          </div>

          {/* ─── Section 2: Origins Story ("How We Started") ─── */}
          <div id="ap-sec-story" className="ap-section-card">
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

              {/* Additional Story Paragraphs */}
              {Array.isArray(aboutSettings.extra_story_paragraphs) && aboutSettings.extra_story_paragraphs.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
                  {aboutSettings.extra_story_paragraphs.map((para, pIdx) => (
                    <div key={pIdx} className="ap-item-card">
                      <div className="ap-item-card-header">
                        <span style={{ fontSize: 12.5, fontWeight: 700, color: '#0E4C92' }}>Extra Paragraph #{pIdx + 1}</span>
                        <button
                          type="button"
                          className="ap-remove-item-btn"
                          onClick={() => {
                            const updated = [...(aboutSettings.extra_story_paragraphs || [])];
                            updated.splice(pIdx, 1);
                            setAboutSettings({ ...aboutSettings, extra_story_paragraphs: updated });
                          }}
                        >
                          ✕ Remove
                        </button>
                      </div>
                      <textarea
                        className="ap-form-textarea"
                        rows={2}
                        value={para}
                        onChange={(e) => {
                          const updated = [...(aboutSettings.extra_story_paragraphs || [])];
                          updated[pIdx] = e.target.value;
                          setAboutSettings({ ...aboutSettings, extra_story_paragraphs: updated });
                        }}
                        placeholder="Write another story paragraph..."
                      />
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                className="ap-add-item-btn"
                onClick={() => {
                  const updated = [...(aboutSettings.extra_story_paragraphs || []), ''];
                  setAboutSettings({ ...aboutSettings, extra_story_paragraphs: updated });
                }}
                style={{ alignSelf: 'flex-start' }}
              >
                + Add Another Story Paragraph
              </button>

              <div className="ap-form-grid-2">
                <div className="ap-form-group">
                  <label className="ap-form-label">Story Media Image</label>
                  <div className="ap-input-with-btn">
                    <input
                      type="text"
                      className="ap-form-input"
                      value={aboutSettings.story_image || ''}
                      onChange={(e) => setAboutSettings({ ...aboutSettings, story_image: e.target.value })}
                      placeholder="Image URL or click Upload..."
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

                <div className="ap-form-grid-2">
                  <div className="ap-form-group">
                    <label className="ap-form-label">Action Button Text</label>
                    <input
                      type="text"
                      className="ap-form-input"
                      value={aboutSettings.story_btn_text || ''}
                      onChange={(e) => setAboutSettings({ ...aboutSettings, story_btn_text: e.target.value })}
                      placeholder="e.g. Meet our leadership"
                    />
                  </div>
                  <div className="ap-form-group">
                    <label className="ap-form-label">Button Destination Link</label>
                    <input
                      type="text"
                      className="ap-form-input"
                      value={aboutSettings.story_btn_link || ''}
                      onChange={(e) => setAboutSettings({ ...aboutSettings, story_btn_link: e.target.value })}
                      placeholder="e.g. /#team or /contact"
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

          {/* ─── Section 3: Vision & Mission Statements ─── */}
          <div id="ap-sec-mission" className="ap-section-card">
            <div className="ap-section-header">
              <h3 className="ap-section-title">
                <span>3. Vision & Mission Statements</span>
              </h3>
              <label className="ap-toggle-wrap">
                <input
                  type="checkbox"
                  className="ap-toggle-input"
                  checked={aboutSettings.show_mission_vision !== false}
                  onChange={(e) => setAboutSettings({ ...aboutSettings, show_mission_vision: e.target.checked })}
                />
                <span>Display on About Page</span>
              </label>
            </div>
            <div className="ap-section-body">
              <div className="ap-form-grid-2">
                <div className="ap-mission-box">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#0A2E5C', fontWeight: 700, fontSize: 14 }}>
                    <span style={{ fontSize: 18 }}>🔭</span>
                    <span>Vision Statement</span>
                  </div>
                  <div className="ap-form-group">
                    <label className="ap-form-label">Vision Heading</label>
                    <input
                      type="text"
                      className="ap-form-input"
                      value={aboutSettings.vision_title || ''}
                      onChange={(e) => setAboutSettings({ ...aboutSettings, vision_title: e.target.value })}
                      placeholder="Our Vision"
                    />
                  </div>
                  <div className="ap-form-group">
                    <label className="ap-form-label">Vision Statement Text</label>
                    <textarea
                      className="ap-form-textarea"
                      rows={3}
                      value={aboutSettings.vision_text || ''}
                      onChange={(e) => setAboutSettings({ ...aboutSettings, vision_text: e.target.value })}
                      placeholder="Description of the church's long-term vision..."
                    />
                  </div>
                </div>

                <div className="ap-mission-box">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#0A2E5C', fontWeight: 700, fontSize: 14 }}>
                    <span style={{ fontSize: 18 }}>🎯</span>
                    <span>Mission Statement</span>
                  </div>
                  <div className="ap-form-group">
                    <label className="ap-form-label">Mission Heading</label>
                    <input
                      type="text"
                      className="ap-form-input"
                      value={aboutSettings.mission_title || ''}
                      onChange={(e) => setAboutSettings({ ...aboutSettings, mission_title: e.target.value })}
                      placeholder="Our Mission"
                    />
                  </div>
                  <div className="ap-form-group">
                    <label className="ap-form-label">Mission Statement Text</label>
                    <textarea
                      className="ap-form-textarea"
                      rows={3}
                      value={aboutSettings.mission_text || ''}
                      onChange={(e) => setAboutSettings({ ...aboutSettings, mission_text: e.target.value })}
                      placeholder="Description of the church's purpose and mission..."
                    />
                  </div>
                </div>
              </div>

              <div className="ap-form-group">
                <label className="ap-form-label">⚡ Fellowship Motto / Scripture Slogan</label>
                <input
                  type="text"
                  className="ap-form-input"
                  value={aboutSettings.motto_text || ''}
                  onChange={(e) => setAboutSettings({ ...aboutSettings, motto_text: e.target.value })}
                  placeholder="e.g. Youth Arise, Shine for your Light has Come!"
                />
              </div>
            </div>
          </div>

          {/* ─── Section 4: Core Values Cards ─── */}
          <div id="ap-sec-values" className="ap-section-card">
            <div className="ap-section-header">
              <h3 className="ap-section-title">
                <span>4. Core Values ("What We Value")</span>
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

              <div className="ap-cards-grid-values">
                {(aboutSettings.values_list || []).map((val, idx) => (
                  <div key={idx} className="ap-item-card">
                    <div className="ap-item-card-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#0A2E5C' }}>Value #{idx + 1}</span>
                        <div className="ap-reorder-group">
                          <button
                            type="button"
                            className="ap-reorder-btn"
                            title="Move Up"
                            disabled={idx === 0}
                            onClick={() => moveAboutArrayItem('values_list', idx, -1)}
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            className="ap-reorder-btn"
                            title="Move Down"
                            disabled={idx === (aboutSettings.values_list || []).length - 1}
                            onClick={() => moveAboutArrayItem('values_list', idx, 1)}
                          >
                            ↓
                          </button>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="ap-remove-item-btn"
                        onClick={() => removeAboutArrayItem('values_list', idx)}
                      >
                        ✕ Remove
                      </button>
                    </div>

                    <div className="ap-input-with-icon">
                      <input
                        type="text"
                        className="ap-form-input ap-icon-input"
                        placeholder="Icon"
                        value={val.ic || ''}
                        onChange={(e) => updateAboutArrayItem('values_list', idx, 'ic', e.target.value)}
                      />
                      <input
                        type="text"
                        className="ap-form-input"
                        placeholder="Value title (e.g. Scripture Over Trends)"
                        value={val.title || ''}
                        onChange={(e) => updateAboutArrayItem('values_list', idx, 'title', e.target.value)}
                      />
                    </div>

                    {/* Quick Emoji Selector Palette */}
                    <div className="ap-emoji-palette">
                      {['📖', '🤝', '🌍', '🌱', '❤️', '🙏', '✝️', '🔥', '💡', '🛡️', '🕊️', '✨', '👥', '⛪', '🌟', '🎯'].map((em) => (
                        <button
                          key={em}
                          type="button"
                          className={`ap-emoji-chip ${val.ic === em ? 'active' : ''}`}
                          onClick={() => updateAboutArrayItem('values_list', idx, 'ic', em)}
                          title={`Select ${em}`}
                        >
                          {em}
                        </button>
                      ))}
                    </div>

                    <textarea
                      className="ap-form-textarea"
                      rows={2}
                      placeholder="Description of this core value..."
                      value={val.text || ''}
                      onChange={(e) => updateAboutArrayItem('values_list', idx, 'text', e.target.value)}
                    />
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="ap-add-item-btn"
                onClick={() => addAboutArrayItem('values_list', { ic: '✨', title: 'New Core Value', text: 'Description of this value...' })}
              >
                + Add Another Value Card
              </button>
            </div>
          </div>

          {/* ─── Section 5: Key Numbers & Stats Strip ─── */}
          <div id="ap-sec-stats" className="ap-section-card">
            <div className="ap-section-header">
              <h3 className="ap-section-title">
                <span>5. Key Numbers & Stats Strip</span>
              </h3>
              <span className="ap-section-badge">{(aboutSettings.stats_list || []).length} Stats</span>
            </div>
            <div className="ap-section-body">
              <div className="ap-cards-grid-stats">
                {(aboutSettings.stats_list || []).map((stat, idx) => (
                  <div key={idx} className="ap-item-card">
                    <div className="ap-item-card-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#0A2E5C' }}>Stat #{idx + 1}</span>
                        <div className="ap-reorder-group">
                          <button
                            type="button"
                            className="ap-reorder-btn"
                            disabled={idx === 0}
                            onClick={() => moveAboutArrayItem('stats_list', idx, -1)}
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            className="ap-reorder-btn"
                            disabled={idx === (aboutSettings.stats_list || []).length - 1}
                            onClick={() => moveAboutArrayItem('stats_list', idx, 1)}
                          >
                            ↓
                          </button>
                        </div>
                      </div>
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
                      style={{ fontSize: 18, fontWeight: 800, color: '#0E4C92', textAlign: 'center' }}
                      value={stat.value || ''}
                      onChange={(e) => updateAboutArrayItem('stats_list', idx, 'value', e.target.value)}
                    />
                    <input
                      type="text"
                      className="ap-form-input"
                      placeholder="Label e.g. Regular Attendees"
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

          {/* ─── Section 6: Journey Milestones Timeline ─── */}
          <div id="ap-sec-timeline" className="ap-section-card">
            <div className="ap-section-header">
              <h3 className="ap-section-title">
                <span>6. Journey Milestones Timeline</span>
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

              <div className="ap-cards-grid-timeline">
                {(aboutSettings.timeline_list || []).map((item, idx) => (
                  <div key={idx} className="ap-item-card">
                    <div className="ap-item-card-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#0A2E5C' }}>Milestone #{idx + 1}</span>
                        <div className="ap-reorder-group">
                          <button
                            type="button"
                            className="ap-reorder-btn"
                            disabled={idx === 0}
                            onClick={() => moveAboutArrayItem('timeline_list', idx, -1)}
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            className="ap-reorder-btn"
                            disabled={idx === (aboutSettings.timeline_list || []).length - 1}
                            onClick={() => moveAboutArrayItem('timeline_list', idx, 1)}
                          >
                            ↓
                          </button>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="ap-remove-item-btn"
                        onClick={() => removeAboutArrayItem('timeline_list', idx)}
                      >
                        ✕ Remove
                      </button>
                    </div>

                    <div className="ap-timeline-input-row">
                      <input
                        type="text"
                        className="ap-form-input ap-timeline-year-input"
                        placeholder="Year (2014)"
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
                      placeholder="Story description of this milestone..."
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

          {/* ─── Section 7: Convictions & Beliefs ─── */}
          <div id="ap-sec-beliefs" className="ap-section-card">
            <div className="ap-section-header">
              <h3 className="ap-section-title">
                <span>7. Convictions ("What We Believe")</span>
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

              <div className="ap-cards-grid-beliefs">
                {(aboutSettings.beliefs_list || []).map((item, idx) => (
                  <div key={idx} className="ap-item-card">
                    <div className="ap-item-card-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#0A2E5C' }}>Conviction #{idx + 1}</span>
                        <div className="ap-reorder-group">
                          <button
                            type="button"
                            className="ap-reorder-btn"
                            disabled={idx === 0}
                            onClick={() => moveAboutArrayItem('beliefs_list', idx, -1)}
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            className="ap-reorder-btn"
                            disabled={idx === (aboutSettings.beliefs_list || []).length - 1}
                            onClick={() => moveAboutArrayItem('beliefs_list', idx, 1)}
                          >
                            ↓
                          </button>
                        </div>
                      </div>
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
                      placeholder="Title (e.g. Scripture, Grace, Community)"
                      value={item.title || ''}
                      onChange={(e) => updateAboutArrayItem('beliefs_list', idx, 'title', e.target.value)}
                    />

                    <textarea
                      className="ap-form-textarea"
                      rows={3}
                      placeholder="Doctrinal conviction statement..."
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

          {/* ─── Section 8: Community Photo Showcase ─── */}
          <div id="ap-sec-photos" className="ap-section-card">
            <div className="ap-section-header">
              <h3 className="ap-section-title">
                <span>8. Community Photo Showcase Gallery</span>
              </h3>
              <label className="ap-toggle-wrap">
                <input
                  type="checkbox"
                  className="ap-toggle-input"
                  checked={aboutSettings.show_photos !== false}
                  onChange={(e) => setAboutSettings({ ...aboutSettings, show_photos: e.target.checked })}
                />
                <span>Display on About Page</span>
              </label>
            </div>
            <div className="ap-section-body">
              <div className="ap-form-grid-2">
                <div className="ap-form-group">
                  <label className="ap-form-label">Gallery Eyebrow</label>
                  <input
                    type="text"
                    className="ap-form-input"
                    value={aboutSettings.photos_eyebrow || ''}
                    onChange={(e) => setAboutSettings({ ...aboutSettings, photos_eyebrow: e.target.value })}
                    placeholder="e.g. Life in fellowship"
                  />
                </div>
                <div className="ap-form-group">
                  <label className="ap-form-label">Gallery Title</label>
                  <input
                    type="text"
                    className="ap-form-input"
                    value={aboutSettings.photos_title || ''}
                    onChange={(e) => setAboutSettings({ ...aboutSettings, photos_title: e.target.value })}
                    placeholder="e.g. Moments from our church family"
                  />
                </div>
              </div>

              <div className="ap-cards-grid-photos">
                {(aboutSettings.about_photos || []).map((photo, idx) => (
                  <div key={idx} className="ap-item-card">
                    <div className="ap-item-card-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#0A2E5C' }}>Photo #{idx + 1}</span>
                        <div className="ap-reorder-group">
                          <button
                            type="button"
                            className="ap-reorder-btn"
                            disabled={idx === 0}
                            onClick={() => moveAboutArrayItem('about_photos', idx, -1)}
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            className="ap-reorder-btn"
                            disabled={idx === (aboutSettings.about_photos || []).length - 1}
                            onClick={() => moveAboutArrayItem('about_photos', idx, 1)}
                          >
                            ↓
                          </button>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="ap-remove-item-btn"
                        onClick={() => removeAboutArrayItem('about_photos', idx)}
                      >
                        ✕ Remove
                      </button>
                    </div>

                    <div className="ap-input-with-btn">
                      <input
                        type="text"
                        className="ap-form-input"
                        placeholder="Image URL or upload..."
                        value={photo.src || ''}
                        onChange={(e) => updateAboutArrayItem('about_photos', idx, 'src', e.target.value)}
                      />
                      <button
                        type="button"
                        className="ap-upload-file-btn"
                        onClick={() => triggerImageUpload(`about_photos_${idx}`)}
                        disabled={uploadingField === `about_photos_${idx}`}
                      >
                        {uploadingField === `about_photos_${idx}` ? '...' : 'Upload'}
                      </button>
                    </div>

                    {photo.src && (
                      <div className="ap-image-preview-wrap" style={{ height: 130 }}>
                        <img src={photo.src} alt="Showcase preview" className="ap-image-preview" />
                      </div>
                    )}

                    <input
                      type="text"
                      className="ap-form-input"
                      placeholder="Photo caption (e.g. Sunday worship in full flow)..."
                      value={photo.caption || ''}
                      onChange={(e) => updateAboutArrayItem('about_photos', idx, 'caption', e.target.value)}
                    />
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="ap-add-item-btn"
                onClick={() => addAboutArrayItem('about_photos', { src: '', caption: '' })}
              >
                + Add Photo to Showcase
              </button>
            </div>
          </div>

          {/* ─── Section 9: Call to Action Banner ─── */}
          <div id="ap-sec-cta" className="ap-section-card">
            <div className="ap-section-header">
              <h3 className="ap-section-title">
                <span>9. Call to Action Banner</span>
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

              <div className="ap-form-group">
                <label className="ap-form-label">CTA Subtitle / Invitation Note</label>
                <input
                  type="text"
                  className="ap-form-input"
                  value={aboutSettings.cta_subtitle || ''}
                  onChange={(e) => setAboutSettings({ ...aboutSettings, cta_subtitle: e.target.value })}
                  placeholder="e.g. Two services every Sunday at 9:00 AM & 11:00 AM. There is always a seat for you."
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
                  <label className="ap-form-label">Button Destination Link</label>
                  <input
                    type="text"
                    className="ap-form-input"
                    value={aboutSettings.cta_btn_link || ''}
                    onChange={(e) => setAboutSettings({ ...aboutSettings, cta_btn_link: e.target.value })}
                    placeholder="/#book or /contact"
                  />
                </div>
              </div>

              {/* Live CTA Mini-Preview Banner */}
              <div className="ap-cta-preview-banner">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#ffffff', marginBottom: 4 }}>
                    {aboutSettings.cta_title || 'Come see it for yourself this Sunday.'}
                  </div>
                  <div style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.4 }}>
                    {aboutSettings.cta_subtitle || 'Two services every Sunday. There is always a seat for you.'}
                  </div>
                </div>
                <div className="ap-cta-preview-btn">
                  {aboutSettings.cta_btn_text || 'Plan your visit'} →
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TAB 2: HOME PAGE SECTIONS
      ══════════════════════════════════════════════════════════════ */}
      {/* ══════════════════════════════════════════════════════════════
          TAB 2: COMPLETE HOME PAGE CMS STUDIO
      ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'home' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Quick Jump Section Navigator for Home */}
          <div className="ap-section-nav">
            <span className="ap-section-nav-label">Jump to:</span>
            <button
              type="button"
              className="ap-section-nav-btn"
              onClick={() => document.getElementById('ap-home-hero')?.scrollIntoView({ behavior: 'smooth' })}
            >
              1. Hero Slider
            </button>
            <button
              type="button"
              className="ap-section-nav-btn"
              onClick={() => document.getElementById('ap-home-trail')?.scrollIntoView({ behavior: 'smooth' })}
            >
              2. Ticker Strip
            </button>
            <button
              type="button"
              className="ap-section-nav-btn"
              onClick={() => document.getElementById('ap-home-why')?.scrollIntoView({ behavior: 'smooth' })}
            >
              3. Why Section
            </button>
            <button
              type="button"
              className="ap-section-nav-btn"
              onClick={() => document.getElementById('ap-home-story')?.scrollIntoView({ behavior: 'smooth' })}
            >
              4. Story & Video
            </button>
            <button
              type="button"
              className="ap-section-nav-btn"
              onClick={() => document.getElementById('ap-home-leadership')?.scrollIntoView({ behavior: 'smooth' })}
            >
              5. Leadership
            </button>
            <button
              type="button"
              className="ap-section-nav-btn"
              onClick={() => document.getElementById('ap-home-steps')?.scrollIntoView({ behavior: 'smooth' })}
            >
              6. Weekly Steps
            </button>
            <button
              type="button"
              className="ap-section-nav-btn"
              onClick={() => document.getElementById('ap-home-events')?.scrollIntoView({ behavior: 'smooth' })}
            >
              7. Upcoming Events
            </button>
            <button
              type="button"
              className="ap-section-nav-btn"
              onClick={() => document.getElementById('ap-home-ministries')?.scrollIntoView({ behavior: 'smooth' })}
            >
              8. Ministries
            </button>
            <button
              type="button"
              className="ap-section-nav-btn"
              onClick={() => document.getElementById('ap-home-testi')?.scrollIntoView({ behavior: 'smooth' })}
            >
              9. Testimonial & Hours
            </button>
            <button
              type="button"
              className="ap-section-nav-btn"
              onClick={() => document.getElementById('ap-home-blog')?.scrollIntoView({ behavior: 'smooth' })}
            >
              10. Pulpit & Sermons
            </button>
            <button
              type="button"
              className="ap-section-nav-btn"
              onClick={() => document.getElementById('ap-home-newsletter')?.scrollIntoView({ behavior: 'smooth' })}
            >
              11. Newsletter
            </button>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="ap-section-nav-btn"
              style={{ background: '#0E4C92', color: '#fff', marginLeft: 'auto', textDecoration: 'none' }}
            >
              👁️ View Live Home Page ↗
            </a>
          </div>

          {/* ─── Section 1: Hero Banner & Slides ─── */}
          <div id="ap-home-hero" className="ap-section-card">
            <div className="ap-section-header">
              <h3 className="ap-section-title">
                <span>1. Hero Banner & Carousel Slides</span>
              </h3>
              <span className="ap-section-badge">
                {(homeSettings.hero_slides || DEFAULT_HOME_SETTINGS.hero_slides || []).length} Slides
              </span>
            </div>
            <div className="ap-section-body">
              <div className="ap-form-group">
                <label className="ap-form-label">Hero Eyebrow (Small top tag)</label>
                <input
                  type="text"
                  className="ap-form-input"
                  value={homeSettings.hero_eyebrow || ''}
                  onChange={(e) => setHomeSettings({ ...homeSettings, hero_eyebrow: e.target.value })}
                  placeholder="e.g. A church home in Accra"
                />
              </div>

              <div className="ap-form-grid-2">
                <div className="ap-form-group">
                  <label className="ap-form-label">Primary Button Label</label>
                  <input
                    type="text"
                    className="ap-form-input"
                    value={homeSettings.hero_btn1_text || ''}
                    onChange={(e) => setHomeSettings({ ...homeSettings, hero_btn1_text: e.target.value })}
                    placeholder="About us"
                  />
                </div>
                <div className="ap-form-group">
                  <label className="ap-form-label">Primary Button Link</label>
                  <input
                    type="text"
                    className="ap-form-input"
                    value={homeSettings.hero_btn1_link || ''}
                    onChange={(e) => setHomeSettings({ ...homeSettings, hero_btn1_link: e.target.value })}
                    placeholder="/about"
                  />
                </div>
              </div>

              <div className="ap-form-grid-2">
                <div className="ap-form-group">
                  <label className="ap-form-label">Secondary Button Label</label>
                  <input
                    type="text"
                    className="ap-form-input"
                    value={homeSettings.hero_btn2_text || ''}
                    onChange={(e) => setHomeSettings({ ...homeSettings, hero_btn2_text: e.target.value })}
                    placeholder="Explore Ministries"
                  />
                </div>
                <div className="ap-form-group">
                  <label className="ap-form-label">Secondary Button Link</label>
                  <input
                    type="text"
                    className="ap-form-input"
                    value={homeSettings.hero_btn2_link || ''}
                    onChange={(e) => setHomeSettings({ ...homeSettings, hero_btn2_link: e.target.value })}
                    placeholder="/ministries"
                  />
                </div>
              </div>

              {/* Slide items list */}
              <div className="ap-form-group">
                <label className="ap-form-label">
                  Carousel Slides (Images, animated typing headlines & descriptions)
                </label>
                <div className="ap-cards-grid-slides">
                  {(homeSettings.hero_slides || DEFAULT_HOME_SETTINGS.hero_slides || []).map((slide, idx) => (
                    <div key={idx} className="ap-item-card">
                      <div className="ap-item-card-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#0A2E5C' }}>
                            Slide #{idx + 1}
                          </span>
                          <div className="ap-reorder-group">
                            <button
                              type="button"
                              className="ap-reorder-btn"
                              disabled={idx === 0}
                              onClick={() => moveHomeArrayItem('hero_slides', idx, -1)}
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              className="ap-reorder-btn"
                              disabled={idx === (homeSettings.hero_slides || DEFAULT_HOME_SETTINGS.hero_slides || []).length - 1}
                              onClick={() => moveHomeArrayItem('hero_slides', idx, 1)}
                            >
                              ↓
                            </button>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="ap-remove-item-btn"
                          onClick={() => removeHomeArrayItem('hero_slides', idx)}
                        >
                          ✕ Remove
                        </button>
                      </div>

                      <div className="ap-form-grid-2">
                        <div className="ap-form-group">
                          <label className="ap-form-label">Slide Background Image URL</label>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <input
                              type="text"
                              className="ap-form-input"
                              value={slide.img || ''}
                              onChange={(e) => updateHomeArrayItem('hero_slides', idx, 'img', e.target.value)}
                              placeholder="/images/slide1.webp or Cloudinary URL"
                            />
                            <button
                              type="button"
                              className="ap-upload-file-btn"
                              onClick={() => triggerImageUpload(`hero_slides_${idx}`)}
                              disabled={uploadingField === `hero_slides_${idx}`}
                            >
                              {uploadingField === `hero_slides_${idx}` ? 'Uploading...' : 'Upload'}
                            </button>
                          </div>
                        </div>
                        <div className="ap-form-group">
                          <label className="ap-form-label">Image Alt Description</label>
                          <input
                            type="text"
                            className="ap-form-input"
                            value={slide.alt || ''}
                            onChange={(e) => updateHomeArrayItem('hero_slides', idx, 'alt', e.target.value)}
                            placeholder="Alt text describing the slide photo"
                          />
                        </div>
                      </div>

                      {slide.img && (
                        <div className="ap-image-preview-wrap" style={{ height: 110, marginBottom: 10 }}>
                          <img src={slide.img} alt="Slide preview" className="ap-image-preview" />
                        </div>
                      )}

                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 0.8fr', gap: 10 }}>
                        <div className="ap-form-group">
                          <label className="ap-form-label">Headline Prefix</label>
                          <input
                            type="text"
                            className="ap-form-input"
                            value={slide.pre ?? ''}
                            onChange={(e) => updateHomeArrayItem('hero_slides', idx, 'pre', e.target.value)}
                            placeholder="e.g. Faith that gives your heart room to "
                          />
                        </div>
                        <div className="ap-form-group">
                          <label className="ap-form-label">Highlighted Word (Accented)</label>
                          <input
                            type="text"
                            className="ap-form-input"
                            value={slide.em ?? ''}
                            onChange={(e) => updateHomeArrayItem('hero_slides', idx, 'em', e.target.value)}
                            placeholder="e.g. breathe"
                          />
                        </div>
                        <div className="ap-form-group">
                          <label className="ap-form-label">Suffix</label>
                          <input
                            type="text"
                            className="ap-form-input"
                            value={slide.post ?? ''}
                            onChange={(e) => updateHomeArrayItem('hero_slides', idx, 'post', e.target.value)}
                            placeholder="."
                          />
                        </div>
                      </div>

                      <div className="ap-form-group" style={{ marginTop: 8 }}>
                        <label className="ap-form-label">Slide Description Text</label>
                        <textarea
                          className="ap-form-textarea"
                          rows={2}
                          value={slide.desc || ''}
                          onChange={(e) => updateHomeArrayItem('hero_slides', idx, 'desc', e.target.value)}
                          placeholder="Subtitle description for this slide..."
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="ap-add-item-btn"
                  style={{ alignSelf: 'flex-start' }}
                  onClick={() => addHomeArrayItem('hero_slides', {
                    img: '/images/pensafallback-bw.png',
                    alt: 'New fellowship slide',
                    pre: 'Welcome to our ',
                    em: 'family',
                    post: '.',
                    desc: 'A church where you belong and grow in Christ.',
                  })}
                >
                  + Add New Hero Slide
                </button>
              </div>
            </div>
          </div>

          {/* ─── Section 2: Marquee Ticker Strip ─── */}
          <div id="ap-home-trail" className="ap-section-card">
            <div className="ap-section-header">
              <h3 className="ap-section-title">
                <span>2. Marquee Ticker Strip</span>
              </h3>
              <span className="ap-section-badge">Continuous Scroll</span>
            </div>
            <div className="ap-section-body">
              <p style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
                These keywords and tags continuously scroll across the horizontal banner below the hero section.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                {(homeSettings.trail_items || DEFAULT_HOME_SETTINGS.trail_items || []).map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <input
                      type="text"
                      className="ap-form-input"
                      value={item}
                      onChange={(e) => updateHomeTrailItem(idx, e.target.value)}
                    />
                    <button
                      type="button"
                      className="ap-remove-item-btn"
                      style={{ padding: '8px 10px' }}
                      onClick={() => removeHomeTrailItem(idx)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="ap-add-item-btn"
                style={{ marginTop: 14 }}
                onClick={() => addHomeTrailItem('New Fellowship Tag')}
              >
                + Add Ticker Tag
              </button>
            </div>
          </div>

          {/* ─── Section 3: Why PENSA TTU ─── */}
          <div id="ap-home-why" className="ap-section-card">
            <div className="ap-section-header">
              <h3 className="ap-section-title">
                <span>3. Why PENSA TTU Section</span>
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
                  {homeSettings.why_image_tall && (
                    <div className="ap-image-preview-wrap" style={{ height: 100, marginTop: 8 }}>
                      <img src={homeSettings.why_image_tall} alt="Tall preview" className="ap-image-preview" />
                    </div>
                  )}
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
                  {homeSettings.why_image_short && (
                    <div className="ap-image-preview-wrap" style={{ height: 100, marginTop: 8 }}>
                      <img src={homeSettings.why_image_short} alt="Short preview" className="ap-image-preview" />
                    </div>
                  )}
                </div>
              </div>

              <div className="ap-form-group">
                <label className="ap-form-label">Reasons Cards List</label>
                <div className="ap-cards-grid-reasons">
                {(homeSettings.why_reasons || DEFAULT_HOME_SETTINGS.why_reasons || []).map((r, idx) => (
                  <div key={idx} className="ap-item-card">
                    <div className="ap-item-card-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#0A2E5C' }}>
                          Reason #{idx + 1}
                        </span>
                        <div className="ap-reorder-group">
                          <button
                            type="button"
                            className="ap-reorder-btn"
                            disabled={idx === 0}
                            onClick={() => moveHomeArrayItem('why_reasons', idx, -1)}
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            className="ap-reorder-btn"
                            disabled={idx === (homeSettings.why_reasons || DEFAULT_HOME_SETTINGS.why_reasons || []).length - 1}
                            onClick={() => moveHomeArrayItem('why_reasons', idx, 1)}
                          >
                            ↓
                          </button>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="ap-remove-item-btn"
                        onClick={() => removeHomeArrayItem('why_reasons', idx)}
                      >
                        ✕ Remove
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: 10 }}>
                      <input
                        type="text"
                        style={{ width: 70, fontWeight: 700 }}
                        className="ap-form-input"
                        placeholder="01"
                        value={r.num || `0${idx + 1}`}
                        onChange={(e) => updateHomeArrayItem('why_reasons', idx, 'num', e.target.value)}
                      />
                      <input
                        type="text"
                        className="ap-form-input"
                        placeholder="Reason Title"
                        value={r.title || ''}
                        onChange={(e) => updateHomeArrayItem('why_reasons', idx, 'title', e.target.value)}
                      />
                    </div>
                    <textarea
                      className="ap-form-textarea"
                      rows={2}
                      placeholder="Reason explanation..."
                      value={r.text || ''}
                      onChange={(e) => updateHomeArrayItem('why_reasons', idx, 'text', e.target.value)}
                    />
                  </div>
                ))}
              </div>

                <button
                  type="button"
                  className="ap-add-item-btn"
                  style={{ alignSelf: 'flex-start' }}
                  onClick={() => addHomeArrayItem('why_reasons', {
                    num: `0${(homeSettings.why_reasons || DEFAULT_HOME_SETTINGS.why_reasons || []).length + 1}`,
                    title: 'New Reason',
                    text: 'Description of why PENSA TTU is special...',
                  })}
                >
                  + Add Reason Card
                </button>
              </div>
            </div>
          </div>

          {/* ─── Section 4: Our Story Video & Text ─── */}
          <div id="ap-home-story" className="ap-section-card">
            <div className="ap-section-header">
              <h3 className="ap-section-title">
                <span>4. Home Story Section & Video</span>
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
                  <label className="ap-form-label">Button Text</label>
                  <input
                    type="text"
                    className="ap-form-input"
                    value={homeSettings.story_btn_text || ''}
                    onChange={(e) => setHomeSettings({ ...homeSettings, story_btn_text: e.target.value })}
                    placeholder="read more"
                  />
                </div>
                <div className="ap-form-group">
                  <label className="ap-form-label">Button Link</label>
                  <input
                    type="text"
                    className="ap-form-input"
                    value={homeSettings.story_btn_link || ''}
                    onChange={(e) => setHomeSettings({ ...homeSettings, story_btn_link: e.target.value })}
                    placeholder="/contact"
                  />
                </div>
              </div>

              <div className="ap-form-grid-2">
                <div className="ap-form-group">
                  <label className="ap-form-label">Video File URL</label>
                  <input
                    type="text"
                    className="ap-form-input"
                    value={homeSettings.story_video_url || ''}
                    onChange={(e) => setHomeSettings({ ...homeSettings, story_video_url: e.target.value })}
                    placeholder="/videos/story.mp4 or direct video link"
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
                  {homeSettings.story_poster_url && (
                    <div className="ap-image-preview-wrap" style={{ height: 100, marginTop: 8 }}>
                      <img src={homeSettings.story_poster_url} alt="Poster preview" className="ap-image-preview" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ─── Section 5: Leadership Section Header ─── */}
          <div id="ap-home-leadership" className="ap-section-card">
            <div className="ap-section-header">
              <h3 className="ap-section-title">
                <span>5. Leadership Section Heading</span>
              </h3>
              <span className="ap-section-badge">Homepage Banner</span>
            </div>
            <div className="ap-section-body">
              <div className="ap-form-grid-2">
                <div className="ap-form-group">
                  <label className="ap-form-label">Leadership Eyebrow</label>
                  <input
                    type="text"
                    className="ap-form-input"
                    value={homeSettings.leadership_eyebrow || ''}
                    onChange={(e) => setHomeSettings({ ...homeSettings, leadership_eyebrow: e.target.value })}
                    placeholder="Our leadership"
                  />
                </div>
                <div className="ap-form-group">
                  <label className="ap-form-label">Leadership Title</label>
                  <input
                    type="text"
                    className="ap-form-input"
                    value={homeSettings.leadership_title || ''}
                    onChange={(e) => setHomeSettings({ ...homeSettings, leadership_title: e.target.value })}
                    placeholder="Leading with Vision, Integrity, and Purpose"
                  />
                </div>
              </div>
              <p style={{ fontSize: 12.5, color: '#777', marginTop: 4 }}>
                💡 Tip: Individual pastors and executives shown on this list are managed under the <strong>Team</strong> section in the admin sidebar.
              </p>
            </div>
          </div>

          {/* ─── Section 6: Weekly Activities / Steps Journey ─── */}
          <div id="ap-home-steps" className="ap-section-card">
            <div className="ap-section-header">
              <h3 className="ap-section-title">
                <span>6. Weekly Activities / Fellowship Steps</span>
              </h3>
              <span className="ap-section-badge">
                {(homeSettings.steps_list || DEFAULT_HOME_SETTINGS.steps_list || []).length} Days
              </span>
            </div>
            <div className="ap-section-body">
              <div className="ap-form-grid-2">
                <div className="ap-form-group">
                  <label className="ap-form-label">Section Eyebrow</label>
                  <input
                    type="text"
                    className="ap-form-input"
                    value={homeSettings.steps_eyebrow || ''}
                    onChange={(e) => setHomeSettings({ ...homeSettings, steps_eyebrow: e.target.value })}
                    placeholder="weekly activities"
                  />
                </div>
                <div className="ap-form-group">
                  <label className="ap-form-label">Main Heading</label>
                  <input
                    type="text"
                    className="ap-form-input"
                    value={homeSettings.steps_title || ''}
                    onChange={(e) => setHomeSettings({ ...homeSettings, steps_title: e.target.value })}
                    placeholder="Our Weekly Journey of Faith and Service"
                  />
                </div>
              </div>

              <div className="ap-form-group">
                <label className="ap-form-label">Weekly Activity Cards</label>
                <div className="ap-cards-grid-activities">
                {(homeSettings.steps_list || DEFAULT_HOME_SETTINGS.steps_list || []).map((step, idx) => (
                  <div key={idx} className="ap-item-card">
                    <div className="ap-item-card-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#0A2E5C' }}>
                          Activity #{idx + 1}
                        </span>
                        <div className="ap-reorder-group">
                          <button
                            type="button"
                            className="ap-reorder-btn"
                            disabled={idx === 0}
                            onClick={() => moveHomeArrayItem('steps_list', idx, -1)}
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            className="ap-reorder-btn"
                            disabled={idx === (homeSettings.steps_list || DEFAULT_HOME_SETTINGS.steps_list || []).length - 1}
                            onClick={() => moveHomeArrayItem('steps_list', idx, 1)}
                          >
                            ↓
                          </button>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="ap-remove-item-btn"
                        onClick={() => removeHomeArrayItem('steps_list', idx)}
                      >
                        ✕ Remove
                      </button>
                    </div>

                    <div className="ap-form-grid-2">
                      <div className="ap-form-group">
                        <label className="ap-form-label">Day Tag (e.g. mondays, sundays)</label>
                        <input
                          type="text"
                          className="ap-form-input"
                          value={step.tag || ''}
                          onChange={(e) => updateHomeArrayItem('steps_list', idx, 'tag', e.target.value)}
                          placeholder="e.g. mondays"
                        />
                      </div>
                      <div className="ap-form-group">
                        <label className="ap-form-label">Activity Title</label>
                        <input
                          type="text"
                          className="ap-form-input"
                          value={step.title || ''}
                          onChange={(e) => updateHomeArrayItem('steps_list', idx, 'title', e.target.value)}
                          placeholder="e.g. DEPARTMENTAL PRAYERS"
                        />
                      </div>
                    </div>

                    <div className="ap-form-group">
                      <label className="ap-form-label">Card Image URL</label>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input
                          type="text"
                          className="ap-form-input"
                          value={step.img || ''}
                          onChange={(e) => updateHomeArrayItem('steps_list', idx, 'img', e.target.value)}
                          placeholder="/images/pensafallback-bw.png"
                        />
                        <button
                          type="button"
                          className="ap-upload-file-btn"
                          onClick={() => triggerImageUpload(`steps_list_${idx}`)}
                          disabled={uploadingField === `steps_list_${idx}`}
                        >
                          {uploadingField === `steps_list_${idx}` ? 'Uploading...' : 'Upload'}
                        </button>
                      </div>
                      {step.img && (
                        <div className="ap-image-preview-wrap" style={{ height: 90, marginTop: 8 }}>
                          <img src={step.img} alt="Activity preview" className="ap-image-preview" />
                        </div>
                      )}
                    </div>

                    <div className="ap-form-group">
                      <label className="ap-form-label">Description</label>
                      <textarea
                        className="ap-form-textarea"
                        rows={2}
                        value={step.text || ''}
                        onChange={(e) => updateHomeArrayItem('steps_list', idx, 'text', e.target.value)}
                        placeholder="Description of this weekly event..."
                      />
                    </div>
                  </div>
                ))}
              </div>

                <button
                  type="button"
                  className="ap-add-item-btn"
                  style={{ alignSelf: 'flex-start' }}
                  onClick={() => addHomeArrayItem('steps_list', {
                    tag: 'thursdays',
                    title: 'BIBLE STUDY HOUR',
                    text: 'Diving deep into scripture with fellowship and prayer.',
                    img: '/images/pensafallback-bw.png',
                  })}
                >
                  + Add Weekly Activity Card
                </button>
              </div>
            </div>
          </div>

          {/* ─── Section 7: Upcoming Events Feature Header ─── */}
          <div id="ap-home-events" className="ap-section-card">
            <div className="ap-section-header">
              <h3 className="ap-section-title">
                <span>7. Upcoming Events Section Header</span>
              </h3>
              <span className="ap-section-badge">Events Callout</span>
            </div>
            <div className="ap-section-body">
              <div className="ap-form-grid-2">
                <div className="ap-form-group">
                  <label className="ap-form-label">Events Eyebrow</label>
                  <input
                    type="text"
                    className="ap-form-input"
                    value={homeSettings.events_eyebrow || ''}
                    onChange={(e) => setHomeSettings({ ...homeSettings, events_eyebrow: e.target.value })}
                    placeholder="Upcoming Events"
                  />
                </div>
                <div className="ap-form-group">
                  <label className="ap-form-label">Events Title</label>
                  <input
                    type="text"
                    className="ap-form-input"
                    value={homeSettings.events_title || ''}
                    onChange={(e) => setHomeSettings({ ...homeSettings, events_title: e.target.value })}
                    placeholder="What's happening next."
                  />
                </div>
              </div>

              <div className="ap-form-group">
                <label className="ap-form-label">"More Events" Link Text</label>
                <input
                  type="text"
                  className="ap-form-input"
                  value={homeSettings.events_more_link_text || ''}
                  onChange={(e) => setHomeSettings({ ...homeSettings, events_more_link_text: e.target.value })}
                  placeholder="More upcoming events"
                />
              </div>
              <p style={{ fontSize: 12.5, color: '#777', marginTop: 4 }}>
                💡 Tip: Individual events, dates, and flyers are created under the <strong>Events</strong> section in the admin sidebar.
              </p>
            </div>
          </div>

          {/* ─── Section 8: Ministries & Teams Showcase ─── */}
          <div id="ap-home-ministries" className="ap-section-card">
            <div className="ap-section-header">
              <h3 className="ap-section-title">
                <span>8. Ministries & Teams Showcase</span>
              </h3>
              <span className="ap-section-badge">Involvement</span>
            </div>
            <div className="ap-section-body">
              <div className="ap-form-grid-2">
                <div className="ap-form-group">
                  <label className="ap-form-label">Section Eyebrow</label>
                  <input
                    type="text"
                    className="ap-form-input"
                    value={homeSettings.ministries_eyebrow || ''}
                    onChange={(e) => setHomeSettings({ ...homeSettings, ministries_eyebrow: e.target.value })}
                    placeholder="Get involved"
                  />
                </div>
                <div className="ap-form-group">
                  <label className="ap-form-label">Main Heading</label>
                  <input
                    type="text"
                    className="ap-form-input"
                    value={homeSettings.ministries_title || ''}
                    onChange={(e) => setHomeSettings({ ...homeSettings, ministries_title: e.target.value })}
                    placeholder="Ministries & Teams built around how you are wired."
                  />
                </div>
              </div>

              <div className="ap-form-grid-2">
                <div className="ap-form-group">
                  <label className="ap-form-label">Action Button Text</label>
                  <input
                    type="text"
                    className="ap-form-input"
                    value={homeSettings.ministries_btn_text || ''}
                    onChange={(e) => setHomeSettings({ ...homeSettings, ministries_btn_text: e.target.value })}
                    placeholder="See all ministries & teams"
                  />
                </div>
                <div className="ap-form-group">
                  <label className="ap-form-label">Action Button Link</label>
                  <input
                    type="text"
                    className="ap-form-input"
                    value={homeSettings.ministries_btn_link || ''}
                    onChange={(e) => setHomeSettings({ ...homeSettings, ministries_btn_link: e.target.value })}
                    placeholder="/ministries"
                  />
                </div>
              </div>
              <p style={{ fontSize: 12.5, color: '#777', marginTop: 4 }}>
                💡 Tip: Individual department cards and team profiles are managed under <strong>Departments & Teams</strong> in the admin sidebar.
              </p>
            </div>
          </div>

          {/* ─── Section 9: Testimonial & Sunday Service Schedule ─── */}
          <div id="ap-home-testi" className="ap-section-card">
            <div className="ap-section-header">
              <h3 className="ap-section-title">
                <span>9. Member Testimonial & Sunday Service Card</span>
              </h3>
              <span className="ap-section-badge">Quote & Schedule</span>
            </div>
            <div className="ap-section-body">
              <div className="ap-form-grid-2">
                <div style={{ background: '#f8fafd', border: '1px solid #d0e0f5', borderRadius: 12, padding: 16 }}>
                  <h4 style={{ fontSize: 14, color: '#0E4C92', margin: '0 0 12px', fontWeight: 700 }}>
                    📅 Left Side: Sunday Service Badge & Photo
                  </h4>
                  <div className="ap-form-group">
                    <label className="ap-form-label">Service / Congregation Image</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        type="text"
                        className="ap-form-input"
                        value={homeSettings.testi_media_img || ''}
                        onChange={(e) => setHomeSettings({ ...homeSettings, testi_media_img: e.target.value })}
                        placeholder="/images/pensafallback-bw.png"
                      />
                      <button
                        type="button"
                        className="ap-upload-file-btn"
                        onClick={() => triggerImageUpload('testi_media_img')}
                        disabled={uploadingField === 'testi_media_img'}
                      >
                        {uploadingField === 'testi_media_img' ? 'Uploading...' : 'Upload'}
                      </button>
                    </div>
                    {homeSettings.testi_media_img && (
                      <div className="ap-image-preview-wrap" style={{ height: 100, marginTop: 8 }}>
                        <img src={homeSettings.testi_media_img} alt="Service preview" className="ap-image-preview" />
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
                    <div className="ap-form-group">
                      <label className="ap-form-label">Service Times (e.g. 6:30 AM - 9:30 AM)</label>
                      <input
                        type="text"
                        className="ap-form-input"
                        value={homeSettings.testi_service_time || ''}
                        onChange={(e) => setHomeSettings({ ...homeSettings, testi_service_time: e.target.value })}
                        placeholder="6:30 AM - 9:30 AM"
                      />
                    </div>
                    <div className="ap-form-group">
                      <label className="ap-form-label">Service Frequency (e.g. Every Sunday)</label>
                      <input
                        type="text"
                        className="ap-form-input"
                        value={homeSettings.testi_service_day || ''}
                        onChange={(e) => setHomeSettings({ ...homeSettings, testi_service_day: e.target.value })}
                        placeholder="Every Sunday"
                      />
                    </div>
                    <div className="ap-form-group">
                      <label className="ap-form-label">Service Mode (e.g. In person & online)</label>
                      <input
                        type="text"
                        className="ap-form-input"
                        value={homeSettings.testi_service_type || ''}
                        onChange={(e) => setHomeSettings({ ...homeSettings, testi_service_type: e.target.value })}
                        placeholder="In person & online"
                      />
                    </div>
                  </div>
                </div>

                <div style={{ background: '#fafafa', border: '1px solid #e5e5e5', borderRadius: 12, padding: 16 }}>
                  <h4 style={{ fontSize: 14, color: '#333', margin: '0 0 12px', fontWeight: 700 }}>
                    💬 Right Side: Member Testimonial Quote
                  </h4>

                  <div className="ap-form-group">
                    <label className="ap-form-label">Testimonial Eyebrow</label>
                    <input
                      type="text"
                      className="ap-form-input"
                      value={homeSettings.testi_eyebrow || ''}
                      onChange={(e) => setHomeSettings({ ...homeSettings, testi_eyebrow: e.target.value })}
                      placeholder="What our members say"
                    />
                  </div>

                  <div className="ap-form-group">
                    <label className="ap-form-label">Quote Text</label>
                    <textarea
                      className="ap-form-textarea"
                      rows={3}
                      value={homeSettings.testi_quote || ''}
                      onChange={(e) => setHomeSettings({ ...homeSettings, testi_quote: e.target.value })}
                      placeholder="Enter inspiring quote from a student or member..."
                    />
                  </div>

                  <div className="ap-form-grid-2">
                    <div className="ap-form-group">
                      <label className="ap-form-label">Author Name</label>
                      <input
                        type="text"
                        className="ap-form-input"
                        value={homeSettings.testi_author_name || ''}
                        onChange={(e) => setHomeSettings({ ...homeSettings, testi_author_name: e.target.value })}
                        placeholder="e.g. Ama Boateng"
                      />
                    </div>
                    <div className="ap-form-group">
                      <label className="ap-form-label">Author Subtitle / Role</label>
                      <input
                        type="text"
                        className="ap-form-input"
                        value={homeSettings.testi_author_title || ''}
                        onChange={(e) => setHomeSettings({ ...homeSettings, testi_author_title: e.target.value })}
                        placeholder="e.g. Member since 2023, East Legon"
                      />
                    </div>
                  </div>

                  <div className="ap-form-group">
                    <label className="ap-form-label">Author Avatar Photo</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        type="text"
                        className="ap-form-input"
                        value={homeSettings.testi_author_img || ''}
                        onChange={(e) => setHomeSettings({ ...homeSettings, testi_author_img: e.target.value })}
                        placeholder="/images/pensafallback-bw.png"
                      />
                      <button
                        type="button"
                        className="ap-upload-file-btn"
                        onClick={() => triggerImageUpload('testi_author_img')}
                        disabled={uploadingField === 'testi_author_img'}
                      >
                        {uploadingField === 'testi_author_img' ? 'Uploading...' : 'Upload'}
                      </button>
                    </div>
                    {homeSettings.testi_author_img && (
                      <div className="ap-image-preview-wrap" style={{ height: 80, width: 80, borderRadius: '50%', overflow: 'hidden', marginTop: 8 }}>
                        <img src={homeSettings.testi_author_img} alt="Author preview" className="ap-image-preview" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Section 10: Pulpit & Sermons Header ─── */}
          <div id="ap-home-blog" className="ap-section-card">
            <div className="ap-section-header">
              <h3 className="ap-section-title">
                <span>10. From The Pulpit / Sermons Header</span>
              </h3>
              <span className="ap-section-badge">Messages Showcase</span>
            </div>
            <div className="ap-section-body">
              <div className="ap-form-grid-2">
                <div className="ap-form-group">
                  <label className="ap-form-label">Section Eyebrow</label>
                  <input
                    type="text"
                    className="ap-form-input"
                    value={homeSettings.blog_eyebrow || ''}
                    onChange={(e) => setHomeSettings({ ...homeSettings, blog_eyebrow: e.target.value })}
                    placeholder="From the pulpit"
                  />
                </div>
                <div className="ap-form-group">
                  <label className="ap-form-label">Main Heading</label>
                  <input
                    type="text"
                    className="ap-form-input"
                    value={homeSettings.blog_title || ''}
                    onChange={(e) => setHomeSettings({ ...homeSettings, blog_title: e.target.value })}
                    placeholder="Messages & reflections from our community."
                  />
                </div>
              </div>
              <p style={{ fontSize: 12.5, color: '#777', marginTop: 4 }}>
                💡 Tip: Individual sermons, speakers, and YouTube links are managed under the <strong>Sermons</strong> section in the admin sidebar.
              </p>
            </div>
          </div>

          {/* ─── Section 11: Newsletter Encouragement Box ─── */}
          <div id="ap-home-newsletter" className="ap-section-card">
            <div className="ap-section-header">
              <h3 className="ap-section-title">
                <span>11. Newsletter Encouragement Box</span>
              </h3>
              <span className="ap-section-badge">Subscribers CTA</span>
            </div>
            <div className="ap-section-body">
              <div className="ap-form-group">
                <label className="ap-form-label">Box Headline</label>
                <input
                  type="text"
                  className="ap-form-input"
                  value={homeSettings.newsletter_title || ''}
                  onChange={(e) => setHomeSettings({ ...homeSettings, newsletter_title: e.target.value })}
                  placeholder="Get weekly encouragement — a short note every Friday."
                />
              </div>

              <div className="ap-form-grid-2">
                <div className="ap-form-group">
                  <label className="ap-form-label">Input Placeholder Text</label>
                  <input
                    type="text"
                    className="ap-form-input"
                    value={homeSettings.newsletter_placeholder || ''}
                    onChange={(e) => setHomeSettings({ ...homeSettings, newsletter_placeholder: e.target.value })}
                    placeholder="Your email address"
                  />
                </div>
                <div className="ap-form-group">
                  <label className="ap-form-label">Submit Button Text</label>
                  <input
                    type="text"
                    className="ap-form-input"
                    value={homeSettings.newsletter_btn_text || ''}
                    onChange={(e) => setHomeSettings({ ...homeSettings, newsletter_btn_text: e.target.value })}
                    placeholder="Subscribe"
                  />
                </div>
              </div>
              <p style={{ fontSize: 12.5, color: '#777', marginTop: 4 }}>
                💡 Tip: Visitors who enter their email here will appear under the <strong>Subscribers</strong> tab in the admin sidebar.
              </p>
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
          {lastSavedTime ? (
            <span style={{ fontSize: 12, color: '#4ade80', marginLeft: 12, fontWeight: 600 }}>
              ✓ Saved at {lastSavedTime}
            </span>
          ) : (
            <span style={{ fontSize: 12, opacity: 0.8, marginLeft: 12 }}>Changes are stored securely in database</span>
          )}
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
