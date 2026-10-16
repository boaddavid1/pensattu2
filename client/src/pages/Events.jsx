import { useState, useEffect, useMemo } from 'react';
import { api, getImageUrl } from '../api.js';

const fallbackPast = [
  { day: '17', month: 'AUG', year: '2026', title: 'Back to School Sunday', img: '/images/pensafallback-bw.png' },
  { day: '10', month: 'AUG', year: '2026', title: 'Worship Night', img: '/images/pensafallback-bw.png' },
  { day: '03', month: 'AUG', year: '2026', title: 'Baptism Sunday', img: '/images/pensafallback-bw.png' },
  { day: '27', month: 'JUL', year: '2026', title: 'Family Picnic', img: '/images/pensafallback-bw.png' },
  { day: '20', month: 'JUL', year: '2026', title: 'Missions Conference', img: '/images/pensafallback-bw.png' },
  { day: '13', month: 'JUL', year: '2026', title: 'Youth Camp Finale', img: '/images/pensafallback-bw.png' },
  { day: '06', month: 'JUL', year: '2026', title: 'Prayer & Fasting', img: '/images/pensafallback-bw.png' },
  { day: '29', month: 'JUN', year: '2026', title: 'Sunday Fellowship', img: '/images/pensafallback-bw.png' },
];

/**
 * Determine event status: 'upcoming' | 'ongoing' | 'past'
 */
function computeStatus(ev) {
  if (ev.status === 'cancelled') return 'cancelled';
  if (!ev.event_date) return ev.status || 'upcoming';

  const now = new Date();
  const nowY = now.getFullYear();
  const nowM = String(now.getMonth() + 1).padStart(2, '0');
  const nowD = String(now.getDate()).padStart(2, '0');
  const todayYMD = `${nowY}-${nowM}-${nowD}`;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const startD = new Date(ev.event_date);
  if (isNaN(startD)) return ev.status || 'upcoming';
  const startYMD = `${startD.getFullYear()}-${String(startD.getMonth() + 1).padStart(2, '0')}-${String(startD.getDate()).padStart(2, '0')}`;

  const endD = ev.event_end_date ? new Date(ev.event_end_date) : startD;
  const endYMD = isNaN(endD)
    ? startYMD
    : `${endD.getFullYear()}-${String(endD.getMonth() + 1).padStart(2, '0')}-${String(endD.getDate()).padStart(2, '0')}`;

  // 1. Strictly in the future
  if (todayYMD < startYMD) return 'upcoming';

  // 2. Strictly in the past
  if (todayYMD > endYMD) return 'past';

  // 3. Today is within event dates!
  // If today is the final day, check if end time has passed
  if (todayYMD === endYMD && ev.event_time) {
    const parts = ev.event_time.split(/\s*[-–]|(?:\s+to\s+)\s*/i);
    if (parts.length >= 2) {
      const match = parts[1].trim().match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
      if (match) {
        let h = parseInt(match[1], 10);
        const m = match[2] ? parseInt(match[2], 10) : 0;
        const mer = match[3]?.toLowerCase();
        if (mer === 'pm' && h < 12) h += 12;
        if (mer === 'am' && h === 12) h = 0;
        const endMinutes = h * 60 + m;
        if (currentMinutes > endMinutes) return 'past';
      }
    }
  }

  // Date of event has arrived -> ONGOING
  return 'ongoing';
}

function parseEvent(ev) {
  const startDate = ev.event_date ? new Date(ev.event_date) : null;
  const endDate = ev.event_end_date ? new Date(ev.event_end_date) : startDate;
  const startDay = startDate ? String(startDate.getDate()).padStart(2, '0') : '';
  const startMonth = startDate ? startDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase() : '';
  const endDay = endDate ? String(endDate.getDate()).padStart(2, '0') : startDay;
  const endMonth = endDate ? endDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase() : startMonth;
  const year = startDate ? String(startDate.getFullYear()) : '';
  const timeParts = (ev.event_time || '').split(/\s*[-–]\s*/);
  const startTime = timeParts[0] || ev.event_time || '';
  const endTime = timeParts[1] || '';
  const status = computeStatus(ev);

  return {
    ...ev,
    status,
    startDay,
    startMonth,
    endDay,
    endMonth,
    year,
    startTime,
    endTime,
    body: ev.description || '',
    img: getImageUrl(ev.image_url) || '/images/pensafallback-bw.png',
  };
}

