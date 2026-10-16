import { useEffect, useState } from 'react';
import { api, getImageUrl } from '../api.js';
import { DEFAULT_HOME_SETTINGS } from '../data/defaultPageSettings';

export default function Steps() {
  const [eyebrow, setEyebrow] = useState(DEFAULT_HOME_SETTINGS.steps_eyebrow);
  const [title, setTitle] = useState(DEFAULT_HOME_SETTINGS.steps_title);
  const [steps, setSteps] = useState(DEFAULT_HOME_SETTINGS.steps_list);

  useEffect(() => {
    api.get('/home-settings')
      .then((res) => {
        if (res && typeof res === 'object') {
          if (res.steps_eyebrow) setEyebrow(res.steps_eyebrow);
          if (res.steps_title) setTitle(res.steps_title);
          if (Array.isArray(res.steps_list) && res.steps_list.length > 0) {
            setSteps(res.steps_list);
          }
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="steps" id="how">
      <div className="wrap">
        <div className="section-head center">
          <span className="eyebrow">{eyebrow}</span>
          <h2>{title}</h2>
        </div>
        <div className="step-grid">
          {steps.map((s, i) => (
            <div className="step" key={i}>
              <div className="step-media">
                <img src={getImageUrl(s.img || '/images/pensafallback-bw.png')} alt={s.title} />
              </div>
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
