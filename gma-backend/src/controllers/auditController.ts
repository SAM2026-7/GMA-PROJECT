import { Response } from 'express';
import { AuthRequest } from '../types/index';
import { isStaffUser } from '../middleware/auth';
import { getAuditLogs, getRecentActivity, getAuditStats, logAudit } from '../services/auditService';

export async function getAuditLogsHandler(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const result = await getAuditLogs({
      user_id: req.query.user_id ? parseInt(req.query.user_id as string) : undefined,
      action: req.query.action as string | undefined,
      entity_type: req.query.entity_type as string | undefined,
      start_date: req.query.startDate as string | undefined,
      end_date: req.query.endDate as string | undefined,
      search: req.query.search as string | undefined,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
    });
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch audit logs' });
  }
}

export async function getRecentActivityHandler(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const logs = await getRecentActivity(limit, isStaffUser(req) ? undefined : req.user.id);
    return res.status(200).json({ success: true, data: logs });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch recent activity' });
  }
}

export async function getAuditStatsHandler(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const stats = await getAuditStats();
    return res.status(200).json({ success: true, data: stats });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch audit stats' });
  }
}

export async function createAuditLogHandler(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { action, entity_type, entity_id, details } = req.body;
    if (!action) {
      return res.status(400).json({ error: 'Action is required' });
    }
    const log = await logAudit(
      req.user.id,
      req.user.name,
      req.user.role,
      action,
      entity_type || null,
      entity_id || null,
      details || null,
      req.ip
    );
    return res.status(201).json({ success: true, data: log });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to create audit log' });
  }
}
