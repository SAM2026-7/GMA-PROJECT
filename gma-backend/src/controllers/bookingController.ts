import { Response } from 'express';
import {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  confirmBooking,
  cancelBooking,
  getTodayBookings,
  getBookingsByMember,
  getBookingsForCalendar,
} from '../services/bookingService';
import { AuthRequest } from '../types/index';
import { isStaffUser, resolveMemberId } from '../middleware/auth';
import { sendAutoResponse, sendAdminAlert } from '../services/emailService';

export async function createBookingHandler(req: AuthRequest, res: Response) {
  try {
    const data = { ...req.body };
    if (data.fullName && !data.visitor_name) {
      data.visitor_name = data.fullName;
    }
    if (data.name && !data.visitor_name) {
      data.visitor_name = data.name;
    }
    if (data.phone && !data.visitor_phone) {
      data.visitor_phone = data.phone;
    }
    if (data.email && !data.visitor_email) {
      data.visitor_email = data.email;
    }
    if (data.preferredDate && !data.preferred_date) {
      data.preferred_date = data.preferredDate;
    }
    if (data.date && !data.preferred_date) {
      data.preferred_date = data.date;
    }
    if (data.preferredTime && !data.preferred_time) {
      data.preferred_time = data.preferredTime;
    }
    if (data.time && !data.preferred_time) {
      data.preferred_time = data.time;
    }
    if (data.serviceType && !data.service_type) {
      data.service_type = data.serviceType;
    }
    if (data.service && !data.service_type) {
      data.service_type = data.service;
    }
    if (data.meetingType && !data.meeting_type) {
      data.meeting_type = data.meetingType;
    }
    if (data.preferredContact && !data.preferred_contact) {
      data.preferred_contact = data.preferredContact;
    }
    if (data.sessionType && !data.session_type) {
      data.session_type = data.sessionType;
    }
    if (data.visitorPhone && !data.visitor_phone) {
      data.visitor_phone = data.visitorPhone;
    }
    if (data.visitorEmail && !data.visitor_email) {
      data.visitor_email = data.visitorEmail;
    }
    if (data.reason && !data.notes) {
      data.notes = data.reason;
    }
    const booking = await createBooking(data);
    
    if (data.visitor_email) {
      sendAutoResponse({
        to: data.visitor_email,
        name: data.visitor_name || 'Visitor',
        type: 'booking',
        referenceId: booking.booking_id,
      }).catch(() => {});
    }
    sendAdminAlert({
      name: data.visitor_name || 'Visitor',
      phone: data.visitor_phone || '',
      program: data.service_type,
      preferred_date: data.preferred_date || '',
      message: data.reason || data.notes || '',
    }).catch(() => {});
    
    return res.status(201).json({ success: true, data: booking });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create booking' });
  }
}

export async function getAllBookingsHandler(req: AuthRequest, res: Response) {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const staff = isStaffUser(req);
    let memberId = req.query.member_id ? parseInt(req.query.member_id as string) : undefined;
    if (!staff) {
      const ownId = await resolveMemberId(req);
      if (ownId === null) {
        return res.status(200).json({ success: true, data: [], total: 0, page, limit, totalPages: 0 });
      }
      memberId = ownId;
    }
    const result = await getAllBookings({
      page,
      limit,
      status: req.query.status as string | undefined,
      service_type: req.query.service_type as string | undefined,
      assigned_to: req.query.assigned_to ? parseInt(req.query.assigned_to as string) : undefined,
      member_id: memberId,
      start_date: req.query.start_date as string | undefined,
      end_date: req.query.end_date as string | undefined,
      search: req.query.search as string | undefined,
    });
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch bookings' });
  }
}

export async function getBookingHandler(req: AuthRequest, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const booking = await getBookingById(id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    if (!isStaffUser(req)) {
      const ownId = await resolveMemberId(req);
      if (ownId === null || booking.member_id !== ownId) {
        return res.status(403).json({ error: 'You can only view your own bookings' });
      }
    }
    return res.status(200).json({ success: true, data: booking });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch booking' });
  }
}

export async function updateBookingHandler(req: AuthRequest, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const existing = await getBookingById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    const updated = await updateBooking(id, req.body);
    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update booking' });
  }
}

export async function deleteBookingHandler(req: AuthRequest, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const existing = await getBookingById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    await deleteBooking(id);
    return res.status(200).json({ success: true, message: 'Booking deleted' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete booking' });
  }
}

export async function confirmBookingHandler(req: AuthRequest, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const existing = await getBookingById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    const updated = await confirmBooking(id);
    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to confirm booking' });
  }
}

export async function cancelBookingHandler(req: AuthRequest, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const existing = await getBookingById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    const updated = await cancelBooking(id);
    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to cancel booking' });
  }
}

export async function getTodayBookingsHandler(req: AuthRequest, res: Response) {
  try {
    const bookings = await getTodayBookings();
    return res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch today\'s bookings' });
  }
}

export async function getBookingsByMemberHandler(req: AuthRequest, res: Response) {
  try {
    let memberId = parseInt(req.params.memberId);
    if (!isStaffUser(req)) {
      const ownId = await resolveMemberId(req);
      if (ownId === null) return res.status(200).json({ success: true, data: [] });
      if (memberId !== ownId) {
        return res.status(403).json({ error: 'You can only view your own bookings' });
      }
      memberId = ownId;
    }
    const bookings = await getBookingsByMember(memberId);
    return res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch member bookings' });
  }
}

export async function getCalendarHandler(req: AuthRequest, res: Response) {
  try {
    const staffId = parseInt(req.query.staffId as string);
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    if (!staffId || !startDate || !endDate) {
      return res.status(400).json({ error: 'staffId, startDate, and endDate are required' });
    }
    const bookings = await getBookingsForCalendar(staffId, startDate, endDate);
    return res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch calendar bookings' });
  }
}
