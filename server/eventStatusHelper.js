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

export function parseTimeMinutes(str, defaultMeridiem = null) {
  if (!str) return null;
  const match = str.trim().match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  let meridiem = match[3] ? match[3].toLowerCase() : defaultMeridiem;
  if (meridiem === 'pm' && hours < 12) hours += 12;
  if (meridiem === 'am' && hours === 12) hours = 0;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}

export function parseEventTimeRange(timeStr) {
  if (!timeStr) return { startMinutes: null, endMinutes: null };
  const parts = String(timeStr).split(/\s*(?:[-–—]|(?:\s+to\s+))\s*/i);
  if (parts.length >= 2) {
    const endMatch = parts[1].trim().match(/(am|pm)/i);
    const endMeridiem = endMatch ? endMatch[1].toLowerCase() : null;
    const startMatch = parts[0].trim().match(/(am|pm)/i);
    const startMeridiemDefault = !startMatch && endMeridiem ? endMeridiem : null;

    let startMinutes = parseTimeMinutes(parts[0], startMeridiemDefault);
    let endMinutes = parseTimeMinutes(parts[1]);

    if (startMinutes !== null && endMinutes !== null && !startMatch && startMinutes > endMinutes && endMeridiem === 'pm') {
      startMinutes = parseTimeMinutes(parts[0], 'am');
    }
    if (endMinutes === null && startMinutes !== null) {
      endMinutes = Math.min(startMinutes + 120, 23 * 60 + 59);
    }
    return { startMinutes, endMinutes };
  } else {
    const startMinutes = parseTimeMinutes(parts[0]);
    if (startMinutes !== null) {
      const endMinutes = Math.min(startMinutes + 120, 23 * 60 + 59);
      return { startMinutes, endMinutes };
    }
  }
  return { startMinutes: null, endMinutes: null };
}

/**
 * Dynamically calculate event status based on start date, end date, time, and current moment.
 * - Before start time: 'upcoming'
 * - At start time (e.g. 6:00 PM): 'ongoing'
 * - As soon as end time passes: 'past'
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

  // 3. Within event dates
  const { startMinutes, endMinutes } = parseEventTimeRange(ev.event_time);

  // If today is the start date and start time hasn't arrived yet -> still upcoming!
  if (todayYMD === startYMD && startMinutes !== null && currentMinutes < startMinutes) {
    return 'upcoming';
  }

  // If today is the end date and end time has passed -> past!
  if (todayYMD === endYMD && endMinutes !== null && currentMinutes >= endMinutes) {
    return 'past';
  }

  // Time has arrived (or no time set), and event has not ended -> ongoing!
  return 'ongoing';
}

/**
 * Synchronize event status in MySQL database and in memory
 */
export async function syncEventsDatabaseStatus(pool, memoryEvents = null) {
  const now = new Date();

  // Sync in-memory fallback list if provided
  if (Array.isArray(memoryEvents)) {
    memoryEvents.forEach((ev) => {
      ev.status = calculateEventStatus(ev, now);
    });
  }

  // Sync MySQL database
  if (pool) {
    try {
      const [rows] = await pool.query(`
        SELECT id, event_date, event_end_date, event_time, status 
        FROM events 
        WHERE status IN ('upcoming', 'ongoing', '') OR status IS NULL
      `);

      for (const ev of rows) {
        const newStatus = calculateEventStatus(ev, now);
        if (newStatus !== ev.status) {
          await pool.query('UPDATE events SET status = ? WHERE id = ?', [newStatus, ev.id]);
        }
      }
    } catch {
      // Non-blocking in demo / offline mode
    }
  }
}
