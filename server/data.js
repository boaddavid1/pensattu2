export const coreValues = [
  { id: 1, icon: 'fas fa-bullhorn', title: 'Evangelism', description: 'Evangelism is the Spirit-empowered presentation of Jesus Christ so that people will trust Him as Saviour and Lord.', display_order: 1, is_active: 1 },
  { id: 2, icon: 'fas fa-users', title: 'Discipleship', description: 'Teaching and training believers to be like Christ in character and to make responsible, godly choices.', display_order: 2, is_active: 1 },
  { id: 3, icon: 'fas fa-crown', title: 'Ministry Excellence', description: 'We seek to honour God by maintaining a high standard of excellence in all our ministries.', display_order: 3, is_active: 1 },
];

export const ministries = [
  { id: 1, title: 'Worship & Music', description: "Musicians, singers and sound volunteers shaping every Sunday's atmosphere.", image_url: '/images/pensafallback-bw.png' },
  { id: 2, title: 'Outreach & Missions', description: 'Serving neighborhoods across Accra with food, care, and practical help.', image_url: '/images/pensafallback-bw.png' },
  { id: 3, title: 'Counseling & Care', description: "One-on-one time with our pastoral team, in confidence, whenever it's needed.", image_url: '/images/pensafallback-bw.png' },
  { id: 4, title: 'Bible Study Groups', description: 'Weekday gatherings that go deeper into scripture, together.', image_url: '/images/pensafallback-bw.png' },
];

export const sermons = [
  { id: 1, title: 'What it means to belong before you believe', speaker: 'Pastor Mark Johnson', category: 'Sermon', duration: '32 min', image_url: '/images/pensafallback-bw.png', published_at: '2026-08-09' },
  { id: 2, title: 'Why we built community groups around neighborhoods', speaker: 'Pastor Helen Owusu', category: 'Community', duration: '4 min read', image_url: '/images/pensafallback-bw.png', published_at: '2026-08-06' },
  { id: 3, title: 'Inside our latest outreach across Accra', speaker: 'Pastor Alex Mensah', category: 'Outreach', duration: '3 min read', image_url: '/images/pensafallback-bw.png', published_at: '2026-08-02' },
];

export const leadership = [
  { id: 1, name: 'Pastor John and Mrs. Essah', role: 'Traveling Secretary', category: 'pastor', academic_year: 'N/A', description: 'Traveling Secretary For The Takoradi Sector', image_url: '/images/pensafallback-bw.png', display_order: 0, is_active: 1 },
  { id: 2, name: 'Elder Ebenezer Omano', role: 'Evangelism Secretary', category: 'ec', academic_year: '2025/2026', description: '', image_url: '/images/pensafallback-bw.png', display_order: 4, is_active: 1 },
];

export const team = [
  { id: 1, name: 'Pastor Mark Johnson', role: 'Senior Pastor', image_url: '/images/pensafallback-bw.png', sort_order: 1 },
  { id: 2, name: 'Pastor Helen Owusu', role: 'Worship Pastor', image_url: '/images/pensafallback-bw.png', sort_order: 2 },
  { id: 3, name: 'Pastor Alex Mensah', role: 'Youth Pastor', image_url: '/images/pensafallback-bw.png', sort_order: 3 },
  { id: 4, name: 'Elder Kwame Asante', role: 'Executive Pastor', image_url: '/images/pensafallback-bw.png', sort_order: 4 },
];

export const events = [
  { id: 1, title: 'Youth Night', event_date: '2026-08-21', event_time: '18:00', location: 'Main Auditorium', description: 'An evening of worship and conversation for young people.' },
  { id: 2, title: 'Community Outreach - Madina', event_date: '2026-08-23', event_time: '08:00', location: 'Madina Community Park', description: 'Food distribution and medical screening.' },
  { id: 3, title: 'Midweek Bible Study', event_date: '2026-08-26', event_time: '19:00', location: 'Fellowship Hall', description: 'Going deeper into Ephesians chapter by chapter.' },
];

export const visits = [];
export const subscribers = [];
export const contacts = [];
export const contactMessages = [];

export const news = [
  { id: 1, display_order: 0, title: 'Welcome to PENSA TTU', content: 'We are excited to have you join our fellowship.', excerpt: 'Join us for weekly services and events.', image_url: '/images/pensafallback-bw.png', category: 'General', created_at: '2026-08-23' },
];

