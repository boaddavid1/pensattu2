import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './Register.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const TOTAL_STEPS = 6;
const STEP_LABELS = ['Personal', 'Residence', 'Depts', 'Guardian', 'Photo', 'Review'];

const CAMPU_HALLS = [
  'Nzema', 'Ahant', 'SRC Complex', 'University Hall', 'Pro. Dancan', 'Getfund',
];
const EDUCATION_LEVELS = [
  { value: '100', label: 'Level 100' },
  { value: '200', label: 'Level 200' },
  { value: '300', label: 'Level 300' },
  { value: '400', label: 'Level 400' },
];
const PROGRAM_DURATIONS = ['B-TECH', 'HND', 'Diploma'];
const OFFICER_ROLES = ['Elder', 'Deacon', 'Deaconess'];

const DEPARTMENTS = [
  {
    title: 'Media & Communications',
    items: [
      ['media', 'MEDIA DEPT.'], ['publicity', 'PUBLICITY DEPT.'], ['technical', 'TECHNICAL DEPT.'],
      ['organizing', 'ORGANIZING DEPT.'], ['secretarial', 'SECRETARIAL DESK'], ['alumni', 'ALUMNI DEPT.'],
      ['editorial', 'EDITORIAL BOARD'],
    ],
  },
  {
    title: 'Spiritual & Fellowship',
    items: [
      ['prayer', 'PRAYER DEPT.'], ['evangelism', 'EVANGELISM DEPT.'], ['child', 'CHILD EVANG.'],
      ['music', 'MUSIC & DRAMA DEPT.'], ['political', 'POLITICAL CHAMBER'],
      ['special_needs', 'SPECIAL NEEDS DEPT.'], ['bible_studies', 'BIBLE STUDIES.'],
    ],
  },
  {
    title: 'Service & Wings',
    items: [
      ['pemosca', 'PEMOSCA'], ['ushering', 'USHERING DEPT.'], ['welfare', 'WELFARE DEPT.'],
      ['ladies', 'LADIES WING'], ['gents', 'GENTS WING'], ['schools', 'SCHOOLS CORD.'],
      ['professional', 'PROFESSIONAL GUILD'],
    ],
  },
];

const EMPTY = {
  surname: '', othernames: '', gender: '', dob: '', contact: '',
  campus_residence: '', campus_hall: '', room_campus: '',
  offcampus_location: '', room_offcampus: '', landmark: '',
  program: '', education_level: '', program_duration: '',
  membership: '', is_officer: 'no', officer_role: '',
  departments: [],
  district: '', pastor: '', guardian: '', guardian_contact: '',
  photoData: '',
};

