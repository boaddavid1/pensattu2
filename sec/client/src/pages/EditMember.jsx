// EditMember.jsx — Edit an existing member (ported from edit_user.php)
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { secApi } from '../api/secApi.js';
import PhotoUpload from '../components/PhotoUpload.jsx';

export default function EditMember() {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    secApi.getMember(id).then(data => setForm(data.member)).catch(err => setError(err.message));
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await secApi.updateMember(id, form);
      navigate(`/members/${id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!form && !error) return <div className="loading">Loading...</div>;
  if (error && !form) return <div className="error-msg">{error}</div>;

  return (
    <>
      <div className="head-title">
        <div className="left">
          <h1>Edit Member</h1>
          <ul className="breadcrumb">
            <li><a className="active" href="/members">Members</a></li>
            <li><i className='bx bx-chevron-right'></i></li>
            <li><a>Edit</a></li>
          </ul>
        </div>
      </div>

      {error && <div className="error-msg">{error}</div>}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: 32, marginBottom: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <PhotoUpload photoData={form.profile_image || ''} onChange={(data) => setForm(f => ({ ...f, profile_image: data }))} />
            <div style={{ flex: 1, minWidth: 250 }}>
              <h3 style={{ marginBottom: 8 }}>Profile Photo</h3>
              <p style={{ color: 'var(--dark-grey)', fontSize: 14 }}>Upload or update the profile photo. Click the circle or drag and drop. Max 5MB.</p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
            <div className="form-group"><label>Surname *</label><input name="surname" value={form.surname || ''} onChange={handleChange} required /></div>
            <div className="form-group"><label>Other Names *</label><input name="othernames" value={form.othernames || ''} onChange={handleChange} required /></div>
            <div className="form-group"><label>Gender</label>
              <select name="gender" value={form.gender || 'male'} onChange={handleChange}>
                <option value="male">Male</option><option value="female">Female</option>
              </select>
            </div>
            <div className="form-group"><label>Date of Birth</label><input type="date" name="dob" value={form.dob ? form.dob.slice(0, 10) : ''} onChange={handleChange} /></div>
            <div className="form-group"><label>Contact</label><input name="contact" value={form.contact || ''} onChange={handleChange} /></div>
            <div className="form-group"><label>Residence</label><input name="residence" value={form.residence || ''} onChange={handleChange} /></div>
            <div className="form-group"><label>Room</label><input name="room" value={form.room || ''} onChange={handleChange} /></div>
            <div className="form-group"><label>Program</label><input name="program" value={form.program || ''} onChange={handleChange} /></div>
            <div className="form-group"><label>Program Duration</label>
              <select name="program_duration" value={form.program_duration || ''} onChange={handleChange}>
                <option value="">--</option><option value="HND">HND</option><option value="B-TECH">B-TECH</option><option value="Diploma">Diploma</option>
              </select>
            </div>
            <div className="form-group"><label>Education Level</label><input name="education_level" value={form.education_level || ''} onChange={handleChange} /></div>
            <div className="form-group"><label>Membership Type</label>
              <select name="membership_type" value={form.membership_type || 'member'} onChange={handleChange}>
                <option value="member">Member</option><option value="associate">Associate</option>
              </select>
            </div>
            <div className="form-group"><label>Campus Residence</label>
              <select name="campus_residence" value={form.campus_residence || ''} onChange={handleChange}>
                <option value="">--</option><option value="on-campus">On-Campus</option><option value="off-campus">Off-Campus</option>
              </select>
            </div>
            <div className="form-group"><label>Campus Hall</label><input name="campus_hall" value={form.campus_hall || ''} onChange={handleChange} /></div>
            <div className="form-group"><label>Off-Campus Location</label><input name="offcampus_location" value={form.offcampus_location || ''} onChange={handleChange} /></div>
            <div className="form-group"><label>Landmark</label><input name="landmark" value={form.landmark || ''} onChange={handleChange} /></div>
            <div className="form-group"><label>District</label><input name="district" value={form.district || ''} onChange={handleChange} /></div>
            <div className="form-group"><label>Pastor</label><input name="pastor" value={form.pastor || ''} onChange={handleChange} /></div>
            <div className="form-group"><label>Guardian</label><input name="guardian" value={form.guardian || ''} onChange={handleChange} /></div>
            <div className="form-group"><label>Guardian Contact</label><input name="guardian_contact" value={form.guardian_contact || ''} onChange={handleChange} /></div>
            <div className="form-group"><label>Officer Role</label>
              <select name="officer_role" value={form.officer_role || ''} onChange={handleChange}>
                <option value="">--</option><option value="Elder">Elder</option><option value="Deacon">Deacon</option><option value="Deaconess">Deaconess</option>
              </select>
            </div>
            <div className="form-group"><label>Other Info</label><input name="departments" value={form.departments || ''} onChange={handleChange} /></div>
          </div>
          <div className="form-group" style={{ marginTop: 16 }}>
            <label className="col-1">
              <input type="checkbox" name="is_officer" checked={!!form.is_officer} onChange={handleChange} /> Is a Church Officer
            </label>
          </div>
          <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Update Member'}</button>
            <button type="button" className="btn btn-back" onClick={() => navigate(`/members/${id}`)}>Cancel</button>
          </div>
        </form>
      </div>
    </>
  );
}
