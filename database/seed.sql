USE grace_harbor;

INSERT INTO ministries (title, description, image_url) VALUES
('Worship & Music', 'Musicians, singers and sound volunteers shaping every Sunday\'s atmosphere.', 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&q=80'),
('Outreach & Missions', 'Serving neighborhoods across Accra with food, care, and practical help.', 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=500&q=80'),
('Counseling & Care', 'One-on-one time with our pastoral team, in confidence, whenever it\'s needed.', 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=500&q=80'),
('Bible Study Groups', 'Weekday gatherings that go deeper into scripture, together.', 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=500&q=80');

INSERT INTO sermons (title, speaker, category, duration, image_url, published_at) VALUES
('What it means to belong before you believe', 'Pastor Mark Johnson', 'Sermon', '32 min', 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=500&q=80', '2026-08-09'),
('Why we built community groups around neighborhoods', 'Pastor Helen Owusu', 'Community', '4 min read', 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=500&q=80', '2026-08-06'),
('Inside our latest outreach across Accra', 'Pastor Alex Mensah', 'Outreach', '3 min read', 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=500&q=80', '2026-08-02');

INSERT INTO team (name, role, image_url, sort_order) VALUES
('Pastor Mark Johnson', 'Senior Pastor', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&q=80', 1),
('Pastor Helen Owusu', 'Worship Pastor', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=500&q=80', 2),
('Pastor Alex Mensah', 'Youth Pastor', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&q=80', 3),
('Elder Kwame Asante', 'Executive Pastor', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=80', 4);

INSERT INTO events (title, event_date, event_time, location, description) VALUES
('Youth Night', '2026-08-21', '18:00', 'Main Auditorium', 'An evening of worship and conversation for young people.'),
('Community Outreach - Madina', '2026-08-23', '08:00', 'Madina Community Park', 'Food distribution and medical screening.'),
('Midweek Bible Study', '2026-08-26', '19:00', 'Fellowship Hall', 'Going deeper into Ephesians chapter by chapter.');
