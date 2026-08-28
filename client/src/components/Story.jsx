import { Link } from 'react-router-dom';

export default function Story() {
  return (
    <section id="story">
      <div className="story">
        <div className="story-inner">
          <div className="story-text">
            <span className="eyebrow">Our story</span>
            <h2>Built by a small group who kept <em>showing up</em>.</h2>
            <p>The Pentecost Students and Associates (PENSA), the student wing of the Church of Pentecost worldwide, began over forty (50) years ago with a few dedicated students in tertiary institutions across Ghana. Over the years, it has grown into a vibrant and impactful movement, drawing young men and women to the saving grace of our Lord Jesus Christ.</p>
            <p>At PENSA TTU – Takoradi Technical University, this vision continues to thrive as a dynamic fellowship committed to spiritual growth, discipleship, and evangelism on campus. The fellowship serves as a strong platform for students to deepen their relationship with God, build Christ-centered character, and influence their academic and social environments with godly values.</p>
            <Link to="/contact" className="btn btn-primary">read more</Link>
          </div>
          <div className="story-media">
            <video controls autoPlay muted loop playsInline poster="/images/pensafallback-bw.png">
              <source src="/videos/story.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </div>
    </section>
  );
}
