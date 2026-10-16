import { useState, useEffect } from 'react';
import { api } from '../api';
import { DEFAULT_HOME_SETTINGS } from '../data/defaultPageSettings';

export default function Trail() {
  const [items, setItems] = useState(DEFAULT_HOME_SETTINGS.trail_items);

  useEffect(() => {
    api.get('/home-settings')
      .then((res) => {
        if (res && Array.isArray(res.trail_items) && res.trail_items.length > 0) {
          setItems(res.trail_items);
        }
      })
      .catch(() => {});
  }, []);

  const track = [...items, ...items];

  return (
    <div className="trail-strip">
      <div className="trail-track">
        {track.map((item, i) => <span key={i}>{item}</span>)}
      </div>
    </div>
  );
}
