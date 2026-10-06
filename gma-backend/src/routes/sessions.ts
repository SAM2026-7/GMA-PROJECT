import { Router } from 'express';
import {
  createSessionHandler,
  getAllSessionsHandler,
  getSessionHandler,
  updateSessionHandler,
  deleteSessionHandler,
  getSessionsByCaseHandler,
  getSessionsByMemberHandler,
  getCounselorStatsHandler,
} from '../controllers/sessionController';
import { authMiddleware, requireStaffOrAdmin } from '../middleware/auth';

export const sessionsRouter = Router();

sessionsRouter.use(authMiddleware, requireStaffOrAdmin);

sessionsRouter.post('/', createSessionHandler);
sessionsRouter.get('/', getAllSessionsHandler);
sessionsRouter.get('/stats/:counselorId', getCounselorStatsHandler);
sessionsRouter.get('/case/:caseId', getSessionsByCaseHandler);
sessionsRouter.get('/member/:memberId', getSessionsByMemberHandler);
sessionsRouter.get('/:id', getSessionHandler);
sessionsRouter.put('/:id', updateSessionHandler);
sessionsRouter.delete('/:id', deleteSessionHandler);
