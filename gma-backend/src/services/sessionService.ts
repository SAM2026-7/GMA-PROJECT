import { query } from '../db/index';
import { SessionRecord, PaginatedResult, PaginationQuery } from '../types/index';

interface SessionFilter extends PaginationQuery {
  case_id?: number;
  member_id?: number;
  counselor_id?: number;
  session_type?: string;
  start_date?: string;
  end_date?: string;
  attendance?: string;
  search?: string;
}

export async function createSession(data: {
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
  follow_up_required?: number;
  next_appointment?: string;
  referral_required?: number;
  referral_to?: string;
  case_status?: string;
  attendance?: string;
}): Promise<SessionRecord> {
  const now = new Date().toISOString();
  const maxIdResult = await query('SELECT MAX(id) as maxId FROM session_records');
  const nextId = ((maxIdResult[0] as any)?.maxId || 0) + 1;
  const sessionId = `SES-${String(nextId).padStart(5, '0')}`;

  await query(
    `INSERT INTO session_records (session_id, case_id, booking_id, counselor_id, member_id, session_type, session_date, duration_minutes, summary, notes, prayer_requested, follow_up_required, next_appointment, referral_required, referral_to, case_status, attendance, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      sessionId,
      data.case_id || null,
      data.booking_id || null,
      data.counselor_id,
      data.member_id,
      data.session_type,
      data.session_date,
      data.duration_minutes || null,
      data.summary || null,
      data.notes || null,
      data.prayer_requested || null,
      data.follow_up_required || 0,
      data.next_appointment || null,
      data.referral_required || 0,
      data.referral_to || null,
      data.case_status || null,
      data.attendance || 'present',
      now,
      now,
    ]
  );

  const results = await query('SELECT * FROM session_records WHERE session_id = ?', [sessionId]);
  return results[0] as SessionRecord;
}

export async function getSessionById(id: number): Promise<SessionRecord | undefined> {
  const results = await query(
    `SELECT sr.*, m.member_id as member_code, s.staff_id as staff_code, u.name as counselor_name
     FROM session_records sr
     LEFT JOIN members m ON sr.member_id = m.id
     LEFT JOIN staff s ON sr.counselor_id = s.id
     LEFT JOIN users u ON s.user_id = u.id
     WHERE sr.id = ?`,
    [id]
  );
  return results[0] as SessionRecord | undefined;
}

export async function getAllSessions(filter: SessionFilter): Promise<PaginatedResult<SessionRecord>> {
  const page = filter.page || 1;
  const limit = filter.limit || 20;
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const params: any[] = [];

  if (filter.case_id) {
    conditions.push('sr.case_id = ?');
    params.push(filter.case_id);
  }
  if (filter.member_id) {
    conditions.push('sr.member_id = ?');
    params.push(filter.member_id);
  }
  if (filter.counselor_id) {
    conditions.push('sr.counselor_id = ?');
    params.push(filter.counselor_id);
  }
  if (filter.session_type) {
    conditions.push('sr.session_type = ?');
    params.push(filter.session_type);
  }
  if (filter.start_date) {
    conditions.push('sr.session_date >= ?');
    params.push(filter.start_date);
  }
  if (filter.end_date) {
    conditions.push('sr.session_date <= ?');
    params.push(filter.end_date);
  }
  if (filter.attendance) {
    conditions.push('sr.attendance = ?');
    params.push(filter.attendance);
  }
  if (filter.search) {
    conditions.push('(sr.session_id LIKE ? OR sr.summary LIKE ?)');
    params.push(`%${filter.search}%`, `%${filter.search}%`);
  }

  const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

  const countResult = await query(`SELECT COUNT(*) as count FROM session_records sr ${whereClause}`, params);
  const total = (countResult[0] as any).count || 0;

  const sessions = await query(
    `SELECT sr.*, m.member_id as member_code, s.staff_id as staff_code, u.name as counselor_name, mu.name as member_name
     FROM session_records sr
     LEFT JOIN members m ON sr.member_id = m.id
     LEFT JOIN staff s ON sr.counselor_id = s.id
     LEFT JOIN users u ON s.user_id = u.id
     LEFT JOIN users mu ON m.user_id = mu.id
     ${whereClause}
     ORDER BY sr.session_date DESC, sr.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return {
    data: sessions as SessionRecord[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function updateSession(id: number, data: Partial<{
  case_id: number;
  booking_id: number;
  counselor_id: number;
  member_id: number;
  session_type: string;
  session_date: string;
  duration_minutes: number;
  summary: string;
  notes: string;
  prayer_requested: string;
  follow_up_required: number;
  next_appointment: string;
  referral_required: number;
  referral_to: string;
  case_status: string;
  attendance: string;
}>): Promise<SessionRecord> {
  const now = new Date().toISOString();
  const fields: string[] = [];
  const params: any[] = [];

  if (data.case_id !== undefined) { fields.push('case_id = ?'); params.push(data.case_id); }
  if (data.booking_id !== undefined) { fields.push('booking_id = ?'); params.push(data.booking_id); }
  if (data.counselor_id !== undefined) { fields.push('counselor_id = ?'); params.push(data.counselor_id); }
  if (data.member_id !== undefined) { fields.push('member_id = ?'); params.push(data.member_id); }
  if (data.session_type !== undefined) { fields.push('session_type = ?'); params.push(data.session_type); }
  if (data.session_date !== undefined) { fields.push('session_date = ?'); params.push(data.session_date); }
  if (data.duration_minutes !== undefined) { fields.push('duration_minutes = ?'); params.push(data.duration_minutes); }
  if (data.summary !== undefined) { fields.push('summary = ?'); params.push(data.summary); }
  if (data.notes !== undefined) { fields.push('notes = ?'); params.push(data.notes); }
  if (data.prayer_requested !== undefined) { fields.push('prayer_requested = ?'); params.push(data.prayer_requested); }
  if (data.follow_up_required !== undefined) { fields.push('follow_up_required = ?'); params.push(data.follow_up_required); }
  if (data.next_appointment !== undefined) { fields.push('next_appointment = ?'); params.push(data.next_appointment); }
  if (data.referral_required !== undefined) { fields.push('referral_required = ?'); params.push(data.referral_required); }
  if (data.referral_to !== undefined) { fields.push('referral_to = ?'); params.push(data.referral_to); }
  if (data.case_status !== undefined) { fields.push('case_status = ?'); params.push(data.case_status); }
  if (data.attendance !== undefined) { fields.push('attendance = ?'); params.push(data.attendance); }

  fields.push('updated_at = ?');
  params.push(now);
  params.push(id);

  await query(`UPDATE session_records SET ${fields.join(', ')} WHERE id = ?`, params);

  const results = await query('SELECT * FROM session_records WHERE id = ?', [id]);
  return results[0] as SessionRecord;
}

export async function deleteSession(id: number): Promise<boolean> {
  await query('DELETE FROM session_records WHERE id = ?', [id]);
  return true;
}

export async function getSessionsByCase(caseId: number): Promise<SessionRecord[]> {
  const results = await query(
    `SELECT sr.*, u.name as counselor_name, mu.name as member_name
     FROM session_records sr
     LEFT JOIN staff s ON sr.counselor_id = s.id
     LEFT JOIN users u ON s.user_id = u.id
     LEFT JOIN members m ON sr.member_id = m.id
     LEFT JOIN users mu ON m.user_id = mu.id
     WHERE sr.case_id = ?
     ORDER BY sr.session_date DESC`,
    [caseId]
  );
  return results as SessionRecord[];
}

export async function getSessionsByMember(memberId: number): Promise<SessionRecord[]> {
  const results = await query(
    `SELECT sr.*, u.name as counselor_name, mu.name as member_name
     FROM session_records sr
     LEFT JOIN staff s ON sr.counselor_id = s.id
     LEFT JOIN users u ON s.user_id = u.id
     LEFT JOIN members m ON sr.member_id = m.id
     LEFT JOIN users mu ON m.user_id = mu.id
     WHERE sr.member_id = ?
     ORDER BY sr.session_date DESC`,
    [memberId]
  );
  return results as SessionRecord[];
}

export async function getSessionsByCounselor(counselorId: number): Promise<SessionRecord[]> {
  const results = await query(
    `SELECT sr.*, u.name as counselor_name, mu.name as member_name
     FROM session_records sr
     LEFT JOIN staff s ON sr.counselor_id = s.id
     LEFT JOIN users u ON s.user_id = u.id
     LEFT JOIN members m ON sr.member_id = m.id
     LEFT JOIN users mu ON m.user_id = mu.id
     WHERE sr.counselor_id = ?
     ORDER BY sr.session_date DESC`,
    [counselorId]
  );
  return results as SessionRecord[];
}

export async function getSessionsByDate(date: string): Promise<SessionRecord[]> {
  const results = await query(
    `SELECT sr.*, u.name as counselor_name, mu.name as member_name
     FROM session_records sr
     LEFT JOIN staff s ON sr.counselor_id = s.id
     LEFT JOIN users u ON s.user_id = u.id
     LEFT JOIN members m ON sr.member_id = m.id
     LEFT JOIN users mu ON m.user_id = mu.id
     WHERE sr.session_date = ?
     ORDER BY sr.created_at ASC`,
    [date]
  );
  return results as SessionRecord[];
}

export async function getCounselorStats(counselorId: number) {
  const staffResult = await query('SELECT * FROM staff WHERE id = ?', [counselorId]);
  const staff = staffResult[0] as any;

  const completedResult = await query(
    `SELECT COUNT(*) as count FROM session_records WHERE counselor_id = ? AND attendance = 'completed'`,
    [counselorId]
  );
  const completedCount = (completedResult[0] as any).count || 0;

  const totalResult = await query(
    'SELECT COUNT(*) as count FROM session_records WHERE counselor_id = ?',
    [counselorId]
  );
  const totalCount = (totalResult[0] as any).count || 0;

  const avgDurationResult = await query(
    `SELECT AVG(duration_minutes) as avg_duration FROM session_records WHERE counselor_id = ? AND duration_minutes IS NOT NULL`,
    [counselorId]
  );
  const avgDuration = Math.round((avgDurationResult[0] as any).avg_duration || 0);

  const attendedResult = await query(
    `SELECT COUNT(*) as count FROM session_records WHERE counselor_id = ? AND attendance IN ('present', 'completed')`,
    [counselorId]
  );
  const attendedCount = (attendedResult[0] as any).count || 0;
  const attendanceRate = totalCount > 0 ? Math.round((attendedCount / totalCount) * 100) : 0;

  const sessionTypeResult = await query(
    `SELECT session_type, COUNT(*) as count FROM session_records WHERE counselor_id = ? GROUP BY session_type ORDER BY count DESC`,
    [counselorId]
  );

  return {
    counselor_id: counselorId,
    staff,
    total_sessions: totalCount,
    completed_sessions: completedCount,
    average_duration_minutes: avgDuration,
    attendance_rate: attendanceRate,
    session_types: sessionTypeResult,
  };
}
