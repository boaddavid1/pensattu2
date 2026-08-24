import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function Feature() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    api.get('/events')
      .then((data) => {
        if (Array.isArray(data) && data.length) setEvents(data.slice(0, 3));
      })
      .catch(() => {});
  }, []);

  const fmtDay = (dateStr) => new Date(dateStr).getDate();
  const fmtDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });

  return (
    <section className="feature" id="work">
      <div className="wrap feature-grid">
        <div className="feature-media">
          <img src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=700&q=80" alt="Church event crowd" />
        </div>
        <div>
          <span className="eyebrow">Upcoming Events</span>
          <h2>What&apos;s happening <span style={{ color: 'var(--moss)' }}>next</span>.</h2>
          <div className="feature-list">
            {events.map((e) => (
              <div className="feature-row" key={e.id}>
                <div className="ic">{fmtDay(e.event_date)}</div>
                <div>
                  <h4>{e.title}</h4>
                  <p>
                    {fmtDate(e.event_date)} · {e.event_time} · {e.location}
                  </p>
                  <p>{e.description}</p>
                </div>
              </div>
            ))}
          </div>
          <a href="/events" className="btn btn-dark">
            View all events <span className="btn-arrow" style={{ background: 'var(--moss)', color: 'var(--pine-deep)' }}>→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
