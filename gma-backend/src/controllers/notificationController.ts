import { Response } from 'express';
import { AuthRequest } from '../types/index';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../services/notificationService';
import { sendPastorResponse, sendAutoResponse } from '../services/emailService';

export async function getNotificationsHandler(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await getNotifications(req.user.id, page, limit);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch notifications' });
  }
}

export async function getUnreadCountHandler(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const count = await getUnreadCount(req.user.id);
    return res.status(200).json({ success: true, data: { count } });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch unread count' });
  }
}

export async function markAsReadHandler(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid notification ID' });
    }
    await markAsRead(id);
    return res.status(200).json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to mark notification as read' });
  }
}

export async function markAllAsReadHandler(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    await markAllAsRead(req.user.id);
    return res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to mark all notifications as read' });
  }
}

export async function deleteNotificationHandler(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid notification ID' });
    }
    await deleteNotification(id);
    return res.status(200).json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to delete notification' });
  }
}

export async function sendEmailResponseHandler(req: AuthRequest, res: Response) {
  try {
    const { to, name, subject, message, type, referenceId, sendAutoResponse } = req.body;

    if (!to || !name || !message) {
      return res.status(400).json({ error: 'Recipient email, name, and message are required' });
    }

    if (sendAutoResponse) {
      await sendAutoResponse({
        to,
        name,
        type: type || 'general',
        referenceId,
      });
    } else {
      await sendPastorResponse({
        to,
        name,
        subject: subject || 'Response from GMA City Complex',
        message,
        referenceId,
      });
    }

    return res.status(200).json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to send email' });
  }
}
