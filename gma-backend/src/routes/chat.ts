import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  createConversationHandler,
  getConversationsByMemberHandler,
  getConversationsByCounselorHandler,
  sendMessageHandler,
  getMessagesHandler,
  markAsReadHandler,
  searchMessagesHandler,
  getUnreadCountHandler,
  getAllConversationsHandler,
} from '../controllers/chatController';

export const chatRouter = Router();

chatRouter.post('/conversations', authMiddleware, createConversationHandler);
chatRouter.get('/conversations/member/:memberId', authMiddleware, getConversationsByMemberHandler);
chatRouter.get('/conversations/counselor/:counselorId', authMiddleware, getConversationsByCounselorHandler);
chatRouter.get('/conversations', authMiddleware, getAllConversationsHandler);
chatRouter.post('/messages', authMiddleware, sendMessageHandler);
chatRouter.get('/messages/:conversationId', authMiddleware, getMessagesHandler);
chatRouter.patch('/messages/read', authMiddleware, markAsReadHandler);
chatRouter.get('/messages/search/:conversationId', authMiddleware, searchMessagesHandler);
chatRouter.get('/unread/:userId', authMiddleware, getUnreadCountHandler);
