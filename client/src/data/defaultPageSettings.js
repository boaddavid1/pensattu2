// defaultPageSettings.js — Default church content fallbacks for About, Home, and Contact pages

export const DEFAULT_ABOUT_SETTINGS = {
  hero_eyebrow: 'About PENSA TTU',
  hero_title: 'A church built on showing up, not showing off.',
  hero_subtitle: "Twelve years in, we're still the same church we started as — honest about scripture, serious about community, and glad you're here.",
  hero_image: '/images/pensafallback-bw.png',

  story_eyebrow: 'How we started',
  story_title: 'From a rented hall to a home for hundreds.',
  story_p1: 'In 2014, twelve people gathered in a rented community hall in East Legon with one plain conviction: church shouldn\'t feel like a performance you watch — it should feel like a family you belong to.',
  story_p2: 'That conviction hasn\'t moved, even as the numbers have. What began as folding chairs and a borrowed keyboard has grown into two Sunday services, thirty community groups, and a staff team that treats pastoral care as their actual job, not an afterthought.',
  story_p3: "We're still not interested in being the biggest church in Accra. We're interested in being a church where you're known by name before your third visit.",
  story_image: '/images/pensafallback-bw.png',
  story_btn_text: 'Meet our leadership',
  story_btn_link: '/#team',

  values_eyebrow: 'What we value',
  values_title: 'Four things that shape every decision.',
  values_list: [
    { ic: '📖', title: 'Scripture Over Trends', text: "We'd rather be biblically faithful than culturally fashionable, every time." },
    { ic: '🤝', title: 'Real Community', text: 'Faith grows in relationship, not in rows of chairs facing forward.' },
    { ic: '🌍', title: 'Outward-Facing', text: 'A church that only serves itself has stopped being the church.' },
    { ic: '🌱', title: 'Room to Grow', text: 'We expect doubt, questions, and slow growth — and make space for all three.' },
  ],

  stats_list: [
    { value: '500+', label: 'Members & regular attendees' },
    { value: '12+', label: 'Years serving Accra' },
    { value: '30+', label: 'Community groups' },
    { value: '2', label: 'Sunday services' },
  ],

  timeline_eyebrow: 'Our journey',
  timeline_title: 'Twelve years, one conviction.',
  timeline_list: [
    { year: '2014', title: 'Twelve people, one rented hall', text: 'PENSA TTU holds its first Sunday gathering in East Legon with a borrowed keyboard and folding chairs.' },
    { year: '2017', title: 'First community groups launch', text: 'Six neighborhood groups begin meeting weekly, putting relationship ahead of attendance.' },
    { year: '2020', title: 'Online service goes live', text: 'We start streaming Sunday mornings so members outside Accra could still gather with us.' },
    { year: '2023', title: 'Second Sunday service added', text: 'Growth means an earlier 9AM service alongside our original 11AM gathering.' },
    { year: '2026', title: '500+ gather with us weekly', text: 'Thirty community groups, vibrant departments and teams, and one church family still growing.' },
  ],

  beliefs_eyebrow: 'What we believe',
  beliefs_title: 'The convictions we build on.',
  beliefs_list: [
    { title: 'Scripture', text: "We hold the Bible as God's Word — trustworthy, sufficient, and the final word on how we live." },
    { title: 'Grace', text: "We believe no one earns their way to God — it's a gift, received by faith, not achievement." },
    { title: 'Community', text: 'We were never meant to walk through life alone — the church is family, not an audience.' },
  ],

  // Mission & Vision Statements
  show_mission_vision: true,
  mission_title: 'Our Mission',
  mission_text: 'To know Christ and to make Him known across our campus, nurturing spirit-filled believers who live out the gospel with integrity, excellence, and godly passion.',
  vision_title: 'Our Vision',
  vision_text: 'A vibrant campus community rooted in scripture, alive in worship, and equipped to transform our world for the glory of God.',
  motto_text: 'Youth Arise, Shine for your Light has Come!',

  // Community Photos Showcase
  show_photos: true,
  photos_eyebrow: 'Life in fellowship',
  photos_title: 'Moments from our church family',
  about_photos: [
    { src: '/images/pensa%20(1).JPG', caption: 'Sunday worship in full flow' },
    { src: '/images/pastor.JPG', caption: 'Pastoral care & fellowship' },
    { src: '/images/pensafallback-bw.png', caption: 'Community groups gathering' },
  ],

  cta_title: 'Come see it for yourself this Sunday.',
  cta_subtitle: 'Two services every Sunday at 9:00 AM & 11:00 AM. There is always a seat for you.',
  cta_btn_text: 'Plan your visit',
  cta_btn_link: '/#book',
};

