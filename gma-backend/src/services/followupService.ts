import { query } from '../db/index';
import { Followup, PaginatedResult } from '../types/index';

interface FollowupFilter {
  status?: string;
  followup_type?: string;
  priority?: string;
  assigned_staff?: number;
  member_id?: number;
  case_id?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export async function createFollowup(data: {
  member_id: number;
  case_id?: number;
  booking_id?: number;
  assigned_staff?: number;
  followup_type: string;
  title?: string;
  notes?: string;
  due_date: string;
  priority?: string;
  next_followup_date?: string;
}): Promise<Followup> {
  const now = new Date().toISOString();
  const maxIdResult = await query('SELECT MAX(id) as id FROM followups');
  const nextId = ((maxIdResult[0] as any).id || 0) + 1;
  const followupId = `FU-${String(nextId).padStart(5, '0')}`;

  await query(
    `INSERT INTO followups (followup_id, member_id, case_id, booking_id, assigned_staff, followup_type, title, notes, due_date, priority, status, next_followup_date, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)`,
    [
      followupId,
      data.member_id,
      data.case_id || null,
      data.booking_id || null,
      data.assigned_staff || null,
      data.followup_type,
      data.title || null,
      data.notes || null,
      data.due_date,
      data.priority || 'normal',
      data.next_followup_date || null,
      now,
      now,
    ]
  );

  const result = await query('SELECT * FROM followups WHERE followup_id = ?', [followupId]);
  return result[0] as Followup;
}

export async function getFollowupById(id: number): Promise<Followup | null> {
  const results = await query(
    `SELECT f.*,
      m.member_id as member_code,
      mu.name as member_name,
      s.staff_id as staff_code,
      su.name as staff_name
     FROM followups f
     LEFT JOIN members m ON f.member_id = m.id
     LEFT JOIN users mu ON m.user_id = mu.id
     LEFT JOIN staff s ON f.assigned_staff = s.id
     LEFT JOIN users su ON s.user_id = su.id
     WHERE f.id = ?`,
    [id]
  );
  return (results[0] as Followup) || null;
}

export async function getAllFollowups(filter: FollowupFilter): Promise<PaginatedResult<Followup>> {
  const page = filter.page || 1;
  const limit = filter.limit || 20;
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const params: any[] = [];

  if (filter.status) {
    conditions.push('f.status = ?');
    params.push(filter.status);
  }
  if (filter.followup_type) {
    conditions.push('f.followup_type = ?');
    params.push(filter.followup_type);
  }
  if (filter.priority) {
    conditions.push('f.priority = ?');
    params.push(filter.priority);
  }
  if (filter.assigned_staff) {
    conditions.push('f.assigned_staff = ?');
    params.push(filter.assigned_staff);
  }
  if (filter.member_id) {
    conditions.push('f.member_id = ?');
    params.push(filter.member_id);
  }
  if (filter.case_id) {
    conditions.push('f.case_id = ?');
    params.push(filter.case_id);
  }
  if (filter.search) {
    conditions.push('(f.followup_id LIKE ? OR f.title LIKE ? OR f.notes LIKE ? OR mu.name LIKE ?)');
    const searchPattern = `%${filter.search}%`;
    params.push(searchPattern, searchPattern, searchPattern, searchPattern);
  }

  const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
  const needsJoin = filter.search;
  const memberJoin = needsJoin ? 'LEFT JOIN members m ON f.member_id = m.id LEFT JOIN users mu ON m.user_id = mu.id' : '';

  const countResult = await query(
    `SELECT COUNT(*) as count FROM followups f ${memberJoin} ${whereClause}`,
    params
  );
  const total = (countResult[0] as any).count || 0;

  const data = await query(
    `SELECT f.*,
      m.member_id as member_code,
      mu.name as member_name,
      s.staff_id as staff_code,
      su.name as staff_name
     FROM followups f
     LEFT JOIN members m ON f.member_id = m.id
     LEFT JOIN users mu ON m.user_id = mu.id
     LEFT JOIN staff s ON f.assigned_staff = s.id
     LEFT JOIN users su ON s.user_id = su.id
     ${whereClause}
     ORDER BY f.due_date ASC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return {
    data: data as Followup[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getByMember(memberId: number): Promise<Followup[]> {
  const results = await query(
    `SELECT f.*, s.staff_id as staff_code, su.name as staff_name
     FROM followups f
     LEFT JOIN staff s ON f.assigned_staff = s.id
     LEFT JOIN users su ON s.user_id = su.id
     WHERE f.member_id = ?
     ORDER BY f.due_date ASC`,
    [memberId]
  );
  return results as Followup[];
}

export async function getByCase(caseId: number): Promise<Followup[]> {
  const results = await query(
    `SELECT f.*, s.staff_id as staff_code, su.name as staff_name
     FROM followups f
     LEFT JOIN staff s ON f.assigned_staff = s.id
     LEFT JOIN users su ON s.user_id = su.id
     WHERE f.case_id = ?
     ORDER BY f.due_date ASC`,
    [caseId]
  );
  return results as Followup[];
}

export async function updateFollowup(
  id: number,
  data: {
    status?: string;
    notes?: string;
    next_followup_date?: string;
    priority?: string;
    title?: string;
    assigned_staff?: number;
    followup_type?: string;
    due_date?: string;
  }
): Promise<Followup | null> {
  const now = new Date().toISOString();
  const updates: string[] = [];
  const params: any[] = [];

  if (data.status !== undefined) {
    updates.push('status = ?');
    params.push(data.status);
  }
  if (data.notes !== undefined) {
    updates.push('notes = ?');
    params.push(data.notes);
  }
  if (data.next_followup_date !== undefined) {
    updates.push('next_followup_date = ?');
    params.push(data.next_followup_date);
  }
  if (data.priority !== undefined) {
    updates.push('priority = ?');
    params.push(data.priority);
  }
  if (data.title !== undefined) {
    updates.push('title = ?');
    params.push(data.title);
  }
  if (data.assigned_staff !== undefined) {
    updates.push('assigned_staff = ?');
    params.push(data.assigned_staff);
  }
  if (data.followup_type !== undefined) {
    updates.push('followup_type = ?');
    params.push(data.followup_type);
  }
  if (data.due_date !== undefined) {
    updates.push('due_date = ?');
    params.push(data.due_date);
  }

  if (updates.length === 0) {
    const result = await query('SELECT * FROM followups WHERE id = ?', [id]);
    return (result[0] as Followup) || null;
  }

  updates.push('updated_at = ?');
  params.push(now);
  params.push(id);

  await query(
    `UPDATE followups SET ${updates.join(', ')} WHERE id = ?`,
    params
  );

  const result = await query(
    `SELECT f.*,
      m.member_id as member_code,
      mu.name as member_name,
      s.staff_id as staff_code,
      su.name as staff_name
     FROM followups f
     LEFT JOIN members m ON f.member_id = m.id
     LEFT JOIN users mu ON m.user_id = mu.id
     LEFT JOIN staff s ON f.assigned_staff = s.id
     LEFT JOIN users su ON s.user_id = su.id
     WHERE f.id = ?`,
    [id]
  );
  return (result[0] as Followup) || null;
}

export async function completeFollowup(id: number): Promise<Followup | null> {
  const now = new Date().toISOString();
  const existing = await query('SELECT id FROM followups WHERE id = ?', [id]);
  if (existing.length === 0) {
    return null;
  }

  await query(
    'UPDATE followups SET status = ?, completed_at = ?, updated_at = ? WHERE id = ?',
    ['completed', now, now, id]
  );

  const result = await query('SELECT * FROM followups WHERE id = ?', [id]);
  return (result[0] as Followup) || null;
}

export async function getOverdueFollowups(): Promise<Followup[]> {
  const today = new Date().toISOString().split('T')[0];
  const results = await query(
    `SELECT f.*,
      m.member_id as member_code,
      mu.name as member_name,
      s.staff_id as staff_code,
      su.name as staff_name
     FROM followups f
     LEFT JOIN members m ON f.member_id = m.id
     LEFT JOIN users mu ON m.user_id = mu.id
     LEFT JOIN staff s ON f.assigned_staff = s.id
     LEFT JOIN users su ON s.user_id = su.id
     WHERE f.due_date < ? AND f.status = 'pending'
     ORDER BY f.due_date ASC`,
    [today]
  );
  return results as Followup[];
}

export async function getTodayFollowups(): Promise<Followup[]> {
  const today = new Date().toISOString().split('T')[0];
  const results = await query(
    `SELECT f.*,
      m.member_id as member_code,
      mu.name as member_name,
      s.staff_id as staff_code,
      su.name as staff_name
     FROM followups f
     LEFT JOIN members m ON f.member_id = m.id
     LEFT JOIN users mu ON m.user_id = mu.id
     LEFT JOIN staff s ON f.assigned_staff = s.id
     LEFT JOIN users su ON s.user_id = su.id
     WHERE f.due_date = ?
     ORDER BY f.priority DESC, f.created_at ASC`,
    [today]
  );
  return results as Followup[];
}

export async function getFollowupsByStaff(staffId: number): Promise<Followup[]> {
  const results = await query(
    `SELECT f.*,
      m.member_id as member_code,
      mu.name as member_name
     FROM followups f
     LEFT JOIN members m ON f.member_id = m.id
     LEFT JOIN users mu ON m.user_id = mu.id
     WHERE f.assigned_staff = ?
     ORDER BY f.due_date ASC`,
    [staffId]
  );
  return results as Followup[];
}

export async function getFollowupStats(): Promise<{
  total: number;
  pending: number;
  completed: number;
  overdue: number;
  by_type: { followup_type: string; count: number }[];
}> {
  const totalResult = await query('SELECT COUNT(*) as count FROM followups');
  const total = (totalResult[0] as any).count || 0;

  const pendingResult = await query(
    "SELECT COUNT(*) as count FROM followups WHERE status = 'pending'"
  );
  const pending = (pendingResult[0] as any).count || 0;

  const completedResult = await query(
    "SELECT COUNT(*) as count FROM followups WHERE status = 'completed'"
  );
  const completed = (completedResult[0] as any).count || 0;

  const today = new Date().toISOString().split('T')[0];
  const overdueResult = await query(
    "SELECT COUNT(*) as count FROM followups WHERE due_date < ? AND status = 'pending'",
    [today]
  );
  const overdue = (overdueResult[0] as any).count || 0;

  const typeResults = await query(
    'SELECT followup_type, COUNT(*) as count FROM followups GROUP BY followup_type ORDER BY count DESC'
  );
  const by_type = typeResults.map((r: any) => ({
    followup_type: r.followup_type,
    count: r.count,
  }));

  return {
    total,
    pending,
    completed,
    overdue,
    by_type,
  };
}
