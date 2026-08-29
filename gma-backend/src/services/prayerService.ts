import { query } from '../db/index';
import { PrayerRequest, PaginatedResult } from '../types/index';

interface PrayerFilter {
  status?: string;
  category?: string;
  urgency?: string;
  visibility?: string;
  member_id?: number;
  assigned_team?: string;
  answered?: number;
  search?: string;
  page?: number;
  limit?: number;
}

function generateRequestId(): string {
  const random = Math.floor(10000 + Math.random() * 90000);
  return `PR-${random}`;
}

export async function createPrayerRequest(data: {
  member_id?: number;
  visitor_name?: string;
  category: string;
  text: string;
  urgency?: string;
  visibility?: string;
  follow_up_date?: string;
  notes?: string;
}): Promise<PrayerRequest> {
  const now = new Date().toISOString();
  const requestId = generateRequestId();

  await query(
    `INSERT INTO prayer_requests (request_id, member_id, visitor_name, category, text, urgency, visibility, status, prayed_count, answered, notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'received', 0, 0, ?, ?, ?)`,
    [
      requestId,
      data.member_id || null,
      data.visitor_name || null,
      data.category,
      data.text,
      data.urgency || 'normal',
      data.visibility || 'private',
      data.notes || null,
      now,
      now,
    ]
  );

  const result = await query('SELECT * FROM prayer_requests WHERE request_id = ?', [requestId]);
  return result[0] as PrayerRequest;
}

export async function getPrayerRequestById(id: number): Promise<PrayerRequest | null> {
  const results = await query(
    `SELECT pr.*,
      m.member_id as member_code,
      mu.name as member_name
     FROM prayer_requests pr
     LEFT JOIN members m ON pr.member_id = m.id
     LEFT JOIN users mu ON m.user_id = mu.id
     WHERE pr.id = ?`,
    [id]
  );
  return (results[0] as PrayerRequest) || null;
}

export async function getByRequestId(requestId: string): Promise<PrayerRequest | null> {
  const results = await query(
    `SELECT pr.*,
      m.member_id as member_code,
      mu.name as member_name
     FROM prayer_requests pr
     LEFT JOIN members m ON pr.member_id = m.id
     LEFT JOIN users mu ON m.user_id = mu.id
     WHERE pr.request_id = ?`,
    [requestId]
  );
  return (results[0] as PrayerRequest) || null;
}

