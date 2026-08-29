import { Response } from 'express';
import { AuthRequest } from '../types/index';
import {
  getDashboardStats,
  getMemberAnalytics,
  getBookingAnalytics,
  getCounselingAnalytics,
  getPrayerAnalytics,
  getStaffAnalytics,
  getEngagementMetrics,
  getReport,
} from '../services/analyticsService';

export async function getDashboardStatsHandler(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const stats = await getDashboardStats();
    return res.status(200).json({ success: true, data: stats });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch dashboard stats' });
  }
}

export async function getMemberAnalyticsHandler(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const analytics = await getMemberAnalytics();
    return res.status(200).json({ success: true, data: analytics });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch member analytics' });
  }
}

export async function getBookingAnalyticsHandler(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const analytics = await getBookingAnalytics();
    return res.status(200).json({ success: true, data: analytics });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch booking analytics' });
  }
}

export async function getCounselingAnalyticsHandler(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const analytics = await getCounselingAnalytics();
    return res.status(200).json({ success: true, data: analytics });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch counseling analytics' });
  }
}

export async function getPrayerAnalyticsHandler(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const analytics = await getPrayerAnalytics();
    return res.status(200).json({ success: true, data: analytics });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch prayer analytics' });
  }
}

export async function getStaffAnalyticsHandler(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const counselorId = req.query.counselorId ? parseInt(req.query.counselorId as string) : undefined;
    const analytics = await getStaffAnalytics(counselorId);
    return res.status(200).json({ success: true, data: analytics });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch staff analytics' });
  }
}

export async function getEngagementMetricsHandler(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const metrics = await getEngagementMetrics();
    return res.status(200).json({ success: true, data: metrics });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch engagement metrics' });
  }
}

export async function getReportHandler(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const type = req.query.type as 'daily' | 'weekly' | 'monthly';
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    if (!type || !startDate || !endDate) {
      return res.status(400).json({ error: 'type, startDate, and endDate are required' });
    }
    const report = await getReport(type, startDate, endDate);
    return res.status(200).json({ success: true, data: report });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to generate report' });
  }
}
