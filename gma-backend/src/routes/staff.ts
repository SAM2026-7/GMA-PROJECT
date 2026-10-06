import { Router } from 'express';
import { authMiddleware, requireStaffOrAdmin } from '../middleware/auth';
import {
  createStaffHandler,
  getAllStaffHandler,
  getPublicStaffHandler,
  getStaffByIdHandler,
  updateStaffHandler,
  deleteStaffHandler,
  getStaffAvailabilityHandler,
  getStaffWorkloadHandler,
} from '../controllers/staffController';

export const staffRouter = Router();

staffRouter.get('/public', getPublicStaffHandler);
staffRouter.use(authMiddleware, requireStaffOrAdmin);

staffRouter.get('/workload', getStaffWorkloadHandler);
staffRouter.get('/', getAllStaffHandler);
staffRouter.get('/:id', getStaffByIdHandler);
staffRouter.get('/:id/availability', getStaffAvailabilityHandler);
staffRouter.post('/', createStaffHandler);
staffRouter.put('/:id', updateStaffHandler);
staffRouter.delete('/:id', deleteStaffHandler);
