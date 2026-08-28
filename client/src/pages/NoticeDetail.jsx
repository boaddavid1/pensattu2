import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, getImageUrl } from '../api';

export default function NoticeDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/notices/${id}`)
      .then(setItem)
      .catch(() => setItem(null))
      .finally(() => setLoading(false));
    api.get('/notices')
      .then((data) => setRecent((data || []).filter((n) => String(n.id) !== String(id))))
      .catch(() => setRecent([]));
  }, [id]);

  if (loading) {
    return (
      <main className="notice-newspaper">
        <div className="newspaper-page">
          <p className="admin-empty" style={{ textAlign: 'center', padding: '80px 0' }}>Loading notice...</p>
        </div>
      </main>
    );
  }

  if (!item) {
    return (
      <main className="notice-newspaper">
        <div className="newspaper-page">
          <p className="admin-empty" style={{ textAlign: 'center', padding: '80px 0' }}>Notice not found.</p>
          <Link to="/notice-board" className="btn btn-dark" style={{ margin: '0 auto', display: 'inline-block' }}>Back to News</Link>
        </div>
      </main>
    );
  }

  const heroImg = getImageUrl(item.image_url) || '/images/pensafallback-bw.png';
  const recentImg = (r) => getImageUrl(r.image_url) || '/images/pensafallback-bw.png';

  return (
    <main className="notice-newspaper">
      <div className="newspaper-page">
        <div className="masthead-top">
          <span>PENSA TTU</span>
          <span>NEWS</span>
        </div>

        <h1 className="newspaper-title">{item.title}</h1>

        <Link to="/notice-board" className="newspaper-back">← Back to News</Link>

        <div className="np-layout">
          {/* Main article */}
          <div className="np-main">
            <div className="np-row">
              <div className="np-text-block">
                <p className="np-headline">"{item.title}"</p>
                <div className="np-date">{item.date}</div>
                <p className="np-body-text">
                  {item.excerpt && <em>{item.excerpt} </em>}
                  {item.body}
                </p>
              </div>
              <div className="np-img-block">
                <img src={heroImg} alt={item.title} />
              </div>
            </div>
          </div>

          {/* Recent news sidebar */}
          <aside className="np-sidebar">
            <h3 className="np-sidebar-title">RECENT NEWS</h3>
            <div className="np-sidebar-rule" />
            {recent.map((r) => (
              <Link to={`/notice-board/${r.id}`} className="np-sidebar-item" key={r.id}>
                <div className="np-sidebar-img">
                  <img src={recentImg(r)} alt={r.title} />
                </div>
                <div className="np-sidebar-text">
                  <p className="np-sidebar-headline">{r.title}</p>
                  <div className="np-date">{r.date}</div>
                </div>
              </Link>
            ))}
          </aside>
        </div>
      </div>
    </main>
  );
}
