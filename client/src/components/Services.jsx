import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, getImageUrl } from '../api.js';

const fallback = [
  { id: 1, title: 'Worship & Music', description: 'Musicians, singers and sound volunteers shaping every Sunday\'s atmosphere.', image_url: '/images/pensafallback-bw.png' },
  { id: 2, title: 'Outreach & Missions', description: 'Serving neighborhoods across Accra with food, care, and practical help.', image_url: '/images/pensafallback-bw.png' },
  { id: 3, title: 'Counseling & Care', description: 'One-on-one time with our pastoral team, in confidence, whenever it\'s needed.', image_url: '/images/pensafallback-bw.png' },
  { id: 4, title: 'Bible Study Groups', description: 'Weekday gatherings that go deeper into scripture, together.', image_url: '/images/pensafallback-bw.png' },
];

export default function Services() {
  const [departments, setDepartments] = useState(fallback);

  useEffect(() => {
    api.get('/ministries')
      .then((data) => { if (Array.isArray(data) && data.length) setDepartments(data); })
      .catch(() => {});
  }, []);

  return (
    <section className="services" id="services">
      <div className="wrap">
        <div className="services-top">
          <div className="section-head" style={{ marginBottom: 0 }}>
            <span className="eyebrow">Get involved</span>
            <h2>Departments &amp; Teams built around <em>how you are wired</em>.</h2>
          </div>
          <Link to="/departments-and-teams" className="btn btn-ghost">See all departments &amp; teams</Link>
        </div>
        <div className="service-grid">
          {departments.map((m) => (
            <div className="service-card" key={m.id}>
              <div className="img"><img src={getImageUrl(m.image_url)} alt={m.title} /></div>
              <div className="body"><h3>{m.title}</h3><p>{m.description}</p></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
