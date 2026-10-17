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
  // 1. Hero Section
  hero_eyebrow: 'A church home in Accra',
  hero_slides: [
    {
      img: '/images/slide1.webp',
      alt: 'PENSA TTU members celebrating at Supernatural Encounter',
      pre: 'Faith that gives your heart room to ',
      em: 'breathe',
      post: '.',
      desc: 'PENSA TTU is a community built around honest worship, real friendship, and a Word that meets you where you are — whether this is your first Sunday or your five hundredth.',
    },
    {
      img: '/images/wecare.png',
      alt: 'We care for you at PENSA TTU',
      pre: 'We ',
      em: 'care',
      post: ' for you.',
      desc: 'A community where everyone is welcomed, supported, and loved — because nobody should do life alone.',
    },
    {
      img: '/images/slide.png',
      alt: 'PENSA TTU community in worship',
      pre: 'Together we ',
      em: 'rise',
      post: '.',
      desc: 'A family of believers growing in faith, serving with love, and shining the light of Christ on campus and beyond.',
    },
    {
      img: '/images/slide1.png',
      alt: 'PENSA TTU gathering of students',
      pre: 'Young hearts, ',
      em: 'bold',
      post: ' faith.',
      desc: 'Empowering students to live with purpose, lead with integrity, and impact their generation for Christ.',
    },
    {
      img: '/images/slid.png',
      alt: 'PENSA TTU students united in Christ',
      pre: 'One family, ',
      em: 'one',
      post: ' mission.',
      desc: 'Bound by love and driven by purpose — together we grow, serve, and shine for Christ on campus.',
    },
  ],
  hero_btn1_text: 'About us',
  hero_btn1_link: '/about',
  hero_btn2_text: 'Explore Departments',
  hero_btn2_link: '/departments-and-teams',

  // 2. Trail Ticker
  trail_items: [
    'Sunday Worship',
    'Community Groups',
    'Departments & Teams',
    'Prayer Nights',
    'Outreach',
    'Bible Study',
  ],

  // 3. Why Section
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

  // 4. Story Section
  story_eyebrow: 'Our story',
  story_title: 'Built by a small group who kept showing up.',
  story_p1: 'The Pentecost Students and Associates (PENSA), the student wing of the Church of Pentecost worldwide, began over forty (50) years ago with a few dedicated students in tertiary institutions across Ghana. Over the years, it has grown into a vibrant and impactful movement, drawing young men and women to the saving grace of our Lord Jesus Christ.',
  story_p2: 'At PENSA TTU – Takoradi Technical University, this vision continues to thrive as a dynamic fellowship committed to spiritual growth, discipleship, and evangelism on campus. The fellowship serves as a strong platform for students to deepen their relationship with God, build Christ-centered character, and influence their academic and social environments with godly values.',
  story_btn_text: 'read more',
  story_btn_link: '/contact',
  story_video_url: '/videos/story.mp4',
  story_poster_url: '/images/pensafallback-bw.png',

  // 5. Leadership Section
  leadership_eyebrow: 'Our leadership',
  leadership_title: 'Leading with Vision, Integrity, and Purpose',

  // 6. Weekly Activities / Steps Section
  steps_eyebrow: 'weekly activities',
  steps_title: 'Our Weekly Journey of Faith and Service',
  steps_list: [
    { tag: 'mondays', title: 'DEPARTMENTAL PRAYERS', text: 'Tell us you are coming so we can save you a seat and a warm welcome.', img: '/images/pensafallback-bw.png' },
    { tag: 'wednesdays', title: 'MAKERS SERVICE', text: 'Join us at 9AM or 11AM, in person or streaming from wherever you are.', img: '/images/pensafallback-bw.png' },
    { tag: 'fridays', title: 'INTERCESSORY PRAYERS', text: 'Our greeters will meet you at the door — no dress code, no pressure.', img: '/images/pensafallback-bw.png' },
    { tag: 'sundays', title: 'SUNDAY SERVICE', text: 'Connect with a community group and start putting down roots.', img: '/images/pensafallback-bw.png' },
  ],

  // 7. Upcoming Events Feature
  events_eyebrow: 'Upcoming Events',
  events_title: "What's happening next.",
  events_more_link_text: 'More upcoming events',

  // 8. Ministries & Teams Showcase
  ministries_eyebrow: 'Get involved',
  ministries_title: 'Departments & Teams built around how you are wired.',
  ministries_btn_text: 'See all departments & teams',
  ministries_btn_link: '/departments-and-teams',

  // 9. Testimonial & Service Schedule
  testi_eyebrow: 'What our members say',
  testi_quote: '"I walked in not knowing a single person. Three months later, I had a small group, a mentor, and a church family I actually looked forward to seeing."',
  testi_author_name: 'Ama Boateng',
  testi_author_title: 'Member since 2023, East Legon',
  testi_author_img: '/images/pensafallback-bw.png',
  testi_media_img: '/images/pensafallback-bw.png',
  testi_service_time: '6:30 AM - 9:30 AM',
  testi_service_day: 'Every Sunday',
  testi_service_type: 'In person & online',

  // 10. Pulpit & Sermons
  blog_eyebrow: 'From the pulpit',
  blog_title: 'Messages & reflections from our community.',

  // 11. Newsletter Encouragement
  newsletter_title: 'Get weekly encouragement — a short note every Friday.',
  newsletter_placeholder: 'Your email address',
  newsletter_btn_text: 'Subscribe',
};
