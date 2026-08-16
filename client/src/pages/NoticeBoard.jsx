export default function NoticeBoard() {
  const items = [
    { date: 'Aug 12, 2026', title: 'Office hours update', body: 'The church office is open Tuesday through Friday, 9:00 AM to 4:00 PM. Appointments outside these hours are available on request.' },
    { date: 'Aug 8, 2026', title: 'Serving team recruitment', body: 'We are looking for more volunteers in ushering, hospitality, and media for the next quarter. Speak to a team lead this Sunday.' },
    { date: 'Aug 1, 2026', title: 'Parking on event days', body: 'For larger events, please use the secondary lot behind the building and arrive a few minutes early.' },
    { date: 'Jul 25, 2026', title: 'Building maintenance weekend', body: 'The church building will be closed for deep cleaning on the last Saturday of the month. Online prayer will continue as usual.' },
  ];

  return (
    <main className="feed-page notice-board-page">
      <section className="page-hero">
        <div className="page-hero-bg">
          <img src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1600&q=80" alt="Church notice board" />
        </div>
        <div className="page-hero-inner">
          <span className="eyebrow">Notice Board</span>
          <h1>Practical info <em>you need</em>.</h1>
          <p>Building updates, serving opportunities, parking reminders, and other housekeeping notes for the community.</p>
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
