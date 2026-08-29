import { query } from '../db/index';
import { Case, PaginatedResult } from '../types/index';

export interface CaseFilter {
  category?: string;
  priority?: string;
  status?: string;
  assigned_counselor?: number;
  member_id?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface TimelineEvent {
  type: string;
  date: string;
  title: string;
  description: string;
  details: any;
}

export async function createCase(data: {
  member_id: number;
  category: string;
  title?: string;
  assigned_counselor?: number;
  priority?: string;
  description?: string;
}) {
  const now = new Date().toISOString();

  const maxIdResult = await query('SELECT MAX(id) as id FROM cases');
  const nextId = ((maxIdResult[0] as any).id || 0) + 1;
  const caseIdString = `CASE-${String(nextId).padStart(5, '0')}`;

  await query(
    `INSERT INTO cases (case_id, member_id, category, title, assigned_counselor, priority, status, description, date_opened, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, 'open', ?, ?, ?, ?)`,
    [
      caseIdString,
      data.member_id,
      data.category,
      data.title || null,
      data.assigned_counselor || null,
      data.priority || 'normal',
      data.description || null,
      now,
      now,
      now,
    ]
  );

  const idResult = await query('SELECT MAX(id) as id FROM cases');
  const id = (idResult[0] as any).id;

  const result = await query('SELECT * FROM cases WHERE id = ?', [id]);
  return result[0];
}

export async function getCaseById(id: number) {
  const results = await query(
    `SELECT c.*,
      m.member_id as member_code,
      mu.name as member_name,
      mu.email as member_email,
      m.phone as member_phone,
      s.staff_id as counselor_code,
      su.name as counselor_name,
      su.email as counselor_email
     FROM cases c
     LEFT JOIN members m ON c.member_id = m.id
     LEFT JOIN users mu ON m.user_id = mu.id
     LEFT JOIN staff s ON c.assigned_counselor = s.id
     LEFT JOIN users su ON s.user_id = su.id
     WHERE c.id = ?`,
    [id]
  );
  return results[0] || null;
}

export async function getCaseByCaseId(caseId: string) {
  const results = await query(
    `SELECT c.*,
      m.member_id as member_code,
      mu.name as member_name,
      mu.email as member_email,
      m.phone as member_phone,
      s.staff_id as counselor_code,
      su.name as counselor_name,
      su.email as counselor_email
     FROM cases c
     LEFT JOIN members m ON c.member_id = m.id
     LEFT JOIN users mu ON m.user_id = mu.id
     LEFT JOIN staff s ON c.assigned_counselor = s.id
     LEFT JOIN users su ON s.user_id = su.id
     WHERE c.case_id = ?`,
    [caseId]
  );
  return results[0] || null;
}

export async function getAllCases(filter: CaseFilter): Promise<PaginatedResult<any>> {
  const page = filter.page || 1;
  const limit = filter.limit || 20;
  const offset = (page - 1) * limit;

  let whereClauses: string[] = [];
  let params: any[] = [];

  if (filter.category) {
    whereClauses.push('c.category = ?');
    params.push(filter.category);
  }

  if (filter.priority) {
    whereClauses.push('c.priority = ?');
    params.push(filter.priority);
  }

  if (filter.status) {
    whereClauses.push('c.status = ?');
    params.push(filter.status);
  }

  if (filter.assigned_counselor) {
    whereClauses.push('c.assigned_counselor = ?');
    params.push(filter.assigned_counselor);
  }

  if (filter.member_id) {
    whereClauses.push('c.member_id = ?');
    params.push(filter.member_id);
  }

  if (filter.search) {
    whereClauses.push(
      '(c.case_id LIKE ? OR c.title LIKE ? OR c.description LIKE ? OR mu.name LIKE ?)'
    );
    const searchPattern = `%${filter.search}%`;
    params.push(searchPattern, searchPattern, searchPattern, searchPattern);
  }

  const whereStr = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';

  const needsMemberJoin = filter.search;
  const memberJoin = needsMemberJoin
    ? 'LEFT JOIN members m ON c.member_id = m.id LEFT JOIN users mu ON m.user_id = mu.id'
    : '';

  const countResult = await query(
    `SELECT COUNT(*) as count FROM cases c ${memberJoin} ${whereStr}`,
    params
  );
  const total = (countResult[0] as any).count || 0;

  const data = await query(
    `SELECT c.*,
      m.member_id as member_code,
      mu.name as member_name,
      s.staff_id as counselor_code,
      su.name as counselor_name
     FROM cases c
     LEFT JOIN members m ON c.member_id = m.id
     LEFT JOIN users mu ON m.user_id = mu.id
     LEFT JOIN staff s ON c.assigned_counselor = s.id
     LEFT JOIN users su ON s.user_id = su.id
     ${whereStr}
     ORDER BY c.created_at DESC
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

export async function updateCase(
  id: number,
  data: {
    category?: string;
    title?: string;
    assigned_counselor?: number;
    priority?: string;
    status?: string;
    description?: string;
    outcome?: string;
    date_closed?: string;
  }
) {
  const now = new Date().toISOString();
  const updates: string[] = [];
  const params: any[] = [];

  if (data.category !== undefined) {
    updates.push('category = ?');
    params.push(data.category);
  }
  if (data.title !== undefined) {
    updates.push('title = ?');
    params.push(data.title);
  }
  if (data.assigned_counselor !== undefined) {
    updates.push('assigned_counselor = ?');
    params.push(data.assigned_counselor);
  }
  if (data.priority !== undefined) {
    updates.push('priority = ?');
    params.push(data.priority);
  }
  if (data.status !== undefined) {
    updates.push('status = ?');
    params.push(data.status);
  }
  if (data.description !== undefined) {
    updates.push('description = ?');
    params.push(data.description);
  }
  if (data.outcome !== undefined) {
    updates.push('outcome = ?');
    params.push(data.outcome);
  }
  if (data.date_closed !== undefined) {
    updates.push('date_closed = ?');
    params.push(data.date_closed);
  }

  if (updates.length === 0) {
    const result = await query('SELECT * FROM cases WHERE id = ?', [id]);
    return result[0] || null;
  }

  updates.push('updated_at = ?');
  params.push(now);
  params.push(id);

  await query(
    `UPDATE cases SET ${updates.join(', ')} WHERE id = ?`,
    params
  );

  const result = await query(
    `SELECT c.*,
      m.member_id as member_code,
      mu.name as member_name,
      s.staff_id as counselor_code,
      su.name as counselor_name
     FROM cases c
     LEFT JOIN members m ON c.member_id = m.id
     LEFT JOIN users mu ON m.user_id = mu.id
     LEFT JOIN staff s ON c.assigned_counselor = s.id
     LEFT JOIN users su ON s.user_id = su.id
     WHERE c.id = ?`,
    [id]
  );
  return result[0] || null;
}

export async function deleteCase(id: number) {
  const existing = await query('SELECT id FROM cases WHERE id = ?', [id]);
  if (existing.length === 0) {
    return false;
  }

  await query('DELETE FROM cases WHERE id = ?', [id]);
  return true;
}

export async function getCaseSessions(caseId: number) {
  const sessions = await query(
    `SELECT sr.*,
      s.staff_id as counselor_code,
      su.name as counselor_name,
      m.member_id as member_code,
      mu.name as member_name
     FROM session_records sr
     LEFT JOIN staff s ON sr.counselor_id = s.id
     LEFT JOIN users su ON s.user_id = su.id
     LEFT JOIN members m ON sr.member_id = m.id
     LEFT JOIN users mu ON m.user_id = mu.id
     WHERE sr.case_id = ?
     ORDER BY sr.session_date ASC`,
    [caseId]
  );
  return sessions;
}

export async function getCaseTimeline(caseId: number): Promise<TimelineEvent[]> {
  const timeline: TimelineEvent[] = [];

  const caseResult = await query('SELECT * FROM cases WHERE id = ?', [caseId]);
  if (caseResult.length > 0) {
    const c = caseResult[0] as any;
    timeline.push({
      type: 'case_created',
      date: c.date_opened || c.created_at,
      title: 'Case Opened',
      description: c.title || `Case opened in category: ${c.category}`,
      details: { case_id: c.case_id, category: c.category, priority: c.priority },
    });

    if (c.date_closed) {
      timeline.push({
        type: 'case_closed',
        date: c.date_closed,
        title: 'Case Closed',
        description: c.outcome || 'Case has been closed',
        details: { outcome: c.outcome },
      });
    }
  }

  const sessions = await query(
    `SELECT sr.*, su.name as counselor_name
     FROM session_records sr
     LEFT JOIN staff s ON sr.counselor_id = s.id
     LEFT JOIN users su ON s.user_id = su.id
     WHERE sr.case_id = ?
     ORDER BY sr.session_date ASC`,
    [caseId]
  );

  for (const session of sessions) {
    const s = session as any;
    timeline.push({
      type: 'session',
      date: s.session_date,
      title: `${s.session_type} Session`,
      description: s.summary || `Session with ${s.counselor_name || 'counselor'}`,
      details: {
        session_id: s.session_id,
        session_type: s.session_type,
        duration_minutes: s.duration_minutes,
        attendance: s.attendance,
        counselor_name: s.counselor_name,
        follow_up_required: s.follow_up_required,
      },
    });
  }

  const followups = await query(
    `SELECT f.*, su.name as staff_name
     FROM followups f
     LEFT JOIN staff st ON f.assigned_staff = st.id
     LEFT JOIN users su ON st.user_id = su.id
     WHERE f.case_id = ?
     ORDER BY f.due_date ASC`,
    [caseId]
  );

  for (const followup of followups) {
    const f = followup as any;
    timeline.push({
      type: 'followup',
      date: f.due_date,
      title: `Follow-up: ${f.followup_type}`,
      description: f.title || f.notes || `Follow-up scheduled`,
      details: {
        followup_id: f.followup_id,
        followup_type: f.followup_type,
        priority: f.priority,
        status: f.status,
        staff_name: f.staff_name,
      },
    });
  }

  timeline.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return timeline;
}

export async function assignCase(caseId: number, staffId: number) {
  const now = new Date().toISOString();

  const existing = await query('SELECT id FROM cases WHERE id = ?', [caseId]);
  if (existing.length === 0) {
    return null;
  }

  await query(
    'UPDATE cases SET assigned_counselor = ?, updated_at = ? WHERE id = ?',
    [staffId, now, caseId]
  );

  const result = await query(
    `SELECT c.*,
      m.member_id as member_code,
      mu.name as member_name,
      s.staff_id as counselor_code,
      su.name as counselor_name
     FROM cases c
     LEFT JOIN members m ON c.member_id = m.id
     LEFT JOIN users mu ON m.user_id = mu.id
     LEFT JOIN staff s ON c.assigned_counselor = s.id
     LEFT JOIN users su ON s.user_id = su.id
     WHERE c.id = ?`,
    [caseId]
  );
  return result[0] || null;
}

export async function escalateCase(caseId: number, priority: string) {
  const now = new Date().toISOString();

  const existing = await query('SELECT id FROM cases WHERE id = ?', [caseId]);
  if (existing.length === 0) {
    return null;
  }

  await query(
    'UPDATE cases SET priority = ?, updated_at = ? WHERE id = ?',
    [priority, now, caseId]
  );

  const result = await query(
    `SELECT c.*,
      m.member_id as member_code,
      mu.name as member_name,
      s.staff_id as counselor_code,
      su.name as counselor_name
     FROM cases c
     LEFT JOIN members m ON c.member_id = m.id
     LEFT JOIN users mu ON m.user_id = mu.id
     LEFT JOIN staff s ON c.assigned_counselor = s.id
     LEFT JOIN users su ON s.user_id = su.id
     WHERE c.id = ?`,
    [caseId]
  );
  return result[0] || null;
}
