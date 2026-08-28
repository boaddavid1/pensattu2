import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, getImageUrl } from '../api';

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
          <img src="/images/noticeboard-hero.png" alt="Church notice board" />
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
                <Link to={`/notice-board/${item.id}`} className="news-card" key={item.id || item.title + item.date}>
                  <div className="news-card-img">
                    <img src={getImageUrl(item.image_url) || '/images/pensafallback-bw.png'} alt={item.title} />
                  </div>
                  <div className="news-card-body">
                    <div className="feed-meta">{item.date}</div>
                    <h3>{item.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
