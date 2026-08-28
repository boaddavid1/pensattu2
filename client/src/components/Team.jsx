import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api, getImageUrl } from '../api.js';

const fallback = [
  { id: 1, name: 'Pastor Mark Johnson', role: 'Senior Pastor', image_url: '/images/pensafallback-bw.png' },
  { id: 2, name: 'Pastor Helen Owusu', role: 'Worship Pastor', image_url: '/images/pensafallback-bw.png' },
  { id: 3, name: 'Pastor Alex Mensah', role: 'Youth Pastor', image_url: '/images/pensafallback-bw.png' },
  { id: 4, name: 'Elder Kwame Asante', role: 'Executive Pastor', image_url: '/images/pensafallback-bw.png' },
];

function getHomeTeam(data) {
  if (!Array.isArray(data) || !data.length) return fallback;

  const senior = data.filter((p) => ['pastor', 'patroness'].includes(p.category));
  const rest = data.filter((p) => !['pastor', 'patroness'].includes(p.category));

  const years = [...new Set(rest.map((p) => p.academic_year).filter(Boolean))].sort().reverse();
  const currentYear = years[0];
  const currentYearMembers = currentYear ? rest.filter((p) => p.academic_year === currentYear) : [];

  return [...senior, ...currentYearMembers].slice(0, 4);
}

export default function Team() {
  const [team, setTeam] = useState(fallback);
  const [rawTeam, setRawTeam] = useState([]);

  useEffect(() => {
    api.get('/team')
      .then((data) => {
        if (Array.isArray(data) && data.length) {
          setRawTeam(data);
          setTeam(getHomeTeam(data));
        }
      })
      .catch(() => {});
  }, []);

  const showViewAll = useMemo(() => rawTeam.length > 4, [rawTeam]);

  return (
    <section className="team" id="team">
      <div className="wrap">
        <div className="section-head center">
          <span className="eyebrow">Our leadership</span>
          <h2>Leading with <span style={{ color: 'var(--moss)' }}>Vision, Integrity, and Purpose</span></h2>
        </div>
        <div className="team-grid">
          {team.slice(0, 4).map((p) => (
            <div className="team-card" key={p.id}>
              <img src={getImageUrl(p.image_url)} alt={p.name} />
              <div className="team-info">
                <div><h3>{p.name}</h3><span>{p.role}</span></div>
              </div>
            </div>
          ))}
        </div>
        {showViewAll && (
          <div className="view-all-container">
            <Link to="/leadership" className="btn btn-primary">
              View All Leadership <span className="btn-arrow">→</span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
