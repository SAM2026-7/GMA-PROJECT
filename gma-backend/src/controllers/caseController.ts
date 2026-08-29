import { Response } from 'express';
import {
  createCase,
  getAllCases,
  getCaseById,
  updateCase,
  deleteCase,
  getCaseSessions,
  getCaseTimeline,
  assignCase,
  escalateCase,
} from '../services/caseService';
import { AuthRequest } from '../types/index';

export async function createCaseHandler(req: AuthRequest, res: Response) {
  try {
    const { member_id, category, title, assigned_counselor, priority, description } = req.body;
    if (!member_id || !category) {
      return res.status(400).json({ error: 'member_id and category are required' });
    }
    const newCase = await createCase({ member_id, category, title, assigned_counselor, priority, description });
    return res.status(201).json({ success: true, data: newCase });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create case' });
  }
}

export async function getAllCasesHandler(req: AuthRequest, res: Response) {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const result = await getAllCases({
      page,
      limit,
      category: req.query.category as string | undefined,
      priority: req.query.priority as string | undefined,
      status: req.query.status as string | undefined,
      assigned_counselor: req.query.assigned_counselor ? parseInt(req.query.assigned_counselor as string) : undefined,
      member_id: req.query.member_id ? parseInt(req.query.member_id as string) : undefined,
      search: req.query.search as string | undefined,
    });
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch cases' });
  }
}

export async function getCaseHandler(req: AuthRequest, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const caseRecord = await getCaseById(id);
    if (!caseRecord) {
      return res.status(404).json({ error: 'Case not found' });
    }
    return res.status(200).json({ success: true, data: caseRecord });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch case' });
  }
}

export async function updateCaseHandler(req: AuthRequest, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const existing = await getCaseById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Case not found' });
    }
    const updated = await updateCase(id, req.body);
    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update case' });
  }
}

export async function deleteCaseHandler(req: AuthRequest, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const deleted = await deleteCase(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Case not found' });
    }
    return res.status(200).json({ success: true, message: 'Case deleted' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete case' });
  }
}

export async function getCaseSessionsHandler(req: AuthRequest, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const sessions = await getCaseSessions(id);
    return res.status(200).json({ success: true, data: sessions });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch case sessions' });
  }
}

export async function getCaseTimelineHandler(req: AuthRequest, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const timeline = await getCaseTimeline(id);
    return res.status(200).json({ success: true, data: timeline });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch case timeline' });
  }
}

export async function assignCaseHandler(req: AuthRequest, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const { counselorId } = req.body;
    if (!counselorId) {
      return res.status(400).json({ error: 'counselorId is required' });
    }
    const updated = await assignCase(id, counselorId);
    if (!updated) {
      return res.status(404).json({ error: 'Case not found' });
    }
    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to assign case' });
  }
}

export async function escalateCaseHandler(req: AuthRequest, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const { priority } = req.body;
    if (!priority) {
      return res.status(400).json({ error: 'priority is required' });
    }
    const updated = await escalateCase(id, priority);
    if (!updated) {
      return res.status(404).json({ error: 'Case not found' });
    }
    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to escalate case' });
  }
}
