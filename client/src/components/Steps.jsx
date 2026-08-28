export default function Steps() {
  const steps = [
    { tag: 'mondays', title: 'Plan your visit', text: 'Tell us you are coming so we can save you a seat and a warm welcome.', img: '/images/pensafallback-bw.png' },
    { tag: 'wednesdays', title: 'Choose a service', text: 'Join us at 9AM or 11AM, in person or streaming from wherever you are.', img: '/images/pensafallback-bw.png' },
    { tag: 'fridays', title: 'Come as you are', text: 'Our greeters will meet you at the door — no dress code, no pressure.', img: '/images/pensafallback-bw.png' },
    { tag: 'sundays', title: 'Find your group', text: 'Connect with a community group and start putting down roots.', img: '/images/pensafallback-bw.png' },
  ];

  return (
    <section className="steps" id="how">
      <div className="wrap">
        <div className="section-head center">
          <span className="eyebrow">weekly activities</span>
          <h2>Our Weekly Journey of <span style={{ color: 'var(--moss)' }}>Faith and Service</span></h2>
        </div>
        <div className="step-grid">
          {steps.map((s, i) => (
            <div className="step" key={i}>
              <div className="step-media"><img src={s.img} alt={s.title} /></div>
              <span className="step-tag">{s.tag}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
