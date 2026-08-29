import { query } from '../db/index';

export async function createEvent(data: {
  title: string;
  description?: string;
  category?: string;
  location?: string;
  date?: string;
  start_date: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  image_url?: string;
  max_attendees?: number;
  is_recurring?: number;
  recurrence_pattern?: string;
  status?: string;
  created_by?: number;
}) {
  const now = new Date().toISOString();

  await query(
    `INSERT INTO events (
      title, description, date, category, location, start_date, end_date,
      start_time, end_time, image_url, max_attendees, is_recurring,
      recurrence_pattern, status, created_by, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.title,
      data.description || null,
      data.start_date || data.date || null,
      data.category || 'general',
      data.location || null,
      data.start_date || null,
      data.end_date || null,
      data.start_time || null,
      data.end_time || null,
      data.image_url || null,
      data.max_attendees || null,
      data.is_recurring || 0,
      data.recurrence_pattern || null,
      data.status || 'upcoming',
      data.created_by || null,
      now,
      now,
    ]
  );

  const event = await query('SELECT * FROM events WHERE created_at = ? ORDER BY id DESC LIMIT 1', [now]);
  return event[0];
}

export async function getEventById(id: number) {
  const events = await query('SELECT * FROM events WHERE id = ?', [id]);
  return events[0] || null;
}

export async function getAllEvents(filter: {
  status?: string;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const page = filter.page || 1;
  const limit = filter.limit || 20;
  const offset = (page - 1) * limit;

  let where = 'WHERE 1=1';
  const params: any[] = [];

  if (filter.status) {
    where += ' AND status = ?';
    params.push(filter.status);
  }

  if (filter.category) {
    where += ' AND category = ?';
    params.push(filter.category);
  }

  if (filter.search) {
    where += ' AND (title LIKE ? OR description LIKE ? OR location LIKE ?)';
    params.push(`%${filter.search}%`, `%${filter.search}%`, `%${filter.search}%`);
  }

  const countResult = await query(`SELECT COUNT(*) as total FROM events ${where}`, params);
  const total = countResult[0]?.total || 0;

  const events = await query(
    `SELECT * FROM events ${where} ORDER BY start_date ASC, start_time ASC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return { events, total, page, limit };
}

export async function getUpcomingEvents() {
  const now = new Date().toISOString();
  const events = await query(
    `SELECT * FROM events WHERE status = 'upcoming' AND start_date >= ? ORDER BY start_date ASC, start_time ASC`,
    [now]
  );
  return events;
}

export async function getEventsByCategory(category: string) {
  const events = await query(
    `SELECT * FROM events WHERE category = ? ORDER BY start_date ASC, start_time ASC`,
    [category]
  );
  return events;
}

export async function updateEvent(id: number, data: {
  title?: string;
  description?: string;
  category?: string;
  location?: string;
  date?: string;
  start_date?: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  image_url?: string;
  max_attendees?: number;
  is_recurring?: number;
  recurrence_pattern?: string;
  status?: string;
}) {
  const existing = await query('SELECT id FROM events WHERE id = ?', [id]);
  if (existing.length === 0) {
    throw new Error('Event not found');
  }

  const updates: string[] = [];
  const params: any[] = [];

  const fields = [
    'title', 'description', 'date', 'category', 'location', 'start_date', 'end_date',
    'start_time', 'end_time', 'image_url', 'max_attendees', 'is_recurring',
    'recurrence_pattern', 'status',
  ] as const;

  for (const field of fields) {
    if (data[field] !== undefined) {
      updates.push(`${field} = ?`);
      params.push(data[field]);
    }
  }

  if (data.start_date && !data.date) {
    updates.push(`date = ?`);
    params.push(data.start_date);
  }

  if (updates.length === 0) {
    return getEventById(id);
  }

  updates.push('updated_at = ?');
  params.push(new Date().toISOString());
  params.push(id);

  await query(`UPDATE events SET ${updates.join(', ')} WHERE id = ?`, params);

  return getEventById(id);
}

export async function deleteEvent(id: number) {
  const existing = await query('SELECT id FROM events WHERE id = ?', [id]);
  if (existing.length === 0) {
    throw new Error('Event not found');
  }

  await query('DELETE FROM event_registrations WHERE event_id = ?', [id]);
  await query('DELETE FROM events WHERE id = ?', [id]);
  return { success: true };
}

export async function getEventsByDateRange(startDate: string, endDate: string) {
  const events = await query(
    `SELECT * FROM events WHERE start_date >= ? AND start_date <= ? ORDER BY start_date ASC, start_time ASC`,
    [startDate, endDate]
  );
  return events;
}

export async function registerForEvent(eventId: number, memberId?: number) {
  const events = await query('SELECT * FROM events WHERE id = ?', [eventId]);
  if (events.length === 0) {
    throw new Error('Event not found');
  }

  const event = events[0];

  if (event.max_attendees) {
    const countResult = await query(
      'SELECT COUNT(*) as count FROM event_registrations WHERE event_id = ?',
      [eventId]
    );
    const currentCount = countResult[0]?.count || 0;
    if (currentCount >= event.max_attendees) {
      throw new Error('Event has reached maximum capacity');
    }
  }

  const now = new Date().toISOString();

  await query(
    `INSERT INTO event_registrations (event_id, member_id, status, registered_at, created_at, updated_at)
     VALUES (?, ?, 'confirmed', ?, ?, ?)`,
    [eventId, memberId || null, now, now, now]
  );

  const registration = await query(
    'SELECT * FROM event_registrations WHERE event_id = ? AND registered_at = ?',
    [eventId, now]
  );
  return registration[0];
}
