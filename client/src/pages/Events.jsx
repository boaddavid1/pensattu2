import { useState, useEffect, useMemo } from 'react';
import { api, getImageUrl } from '../api.js';

const fallbackPast = [
  { day: '17', month: 'AUG', year: '2026', title: 'Back to School Sunday', img: 'https://images.unsplash.com/photo-1503676267431-0d268eb132b9?w=600&q=80' },
  { day: '10', month: 'AUG', year: '2026', title: 'Worship Night', img: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80' },
  { day: '03', month: 'AUG', year: '2026', title: 'Baptism Sunday', img: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=600&q=80' },
  { day: '27', month: 'JUL', year: '2026', title: 'Family Picnic', img: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&q=80' },
  { day: '20', month: 'JUL', year: '2026', title: 'Missions Conference', img: 'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=600&q=80' },
  { day: '13', month: 'JUL', year: '2026', title: 'Youth Camp Finale', img: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=600&q=80' },
  { day: '06', month: 'JUL', year: '2026', title: 'Prayer & Fasting', img: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=600&q=80' },
  { day: '29', month: 'JUN', year: '2026', title: 'Sunday Fellowship', img: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&q=80' },
];

function parseEvent(ev) {
  const date = ev.event_date ? new Date(ev.event_date) : null;
  const startDay = date ? String(date.getDate()).padStart(2, '0') : '';
  const startMonth = date ? date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase() : '';
  const year = date ? String(date.getFullYear()) : '';
  const timeParts = (ev.event_time || '').split(/\s*[-–]\s*/);
  const startTime = timeParts[0] || ev.event_time || '';
  const endTime = timeParts[1] || '';
  return {
    ...ev,
    startDay,
    startMonth,
    endDay: startDay,
    endMonth: startMonth,
    year,
    startTime,
    endTime,
    body: ev.description || '',
    img: getImageUrl(ev.image_url) || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=900&q=80',
  };
}

export default function Events() {
  const [activeEvent, setActiveEvent] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [past, setPast] = useState(fallbackPast);
  const [loading, setLoading] = useState(true);

  const timeline = useMemo(() => {
    const groups = {};
    upcoming.forEach((ev) => {
      if (!ev.event_date) return;
      const date = new Date(ev.event_date);
      if (isNaN(date)) return;
      const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      const weekday = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
      const day = String(date.getDate()).padStart(2, '0');
      const key = `${label}|${date.getFullYear()}-${date.getMonth()}`;
      groups[key] = groups[key] || { month: label, dates: [] };
      groups[key].dates.push({ weekday, day });
    });
    return Object.values(groups).sort((a, b) => {
      const [ay, am] = a.month.split(' ').reverse();
      const [by, bm] = b.month.split(' ').reverse();
      return new Date(`${am} 1, ${ay}`) - new Date(`${bm} 1, ${by}`);
    });
  }, [upcoming]);

  useEffect(() => {
    api.get('/events')
      .then((data) => setUpcoming((Array.isArray(data) ? data : []).map(parseEvent)))
      .catch(() => setUpcoming([]));

    api.get('/events?past=1')
      .then((data) => {
        const items = (Array.isArray(data) ? data : []).map((ev) => {
          const date = ev.event_date ? new Date(ev.event_date) : null;
          return {
            day: date ? String(date.getDate()).padStart(2, '0') : '',
            month: date ? date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase() : '',
            year: date ? String(date.getFullYear()) : '',
            title: ev.title,
            img: getImageUrl(ev.image_url) || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80',
          };
        });
        if (items.length) setPast(items);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const formatRange = (ev) => {
    const sameDay = ev.startDay === ev.endDay && ev.startMonth === ev.endMonth;
    const dateStr = sameDay
      ? `${ev.startMonth} ${ev.startDay}, ${ev.year}`
      : `${ev.startMonth} ${ev.startDay} – ${ev.endMonth} ${ev.endDay}, ${ev.year}`;
    return `${dateStr} · ${ev.startTime}${ev.endTime ? ` – ${ev.endTime}` : ''}`;
  };

  return (
    <main className="feed-page events-page">
      <section className="page-hero">
        <div className="page-hero-bg">
          <img src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1600&q=80" alt="Church event crowd" />
        </div>
        <div className="page-hero-inner">
          <span className="eyebrow">Events</span>
          <h1>Gather with us <em>this month</em>.</h1>
          <p>All the regular services, special nights, and outreach moments coming up on the church calendar.</p>
        </div>
      </section>

      <section className="timeline-section">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">Calendar</span>
            <h2>The <em>timeline</em>.</h2>
            <p>Showing only dates with scheduled events.</p>
          </div>

          {timeline.length === 0 ? (
            <p>No scheduled events yet.</p>
          ) : (
            <div className="timeline-track">
              {timeline.map((group) => (
                <div className="timeline-group" key={group.month}>
                  <div className="timeline-month">
                    <span className="timeline-line" />
                    <span className="timeline-month-label">{group.month}</span>
                    <span className="timeline-line" />
                  </div>
                  <div className="timeline-dates">
                    {group.dates.map((d, i) => (
                      <div className="timeline-date-card" key={group.month + i}>
                        <span className="timeline-weekday">{d.weekday}</span>
                        <span className="timeline-day">{d.day}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="upcoming-events">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">Upcoming</span>
            <h2>What's <em>coming up</em>.</h2>
          </div>
          {loading ? (
            <p>Loading events...</p>
          ) : upcoming.length === 0 ? (
            <p>No upcoming events right now.</p>
          ) : (
            <div className="upcoming-events-grid">
              {upcoming.map((ev) => (
                <article
                  className="upcoming-event-card"
                  key={ev.id}
                  onClick={() => setActiveEvent(ev)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') setActiveEvent(ev); }}
                >
                  <div className="upcoming-event-img">
                    <img src={ev.img} alt={ev.title} />
                    <div className="upcoming-event-overlay">
                      <h3>{ev.title}</h3>
                      <span className="upcoming-event-range">{formatRange(ev)}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="past-events">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">Archive</span>
            <h2>Past <em>events</em>.</h2>
          </div>
          <div className="past-events-grid">
            {past.map((ev) => (
              <article className="past-event-card" key={ev.title + ev.day + ev.month}>
                <div className="past-event-img">
                  <img src={ev.img} alt={ev.title} />
                </div>
                <div className="past-event-info">
                  <span className="past-event-date">{ev.month} {ev.day}, {ev.year}</span>
                  <h3>{ev.title}</h3>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {activeEvent && (
        <div className="event-modal-backdrop" onClick={() => setActiveEvent(null)}>
          <div className="event-modal" onClick={(e) => e.stopPropagation()}>
            <button className="event-modal-close" aria-label="Close" onClick={() => setActiveEvent(null)}>✕</button>
            <div className="event-modal-img">
              <img src={activeEvent.img} alt={activeEvent.title} />
            </div>
            <div className="event-modal-body">
              <span className="event-modal-range">{formatRange(activeEvent)}</span>
              <h3>{activeEvent.title}</h3>
              <p>{activeEvent.body}</p>
              <div className="event-cal-meta">
                <span>📍 {activeEvent.location}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
