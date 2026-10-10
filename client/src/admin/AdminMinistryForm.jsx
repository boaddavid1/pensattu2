import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { adminApi } from './adminApi';
import { uploadImageToCloudinary } from '../cloudinaryUpload';

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
    // Leader Information
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
  const [error, setError] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingLeaderImg, setUploadingLeaderImg] = useState(false);
  const [uploadingAstIdx, setUploadingAstIdx] = useState(null);

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

  function handleChange(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  // Cover Image
  async function handleCoverUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const url = await uploadImageToCloudinary(file, 'pensattu/ministries');
      handleChange('image_url', url);
    } catch (err) {
      setError(err.message || 'Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  }

  // Leader Image
  async function handleLeaderUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingLeaderImg(true);
    try {
      const url = await uploadImageToCloudinary(file, 'pensattu/ministries/leaders');
      handleChange('leader_image', url);
    } catch (err) {
      setError(err.message || 'Leader image upload failed');
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
    const file = e.target.files[0];
    if (!file) return;
    setUploadingAstIdx(index);
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

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Ministry title is required.');
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
      navigate('/control-panel/ministries');
    } catch (err) {
      setError(err.message || 'Failed to save ministry');
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="admin-loading" style={{ padding: '60px', textAlign: 'center' }}>
        Loading ministry details...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '60px' }}>
      <div className="admin-page-header" style={{ marginBottom: '24px' }}>
        <div>
          <Link
            to="/control-panel/ministries"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13.5px',
              color: 'var(--pine)',
              textDecoration: 'none',
              fontWeight: 600,
              marginBottom: '8px',
            }}
          >
            ← Back to Departments &amp; Teams
          </Link>
          <h2 style={{ margin: 0 }}>
            {isNew ? 'New Department / Ministry' : `Edit: ${form.title || 'Ministry'}`}
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => navigate('/control-panel/ministries')}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? 'Saving...' : isNew ? 'Create Department' : 'Save Changes'}
          </button>
        </div>
      </div>

      {error && (
        <div className="admin-error" style={{ marginBottom: '24px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Section 1: Basic Information */}
        <div className="admin-card" style={{ marginBottom: '28px', padding: '28px' }}>
          <h3
            style={{
              fontSize: '18px',
              color: 'var(--pine-deep)',
              margin: '0 0 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              borderBottom: '1px solid #edf2ef',
              paddingBottom: '12px',
            }}
          >
            <span>🏛️</span> Basic Department Details
          </h3>

          <div className="admin-form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            <label>
              Ministry / Department Title *
              <input
                type="text"
                value={form.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="e.g. Music & Worship Ministry"
                required
              />
            </label>

            <label>
              Category
              <select
                value={form.category}
                onChange={(e) => handleChange('category', e.target.value)}
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>

            <label>
              Meeting Time / Schedule
              <input
                type="text"
                value={form.meeting}
                onChange={(e) => handleChange('meeting', e.target.value)}
                placeholder="e.g. Saturdays, 3:00 PM"
              />
            </label>

            <label>
              Meeting Venue
              <input
                type="text"
                value={form.venue}
                onChange={(e) => handleChange('venue', e.target.value)}
                placeholder="e.g. Main Sanctuary & Choir Hall"
              />
            </label>

            <label>
              Display Order
              <input
                type="number"
                value={form.display_order}
                onChange={(e) => handleChange('display_order', e.target.value)}
              />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginTop: '24px' }}>
              <input
                type="checkbox"
                checked={Boolean(form.is_active)}
                onChange={(e) => handleChange('is_active', e.target.checked ? 1 : 0)}
                style={{ width: '18px', height: '18px' }}
              />
              <span style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--pine-deep)' }}>
                Active &amp; Visible to Public
              </span>
            </label>
          </div>

          <label className="admin-form-full" style={{ marginTop: '16px' }}>
            Short Summary Description (shown on overview cards)
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Brief summary of what this ministry is about..."
            />
          </label>

          <label className="admin-form-full" style={{ marginTop: '16px' }}>
            Full In-depth Description (shown on the detailed page)
            <textarea
              rows={4}
              value={form.full_description}
              onChange={(e) => handleChange('full_description', e.target.value)}
              placeholder="Detailed overview of the department's purpose, vision, and mission..."
            />
          </label>

          <label className="admin-form-full" style={{ marginTop: '16px' }}>
            Scripture Reference &amp; Verse
            <input
              type="text"
              value={form.scripture}
              onChange={(e) => handleChange('scripture', e.target.value)}
              placeholder='e.g. Psalm 100:1-2 — "Make a joyful noise unto the Lord..."'
            />
          </label>

          <div className="admin-form-grid" style={{ gridTemplateColumns: '1fr 1fr', marginTop: '16px' }}>
            <label>
              Core Responsibilities
              <textarea
                rows={3}
                value={form.responsibilities}
                onChange={(e) => handleChange('responsibilities', e.target.value)}
                placeholder="Primary duties and assignments handled by members..."
              />
            </label>

            <label>
              Who Should Join (Ideal For)
              <textarea
                rows={3}
                value={form.ideal_for}
                onChange={(e) => handleChange('ideal_for', e.target.value)}
                placeholder="Who is this ministry best suited for? (e.g. singers, technicians...)"
              />
            </label>
          </div>

          {/* Banner Image */}
          <div style={{ marginTop: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px' }}>Cover / Banner Image</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverUpload}
                disabled={uploadingImage}
                style={{ width: 'auto' }}
              />
              {uploadingImage && <span style={{ fontSize: '13px', color: 'var(--pine)' }}>Uploading image...</span>}
              {form.image_url && (
                <img
                  src={form.image_url}
                  alt="Banner preview"
                  style={{ width: '120px', height: '65px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #cdd8d1' }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Primary Ministry Leader Information */}
        <div className="admin-card" style={{ marginBottom: '28px', padding: '28px', background: '#fdfefd' }}>
          <h3
            style={{
              fontSize: '18px',
              color: 'var(--pine-deep)',
              margin: '0 0 6px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>👤</span> Ministry Leader Information
          </h3>
          <p style={{ margin: '0 0 20px', fontSize: '13.5px', color: '#65776f' }}>
            Provide details for the primary lead / director in charge of this ministry.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '24px', alignItems: 'start' }}>
            {/* Leader Avatar */}
            <div>
              <div
                style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  background: '#eef3f0',
                  border: '3px solid var(--moss, #c4f092)',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '10px',
                }}
              >
                {form.leader_image ? (
                  <img
                    src={form.leader_image}
                    alt="Leader"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span style={{ fontSize: '32px', color: '#88998f' }}>👤</span>
                )}
              </div>
              <label
                className="btn btn-ghost"
                style={{
                  padding: '5px 10px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  display: 'block',
                }}
              >
                {uploadingLeaderImg ? 'Uploading...' : 'Upload Photo'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLeaderUpload}
                  disabled={uploadingLeaderImg}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            {/* Leader Text Fields */}
            <div className="admin-form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
              <label>
                Leader Full Name
                <input
                  type="text"
                  value={form.leader_name}
                  onChange={(e) => handleChange('leader_name', e.target.value)}
                  placeholder="e.g. Minister Emmanuel Adjei"
                />
              </label>

              <label>
                Role / Title
                <input
                  type="text"
                  value={form.leader_role}
                  onChange={(e) => handleChange('leader_role', e.target.value)}
                  placeholder="e.g. Music Director & Head of Worship"
                />
              </label>

              <label>
                Phone / WhatsApp Number
                <input
                  type="text"
                  value={form.leader_phone}
                  onChange={(e) => handleChange('leader_phone', e.target.value)}
                  placeholder="e.g. +233 55 307 0627"
                />
              </label>

              <label>
                Email Address
                <input
                  type="email"
                  value={form.leader_email}
                  onChange={(e) => handleChange('leader_email', e.target.value)}
                  placeholder="e.g. worship@pensattu.org"
                />
              </label>

              <label className="admin-form-full">
                Leader Bio / Description
                <textarea
                  rows={2}
                  value={form.leader_bio}
                  onChange={(e) => handleChange('leader_bio', e.target.value)}
                  placeholder="Brief background, heart for the ministry, and years of service..."
                />
              </label>
            </div>
          </div>
        </div>

        {/* Section 3: Assistant Leaders ("Assistances") */}
        <div className="admin-card" style={{ marginBottom: '28px', padding: '28px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
              borderBottom: '1px solid #edf2ef',
              paddingBottom: '12px',
            }}
          >
            <div>
              <h3
                style={{
                  fontSize: '18px',
                  color: 'var(--pine-deep)',
                  margin: '0 0 4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>👥</span> Assistant Leaders (&quot;Assistances&quot;)
                <span
                  style={{
                    background: '#e4efe7',
                    color: 'var(--pine)',
                    padding: '2px 10px',
                    borderRadius: '20px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                  }}
                >
                  {assistants.length}
                </span>
              </h3>
              <p style={{ margin: 0, fontSize: '13.5px', color: '#65776f' }}>
                Add assistant heads, section coordinators, or ministry secretaries.
              </p>
            </div>

            <button
              type="button"
              className="btn btn-ghost"
              onClick={addAssistant}
              style={{
                borderColor: 'var(--pine)',
                color: 'var(--pine)',
                fontWeight: 700,
                fontSize: '13.5px',
              }}
            >
              + Add Assistant Leader
            </button>
          </div>

          {assistants.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '36px 20px',
                background: '#f9fbf9',
                borderRadius: '12px',
                border: '1px dashed #cdd8d1',
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>👥</div>
              <p style={{ margin: '0 0 12px', color: '#60726a', fontSize: '14px' }}>
                No assistant leaders added for this ministry yet.
              </p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={addAssistant}
                style={{ fontSize: '13px' }}
              >
                + Add First Assistant
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {assistants.map((ast, index) => (
                <div
                  key={ast.id || index}
                  style={{
                    background: '#f8faf9',
                    borderRadius: '14px',
                    padding: '20px',
                    border: '1px solid #dce5df',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '14px',
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: '13.5px',
                        color: 'var(--pine)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span
                        style={{
                          width: '22px',
                          height: '22px',
                          background: 'var(--pine)',
                          color: '#fff',
                          borderRadius: '50%',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                        }}
                      >
                        {index + 1}
                      </span>
                      Assistant Leader
                    </span>

                    <button
                      type="button"
                      onClick={() => removeAssistant(index)}
                      style={{
                        background: '#fdf2f2',
                        color: '#b91c1c',
                        border: '1px solid #fecaca',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      ✕ Remove Assistant
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '18px', alignItems: 'start' }}>
                    {/* Assistant Avatar */}
                    <div>
                      <div
                        style={{
                          width: '70px',
                          height: '70px',
                          borderRadius: '50%',
                          background: '#e9efeb',
                          border: '2px solid #ccd8d1',
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: '6px',
                        }}
                      >
                        {ast.image_url ? (
                          <img
                            src={ast.image_url}
                            alt={ast.name || 'Assistant'}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <span style={{ fontSize: '24px', color: '#90a097' }}>👤</span>
                        )}
                      </div>
                      <label
                        style={{
                          fontSize: '11px',
                          color: 'var(--pine)',
                          cursor: 'pointer',
                          display: 'block',
                          textAlign: 'center',
                          textDecoration: 'underline',
                          fontWeight: 600,
                        }}
                      >
                        {uploadingAstIdx === index ? 'Uploading...' : 'Photo'}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleAssistantUpload(index, e)}
                          disabled={uploadingAstIdx === index}
                          style={{ display: 'none' }}
                        />
                      </label>
                    </div>

                    {/* Assistant Inputs */}
                    <div className="admin-form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', rowGap: '12px' }}>
                      <label>
                        Full Name *
                        <input
                          type="text"
                          value={ast.name}
                          onChange={(e) => updateAssistant(index, 'name', e.target.value)}
                          placeholder="e.g. Sis. Abigail Mensah"
                          required
                        />
                      </label>

                      <label>
                        Role / Designation
                        <input
                          type="text"
                          value={ast.role}
                          onChange={(e) => updateAssistant(index, 'role', e.target.value)}
                          placeholder="e.g. Assistant Choir Director"
                        />
                      </label>

                      <label>
                        Phone / WhatsApp
                        <input
                          type="text"
                          value={ast.phone}
                          onChange={(e) => updateAssistant(index, 'phone', e.target.value)}
                          placeholder="e.g. +233 24 551 2341"
                        />
                      </label>

                      <label className="admin-form-full">
                        Bio / Responsibilities Note
                        <input
                          type="text"
                          value={ast.bio}
                          onChange={(e) => updateAssistant(index, 'bio', e.target.value)}
                          placeholder="Oversees vocal warm-ups and choir schedules..."
                        />
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 4: Key Regular Activities */}
        <div className="admin-card" style={{ marginBottom: '28px', padding: '28px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
              borderBottom: '1px solid #edf2ef',
              paddingBottom: '12px',
            }}
          >
            <div>
              <h3
                style={{
                  fontSize: '18px',
                  color: 'var(--pine-deep)',
                  margin: '0 0 4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>🗓️</span> Key Regular Activities
              </h3>
              <p style={{ margin: 0, fontSize: '13.5px', color: '#65776f' }}>
                Shown on the sidebar checklist of the detailed ministry page.
              </p>
            </div>

            <button
              type="button"
              className="btn btn-ghost"
              onClick={addActivity}
              style={{
                borderColor: 'var(--pine)',
                color: 'var(--pine)',
                fontWeight: 700,
                fontSize: '13px',
              }}
            >
              + Add Activity
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {activities.map((act, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: 'var(--moss-deep)', width: '20px' }}>
                  {idx + 1}.
                </span>
                <input
                  type="text"
                  value={act}
                  onChange={(e) => updateActivity(idx, e.target.value)}
                  placeholder="e.g. Saturday weekly choir & band rehearsals"
                  style={{ flex: 1 }}
                />
                {activities.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeActivity(idx)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#b91c1c',
                      fontSize: '16px',
                      cursor: 'pointer',
                      padding: '4px 8px',
                    }}
                    title="Remove activity"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="admin-form-actions" style={{ justifyContent: 'flex-end', gap: '12px' }}>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => navigate('/control-panel/ministries')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
            style={{ minWidth: '160px' }}
          >
            {saving ? 'Saving...' : isNew ? 'Create Department' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
