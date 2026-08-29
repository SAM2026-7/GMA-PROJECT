import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  createFollowupHandler,
  getAllFollowupsHandler,
  getFollowupHandler,
  updateFollowupHandler,
  completeFollowupHandler,
  getOverdueFollowupsHandler,
  getTodayFollowupsHandler,
  getFollowupStatsHandler,
  getFollowupsByStaffHandler,
} from '../controllers/followupController';

export const followupsRouter = Router();

followupsRouter.use(authMiddleware);

followupsRouter.post('/', createFollowupHandler);
followupsRouter.get('/', getAllFollowupsHandler);
followupsRouter.get('/overdue', getOverdueFollowupsHandler);
followupsRouter.get('/today', getTodayFollowupsHandler);
followupsRouter.get('/stats', getFollowupStatsHandler);
followupsRouter.get('/staff/:staffId', getFollowupsByStaffHandler);
followupsRouter.get('/:id', getFollowupHandler);
followupsRouter.put('/:id', updateFollowupHandler);
followupsRouter.patch('/:id/complete', completeFollowupHandler);
