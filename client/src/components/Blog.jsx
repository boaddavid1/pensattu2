import { useEffect, useState } from 'react';
import { api, getImageUrl } from '../api.js';

const fallback = [
  { id: 1, title: 'What it means to belong before you believe', category: 'Sermon', duration: '32 min', image_url: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=500&q=80' },
  { id: 2, title: 'Why we built community groups around neighborhoods', category: 'Community', duration: '4 min read', image_url: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=500&q=80' },
  { id: 3, title: 'Inside our latest outreach across Accra', category: 'Outreach', duration: '3 min read', image_url: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=500&q=80' },
];

export default function Blog() {
  const [sermons, setSermons] = useState(fallback);

  useEffect(() => {
    api.get('/sermons')
      .then((data) => { if (Array.isArray(data) && data.length) setSermons(data); })
      .catch(() => {});
  }, []);

  return (
    <section className="blog" id="blog">
      <div className="wrap">
        <div className="section-head center">
          <span className="eyebrow">From the pulpit</span>
          <h2>Messages & reflections from <em>our community</em>.</h2>
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
