import { useState, useEffect } from 'react';
import { adminApi } from './adminApi';
import { uploadImageToCloudinary } from '../cloudinaryUpload';
import { getImageUrl } from '../api';
import './AdminNavigation.css';

export default function AdminNavigation() {
  const [activeTab, setActiveTab] = useState('navbar');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [alert, setAlert] = useState(null); // { type: 'success' | 'error', message: '' }

  const [navbar, setNavbar] = useState({
    logo_type: 'image',
    logo_image: '/images/pensa.jpg',
    logo_text: 'PENSA TTU',
    phone: '+233553070627',
    service_time: 'Sun 6:30am - 9:30am',
    cta_label: 'Contact us',
    cta_link: '/contact',
    cta_show: true,
    links: [],
  });

  const [footer, setFooter] = useState({
    brand_title: 'PENSA',
    brand_accent: 'TTU',
    brand_tagline: 'A church community in Accra built on honest worship, real friendship, and a Word that meets you where you are.',
    watermark_text: 'PENSA TTU',
    copyright_text: '© 2026 PENSA TTU. All rights reserved.',
    privacy_terms_text: 'Privacy · Terms',
    show_notifications_btn: true,
    social_links: {
      facebook: '#',
      instagram: '#',
      youtube: '#',
      twitter: '',
      tiktok: '',
    },
    contact_info: {
      address: '12 Cantonments Road, Accra, GH',
      email: 'hello@pensattu.example',
      phone: '+233553070627',
      service_time: 'Sundays, 6:30 AM - 9:30 AM',
    },
    columns: [],
  });

  // New item form state for Navbar
  const [newNavItem, setNewNavItem] = useState({ label: '', path: '', is_dropdown: false });
  const [newSubItems, setNewSubItems] = useState({}); // keyed by nav item id: { label: '', path: '' }

  // New item form state for Footer columns
  const [newColLink, setNewColLink] = useState({}); // keyed by col id: { label: '', path: '' }

  useEffect(() => {
    loadNavigation();
  }, []);

  async function loadNavigation() {
    setLoading(true);
    try {
      const data = await adminApi.getNavigation();
      if (data) {
        if (data.navbar) setNavbar(data.navbar);
        if (data.footer) setFooter(data.footer);
      }
    } catch (err) {
      showAlert('error', err.message || 'Failed to load navigation configuration');
    } finally {
      setLoading(false);
    }
  }

  function showAlert(type, message) {
    setAlert({ type, message });
    setTimeout(() => {
      setAlert(null);
    }, 4500);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload = { navbar, footer };
      const res = await adminApi.updateNavigation(payload);
      if (res && res.ok) {
        showAlert('success', 'Navbar and Footer configuration saved successfully!');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('pensa-navigation-updated', { detail: payload }));
        }
      } else {
        showAlert('error', res?.error || 'Failed to save changes');
      }
    } catch (err) {
      showAlert('error', err.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  }

  async function handleReset() {
    if (!window.confirm('Are you sure you want to reset Navbar and Footer to default settings? Any customizations will be restored to defaults.')) {
      return;
    }
    setSaving(true);
    try {
      const res = await adminApi.resetNavigation();
      if (res && res.data) {
        setNavbar(res.data.navbar);
        setFooter(res.data.footer);
        showAlert('success', 'Reset back to default navigation.');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('pensa-navigation-updated', { detail: res.data }));
        }
      }
    } catch (err) {
      showAlert('error', err.message || 'Failed to reset navigation');
    } finally {
      setSaving(false);
    }
  }

  async function handleLogoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const url = await uploadImageToCloudinary(file, 'pensattu/branding');
      setNavbar((prev) => ({ ...prev, logo_image: url }));
      showAlert('success', 'Logo uploaded successfully!');
    } catch (err) {
      showAlert('error', err.message || 'Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  }

  // --- Navbar Item Handlers ---
  function addNavItem() {
    if (!newNavItem.label.trim()) {
      showAlert('error', 'Please enter a label for the menu item');
      return;
    }
    const id = 'nav-' + Date.now();
    const item = {
      id,
      label: newNavItem.label.trim(),
      path: newNavItem.path.trim(),
      is_dropdown: !!newNavItem.is_dropdown,
      children: newNavItem.is_dropdown ? [] : undefined,
    };
    setNavbar((prev) => ({
      ...prev,
      links: [...(prev.links || []), item],
    }));
    setNewNavItem({ label: '', path: '', is_dropdown: false });
  }

  function removeNavItem(id) {
    setNavbar((prev) => ({
      ...prev,
      links: (prev.links || []).filter((item) => item.id !== id),
    }));
  }

  function moveNavItem(index, direction) {
    setNavbar((prev) => {
      const links = [...(prev.links || [])];
      const target = index + direction;
      if (target < 0 || target >= links.length) return prev;
      const temp = links[index];
      links[index] = links[target];
      links[target] = temp;
      return { ...prev, links };
    });
  }

  function toggleDropdownMode(id) {
    setNavbar((prev) => ({
      ...prev,
      links: (prev.links || []).map((item) => {
        if (item.id !== id) return item;
        const willBeDropdown = !item.is_dropdown;
        return {
          ...item,
          is_dropdown: willBeDropdown,
          children: willBeDropdown ? (item.children || []) : undefined,
        };
      }),
    }));
  }

  function addSubItem(parentId) {
    const sub = newSubItems[parentId];
    if (!sub || !sub.label.trim()) {
      showAlert('error', 'Sub-item label is required');
      return;
    }
    const childId = 'sub-' + Date.now();
    const childItem = { id: childId, label: sub.label.trim(), path: sub.path.trim() || '#' };
    setNavbar((prev) => ({
      ...prev,
      links: (prev.links || []).map((item) => {
        if (item.id !== parentId) return item;
        return {
          ...item,
          children: [...(item.children || []), childItem],
        };
      }),
    }));
    setNewSubItems((prev) => ({ ...prev, [parentId]: { label: '', path: '' } }));
  }

  function removeSubItem(parentId, childId) {
    setNavbar((prev) => ({
      ...prev,
      links: (prev.links || []).map((item) => {
        if (item.id !== parentId) return item;
        return {
          ...item,
          children: (item.children || []).filter((c) => c.id !== childId),
        };
      }),
    }));
  }

  // --- Footer Handlers ---
  function addFooterColLink(colId) {
    const linkObj = newColLink[colId];
    if (!linkObj || !linkObj.label.trim()) {
      showAlert('error', 'Link label is required');
      return;
    }
    const newId = 'fl-' + Date.now();
    const newItem = { id: newId, label: linkObj.label.trim(), path: linkObj.path.trim() || '#' };
    setFooter((prev) => ({
      ...prev,
      columns: (prev.columns || []).map((col) => {
        if (col.id !== colId) return col;
        return {
          ...col,
          links: [...(col.links || []), newItem],
        };
      }),
    }));
    setNewColLink((prev) => ({ ...prev, [colId]: { label: '', path: '' } }));
  }

  function removeFooterColLink(colId, linkId) {
    setFooter((prev) => ({
      ...prev,
      columns: (prev.columns || []).map((col) => {
        if (col.id !== colId) return col;
        return {
          ...col,
          links: (col.links || []).filter((l) => l.id !== linkId),
        };
      }),
    }));
  }

  function updateFooterColTitle(colId, title) {
    setFooter((prev) => ({
      ...prev,
      columns: (prev.columns || []).map((col) => (col.id === colId ? { ...col, title } : col)),
    }));
  }

  if (loading) {
    return <div className="admin-loading">Loading navigation configuration...</div>;
  }

  return (
    <div className="admin-nav-container">
      <div className="admin-nav-header">
        <div>
          <h2>Navbar &amp; Footer Control</h2>
          <p className="admin-card-desc">
            Customize header branding, navigation menus, contact bar, footer columns, and social links.
          </p>
        </div>

        <div className="admin-nav-actions">
          <button type="button" className="admin-btn-reset" onClick={handleReset} disabled={saving}>
            Reset Defaults
          </button>
          <button type="button" className="admin-btn-save" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : '💾 Save Changes'}
          </button>
        </div>
      </div>

      {alert && (
        <div className={`admin-alert-banner ${alert.type}`}>
          <span>{alert.message}</span>
          <button type="button" onClick={() => setAlert(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>×</button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="admin-nav-tabs">
        <button
          type="button"
          className={`admin-nav-tab${activeTab === 'navbar' ? ' active' : ''}`}
          onClick={() => setActiveTab('navbar')}
        >
          🧭 Header &amp; Navbar
        </button>
        <button
          type="button"
          className={`admin-nav-tab${activeTab === 'footer' ? ' active' : ''}`}
          onClick={() => setActiveTab('footer')}
        >
          🦶 Footer &amp; Columns
        </button>
        <button
          type="button"
          className={`admin-nav-tab${activeTab === 'preview' ? ' active' : ''}`}
          onClick={() => setActiveTab('preview')}
        >
          👁️ Live Preview
        </button>
      </div>

      {/* --- TAB 1: HEADER & NAVBAR --- */}
      {activeTab === 'navbar' && (
        <div className="admin-grid-2">
          {/* Logo & Header Info */}
          <div className="admin-card-section">
            <div className="admin-card-title">Logo &amp; Brand Appearance</div>
            <p className="admin-card-desc">Configure the header logo image or text representation.</p>

            <div className="admin-form-group">
              <label className="admin-form-label">Brand Logo Image URL</label>
              <input
                type="text"
                className="admin-form-input"
                placeholder="/images/pensa.jpg or https://..."
                value={navbar.logo_image || ''}
                onChange={(e) => setNavbar({ ...navbar, logo_image: e.target.value })}
              />
              <div className="admin-upload-box">
                <div className="admin-logo-preview">
                  {navbar.logo_image ? (
                    <img src={getImageUrl(navbar.logo_image)} alt="Preview" onError={(e) => { e.target.style.display = 'none'; }} />
                  ) : (
                    <span>🖼️</span>
                  )}
                </div>
                <div>
                  <label className="admin-file-upload-btn">
                    <span>{uploadingLogo ? 'Uploading...' : 'Upload Logo to Cloudinary'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      disabled={uploadingLogo}
                      onChange={handleLogoUpload}
                    />
                  </label>
                  <p style={{ margin: '4px 0 0', fontSize: '11.5px', color: '#6c757d' }}>
                    Recommended: Transparent PNG or high-res JPG
                  </p>
                </div>
              </div>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Logo Alt / Brand Text</label>
              <input
                type="text"
                className="admin-form-input"
                placeholder="PENSA TTU"
                value={navbar.logo_text || ''}
                onChange={(e) => setNavbar({ ...navbar, logo_text: e.target.value })}
              />
            </div>

            <hr style={{ margin: '20px 0', borderColor: '#eef2f0' }} />

            <div className="admin-card-title">Header Quick Info</div>
            <div className="admin-form-group">
              <label className="admin-form-label">Contact Phone</label>
              <input
                type="text"
                className="admin-form-input"
                placeholder="+233553070627"
                value={navbar.phone || ''}
                onChange={(e) => setNavbar({ ...navbar, phone: e.target.value })}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Service Times / Subtext</label>
              <input
                type="text"
                className="admin-form-input"
                placeholder="Sun 6:30am - 9:30am"
                value={navbar.service_time || ''}
                onChange={(e) => setNavbar({ ...navbar, service_time: e.target.value })}
              />
            </div>

            <hr style={{ margin: '20px 0', borderColor: '#eef2f0' }} />

            <div className="admin-card-title">Header Action Button (CTA)</div>
            <div className="admin-form-group">
              <label className="admin-toggle-label">
                <input
                  type="checkbox"
                  checked={navbar.cta_show !== false}
                  onChange={(e) => setNavbar({ ...navbar, cta_show: e.target.checked })}
                />
                Show Call-to-Action button in header
              </label>
            </div>

            <div className="admin-form-row">
              <div className="admin-form-group" style={{ flex: 1 }}>
                <label className="admin-form-label">Button Label</label>
                <input
                  type="text"
                  className="admin-form-input"
                  placeholder="Contact us"
                  value={navbar.cta_label || ''}
                  onChange={(e) => setNavbar({ ...navbar, cta_label: e.target.value })}
                />
              </div>
              <div className="admin-form-group" style={{ flex: 1 }}>
                <label className="admin-form-label">Button Destination URL</label>
                <input
                  type="text"
                  className="admin-form-input"
                  placeholder="/contact"
                  value={navbar.cta_link || ''}
                  onChange={(e) => setNavbar({ ...navbar, cta_link: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Navigation Links Manager */}
          <div className="admin-card-section">
            <div className="admin-card-title">Navigation Menu Items</div>
            <p className="admin-card-desc">
              Organize top-level links and dropdown menus. Reorder with the arrows.
            </p>

            {/* Add New Item */}
            <div style={{ background: '#f8faf9', padding: 14, borderRadius: 10, border: '1px solid #e1e7e4' }}>
              <strong style={{ fontSize: 13.5, display: 'block', marginBottom: 8, color: '#1a2e26' }}>
                Add New Navigation Item
              </strong>
              <div className="admin-form-row" style={{ marginBottom: 8 }}>
                <input
                  type="text"
                  className="admin-form-input"
                  placeholder="Menu Label (e.g. About)"
                  value={newNavItem.label}
                  onChange={(e) => setNewNavItem({ ...newNavItem, label: e.target.value })}
                />
                <input
                  type="text"
                  className="admin-form-input"
                  placeholder="URL Path (e.g. /about)"
                  value={newNavItem.path}
                  onChange={(e) => setNewNavItem({ ...newNavItem, path: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label className="admin-toggle-label" style={{ fontSize: 13 }}>
                  <input
                    type="checkbox"
                    checked={newNavItem.is_dropdown}
                    onChange={(e) => setNewNavItem({ ...newNavItem, is_dropdown: e.target.checked })}
                  />
                  Has dropdown submenu
                </label>
                <button
                  type="button"
                  className="admin-btn-save"
                  style={{ padding: '6px 14px', fontSize: 13 }}
                  onClick={addNavItem}
                >
                  + Add Item
                </button>
              </div>
            </div>

            {/* Items List */}
            <div className="admin-menu-list">
              {(navbar.links || []).map((item, idx) => (
                <div key={item.id} className="admin-menu-item-row">
                  <div className="admin-menu-item-main">
                    <div className="admin-menu-item-info">
                      <span className={`admin-badge ${item.is_dropdown ? 'admin-badge-dropdown' : 'admin-badge-link'}`}>
                        {item.is_dropdown ? 'Dropdown' : 'Link'}
                      </span>
                      <div>
                        <div className="admin-item-label">{item.label}</div>
                        <div className="admin-item-path">{item.path || '(no direct link)'}</div>
                      </div>
                    </div>
                    <div className="admin-item-actions">
                      <button
                        type="button"
                        className="admin-icon-btn"
                        title="Move Up"
                        disabled={idx === 0}
                        onClick={() => moveNavItem(idx, -1)}
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        className="admin-icon-btn"
                        title="Move Down"
                        disabled={idx === (navbar.links || []).length - 1}
                        onClick={() => moveNavItem(idx, 1)}
                      >
                        ▼
                      </button>
                      <button
                        type="button"
                        className="admin-icon-btn"
                        title={item.is_dropdown ? 'Change to standard link' : 'Make dropdown menu'}
                        onClick={() => toggleDropdownMode(item.id)}
                      >
                        {item.is_dropdown ? '📂' : '📁'}
                      </button>
                      <button
                        type="button"
                        className="admin-icon-btn delete"
                        title="Delete item"
                        onClick={() => removeNavItem(item.id)}
                      >
                        🗑
                      </button>
                    </div>
                  </div>

                  {/* If Dropdown, display sub-items */}
                  {item.is_dropdown && (
                    <div className="admin-subitems-wrap">
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#3c5047' }}>
                        Dropdown Items ({item.children?.length || 0})
                      </div>
                      {(item.children || []).map((child) => (
                        <div key={child.id} className="admin-subitem-row">
                          <div>
                            <strong style={{ fontSize: 13 }}>{child.label}</strong>
                            <span style={{ fontSize: 12, color: '#6c757d', marginLeft: 8 }}>{child.path}</span>
                          </div>
                          <button
                            type="button"
                            className="admin-icon-btn delete"
                            style={{ width: 26, height: 26, fontSize: 11 }}
                            onClick={() => removeSubItem(item.id, child.id)}
                          >
                            ×
                          </button>
                        </div>
                      ))}

                      {/* Add Subitem Form */}
                      <div className="admin-add-subitem-form">
                        <input
                          type="text"
                          className="admin-form-input"
                          style={{ padding: '6px 10px', fontSize: 13 }}
                          placeholder="Sub-link label"
                          value={newSubItems[item.id]?.label || ''}
                          onChange={(e) =>
                            setNewSubItems({
                              ...newSubItems,
                              [item.id]: { ...(newSubItems[item.id] || {}), label: e.target.value },
                            })
                          }
                        />
                        <input
                          type="text"
                          className="admin-form-input"
                          style={{ padding: '6px 10px', fontSize: 13 }}
                          placeholder="Path (/page)"
                          value={newSubItems[item.id]?.path || ''}
                          onChange={(e) =>
                            setNewSubItems({
                              ...newSubItems,
                              [item.id]: { ...(newSubItems[item.id] || {}), path: e.target.value },
                            })
                          }
                        />
                        <button
                          type="button"
                          className="admin-btn-save"
                          style={{ padding: '6px 12px', fontSize: 12 }}
                          onClick={() => addSubItem(item.id)}
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: FOOTER & COLUMNS --- */}
      {activeTab === 'footer' && (
        <div className="admin-nav-container">
          <div className="admin-grid-2">
            {/* Branding & Tagline */}
            <div className="admin-card-section">
              <div className="admin-card-title">Footer Brand Identity</div>
              <p className="admin-card-desc">Brand title, accent text, and mission statement.</p>

              <div className="admin-form-row">
                <div className="admin-form-group" style={{ flex: 2 }}>
                  <label className="admin-form-label">Brand Title</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={footer.brand_title || ''}
                    onChange={(e) => setFooter({ ...footer, brand_title: e.target.value })}
                  />
                </div>
                <div className="admin-form-group" style={{ flex: 1 }}>
                  <label className="admin-form-label">Accent (Highlighted)</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    placeholder="TTU"
                    value={footer.brand_accent || ''}
                    onChange={(e) => setFooter({ ...footer, brand_accent: e.target.value })}
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Tagline / Mission Statement</label>
                <textarea
                  className="admin-form-textarea"
                  rows={3}
                  value={footer.brand_tagline || ''}
                  onChange={(e) => setFooter({ ...footer, brand_tagline: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Background Watermark Word</label>
                <input
                  type="text"
                  className="admin-form-input"
                  placeholder="PENSA TTU"
                  value={footer.watermark_text || ''}
                  onChange={(e) => setFooter({ ...footer, watermark_text: e.target.value })}
                />
              </div>

              <hr style={{ margin: '20px 0', borderColor: '#eef2f0' }} />

              <div className="admin-card-title">Copyright &amp; Bottom Bar</div>
              <div className="admin-form-group">
                <label className="admin-form-label">Copyright Text</label>
                <input
                  type="text"
                  className="admin-form-input"
                  placeholder="© 2026 PENSA TTU. All rights reserved."
                  value={footer.copyright_text || ''}
                  onChange={(e) => setFooter({ ...footer, copyright_text: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Privacy &amp; Terms Link Text</label>
                <input
                  type="text"
                  className="admin-form-input"
                  placeholder="Privacy · Terms"
                  value={footer.privacy_terms_text || ''}
                  onChange={(e) => setFooter({ ...footer, privacy_terms_text: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-toggle-label">
                  <input
                    type="checkbox"
                    checked={footer.show_notifications_btn !== false}
                    onChange={(e) => setFooter({ ...footer, show_notifications_btn: e.target.checked })}
                  />
                  Show "Enable Notifications" push button
                </label>
              </div>
            </div>

            {/* Social Links & Visit Us Contact Info */}
            <div className="admin-card-section">
              <div className="admin-card-title">Visit Us Contact Info</div>
              <p className="admin-card-desc">Church contact and service information displayed in footer.</p>

              <div className="admin-form-group">
                <label className="admin-form-label">📍 Physical Address / Location</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={footer.contact_info?.address || ''}
                  onChange={(e) =>
                    setFooter({
                      ...footer,
                      contact_info: { ...(footer.contact_info || {}), address: e.target.value },
                    })
                  }
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">✉️ Email Address</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={footer.contact_info?.email || ''}
                  onChange={(e) =>
                    setFooter({
                      ...footer,
                      contact_info: { ...(footer.contact_info || {}), email: e.target.value },
                    })
                  }
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">☎ Phone Number</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={footer.contact_info?.phone || ''}
                  onChange={(e) =>
                    setFooter({
                      ...footer,
                      contact_info: { ...(footer.contact_info || {}), phone: e.target.value },
                    })
                  }
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">🕊 Sunday Services Schedule</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={footer.contact_info?.service_time || ''}
                  onChange={(e) =>
                    setFooter({
                      ...footer,
                      contact_info: { ...(footer.contact_info || {}), service_time: e.target.value },
                    })
                  }
                />
              </div>

              <hr style={{ margin: '20px 0', borderColor: '#eef2f0' }} />

              <div className="admin-card-title">Social Media Links</div>
              <div className="admin-form-row">
                <div className="admin-form-group" style={{ flex: 1 }}>
                  <label className="admin-form-label">Facebook URL</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    placeholder="https://facebook.com/..."
                    value={footer.social_links?.facebook || ''}
                    onChange={(e) =>
                      setFooter({
                        ...footer,
                        social_links: { ...(footer.social_links || {}), facebook: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="admin-form-group" style={{ flex: 1 }}>
                  <label className="admin-form-label">Instagram URL</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    placeholder="https://instagram.com/..."
                    value={footer.social_links?.instagram || ''}
                    onChange={(e) =>
                      setFooter({
                        ...footer,
                        social_links: { ...(footer.social_links || {}), instagram: e.target.value },
                      })
                    }
                  />
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group" style={{ flex: 1 }}>
                  <label className="admin-form-label">YouTube URL</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    placeholder="https://youtube.com/..."
                    value={footer.social_links?.youtube || ''}
                    onChange={(e) =>
                      setFooter({
                        ...footer,
                        social_links: { ...(footer.social_links || {}), youtube: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="admin-form-group" style={{ flex: 1 }}>
                  <label className="admin-form-label">Twitter / X URL</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    placeholder="https://x.com/..."
                    value={footer.social_links?.twitter || ''}
                    onChange={(e) =>
                      setFooter({
                        ...footer,
                        social_links: { ...(footer.social_links || {}), twitter: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Columns Manager */}
          <div className="admin-card-section">
            <div className="admin-card-title">Footer Navigation Columns</div>
            <p className="admin-card-desc">
              Organize links in the footer grid columns (e.g. Church links, Ministries &amp; Teams).
            </p>

            <div className="admin-footer-columns">
              {(footer.columns || []).map((col) => (
                <div key={col.id} className="admin-column-card">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Column Title</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={col.title}
                      onChange={(e) => updateFooterColTitle(col.id, e.target.value)}
                    />
                  </div>

                  <strong style={{ fontSize: 12.5, color: '#4d6157' }}>Links ({col.links?.length || 0})</strong>
                  <div className="admin-col-links-list">
                    {(col.links || []).map((link) => (
                      <div key={link.id} className="admin-col-link-row">
                        <div>
                          <strong style={{ fontSize: 13 }}>{link.label}</strong>
                          <span style={{ fontSize: 12, color: '#7a8b84', marginLeft: 8 }}>{link.path}</span>
                        </div>
                        <button
                          type="button"
                          className="admin-icon-btn delete"
                          style={{ width: 26, height: 26 }}
                          onClick={() => removeFooterColLink(col.id, link.id)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add link form */}
                  <div style={{ marginTop: 12, display: 'flex', gap: 6 }}>
                    <input
                      type="text"
                      className="admin-form-input"
                      style={{ padding: '6px 10px', fontSize: 12.5 }}
                      placeholder="Label"
                      value={newColLink[col.id]?.label || ''}
                      onChange={(e) =>
                        setNewColLink({
                          ...newColLink,
                          [col.id]: { ...(newColLink[col.id] || {}), label: e.target.value },
                        })
                      }
                    />
                    <input
                      type="text"
                      className="admin-form-input"
                      style={{ padding: '6px 10px', fontSize: 12.5 }}
                      placeholder="Path"
                      value={newColLink[col.id]?.path || ''}
                      onChange={(e) =>
                        setNewColLink({
                          ...newColLink,
                          [col.id]: { ...(newColLink[col.id] || {}), path: e.target.value },
                        })
                      }
                    />
                    <button
                      type="button"
                      className="admin-btn-save"
                      style={{ padding: '6px 12px', fontSize: 12 }}
                      onClick={() => addFooterColLink(col.id)}
                    >
                      + Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 3: LIVE PREVIEW --- */}
      {activeTab === 'preview' && (
        <div className="admin-card-section">
          <div className="admin-card-title">Live Preview (Desktop View)</div>
          <p className="admin-card-desc">
            This preview renders the header and footer using your exact current configurations.
          </p>

          <div className="admin-preview-frame">
            <div className="admin-preview-header-bar">
              <span>PREVIEW MODE</span>
              <span>http://localhost:5173/</span>
            </div>

            {/* Mock Header */}
            <header style={{ position: 'relative' }}>
              <nav className="nav" style={{ maxWidth: '100%' }}>
                <div className="logo">
                  {navbar.logo_image ? (
                    <img src={getImageUrl(navbar.logo_image)} alt="Preview Logo" />
                  ) : (
                    <span style={{ fontWeight: 800, fontSize: '1.25rem' }}>{navbar.logo_text || 'PENSA TTU'}</span>
                  )}
                </div>

                <ul className="nav-links">
                  {(navbar.links || []).map((item) => (
                    <li key={item.id} className={item.is_dropdown ? 'has-dropdown' : ''}>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>
                        {item.label} {item.is_dropdown ? '▾' : ''}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="nav-right">
                  {(navbar.phone || navbar.service_time) && (
                    <div className="nav-phone">
                      <div className="ic">☎</div>
                      <div>
                        {navbar.phone && <strong>{navbar.phone}</strong>}
                        {navbar.service_time && <small>{navbar.service_time}</small>}
                      </div>
                    </div>
                  )}
                  {navbar.cta_show !== false && navbar.cta_label && (
                    <span className="btn btn-dark" style={{ cursor: 'default' }}>
                      {navbar.cta_label}
                    </span>
                  )}
                </div>
              </nav>
            </header>

            {/* Mock Content */}
            <div className="admin-preview-content">
              <h3 style={{ margin: '0 0 10px', color: '#1a2e26' }}>Website Page Content Area</h3>
              <p style={{ margin: 0, color: '#6c757d', fontSize: 14 }}>
                Header sits above and Footer sits below. Real-time changes in settings reflect here immediately.
              </p>
            </div>

            {/* Mock Footer */}
            <footer>
              <div className="wrap">
                <div className="foot-grid">
                  <div>
                    <div className="foot-logo">
                      {footer.brand_title || 'PENSA'} {footer.brand_accent ? <span>{footer.brand_accent}</span> : null}
                    </div>
                    {footer.brand_tagline && <p>{footer.brand_tagline}</p>}
                    <div className="foot-social">
                      {Object.entries(footer.social_links || {}).map(([net, url]) =>
                        url ? <span key={net} style={{ cursor: 'default' }}>{net.slice(0, 2)}</span> : null
                      )}
                    </div>
                  </div>

                  {(footer.columns || []).map((col) => (
                    <div key={col.id}>
                      <h4>{col.title}</h4>
                      <ul>
                        {(col.links || []).map((link) => (
                          <li key={link.id}>
                            <span>{link.label}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}

                  <div>
                    <h4>Visit Us</h4>
                    <ul className="foot-contact">
                      {footer.contact_info?.address && <li>📍 {footer.contact_info.address}</li>}
                      {footer.contact_info?.email && <li>✉️ {footer.contact_info.email}</li>}
                      {footer.contact_info?.phone && <li>☎ {footer.contact_info.phone}</li>}
                      {footer.contact_info?.service_time && <li>🕊 {footer.contact_info.service_time}</li>}
                    </ul>
                  </div>
                </div>

                <div className="foot-bottom">
                  <span>{footer.copyright_text || '© 2026 PENSA TTU. All rights reserved.'}</span>
                  <span>{footer.privacy_terms_text || 'Privacy · Terms'}</span>
                </div>

                {footer.watermark_text && <div className="foot-word">{footer.watermark_text}</div>}
              </div>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
