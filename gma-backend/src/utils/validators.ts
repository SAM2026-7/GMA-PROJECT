import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const RegisterSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required').max(100),
  phone: z.string().max(20).optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  date_of_birth: z.string().optional(),
  address: z.string().max(500).optional(),
  church_branch: z.string().max(100).optional(),
  church_unit: z.string().max(100).optional(),
  emergency_contact_name: z.string().max(100).optional(),
  emergency_contact_phone: z.string().max(20).optional(),
  preferred_contact: z.enum(['phone', 'email', 'whatsapp']).optional(),
});

export const UpdateMemberSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  phone: z.string().max(20).optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  date_of_birth: z.string().optional(),
  address: z.string().max(500).optional(),
  profile_photo: z.string().max(500).optional(),
  membership_status: z.enum(['active', 'inactive', 'suspended', 'transferred']).optional(),
  church_branch: z.string().max(100).optional(),
  church_unit: z.string().max(100).optional(),
  emergency_contact_name: z.string().max(100).optional(),
  emergency_contact_phone: z.string().max(20).optional(),
  preferred_contact: z.enum(['phone', 'email', 'whatsapp']).optional(),
  bio: z.string().max(1000).optional(),
});

export const CreateBookingSchema = z.object({
  member_id: z.number().optional(),
  visitor_name: z.string().max(100).optional(),
  visitor_phone: z.string().max(20).optional(),
  visitor_email: z.string().email().optional(),
  service_type: z.enum(['Counseling', 'Healing', 'Prayer', 'Marriage Counseling', 'Family Counseling', 'Youth Counseling', 'Pastoral Consultation', 'Follow-up', 'Crisis Support', 'Spiritual Guidance']),
  session_type: z.string().max(100).optional(),
  preferred_date: z.string().min(1, 'Date is required'),
  preferred_time: z.string().max(20).optional(),
  meeting_type: z.enum(['Physical', 'Online', 'Phone Call']).default('Physical'),
  reason: z.string().max(2000).optional(),
  preferred_contact: z.enum(['phone', 'email', 'whatsapp']).default('phone'),
});

export const UpdateBookingSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'rescheduled', 'completed', 'cancelled', 'no_show']).optional(),
  assigned_to: z.number().optional(),
  notes: z.string().max(2000).optional(),
  preferred_date: z.string().optional(),
  preferred_time: z.string().optional(),
});

export const CreateCaseSchema = z.object({
  member_id: z.number().min(1, 'Member ID is required'),
  category: z.enum(['Counseling', 'Healing', 'Prayer', 'Marriage', 'Family', 'Youth', 'Follow-up', 'Crisis', 'General']),
  title: z.string().max(200).optional(),
  assigned_counselor: z.number().optional(),
  priority: z.enum(['normal', 'medium', 'high', 'urgent']).default('normal'),
  description: z.string().max(5000).optional(),
});

export const UpdateCaseSchema = z.object({
  assigned_counselor: z.number().optional(),
  priority: z.enum(['normal', 'medium', 'high', 'urgent']).optional(),
  status: z.enum(['open', 'in_progress', 'on_hold', 'resolved', 'closed', 'referred']).optional(),
  outcome: z.string().max(2000).optional(),
});

export const CreateSessionSchema = z.object({
  case_id: z.number().optional(),
  booking_id: z.number().optional(),
  member_id: z.number().min(1),
  session_type: z.string().min(1),
  session_date: z.string().min(1),
  duration_minutes: z.number().optional(),
  summary: z.string().max(5000).optional(),
  notes: z.string().max(5000).optional(),
  prayer_requested: z.string().max(2000).optional(),
  follow_up_required: z.boolean().default(false),
  next_appointment: z.string().optional(),
  referral_required: z.boolean().default(false),
  referral_to: z.string().max(200).optional(),
  case_status: z.string().optional(),
  attendance: z.enum(['attended', 'missed', 'cancelled']).default('attended'),
});

export const SendMessageSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(5000),
  message_type: z.enum(['text', 'image', 'voice', 'file']).default('text'),
  attachment_url: z.string().max(500).optional(),
});

