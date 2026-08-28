export default function Testimonial() {
  return (
    <section className="testi">
      <div className="wrap testi-grid">
        <div className="testi-media">
          <img src="https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=600&q=80" alt="Member of the congregation" />
          <div className="testi-rating">
            <strong>6:30 AM - 9:30 AM</strong>
            <div className="stars">Every Sunday</div>
            <span>In person & online</span>
          </div>
        </div>
        <div>
          <span className="eyebrow">What our members say</span>
          <p className="quote">&quot;I walked in not knowing a single person. Three months later, I had a small group, a mentor, and a church family I actually looked forward to seeing.&quot;</p>
          <div className="quote-author">
            <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80" alt="Ama Boateng" />
            <div><strong>Ama Boateng</strong><span>Member since 2023, East Legon</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}
