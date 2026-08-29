import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getDashboardStatsHandler,
  getMemberAnalyticsHandler,
  getBookingAnalyticsHandler,
  getCounselingAnalyticsHandler,
  getPrayerAnalyticsHandler,
  getStaffAnalyticsHandler,
  getEngagementMetricsHandler,
  getReportHandler,
} from '../controllers/analyticsController';

export const analyticsRouter = Router();

analyticsRouter.use(authMiddleware);

analyticsRouter.get('/dashboard', getDashboardStatsHandler);
analyticsRouter.get('/members', getMemberAnalyticsHandler);
analyticsRouter.get('/bookings', getBookingAnalyticsHandler);
analyticsRouter.get('/counseling', getCounselingAnalyticsHandler);
analyticsRouter.get('/prayer', getPrayerAnalyticsHandler);
analyticsRouter.get('/staff', getStaffAnalyticsHandler);
analyticsRouter.get('/engagement', getEngagementMetricsHandler);
analyticsRouter.get('/report', getReportHandler);
