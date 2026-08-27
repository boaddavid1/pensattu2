// ViewMember.jsx — View a single member's details (ported from view_user.php)
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { secApi } from '../api/secApi.js';

export default function ViewMember() {
  const { id } = useParams();
  const [member, setMember] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    secApi.getMember(id).then(data => setMember(data.member)).catch(err => setError(err.message));
  }, [id]);

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
            <li><a className="active" href="/members">Members</a></li>
            <li><i className='bx bx-chevron-right'></i></li>
            <li><a>{member.surname} {member.othernames}</a></li>
          </ul>
        </div>
        <Link to={`/members/${id}/edit`} className="btn-download">
          <i className='bx bxs-edit'></i> Edit Member
        </Link>
      </div>

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
    </>
  );
}
