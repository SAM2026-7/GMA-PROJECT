import { Router } from 'express';
import { authMiddleware, requireStaffOrAdmin } from '../middleware/auth';
import { rateLimiter } from '../middleware/rateLimiter';
import {
  createDonationHandler,
  getAllDonationsHandler,
  getDonationHandler,
  updateDonationHandler,
  deleteDonationHandler,
  getGivingStatsHandler,
} from '../controllers/donationController';

export const donationsRouter = Router();

donationsRouter.post('/', rateLimiter, createDonationHandler);

donationsRouter.use(authMiddleware);

donationsRouter.get('/stats', requireStaffOrAdmin, getGivingStatsHandler);
donationsRouter.get('/', getAllDonationsHandler);
donationsRouter.get('/:id', getDonationHandler);
donationsRouter.put('/:id', requireStaffOrAdmin, updateDonationHandler);
donationsRouter.delete('/:id', requireStaffOrAdmin, deleteDonationHandler);
