import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
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
prayerRouter.get('/stats', authMiddleware, getPrayerStatsHandler);
prayerRouter.get('/:id', authMiddleware, getPrayerRequestHandler);
prayerRouter.put('/:id', authMiddleware, updatePrayerRequestHandler);
prayerRouter.patch('/:id/pray', incrementPrayedCountHandler);
prayerRouter.patch('/:id/assign', authMiddleware, assignTeamHandler);
prayerRouter.patch('/:id/answered', authMiddleware, markAnsweredHandler);
