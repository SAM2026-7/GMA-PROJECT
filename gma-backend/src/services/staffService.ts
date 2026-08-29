import bcrypt from 'bcrypt';
import { query } from '../db/index';
import { Staff, UserRole, PaginatedResult } from '../types/index';

export interface StaffFilter {
  department?: string;
  availability?: string;
  role?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface StaffWorkload {
  id: number;
  staff_id: string;
  name: string;
  department: string;
  active_cases: number;
  pending_bookings: number;
  completed_sessions: number;
}

export async function createStaff(
  userData: { email: string; password: string; name: string; role: UserRole },
  staffData: {
    position: string;
    department: string;
    specialization?: string;
    bio?: string;
    availability?: string;
    max_daily_sessions?: number;
  }
) {
  const now = new Date().toISOString();
  const passwordHash = await bcrypt.hash(userData.password, 10);

  await query(
    'INSERT INTO users (email, password_hash, role, name, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, 1, ?, ?)',
    [userData.email, passwordHash, userData.role, userData.name, now, now]
  );

  const userIdResult = await query('SELECT MAX(id) as id FROM users');
  const userId = (userIdResult[0] as any).id;

  const paddedId = String(userId).padStart(5, '0');
  const staffIdString = `STF-${paddedId}`;

  await query(
    `INSERT INTO staff (user_id, staff_id, position, department, specialization, bio, availability, max_daily_sessions, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      staffIdString,
      staffData.position,
      staffData.department,
      staffData.specialization || null,
      staffData.bio || null,
      staffData.availability || 'available',
      staffData.max_daily_sessions || 5,
      now,
      now,
    ]
  );

  const staffResult = await query('SELECT * FROM staff WHERE user_id = ?', [userId]);
  return staffResult[0];
}

export async function getStaffById(id: number) {
  const results = await query(
    `SELECT s.*, u.email, u.name, u.role, u.is_active
     FROM staff s
     JOIN users u ON s.user_id = u.id
     WHERE s.id = ?`,
    [id]
  );
  return results[0] || null;
}

export async function getStaffByUserId(userId: number) {
  const results = await query(
    `SELECT s.*, u.email, u.name, u.role, u.is_active
     FROM staff s
     JOIN users u ON s.user_id = u.id
     WHERE s.user_id = ?`,
    [userId]
  );
  return results[0] || null;
}

export async function getAllStaff(filter: StaffFilter): Promise<PaginatedResult<any>> {
  const page = filter.page || 1;
  const limit = filter.limit || 20;
  const offset = (page - 1) * limit;

  let whereClauses: string[] = [];
  let params: any[] = [];

  if (filter.department) {
    whereClauses.push('s.department = ?');
    params.push(filter.department);
  }

  if (filter.availability) {
    whereClauses.push('s.availability = ?');
    params.push(filter.availability);
  }

  if (filter.role) {
    whereClauses.push('u.role = ?');
    params.push(filter.role);
  }

  if (filter.search) {
    whereClauses.push('(u.name LIKE ? OR u.email LIKE ? OR s.position LIKE ? OR s.staff_id LIKE ?)');
    const searchPattern = `%${filter.search}%`;
    params.push(searchPattern, searchPattern, searchPattern, searchPattern);
  }

  const whereStr = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';

  const countResult = await query(
    `SELECT COUNT(*) as count FROM staff s JOIN users u ON s.user_id = u.id ${whereStr}`,
    params
  );
  const total = (countResult[0] as any).count || 0;

  const data = await query(
    `SELECT s.*, u.email, u.name, u.role, u.is_active
     FROM staff s
     JOIN users u ON s.user_id = u.id
     ${whereStr}
     ORDER BY s.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function updateStaff(
  id: number,
  data: {
    position?: string;
    department?: string;
    specialization?: string;
    bio?: string;
    availability?: string;
    max_daily_sessions?: number;
  }
) {
  const now = new Date().toISOString();
  const updates: string[] = [];
  const params: any[] = [];

  if (data.position !== undefined) {
    updates.push('position = ?');
    params.push(data.position);
  }
  if (data.department !== undefined) {
    updates.push('department = ?');
    params.push(data.department);
  }
  if (data.specialization !== undefined) {
    updates.push('specialization = ?');
    params.push(data.specialization);
  }
  if (data.bio !== undefined) {
    updates.push('bio = ?');
    params.push(data.bio);
  }
  if (data.availability !== undefined) {
    updates.push('availability = ?');
    params.push(data.availability);
  }
  if (data.max_daily_sessions !== undefined) {
    updates.push('max_daily_sessions = ?');
    params.push(data.max_daily_sessions);
  }

  if (updates.length === 0) {
    const result = await query('SELECT * FROM staff WHERE id = ?', [id]);
    return result[0] || null;
  }

  updates.push('updated_at = ?');
  params.push(now);
  params.push(id);

  await query(
    `UPDATE staff SET ${updates.join(', ')} WHERE id = ?`,
    params
  );

  const result = await query(
    `SELECT s.*, u.email, u.name, u.role, u.is_active
     FROM staff s
     JOIN users u ON s.user_id = u.id
     WHERE s.id = ?`,
    [id]
  );
  return result[0] || null;
}

export async function deleteStaff(id: number) {
  const staffResult = await query('SELECT user_id FROM staff WHERE id = ?', [id]);
  if (staffResult.length === 0) {
    return false;
  }

  const userId = (staffResult[0] as any).user_id;

  await query('DELETE FROM staff WHERE id = ?', [id]);
  await query('DELETE FROM users WHERE id = ?', [userId]);

  return true;
}

export async function getStaffAvailability(staffId: number, date: string) {
  const staffResult = await query('SELECT max_daily_sessions FROM staff WHERE id = ?', [staffId]);
  if (staffResult.length === 0) {
    return null;
  }

  const maxDailySessions = (staffResult[0] as any).max_daily_sessions;

  const sessionCount = await query(
    `SELECT COUNT(*) as count FROM session_records
     WHERE counselor_id = ? AND DATE(session_date) = ? AND attendance != 'cancelled'`,
    [staffId, date]
  );
  const bookedSessions = (sessionCount[0] as any).count || 0;

  return {
    staff_id: staffId,
    date,
    max_daily_sessions: maxDailySessions,
    booked_sessions: bookedSessions,
    available_sessions: maxDailySessions - bookedSessions,
    is_available: bookedSessions < maxDailySessions,
  };
}

export async function getStaffCases(staffId: number) {
  const cases = await query(
    `SELECT c.*, m.member_id as member_code, u.name as member_name
     FROM cases c
     JOIN members m ON c.member_id = m.id
     JOIN users u ON m.user_id = u.id
     WHERE c.assigned_counselor = ?
     ORDER BY c.created_at DESC`,
    [staffId]
  );
  return cases;
}

export async function getStaffWorkload(): Promise<StaffWorkload[]> {
  const staffList = await query(
    `SELECT s.id, s.staff_id, s.department, u.name
     FROM staff s
     JOIN users u ON s.user_id = u.id
     ORDER BY s.id`
  );

  const workload: StaffWorkload[] = [];

  for (const staff of staffList) {
    const staffId = (staff as any).id;

    const activeCases = await query(
      'SELECT COUNT(*) as count FROM cases WHERE assigned_counselor = ? AND status IN (?, ?)',
      [staffId, 'open', 'in_progress']
    );
    const activeCaseCount = (activeCases[0] as any).count || 0;

    const pendingBookings = await query(
      'SELECT COUNT(*) as count FROM bookings WHERE assigned_to = ? AND status = ?',
      [staffId, 'pending']
    );
    const pendingBookingCount = (pendingBookings[0] as any).count || 0;

    const completedSessions = await query(
      "SELECT COUNT(*) as count FROM session_records WHERE counselor_id = ? AND attendance = 'attended'",
      [staffId]
    );
    const completedSessionCount = (completedSessions[0] as any).count || 0;

    workload.push({
      id: staffId,
      staff_id: (staff as any).staff_id,
      name: (staff as any).name,
      department: (staff as any).department,
      active_cases: activeCaseCount,
      pending_bookings: pendingBookingCount,
      completed_sessions: completedSessionCount,
    });
  }

  return workload;
}
