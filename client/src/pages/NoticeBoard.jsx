import { useEffect, useState } from 'react';
import { api } from '../api';

export default function NoticeBoard() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/notices')
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="feed-page notice-board-page">
      <section className="page-hero">
        <div className="page-hero-bg">
          <img src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1600&q=80" alt="Church notice board" />
        </div>
        <div className="page-hero-inner">
          <span className="eyebrow">News</span>
          <h1>Practical info <em>you need</em>.</h1>
          <p>Building updates, serving opportunities, parking reminders, and other housekeeping notes for the community.</p>
        </div>
      </section>

      <section className="feed-list">
        <div className="wrap">
          {loading ? (
            <p className="admin-empty" style={{ textAlign: 'center', padding: '40px 0' }}>Loading notices...</p>
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
