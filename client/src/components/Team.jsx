import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api, getImageUrl } from '../api.js';
import { DEFAULT_HOME_SETTINGS } from '../data/defaultPageSettings';

const fallback = [
  { id: 1, name: 'Pastor Mark Johnson', role: 'Senior Pastor', image_url: '/images/pensafallback-bw.png' },
  { id: 2, name: 'Pastor Helen Owusu', role: 'Worship Pastor', image_url: '/images/pensafallback-bw.png' },
  { id: 3, name: 'Pastor Alex Mensah', role: 'Youth Pastor', image_url: '/images/pensafallback-bw.png' },
  { id: 4, name: 'Elder Kwame Asante', role: 'Executive Pastor', image_url: '/images/pensafallback-bw.png' },
];

function getHomeTeam(data) {
  if (!Array.isArray(data) || !data.length) return fallback;

  const isSenior = (cat) => {
    if (!cat) return false;
    const c = String(cat).toLowerCase().trim();
    return c === 'pastor' || c === 'patroness' || c === 'patron' || c.includes('pastor') || c.includes('patron');
  };

  const senior = data.filter((p) => isSenior(p.category));
  const rest = data.filter((p) => !isSenior(p.category));

  const years = [...new Set(rest.map((p) => p.academic_year).filter(Boolean))].sort().reverse();
  const currentYear = years[0];
  const currentYearMembers = currentYear ? rest.filter((p) => p.academic_year === currentYear) : rest;

  const combined = [...senior, ...currentYearMembers];
  return combined.length > 0 ? combined.slice(0, 4) : data.slice(0, 4);
}

export default function Team() {
  const [team, setTeam] = useState(fallback);
  const [rawTeam, setRawTeam] = useState([]);
  const [eyebrow, setEyebrow] = useState(DEFAULT_HOME_SETTINGS.leadership_eyebrow);
  const [title, setTitle] = useState(DEFAULT_HOME_SETTINGS.leadership_title);

  useEffect(() => {
    api.get('/team')
      .then((data) => {
        if (Array.isArray(data) && data.length) {
          setRawTeam(data);
          setTeam(getHomeTeam(data));
        }
      })
      .catch(() => {});

    api.get('/home-settings')
      .then((res) => {
        if (res && typeof res === 'object') {
          if (res.leadership_eyebrow) setEyebrow(res.leadership_eyebrow);
          if (res.leadership_title) setTitle(res.leadership_title);
        }
      })
      .catch(() => {});
  }, []);

  const showViewAll = useMemo(() => rawTeam.length > 4, [rawTeam]);

  return (
    <section className="team" id="team">
      <div className="wrap">
        <div className="section-head center">
          <span className="eyebrow">{eyebrow}</span>
          <h2>{title}</h2>
        </div>
        <div className="team-grid">
          {team.slice(0, 4).map((p) => (
            <div className="team-card" key={p.id}>
              <img
                src={getImageUrl(p.image_url) || '/images/pensafallback-bw.png'}
                alt={p.name}
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/images/pensafallback-bw.png';
                }}
              />
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
