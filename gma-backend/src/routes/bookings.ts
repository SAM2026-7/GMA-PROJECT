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
import { authMiddleware } from '../middleware/auth';

export const bookingsRouter = Router();

bookingsRouter.post('/', createBookingHandler);

bookingsRouter.use(authMiddleware);

bookingsRouter.get('/today', getTodayBookingsHandler);
bookingsRouter.get('/calendar', getCalendarHandler);
bookingsRouter.get('/member/:memberId', getBookingsByMemberHandler);
bookingsRouter.get('/', getAllBookingsHandler);
bookingsRouter.get('/:id', getBookingHandler);
bookingsRouter.put('/:id', updateBookingHandler);
bookingsRouter.patch('/:id/confirm', confirmBookingHandler);
bookingsRouter.patch('/:id/cancel', cancelBookingHandler);
bookingsRouter.delete('/:id', deleteBookingHandler);
