import { AuthRequest } from '../types/index';
import * as chatService from '../services/chatService';
import { Response } from 'express';

export const createConversationHandler = async (req: AuthRequest, res: Response) => {
  try {
    const { memberId, counselorId, caseId, category } = req.body;
    const conversation = await chatService.createConversation(memberId, counselorId, caseId, category);
    res.status(201).json(conversation);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getConversationsByMemberHandler = async (req: AuthRequest, res: Response) => {
  try {
    const memberId = parseInt(req.params.memberId);
    const conversations = await chatService.getConversationsByMember(memberId);
    res.status(200).json(conversations);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getConversationsByCounselorHandler = async (req: AuthRequest, res: Response) => {
  try {
    const counselorId = parseInt(req.params.counselorId);
    const conversations = await chatService.getConversationsByCounselor(counselorId);
    res.status(200).json(conversations);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const sendMessageHandler = async (req: AuthRequest, res: Response) => {
  try {
    const { conversationId, senderId, senderType, message, message_type, attachment_url } = req.body;
    const sent = await chatService.sendMessage(conversationId, senderId, senderType, { message, message_type, attachment_url });
    res.status(201).json(sent);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getMessagesHandler = async (req: AuthRequest, res: Response) => {
  try {
    const conversationId = parseInt(req.params.conversationId);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const messages = await chatService.getMessages(conversationId, page, limit);
    res.status(200).json(messages);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const markAsReadHandler = async (req: AuthRequest, res: Response) => {
  try {
    const { conversationId, userId, userType } = req.body;
    await chatService.markAsRead(conversationId, userId, userType);
    res.status(200).json({ message: 'Messages marked as read' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const searchMessagesHandler = async (req: AuthRequest, res: Response) => {
  try {
    const conversationId = parseInt(req.params.conversationId);
    const q = req.query.q as string;
    const messages = await chatService.searchMessages(conversationId, q);
    res.status(200).json(messages);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getUnreadCountHandler = async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const userType = (req.query.type as string) || 'member';
    const count = await chatService.getUnreadCount(userId, userType);
    res.status(200).json({ count });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllConversationsHandler = async (req: AuthRequest, res: Response) => {
  try {
    const result = await chatService.getAllConversations({});
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
