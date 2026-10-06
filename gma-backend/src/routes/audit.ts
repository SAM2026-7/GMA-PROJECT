import { Router } from 'express';
import { authMiddleware, requireRole, requireStaffOrAdmin } from '../middleware/auth';
import {
  getAuditLogsHandler,
  getRecentActivityHandler,
  getAuditStatsHandler,
  createAuditLogHandler,
} from '../controllers/auditController';

export const auditRouter = Router();

auditRouter.use(authMiddleware);

auditRouter.get('/', requireRole('admin', 'super_admin'), getAuditLogsHandler);
auditRouter.get('/recent', getRecentActivityHandler);
auditRouter.get('/stats', requireStaffOrAdmin, getAuditStatsHandler);
auditRouter.post('/', createAuditLogHandler);
