import { Router } from 'express';
import { createSubmissionHandler } from '../controllers/submissionsController';
import {
  listSubmissionsHandler,
  getSubmissionHandler,
  updateSubmissionHandler,
  deleteSubmissionHandler,
} from '../controllers/submissionsController';
import { authMiddleware } from '../middleware/auth';
import { rateLimiter } from '../middleware/rateLimiter';

export const submissionsRouter = Router();

submissionsRouter.post('/', rateLimiter, createSubmissionHandler);

submissionsRouter.use(authMiddleware);
submissionsRouter.get('/', listSubmissionsHandler);
submissionsRouter.get('/:id', getSubmissionHandler);
submissionsRouter.patch('/:id/status', updateSubmissionHandler);
submissionsRouter.delete('/:id', deleteSubmissionHandler);
