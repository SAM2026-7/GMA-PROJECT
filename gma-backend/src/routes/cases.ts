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
import { authMiddleware } from '../middleware/auth';

export const casesRouter = Router();

casesRouter.use(authMiddleware);

casesRouter.post('/', createCaseHandler);
casesRouter.get('/', getAllCasesHandler);
casesRouter.get('/:id', getCaseHandler);
casesRouter.get('/:id/sessions', getCaseSessionsHandler);
casesRouter.get('/:id/timeline', getCaseTimelineHandler);
casesRouter.put('/:id', updateCaseHandler);
casesRouter.patch('/:id/assign', assignCaseHandler);
casesRouter.patch('/:id/escalate', escalateCaseHandler);
casesRouter.delete('/:id', deleteCaseHandler);
