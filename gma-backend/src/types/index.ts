import { Request } from 'express';

export type UserRole = 'super_admin' | 'admin' | 'pastor' | 'counselor' | 'prayer_coordinator' | 'healing_minister' | 'followup_officer' | 'branch_admin' | 'analytics_officer' | 'member';

export interface User {
  id: number;
  email: string;
  role: UserRole;
  name: string;
  is_active: number;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: UserRole;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export interface Member {
  id: number;
  user_id: number;
  member_id: string;
  phone?: string;
  gender?: string;
  date_of_birth?: string;
  address?: string;
  profile_photo?: string;
  membership_status: string;
  date_joined?: string;
  church_branch: string;
  church_unit?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  preferred_contact: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface Staff {
  id: number;
  user_id: number;
  staff_id: string;
  position: string;
  department: string;
  specialization?: string;
  bio?: string;
  availability: string;
  max_daily_sessions: number;
  created_at: string;
  updated_at: string;
}

export interface Donation {
  id: number;
  reference: string;
  member_id?: number;
  donor_name: string;
  donor_email?: string;
  donor_phone?: string;
  category: string;
  amount: number;
  method: string;
  currency: string;
  reference_note?: string;
  notes?: string;
  status: string;
  pledged: number;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: number;
  booking_id: string;
  member_id?: number;
  visitor_name?: string;
  visitor_phone?: string;
  visitor_email?: string;
  service_type: string;
  session_type?: string;
  preferred_date: string;
  preferred_time?: string;
  meeting_type: string;
  reason?: string;
  preferred_contact: string;
  status: string;
  assigned_to?: number;
  case_id?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Case {
  id: number;
  case_id: string;
  member_id: number;
  category: string;
  title?: string;
  assigned_counselor?: number;
  priority: string;
  status: string;
  description?: string;
  outcome?: string;
  date_opened: string;
  date_closed?: string;
  created_at: string;
  updated_at: string;
}

export interface SessionRecord {
  id: number;
  session_id: string;
  case_id?: number;
  booking_id?: number;
  counselor_id: number;
  member_id: number;
  session_type: string;
  session_date: string;
  duration_minutes?: number;
  summary?: string;
  notes?: string;
  prayer_requested?: string;
  follow_up_required: number;
  next_appointment?: string;
  referral_required: number;
  referral_to?: string;
  case_status?: string;
  attendance: string;
  created_at: string;
  updated_at: string;
}

export interface ChatConversation {
  id: number;
  conversation_id: string;
  member_id: number;
  counselor_id?: number;
  case_id?: number;
  category: string;
  status: string;
  last_message?: string;
  last_message_at?: string;
  member_unread: number;
  counselor_unread: number;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: number;
  conversation_id: number;
  sender_id: number;
  sender_type: string;
  message: string;
  message_type: string;
  attachment_url?: string;
  is_read: number;
  read_at?: string;
  created_at: string;
}

export interface PrayerRequest {
  id: number;
  request_id: string;
  member_id?: number;
  visitor_name?: string;
  category: string;
  text: string;
  urgency: string;
  visibility: string;
  status: string;
  assigned_team?: string;
  prayed_count: number;
  follow_up_date?: string;
  answered: number;
  answered_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Followup {
  id: number;
  followup_id: string;
  member_id: number;
  case_id?: number;
  booking_id?: number;
  assigned_staff?: number;
  followup_type: string;
  title?: string;
  notes?: string;
  due_date: string;
  priority: string;
  status: string;
  completed_at?: string;
  next_followup_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
  data?: string;
  is_read: number;
  read_at?: string;
  created_at: string;
}

export interface AuditLog {
  id: number;
  user_id?: number;
  user_name?: string;
  user_role?: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  details?: string;
  ip_address?: string;
  created_at: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
