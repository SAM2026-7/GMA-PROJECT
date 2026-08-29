import { query } from '../db/index';

export async function createMember(userId: number, data: {
  phone?: string;
  gender?: string;
  date_of_birth?: string;
  address?: string;
  profile_photo?: string;
  membership_status?: string;
  date_joined?: string;
  church_branch?: string;
  church_unit?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  preferred_contact?: string;
  bio?: string;
}) {
  const existing = await query('SELECT id FROM members WHERE user_id = ?', [userId]);
  if (existing.length > 0) {
    throw new Error('Member profile already exists for this user');
  }

  const countResult = await query('SELECT COUNT(*) as count FROM members');
  const nextNumber = (countResult[0]?.count || 0) + 1;
  const memberId = `MBR-${String(nextNumber).padStart(5, '0')}`;

  const now = new Date().toISOString();

  await query(
    `INSERT INTO members (
      user_id, member_id, phone, gender, date_of_birth, address, profile_photo,
      membership_status, date_joined, church_branch, church_unit,
      emergency_contact_name, emergency_contact_phone, preferred_contact, bio,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      memberId,
      data.phone || null,
      data.gender || null,
      data.date_of_birth || null,
      data.address || null,
      data.profile_photo || null,
      data.membership_status || 'active',
      data.date_joined || now,
      data.church_branch || 'City Complex',
      data.church_unit || null,
      data.emergency_contact_name || null,
      data.emergency_contact_phone || null,
      data.preferred_contact || 'phone',
      data.bio || null,
      now,
      now,
    ]
  );

  const member = await query('SELECT * FROM members WHERE user_id = ?', [userId]);
  return member[0];
}

export async function getMemberById(id: number) {
  const members = await query(
    `SELECT m.*, u.email, u.name, u.is_active as user_active
     FROM members m
     JOIN users u ON m.user_id = u.id
     WHERE m.id = ?`,
    [id]
  );
  return members[0] || null;
}

export async function getMemberByUserId(userId: number) {
  const members = await query(
    `SELECT m.*, u.email, u.name, u.is_active as user_active
     FROM members m
     JOIN users u ON m.user_id = u.id
     WHERE m.user_id = ?`,
    [userId]
  );
  return members[0] || null;
}

export async function getMemberByMemberId(memberId: string) {
  const members = await query(
    `SELECT m.*, u.email, u.name, u.is_active as user_active
     FROM members m
     JOIN users u ON m.user_id = u.id
     WHERE m.member_id = ?`,
    [memberId]
  );
  return members[0] || null;
}

export async function getAllMembers(filter: { status?: string; branch?: string; search?: string; page?: number; limit?: number }) {
  const page = filter.page || 1;
  const limit = filter.limit || 20;
  const offset = (page - 1) * limit;

  let where = 'WHERE 1=1';
  const params: any[] = [];

  if (filter.status) {
    where += ' AND m.membership_status = ?';
    params.push(filter.status);
  }

  if (filter.branch) {
    where += ' AND m.church_branch = ?';
    params.push(filter.branch);
  }

  if (filter.search) {
    where += ' AND (u.name LIKE ? OR u.email LIKE ? OR m.phone LIKE ? OR m.member_id LIKE ?)';
    params.push(`%${filter.search}%`, `%${filter.search}%`, `%${filter.search}%`, `%${filter.search}%`);
  }

  const countResult = await query(
    `SELECT COUNT(*) as total FROM members m JOIN users u ON m.user_id = u.id ${where}`,
    params
  );
  const total = countResult[0]?.total || 0;

  const members = await query(
    `SELECT m.*, u.email, u.name, u.is_active as user_active
     FROM members m
     JOIN users u ON m.user_id = u.id
     ${where}
     ORDER BY m.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return { members, total, page, limit };
}

export async function updateMember(id: number, data: {
  phone?: string;
  gender?: string;
  date_of_birth?: string;
  address?: string;
  profile_photo?: string;
  membership_status?: string;
  church_branch?: string;
  church_unit?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  preferred_contact?: string;
  bio?: string;
  name?: string;
  email?: string;
}) {
  const existing = await query('SELECT id, user_id FROM members WHERE id = ?', [id]);
  if (existing.length === 0) {
    throw new Error('Member not found');
  }

  const memberUpdates: string[] = [];
  const memberParams: any[] = [];

  const memberFields = [
    'phone', 'gender', 'date_of_birth', 'address', 'profile_photo',
    'membership_status', 'church_branch', 'church_unit',
    'emergency_contact_name', 'emergency_contact_phone', 'preferred_contact', 'bio',
  ] as const;

  for (const field of memberFields) {
    if (data[field] !== undefined) {
      memberUpdates.push(`${field} = ?`);
      memberParams.push(data[field]);
    }
  }

  if (memberUpdates.length > 0) {
    memberUpdates.push('updated_at = ?');
    memberParams.push(new Date().toISOString());
    memberParams.push(id);
    await query(`UPDATE members SET ${memberUpdates.join(', ')} WHERE id = ?`, memberParams);
  }

  if (data.name || data.email) {
    const userUpdates: string[] = [];
    const userParams: any[] = [];
    if (data.name) { userUpdates.push('name = ?'); userParams.push(data.name); }
    if (data.email) { userUpdates.push('email = ?'); userParams.push(data.email); }
    userParams.push(existing[0].user_id);
    await query(`UPDATE users SET ${userUpdates.join(', ')} WHERE id = ?`, userParams);
  }

  return getMemberById(id);
}

export async function deleteMember(id: number) {
  const existing = await query('SELECT id FROM members WHERE id = ?', [id]);
  if (existing.length === 0) {
    throw new Error('Member not found');
  }

  await query('DELETE FROM members WHERE id = ?', [id]);
  return { success: true };
}

export async function getMemberTimeline(memberId: number) {
  const bookings = await query(
    `SELECT 'booking' as type, booking_id as ref_id, service_type as title, preferred_date as date, status, notes, created_at
     FROM bookings WHERE member_id = ?`,
    [memberId]
  );

  const prayerRequests = await query(
    `SELECT 'prayer_request' as type, request_id as ref_id, category as title, created_at as date, status, text as notes, created_at
     FROM prayer_requests WHERE member_id = ?`,
    [memberId]
  );

  const sessions = await query(
    `SELECT 'session' as type, session_id as ref_id, session_type as title, session_date as date, attendance as status, summary as notes, created_at
     FROM session_records WHERE member_id = ?`,
    [memberId]
  );

  const followups = await query(
    `SELECT 'followup' as type, followup_id as ref_id, title, due_date as date, status, notes, created_at
     FROM followups WHERE member_id = ?`,
    [memberId]
  );

  const timeline = [...bookings, ...prayerRequests, ...sessions, ...followups];
  timeline.sort((a, b) => {
    const dateA = new Date(a.date || a.created_at).getTime();
    const dateB = new Date(b.date || b.created_at).getTime();
    return dateB - dateA;
  });

  return timeline;
}

export async function searchMembers(search: string) {
  const members = await query(
    `SELECT m.*, u.email, u.name, u.is_active as user_active
     FROM members m
     JOIN users u ON m.user_id = u.id
     WHERE u.name LIKE ? OR u.email LIKE ? OR m.phone LIKE ? OR m.member_id LIKE ?
     ORDER BY m.created_at DESC
     LIMIT 50`,
    [`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`]
  );

  return members;
}
