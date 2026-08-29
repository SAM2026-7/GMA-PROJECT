import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
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
membersRouter.get('/search', searchMembersHandler);
membersRouter.get('/', getAllMembersHandler);
membersRouter.get('/:id', getMember);
membersRouter.get('/:id/timeline', getMemberTimeline);
membersRouter.put('/:id', updateMemberById);
membersRouter.delete('/:id', deleteMember);
