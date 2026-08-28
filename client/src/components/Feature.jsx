import { useEffect, useState } from 'react';
import { api, getImageUrl } from '../api.js';

const FALLBACK_IMAGE = '/images/pensafallback-bw.png';

export default function Feature() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    api.get('/events')
      .then((data) => {
        if (Array.isArray(data)) setEvents(data);
      })
      .catch(() => {});
  }, []);

  const featured = events.slice(0, 2);
  const remaining = events.length - featured.length;
  const featureImage = events.find((e) => e.image_url)?.image_url;
  const imgSrc = featureImage ? getImageUrl(featureImage) : FALLBACK_IMAGE;

  const fmtDay = (dateStr) => new Date(dateStr).getDate();
  const fmtDate = (start, end) => {
    const s = new Date(start);
    const e = end ? new Date(end) : s;
    const sameMonth = s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear();
    const monthYear = s.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    if (sameMonth) return `${s.getDate()} – ${e.getDate()} ${monthYear}`;
    const startStr = s.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const endStr = e.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${startStr} – ${endStr}`;
  };

  return (
    <section className="feature" id="work">
      <div className="wrap feature-grid">
        <div className="feature-media">
          <img src={imgSrc} alt={events[0]?.title || 'Upcoming event'} />
        </div>
        <div>
          <span className="eyebrow">Upcoming Events</span>
          <h2>What&apos;s happening <span style={{ color: 'var(--moss)' }}>next</span>.</h2>
          <div className="feature-list">
            {featured.map((e) => (
              <div className="feature-row" key={e.id}>
                <div className="ic">{fmtDay(e.event_date)}</div>
                <div>
                  <h4>{e.title}</h4>
                  <p>
                    {fmtDate(e.event_date, e.event_end_date)} · {e.event_time} · {e.location}
                  </p>
                  <p>{e.description}</p>
                </div>
              </div>
            ))}
            {remaining > 0 && (
              <a href="/events" className="feature-row feature-more" key="more">
                <div className="ic">+{remaining}</div>
                <div>
                  <h4>More upcoming events</h4>
                  <p>{remaining} more {remaining === 1 ? 'event' : 'events'} on the calendar — see the full schedule.</p>
                </div>
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