export async function getAllPrayerRequests(filter: PrayerFilter): Promise<PaginatedResult<PrayerRequest>> {
  const page = filter.page || 1;
  const limit = filter.limit || 20;
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const params: any[] = [];

  if (filter.status) {
    conditions.push('pr.status = ?');
    params.push(filter.status);
  }
  if (filter.category) {
    conditions.push('pr.category = ?');
    params.push(filter.category);
  }
  if (filter.urgency) {
    conditions.push('pr.urgency = ?');
    params.push(filter.urgency);
  }
  if (filter.visibility) {
    conditions.push('pr.visibility = ?');
    params.push(filter.visibility);
  }
  if (filter.member_id) {
    conditions.push('pr.member_id = ?');
    params.push(filter.member_id);
  }
  if (filter.assigned_team) {
    conditions.push('pr.assigned_team = ?');
    params.push(filter.assigned_team);
  }
  if (filter.answered !== undefined) {
    conditions.push('pr.answered = ?');
    params.push(filter.answered);
  }
  if (filter.search) {
    conditions.push('(pr.request_id LIKE ? OR pr.text LIKE ? OR pr.visitor_name LIKE ? OR mu.name LIKE ?)');
    const searchPattern = `%${filter.search}%`;
    params.push(searchPattern, searchPattern, searchPattern, searchPattern);
  }

  const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
  const needsJoin = filter.search;
  const memberJoin = needsJoin ? 'LEFT JOIN members m ON pr.member_id = m.id LEFT JOIN users mu ON m.user_id = mu.id' : '';

  const countResult = await query(
    `SELECT COUNT(*) as count FROM prayer_requests pr ${memberJoin} ${whereClause}`,
    params
  );
  const total = (countResult[0] as any).count || 0;

  const data = await query(
    `SELECT pr.*,
      m.member_id as member_code,
      mu.name as member_name
     FROM prayer_requests pr
     LEFT JOIN members m ON pr.member_id = m.id
     LEFT JOIN users mu ON m.user_id = mu.id
     ${whereClause}
     ORDER BY pr.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return {
    data: data as PrayerRequest[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getByMember(memberId: number): Promise<PrayerRequest[]> {
  const results = await query(
    'SELECT * FROM prayer_requests WHERE member_id = ? ORDER BY created_at DESC',
    [memberId]
  );
  return results as PrayerRequest[];
}

export async function updatePrayerRequest(
  id: number,
  data: {
    status?: string;
    assigned_team?: string;
    notes?: string;
    answered?: number;
    urgency?: string;
    visibility?: string;
    follow_up_date?: string;
  }
): Promise<PrayerRequest | null> {
  const now = new Date().toISOString();
  const updates: string[] = [];
  const params: any[] = [];

  if (data.status !== undefined) {
    updates.push('status = ?');
    params.push(data.status);
  }
  if (data.assigned_team !== undefined) {
    updates.push('assigned_team = ?');
    params.push(data.assigned_team);
  }
  if (data.notes !== undefined) {
    updates.push('notes = ?');
    params.push(data.notes);
  }
  if (data.answered !== undefined) {
    updates.push('answered = ?');
    params.push(data.answered);
  }
  if (data.urgency !== undefined) {
    updates.push('urgency = ?');
    params.push(data.urgency);
  }
  if (data.visibility !== undefined) {
    updates.push('visibility = ?');
    params.push(data.visibility);
  }
  if (data.follow_up_date !== undefined) {
    updates.push('follow_up_date = ?');
    params.push(data.follow_up_date);
  }

  if (updates.length === 0) {
    const result = await query('SELECT * FROM prayer_requests WHERE id = ?', [id]);
    return (result[0] as PrayerRequest) || null;
  }

  updates.push('updated_at = ?');
  params.push(now);
  params.push(id);

  await query(
    `UPDATE prayer_requests SET ${updates.join(', ')} WHERE id = ?`,
    params
  );

  const result = await query('SELECT * FROM prayer_requests WHERE id = ?', [id]);
  return (result[0] as PrayerRequest) || null;
}

export async function incrementPrayedCount(id: number): Promise<void> {
  await query(
    'UPDATE prayer_requests SET prayed_count = prayed_count + 1, updated_at = ? WHERE id = ?',
    [new Date().toISOString(), id]
  );
}

export async function assignTeam(id: number, team: string): Promise<PrayerRequest | null> {
  const now = new Date().toISOString();
  const existing = await query('SELECT id FROM prayer_requests WHERE id = ?', [id]);
  if (existing.length === 0) {
    return null;
  }

  await query(
    'UPDATE prayer_requests SET assigned_team = ?, status = ?, updated_at = ? WHERE id = ?',
    [team, 'being_prayed', now, id]
  );

  const result = await query('SELECT * FROM prayer_requests WHERE id = ?', [id]);
  return (result[0] as PrayerRequest) || null;
}

export async function markAnswered(id: number): Promise<PrayerRequest | null> {
  const now = new Date().toISOString();
  const existing = await query('SELECT id FROM prayer_requests WHERE id = ?', [id]);
  if (existing.length === 0) {
    return null;
  }

  await query(
    'UPDATE prayer_requests SET answered = 1, answered_date = ?, status = ?, updated_at = ? WHERE id = ?',
    [now, 'answered', now, id]
  );

  const result = await query('SELECT * FROM prayer_requests WHERE id = ?', [id]);
  return (result[0] as PrayerRequest) || null;
}

export async function getPublicPrayerWall(
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResult<PrayerRequest>> {
  const offset = (page - 1) * limit;

  const countResult = await query(
    "SELECT COUNT(*) as count FROM prayer_requests WHERE visibility = 'public'"
  );
  const total = (countResult[0] as any).count || 0;

  const data = await query(
    `SELECT pr.*, m.member_id as member_code, mu.name as member_name
     FROM prayer_requests pr
     LEFT JOIN members m ON pr.member_id = m.id
     LEFT JOIN users mu ON m.user_id = mu.id
     WHERE pr.visibility = 'public'
     ORDER BY pr.created_at DESC
     LIMIT ? OFFSET ?`,
    [limit, offset]
  );

  return {
    data: data as PrayerRequest[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getPrayerStats(): Promise<{
  total: number;
  pending: number;
  being_prayed: number;
  answered: number;
  by_category: { category: string; count: number }[];
  by_urgency: { urgency: string; count: number }[];
}> {
  const totalResult = await query('SELECT COUNT(*) as count FROM prayer_requests');
  const total = (totalResult[0] as any).count || 0;

  const pendingResult = await query(
    "SELECT COUNT(*) as count FROM prayer_requests WHERE status = 'received'"
  );
  const pending = (pendingResult[0] as any).count || 0;

  const beingPrayedResult = await query(
    "SELECT COUNT(*) as count FROM prayer_requests WHERE status = 'being_prayed'"
  );
  const being_prayed = (beingPrayedResult[0] as any).count || 0;

  const answeredResult = await query(
    'SELECT COUNT(*) as count FROM prayer_requests WHERE answered = 1'
  );
  const answered = (answeredResult[0] as any).count || 0;

  const categoryResults = await query(
    'SELECT category, COUNT(*) as count FROM prayer_requests GROUP BY category ORDER BY count DESC'
  );
  const by_category = categoryResults.map((r: any) => ({
    category: r.category,
    count: r.count,
  }));

  const urgencyResults = await query(
    'SELECT urgency, COUNT(*) as count FROM prayer_requests GROUP BY urgency ORDER BY count DESC'
  );
  const by_urgency = urgencyResults.map((r: any) => ({
    urgency: r.urgency,
    count: r.count,
  }));

  return {
    total,
    pending,
    being_prayed,
    answered,
    by_category,
    by_urgency,
  };
}
