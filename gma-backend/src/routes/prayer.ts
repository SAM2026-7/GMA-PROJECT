import { Router } from 'express';
import { authMiddleware, requireStaffOrAdmin } from '../middleware/auth';
import { rateLimiter } from '../middleware/rateLimiter';
import {
  createPrayerRequestHandler,
  getAllPrayerRequestsHandler,
  getPrayerRequestHandler,
  updatePrayerRequestHandler,
  incrementPrayedCountHandler,
  assignTeamHandler,
  markAnsweredHandler,
  getPublicPrayerWallHandler,
  getPrayerStatsHandler,
} from '../controllers/prayerController';

export const prayerRouter = Router();

prayerRouter.post('/', rateLimiter, createPrayerRequestHandler);
prayerRouter.get('/', authMiddleware, getAllPrayerRequestsHandler);
prayerRouter.get('/wall', getPublicPrayerWallHandler);
prayerRouter.get('/stats', requireStaffOrAdmin, getPrayerStatsHandler);
prayerRouter.get('/:id', authMiddleware, getPrayerRequestHandler);
prayerRouter.patch('/:id/pray', incrementPrayedCountHandler);
prayerRouter.patch('/:id/assign', requireStaffOrAdmin, assignTeamHandler);
prayerRouter.patch('/:id/answered', requireStaffOrAdmin, markAnsweredHandler);
prayerRouter.put('/:id', requireStaffOrAdmin, updatePrayerRequestHandler);
