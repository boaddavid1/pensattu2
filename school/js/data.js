// school/js/data.js — Default Retreat Data & Sample Schools

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

export const INITIAL_SCHOOLS = [
  {
    id: 'sch_1',
    school_code: 'AUGUS',
    name: "St. Augustine's College",
    category: 'Senior High School',
    region: 'Central Region, Cape Coast',
    patron_name: 'Elder Francis Quaye',
    patron_phone: '+233 24 456 7891',
    patron_email: 'fquaye@augus.edu.gh',
    notes: 'Bus arrives Saturday morning 7:30 AM',
    created_at: '2026-10-15T08:00:00Z',
  },
  {
    id: 'sch_2',
    school_code: 'WGHS',
    name: "Wesley Girls' High School",
    category: 'Senior High School',
    region: 'Central Region, Cape Coast',
    patron_name: 'Mrs. Grace Annan',
    patron_phone: '+233 20 812 3456',
    patron_email: 'gannan@wghs.edu.gh',
    notes: 'Special accommodation requested for 2 patrons',
    created_at: '2026-10-15T09:30:00Z',
  },
  {
    id: 'sch_3',
    school_code: 'PREM',
    name: 'Prempeh College',
    category: 'Senior High School',
    region: 'Ashanti Region, Kumasi',
    patron_name: 'Pastor Samuel Boakye',
    patron_phone: '+233 55 987 6543',
    patron_email: 'sboakye@prempeh.edu.gh',
    notes: 'Delegation accompanied by 2 Scripture Union coordinators',
    created_at: '2026-10-16T11:15:00Z',
  },
  {
    id: 'sch_4',
    school_code: 'TTU',
    name: 'Takoradi Technical University PENSA',
    category: 'University / Tertiary',
    region: 'Western Region, Takoradi',
    patron_name: 'Deacon Dennis Mensah',
    patron_phone: '+233 24 112 2334',
    patron_email: 'dmensah@ttu.edu.gh',
    notes: 'Host campus student delegates and volunteer stewards',
    created_at: '2026-10-16T14:00:00Z',
  },
];

