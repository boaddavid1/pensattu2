import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, getImageUrl } from '../api.js';
import { DEFAULT_HOME_SETTINGS } from '../data/defaultPageSettings';

const fallback = [
  { id: 1, title: 'Worship & Music', description: 'Musicians, singers and sound volunteers shaping every Sunday\'s atmosphere.', image_url: '/images/pensafallback-bw.png' },
  { id: 2, title: 'Outreach & Missions', description: 'Serving neighborhoods across Accra with food, care, and practical help.', image_url: '/images/pensafallback-bw.png' },
  { id: 3, title: 'Counseling & Care', description: 'One-on-one time with our pastoral team, in confidence, whenever it\'s needed.', image_url: '/images/pensafallback-bw.png' },
  { id: 4, title: 'Bible Study Groups', description: 'Weekday gatherings that go deeper into scripture, together.', image_url: '/images/pensafallback-bw.png' },
];

export default function Services() {
  const [departments, setDepartments] = useState(fallback);
  const [eyebrow, setEyebrow] = useState(DEFAULT_HOME_SETTINGS.ministries_eyebrow);
  const [title, setTitle] = useState(DEFAULT_HOME_SETTINGS.ministries_title);
  const [btnText, setBtnText] = useState(DEFAULT_HOME_SETTINGS.ministries_btn_text);
  const [btnLink, setBtnLink] = useState(DEFAULT_HOME_SETTINGS.ministries_btn_link);

  useEffect(() => {
    api.get('/ministries')
      .then((data) => { if (Array.isArray(data) && data.length) setDepartments(data); })
      .catch(() => {});

    api.get('/home-settings')
      .then((res) => {
        if (res && typeof res === 'object') {
          if (res.ministries_eyebrow) setEyebrow(res.ministries_eyebrow);
          if (res.ministries_title) setTitle(res.ministries_title);
          if (res.ministries_btn_text) setBtnText(res.ministries_btn_text);
          if (res.ministries_btn_link) setBtnLink(res.ministries_btn_link);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="services" id="services">
      <div className="wrap">
        <div className="services-top">
          <div className="section-head" style={{ marginBottom: 0 }}>
            <span className="eyebrow">{eyebrow}</span>
            <h2>{title}</h2>
          </div>
          <Link to={btnLink} className="btn btn-ghost">{btnText}</Link>
        </div>
        <div className="service-grid">
          {departments.map((m) => (
            <Link to="/ministries" className="service-card" key={m.id} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
              <div className="img"><img src={getImageUrl(m.image_url)} alt={m.title} /></div>
              <div className="body">
                <h3>{m.title}</h3>
                <p>{m.description}</p>
                <span style={{ display: 'inline-block', marginTop: '10px', fontSize: '13px', fontWeight: '600', color: 'var(--moss-deep)' }}>
                  Explore ministry &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