export const albums = [
  { id: 1, name: 'Sunday Worship', description: 'Weekly worship services', cover_image: '/images/pensafallback-bw.png', created_at: '2026-08-23' },
];

export const gallery = [
  { id: 1, title: 'Worship Service', category: 'worship', description: 'Sunday worship', image_url: '/images/pensafallback-bw.png', created_at: '2026-08-23', album_id: 1 },
];

export const announcements = [
  { date: 'Aug 14, 2026', title: 'New Sunday service schedule', body: 'From September, our second service starts at 11:30 AM to give more room for community time between gatherings.' },
  { date: 'Aug 10, 2026', title: 'Community outreach this Saturday', body: 'We are meeting at the church parking lot at 8:00 AM to distribute supplies in nearby neighborhoods. Everyone is welcome.' },
  { date: 'Aug 5, 2026', title: 'Youth conference registration open', body: 'PENSA Youth 2026 is happening in October. Early registration is open until the end of the month.' },
  { date: 'Jul 28, 2026', title: 'Welcome lunch for first-time guests', body: 'If this is your first month with us, join the pastors for lunch after second service this Sunday.' },
];

export const notices = [
  { date: 'Aug 12, 2026', title: 'Office hours update', body: 'The church office is open Tuesday through Friday, 9:00 AM to 4:00 PM. Appointments outside these hours are available on request.' },
  { date: 'Aug 8, 2026', title: 'Serving team recruitment', body: 'We are looking for more volunteers in ushering, hospitality, and media for the next quarter. Speak to a team lead this Sunday.' },
  { date: 'Aug 1, 2026', title: 'Parking on event days', body: 'For larger events, please use the secondary lot behind the building and arrive a few minutes early.' },
  { date: 'Jul 25, 2026', title: 'Building maintenance weekend', body: 'The church building will be closed for deep cleaning on the last Saturday of the month. Online prayer will continue as usual.' },
];

export const galleryAlbums = [
  {
    id: 'worship',
    title: 'Sunday Worship',
    cover: '/images/pensafallback-bw.png',
    count: '4 photos',
    items: [
      { src: '/images/pensafallback-bw.png', alt: 'Hands raised in worship', category: 'Worship', caption: 'Sunday morning, 11AM' },
      { src: '/images/pensafallback-bw.png', alt: 'Sanctuary interior', category: 'Worship', caption: 'Our sanctuary' },
      { src: '/images/pensafallback-bw.png', alt: 'Worship band', category: 'Worship', caption: 'Music ministry' },
      { src: '/images/pensafallback-bw.png', alt: 'Sunday service', category: 'Worship', caption: 'A packed 9AM service' },
    ],
  },
  {
    id: 'community',
    title: 'Community Life',
    cover: '/images/pensafallback-bw.png',
    count: '3 photos',
    items: [
      { src: '/images/pensafallback-bw.png', alt: 'Community group meeting', category: 'Community', caption: 'East Legon group night' },
      { src: '/images/pensafallback-bw.png', alt: 'Bible study group', category: 'Community', caption: 'Midweek Bible study' },
      { src: '/images/pensafallback-bw.png', alt: 'Greeters welcoming visitors', category: 'Community', caption: 'First-Sunday greeters' },
    ],
  },
  {
    id: 'outreach',
    title: 'Outreach',
    cover: '/images/pensafallback-bw.png',
    count: '2 photos',
    items: [
      { src: '/images/pensafallback-bw.png', alt: 'Outreach event', category: 'Outreach', caption: 'Serving Osu this spring' },
      { src: '/images/pensafallback-bw.png', alt: 'Planning an outreach event', category: 'Outreach', caption: 'Getting ready to serve' },
    ],
  },
  {
    id: 'youth',
    title: 'Youth & Kids',
    cover: '/images/pensafallback-bw.png',
    count: '2 photos',
    items: [
      { src: '/images/pensafallback-bw.png', alt: 'Youth ministry gathering', category: 'Youth', caption: 'Friday youth night' },
      { src: '/images/pensafallback-bw.png', alt: 'Youth small group', category: 'Youth', caption: 'Youth small group' },
    ],
  },
];

export function addVisit(data) { visits.push({ ...data, created_at: new Date().toISOString() }); }
export function addSubscriber(email) { subscribers.push({ email, subscribed_at: new Date().toISOString() }); }
export function addContact(data) { contacts.push({ ...data, created_at: new Date().toISOString() }); }
