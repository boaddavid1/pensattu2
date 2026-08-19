import { useEffect, useState } from 'react';

const fallback = [
  { id: 1, name: 'Pastor Mark Johnson', role: 'Senior Pastor', image_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&q=80' },
  { id: 2, name: 'Pastor Helen Owusu', role: 'Worship Pastor', image_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=500&q=80' },
  { id: 3, name: 'Pastor Alex Mensah', role: 'Youth Pastor', image_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&q=80' },
  { id: 4, name: 'Elder Kwame Asante', role: 'Executive Pastor', image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=80' },
];

export default function Team() {
  const [team, setTeam] = useState(fallback);

  useEffect(() => {
    fetch('/api/team')
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((data) => { if (Array.isArray(data) && data.length) setTeam(data); })
      .catch(() => {});
  }, []);

  return (
    <section className="team" id="team">
      <div className="wrap">
        <div className="section-head center">
          <span className="eyebrow">Our leadership</span>
          <h2>Leading with <span style={{ color: 'var(--moss)' }}>Vision, Integrity, and Purpose</span></h2>
        </div>
        <div className="team-grid">
          {team.map((p) => (
            <div className="team-card" key={p.id}>
              <img src={p.image_url} alt={p.name} />
              <div className="team-info">
                <div><h3>{p.name}</h3><span>{p.role}</span></div>
                <div className="team-social">in</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
