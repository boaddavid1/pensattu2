export const coreValues = [
  { id: 1, icon: 'fas fa-bullhorn', title: 'Evangelism', description: 'Evangelism is the Spirit-empowered presentation of Jesus Christ so that people will trust Him as Saviour and Lord.', display_order: 1, is_active: 1 },
  { id: 2, icon: 'fas fa-users', title: 'Discipleship', description: 'Teaching and training believers to be like Christ in character and to make responsible, godly choices.', display_order: 2, is_active: 1 },
  { id: 3, icon: 'fas fa-crown', title: 'Ministry Excellence', description: 'We seek to honour God by maintaining a high standard of excellence in all our ministries.', display_order: 3, is_active: 1 },
];

export const ministries = [
  {
    id: 1,
    title: 'Music & Worship Ministry',
    category: 'Worship & Creative Arts',
    meeting: 'Saturdays, 3:00 PM',
    venue: 'Main Sanctuary & Choir Hall',
    description: 'Musicians, vocalists, and choir members leading the congregation into deep, heartfelt worship and praise every Sunday and during special services.',
    full_description: 'The Music & Worship Ministry at PENSA TTU is dedicated to stewarding an atmosphere where hearts are aligned with God in reverence and praise. Through skilled musicianship, vocal harmony, and prayerful preparation, the team ushers students and worshippers into genuine spiritual encounters with Christ.',
    responsibilities: 'Leading praise and worship during all fellowship gatherings; organizing regular vocal rehearsals and band clinics; composing and arranging hymns and contemporary songs; prayerfully preparing spiritual atmosphere before services.',
    ideal_for: 'Singers, keyboardists, drummers, bassists, lead guitarists, sound volunteers, and anyone gifted with a passion for worship and musical excellence.',
    image_url: '/images/pensafallback-bw.png',
    scripture: 'Psalm 100:1-2 — "Make a joyful noise unto the Lord, all ye lands. Serve the Lord with gladness: come before his presence with singing."',
    leader_name: 'Minister Emmanuel Adjei',
    leader_role: 'Music Director & Head of Worship',
    leader_image: '/images/pensafallback-bw.png',
    leader_phone: '+233 55 307 0627',
    leader_email: 'worship@pensattu.org',
    leader_bio: 'Serving with dedication in music ministry for over 4 years, guiding vocalists and instrumentalists in Christ-centered excellence.',
    assistants: JSON.stringify([
      { id: 'ast-1-1', name: 'Sis. Abigail Mensah', role: 'Assistant Choir Director & Vocal Lead', image_url: '/images/pensafallback-bw.png', phone: '+233 24 551 2341', bio: 'Oversees vocal section arrangements and leads midweek choir warm-ups.' },
      { id: 'ast-1-2', name: 'Bro. David Osei', role: 'Band & Instrumental Coordinator', image_url: '/images/pensafallback-bw.png', phone: '+233 20 882 9102', bio: 'Coordinates keyboardists, bassists, and drummers, ensuring tight instrumental dynamics.' },
      { id: 'ast-1-3', name: 'Sis. Priscilla Quayson', role: 'Praise Team Secretary', image_url: '/images/pensafallback-bw.png', phone: '+233 50 123 7890', bio: 'Manages rehearsal schedules, song rosters, and member welfare.' }
    ]),
    activities: JSON.stringify([
      'Saturday weekly choir & band rehearsals',
      'Sunday dawn pre-service sound checks and prayer',
      'Termly Worship & Miracle Encounters',
      'Vocal training & beginner music literacy workshops'
    ]),
    display_order: 1,
    is_active: 1
  },
  {
    id: 2,
    title: 'Organizing & Ushering Ministry',
    category: 'Hospitality & Protocol',
    meeting: 'Sundays, 6:00 AM',
    venue: 'Auditorium Entrance & Welcome Lounge',
    description: 'The first smile you see at PENSA TTU. Welcoming members, coordinating seating, handling offering collections, and creating a warm, orderly environment.',
    full_description: 'The Organizing & Ushering Ministry serves as the frontline ambassadors of Christ’s love. Every visitor and regular worshipper is warmly received with grace, dignity, and prompt assistance.',
    responsibilities: 'Auditorium preparation and seating coordination; warmly welcoming first-timers and members; distributing service materials and bulletins; facilitating orderly tithes and offerings collection; protocol and guest hospitality.',
    ideal_for: 'Friendly, warm, detail-oriented, and hospitable individuals who take joy in creating welcoming spaces and serving behind the scenes.',
    image_url: '/images/pensafallback-bw.png',
    scripture: 'Psalm 84:10 — "I had rather be a doorkeeper in the house of my God, than to dwell in the tents of wickedness."',
    leader_name: 'Bro. Samuel K. Appiah',
    leader_role: 'Head of Organizing & Ushering',
    leader_image: '/images/pensafallback-bw.png',
    leader_phone: '+233 54 883 1209',
    leader_email: 'organizing@pensattu.org',
    leader_bio: 'Committed to fostering an atmosphere of order, warmth, and hospitality for every worshipper stepping onto campus.',
    assistants: JSON.stringify([
      { id: 'ast-2-1', name: 'Sis. Grace Boateng', role: 'Assistant Head Usher (Protocol & Hospitality)', image_url: '/images/pensafallback-bw.png', phone: '+233 24 119 4567', bio: 'Coordinates guest reception, pastoral protocol, and first-timer welcome packages.' },
      { id: 'ast-2-2', name: 'Bro. Michael Quaye', role: 'Auditorium Logistics & Seating Lead', image_url: '/images/pensafallback-bw.png', phone: '+233 55 901 2345', bio: 'Manages hall arrangement, aisle oversight, offering collection teams, and crowd flow management.' }
    ]),
    activities: JSON.stringify([
      'Pre-service hall setup and ventilation check',
      'First-timers reception and orientation support',
      'Coordination of university campus conferences and retreats',
      'Protocol training and customer service workshops for members'
    ]),
    display_order: 2,
    is_active: 1
  },
  {
    id: 3,
    title: 'Evangelism & Outreach Ministry',
    category: 'Outreach & Evangelism',
    meeting: 'Saturdays, 7:00 AM',
    venue: 'Campus Square & Designated Hostels',
    description: 'Taking the Gospel beyond the church walls. Spearheading campus room-to-room evangelism, outreach to secondary schools, and rural community missions.',
    full_description: 'The Evangelism & Outreach Ministry is the heartbeat of the Great Commission at PENSA TTU. With burning zeal for lost souls, the team takes the life-transforming message of Jesus Christ into student hostels, lecture halls, and neighboring villages.',
    responsibilities: 'Organizing weekly hostel and room-to-room evangelism; planning secondary school and community outreach trips; distributing Gospel tracts and Bibles; conducting structured follow-up visits with new converts; organizing evangelism rallies.',
    ideal_for: 'Passionate believers with a deep burden for the lost, soul winning, public testimony, and spiritual discipleship.',
    image_url: '/images/pensafallback-bw.png',
    scripture: 'Mark 16:15 — "Go ye into all the world, and preach the gospel to every creature."',
    leader_name: 'Elder Ebenezer Omano',
    leader_role: 'Evangelism Secretary & Mission Lead',
    leader_image: '/images/pensafallback-bw.png',
    leader_phone: '+233 55 307 0627',
    leader_email: 'evangelism@pensattu.org',
    leader_bio: 'A passionate revivalist and missionary dedicated to mobilizing students to share the Gospel fearlessly across campuses.',
    assistants: JSON.stringify([
      { id: 'ast-3-1', name: 'Bro. Joshua Darko', role: 'Assistant Evangelism Lead (Campus Outreaches)', image_url: '/images/pensafallback-bw.png', phone: '+233 24 332 1980', bio: 'Spearheads hostel blitzes, student tract distribution, and campus prayer walks.' },
      { id: 'ast-3-2', name: 'Sis. Priscilla Tetteh', role: 'Follow-Up & New Converts Coordinator', image_url: '/images/pensafallback-bw.png', phone: '+233 50 445 6789', bio: 'Coordinates one-on-one follow-up calls, discipleship pairs, and baptismal class registrations.' }
    ]),
    activities: JSON.stringify([
      'Saturday morning hostel room-to-room evangelism',
      'Mid-semester Secondary School Outreaches',
      'Annual Rural Mission Trip (Operation Paga / Takoradi suburbs)',
      'New convert follow-up breakfasts and prayer mentorship'
    ]),
    display_order: 3,
    is_active: 1
  },
  {
    id: 4,
    title: 'Prayer & Intercessory Ministry',
    category: 'Prayer & Intercession',
    meeting: 'Fridays, 8:00 PM',
    venue: 'Prayer Mountain & Main Auditorium',
    description: 'The powerhouse of the fellowship. Standing in the gap through prayer vigils, fasting, chain prayers, and seeking God’s presence for the campus and nation.',
    full_description: 'The Prayer & Intercessory Ministry fuels the spiritual engine of PENSA TTU. Dedicated men and women stand continuously on the watchtower, interceding for students, academic excellence, church leaders, and personal requests.',
    responsibilities: 'Hosting weekly all-night prayer vigils and morning devotionals; maintaining 24-hour prayer chains during examination periods; praying over student prayer requests; providing emergency intercessory support during crises.',
    ideal_for: 'Anyone with a burden to pray, spiritual sensitivity, perseverance, and a deep longing to see God move mightily on campus.',
    image_url: '/images/pensafallback-bw.png',
    scripture: '1 Thessalonians 5:17 — "Pray without ceasing."',
    leader_name: 'Bro. Caleb Asante',
    leader_role: 'Prayer Secretary & Chief Intercessor',
    leader_image: '/images/pensafallback-bw.png',
    leader_phone: '+233 24 771 9043',
    leader_email: 'prayer@pensattu.org',
    leader_bio: 'Called to intercession and prayer mobilization, mentoring students to build sustainable personal and corporate prayer altars.',
    assistants: JSON.stringify([
      { id: 'ast-4-1', name: 'Sis. Deborah Kwarteng', role: 'Assistant Prayer Lead (Vigils & Fasting)', image_url: '/images/pensafallback-bw.png', phone: '+233 55 120 4455', bio: 'Coordinates Friday night prayer outlines, fasting schedules, and campus prayer walks.' },
      { id: 'ast-4-2', name: 'Bro. Gideon Amoah', role: 'Exam Prayer Chains Coordinator', image_url: '/images/pensafallback-bw.png', phone: '+233 20 667 8901', bio: 'Manages exam intercession rotas and collects student prayer requests.' }
    ]),
    activities: JSON.stringify([
      'Friday weekly all-night prayer service',
      'Daily dawn devotions on campus (5:00 AM - 6:00 AM)',
      'Operation Paga student prayer request ministry',
      'Exam season 24-hour prayer chain coverage'
    ]),
    display_order: 4,
    is_active: 1
  },
  {
    id: 5,
    title: 'Media & Publicity Ministry',
    category: 'Media & Tech',
    meeting: 'Saturdays, 10:00 AM',
    venue: 'Media Studio & Control Booth',
    description: 'Crafting the visual and digital story of PENSA TTU through livestreaming, social media content, photography, graphic design, and video production.',
    full_description: 'The Media & Publicity Ministry uses modern technology and creative storytelling to project the light of the Gospel across YouTube, Facebook, flyers, and photography.',
    responsibilities: 'Live streaming Sunday services; capturing high-quality photography and recaps; designing flyers and bulletins; managing official social media handles.',
    ideal_for: 'Graphic designers, photographers, videographers, livestream operators, video editors, and creative writers.',
    image_url: '/images/pensafallback-bw.png',
    scripture: 'Habakkuk 2:2 — "Write the vision, and make it plain upon tables, that he may run that readeth it."',
    leader_name: 'Bro. Felix Antwi',
    leader_role: 'Head of Media & Digital Communications',
    leader_image: '/images/pensafallback-bw.png',
    leader_phone: '+233 55 882 1093',
    leader_email: 'media@pensattu.org',
    leader_bio: 'Digital creative and media strategist passionate about leveraging modern visual storytelling for Kingdom impact.',
    assistants: JSON.stringify([
      { id: 'ast-5-1', name: 'Sis. Sandra Agyei', role: 'Graphic Design & Branding Lead', image_url: '/images/pensafallback-bw.png', phone: '+233 24 990 1234', bio: 'Creates church visual branding and sermon artwork.' },
      { id: 'ast-5-2', name: 'Bro. Kelvin Arthur', role: 'Photography & Videography Lead', image_url: '/images/pensafallback-bw.png', phone: '+233 50 334 5678', bio: 'Coordinates Sunday camera operators and recap videos.' }
    ]),
    activities: JSON.stringify([
      'Sunday morning livestreaming and broadcast',
      'Event photography and live coverage',
      'Weekly sermon snippet video reels production'
    ]),
    display_order: 5,
    is_active: 1
  },
  {
    id: 6,
    title: 'Bible Studies & Discipleship Ministry',
    category: 'Care & Discipleship',
    meeting: 'Wednesdays, 5:30 PM',
    venue: 'Fellowship Classrooms & Cell Groups',
    description: 'Fostering biblical literacy and spiritual growth through structured cell group meetings, syllabus drafting, and discipleship mentoring.',
    full_description: 'The Bible Studies & Discipleship Ministry grounds students deeply in the Word of God through small-group cell studies, study guides, and intentional mentorship.',
    responsibilities: 'Drafting weekly Bible study outlines; training cell leaders; organizing academic Bible quizzes and Sword Drills; overseeing foundational discipleship classes.',
    ideal_for: 'Passionate students of Scripture, teachers, discussion facilitators, and mentors.',
    image_url: '/images/pensafallback-bw.png',
    scripture: '2 Timothy 2:15 — "Study to shew thyself approved unto God."',
    leader_name: 'Elder Enoch Frimpong',
    leader_role: 'Bible Studies Coordinator',
    leader_image: '/images/pensafallback-bw.png',
    leader_phone: '+233 24 661 2390',
    leader_email: 'biblestudy@pensattu.org',
    leader_bio: 'Devoted theologian and mentor dedicated to sound biblical teaching, apologetics, and student discipleship.',
    assistants: JSON.stringify([
      { id: 'ast-6-1', name: 'Sis. Rebecca Donkor', role: 'Assistant Coordinator (Cell Groups)', image_url: '/images/pensafallback-bw.png', phone: '+233 55 440 9182', bio: 'Supervises cell leaders across campus hostels.' },
      { id: 'ast-6-2', name: 'Bro. Jonathan Baidoo', role: 'Syllabus & Research Lead', image_url: '/images/pensafallback-bw.png', phone: '+233 20 119 8765', bio: 'Conducts theological research and compiles study notes.' }
    ]),
    activities: JSON.stringify([
      'Wednesday midweek cell group studies',
      'Monthly Cell Leaders Training fellowship',
      'Annual Bible Quiz & Sword Drill tournament'
    ]),
    display_order: 6,
    is_active: 1
  },
  {
    id: 7,
    title: 'Counseling & Welfare Ministry',
    category: 'Care & Discipleship',
    meeting: 'Tuesdays, 4:00 PM',
    venue: 'Counseling Office & Welfare Room',
    description: 'Ensuring no member walks alone. Providing compassionate pastoral care, emotional support, welfare assistance, and hospital and hostel visits.',
    full_description: 'The Counseling & Welfare Ministry offers confidential, biblically grounded counseling, welfare relief packages, academic encouragement, and sincere brotherhood.',
    responsibilities: 'Providing confidential counseling; distributing emergency relief; visiting sick members in hospitals and hostels; coordinating bereavement support.',
    ideal_for: 'Empathetic listeners, caregivers, people with discerning hearts, and welfare volunteers.',
    image_url: '/images/pensafallback-bw.png',
    scripture: 'Galatians 6:2 — "Bear ye one another\'s burdens, and so fulfil the law of Christ."',
    leader_name: 'Deaconess Sarah Owusu',
    leader_role: 'Welfare & Care Secretary',
    leader_image: '/images/pensafallback-bw.png',
    leader_phone: '+233 54 990 4123',
    leader_email: 'welfare@pensattu.org',
    leader_bio: 'Compassionate counselor committed to the emotional, spiritual, and physical well-being of all students.',
    assistants: JSON.stringify([
      { id: 'ast-7-1', name: 'Bro. Stephen Coffie', role: 'Hostel & Hospital Visitation Lead', image_url: '/images/pensafallback-bw.png', phone: '+233 24 881 2340', bio: 'Organizes weekly check-in visits to sick students.' },
      { id: 'ast-7-2', name: 'Sis. Mary Annan', role: 'Relief Distribution Coordinator', image_url: '/images/pensafallback-bw.png', phone: '+233 50 776 5432', bio: 'Manages emergency food provisions and semester welfare packs.' }
    ]),
    activities: JSON.stringify([
      'Confidential counseling appointments',
      'Hospital and hostel visitation drives',
      'Student emergency food & welfare support'
    ]),
    display_order: 7,
    is_active: 1
  },
  {
    id: 8,
    title: 'Creative Arts & Choreography Ministry',
    category: 'Worship & Creative Arts',
    meeting: 'Fridays, 4:00 PM',
    venue: 'Drama Rehearsal Room & Main Stage',
    description: 'Communicating the timeless Gospel through choreography, drama, poetry, spoken word, and creative stage performances during services and events.',
    full_description: 'The Creative Arts Ministry blends theatrical arts, choreography, poetry, and stage performances to illustrate scriptures vividly and minister to hearts.',
    responsibilities: 'Directing stage plays, sketches, and dramas; choreographing praise dances; writing and performing spoken-word poetry; costume and props management.',
    ideal_for: 'Actors, dancers, spoken-word poets, scriptwriters, costume designers, and storytellers.',
    image_url: '/images/pensafallback-bw.png',
    scripture: 'Exodus 35:35 — "Them hath he filled with wisdom of heart, to work all manner of work."',
    leader_name: 'Sis. Eunice Boadu',
    leader_role: 'Creative Arts Director',
    leader_image: '/images/pensafallback-bw.png',
    leader_phone: '+233 55 441 9081',
    leader_email: 'creativearts@pensattu.org',
    leader_bio: 'Visionary artist using choreography and theatrical drama to communicate Christ’s message.',
    assistants: JSON.stringify([
      { id: 'ast-8-1', name: 'Bro. Isaac Mensah', role: 'Drama & Scriptwriting Lead', image_url: '/images/pensafallback-bw.png', phone: '+233 24 330 9812', bio: 'Oversees script development and stage direction.' },
      { id: 'ast-8-2', name: 'Sis. Emmanuella Cobbah', role: 'Choreography Coordinator', image_url: '/images/pensafallback-bw.png', phone: '+233 50 665 4321', bio: 'Coordinates praise dance formations and flag worship.' }
    ]),
    activities: JSON.stringify([
      'Friday weekly choreography and script rehearsals',
      'Easter & Christmas stage production presentations',
      'Creative arts masterclasses and drama workshops'
    ]),
    display_order: 8,
    is_active: 1
  },
  {
    id: 9,
    title: 'Technical & Sound Engineering Ministry',
    category: 'Media & Tech',
    meeting: 'Sundays, 5:45 AM',
    venue: 'Audio Control Desk & Equipment Room',
    description: 'Powering the sound, projection, and lighting that make our worship services smooth, audible, and immersive.',
    full_description: 'The Technical & Sound Engineering Ministry provides the acoustic, electrical, and projection backbone of every PENSA TTU service.',
    responsibilities: 'Managing live audio mixers, monitors, and microphones; projecting scripture, hymns, and slides; configuring stage lighting; equipment safety.',
    ideal_for: 'Audiophiles, sound technicians, projectionists, and tech lovers.',
    image_url: '/images/pensafallback-bw.png',
    scripture: '1 Corinthians 14:40 — "Let all things be done decently and in order."',
    leader_name: 'Bro. Joseph Ansah',
    leader_role: 'Chief Sound & Technical Engineer',
    leader_image: '/images/pensafallback-bw.png',
    leader_phone: '+233 24 991 8023',
    leader_email: 'sound@pensattu.org',
    leader_bio: 'Sound technician with a deep passion for acoustic clarity, digital mixer mastery, and reliable equipment.',
    assistants: JSON.stringify([
      { id: 'ast-9-1', name: 'Bro. Daniel Nortey', role: 'Assistant Sound Engineer (Mixing)', image_url: '/images/pensafallback-bw.png', phone: '+233 55 119 8760', bio: 'Operates front-of-house audio mixing and monitors.' },
      { id: 'ast-9-2', name: 'Bro. Prince Boakye', role: 'Projection & Presentation Lead', image_url: '/images/pensafallback-bw.png', phone: '+233 20 554 3210', bio: 'Controls EasyWorship / ProPresenter hymn projections.' }
    ]),
    activities: JSON.stringify([
      'Pre-service dawn audio calibration and microphone tests',
      'Real-time sound mixing and live recording during services',
      'Technical sound engineering training for apprentices'
    ]),
    display_order: 9,
    is_active: 1
  }
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

export const notices = [
  { id: 1, date: 'Aug 12, 2026', title: 'Office hours update', excerpt: 'Updated office hours for the church office.', body: 'The church office is open Tuesday through Friday, 9:00 AM to 4:00 PM. Appointments outside these hours are available on request.', image_url: '/images/pensafallback-bw.png' },
  { id: 2, date: 'Aug 8, 2026', title: 'Serving team recruitment', excerpt: 'Volunteers needed for ushering, hospitality, and media.', body: 'We are looking for more volunteers in ushering, hospitality, and media for the next quarter. Speak to a team lead this Sunday.', image_url: '/images/pensafallback-bw.png' },
  { id: 3, date: 'Aug 1, 2026', title: 'Parking on event days', excerpt: 'Use the secondary lot for larger events.', body: 'For larger events, please use the secondary lot behind the building and arrive a few minutes early.', image_url: '/images/pensafallback-bw.png' },
  { id: 4, date: 'Jul 25, 2026', title: 'Building maintenance weekend', excerpt: 'Building closed for deep cleaning.', body: 'The church building will be closed for deep cleaning on the last Saturday of the month. Online prayer will continue as usual.', image_url: '/images/pensafallback-bw.png' },
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

export const defaultNavigation = {
  navbar: {
    logo_type: 'image',
    logo_image: '/images/pensa.jpg',
    logo_text: 'PENSA TTU',
    phone: '+233553070627',
    service_time: 'Sun 6:30am - 9:30am',
    cta_label: 'Contact us',
    cta_link: '/contact',
    cta_show: true,
    links: [
      { id: 'nav-home', label: 'Home', path: '/', is_dropdown: false },
      {
        id: 'nav-about',
        label: 'About',
        path: '/about',
        is_dropdown: true,
        children: [
          { id: 'sub-about', label: 'About Us', path: '/about' },
          { id: 'sub-dept', label: 'Departments & Teams', path: '/departments-and-teams' },
          { id: 'sub-leadership', label: 'Leadership', path: '/leadership' },
        ],
      },
      { id: 'nav-departments', label: 'Departments & Teams', path: '/departments-and-teams', is_dropdown: false },
      {
        id: 'nav-feed',
        label: 'Feed',
        path: '',
        is_dropdown: true,
        children: [
          { id: 'sub-events', label: 'Events', path: '/events' },
          { id: 'sub-news', label: 'News', path: '/notice-board' },
        ],
      },
      { id: 'nav-sermons', label: 'Sermons', path: '/sermons', is_dropdown: false },
      { id: 'nav-gallery', label: 'Gallery', path: '/gallery', is_dropdown: false },
    ],
  },
  footer: {
    brand_title: 'PENSA',
    brand_accent: 'TTU',
    brand_tagline: 'A church community in Accra built on honest worship, real friendship, and a Word that meets you where you are.',
    watermark_text: 'PENSA TTU',
    copyright_text: '© 2026 PENSA TTU. All rights reserved.',
    privacy_terms_text: 'Privacy · Terms',
    show_notifications_btn: true,
    social_links: {
      facebook: '#',
      instagram: '#',
      youtube: '#',
      twitter: '',
      tiktok: '',
    },
    contact_info: {
      address: '12 Cantonments Road, Accra, GH',
      email: 'hello@pensattu.example',
      phone: '+233553070627',
      service_time: 'Sundays, 6:30 AM - 9:30 AM',
    },
    columns: [
      {
        id: 'col-1',
        title: 'Church',
        links: [
          { id: 'c1-1', label: 'About Us', path: '/about' },
          { id: 'c1-3', label: 'Departments & Teams', path: '/departments-and-teams' },
          { id: 'c1-4', label: 'Leadership', path: '/leadership' },
          { id: 'c1-5', label: 'Sermons', path: '/sermons' },
          { id: 'c1-6', label: 'Contact', path: '/contact' },
        ],
      },
      {
        id: 'col-2',
        title: 'Departments & Teams',
        links: [
          { id: 'c2-1', label: 'Worship & Music', path: '/departments-and-teams' },
          { id: 'c2-2', label: 'Youth & Kids', path: '/departments-and-teams' },
          { id: 'c2-3', label: 'Outreach & Missions', path: '/departments-and-teams' },
          { id: 'c2-4', label: 'Bible Study & Prayer', path: '/departments-and-teams' },
        ],
      },
    ],
  },
};

