import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth';
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
auditRouter.get('/stats', getAuditStatsHandler);
auditRouter.post('/', createAuditLogHandler);
