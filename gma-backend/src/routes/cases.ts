import { Router } from 'express';
import {
  createCaseHandler,
  getAllCasesHandler,
  getCaseHandler,
  updateCaseHandler,
  deleteCaseHandler,
  getCaseSessionsHandler,
  getCaseTimelineHandler,
  assignCaseHandler,
  escalateCaseHandler,
} from '../controllers/caseController';
import { authMiddleware, requireStaffOrAdmin } from '../middleware/auth';

export const casesRouter = Router();

casesRouter.use(authMiddleware);

casesRouter.post('/', requireStaffOrAdmin, createCaseHandler);
casesRouter.get('/', getAllCasesHandler);
casesRouter.get('/:id', getCaseHandler);
casesRouter.get('/:id/sessions', getCaseSessionsHandler);
casesRouter.get('/:id/timeline', getCaseTimelineHandler);
casesRouter.put('/:id', requireStaffOrAdmin, updateCaseHandler);
casesRouter.patch('/:id/assign', requireStaffOrAdmin, assignCaseHandler);
casesRouter.patch('/:id/escalate', requireStaffOrAdmin, escalateCaseHandler);
casesRouter.delete('/:id', requireStaffOrAdmin, deleteCaseHandler);
