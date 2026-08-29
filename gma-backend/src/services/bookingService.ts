import { query } from '../db/index';
import { Booking, PaginatedResult, PaginationQuery } from '../types/index';

interface BookingFilter extends PaginationQuery {
  status?: string;
  service_type?: string;
  assigned_to?: number;
  member_id?: number;
  start_date?: string;
  end_date?: string;
  search?: string;
}

function generateBookingId(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(10000 + Math.random() * 90000);
  return `GMA-${year}-${random}`;
}

export async function createBooking(data: {
  member_id?: number;
  visitor_name?: string;
  visitor_phone?: string;
  visitor_email?: string;
  service_type: string;
  session_type?: string;
  preferred_date: string;
  preferred_time?: string;
  meeting_type: string;
  reason?: string;
  preferred_contact: string;
  assigned_to?: number;
  case_id?: number;
  notes?: string;
}): Promise<Booking> {
  const now = new Date().toISOString();
  const bookingId = generateBookingId();

  await query(
    `INSERT INTO bookings (booking_id, member_id, visitor_name, visitor_phone, visitor_email, service_type, session_type, preferred_date, preferred_time, meeting_type, reason, preferred_contact, status, assigned_to, case_id, notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      bookingId,
      data.member_id || null,
      data.visitor_name || null,
      data.visitor_phone || null,
      data.visitor_email || null,
      data.service_type,
      data.session_type || null,
      data.preferred_date,
      data.preferred_time || null,
      data.meeting_type,
      data.reason || null,
      data.preferred_contact,
      'pending',
      data.assigned_to || null,
      data.case_id || null,
      data.notes || null,
      now,
      now,
    ]
  );

  const results = await query('SELECT * FROM bookings WHERE booking_id = ?', [bookingId]);
  return results[0] as Booking;
}

export async function getBookingById(id: number): Promise<Booking | undefined> {
  const results = await query('SELECT * FROM bookings WHERE id = ?', [id]);
  return results[0] as Booking | undefined;
}

export async function getBookingByBookingId(bookingId: string): Promise<Booking | undefined> {
  const results = await query('SELECT * FROM bookings WHERE booking_id = ?', [bookingId]);
  return results[0] as Booking | undefined;
}

export async function getAllBookings(filter: BookingFilter): Promise<PaginatedResult<Booking>> {
  const page = filter.page || 1;
  const limit = filter.limit || 20;
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const params: any[] = [];

  if (filter.status) {
    conditions.push('b.status = ?');
    params.push(filter.status);
  }
  if (filter.service_type) {
    conditions.push('b.service_type = ?');
    params.push(filter.service_type);
  }
  if (filter.assigned_to) {
    conditions.push('b.assigned_to = ?');
    params.push(filter.assigned_to);
  }
  if (filter.member_id) {
    conditions.push('b.member_id = ?');
    params.push(filter.member_id);
  }
  if (filter.start_date) {
    conditions.push('b.preferred_date >= ?');
    params.push(filter.start_date);
  }
  if (filter.end_date) {
    conditions.push('b.preferred_date <= ?');
    params.push(filter.end_date);
  }
  if (filter.search) {
    conditions.push('(b.visitor_name LIKE ? OR b.booking_id LIKE ?)');
    params.push(`%${filter.search}%`, `%${filter.search}%`);
  }

  const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

  const countResult = await query(`SELECT COUNT(*) as count FROM bookings b ${whereClause}`, params);
  const total = (countResult[0] as any).count || 0;

  const bookings = await query(
    `SELECT b.*, m.member_id as member_code, s.staff_id as staff_code
     FROM bookings b
     LEFT JOIN members m ON b.member_id = m.id
     LEFT JOIN staff s ON b.assigned_to = s.id
     ${whereClause}
     ORDER BY b.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return {
    data: bookings as Booking[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function updateBooking(id: number, data: Partial<{
  member_id: number;
  visitor_name: string;
  visitor_phone: string;
  visitor_email: string;
  service_type: string;
  session_type: string;
  preferred_date: string;
  preferred_time: string;
  meeting_type: string;
  reason: string;
  preferred_contact: string;
  status: string;
  assigned_to: number;
  case_id: number;
  notes: string;
}>): Promise<Booking> {
  const now = new Date().toISOString();
  const fields: string[] = [];
  const params: any[] = [];

  if (data.member_id !== undefined) { fields.push('member_id = ?'); params.push(data.member_id); }
  if (data.visitor_name !== undefined) { fields.push('visitor_name = ?'); params.push(data.visitor_name); }
  if (data.visitor_phone !== undefined) { fields.push('visitor_phone = ?'); params.push(data.visitor_phone); }
  if (data.visitor_email !== undefined) { fields.push('visitor_email = ?'); params.push(data.visitor_email); }
  if (data.service_type !== undefined) { fields.push('service_type = ?'); params.push(data.service_type); }
  if (data.session_type !== undefined) { fields.push('session_type = ?'); params.push(data.session_type); }
  if (data.preferred_date !== undefined) { fields.push('preferred_date = ?'); params.push(data.preferred_date); }
  if (data.preferred_time !== undefined) { fields.push('preferred_time = ?'); params.push(data.preferred_time); }
  if (data.meeting_type !== undefined) { fields.push('meeting_type = ?'); params.push(data.meeting_type); }
  if (data.reason !== undefined) { fields.push('reason = ?'); params.push(data.reason); }
  if (data.preferred_contact !== undefined) { fields.push('preferred_contact = ?'); params.push(data.preferred_contact); }
  if (data.status !== undefined) { fields.push('status = ?'); params.push(data.status); }
  if (data.assigned_to !== undefined) { fields.push('assigned_to = ?'); params.push(data.assigned_to); }
  if (data.case_id !== undefined) { fields.push('case_id = ?'); params.push(data.case_id); }
  if (data.notes !== undefined) { fields.push('notes = ?'); params.push(data.notes); }

  fields.push('updated_at = ?');
  params.push(now);
  params.push(id);

  await query(`UPDATE bookings SET ${fields.join(', ')} WHERE id = ?`, params);

  const results = await query('SELECT * FROM bookings WHERE id = ?', [id]);
  return results[0] as Booking;
}

export async function deleteBooking(id: number): Promise<boolean> {
  await query('DELETE FROM bookings WHERE id = ?', [id]);
  return true;
}

export async function getBookingsByMember(memberId: number): Promise<Booking[]> {
  const results = await query(
    'SELECT * FROM bookings WHERE member_id = ? ORDER BY preferred_date DESC',
    [memberId]
  );
  return results as Booking[];
}

export async function getBookingsByDate(date: string): Promise<Booking[]> {
  const results = await query(
    'SELECT * FROM bookings WHERE preferred_date = ? ORDER BY preferred_time ASC',
    [date]
  );
  return results as Booking[];
}

export async function getBookingsByStaff(staffId: number): Promise<Booking[]> {
  const results = await query(
    'SELECT * FROM bookings WHERE assigned_to = ? ORDER BY preferred_date DESC',
    [staffId]
  );
  return results as Booking[];
}

export async function getTodayBookings(): Promise<Booking[]> {
  const today = new Date().toISOString().split('T')[0];
  const results = await query(
    `SELECT b.*, m.member_id as member_code, s.staff_id as staff_code
     FROM bookings b
     LEFT JOIN members m ON b.member_id = m.id
     LEFT JOIN staff s ON b.assigned_to = s.id
     WHERE b.preferred_date = ?
     ORDER BY b.preferred_time ASC`,
    [today]
  );
  return results as Booking[];
}

export async function getUpcomingBookings(): Promise<Booking[]> {
  const today = new Date().toISOString().split('T')[0];
  const results = await query(
    `SELECT b.*, m.member_id as member_code, s.staff_id as staff_code
     FROM bookings b
     LEFT JOIN members m ON b.member_id = m.id
     LEFT JOIN staff s ON b.assigned_to = s.id
     WHERE b.preferred_date >= ? AND b.status IN ('pending', 'confirmed')
     ORDER BY b.preferred_date ASC, b.preferred_time ASC`,
    [today]
  );
  return results as Booking[];
}

export async function cancelBooking(id: number): Promise<Booking> {
  const now = new Date().toISOString();
  await query('UPDATE bookings SET status = ?, updated_at = ? WHERE id = ?', ['cancelled', now, id]);
  const results = await query('SELECT * FROM bookings WHERE id = ?', [id]);
  return results[0] as Booking;
}

export async function confirmBooking(id: number): Promise<Booking> {
  const now = new Date().toISOString();
  await query('UPDATE bookings SET status = ?, updated_at = ? WHERE id = ?', ['confirmed', now, id]);
  const results = await query('SELECT * FROM bookings WHERE id = ?', [id]);
  return results[0] as Booking;
}

export async function getBookingsForCalendar(staffId: number, startDate: string, endDate: string): Promise<Booking[]> {
  const results = await query(
    `SELECT b.*, m.member_id as member_code, s.staff_id as staff_code
     FROM bookings b
     LEFT JOIN members m ON b.member_id = m.id
     LEFT JOIN staff s ON b.assigned_to = s.id
     WHERE b.assigned_to = ? AND b.preferred_date >= ? AND b.preferred_date <= ?
     ORDER BY b.preferred_date ASC, b.preferred_time ASC`,
    [staffId, startDate, endDate]
  );
  return results as Booking[];
}
