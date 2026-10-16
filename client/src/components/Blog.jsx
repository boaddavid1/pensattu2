import { useEffect, useState } from 'react';
import { api, getImageUrl } from '../api.js';
import { DEFAULT_HOME_SETTINGS } from '../data/defaultPageSettings';

const fallback = [
  { id: 1, title: 'What it means to belong before you believe', category: 'Sermon', duration: '32 min', image_url: '/images/pensafallback-bw.png' },
  { id: 2, title: 'Why we built community groups around neighborhoods', category: 'Community', duration: '4 min read', image_url: '/images/pensafallback-bw.png' },
  { id: 3, title: 'Inside our latest outreach across Accra', category: 'Outreach', duration: '3 min read', image_url: '/images/pensafallback-bw.png' },
];

export default function Blog() {
  const [sermons, setSermons] = useState(fallback);
  const [eyebrow, setEyebrow] = useState(DEFAULT_HOME_SETTINGS.blog_eyebrow);
  const [title, setTitle] = useState(DEFAULT_HOME_SETTINGS.blog_title);

  useEffect(() => {
    api.get('/sermons')
      .then((data) => { if (Array.isArray(data) && data.length) setSermons(data); })
      .catch(() => {});

    api.get('/home-settings')
      .then((res) => {
        if (res && typeof res === 'object') {
          if (res.blog_eyebrow) setEyebrow(res.blog_eyebrow);
          if (res.blog_title) setTitle(res.blog_title);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="blog" id="blog">
      <div className="wrap">
        <div className="section-head center">
          <span className="eyebrow">{eyebrow}</span>
          <h2>{title}</h2>
        </div>
        <div className="blog-grid">
          {sermons.map((s) => (
            <article className="blog-card" key={s.id}>
              <div className="img"><span className="blog-tag">{s.category}</span><img src={getImageUrl(s.image_url)} alt={s.title} /></div>
              <div className="body">
                <div className="blog-meta">{s.category === 'Sermon' ? 'Message' : s.category} · {s.duration}</div>
                <h3>{s.title}</h3>
                <a className="blog-link">{s.category === 'Sermon' ? 'Watch now' : 'Read more'} →</a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
