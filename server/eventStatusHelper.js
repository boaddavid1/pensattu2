/**
 * Helper to compute and synchronize event statuses: 'upcoming', 'ongoing', and 'past'.
 */

export function toYMD(val) {
  if (!val) return '';
  if (val instanceof Date) {
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, '0');
    const d = String(val.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  const str = String(val).trim();
  const match = str.match(/^(\d{4}-\d{2}-\d{2})/);
  if (match) return match[1];
  const parsed = new Date(str);
  if (!isNaN(parsed)) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const d = String(parsed.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return '';
}

export function parseTimeMinutes(str) {
  if (!str) return null;
  const match = str.trim().match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const meridiem = match[3] ? match[3].toLowerCase() : null;
  if (meridiem === 'pm' && hours < 12) hours += 12;
  if (meridiem === 'am' && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

/**
 * Dynamically calculate event status based on start date, end date, time, and current moment.
 */
export function calculateEventStatus(ev, now = new Date()) {
  if (!ev) return 'upcoming';
  if (ev.status === 'cancelled') return 'cancelled';

  const startYMD = toYMD(ev.event_date);
  if (!startYMD) return ev.status || 'upcoming';

  const endYMD = toYMD(ev.event_end_date) || startYMD;

  const nowY = now.getFullYear();
  const nowM = String(now.getMonth() + 1).padStart(2, '0');
  const nowD = String(now.getDate()).padStart(2, '0');
  const todayYMD = `${nowY}-${nowM}-${nowD}`;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // 1. Date is strictly in the future
  if (todayYMD < startYMD) {
    return 'upcoming';
  }

  // 2. Date is strictly in the past
  if (todayYMD > endYMD) {
    return 'past';
  }

  // 3. Today is within event dates (todayYMD >= startYMD && todayYMD <= endYMD)
  // Check if today is the end date and end time has passed
  if (todayYMD === endYMD && ev.event_time) {
    const parts = ev.event_time.split(/\s*[-–]|(?:\s+to\s+)\s*/i);
    if (parts.length >= 2) {
      const endMins = parseTimeMinutes(parts[1]);
      if (endMins !== null && currentMinutes > endMins) {
        return 'past';
      }
    }
  }

  // Date has arrived or is actively ongoing
  return 'ongoing';
}

/**
 * Synchronize event status in MySQL database and in memory
 */
export async function syncEventsDatabaseStatus(pool, memoryEvents = null) {
  const now = new Date();
  const nowY = now.getFullYear();
  const nowM = String(now.getMonth() + 1).padStart(2, '0');
  const nowD = String(now.getDate()).padStart(2, '0');
  const todayYMD = `${nowY}-${nowM}-${nowD}`;

  // Sync in-memory fallback list if provided
  if (Array.isArray(memoryEvents)) {
    memoryEvents.forEach((ev) => {
      ev.status = calculateEventStatus(ev, now);
    });
  }

  // Sync MySQL database
  if (pool) {
    try {
      // 1. Move upcoming to ongoing if date has arrived and not past end date
      await pool.query(`
        UPDATE events 
        SET status = 'ongoing' 
        WHERE (status = 'upcoming' OR status IS NULL OR status = '')
          AND event_date <= ? 
          AND COALESCE(event_end_date, event_date) >= ?
      `, [todayYMD, todayYMD]);

      // 2. Move ongoing or upcoming to past if end date has passed
      await pool.query(`
        UPDATE events 
        SET status = 'past' 
        WHERE status IN ('upcoming', 'ongoing') 
          AND COALESCE(event_end_date, event_date) < ?
      `, [todayYMD]);
    } catch {
      // Non-blocking in demo / offline mode
    }
  }
}
