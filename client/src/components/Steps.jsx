export default function Steps() {
  const steps = [
    { tag: 'Step 1', title: 'Plan your visit', text: 'Tell us you are coming so we can save you a seat and a warm welcome.', img: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=400&q=80' },
    { tag: 'Step 2', title: 'Choose a service', text: 'Join us at 9AM or 11AM, in person or streaming from wherever you are.', img: 'https://images.unsplash.com/photo-1478147427282-58a87a120781?w=400&q=80' },
    { tag: 'Step 3', title: 'Come as you are', text: 'Our greeters will meet you at the door — no dress code, no pressure.', img: 'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=400&q=80' },
    { tag: 'Step 4', title: 'Find your group', text: 'Connect with a community group and start putting down roots.', img: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=400&q=80' },
  ];

  return (
    <section className="steps" id="how">
      <div className="wrap">
        <div className="section-head center">
          <span className="eyebrow">Getting started</span>
          <h2>Find your place in <em>four steps</em>.</h2>
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
