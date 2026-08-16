export default function Announcements() {
  const items = [
    { date: 'Aug 14, 2026', title: 'New Sunday service schedule', body: 'From September, our second service starts at 11:30 AM to give more room for community time between gatherings.' },
    { date: 'Aug 10, 2026', title: 'Community outreach this Saturday', body: 'We are meeting at the church parking lot at 8:00 AM to distribute supplies in nearby neighborhoods. Everyone is welcome.' },
    { date: 'Aug 5, 2026', title: 'Youth conference registration open', body: 'PENSA Youth 2026 is happening in October. Early registration is open until the end of the month.' },
    { date: 'Jul 28, 2026', title: 'Welcome lunch for first-time guests', body: 'If this is your first month with us, join the pastors for lunch after second service this Sunday.' },
  ];

  return (
    <main className="feed-page announcements-page">
      <section className="page-hero">
        <div className="page-hero-bg">
          <img src="https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=1600&q=80" alt="Church community gathering" />
        </div>
        <div className="page-hero-inner">
          <span className="eyebrow">Announcements</span>
          <h1>What’s <em>happening</em> at PENSA TTU.</h1>
          <p>Updates, reminders, and the things we want the whole church to know about this week.</p>
        </div>
      </section>

      <section className="feed-list">
        <div className="wrap">
          <div className="feed-grid">
            {items.map((item) => (
              <article className="feed-card" key={item.title}>
                <div className="feed-meta">{item.date}</div>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
