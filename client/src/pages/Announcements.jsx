import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Announcements() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/announcements')
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="feed-page announcements-page">
      <section className="page-hero">
        <div className="page-hero-bg">
          <img src="/images/pensafallback-bw.png" alt="Church community gathering" />
        </div>
        <div className="page-hero-inner">
          <span className="eyebrow">Announcements</span>
          <h1>What’s <em>happening</em> at PENSA TTU.</h1>
          <p>Updates, reminders, and the things we want the whole church to know about this week.</p>
        </div>
      </section>

      <section className="feed-list">
        <div className="wrap">
          {loading ? (
            <p className="admin-empty" style={{ textAlign: 'center', padding: '40px 0' }}>Loading announcements...</p>
          ) : (
            <div className="feed-grid">
              {items.map((item) => (
                <article className="feed-card" key={item.title + item.date}>
                  <div className="feed-meta">{item.date}</div>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
