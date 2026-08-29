import { Response } from 'express';
import {
  createSession,
  getAllSessions,
  getSessionById,
  updateSession,
  deleteSession,
  getSessionsByCase,
  getSessionsByMember,
  getCounselorStats,
} from '../services/sessionService';
import { AuthRequest } from '../types/index';

export async function createSessionHandler(req: AuthRequest, res: Response) {
  try {
    const { counselor_id, member_id, session_type, session_date } = req.body;
    if (!counselor_id || !member_id || !session_type || !session_date) {
      return res.status(400).json({ error: 'counselor_id, member_id, session_type, and session_date are required' });
    }
    const session = await createSession(req.body);
    return res.status(201).json({ success: true, data: session });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create session' });
  }
}

export async function getAllSessionsHandler(req: AuthRequest, res: Response) {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const result = await getAllSessions({
      page,
      limit,
      case_id: req.query.case_id ? parseInt(req.query.case_id as string) : undefined,
      member_id: req.query.member_id ? parseInt(req.query.member_id as string) : undefined,
      counselor_id: req.query.counselor_id ? parseInt(req.query.counselor_id as string) : undefined,
      session_type: req.query.session_type as string | undefined,
      start_date: req.query.start_date as string | undefined,
      end_date: req.query.end_date as string | undefined,
      attendance: req.query.attendance as string | undefined,
      search: req.query.search as string | undefined,
    });
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch sessions' });
  }
}

export async function getSessionHandler(req: AuthRequest, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const session = await getSessionById(id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    return res.status(200).json({ success: true, data: session });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch session' });
  }
}

export async function updateSessionHandler(req: AuthRequest, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const existing = await getSessionById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Session not found' });
    }
    const updated = await updateSession(id, req.body);
    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update session' });
  }
}

export async function deleteSessionHandler(req: AuthRequest, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const existing = await getSessionById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Session not found' });
    }
    await deleteSession(id);
    return res.status(200).json({ success: true, message: 'Session deleted' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete session' });
  }
}

export async function getSessionsByCaseHandler(req: AuthRequest, res: Response) {
  try {
    const caseId = parseInt(req.params.caseId);
    const sessions = await getSessionsByCase(caseId);
    return res.status(200).json({ success: true, data: sessions });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch sessions by case' });
  }
}

export async function getSessionsByMemberHandler(req: AuthRequest, res: Response) {
  try {
    const memberId = parseInt(req.params.memberId);
    const sessions = await getSessionsByMember(memberId);
    return res.status(200).json({ success: true, data: sessions });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch sessions by member' });
  }
}

export async function getCounselorStatsHandler(req: AuthRequest, res: Response) {
  try {
    const counselorId = parseInt(req.params.counselorId);
    const stats = await getCounselorStats(counselorId);
    return res.status(200).json({ success: true, data: stats });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch counselor stats' });
  }
}
