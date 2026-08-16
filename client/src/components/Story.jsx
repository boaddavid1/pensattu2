export default function Story() {
  return (
    <section id="story">
      <div className="story">
        <div className="story-inner">
          <div className="story-text">
            <span className="eyebrow">Our story</span>
            <h2>Built by a small group who kept <em>showing up</em>.</h2>
            <p>PENSA TTU started in 2014 with twelve people in a rented hall. Today we are a congregation spread across Accra, still holding to the same conviction that brought us together — that everyone deserves a place to belong.</p>
            <div className="story-stats">
              <div><strong>500+</strong><span>Members & regular attendees</span></div>
              <div><strong>12+</strong><span>Years serving Accra</span></div>
              <div><strong>30+</strong><span>Community groups</span></div>
            </div>
            <a href="#book" className="btn btn-primary">Join us this Sunday <span className="btn-arrow">→</span></a>
          </div>
          <div className="story-media">
            <img src="https://images.unsplash.com/photo-1477414348463-c0eb7f1359b6?w=800&q=80" alt="Church sanctuary interior" />
          </div>
        </div>
      </div>
    </section>
  );
}
