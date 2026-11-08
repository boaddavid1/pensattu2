// school/js/data.js — Default Retreat Data & Settings

export const DEFAULT_RETREAT_SETTINGS = {
  retreat_title: 'PENSA Schools & Campus Spiritual Retreat 2026',
  retreat_theme: 'Ignite & Shine — Transformed for Global Impact',
  venue: 'Takoradi Technical University Auditorium',
  dates: 'Nov 14 – Nov 17, 2026',
  active_session: 'Morning Plenary & Worship Session',
  sessions: [
    { id: 'sess_1', name: 'Day 1: Opening & Evening Revival', date: '2026-11-14', active: false },
    { id: 'sess_2', name: 'Day 2: Morning Plenary & Worship Session', date: '2026-11-15', active: true },
    { id: 'sess_3', name: 'Day 2: Leadership Seminar & Workshops', date: '2026-11-15', active: false },
    { id: 'sess_4', name: 'Day 3: Holy Ghost & Healing Encounter', date: '2026-11-16', active: false },
    { id: 'sess_5', name: 'Day 4: Communion & Commissioning Service', date: '2026-11-17', active: false },
  ],
};

// Production ready: Clean empty initial dataset
export const INITIAL_SCHOOLS = [];

export const INITIAL_STUDENTS = [];

export const INITIAL_ATTENDANCE = [];
