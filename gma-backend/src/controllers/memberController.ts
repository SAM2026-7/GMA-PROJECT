import { Response } from 'express';
import { AuthRequest } from '../types/index';
import {
  getMemberByUserId,
  getMemberById,
  getAllMembers,
  updateMember,
  deleteMember as deleteMemberService,
  getMemberTimeline as getMemberTimelineService,
  searchMembers,
} from '../services/memberService';

export async function getMe(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const member = await getMemberByUserId(req.user.id);
    if (!member) {
      return res.status(404).json({ error: 'Member profile not found' });
    }
    return res.status(200).json({ success: true, data: member });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch member profile' });
  }
}

export async function updateMe(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const member = await getMemberByUserId(req.user.id);
    if (!member) {
      return res.status(404).json({ error: 'Member profile not found' });
    }
    const updated = await updateMember(member.id, req.body);
    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    return res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to update profile' });
  }
}

export async function getMember(req: AuthRequest, res: Response) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid member ID' });
    }
    const member = await getMemberById(id);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }
    return res.status(200).json({ success: true, data: member });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch member' });
  }
}

export async function getAllMembersHandler(req: AuthRequest, res: Response) {
  try {
    const { status, branch, search, page, limit } = req.query;
    const result = await getAllMembers({
      status: status as string,
      branch: branch as string,
      search: search as string,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch members' });
  }
}

export async function searchMembersHandler(req: AuthRequest, res: Response) {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    const members = await searchMembers(q as string);
    return res.status(200).json({ success: true, data: members });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to search members' });
  }
}

export async function getMemberTimeline(req: AuthRequest, res: Response) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid member ID' });
    }
    const member = await getMemberById(id);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }
    const timeline = await getMemberTimelineService(id);
    return res.status(200).json({ success: true, data: timeline });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch timeline' });
  }
}

export async function deleteMember(req: AuthRequest, res: Response) {
  try {
    if (!req.user || req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Only super admins can delete members' });
    }
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid member ID' });
    }
    const member = await getMemberById(id);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }
    await deleteMemberService(id);
    return res.status(200).json({ success: true, message: 'Member deleted' });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to delete member' });
  }
}

export async function updateMemberById(req: AuthRequest, res: Response) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid member ID' });
    }
    const member = await getMemberById(id);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }
    const updated = await updateMember(id, req.body);
    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    return res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to update member' });
  }
}