export const INITIAL_STUDENTS = [
  // St. Augustine's College
  { id: 'RET26-AUG-001', school_id: 'sch_1', school_name: "St. Augustine's College", full_name: 'Kwame Mensah Addo', gender: 'Male', level_class: 'Form 3 Science', room_dorm: 'St. Luke Hall', emergency_contact: '+233 24 333 4441', qr_payload: 'RET26-AUG-001', created_at: '2026-10-15T08:10:00Z' },
  { id: 'RET26-AUG-002', school_id: 'sch_1', school_name: "St. Augustine's College", full_name: 'Emmanuel Kojo Antwi', gender: 'Male', level_class: 'Form 2 General Arts', room_dorm: 'St. Luke Hall', emergency_contact: '+233 24 333 4442', qr_payload: 'RET26-AUG-002', created_at: '2026-10-15T08:12:00Z' },
  { id: 'RET26-AUG-003', school_id: 'sch_1', school_name: "St. Augustine's College", full_name: 'David Osei Poku', gender: 'Male', level_class: 'Form 3 Business', room_dorm: 'St. Peter Hall', emergency_contact: '+233 24 333 4443', qr_payload: 'RET26-AUG-003', created_at: '2026-10-15T08:14:00Z' },
  { id: 'RET26-AUG-004', school_id: 'sch_1', school_name: "St. Augustine's College", full_name: 'Samuel Yaw Danso', gender: 'Male', level_class: 'Form 2 Science', room_dorm: 'St. Peter Hall', emergency_contact: '+233 24 333 4444', qr_payload: 'RET26-AUG-004', created_at: '2026-10-15T08:15:00Z' },
  
  // Wesley Girls' High School
  { id: 'RET26-WGH-001', school_id: 'sch_2', school_name: "Wesley Girls' High School", full_name: 'Akosua Serwaa Boateng', gender: 'Female', level_class: 'Form 3 Science', room_dorm: 'Ruth House', emergency_contact: '+233 20 555 6661', qr_payload: 'RET26-WGH-001', created_at: '2026-10-15T09:40:00Z' },
  { id: 'RET26-WGH-002', school_id: 'sch_2', school_name: "Wesley Girls' High School", full_name: 'Abena Mansa Appiah', gender: 'Female', level_class: 'Form 3 General Arts', room_dorm: 'Ruth House', emergency_contact: '+233 20 555 6662', qr_payload: 'RET26-WGH-002', created_at: '2026-10-15T09:42:00Z' },
  { id: 'RET26-WGH-003', school_id: 'sch_2', school_name: "Wesley Girls' High School", full_name: 'Priscilla Ewurama Baidoo', gender: 'Female', level_class: 'Form 2 Home Economics', room_dorm: 'Esther House', emergency_contact: '+233 20 555 6663', qr_payload: 'RET26-WGH-003', created_at: '2026-10-15T09:45:00Z' },
  { id: 'RET26-WGH-004', school_id: 'sch_2', school_name: "Wesley Girls' High School", full_name: 'Blessing Nana Yaa Frimpong', gender: 'Female', level_class: 'Form 2 Visual Arts', room_dorm: 'Esther House', emergency_contact: '+233 20 555 6664', qr_payload: 'RET26-WGH-004', created_at: '2026-10-15T09:47:00Z' },

  // Prempeh College
  { id: 'RET26-PRM-001', school_id: 'sch_3', school_name: 'Prempeh College', full_name: 'Kofi Owusu Ansah', gender: 'Male', level_class: 'Form 3 Science', room_dorm: 'Osei Tutu House', emergency_contact: '+233 55 123 4561', qr_payload: 'RET26-PRM-001', created_at: '2026-10-16T11:20:00Z' },
  { id: 'RET26-PRM-002', school_id: 'sch_3', school_name: 'Prempeh College', full_name: 'Michael Nana Kwesi Darko', gender: 'Male', level_class: 'Form 2 Science', room_dorm: 'Osei Tutu House', emergency_contact: '+233 55 123 4562', qr_payload: 'RET26-PRM-002', created_at: '2026-10-16T11:22:00Z' },
  { id: 'RET26-PRM-003', school_id: 'sch_3', school_name: 'Prempeh College', full_name: 'Stephen Kwame Frimpong', gender: 'Male', level_class: 'Form 3 Business', room_dorm: 'Freeman House', emergency_contact: '+233 55 123 4563', qr_payload: 'RET26-PRM-003', created_at: '2026-10-16T11:25:00Z' },

  // TTU PENSA
  { id: 'RET26-TTU-001', school_id: 'sch_4', school_name: 'Takoradi Technical University PENSA', full_name: 'Caleb Joshua Eshun', gender: 'Male', level_class: 'Level 300 Electrical Eng', room_dorm: 'Host Campus', emergency_contact: '+233 24 777 8881', qr_payload: 'RET26-TTU-001', created_at: '2026-10-16T14:10:00Z' },
  { id: 'RET26-TTU-002', school_id: 'sch_4', school_name: 'Takoradi Technical University PENSA', full_name: 'Eunice Adwoa Nyamekye', gender: 'Female', level_class: 'Level 200 Computer Science', room_dorm: 'Host Campus', emergency_contact: '+233 24 777 8882', qr_payload: 'RET26-TTU-002', created_at: '2026-10-16T14:12:00Z' },
  { id: 'RET26-TTU-003', school_id: 'sch_4', school_name: 'Takoradi Technical University PENSA', full_name: 'Gabriel Kweku Dadzie', gender: 'Male', level_class: 'Level 400 Civil Eng', room_dorm: 'Host Campus', emergency_contact: '+233 24 777 8883', qr_payload: 'RET26-TTU-003', created_at: '2026-10-16T14:15:00Z' },
  { id: 'RET26-TTU-004', school_id: 'sch_4', school_name: 'Takoradi Technical University PENSA', full_name: 'Dorothy Maame Yeboah', gender: 'Female', level_class: 'Level 100 Hospitality Mgt', room_dorm: 'Host Campus', emergency_contact: '+233 24 777 8884', qr_payload: 'RET26-TTU-004', created_at: '2026-10-16T14:18:00Z' },
];

export const INITIAL_ATTENDANCE = [
  {
    id: 1,
    student_id: 'RET26-AUG-001',
    student_name: 'Kwame Mensah Addo',
    school_name: "St. Augustine's College",
    action_type: 'clock_in',
    session_name: 'Morning Plenary & Worship Session',
    scanned_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    scanned_by: 'Main Gate Scanner',
  },
  {
    id: 2,
    student_id: 'RET26-WGH-001',
    student_name: 'Akosua Serwaa Boateng',
    school_name: "Wesley Girls' High School",
    action_type: 'clock_in',
    session_name: 'Morning Plenary & Worship Session',
    scanned_at: new Date(Date.now() - 38 * 60 * 1000).toISOString(),
    scanned_by: 'Main Gate Scanner',
  },
  {
    id: 3,
    student_id: 'RET26-PRM-001',
    student_name: 'Kofi Owusu Ansah',
    school_name: 'Prempeh College',
    action_type: 'clock_in',
    session_name: 'Morning Plenary & Worship Session',
    scanned_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    scanned_by: 'North Gate Scanner',
  },
  {
    id: 4,
    student_id: 'RET26-TTU-001',
    student_name: 'Caleb Joshua Eshun',
    school_name: 'Takoradi Technical University PENSA',
    action_type: 'clock_in',
    session_name: 'Morning Plenary & Worship Session',
    scanned_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    scanned_by: 'Main Gate Scanner',
  },
  {
    id: 5,
    student_id: 'RET26-TTU-002',
    student_name: 'Eunice Adwoa Nyamekye',
    school_name: 'Takoradi Technical University PENSA',
    action_type: 'clock_in',
    session_name: 'Morning Plenary & Worship Session',
    scanned_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    scanned_by: 'Main Gate Scanner',
  },
];
