import { query, exec } from '../db/index';
import bcrypt from 'bcrypt';
import { config } from '../config/index';

const now = () => new Date().toISOString();

async function hashPw(pw: string) { return bcrypt.hash(pw, 10); }

export async function seedAll() {
  await seedUsers();
  await seedMembers();
  await seedStaff();
  await seedBookings();
  await seedCases();
  await seedSessions();
  await seedPrayerRequests();
  await seedFollowups();
  await seedEvents();
  await seedSermons();
  await seedProjects();
  await seedContent();
  console.log('All seed data inserted successfully');
}

async function seedUsers() {
  const users = [
    { email: config.adminEmail, password: config.adminPassword, role: 'admin', name: 'Super Admin' },
    { email: 'pastor.james@gmacitycomplex.org', password: 'pastor123', role: 'pastor', name: 'Pastor James Eze' },
    { email: 'pastor.ruth@gmacitycomplex.org', password: 'pastor123', role: 'prayer_coordinator', name: 'Pastor Ruth Abiodun' },
    { email: 'pastor.david@gmacitycomplex.org', password: 'pastor123', role: 'healing_minister', name: 'Pastor David Chukwuma' },
    { email: 'pastor.funke@gmacitycomplex.org', password: 'pastor123', role: 'counselor', name: 'Pastor Funke Adekunle' },
    { email: 'grace@email.com', password: 'member123', role: 'member', name: 'Grace Okonkwo' },
    { email: 'emmanuel@email.com', password: 'member123', role: 'member', name: 'Emmanuel Adeyemi' },
    { email: 'blessing@email.com', password: 'member123', role: 'member', name: 'Blessing Nwosu' },
    { email: 'samuel@email.com', password: 'member123', role: 'member', name: 'Samuel Oladipo' },
    { email: 'deborah@email.com', password: 'member123', role: 'member', name: 'Deborah Okafor' },
  ];

  for (const u of users) {
    const existing = await query('SELECT id FROM users WHERE email = ?', [u.email]);
    const hash = await hashPw(u.password);
    if (existing.length === 0) {
      await query('INSERT INTO users (email, password_hash, role, name, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, 1, ?, ?)', [u.email, hash, u.role, u.name, now(), now()]);
    } else {
      await query('UPDATE users SET password_hash = ?, role = ?, name = ?, updated_at = ? WHERE email = ?', [hash, u.role, u.name, now(), u.email]);
    }
  }
  console.log('Users seeded');
}

