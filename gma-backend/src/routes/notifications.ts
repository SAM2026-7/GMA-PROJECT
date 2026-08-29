import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getNotificationsHandler,
  getUnreadCountHandler,
  markAsReadHandler,
  markAllAsReadHandler,
  deleteNotificationHandler,
  sendEmailResponseHandler,
} from '../controllers/notificationController';

export const notificationsRouter = Router();

notificationsRouter.use(authMiddleware);

notificationsRouter.get('/', getNotificationsHandler);
notificationsRouter.get('/unread-count', getUnreadCountHandler);
notificationsRouter.patch('/read-all', markAllAsReadHandler);
notificationsRouter.patch('/:id/read', markAsReadHandler);
notificationsRouter.delete('/:id', deleteNotificationHandler);
notificationsRouter.post('/send-email', sendEmailResponseHandler);
