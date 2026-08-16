import { useState } from 'react';

export default function Events() {
  const [activeEvent, setActiveEvent] = useState(null);

  const upcoming = [
    { startDay: '24', startMonth: 'AUG', endDay: '24', endMonth: 'AUG', year: '2026', startTime: '9:00 AM', endTime: '12:30 PM', title: 'Sunday Celebration', body: 'Join us for worship, teaching, and communion across both morning services.', location: 'Main Sanctuary', img: 'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=900&q=80' },
    { startDay: '26', startMonth: 'AUG', endDay: '26', endMonth: 'AUG', year: '2026', startTime: '6:30 PM', endTime: '8:00 PM', title: 'Midweek Bible Study', body: 'A smaller gathering for scripture, discussion, and prayer.', location: 'Fellowship Hall', img: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=900&q=80' },
    { startDay: '30', startMonth: 'AUG', endDay: '30', endMonth: 'AUG', year: '2026', startTime: '8:00 AM', endTime: '1:00 PM', title: 'Community Outreach Day', body: 'Serving the local neighborhood with practical help and conversation.', location: 'Church Parking Lot', img: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=900&q=80' },
    { startDay: '04', startMonth: 'SEP', endDay: '06', endMonth: 'SEP', year: '2026', startTime: '6:00 PM', endTime: '9:00 PM', title: 'Youth Night', body: 'An evening of worship, games, and teaching specifically for students.', location: 'Youth Center', img: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=900&q=80' },
  ];

  const timeline = [
    { month: 'January 2026', dates: [
      { weekday: 'WED', day: '14' },
      { weekday: 'WED', day: '28' },
    ] },
    { month: 'February 2026', dates: [
      { weekday: 'SUN', day: '22' },
    ] },
    { month: 'March 2026', dates: [
      { weekday: 'SUN', day: '1' },
      { weekday: 'FRI', day: '20' },
      { weekday: 'SUN', day: '22' },
    ] },
  ];

  const past = [
    { day: '17', month: 'AUG', year: '2026', title: 'Back to School Sunday', img: 'https://images.unsplash.com/photo-1503676267431-0d268eb132b9?w=600&q=80' },
    { day: '10', month: 'AUG', year: '2026', title: 'Worship Night', img: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80' },
    { day: '03', month: 'AUG', year: '2026', title: 'Baptism Sunday', img: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=600&q=80' },
    { day: '27', month: 'JUL', year: '2026', title: 'Family Picnic', img: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&q=80' },
    { day: '20', month: 'JUL', year: '2026', title: 'Missions Conference', img: 'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=600&q=80' },
    { day: '13', month: 'JUL', year: '2026', title: 'Youth Camp Finale', img: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=600&q=80' },
    { day: '06', month: 'JUL', year: '2026', title: 'Prayer & Fasting', img: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=600&q=80' },
    { day: '29', month: 'JUN', year: '2026', title: 'Sunday Fellowship', img: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&q=80' },
  ];

  const formatRange = (ev) => {
    const sameDay = ev.startDay === ev.endDay && ev.startMonth === ev.endMonth;
    const dateStr = sameDay
      ? `${ev.startMonth} ${ev.startDay}, ${ev.year}`
      : `${ev.startMonth} ${ev.startDay} – ${ev.endMonth} ${ev.endDay}, ${ev.year}`;
    return `${dateStr} · ${ev.startTime} – ${ev.endTime}`;
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
          <div className="timeline-head">
            <div className="timeline-title">
              <span className="timeline-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="5" width="18" height="16" rx="3" stroke="currentColor" strokeWidth="2"/>
                  <path d="M3 9H21" stroke="currentColor" strokeWidth="2"/>
                  <path d="M8 3V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M16 3V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </span>
              <h2>Timeline</h2>
            </div>
            <span className="timeline-subtitle">Showing only dates with scheduled events</span>
          </div>

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
        </div>
      </section>

      <section className="upcoming-events">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">Upcoming</span>
            <h2>What's <em>coming up</em>.</h2>
          </div>
          <div className="upcoming-events-grid">
            {upcoming.map((ev) => (
              <article
                className="upcoming-event-card"
                key={ev.title}
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
              <article className="past-event-card" key={ev.title}>
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
