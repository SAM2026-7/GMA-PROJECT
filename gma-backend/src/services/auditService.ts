import { query } from '../db/index';
import { AuditLog, PaginatedResult } from '../types/index';

export const ACTION_LOGIN = 'login';
export const ACTION_LOGOUT = 'logout';
export const ACTION_CREATE = 'create';
export const ACTION_UPDATE = 'update';
export const ACTION_DELETE = 'delete';
export const ACTION_VIEW = 'view';
export const ACTION_ASSIGN = 'assign';
export const ACTION_STATUS_CHANGE = 'status_change';

interface AuditFilter {
  user_id?: number;
  action?: string;
  entity_type?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export async function logAudit(
  userId: number | null,
  userName: string | null,
  userRole: string | null,
  action: string,
  entityType?: string,
  entityId?: string,
  details?: string,
  ipAddress?: string
): Promise<AuditLog> {
  const now = new Date().toISOString();

  await query(
    `INSERT INTO audit_logs (user_id, user_name, user_role, action, entity_type, entity_id, details, ip_address, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [userId, userName, userRole, action, entityType || null, entityId || null, details || null, ipAddress || null, now]
  );

  const results = await query('SELECT * FROM audit_logs ORDER BY id DESC LIMIT 1');
  return results[0] as AuditLog;
}

export async function getAuditLogs(filter: AuditFilter): Promise<PaginatedResult<AuditLog>> {
  const page = filter.page || 1;
  const limit = filter.limit || 20;
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const params: any[] = [];

  if (filter.user_id) {
    conditions.push('a.user_id = ?');
    params.push(filter.user_id);
  }
  if (filter.action) {
    conditions.push('a.action = ?');
    params.push(filter.action);
  }
  if (filter.entity_type) {
    conditions.push('a.entity_type = ?');
    params.push(filter.entity_type);
  }
  if (filter.start_date) {
    conditions.push('a.created_at >= ?');
    params.push(filter.start_date);
  }
  if (filter.end_date) {
    conditions.push('a.created_at <= ?');
    params.push(filter.end_date);
  }
  if (filter.search) {
    conditions.push('(a.user_name LIKE ? OR a.action LIKE ? OR a.entity_type LIKE ? OR a.details LIKE ?)');
    const searchPattern = `%${filter.search}%`;
    params.push(searchPattern, searchPattern, searchPattern, searchPattern);
  }

  const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

  const countResult = await query(`SELECT COUNT(*) as count FROM audit_logs a ${whereClause}`, params);
  const total = (countResult[0] as any).count || 0;

  const logs = await query(
    `SELECT a.* FROM audit_logs a ${whereClause} ORDER BY a.created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return {
    data: logs as AuditLog[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getRecentActivity(limit: number = 10): Promise<AuditLog[]> {
  const logs = await query(
    'SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT ?',
    [limit]
  );
  return logs as AuditLog[];
}

export async function getAuditStats(): Promise<{
  byAction: { action: string; count: number }[];
  byUser: { user_id: number; user_name: string; count: number }[];
  byEntity: { entity_type: string; count: number }[];
}> {
  const byAction = await query(
    'SELECT action, COUNT(*) as count FROM audit_logs GROUP BY action ORDER BY count DESC'
  );

  const byUser = await query(
    'SELECT user_id, user_name, COUNT(*) as count FROM audit_logs WHERE user_id IS NOT NULL GROUP BY user_id, user_name ORDER BY count DESC'
  );

  const byEntity = await query(
    'SELECT entity_type, COUNT(*) as count FROM audit_logs WHERE entity_type IS NOT NULL GROUP BY entity_type ORDER BY count DESC'
  );

  return {
    byAction: byAction as { action: string; count: number }[],
    byUser: byUser as { user_id: number; user_name: string; count: number }[],
    byEntity: byEntity as { entity_type: string; count: number }[],
  };
}