export const CreatePrayerRequestSchema = z.object({
  member_id: z.number().optional(),
  visitor_name: z.string().max(100).optional(),
  category: z.enum(['Family', 'Career', 'Health', 'Financial', 'Spiritual Growth', 'Marriage', 'Education', 'Ministry', 'Other']),
  text: z.string().min(1, 'Prayer request is required').max(5000),
  urgency: z.enum(['normal', 'high', 'urgent']).default('normal'),
  visibility: z.enum(['private', 'public']).default('private'),
  preferred_contact: z.enum(['phone', 'email', 'whatsapp']).optional(),
});

export const UpdatePrayerRequestSchema = z.object({
  status: z.enum(['received', 'assigned', 'being_prayed', 'follow_up', 'answered', 'closed']).optional(),
  assigned_team: z.string().max(100).optional(),
  notes: z.string().max(2000).optional(),
  answered: z.boolean().optional(),
});

export const CreateFollowupSchema = z.object({
  member_id: z.number().min(1),
  case_id: z.number().optional(),
  booking_id: z.number().optional(),
  assigned_staff: z.number().optional(),
  followup_type: z.enum(['call', 'visit', 'session', 'message', 'check_in']),
  title: z.string().max(200).optional(),
  notes: z.string().max(2000).optional(),
  due_date: z.string().min(1),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
});

export const UpdateFollowupSchema = z.object({
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled', 'overdue']).optional(),
  notes: z.string().max(2000).optional(),
  next_followup_date: z.string().optional(),
});

export const CreateEventSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  date: z.string().min(1),
  time: z.string().max(20).optional(),
  location: z.string().max(200).optional(),
  category: z.enum(['service', 'conference', 'seminar', 'special', 'outreach', 'youth', 'other']).default('service'),
  is_recurring: z.boolean().default(false),
  registration_required: z.boolean().default(false),
  max_attendees: z.number().optional(),
});

export const CreateSermonSchema = z.object({
  title: z.string().min(1).max(200),
  speaker: z.string().min(1).max(100),
  date: z.string().min(1),
  duration: z.string().max(20).optional(),
  bible_reference: z.string().max(100).optional(),
  category: z.string().max(50).optional(),
  description: z.string().max(2000).optional(),
  has_audio: z.boolean().default(false),
  has_video: z.boolean().default(false),
  audio_url: z.string().max(500).optional(),
  video_url: z.string().max(500).optional(),
});

export const CreateTestimonySchema = z.object({
  name: z.string().min(1).max(100),
  category: z.enum(['Healing', 'Salvation', 'Family', 'Financial', 'Career', 'Prayer Answered', 'Spiritual Growth']),
  text: z.string().min(1).max(5000),
  photo_url: z.string().max(500).optional(),
});

export const CreateProjectSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  target_amount: z.number().min(0).default(0),
  category: z.string().max(100).optional(),
});

export const CreateAnnouncementSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(5000),
  target_audience: z.enum(['all', 'members', 'staff', 'pastors']).default('all'),
  status: z.enum(['active', 'draft', 'expired']).default('active'),
  expires_at: z.string().optional(),
});

export const CreateStaffSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1).max(100),
  role: z.enum(['pastor', 'counselor', 'prayer_coordinator', 'healing_minister', 'followup_officer']),
  position: z.string().min(1).max(100),
  department: z.string().min(1).max(100),
  specialization: z.string().max(200).optional(),
  bio: z.string().max(1000).optional(),
});

export const SiteSettingsSchema = z.record(z.string(), z.string());

export const PaginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(200).default(20),
  search: z.string().optional(),
  status: z.string().optional(),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type CreateBookingInput = z.infer<typeof CreateBookingSchema>;
export type UpdateBookingInput = z.infer<typeof UpdateBookingSchema>;
export type CreateCaseInput = z.infer<typeof CreateCaseSchema>;
export type UpdateCaseInput = z.infer<typeof UpdateCaseSchema>;
export type CreateSessionInput = z.infer<typeof CreateSessionSchema>;
export type SendMessageInput = z.infer<typeof SendMessageSchema>;
export type CreatePrayerRequestInput = z.infer<typeof CreatePrayerRequestSchema>;
export type CreateFollowupInput = z.infer<typeof CreateFollowupSchema>;
export type CreateEventInput = z.infer<typeof CreateEventSchema>;
export type CreateSermonInput = z.infer<typeof CreateSermonSchema>;