export const DEFAULT_CONTACT_SETTINGS = {
  hero_eyebrow: 'Get in touch',
  hero_title: "We'd genuinely love to hear from you.",
  hero_desc: 'Questions about a service, a department or team, or just want to say hello — reach out and someone from our team will get back to you within a day.',
  hero_image: '/images/contact-hero.png',

  visit_title: 'Visit Us',
  visit_address: '12 Cantonments Road\nAccra, Ghana',
  visit_link: '#map',

  call_title: 'Call Us',
  call_hours: 'Mon–Fri, 9am–5pm',
  call_phone: '+233553070627',

  email_title: 'Email Us',
  email_note: 'We reply within 24 hours',
  email_address: 'hello@pensattu.example',

  service_title: 'Sunday Services',
  service_times: '9:00 AM & 11:00 AM\nIn person & online',
  service_link: '/#book',

  form_eyebrow: 'Send a message',
  form_title: 'How can we help?',

  faqs_list: [
    { q: 'What should I wear?', a: 'Whatever you\'re comfortable in. You\'ll see everything from suits to jeans — there\'s no dress code here.' },
    { q: 'Is there something for my kids?', a: 'Yes — our Kids Department runs age-appropriate programming during both Sunday services, with trained volunteers and a secure check-in system.' },
    { q: 'Where do I park?', a: 'Free on-site parking is available, with overflow parking and directions posted on Sunday mornings.' },
    { q: 'Can I watch online if I can\'t make it in person?', a: 'Absolutely — both services stream live, and every message is archived on our Sermons page afterward.' },
    { q: 'How do I join a community group?', a: 'Fill out the form above and select "Joining a community group" — our Community Groups Lead will reach out to match you with one nearby.' },
  ],
};

export const DEFAULT_HOME_SETTINGS = {
  story_eyebrow: 'Our story',
  story_title: 'Built by a small group who kept showing up.',
  story_p1: 'The Pentecost Students and Associates (PENSA), the student wing of the Church of Pentecost worldwide, began over forty (50) years ago with a few dedicated students in tertiary institutions across Ghana. Over the years, it has grown into a vibrant and impactful movement, drawing young men and women to the saving grace of our Lord Jesus Christ.',
  story_p2: 'At PENSA TTU – Takoradi Technical University, this vision continues to thrive as a dynamic fellowship committed to spiritual growth, discipleship, and evangelism on campus. The fellowship serves as a strong platform for students to deepen their relationship with God, build Christ-centered character, and influence their academic and social environments with godly values.',
  story_btn_text: 'read more',
  story_btn_link: '/contact',
  story_video_url: '/videos/story.mp4',
  story_poster_url: '/images/pensafallback-bw.png',

  why_eyebrow: 'Why PENSA TTU',
  why_title: 'Three reasons this becomes home.',
  why_desc: 'We are not trying to be the biggest church in Accra — just a place where people are known, the teaching is honest, and there is always a seat for one more.',
  why_image_tall: '/images/pensa%20(1).JPG',
  why_image_short: '/images/pastor.JPG',
  why_reasons: [
    { num: '01', title: 'Sunday Worship', text: 'Two services, 9AM and 11AM, with live music and teaching that is straight from scripture.' },
    { num: '02', title: 'Community Groups', text: 'Small groups meeting weekly across Accra — real conversation, real accountability.' },
    { num: '03', title: 'Youth & Kids Department', text: 'Age-appropriate teaching and a safe, joyful space for the next generation.' },
  ],
};
