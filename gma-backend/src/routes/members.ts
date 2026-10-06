import { Router } from 'express';
import { authMiddleware, requireStaffOrAdmin } from '../middleware/auth';
import {
  getMe,
  updateMe,
  getMember,
  getAllMembersHandler,
  searchMembersHandler,
  getMemberTimeline,
  deleteMember,
  updateMemberById,
} from '../controllers/memberController';

export const membersRouter = Router();

membersRouter.use(authMiddleware);

membersRouter.get('/me', getMe);
membersRouter.put('/me', updateMe);

membersRouter.get('/search', requireStaffOrAdmin, searchMembersHandler);
membersRouter.get('/', requireStaffOrAdmin, getAllMembersHandler);
membersRouter.get('/:id', requireStaffOrAdmin, getMember);
membersRouter.get('/:id/timeline', requireStaffOrAdmin, getMemberTimeline);
membersRouter.put('/:id', requireStaffOrAdmin, updateMemberById);
membersRouter.delete('/:id', requireStaffOrAdmin, deleteMember);
