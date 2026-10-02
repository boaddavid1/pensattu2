// ViewMember.jsx — View a single member's details (ported from view_user.php)
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { secApi } from '../api/secApi.js';

export default function ViewMember() {
  const { id } = useParams();
  const [member, setMember] = useState(null);
  const [error, setError] = useState('');
  const [showTopup, setShowTopup] = useState(false);
  const [topupProgram, setTopupProgram] = useState('');
  const [topupSaving, setTopupSaving] = useState(false);
  const [topupMsg, setTopupMsg] = useState('');

  const loadMember = () => {
    secApi.getMember(id).then(data => setMember(data.member)).catch(err => setError(err.message));
  };

  useEffect(() => {
    loadMember();
  }, [id]);

  const openTopup = () => {
    const orig = member?.program || '';
    let autoProg = orig;
    if (/diploma/i.test(orig)) {
      autoProg = orig.replace(/diploma\s*(in)?/i, 'BTECH ').trim();
    } else if (orig && !/btech/i.test(orig)) {
      autoProg = `BTECH ${orig}`;
    } else if (!orig) {
      autoProg = 'BTECH';
    }
    setTopupProgram(autoProg);
    setShowTopup(true);
  };

  const handleTopup = async () => {
    setTopupSaving(true);
    try {
      await secApi.topupBTech(id, { program: topupProgram, level: '200' });
      setTopupMsg('Successfully transitioned to BTech Top-up (Level 200)!');
      setTimeout(() => setTopupMsg(''), 5000);
      setShowTopup(false);
      loadMember();
    } catch (err) {
      setError(err.message);
    } finally {
      setTopupSaving(false);
    }
  };

  if (error) return <div className="error-msg">{error}</div>;
  if (!member) return <div className="loading">Loading...</div>;

  const fields = [
    ['Surname', member.surname], ['Other Names', member.othernames],
    ['Gender', member.gender], ['Date of Birth', member.dob ? new Date(member.dob).toLocaleDateString() : '-'],
    ['Contact', member.contact], ['Residence', member.residence],
    ['Room', member.room], ['Program', member.program],
    ['Program Duration', member.program_duration], ['Education Level', member.education_level],
    ['Membership Type', member.membership_type], ['Campus Residence', member.campus_residence],
    ['Campus Hall', member.campus_hall], ['Off-Campus Location', member.offcampus_location],
    ['Landmark', member.landmark], ['Is Officer', member.is_officer == 1 ? 'Yes' : 'No'],
    ['Officer Role', member.officer_role], ['District', member.district],
    ['Pastor', member.pastor], ['Guardian', member.guardian],
    ['Guardian Contact', member.guardian_contact], ['Departments', member.departments],
    ['Registered', new Date(member.created_at).toLocaleString()],
  ];

  return (
    <>
      <div className="head-title">
        <div className="left">
          <h1>{member.surname} {member.othernames}</h1>
          <ul className="breadcrumb">
            <li><Link className="active" to="/members">Members</Link></li>
            <li><i className='bx bx-chevron-right'></i></li>
            <li><a>{member.surname} {member.othernames}</a></li>
          </ul>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {((member.program_duration || '').toLowerCase().includes('diploma') || member.education_level === '200') && (
            <button
              type="button"
              onClick={openTopup}
              className="btn-download"
              style={{ background: '#2980b9', color: '#fff', border: 'none', cursor: 'pointer' }}
            >
              <i className='bx bx-transfer'></i> BTech Top-up
            </button>
          )}
          <Link to={`/members/${id}/edit`} className="btn-download">
            <i className='bx bxs-edit'></i> Edit Member
          </Link>
        </div>
      </div>

      {topupMsg && (
        <div style={{ background: '#d4f5dd', color: '#1e8449', border: '1px solid #a9dfbf', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
          <i className='bx bx-check-circle' style={{ fontSize: 18 }}></i> {topupMsg}
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', marginBottom: 24 }}>
          {member.profile_image ? (
            <img src={member.profile_image} alt="Profile" style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'var(--grey)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, color: 'var(--dark-grey)' }}>
              <i className='bx bxs-user'></i>
            </div>
          )}
          <div>
            <h3 style={{ fontSize: 28 }}>{member.surname} {member.othernames}</h3>
            <p style={{ color: 'var(--dark-grey)', marginTop: 8 }}>
              <span className={`badge ${member.membership_type === 'member' ? 'badge-blue' : 'badge-orange'}`}>{member.membership_type}</span>
              {member.is_officer == 1 && <span className="badge badge-yellow" style={{ marginLeft: 8 }}>Officer: {member.officer_role || 'Yes'}</span>}
              {member.graduated == 1 && <span className="badge badge-green" style={{ marginLeft: 8 }}>Graduated</span>}
            </p>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {fields.map(([label, value]) => (
              <tr key={label}>
                <td style={{ padding: '10px 0', fontWeight: 600, width: '40%', borderBottom: '1px solid var(--grey)' }}>{label}</td>
                <td style={{ padding: '10px 0', borderBottom: '1px solid var(--grey)' }}>{value || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* BTech Top-up Modal */}
      {showTopup && (
        <div className="modal-overlay" style={{ zIndex: 1100 }} onClick={() => !topupSaving && setShowTopup(false)}>
          <div className="modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, color: 'var(--dark)' }}>
                <i className='bx bx-transfer' style={{ color: '#2980b9', marginRight: 8 }}></i>
                Diploma &rarr; BTech Top-up
              </h2>
              {!topupSaving && (
                <button
                  type="button"
                  onClick={() => setShowTopup(false)}
                  style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--dark-grey)' }}
                >
                  <i className='bx bx-x'></i>
                </button>
              )}
            </div>

            <div style={{ background: '#ebf5fb', border: '1px solid #bce1f8', borderRadius: 8, padding: '12px 14px', marginBottom: 16, fontSize: 13, lineHeight: 1.5 }}>
              <p style={{ margin: '0 0 6px', color: '#1b4f72' }}>
                Transition <strong>{member.surname} {member.othernames}</strong> to <strong>BTech Top-up</strong>.
              </p>
              <p style={{ margin: 0, color: '#2980b9' }}>
                The program duration will change to <strong>B-TECH</strong> and the member will continue from <strong>Level 200</strong>.
              </p>
            </div>

            <div className="form-group" style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                Current Program
              </label>
              <input
                type="text"
                disabled
                value={`${member.program || '-'} (${member.program_duration || 'Diploma'})`}
                style={{ width: '100%', padding: '8px 12px', background: '#f5f5f5', borderRadius: 6, border: '1px solid var(--grey)' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                New BTech Program Name *
              </label>
              <input
                type="text"
                value={topupProgram}
                onChange={e => setTopupProgram(e.target.value)}
                placeholder="e.g. BTECH Electrical Engineering"
                style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--grey)', fontSize: 13 }}
                required
              />
              <span style={{ fontSize: 11, color: 'var(--dark-grey)', marginTop: 4, display: 'block' }}>
                The program duration will change to <strong>B-TECH</strong>.
              </span>
            </div>

            <div className="form-group" style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                Continuing Academic Level
              </label>
              <input
                type="text"
                disabled
                value="Level 200 (Continues into BTech)"
                style={{ width: '100%', padding: '8px 12px', background: '#f5f5f5', borderRadius: 6, border: '1px solid var(--grey)' }}
              />
            </div>

            <div className="modal-actions" style={{ marginTop: 0 }}>
              <button
                type="button"
                className="btn btn-back"
                onClick={() => setShowTopup(false)}
                disabled={topupSaving}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleTopup}
                disabled={topupSaving || !topupProgram.trim()}
                style={{ background: '#2980b9', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                {topupSaving ? (
                  <>
                    <i className='bx bx-loader-alt bx-spin'></i> Transitioning...
                  </>
                ) : (
                  <>
                    <i className='bx bx-check'></i> Confirm BTech Top-up
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
