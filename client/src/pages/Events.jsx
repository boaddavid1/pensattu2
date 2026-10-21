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

function parseTimeMinutes(str, defaultMeridiem = null) {
  if (!str) return null;
  const match = str.trim().match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  let meridiem = match[3] ? match[3].toLowerCase() : defaultMeridiem;
  if (meridiem === 'pm' && hours < 12) hours += 12;
  if (meridiem === 'am' && hours === 12) hours = 0;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}

function parseEventTimeRange(timeStr) {
  if (!timeStr) return { startMinutes: null, endMinutes: null };
  const parts = String(timeStr).split(/\s*(?:[-–—]|(?:\s+to\s+))\s*/i);
  if (parts.length >= 2) {
    const endMatch = parts[1].trim().match(/(am|pm)/i);
    const endMeridiem = endMatch ? endMatch[1].toLowerCase() : null;
    const startMatch = parts[0].trim().match(/(am|pm)/i);
    const startMeridiemDefault = !startMatch && endMeridiem ? endMeridiem : null;

    let startMinutes = parseTimeMinutes(parts[0], startMeridiemDefault);
    let endMinutes = parseTimeMinutes(parts[1]);

    if (startMinutes !== null && endMinutes !== null && !startMatch && startMinutes > endMinutes && endMeridiem === 'pm') {
      startMinutes = parseTimeMinutes(parts[0], 'am');
    }
    if (endMinutes === null && startMinutes !== null) {
      endMinutes = Math.min(startMinutes + 120, 23 * 60 + 59);
    }
    return { startMinutes, endMinutes };
  } else {
    const startMinutes = parseTimeMinutes(parts[0]);
    if (startMinutes !== null) {
      const endMinutes = Math.min(startMinutes + 120, 23 * 60 + 59);
      return { startMinutes, endMinutes };
    }
  }
  return { startMinutes: null, endMinutes: null };
}

/**
 * Determine event status dynamically based on current moment:
 * - Before start time: 'upcoming'
 * - At start time (e.g. 6:00 PM): 'ongoing'
 * - As soon as end time passes: 'past'
 */
function computeStatus(ev, now = new Date()) {
  if (!ev) return 'upcoming';
  if (ev.status === 'cancelled') return 'cancelled';
  if (!ev.event_date) return ev.status || 'upcoming';

  const startD = new Date(ev.event_date);
  if (isNaN(startD)) return ev.status || 'upcoming';

  const nowY = now.getFullYear();
  const nowM = String(now.getMonth() + 1).padStart(2, '0');
  const nowD = String(now.getDate()).padStart(2, '0');
  const todayYMD = `${nowY}-${nowM}-${nowD}`;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

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
  const { startMinutes, endMinutes } = parseEventTimeRange(ev.event_time);

  // If today is the start date and start time hasn't arrived -> upcoming
  if (todayYMD === startYMD && startMinutes !== null && currentMinutes < startMinutes) {
    return 'upcoming';
  }

  // If today is the end date and end time has passed -> past
  if (todayYMD === endYMD && endMinutes !== null && currentMinutes >= endMinutes) {
    return 'past';
  }

  // Live moment: start time has arrived and end time hasn't passed -> ONGOING
  return 'ongoing';
}

function parseEvent(ev, now = new Date()) {
  const startDate = ev.event_date ? new Date(ev.event_date) : null;
  const endDate = ev.event_end_date ? new Date(ev.event_end_date) : startDate;
  const startDay = startDate ? String(startDate.getDate()).padStart(2, '0') : '';
  const startMonth = startDate ? startDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase() : '';
  const endDay = endDate ? String(endDate.getDate()).padStart(2, '0') : startDay;
  const endMonth = endDate ? endDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase() : startMonth;
  const year = startDate ? String(startDate.getFullYear()) : '';
  const timeParts = (ev.event_time || '').split(/\s*[-–—]\s*/);
  const startTime = timeParts[0] || ev.event_time || '';
  const endTime = timeParts[1] || '';
  const status = computeStatus(ev, now);

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
  const [rawEvents, setRawEvents] = useState([]);
  const [past, setPast] = useState(fallbackPast);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(() => new Date());

  // Real-time ticker: update every 15 seconds so as soon as 6:00 PM strikes
  // or end time arrives, the status updates live without needing a refresh!
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  // Compute parsed events with dynamic real-time status
  const eventsList = useMemo(() => {
    return rawEvents.map((ev) => parseEvent(ev, currentTime));
  }, [rawEvents, currentTime]);

  // Split into ongoing and upcoming
  const ongoingEvents = useMemo(() => eventsList.filter((e) => e.status === 'ongoing'), [eventsList]);
  const upcomingEvents = useMemo(() => eventsList.filter((e) => e.status === 'upcoming'), [eventsList]);

  // Automatically include any event that finished earlier today into the past archive list
  const combinedPast = useMemo(() => {
    const todayEnded = eventsList
      .filter((e) => e.status === 'past')
      .map((ev) => ({
        day: ev.startDay,
        month: ev.startMonth,
        year: ev.year,
        title: ev.title,
        img: ev.img,
      }));
    const existingTitles = new Set(todayEnded.map((e) => e.title));
    const priorPast = past.filter((p) => !existingTitles.has(p.title));
    return [...todayEnded, ...priorPast];
  }, [eventsList, past]);

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
      .then((data) => setRawEvents(Array.isArray(data) ? data : []))
      .catch(() => setRawEvents([]));

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
            {combinedPast.map((ev) => (
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
      {activeEvent && (() => {
        const activeStatus = computeStatus(activeEvent, currentTime);
        return (
          <div className="event-modal-backdrop" onClick={() => setActiveEvent(null)}>
            <div className="event-modal" onClick={(e) => e.stopPropagation()}>
              <button className="event-modal-close" aria-label="Close" onClick={() => setActiveEvent(null)}>✕</button>
              <div className="event-modal-img">
                <img src={activeEvent.img} alt={activeEvent.title} />
              </div>
              <div className="event-modal-body">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
                  {activeStatus === 'ongoing' ? (
                    <span className="event-modal-status-pill ongoing">
                      <span className="live-pulse-dot" /> Ongoing Now
                    </span>
                  ) : activeStatus === 'past' ? (
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
      );
    })()}
    </main>
  );
}
