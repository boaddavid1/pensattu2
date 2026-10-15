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
            {Array.isArray(settings.extra_story_paragraphs) &&
              settings.extra_story_paragraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
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

      {/* ─── Mission & Vision Statements ─── */}
      {settings.show_mission_vision !== false && (settings.mission_text || settings.vision_text) && (
        <section className="about-mv-section" style={{ background: 'var(--paper, #f7f5ee)', padding: '70px 0' }}>
          <div className="wrap">
            <div className="about-mv-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px' }}>
              {settings.vision_text && (
                <div
                  className="about-mv-card"
                  style={{
                    background: '#fff',
                    border: '1px solid var(--line, #e3dfd3)',
                    borderRadius: '24px',
                    padding: '36px 32px',
                    boxShadow: '0 8px 24px rgba(10, 46, 92, 0.05)',
                  }}
                >
                  <div
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 14,
                      background: 'rgba(14, 76, 146, 0.1)',
                      color: 'var(--pine-deep, #0A2E5C)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 24,
                      marginBottom: 18,
                    }}
                  >
                    🔭
                  </div>
                  <span className="eyebrow" style={{ color: 'var(--moss-deep, #2C6B3F)', marginBottom: 8, display: 'block' }}>
                    Forward Outlook
                  </span>
                  <h3 style={{ fontSize: 24, color: 'var(--pine-deep, #0A2E5C)', marginBottom: 14 }}>
                    {settings.vision_title || 'Our Vision'}
                  </h3>
                  <p style={{ color: 'var(--ink-soft, #555)', lineHeight: 1.7, fontSize: 15 }}>
                    {settings.vision_text}
                  </p>
                </div>
              )}

              {settings.mission_text && (
                <div
                  className="about-mv-card"
                  style={{
                    background: '#fff',
                    border: '1px solid var(--line, #e3dfd3)',
                    borderRadius: '24px',
                    padding: '36px 32px',
                    boxShadow: '0 8px 24px rgba(10, 46, 92, 0.05)',
                  }}
                >
                  <div
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 14,
                      background: 'rgba(44, 107, 63, 0.1)',
                      color: 'var(--moss-deep, #2C6B3F)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 24,
                      marginBottom: 18,
                    }}
                  >
                    🎯
                  </div>
                  <span className="eyebrow" style={{ color: 'var(--moss-deep, #2C6B3F)', marginBottom: 8, display: 'block' }}>
                    Our Purpose
                  </span>
                  <h3 style={{ fontSize: 24, color: 'var(--pine-deep, #0A2E5C)', marginBottom: 14 }}>
                    {settings.mission_title || 'Our Mission'}
                  </h3>
                  <p style={{ color: 'var(--ink-soft, #555)', lineHeight: 1.7, fontSize: 15 }}>
                    {settings.mission_text}
                  </p>
                </div>
              )}
            </div>

            {settings.motto_text && (
              <div
                style={{
                  marginTop: 24,
                  background: 'linear-gradient(135deg, var(--pine-deep, #0A2E5C) 0%, #153e75 100%)',
                  borderRadius: 20,
                  padding: '24px 32px',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 20,
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <span style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#E5A93C', fontWeight: 700 }}>
                    Fellowship Motto
                  </span>
                  <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>
                    "{settings.motto_text}"
                  </div>
                </div>
                <div style={{ fontSize: 28 }}>⚡</div>
              </div>
            )}
          </div>
        </section>
      )}

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

      {/* ─── Community Photos Showcase ─── */}
      {settings.show_photos !== false && Array.isArray(settings.about_photos) && settings.about_photos.length > 0 && (
        <section className="about-photos-section" style={{ background: '#fff', padding: '80px 0' }}>
          <div className="wrap">
            <div className="section-head">
              <span className="eyebrow">{settings.photos_eyebrow || 'Life in fellowship'}</span>
              <h2>{settings.photos_title || 'Moments from our church family.'}</h2>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 20,
                marginTop: 40,
              }}
            >
              {settings.about_photos.map((photo, idx) => (
                <div
                  key={idx}
                  style={{
                    borderRadius: 20,
                    overflow: 'hidden',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                    border: '1px solid var(--line, #e3dfd3)',
                    background: 'var(--paper, #f7f5ee)',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div style={{ width: '100%', height: 240, overflow: 'hidden' }}>
                    <img
                      src={photo.src || photo.image_url}
                      alt={photo.caption || 'PENSA TTU fellowship'}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.4s ease',
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.04)')}
                      onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    />
                  </div>
                  {photo.caption && (
                    <div style={{ padding: '14px 18px', fontSize: 13.5, color: 'var(--ink-soft, #555)', fontWeight: 500 }}>
                      {photo.caption}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Call to Action ─── */}
      <section className="cta">
        <div className="wrap">
          <div className="cta-box">
            <div>
              <h2>{settings.cta_title || 'Come see it for yourself this Sunday.'}</h2>
              {settings.cta_subtitle && (
                <p style={{ marginTop: 8, color: 'var(--ink-soft, #555)', fontSize: 15, maxWidth: 440 }}>
                  {settings.cta_subtitle}
                </p>
              )}
            </div>
            <Link to={settings.cta_btn_link || '/#book'} className="btn btn-dark">
              {settings.cta_btn_text || 'Plan your visit'} <span className="btn-arrow" style={{ background: 'var(--moss)', color: 'var(--pine-deep)' }}>→</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
