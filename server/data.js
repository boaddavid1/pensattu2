export const ministries = [
  { id: 1, title: 'Worship & Music', description: "Musicians, singers and sound volunteers shaping every Sunday's atmosphere.", image_url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&q=80' },
  { id: 2, title: 'Outreach & Missions', description: 'Serving neighborhoods across Accra with food, care, and practical help.', image_url: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=500&q=80' },
  { id: 3, title: 'Counseling & Care', description: "One-on-one time with our pastoral team, in confidence, whenever it's needed.", image_url: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=500&q=80' },
  { id: 4, title: 'Bible Study Groups', description: 'Weekday gatherings that go deeper into scripture, together.', image_url: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=500&q=80' },
];

export const sermons = [
  { id: 1, title: 'What it means to belong before you believe', speaker: 'Pastor Mark Johnson', category: 'Sermon', duration: '32 min', image_url: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=500&q=80', published_at: '2026-08-09' },
  { id: 2, title: 'Why we built community groups around neighborhoods', speaker: 'Pastor Helen Owusu', category: 'Community', duration: '4 min read', image_url: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=500&q=80', published_at: '2026-08-06' },
  { id: 3, title: 'Inside our latest outreach across Accra', speaker: 'Pastor Alex Mensah', category: 'Outreach', duration: '3 min read', image_url: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=500&q=80', published_at: '2026-08-02' },
];

export const team = [
  { id: 1, name: 'Pastor Mark Johnson', role: 'Senior Pastor', image_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&q=80', sort_order: 1 },
  { id: 2, name: 'Pastor Helen Owusu', role: 'Worship Pastor', image_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=500&q=80', sort_order: 2 },
  { id: 3, name: 'Pastor Alex Mensah', role: 'Youth Pastor', image_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&q=80', sort_order: 3 },
  { id: 4, name: 'Elder Kwame Asante', role: 'Executive Pastor', image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=80', sort_order: 4 },
];

export const events = [
  { id: 1, title: 'Youth Night', event_date: '2026-08-21', event_time: '18:00', location: 'Main Auditorium', description: 'An evening of worship and conversation for young people.' },
  { id: 2, title: 'Community Outreach - Madina', event_date: '2026-08-23', event_time: '08:00', location: 'Madina Community Park', description: 'Food distribution and medical screening.' },
  { id: 3, title: 'Midweek Bible Study', event_date: '2026-08-26', event_time: '19:00', location: 'Fellowship Hall', description: 'Going deeper into Ephesians chapter by chapter.' },
];

export const visits = [];
export const subscribers = [];
export const contacts = [];

export function addVisit(data) { visits.push({ ...data, created_at: new Date().toISOString() }); }
export function addSubscriber(email) { subscribers.push({ email, subscribed_at: new Date().toISOString() }); }
export function addContact(data) { contacts.push({ ...data, created_at: new Date().toISOString() }); }