export default function Events() {
  const [activeEvent, setActiveEvent] = useState(null);
  const [eventsList, setEventsList] = useState([]);
  const [past, setPast] = useState(fallbackPast);
  const [loading, setLoading] = useState(true);

  // Split into ongoing and upcoming
  const ongoingEvents = useMemo(() => eventsList.filter((e) => e.status === 'ongoing'), [eventsList]);
  const upcomingEvents = useMemo(() => eventsList.filter((e) => e.status !== 'ongoing'), [eventsList]);

  const timeline = useMemo(() => {
    const groups = {};
    eventsList.forEach((ev) => {
      if (!ev.event_date) return;
      const start = new Date(ev.event_date);
      const end = ev.event_end_date ? new Date(ev.event_end_date) : start;
      if (isNaN(start) || isNaN(end)) return;

      const dayCount = Math.max(0, Math.round((end - start) / (1000 * 60 * 60 * 24)));
      for (let i = 0; i <= dayCount; i++) {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        const weekday = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
        const day = String(date.getDate()).padStart(2, '0');
        const key = `${label}|${date.getFullYear()}-${date.getMonth()}`;
        groups[key] = groups[key] || { month: label, dates: [] };
        groups[key].dates.push({ weekday, day, isOngoing: ev.status === 'ongoing' });
      }
    });
    return Object.values(groups).sort((a, b) => {
      const [ay, am] = a.month.split(' ').reverse();
      const [by, bm] = b.month.split(' ').reverse();
      return new Date(`${am} 1, ${ay}`) - new Date(`${bm} 1, ${by}`);
    });
  }, [eventsList]);

  useEffect(() => {
    api.get('/events')
      .then((data) => setEventsList((Array.isArray(data) ? data : []).map(parseEvent)))
      .catch(() => setEventsList([]));

    api.get('/events?past=1')
      .then((data) => {
        const items = (Array.isArray(data) ? data : []).map((ev) => {
          const date = ev.event_date ? new Date(ev.event_date) : null;
          return {
            day: date ? String(date.getDate()).padStart(2, '0') : '',
            month: date ? date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase() : '',
            year: date ? String(date.getFullYear()) : '',
            title: ev.title,
            img: getImageUrl(ev.image_url) || '/images/pensafallback-bw.png',
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
          <img src="/images/events-hero.png" alt="Church event crowd" />
        </div>
        <div className="page-hero-inner">
          <span className="eyebrow">Events</span>
          <h1>Gather with us <em>this month</em>.</h1>
          <p>All the regular services, special nights, and outreach moments coming up on the church calendar.</p>
        </div>
      </section>

      {/* ── ONGOING / HAPPENING NOW SECTION (Shown when an event is live today) ── */}
      {ongoingEvents.length > 0 && (
        <section className="ongoing-events-section">
          <div className="wrap">
            <div className="ongoing-header">
              <span className="live-pill">
                <span className="live-pulse-dot" /> LIVE NOW
              </span>
              <h2>Happening <em>Today</em>.</h2>
              <p>These gatherings are currently ongoing. Come and be part of what God is doing right now!</p>
            </div>

            <div className="ongoing-events-grid">
              {ongoingEvents.map((ev) => (
                <article
                  className="upcoming-event-card ongoing-event-card"
                  key={ev.id}
                  onClick={() => setActiveEvent(ev)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') setActiveEvent(ev); }}
                >
                  <div className="upcoming-event-img">
                    <span className="event-card-status-badge ongoing">
                      <span className="live-pulse-dot" /> Ongoing Now
                    </span>
                    <img src={ev.img} alt={ev.title} />
                    <div className="upcoming-event-overlay">
                      <h3>{ev.title}</h3>
                      <span className="upcoming-event-range">{formatRange(ev)}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CALENDAR TIMELINE ── */}
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
                      <div
                        className={`timeline-date-card ${d.isOngoing ? 'ongoing-day' : ''}`}
                        key={group.month + i}
                        style={d.isOngoing ? { border: '2px solid #22c55e', background: '#f0fdf4' } : undefined}
                      >
                        <span className="timeline-weekday">{d.weekday}</span>
                        <span className="timeline-day" style={d.isOngoing ? { color: '#15803d' } : undefined}>
                          {d.day}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── UPCOMING EVENTS SECTION ── */}
      <section className="upcoming-events">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">Upcoming</span>
            <h2>What's <em>coming up</em>.</h2>
          </div>
          {loading ? (
            <p>Loading events...</p>
          ) : upcomingEvents.length === 0 && ongoingEvents.length === 0 ? (
            <p>No upcoming events right now.</p>
          ) : (
            <div className="upcoming-events-grid">
              {upcomingEvents.map((ev) => (
                <article
                  className="upcoming-event-card"
                  key={ev.id}
                  onClick={() => setActiveEvent(ev)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') setActiveEvent(ev); }}
                >
                  <div className="upcoming-event-img">
                    <span className="event-card-status-badge upcoming">
                      Upcoming
                    </span>
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

      {/* ── PAST EVENTS ARCHIVE ── */}
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

      {/* ── EVENT DETAILS MODAL ── */}
      {activeEvent && (
        <div className="event-modal-backdrop" onClick={() => setActiveEvent(null)}>
          <div className="event-modal" onClick={(e) => e.stopPropagation()}>
            <button className="event-modal-close" aria-label="Close" onClick={() => setActiveEvent(null)}>✕</button>
            <div className="event-modal-img">
              <img src={activeEvent.img} alt={activeEvent.title} />
            </div>
            <div className="event-modal-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
                {activeEvent.status === 'ongoing' ? (
                  <span className="event-modal-status-pill ongoing">
                    <span className="live-pulse-dot" /> Ongoing Now
                  </span>
                ) : activeEvent.status === 'past' ? (
                  <span className="event-modal-status-pill past">Past Event</span>
                ) : (
                  <span className="event-modal-status-pill upcoming">Upcoming Event</span>
                )}
                <span className="event-modal-range">{formatRange(activeEvent)}</span>
              </div>
              <h3>{activeEvent.title}</h3>
              <p>{activeEvent.body}</p>
              {activeEvent.location && (
                <div className="event-cal-meta">
                  <span>📍 {activeEvent.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
