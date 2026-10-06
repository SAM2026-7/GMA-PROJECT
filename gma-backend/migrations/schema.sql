CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  name TEXT NOT NULL,
  is_active INTEGER DEFAULT 1,
  last_login TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL,
  member_id TEXT UNIQUE NOT NULL,
  phone TEXT,
  gender TEXT,
  date_of_birth TEXT,
  address TEXT,
  profile_photo TEXT,
  membership_status TEXT DEFAULT 'active',
  date_joined TEXT,
  church_branch TEXT DEFAULT 'City Complex',
  church_unit TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  preferred_contact TEXT DEFAULT 'phone',
  bio TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS staff (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL,
  staff_id TEXT UNIQUE NOT NULL,
  position TEXT NOT NULL,
  department TEXT NOT NULL,
  specialization TEXT,
  bio TEXT,
  availability TEXT DEFAULT 'available',
  max_daily_sessions INTEGER DEFAULT 5,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id TEXT UNIQUE NOT NULL,
  member_id INTEGER,
  visitor_name TEXT,
  visitor_phone TEXT,
  visitor_email TEXT,
  service_type TEXT NOT NULL,
  session_type TEXT,
  preferred_date TEXT NOT NULL,
  preferred_time TEXT,
  meeting_type TEXT DEFAULT 'Physical',
  reason TEXT,
  preferred_contact TEXT DEFAULT 'phone',
  status TEXT DEFAULT 'pending',
  assigned_to INTEGER,
  case_id INTEGER,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE SET NULL,
  FOREIGN KEY (assigned_to) REFERENCES staff(id) ON DELETE SET NULL,
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS cases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_id TEXT UNIQUE NOT NULL,
  member_id INTEGER NOT NULL,
  category TEXT NOT NULL,
  title TEXT,
  assigned_counselor INTEGER,
  priority TEXT DEFAULT 'normal',
  status TEXT DEFAULT 'open',
  description TEXT,
  outcome TEXT,
  date_opened TEXT NOT NULL,
  date_closed TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_counselor) REFERENCES staff(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS session_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT UNIQUE NOT NULL,
  case_id INTEGER,
  booking_id INTEGER,
  counselor_id INTEGER NOT NULL,
  member_id INTEGER NOT NULL,
  session_type TEXT NOT NULL,
  session_date TEXT NOT NULL,
  duration_minutes INTEGER,
  summary TEXT,
  notes TEXT,
  prayer_requested TEXT,
  follow_up_required INTEGER DEFAULT 0,
  next_appointment TEXT,
  referral_required INTEGER DEFAULT 0,
  referral_to TEXT,
  case_status TEXT,
  attendance TEXT DEFAULT 'attended',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE SET NULL,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
  FOREIGN KEY (counselor_id) REFERENCES staff(id) ON DELETE CASCADE,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS chat_conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id TEXT UNIQUE NOT NULL,
  member_id INTEGER NOT NULL,
  counselor_id INTEGER,
  case_id INTEGER,
  category TEXT DEFAULT 'general',
  status TEXT DEFAULT 'active',
  last_message TEXT,
  last_message_at TEXT,
  member_unread INTEGER DEFAULT 0,
  counselor_unread INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
  FOREIGN KEY (counselor_id) REFERENCES staff(id) ON DELETE SET NULL,
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id INTEGER NOT NULL,
  sender_id INTEGER NOT NULL,
  sender_type TEXT NOT NULL,
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  attachment_url TEXT,
  is_read INTEGER DEFAULT 0,
  read_at TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS prayer_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  request_id TEXT UNIQUE NOT NULL,
  member_id INTEGER,
  visitor_name TEXT,
  category TEXT NOT NULL,
  text TEXT NOT NULL,
  urgency TEXT DEFAULT 'normal',
  visibility TEXT DEFAULT 'private',
  status TEXT DEFAULT 'received',
  assigned_team TEXT,
  prayed_count INTEGER DEFAULT 0,
  follow_up_date TEXT,
  answered INTEGER DEFAULT 0,
  answered_date TEXT,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS followups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  followup_id TEXT UNIQUE NOT NULL,
  member_id INTEGER NOT NULL,
  case_id INTEGER,
  booking_id INTEGER,
  assigned_staff INTEGER,
  followup_type TEXT NOT NULL,
  title TEXT,
  notes TEXT,
  due_date TEXT NOT NULL,
  priority TEXT DEFAULT 'normal',
  status TEXT DEFAULT 'pending',
  completed_at TEXT,
  next_followup_date TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE SET NULL,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
  FOREIGN KEY (assigned_staff) REFERENCES staff(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data TEXT,
  is_read INTEGER DEFAULT 0,
  read_at TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  user_name TEXT,
  user_role TEXT,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  details TEXT,
  ip_address TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  date TEXT NOT NULL,
  time TEXT,
  location TEXT,
  category TEXT DEFAULT 'service',
  start_date TEXT,
  end_date TEXT,
  start_time TEXT,
  end_time TEXT,
  image_url TEXT,
  is_recurring INTEGER DEFAULT 0,
  recurrence_pattern TEXT,
  registration_required INTEGER DEFAULT 0,
  max_attendees INTEGER,
  status TEXT DEFAULT 'upcoming',
  created_by INTEGER,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sermons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  speaker TEXT DEFAULT 'Guest Speaker',
  date TEXT NOT NULL,
  duration TEXT,
  bible_reference TEXT,
  category TEXT,
  description TEXT,
  has_audio INTEGER DEFAULT 0,
  has_video INTEGER DEFAULT 0,
  audio_url TEXT,
  video_url TEXT,
  scripture_reference TEXT,
  notes_url TEXT,
  thumbnail_url TEXT,
  duration_minutes INTEGER,
  series_name TEXT,
  series_order INTEGER,
  status TEXT DEFAULT 'published',
  published_at TEXT,
  created_by INTEGER,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS event_registrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL,
  member_id INTEGER,
  status TEXT DEFAULT 'confirmed',
  registered_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS testimonies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  member_id INTEGER,
  name TEXT NOT NULL,
  author_name TEXT,
  title TEXT,
  content TEXT,
  category TEXT NOT NULL,
  text TEXT NOT NULL,
  photo_url TEXT,
  status TEXT DEFAULT 'pending',
  is_approved INTEGER DEFAULT 0,
  is_published INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  target_amount INTEGER DEFAULT 0,
  raised_amount INTEGER DEFAULT 0,
  current_amount INTEGER DEFAULT 0,
  category TEXT,
  status TEXT DEFAULT 'active',
  start_date TEXT,
  end_date TEXT,
  image_url TEXT,
  created_by INTEGER,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS announcements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  target_audience TEXT DEFAULT 'all',
  category TEXT DEFAULT 'general',
  priority TEXT DEFAULT 'normal',
  start_date TEXT,
  end_date TEXT,
  image_url TEXT,
  status TEXT DEFAULT 'active',
  expires_at TEXT,
  created_by INTEGER,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  page_id INTEGER NOT NULL,
  section_key TEXT NOT NULL,
  title TEXT,
  content TEXT,
  image_url TEXT,
  extra_data TEXT,
  sort_order INTEGER DEFAULT 0,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE,
  UNIQUE(page_id, section_key)
);

CREATE TABLE IF NOT EXISTS programs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  day_name TEXT NOT NULL,
  day_of_week INTEGER NOT NULL,
  time_text TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS site_settings (
  setting_key TEXT PRIMARY KEY,
  setting_value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_bookings_member ON bookings(member_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(preferred_date);
CREATE INDEX IF NOT EXISTS idx_bookings_assigned ON bookings(assigned_to);
CREATE INDEX IF NOT EXISTS idx_cases_member ON cases(member_id);
CREATE INDEX IF NOT EXISTS idx_cases_counselor ON cases(assigned_counselor);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_sessions_case ON session_records(case_id);
CREATE INDEX IF NOT EXISTS idx_sessions_counselor ON session_records(counselor_id);
CREATE INDEX IF NOT EXISTS idx_sessions_member ON session_records(member_id);
CREATE INDEX IF NOT EXISTS idx_chat_conv_member ON chat_conversations(member_id);
CREATE INDEX IF NOT EXISTS idx_chat_conv_counselor ON chat_conversations(counselor_id);
CREATE INDEX IF NOT EXISTS idx_chat_msg_conv ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_prayer_member ON prayer_requests(member_id);
CREATE INDEX IF NOT EXISTS idx_prayer_status ON prayer_requests(status);
CREATE INDEX IF NOT EXISTS idx_followup_member ON followups(member_id);
CREATE INDEX IF NOT EXISTS idx_followup_staff ON followups(assigned_staff);
CREATE INDEX IF NOT EXISTS idx_followup_status ON followups(status);
CREATE INDEX IF NOT EXISTS idx_followup_due ON followups(due_date);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);
CREATE TABLE IF NOT EXISTS submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  program TEXT NOT NULL,
  preferred_date TEXT NOT NULL,
  message TEXT,
  type TEXT DEFAULT 'general',
  email TEXT,
  subject TEXT,
  category TEXT,
  status TEXT DEFAULT 'new',
  submitted_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS donations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reference TEXT UNIQUE NOT NULL,
  member_id INTEGER,
  donor_name TEXT NOT NULL,
  donor_email TEXT,
  donor_phone TEXT,
  category TEXT NOT NULL,
  amount REAL NOT NULL,
  method TEXT NOT NULL,
  currency TEXT DEFAULT 'NGN',
  reference_note TEXT,
  notes TEXT,
  status TEXT DEFAULT 'recorded',
  pledged INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_donations_member ON donations(member_id);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_created ON donations(created_at);

CREATE INDEX IF NOT EXISTS idx_members_user ON members(user_id);
CREATE INDEX IF NOT EXISTS idx_members_status ON members(membership_status);
CREATE INDEX IF NOT EXISTS idx_staff_user ON staff(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
