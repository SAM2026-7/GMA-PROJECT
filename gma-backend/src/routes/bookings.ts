import { Router } from 'express';
import {
  createBookingHandler,
  getAllBookingsHandler,
  getBookingHandler,
  updateBookingHandler,
  deleteBookingHandler,
  confirmBookingHandler,
  cancelBookingHandler,
  getTodayBookingsHandler,
  getBookingsByMemberHandler,
  getCalendarHandler,
} from '../controllers/bookingController';
import { authMiddleware, requireStaffOrAdmin } from '../middleware/auth';

export const bookingsRouter = Router();

bookingsRouter.post('/', createBookingHandler);

bookingsRouter.use(authMiddleware);

bookingsRouter.get('/member/:memberId', getBookingsByMemberHandler);
bookingsRouter.get('/today', requireStaffOrAdmin, getTodayBookingsHandler);
bookingsRouter.get('/calendar', requireStaffOrAdmin, getCalendarHandler);
bookingsRouter.get('/', getAllBookingsHandler);
bookingsRouter.get('/:id', getBookingHandler);
bookingsRouter.put('/:id', requireStaffOrAdmin, updateBookingHandler);
bookingsRouter.patch('/:id/confirm', requireStaffOrAdmin, confirmBookingHandler);
bookingsRouter.patch('/:id/cancel', requireStaffOrAdmin, cancelBookingHandler);
bookingsRouter.delete('/:id', requireStaffOrAdmin, deleteBookingHandler);
