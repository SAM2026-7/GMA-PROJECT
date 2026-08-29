import { query } from '../db/index';
import { Notification, PaginatedResult } from '../types/index';

export async function createNotification(
  userId: number,
  type: string,
  title: string,
  message: string,
  data?: string
): Promise<Notification> {
  const now = new Date().toISOString();

  await query(
    `INSERT INTO notifications (user_id, type, title, message, data, is_read, created_at)
     VALUES (?, ?, ?, ?, ?, 0, ?)`,
    [userId, type, title, message, data || null, now]
  );

  const results = await query('SELECT * FROM notifications WHERE user_id = ? ORDER BY id DESC LIMIT 1', [userId]);
  return results[0] as Notification;
}

export async function getNotifications(
  userId: number,
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResult<Notification>> {
  const offset = (page - 1) * limit;

  const countResult = await query(
    'SELECT COUNT(*) as count FROM notifications WHERE user_id = ?',
    [userId]
  );
  const total = (countResult[0] as any).count || 0;

  const notifications = await query(
    'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
    [userId, limit, offset]
  );

  return {
    data: notifications as Notification[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getUnreadNotifications(userId: number): Promise<Notification[]> {
  const notifications = await query(
    'SELECT * FROM notifications WHERE user_id = ? AND is_read = 0 ORDER BY created_at DESC',
    [userId]
  );
  return notifications as Notification[];
}

export async function getUnreadCount(userId: number): Promise<number> {
  const result = await query(
    'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
    [userId]
  );
  return (result[0] as any).count || 0;
}

export async function markAsRead(id: number): Promise<boolean> {
  const now = new Date().toISOString();
  await query(
    'UPDATE notifications SET is_read = 1, read_at = ? WHERE id = ?',
    [now, id]
  );
  return true;
}

export async function markAllAsRead(userId: number): Promise<boolean> {
  const now = new Date().toISOString();
  await query(
    'UPDATE notifications SET is_read = 1, read_at = ? WHERE user_id = ? AND is_read = 0',
    [now, userId]
  );
  return true;
}

export async function deleteNotification(id: number): Promise<boolean> {
  await query('DELETE FROM notifications WHERE id = ?', [id]);
  return true;
}

export async function createBulkNotifications(
  userIds: number[],
  type: string,
  title: string,
  message: string,
  data?: string
): Promise<Notification[]> {
  const now = new Date().toISOString();
  const created: Notification[] = [];

  for (const userId of userIds) {
    await query(
      `INSERT INTO notifications (user_id, type, title, message, data, is_read, created_at)
       VALUES (?, ?, ?, ?, ?, 0, ?)`,
      [userId, type, title, message, data || null, now]
    );

    const result = await query('SELECT * FROM notifications WHERE user_id = ? ORDER BY id DESC LIMIT 1', [userId]);
    created.push(result[0] as Notification);
  }

  return created;
}

export async function notifyBookingReceived(userId: number, bookingId: string, serviceType: string): Promise<Notification> {
  return createNotification(
    userId,
    'booking_received',
    'New Booking Received',
    `A new ${serviceType} booking has been submitted.`,
    JSON.stringify({ booking_id: bookingId })
  );
}

export async function notifyBookingConfirmed(userId: number, bookingId: string, serviceType: string): Promise<Notification> {
  return createNotification(
    userId,
    'booking_confirmed',
    'Booking Confirmed',
    `Your ${serviceType} booking has been confirmed.`,
    JSON.stringify({ booking_id: bookingId })
  );
}

export async function notifyNewMessage(userId: number, conversationId: string, senderName: string): Promise<Notification> {
  return createNotification(
    userId,
    'new_message',
    'New Message',
    `You have a new message from ${senderName}.`,
    JSON.stringify({ conversation_id: conversationId })
  );
}

export async function notifyFollowupDue(userId: number, followupId: string, title: string): Promise<Notification> {
  return createNotification(
    userId,
    'followup_due',
    'Follow-up Due',
    `Follow-up "${title}" is due today.`,
    JSON.stringify({ followup_id: followupId })
  );
}

export async function notifyPrayerAssigned(userId: number, requestId: string, category: string): Promise<Notification> {
  return createNotification(
    userId,
    'prayer_assigned',
    'Prayer Request Assigned',
    `A ${category} prayer request has been assigned to you.`,
    JSON.stringify({ request_id: requestId })
  );
}