export default function Register() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(EMPTY);
  const [photo, setPhoto] = useState('');
  const [toasts, setToasts] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(null); // { name } | null
  const [invalid, setInvalid] = useState({});
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraOpen, setCameraOpen] = useState(false);

  // Clean up any camera stream on unmount / step change
  useEffect(() => () => stopCamera(), []);
  useEffect(() => { stopCamera(); }, [step]);

  function showToast(message, type = 'info') {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 5000);
  }

  function setField(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
    setInvalid((v) => ({ ...v, [name]: false }));
  }

  function toggleDept(value) {
    setForm((f) => {
      const has = f.departments.includes(value);
      return { ...f, departments: has ? f.departments.filter((d) => d !== value) : [...f.departments, value] };
    });
  }

  // ─── Validation per step ──────────────────────────────
  function validateStep(n) {
    const bad = {};
    const mark = (k) => { bad[k] = true; };
    const require = (k, label) => {
      if (!String(form[k] ?? '').trim()) { mark(k); showToast(`Please fill in ${label || k}`, 'error'); return false; }
      return true;
    };

    if (n === 1) {
      require('surname', 'surname'); require('othernames', 'other names');
      if (!form.gender) { mark('gender'); showToast('Please select gender', 'error'); }
      require('dob', 'date of birth');
      if (form.contact && !/^[0-9]{10}$/.test(form.contact.trim())) { mark('contact'); showToast('Contact must be exactly 10 digits', 'error'); }
      else require('contact', 'contact');
    } else if (n === 2) {
      if (!form.campus_residence) { mark('campus_residence'); showToast('Please select campus residence', 'error'); }
      if (form.campus_residence === 'yes') {
        if (!form.campus_hall) { mark('campus_hall'); showToast('Please select your campus hall', 'error'); }
        if (!form.room_campus.trim()) { mark('room_campus'); showToast('Please enter your room number', 'error'); }
      } else if (form.campus_residence === 'no') {
        if (!form.offcampus_location.trim()) { mark('offcampus_location'); showToast('Please enter your hostel/location', 'error'); }
        if (!form.room_offcampus.trim()) { mark('room_offcampus'); showToast('Please enter your room number', 'error'); }
      }
      require('program', 'program of study');
      if (!form.education_level) { mark('education_level'); showToast('Please select education level', 'error'); }
      if (!form.program_duration) { mark('program_duration'); showToast('Please select program duration', 'error'); }
    } else if (n === 3) {
      if (!form.membership) { mark('membership'); showToast('Please select membership type', 'error'); }
      if (form.is_officer === 'yes' && !form.officer_role) { mark('officer_role'); showToast('Please select your officer role', 'error'); }
      if (form.departments.length === 0) { showToast('Please select at least one department', 'warning'); return false; }
    } else if (n === 4) {
      require('district', 'district'); require('pastor', 'district pastor');
      require('guardian', 'guardian name');
      if (form.guardian_contact && !/^[0-9]{10}$/.test(form.guardian_contact.trim())) { mark('guardian_contact'); showToast('Guardian contact must be 10 digits', 'error'); }
      else require('guardian_contact', 'guardian contact');
    } else if (n === 5) {
      if (!photo) { showToast('Please upload or capture a photo', 'warning'); return false; }
    }
    setInvalid((v) => ({ ...v, ...bad }));
    return Object.keys(bad).length === 0;
  }

  function next() {
    if (validateStep(step)) setStep((s) => Math.min(TOTAL_STEPS, s + 1));
  }
  function prev() { setStep((s) => Math.max(1, s - 1)); }

  // ─── Photo upload ─────────────────────────────────────
  function onUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.match(/image.*/)) { showToast('Please select an image file', 'error'); return; }
    if (file.size > 5 * 1024 * 1024) { showToast('File size must be less than 5MB', 'error'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => { setPhoto(ev.target.result); setField('photoData', ev.target.result); showToast('Photo uploaded', 'success'); };
    reader.readAsDataURL(file);
  }

  async function openCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      setCameraOpen(true);
      setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = stream; }, 50);
    } catch {
      showToast('Unable to access camera. Please check permissions.', 'error');
    }
  }
  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (cameraOpen) setCameraOpen(false);
  }
  function capture() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    const data = canvas.toDataURL('image/jpeg', 0.8);
    setPhoto(data);
    setField('photoData', data);
    stopCamera();
    showToast('Photo captured', 'success');
  }

  function resetAll() {
    if (!window.confirm('Are you sure you want to start over? All entered data will be lost.')) return;
    setForm(EMPTY); setPhoto(''); setInvalid({}); setStep(1); setDone(null);
    showToast('Form has been reset', 'info');
  }

  // ─── Submit ───────────────────────────────────────────
  async function submit(e) {
    e.preventDefault();
    if (submitting) return;
    if (!validateStep(6)) return;

    setSubmitting(true);
    const body = {
      ...form,
      is_officer: form.is_officer === 'yes' ? 'yes' : 'no',
      photoData: photo,
    };
    try {
      const res = await fetch(`${API_BASE}/reg`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        showToast('Registration submitted successfully!', 'success');
        setDone({ name: data.data?.name || `${form.surname} ${form.othernames}`.trim() });
        setForm(EMPTY); setPhoto(''); setInvalid({}); setStep(1);
      } else {
        showToast(data.message || 'Registration failed. Please try again.', 'error');
      }
    } catch (err) {
      showToast('Connection error. Please check your network and try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  const progress = (step / TOTAL_STEPS) * 100;
  const residenceType = form.campus_residence === 'yes' ? 'On-Campus' : form.campus_residence === 'no' ? 'Off-Campus' : '';
  const residenceValue = form.campus_residence === 'yes' ? form.campus_hall : form.offcampus_location;
  const roomValue = form.campus_residence === 'yes' ? form.room_campus : form.room_offcampus;
  const deptLabels = DEPARTMENTS.flatMap((g) => g.items)
    .filter(([v]) => form.departments.includes(v))
    .map(([, label]) => label);

  if (done) {
    return (
      <main className="reg-page">
        <div className="reg-success">
          <div className="reg-success-icon">✓</div>
          <h2>Registration Successful!</h2>
          <p>Thank you, <strong>{done.name}</strong>!</p>
          <p style={{ color: '#6c757d', margin: '12px 0 24px' }}>
            Your registration has been received and processed successfully. You will receive a confirmation via SMS shortly.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="reg-btn reg-btn-primary" onClick={() => setDone(null)}>Register another</button>
            <Link to="/" className="reg-btn reg-btn-outline">Return to Home</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="reg-page">
      <div className="reg-toasts">
        {toasts.map((t) => (
          <div key={t.id} className={`reg-toast ${t.type}`}>
            <span>{t.message}</span>
            <button className="reg-toast-x" onClick={() => setToasts((x) => x.filter((y) => y.id !== t.id))}>×</button>
          </div>
        ))}
      </div>

      <div className="reg-container">
        <div className="reg-header">
          <div className="reg-logo-container">
            <img src="/images/pensa.jpg" alt="PENSA Logo" />
            <div className="reg-logo-text">
              <h1>PENSA TTU</h1>
              <p>Pentecost Students and Associates</p>
            </div>
          </div>
        </div>

        <div className="reg-progress">
          <div className="reg-steps">
            <div className="reg-progress-fill" style={{ width: `${progress}%` }} />
            {STEP_LABELS.map((label, i) => {
              const n = i + 1;
              const cls = n === step ? 'active' : n < step ? 'completed' : '';
              return (
                <div className="reg-step-wrap" key={label}>
                  <div className={`reg-step-ind ${cls}`}>{n}</div>
                  <div className="reg-step-label">{label}</div>
                </div>
              );
            })}
          </div>
        </div>

        <form className="reg-card" onSubmit={submit}>
          {/* Step 1: Personal */}
          <div className={`reg-step ${step === 1 ? 'active' : ''}`}>
            <h3 className="reg-section-title">👤 Personal Information</h3>
            <div className="reg-row">
              <div className="reg-col-6">
                <label className="reg-label req">SURNAME</label>
                <input className={`reg-input ${invalid.surname ? 'invalid' : ''}`} value={form.surname}
                  onChange={(e) => setField('surname', e.target.value)} required />
              </div>
              <div className="reg-col-6">
                <label className="reg-label req">OTHER NAMES</label>
                <input className={`reg-input ${invalid.othernames ? 'invalid' : ''}`} value={form.othernames}
                  onChange={(e) => setField('othernames', e.target.value)} required />
              </div>
            </div>
            <div className="reg-row">
              <div className="reg-col-4">
                <label className="reg-label req">GENDER</label>
                <div>
                  <label className="reg-check">
                    <input type="radio" name="gender" value="male" checked={form.gender === 'male'}
                      onChange={() => setField('gender', 'male')} /> <span>Male</span>
                  </label>
                  <label className="reg-check">
                    <input type="radio" name="gender" value="female" checked={form.gender === 'female'}
                      onChange={() => setField('gender', 'female')} /> <span>Female</span>
                  </label>
                </div>
              </div>
              <div className="reg-col-4">
                <label className="reg-label req">DATE OF BIRTH</label>
                <input type="date" className={`reg-input ${invalid.dob ? 'invalid' : ''}`} value={form.dob}
                  max={new Date().toISOString().split('T')[0]} onChange={(e) => setField('dob', e.target.value)} required />
              </div>
              <div className="reg-col-4">
                <label className="reg-label req">CONTACT(S)</label>
                <input type="tel" className={`reg-input ${invalid.contact ? 'invalid' : ''}`} value={form.contact}
                  pattern="[0-9]{10}" placeholder="10-digit number"
                  onChange={(e) => setField('contact', e.target.value)} required />
              </div>
            </div>
            <NavButtons onNext={next} nextLabel="Next →" />
          </div>

          {/* Step 2: Residence & Academic */}
          <div className={`reg-step ${step === 2 ? 'active' : ''}`}>
            <h3 className="reg-section-title">🏠 Residence Information</h3>
            <div className="reg-row">
              <div className="reg-col-12">
                <div className="reg-card-box">
                  <label className="reg-label req">CAMPUS RESIDENCE</label>
                  <label className="reg-check">
                    <input type="radio" name="campus_residence" value="yes" checked={form.campus_residence === 'yes'}
                      onChange={() => setField('campus_residence', 'yes')} /> <span>Yes (I live on campus)</span>
                  </label>
                  <label className="reg-check">
                    <input type="radio" name="campus_residence" value="no" checked={form.campus_residence === 'no'}
                      onChange={() => setField('campus_residence', 'no')} /> <span>No (I live off campus)</span>
                  </label>
                </div>
              </div>
            </div>

            {form.campus_residence === 'yes' && (
              <div className="reg-row">
                <div className="reg-col-6">
                  <label className="reg-label req">SELECT CAMPUS HALL</label>
                  <select className={`reg-input ${invalid.campus_hall ? 'invalid' : ''}`} value={form.campus_hall}
                    onChange={(e) => setField('campus_hall', e.target.value)}>
                    <option value="">Select Hall</option>
                    {CAMPU_HALLS.map((h) => <option key={h} value={h}>{h} Hall</option>)}
                  </select>
                </div>
                <div className="reg-col-6">
                  <label className="reg-label req">ROOM NUMBER</label>
                  <input className={`reg-input ${invalid.room_campus ? 'invalid' : ''}`} value={form.room_campus}
                    placeholder="e.g., Block A, Room 101" onChange={(e) => setField('room_campus', e.target.value)} />
                </div>
              </div>
            )}

            {form.campus_residence === 'no' && (
              <>
                <div className="reg-row">
                  <div className="reg-col-6">
                    <label className="reg-label req">HOSTEL/LOCATION NAME</label>
                    <input className={`reg-input ${invalid.offcampus_location ? 'invalid' : ''}`} value={form.offcampus_location}
                      placeholder="e.g., Crystal Hostel, Top Hill" onChange={(e) => setField('offcampus_location', e.target.value)} />
                  </div>
                  <div className="reg-col-6">
                    <label className="reg-label req">ROOM NUMBER</label>
                    <input className={`reg-input ${invalid.room_offcampus ? 'invalid' : ''}`} value={form.room_offcampus}
                      placeholder="e.g., Room 12, Flat 3" onChange={(e) => setField('room_offcampus', e.target.value)} />
                  </div>
                </div>
                <div className="reg-row">
                  <div className="reg-col-12">
                    <label className="reg-label">LANDMARK/ADDRESS (Optional)</label>
                    <input className="reg-input" value={form.landmark}
                      placeholder="e.g., Behind the mall, near police station" onChange={(e) => setField('landmark', e.target.value)} />
                  </div>
                </div>
              </>
            )}

            <h3 className="reg-section-title mt">🎓 Academic Information</h3>
            <div className="reg-row">
              <div className="reg-col-6">
                <label className="reg-label req">PROGRAM OF STUDY</label>
                <input className={`reg-input ${invalid.program ? 'invalid' : ''}`} value={form.program}
                  onChange={(e) => setField('program', e.target.value)} required />
              </div>
              <div className="reg-col-6">
                <label className="reg-label req">EDUCATION LEVEL</label>
                <select className={`reg-input ${invalid.education_level ? 'invalid' : ''}`} value={form.education_level}
                  onChange={(e) => setField('education_level', e.target.value)} required>
                  <option value="">Select Level</option>
                  {EDUCATION_LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </div>
            </div>
            <div className="reg-row">
              <div className="reg-col-6">
                <label className="reg-label req">DURATION OF PROGRAM</label>
                <select className={`reg-input ${invalid.program_duration ? 'invalid' : ''}`} value={form.program_duration}
                  onChange={(e) => setField('program_duration', e.target.value)} required>
                  <option value="">Select Duration</option>
                  {PROGRAM_DURATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <NavButtons onPrev={prev} onNext={next} nextLabel="Next →" />
          </div>

          {/* Step 3: Membership & Departments */}
          <div className={`reg-step ${step === 3 ? 'active' : ''}`}>
            <h3 className="reg-section-title">👥 Membership Type</h3>
            <div className="reg-row">
              <div className="reg-col-12">
                <label className="reg-check">
                  <input type="radio" name="membership" value="member" checked={form.membership === 'member'}
                    onChange={() => setField('membership', 'member')} /> <span>MEMBER</span>
                </label>
                <label className="reg-check">
                  <input type="radio" name="membership" value="associate" checked={form.membership === 'associate'}
                    onChange={() => setField('membership', 'associate')} /> <span>ASSOCIATE</span>
                </label>
              </div>
            </div>

            <h3 className="reg-section-title mt">⛪ Church Leadership</h3>
            <div className="reg-row">
              <div className="reg-col-12">
                <div className="reg-card-box">
                  <label className="reg-check">
                    <input type="checkbox" checked={form.is_officer === 'yes'}
                      onChange={(e) => setField('is_officer', e.target.checked ? 'yes' : 'no')} />
                    <span style={{ fontWeight: 600 }}>Are you an officer of the church?</span>
                  </label>
                  {form.is_officer === 'yes' && (
                    <div style={{ marginTop: 12, marginLeft: 8 }}>
                      <label className="reg-label">Select your role:</label>
                      {OFFICER_ROLES.map((r) => (
                        <label className="reg-check" key={r}>
                          <input type="radio" name="officer_role" value={r} checked={form.officer_role === r}
                            onChange={() => setField('officer_role', r)} /> <span>{r}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <h3 className="reg-section-title mt">🗂 Departments of Interest</h3>
            <div className="reg-dept-group">
              <p className="reg-dept-title">Select department(s) you're interested in:</p>
              <div className="reg-row">
                {DEPARTMENTS.map((group) => (
                  <div className="reg-col-4" key={group.title}>
                    <p style={{ fontWeight: 600, color: 'var(--reg-blue)', marginBottom: 8 }}>{group.title}</p>
                    {group.items.map(([value, label]) => (
                      <label className="reg-check" key={value} style={{ display: 'flex', margin: '6px 0' }}>
                        <input type="checkbox" checked={form.departments.includes(value)}
                          onChange={() => toggleDept(value)} /> <span>{label}</span>
                      </label>
                    ))}
                  </div>
                ))}
              </div>
              <p className="reg-help">ℹ You can select multiple departments</p>
            </div>
            <NavButtons onPrev={prev} onNext={next} nextLabel="Next →" />
          </div>

          {/* Step 4: District & Guardian */}
          <div className={`reg-step ${step === 4 ? 'active' : ''}`}>
            <h3 className="reg-section-title">⛪ District Information</h3>
            <div className="reg-row">
              <div className="reg-col-6">
                <label className="reg-label req">DISTRICT</label>
                <input className={`reg-input ${invalid.district ? 'invalid' : ''}`} value={form.district}
                  onChange={(e) => setField('district', e.target.value)} required />
              </div>
              <div className="reg-col-6">
                <label className="reg-label req">NAME OF DISTRICT PASTOR</label>
                <input className={`reg-input ${invalid.pastor ? 'invalid' : ''}`} value={form.pastor}
                  onChange={(e) => setField('pastor', e.target.value)} required />
              </div>
            </div>
            <h3 className="reg-section-title mt">🛡 Guardian Information</h3>
            <div className="reg-row">
              <div className="reg-col-6">
                <label className="reg-label req">NAME OF GUARDIAN</label>
                <input className={`reg-input ${invalid.guardian ? 'invalid' : ''}`} value={form.guardian}
                  onChange={(e) => setField('guardian', e.target.value)} required />
              </div>
              <div className="reg-col-6">
                <label className="reg-label req">CONTACT OF GUARDIAN</label>
                <input type="tel" className={`reg-input ${invalid.guardian_contact ? 'invalid' : ''}`} value={form.guardian_contact}
                  pattern="[0-9]{10}" placeholder="10-digit number"
                  onChange={(e) => setField('guardian_contact', e.target.value)} required />
              </div>
            </div>
            <NavButtons onPrev={prev} onNext={next} nextLabel="Next →" />
          </div>

          {/* Step 5: Photo */}
          <div className={`reg-step ${step === 5 ? 'active' : ''}`}>
            <h3 className="reg-section-title">📷 Photo Upload/Capture</h3>
            <div className="reg-photo">
              <div className="reg-photo-preview">
                {photo ? <img src={photo} alt="Preview" /> : (
                  <div className="reg-photo-placeholder">
                    <div style={{ fontSize: 42 }}>🖼</div>
                    <p>Photo preview will appear here</p>
                  </div>
                )}
              </div>
              <div className="reg-photo-actions">
                <label className="reg-btn reg-btn-outline">
                  ⬆ Upload Photo
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={onUpload} />
                </label>
                <button type="button" className="reg-btn reg-btn-outline" onClick={openCamera}>📷 Take Photo</button>
              </div>
              {cameraOpen && (
                <div style={{ marginTop: 18 }}>
                  <div className="reg-camera-preview">
                    <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div className="reg-photo-actions">
                    <button type="button" className="reg-btn reg-btn-primary" onClick={capture}>Capture</button>
                    <button type="button" className="reg-btn reg-btn-secondary" onClick={stopCamera}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
            <NavButtons onPrev={prev} onNext={next} nextLabel="Next →" />
          </div>

          {/* Step 6: Review */}
          <div className={`reg-step ${step === 6 ? 'active' : ''}`}>
            <h3 className="reg-section-title">✓ Review Information</h3>

            <div className="reg-review">
              <h4>Personal Information</h4>
              <p><span className="reg-review-label">Name:</span><span className="reg-review-value">{form.surname} {form.othernames}</span></p>
              <p><span className="reg-review-label">Gender:</span><span className="reg-review-value">{form.gender}</span></p>
              <p><span className="reg-review-label">Date of Birth:</span><span className="reg-review-value">{form.dob}</span></p>
              <p><span className="reg-review-label">Contact:</span><span className="reg-review-value">{form.contact}</span></p>
            </div>

            <div className="reg-review">
              <h4>Residence & Academic</h4>
              <p><span className="reg-review-label">Residence Type:</span><span className="reg-review-value">{residenceType}</span></p>
              <p><span className="reg-review-label">Residence/Hall:</span><span className="reg-review-value">{residenceValue || '—'}</span></p>
              <p><span className="reg-review-label">Room Number:</span><span className="reg-review-value">{roomValue || '—'}</span></p>
              <p><span className="reg-review-label">Program of Study:</span><span className="reg-review-value">{form.program}</span></p>
              <p><span className="reg-review-label">Education Level:</span><span className="reg-review-value">{form.education_level ? `Level ${form.education_level}` : ''}</span></p>
              <p><span className="reg-review-label">Program Duration:</span><span className="reg-review-value">{form.program_duration}</span></p>
            </div>

            <div className="reg-review">
              <h4>Membership & Departments</h4>
              <p><span className="reg-review-label">Membership Type:</span><span className="reg-review-value">{form.membership}</span></p>
              <p><span className="reg-review-label">Church Officer:</span><span className="reg-review-value">{form.is_officer === 'yes' ? `Yes${form.officer_role ? ' - ' + form.officer_role : ''}` : 'No'}</span></p>
              <p><span className="reg-review-label">Departments:</span><span className="reg-review-value">{deptLabels.join(', ') || 'None selected'}</span></p>
            </div>

            <div className="reg-review">
              <h4>District & Guardian</h4>
              <p><span className="reg-review-label">District:</span><span className="reg-review-value">{form.district}</span></p>
              <p><span className="reg-review-label">District Pastor:</span><span className="reg-review-value">{form.pastor}</span></p>
              <p><span className="reg-review-label">Guardian Name:</span><span className="reg-review-value">{form.guardian}</span></p>
              <p><span className="reg-review-label">Guardian Contact:</span><span className="reg-review-value">{form.guardian_contact}</span></p>
            </div>

            <div className="reg-review">
              <h4>Photo</h4>
              <div className="reg-review-photo">{photo && <img src={photo} alt="Review" />}</div>
            </div>

            <label className="reg-check" style={{ margin: '16px 0' }}>
              <input type="checkbox" required /> <span>I confirm that all information provided is accurate</span>
            </label>

            <div className="reg-nav">
              <button type="button" className="reg-btn reg-btn-secondary" onClick={prev}>← Previous</button>
              <div className="reg-nav-right">
                <button type="button" className="reg-btn reg-btn-outline" onClick={resetAll}>↺ Start Over</button>
                <button type="submit" className="reg-btn reg-btn-success" disabled={submitting}>
                  {submitting ? 'Submitting...' : '✈ Submit Registration'}
                </button>
              </div>
            </div>
          </div>
        </form>

        <div className="reg-signature">PENSA TTU</div>
      </div>
    </main>
  );
}

function NavButtons({ onPrev, onNext, nextLabel }) {
  return (
    <div className="reg-nav">
      <div />
      {onPrev ? <button type="button" className="reg-btn reg-btn-secondary" onClick={onPrev}>← Previous</button> : <div />}
      <button type="button" className="reg-btn reg-btn-primary" onClick={onNext}>{nextLabel}</button>
    </div>
  );
}