async function seedMembers() {
  const memberData = [
    { email: 'grace@email.com', phone: '08012345678', gender: 'female', dob: '1990-05-15', status: 'active', branch: 'City Complex', unit: 'Choir', joined: '2025-03-15' },
    { email: 'emmanuel@email.com', phone: '08098765432', gender: 'male', dob: '1988-11-22', status: 'active', branch: 'City Complex', unit: 'Ushering', joined: '2025-06-20' },
    { email: 'blessing@email.com', phone: '08155512345', gender: 'female', dob: '1995-03-08', status: 'active', branch: 'City Complex', unit: 'Prayer', joined: '2024-11-10' },
    { email: 'samuel@email.com', phone: '07033345678', gender: 'male', dob: '1992-07-19', status: 'inactive', branch: 'City Complex', unit: null, joined: '2025-01-05' },
    { email: 'deborah@email.com', phone: '09088876543', gender: 'female', dob: '1998-01-30', status: 'active', branch: 'City Complex', unit: 'Youth', joined: '2025-08-01' },
  ];

  for (let i = 0; i < memberData.length; i++) {
    const m = memberData[i];
    const user = await query('SELECT id FROM users WHERE email = ?', [m.email]);
    if (user.length === 0) continue;
    const existing = await query('SELECT id FROM members WHERE user_id = ?', [user[0].id]);
    if (existing.length === 0) {
      const memberId = 'MBR-' + String(i + 1).padStart(5, '0');
      await query('INSERT INTO members (user_id, member_id, phone, gender, date_of_birth, membership_status, date_joined, church_branch, church_unit, preferred_contact, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [user[0].id, memberId, m.phone, m.gender, m.dob, m.status, m.joined, m.branch, m.unit, 'phone', now(), now()]);
    }
  }
  console.log('Members seeded');
}

async function seedStaff() {
  const staffData = [
    { email: 'pastor.james@gmacitycomplex.org', staffId: 'STF-00001', position: 'Senior Pastor', department: 'Counseling', specialization: 'Marriage & Family', availability: 'available', maxSessions: 5 },
    { email: 'pastor.ruth@gmacitycomplex.org', staffId: 'STF-00002', position: 'Associate Pastor', department: 'Prayer', specialization: 'Intercessory Prayer', availability: 'available', maxSessions: 8 },
    { email: 'pastor.david@gmacitycomplex.org', staffId: 'STF-00003', position: 'Healing Minister', department: 'Healing', specialization: 'Spiritual & Emotional Healing', availability: 'busy', maxSessions: 4 },
    { email: 'pastor.funke@gmacitycomplex.org', staffId: 'STF-00004', position: 'Youth Pastor', department: 'Counseling', specialization: 'Youth Counseling', availability: 'available', maxSessions: 5 },
  ];

  for (const s of staffData) {
    const user = await query('SELECT id FROM users WHERE email = ?', [s.email]);
    if (user.length === 0) continue;
    const existing = await query('SELECT id FROM staff WHERE user_id = ?', [user[0].id]);
    if (existing.length === 0) {
      await query('INSERT INTO staff (user_id, staff_id, position, department, specialization, availability, max_daily_sessions, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [user[0].id, s.staffId, s.position, s.department, s.specialization, s.availability, s.maxSessions, now(), now()]);
    }
  }
  console.log('Staff seeded');
}

async function seedBookings() {
  const bookings = [
    { bookingId: 'GMA-2026-00001', visitorName: 'Grace Okonkwo', service: 'Counseling', sessionType: 'Marriage Counseling', date: '2026-09-02', time: '10:00', meetingType: 'Physical', reason: 'Pre-marital counseling', status: 'confirmed' },
    { bookingId: 'GMA-2026-00002', visitorName: 'Emmanuel Adeyemi', service: 'Prayer', sessionType: 'Prayer Session', date: '2026-08-28', time: '14:00', meetingType: 'Online', reason: 'Career breakthrough prayer', status: 'pending' },
    { bookingId: 'GMA-2026-00003', visitorName: 'Blessing Nwosu', service: 'Healing', sessionType: 'Healing Session', date: '2026-08-25', time: '11:00', meetingType: 'Physical', reason: 'Emotional healing', status: 'completed' },
    { bookingId: 'GMA-2026-00004', visitorName: 'Deborah Okafor', service: 'Counseling', sessionType: 'Family Counseling', date: '2026-09-05', time: '15:00', meetingType: 'Phone Call', reason: 'Family conflict resolution', status: 'confirmed' },
    { bookingId: 'GMA-2026-00005', visitorName: 'Anonymous Visitor', service: 'Counseling', sessionType: 'Pastoral Consultation', date: '2026-08-30', time: '09:00', meetingType: 'Physical', reason: 'Need spiritual guidance', status: 'new' },
  ];

  for (const b of bookings) {
    const existing = await query('SELECT id FROM bookings WHERE booking_id = ?', [b.bookingId]);
    if (existing.length === 0) {
      await query('INSERT INTO bookings (booking_id, visitor_name, service_type, session_type, preferred_date, preferred_time, meeting_type, reason, status, preferred_contact, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [b.bookingId, b.visitorName, b.service, b.sessionType, b.date, b.time, b.meetingType, b.reason, b.status, 'phone', now(), now()]);
    }
  }
  console.log('Bookings seeded');
}

async function seedCases() {
  const cases = [
    { caseId: 'CASE-001', memberEmail: 'grace@email.com', category: 'Marriage', title: 'Pre-marital Counseling - Grace & Partner', priority: 'normal', status: 'open', desc: 'Couple seeking pre-marital guidance.' },
    { caseId: 'CASE-002', memberEmail: 'blessing@email.com', category: 'Healing', title: 'Emotional Healing - Blessing', priority: 'normal', status: 'resolved', desc: 'Healing journey for emotional trauma.' },
    { caseId: 'CASE-003', memberEmail: 'deborah@email.com', category: 'Family', title: 'Family Counseling - Deborah', priority: 'medium', status: 'open', desc: 'Family conflict resolution.' },
  ];

  for (const c of cases) {
    const existing = await query('SELECT id FROM cases WHERE case_id = ?', [c.caseId]);
    if (existing.length > 0) continue;
    const user = await query('SELECT id FROM users WHERE email = ?', [c.memberEmail]);
    if (user.length === 0) continue;
    const member = await query('SELECT id FROM members WHERE user_id = ?', [user[0].id]);
    if (member.length === 0) continue;
    const counselor = await query('SELECT id FROM staff WHERE department = ?', ['Counseling']);
    await query('INSERT INTO cases (case_id, member_id, category, title, assigned_counselor, priority, status, description, date_opened, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [c.caseId, member[0].id, c.category, c.title, counselor.length > 0 ? counselor[0].id : null, c.priority, c.status, c.desc, '2026-07-15', now(), now()]);
  }
  console.log('Cases seeded');
}

async function seedSessions() {
  const sessions = [
    { sessionId: 'SES-001', memberEmail: 'grace@email.com', type: 'Marriage Counseling', date: '2026-08-01', duration: 60, summary: 'Initial assessment completed. Couple dynamics discussed.', followUp: 1, nextAppt: '2026-08-15' },
    { sessionId: 'SES-002', memberEmail: 'grace@email.com', type: 'Marriage Counseling', date: '2026-08-15', duration: 60, summary: 'Communication exercises assigned. Progress noted.', followUp: 1, nextAppt: '2026-09-02' },
    { sessionId: 'SES-003', memberEmail: 'blessing@email.com', type: 'Healing Session', date: '2026-08-05', duration: 45, summary: 'Inner healing prayer session. Breakthrough experienced.', followUp: 0, nextAppt: null },
    { sessionId: 'SES-004', memberEmail: 'blessing@email.com', type: 'Healing Session', date: '2026-08-12', duration: 45, summary: 'Follow-up healing session. Healing journey progressing well.', followUp: 0, nextAppt: null },
    { sessionId: 'SES-005', memberEmail: 'blessing@email.com', type: 'Healing Session', date: '2026-08-19', duration: 45, summary: 'Final healing session. Complete restoration testified.', followUp: 0, nextAppt: null },
  ];

  const counselor = await query('SELECT id FROM staff WHERE department = ?', ['Counseling']);
  const healer = await query('SELECT id FROM staff WHERE department = ?', ['Healing']);
  const counselId = counselor.length > 0 ? counselor[0].id : 1;
  const healId = healer.length > 0 ? healer[0].id : 3;

  for (const s of sessions) {
    const existing = await query('SELECT id FROM session_records WHERE session_id = ?', [s.sessionId]);
    if (existing.length > 0) continue;
    const user = await query('SELECT id FROM users WHERE email = ?', [s.memberEmail]);
    if (user.length === 0) continue;
    const member = await query('SELECT id FROM members WHERE user_id = ?', [user[0].id]);
    if (member.length === 0) continue;
    const isHealing = s.type.includes('Healing');
    await query('INSERT INTO session_records (session_id, counselor_id, member_id, session_type, session_date, duration_minutes, summary, follow_up_required, next_appointment, attendance, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [s.sessionId, isHealing ? healId : counselId, member[0].id, s.type, s.date, s.duration, s.summary, s.followUp, s.nextAppt, 'attended', now(), now()]);
  }
  console.log('Sessions seeded');
}

async function seedPrayerRequests() {
  const requests = [
    { requestId: 'PR-00251', memberEmail: 'grace@email.com', category: 'Family', text: 'Please pray for my family unity and peace in my home.', urgency: 'normal', visibility: 'public', status: 'being_prayed', team: 'Prayer Team A', prayed: 27 },
    { requestId: 'PR-00252', memberEmail: 'emmanuel@email.com', category: 'Career', text: 'Pray for a breakthrough in my job search.', urgency: 'high', visibility: 'public', status: 'received', team: null, prayed: 12 },
    { requestId: 'PR-00253', memberEmail: 'blessing@email.com', category: 'Health', text: 'Pray for my mother who is in the hospital.', urgency: 'urgent', visibility: 'public', status: 'assigned', team: 'Prayer Team B', prayed: 35 },
    { requestId: 'PR-00254', memberEmail: 'deborah@email.com', category: 'Spiritual Growth', text: 'Pray for deeper intimacy with God.', urgency: 'normal', visibility: 'private', status: 'being_prayed', team: 'Prayer Team A', prayed: 0 },
  ];

  for (const r of requests) {
    const existing = await query('SELECT id FROM prayer_requests WHERE request_id = ?', [r.requestId]);
    if (existing.length > 0) continue;
    let memberId = null;
    if (r.memberEmail) {
      const user = await query('SELECT id FROM users WHERE email = ?', [r.memberEmail]);
      if (user.length > 0) {
        const member = await query('SELECT id FROM members WHERE user_id = ?', [user[0].id]);
        if (member.length > 0) memberId = member[0].id;
      }
    }
    await query('INSERT INTO prayer_requests (request_id, member_id, category, text, urgency, visibility, status, assigned_team, prayed_count, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [r.requestId, memberId, r.category, r.text, r.urgency, r.visibility, r.status, r.team, r.prayed, now(), now()]);
  }
  console.log('Prayer requests seeded');
}

async function seedFollowups() {
  const followups = [
    { fuId: 'FU-001', memberEmail: 'grace@email.com', type: 'session', title: 'Follow-up after counseling session', dueDate: '2026-09-09', priority: 'normal', status: 'pending' },
    { fuId: 'FU-002', memberEmail: 'blessing@email.com', type: 'check_in', title: 'Post-healing check-in', dueDate: '2026-08-26', priority: 'normal', status: 'completed' },
    { fuId: 'FU-003', memberEmail: 'deborah@email.com', type: 'call', title: 'Initial follow-up call for family counseling', dueDate: '2026-08-28', priority: 'high', status: 'pending' },
  ];

  for (const f of followups) {
    const existing = await query('SELECT id FROM followups WHERE followup_id = ?', [f.fuId]);
    if (existing.length > 0) continue;
    const user = await query('SELECT id FROM users WHERE email = ?', [f.memberEmail]);
    if (user.length === 0) continue;
    const member = await query('SELECT id FROM members WHERE user_id = ?', [user[0].id]);
    if (member.length === 0) continue;
    const staff = await query('SELECT id FROM staff LIMIT 1');
    await query('INSERT INTO followups (followup_id, member_id, assigned_staff, followup_type, title, due_date, priority, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [f.fuId, member[0].id, staff.length > 0 ? staff[0].id : null, f.type, f.title, f.dueDate, f.priority, f.status, now(), now()]);
  }
  console.log('Follow-ups seeded');
}

async function seedEvents() {
  const events = [
    { title: 'Sunday Worship Service', date: '2026-08-30', time: '10:00 AM', location: 'Main Auditorium', category: 'service', recurring: 1, reg: 0, desc: 'Join us for an uplifting worship experience.' },
    { title: 'Midweek Bible Study', date: '2026-08-28', time: '5:30 PM', location: 'Main Auditorium', category: 'service', recurring: 1, reg: 0, desc: 'Deep study into the Word of God.' },
    { title: 'Youth Conference 2026', date: '2026-09-12', time: '9:00 AM', location: 'Main Auditorium', category: 'conference', recurring: 0, reg: 1, desc: 'Annual youth conference themed Arise and Shine.' },
    { title: 'Prayer & Healing Night', date: '2026-09-04', time: '6:00 PM', location: 'Main Auditorium', category: 'special', recurring: 0, reg: 0, desc: 'A special evening dedicated to prayer and healing ministry.' },
    { title: 'Marriage Enrichment Seminar', date: '2026-09-20', time: '10:00 AM', location: 'Conference Hall', category: 'seminar', recurring: 0, reg: 1, desc: 'Strengthening marriages through biblical principles.' },
    { title: 'Community Outreach', date: '2026-09-27', time: '8:00 AM', location: 'GMA Community Center', category: 'outreach', recurring: 0, reg: 1, desc: 'Reaching out to our community with love and support.' },
  ];

  for (const e of events) {
    const existing = await query('SELECT id FROM events WHERE title = ? AND date = ?', [e.title, e.date]);
    if (existing.length === 0) {
      await query('INSERT INTO events (title, description, date, time, location, category, is_recurring, registration_required, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [e.title, e.desc, e.date, e.time, e.location, e.category, e.recurring, e.reg, now(), now()]);
    }
  }
  console.log('Events seeded');
}

async function seedSermons() {
  const sermons = [
    { title: 'Walking in Divine Favor', speaker: 'Pastor James Eze', date: '2026-08-24', duration: '45 min', ref: 'Psalm 5:12', category: 'Faith', desc: 'Understanding and walking in God\'s favor.', audio: 1, video: 1 },
    { title: 'The Power of Persistent Prayer', speaker: 'Pastor Ruth Abiodun', date: '2026-08-17', duration: '38 min', ref: 'Luke 18:1-8', category: 'Prayer', desc: 'Why we should never give up in prayer.', audio: 1, video: 0 },
    { title: 'Healing Through Faith', speaker: 'Pastor David Chukwuma', date: '2026-08-10', duration: '42 min', ref: 'James 5:14-16', category: 'Healing', desc: 'The biblical foundation for divine healing.', audio: 1, video: 1 },
    { title: 'Building a Strong Family', speaker: 'Pastor James Eze', date: '2026-08-03', duration: '50 min', ref: 'Joshua 24:15', category: 'Family', desc: 'Practical steps to building a godly family.', audio: 0, video: 1 },
    { title: 'Victory Over Spiritual Warfare', speaker: 'Pastor Funke Adekunle', date: '2026-07-27', duration: '40 min', ref: 'Ephesians 6:10-18', category: 'Spiritual Growth', desc: 'Understanding and overcoming spiritual warfare.', audio: 1, video: 0 },
  ];

  for (const s of sermons) {
    const existing = await query('SELECT id FROM sermons WHERE title = ?', [s.title]);
    if (existing.length === 0) {
      await query('INSERT INTO sermons (title, speaker, date, duration, bible_reference, category, description, has_audio, has_video, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [s.title, s.speaker, s.date, s.duration, s.ref, s.category, s.desc, s.audio, s.video, now(), now()]);
    }
  }
  console.log('Sermons seeded');
}

async function seedProjects() {
  const projects = [
    { title: 'Church Building Project', target: 50000000, raised: 32500000, category: 'Building', desc: 'Building a new worship center to accommodate our growing congregation.' },
    { title: 'Community Outreach Fund', target: 5000000, raised: 3200000, category: 'Missions', desc: 'Supporting community development and charity work.' },
    { title: 'Youth Development Center', target: 20000000, raised: 8500000, category: 'Youth', desc: 'Creating a space for youth programs, training, and mentorship.' },
  ];

  for (const p of projects) {
    const existing = await query('SELECT id FROM projects WHERE title = ?', [p.title]);
    if (existing.length === 0) {
      await query('INSERT INTO projects (title, description, target_amount, raised_amount, category, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [p.title, p.desc, p.target, p.raised, p.category, 'active', now(), now()]);
    }
  }
  console.log('Projects seeded');
}

async function seedContent() {
  const pages = [
    { slug: 'home', title: 'Home' },
    { slug: 'about', title: 'About Us' },
    { slug: 'programs', title: 'Our Programs' },
    { slug: 'giving', title: 'Giving' },
    { slug: 'contact', title: 'Contact Us' },
  ];

  for (const page of pages) {
    const existing = await query('SELECT id FROM pages WHERE slug = ?', [page.slug]);
    if (existing.length === 0) {
      await query('INSERT INTO pages (slug, title, updated_at) VALUES (?, ?, ?)', [page.slug, page.title, now()]);
    }
  }

  const homePage = (await query('SELECT id FROM pages WHERE slug = ?', ['home']))[0];
  if (homePage) {
    const sections = [
      { key: 'hero_title', title: 'Welcome to GMA City Complex', content: 'A place of worship, counselling, healing and prayer.' },
      { key: 'hero_cta_primary', title: '', content: 'Book a Visit' },
      { key: 'hero_cta_secondary', title: '', content: 'Support Us' },
    ];
    for (const s of sections) {
      const exists = await query('SELECT id FROM sections WHERE page_id = ? AND section_key = ?', [homePage.id, s.key]);
      if (exists.length === 0) {
        await query('INSERT INTO sections (page_id, section_key, title, content, updated_at) VALUES (?, ?, ?, ?, ?)', [homePage.id, s.key, s.title, s.content, now()]);
      }
    }
  }

  const aboutPage = (await query('SELECT id FROM pages WHERE slug = ?', ['about']))[0];
  if (aboutPage) {
    const sections = [
      { key: 'mission', title: 'Our Mission', content: 'To reach out with love, strengthen families and walk with every believer on their spiritual journey.' },
      { key: 'vision', title: 'Our Vision', content: 'To build a vibrant community where healing, prayer and godly counsel meet real everyday needs.' },
    ];
    for (const s of sections) {
      const exists = await query('SELECT id FROM sections WHERE page_id = ? AND section_key = ?', [aboutPage.id, s.key]);
      if (exists.length === 0) {
        await query('INSERT INTO sections (page_id, section_key, title, content, updated_at) VALUES (?, ?, ?, ?, ?)', [aboutPage.id, s.key, s.title, s.content, now()]);
      }
    }
  }

  const programs = [
    { name: 'Counselling', description: 'Confidential guidance for marriages, career, family and personal growth.', icon: '&#9993;', sort: 1 },
    { name: 'Healing', description: 'Spiritual and emotional healing through faith, prayer and the Word.', icon: '&#10010;', sort: 2 },
    { name: 'Prayer', description: 'Intense times of prayer and intercession for your requests and the city.', icon: '&#10022;', sort: 3 },
  ];
  for (const p of programs) {
    const exists = await query('SELECT id FROM programs WHERE name = ?', [p.name]);
    if (exists.length === 0) {
      await query('INSERT INTO programs (name, description, icon, sort_order, updated_at) VALUES (?, ?, ?, ?, ?)', [p.name, p.description, p.icon, p.sort, now()]);
    }
  }

  const services = [
    { day: 'Sunday Service', dow: 0, time: '10:00 AM', sort: 1 },
    { day: 'Midweek Service', dow: 4, time: '5:30 PM', sort: 2 },
  ];
  for (const s of services) {
    const exists = await query('SELECT id FROM services WHERE day_name = ?', [s.day]);
    if (exists.length === 0) {
      await query('INSERT INTO services (day_name, day_of_week, time_text, sort_order, updated_at) VALUES (?, ?, ?, ?, ?)', [s.day, s.dow, s.time, s.sort, now()]);
    }
  }

  const settings: Record<string, string> = {
    site_name: 'GMA City Complex', hero_description: 'A place of worship, counselling, healing and prayer.',
    about_subtitle: 'GMA City Complex is a sanctuary dedicated to nurturing faith and restoring lives.',
    mission_title: 'Our Mission', mission_text: 'To reach out with love, strengthen families and walk with every believer on their spiritual journey.',
    vision_title: 'Our Vision', vision_text: 'To build a vibrant community where healing, prayer and godly counsel meet real everyday needs.',
    programs_subtitle: 'Choose a program and book a session with us.',
    counselling_description: 'Confidential guidance for marriages, career, family and personal growth.',
    healing_description: 'Spiritual and emotional healing through faith, prayer and the Word.',
    prayer_description: 'Intense times of prayer and intercession for your requests and the city.',
    giving_subtitle: 'Support the work of GMA City Complex through your generous giving.',
    giving_bank: 'Ecobank', giving_account: '4331097600',
    contact_phone: '08169761695', contact_email: 'info@gmacitycomplex.org',
    contact_address: 'GMA City Complex, Lagos, Nigeria', contact_whatsapp: '+2348169761695',
    footer_text: 'GMA City Complex. All rights reserved.',
  };
  for (const [key, value] of Object.entries(settings)) {
    const exists = await query('SELECT setting_key FROM site_settings WHERE setting_key = ?', [key]);
    if (exists.length === 0) {
      await query('INSERT INTO site_settings (setting_key, setting_value, updated_at) VALUES (?, ?, ?)', [key, value, now()]);
    }
  }
  console.log('Content seeded');
}
