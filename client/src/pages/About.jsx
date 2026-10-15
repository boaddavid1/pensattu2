import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { DEFAULT_ABOUT_SETTINGS } from '../data/defaultPageSettings';

export default function About() {
  const [settings, setSettings] = useState(DEFAULT_ABOUT_SETTINGS);

  useEffect(() => {
    api.get('/about-settings')
      .then((res) => {
        if (res && typeof res === 'object' && Object.keys(res).length > 0) {
          setSettings((prev) => ({ ...prev, ...res }));
        }
      })
      .catch(() => {});
  }, []);

  const valuesList = settings.values_list || DEFAULT_ABOUT_SETTINGS.values_list;
  const statsList = settings.stats_list || DEFAULT_ABOUT_SETTINGS.stats_list;
  const timelineList = settings.timeline_list || DEFAULT_ABOUT_SETTINGS.timeline_list;
  const beliefsList = settings.beliefs_list || DEFAULT_ABOUT_SETTINGS.beliefs_list;

  return (
    <>
      {/* ─── Hero Header ─── */}
      <section className="page-hero about-page-hero">
        <div className="page-hero-bg">
          <img
            src={settings.hero_image || DEFAULT_ABOUT_SETTINGS.hero_image}
            alt={settings.hero_title || 'Congregation gathered in worship'}
          />
        </div>
        <div className="page-hero-inner">
          <span className="eyebrow">{settings.hero_eyebrow || 'About PENSA TTU'}</span>
          <h1>{settings.hero_title || 'A church built on showing up, not showing off.'}</h1>
          <p>{settings.hero_subtitle || "Twelve years in, we're still the same church we started as..."}</p>
        </div>
      </section>

      {/* ─── Origins Story Split ─── */}
      <section className="story-split">
        <div className="wrap story-split-grid">
          <div>
            <span className="eyebrow">{settings.story_eyebrow || 'How we started'}</span>
            <h2 style={{ fontSize: 'clamp(28px, 3vw, 38px)', color: 'var(--pine-deep)', marginBottom: '20px' }}>
              {settings.story_title || 'From a rented hall to a home for hundreds.'}
            </h2>
            {settings.story_p1 && <p>{settings.story_p1}</p>}
            {settings.story_p2 && <p>{settings.story_p2}</p>}
            {settings.story_p3 && <p>{settings.story_p3}</p>}
            <Link to={settings.story_btn_link || '/#team'} className="btn btn-dark" style={{ marginTop: '10px' }}>
              {settings.story_btn_text || 'Meet our leadership'} <span className="btn-arrow" style={{ background: 'var(--moss)', color: 'var(--pine-deep)' }}>→</span>
            </Link>
          </div>
          <div className="story-media">
            <img
              src={settings.story_image || DEFAULT_ABOUT_SETTINGS.story_image}
              alt="Inside the PENSA TTU sanctuary"
            />
          </div>
        </div>
      </section>

      {/* ─── Core Values ─── */}
      <section className="values">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">{settings.values_eyebrow || 'What we value'}</span>
            <h2>{settings.values_title || 'Four things that shape every decision.'}</h2>
          </div>
          <div className="value-grid">
            {valuesList.map((val, idx) => (
              <div className="value-card" key={idx}>
                <div className="ic">{val.ic || '✨'}</div>
                <h3>{val.title}</h3>
                <p>{val.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Statistics Strip ─── */}
      {statsList.length > 0 && (
        <section className="stats-strip">
          <div className="wrap stats-grid">
            {statsList.map((stat, idx) => (
              <div key={idx}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ─── Journey Milestones Timeline ─── */}
      <section className="timeline">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">{settings.timeline_eyebrow || 'Our journey'}</span>
            <h2>{settings.timeline_title || 'Twelve years, one conviction.'}</h2>
          </div>
          <div className="timeline-list">
            {timelineList.map((item, idx) => (
              <div className="timeline-item" key={idx}>
                <div className="timeline-year">{item.year}</div>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Convictions & Beliefs ─── */}
      <section id="beliefs-wrap">
        <div className="beliefs">
          <div className="beliefs-inner">
            <span className="eyebrow">{settings.beliefs_eyebrow || 'What we believe'}</span>
            <h2>{settings.beliefs_title || 'The convictions we build on.'}</h2>
            <div className="belief-grid">
              {beliefsList.map((belief, idx) => (
                <div className="belief-item" key={idx}>
                  <h4>{belief.title}</h4>
                  <p>{belief.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Call to Action ─── */}
      <section className="cta">
        <div className="wrap">
          <div className="cta-box">
            <h2>{settings.cta_title || 'Come see it for yourself this Sunday.'}</h2>
            <Link to={settings.cta_btn_link || '/#book'} className="btn btn-dark">
              {settings.cta_btn_text || 'Plan your visit'} <span className="btn-arrow" style={{ background: 'var(--moss)', color: 'var(--pine-deep)' }}>→</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
