import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { DEFAULT_HOME_SETTINGS } from '../data/defaultPageSettings';

export default function Story() {
  const [settings, setSettings] = useState(DEFAULT_HOME_SETTINGS);

  useEffect(() => {
    api.get('/home-settings')
      .then((res) => {
        if (res && typeof res === 'object' && Object.keys(res).length > 0) {
          setSettings((prev) => ({ ...prev, ...res }));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section id="story">
      <div className="story">
        <div className="story-inner">
          <div className="story-text">
            <span className="eyebrow">{settings.story_eyebrow || 'Our story'}</span>
            <h2>{settings.story_title || 'Built by a small group who kept showing up.'}</h2>
            {settings.story_p1 && <p>{settings.story_p1}</p>}
            {settings.story_p2 && <p>{settings.story_p2}</p>}
            <Link to={settings.story_btn_link || '/contact'} className="btn btn-primary">
              {settings.story_btn_text || 'read more'}
            </Link>
          </div>
          <div className="story-media">
            <video
              controls
              autoPlay
              muted
              loop
              playsInline
              poster={settings.story_poster_url || '/images/pensafallback-bw.png'}
            >
              <source src={settings.story_video_url || '/videos/story.mp4'} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </div>
    </section>
  );
}
