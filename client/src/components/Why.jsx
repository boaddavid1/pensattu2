export default function Why() {
  const reasons = [
    { num: '01', title: 'Sunday Worship', text: 'Two services, 9AM and 11AM, with live music and teaching that is straight from scripture.' },
    { num: '02', title: 'Community Groups', text: 'Small groups meeting weekly across Accra — real conversation, real accountability.' },
    { num: '03', title: 'Youth & Kids Ministry', text: 'Age-appropriate teaching and a safe, joyful space for the next generation.' },
  ];

  return (
    <section className="why" id="why">
      <div className="wrap why-grid">
        <div>
          <span className="eyebrow">Why PENSA TTU</span>
          <h2>Three reasons this <em>becomes home</em>.</h2>
          <p style={{ color: 'var(--ink-soft)', margin: '16px 0 36px', lineHeight: 1.65 }}>
            We are not trying to be the biggest church in Accra — just a place where people are known, the teaching is honest, and there is always a seat for one more.
          </p>
          <div className="why-list">
            {reasons.map((r) => (
              <div className="why-item" key={r.num}>
                <div className="why-num">{r.num}</div>
                <div><h3>{r.title}</h3><p>{r.text}</p></div>
              </div>
            ))}
          </div>
        </div>
        <div className="why-media">
          <div className="why-media-grid">
            <img className="tall" src="/images/pensa%20(1).JPG" alt="Worship band leading a Sunday service" />
            <img className="short" src="/images/pastor.JPG" alt="Pastor" />
          </div>
        </div>
      </div>
    </section>
  );
}
