import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  createStaffHandler,
  getAllStaffHandler,
  getStaffByIdHandler,
  updateStaffHandler,
  deleteStaffHandler,
  getStaffAvailabilityHandler,
  getStaffWorkloadHandler,
} from '../controllers/staffController';

export const staffRouter = Router();

staffRouter.use(authMiddleware);

staffRouter.get('/workload', getStaffWorkloadHandler);
staffRouter.get('/', getAllStaffHandler);
staffRouter.get('/:id', getStaffByIdHandler);
staffRouter.get('/:id/availability', getStaffAvailabilityHandler);
staffRouter.post('/', createStaffHandler);
staffRouter.put('/:id', updateStaffHandler);
staffRouter.delete('/:id', deleteStaffHandler);
