-- PENSA TTU seed data.
-- Inserts reference rows into the tables defined in schema.sql (which mirror
-- server/syncSchema.js). Column names match what the Express API reads/writes.
-- Replace Unsplash placeholder URLs with your own photos for production.

USE grace_harbor;

-- Core values (shown on the homepage as "ministries")
INSERT INTO core_values (title, description, icon, image_url, display_order, is_active) VALUES
('Worship & Music', 'Musicians, singers and sound volunteers shaping every Sunday''s atmosphere.', 'music', 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&q=80', 1, TRUE),
('Outreach & Missions', 'Serving neighborhoods across Accra with food, care, and practical help.', 'heart', 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=500&q=80', 2, TRUE),
('Counseling & Care', 'One-on-one time with our pastoral team, in confidence, whenever it''s needed.', 'users', 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=500&q=80', 3, TRUE),
('Bible Study Groups', 'Weekday gatherings that go deeper into scripture, together.', 'book', 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=500&q=80', 4, TRUE);

-- Sermons / messages
INSERT INTO sermons (title, speaker, category, description, audio_url, image_url, date_preached, is_active) VALUES
('What it means to belong before you believe', 'Pastor Mark Johnson', 'Sermon', 'A look at belonging as the doorway to belief.', NULL, 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=500&q=80', '2026-08-09', TRUE),
('Why we built community groups around neighborhoods', 'Pastor Helen Owusu', 'Community', 'How neighborhood groups make community accessible.', NULL, 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=500&q=80', '2026-08-06', TRUE),
('Inside our latest outreach across Accra', 'Pastor Alex Mensah', 'Outreach', 'A recap of our recent city-wide outreach.', NULL, 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=500&q=80', '2026-08-02', TRUE);

-- Leadership team
INSERT INTO leadership (name, role, category, academic_year, programme, hall, previous_portfolio, description, image_url, display_order, is_active) VALUES
('Pastor Mark Johnson', 'Senior Pastor', 'Executive', '2025/2026', 'Theology', 'Off-Campus', NULL, 'Lead pastor overseeing the ministry.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&q=80', 1, TRUE),
('Pastor Helen Owusu', 'Worship Pastor', 'Executive', '2025/2026', 'Music', 'Off-Campus', NULL, 'Leads worship and the music ministry.', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=500&q=80', 2, TRUE),
('Pastor Alex Mensah', 'Youth Pastor', 'Executive', '2025/2026', 'Youth Ministry', 'Off-Campus', NULL, 'Shepherds the youth and campus outreach.', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&q=80', 3, TRUE),
('Elder Kwame Asante', 'Executive Pastor', 'Executive', '2025/2026', 'Administration', 'Off-Campus', NULL, 'Oversees operations and administration.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=80', 4, TRUE);

-- Events
INSERT INTO events (title, event_date, event_time, location, description) VALUES
('Youth Night', '2026-08-21', '18:00', 'Main Auditorium', 'An evening of worship and conversation for young people.'),
('Community Outreach - Madina', '2026-08-23', '08:00', 'Madina Community Park', 'Food distribution and medical screening.'),
('Midweek Bible Study', '2026-08-26', '19:00', 'Fellowship Hall', 'Going deeper into Ephesians chapter by chapter.');

-- Super admin (matches README credentials: admin@pensattu.org / PensaAdmin2026!)
-- bcrypt hash generated for "PensaAdmin2026!" (cost 10, $2b$ prefix supported by bcryptjs).
INSERT INTO admin_users (username, full_name, email, password, role) VALUES
('admin', 'Super Admin', 'admin@pensattu.org', '$2b$10$2ajoP6xnnzVfP6w5NG7B6eVl6g92h70fTAk8pwiceC4ziPS./nlnu', 'superadmin')
ON DUPLICATE KEY UPDATE
  password = VALUES(password),
  role = VALUES(role);

-- Announcements (news without category 'Notice')
INSERT INTO news (title, content, excerpt, category) VALUES
('New Sunday service schedule', 'From September, our second service starts at 11:30 AM to give more room for community time between gatherings.', 'Second service moves to 11:30 AM.', 'Announcement'),
('Community outreach this Saturday', 'We are meeting at the church parking lot at 8:00 AM to distribute supplies in nearby neighborhoods. Everyone is welcome.', 'Saturday outreach, 8 AM.', 'Announcement'),
('Youth conference registration open', 'PENSA Youth 2026 is happening in October. Early registration is open until the end of the month.', 'Register now for PENSA Youth 2026.', 'Announcement'),
('Welcome lunch for first-time guests', 'If this is your first month with us, join the pastors for lunch after second service this Sunday.', 'Lunch for first-time guests.', 'Announcement');

-- Notices (news with category 'Notice' — filtered by /api/notices)
INSERT INTO news (title, content, excerpt, category) VALUES
('Office hours update', 'The church office is open Tuesday through Friday, 9:00 AM to 4:00 PM. Appointments outside these hours are available on request.', 'Office hours: Tue–Fri, 9–4.', 'Notice'),
('Serving team recruitment', 'We are looking for more volunteers in ushering, hospitality, and media for the next quarter. Speak to a team lead this Sunday.', 'Volunteers needed for next quarter.', 'Notice'),
('Parking on event days', 'For larger events, please use the secondary lot behind the building and arrive a few minutes early.', 'Use the secondary lot for big events.', 'Notice'),
('Building maintenance weekend', 'The church building will be closed for deep cleaning on the last Saturday of the month. Online prayer will continue as usual.', 'Closed for cleaning last Saturday.', 'Notice');

-- Gallery albums
INSERT INTO albums (name, description, cover_image) VALUES
('Sunday Worship', 'Moments from our Sunday services.', 'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=500&q=80'),
('Community Life', 'Small groups and gatherings.', 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=500&q=80'),
('Outreach', 'Serving our city.', 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=500&q=80'),
('Youth & Kids', 'The next generation.', 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=500&q=80');

-- Gallery photos (album_id references the albums above, inserted in order 1..4)
INSERT INTO gallery (album_id, title, category, description, image_url) VALUES
(1, 'Hands raised in worship', 'Worship', 'Sunday morning, 11AM', 'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=600&q=80'),
(1, 'Sanctuary interior', 'Worship', 'Our sanctuary', 'https://images.unsplash.com/photo-1477414348463-c0eb7f1359b6?w=600&q=80'),
(1, 'Worship band', 'Worship', 'Music ministry', 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80'),
(1, 'Sunday service', 'Worship', 'A packed 9AM service', 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=600&q=80'),
(2, 'Community group meeting', 'Community', 'East Legon group night', 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=600&q=80'),
(2, 'Bible study group', 'Community', 'Midweek Bible study', 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=600&q=80'),
(2, 'Greeters welcoming visitors', 'Community', 'First-Sunday greeters', 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=600&q=80'),
(3, 'Outreach event', 'Outreach', 'Serving Osu this spring', 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&q=80'),
(3, 'Planning an outreach event', 'Outreach', 'Getting ready to serve', 'https://images.unsplash.com/photo-1478147427282-58a87a120781?w=600&q=80'),
(4, 'Youth ministry gathering', 'Youth', 'Friday youth night', 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=600&q=80'),
(4, 'Youth small group', 'Youth', 'Youth small group', 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=600&q=80');
