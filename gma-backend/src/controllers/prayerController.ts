import { AuthRequest } from '../types/index';
import * as prayerService from '../services/prayerService';
import { Response } from 'express';
import { isStaffUser, resolveMemberId } from '../middleware/auth';
import { sendAutoResponse } from '../services/emailService';

export const createPrayerRequestHandler = async (req: AuthRequest, res: Response) => {
  try {
    const data = { ...req.body };
    if (data.name && !data.visitor_name) {
      data.visitor_name = data.name;
    }
    if (data.request && !data.text) {
      data.text = data.request;
    }
    if (data.description && !data.text) {
      data.text = data.description;
    }
    const memberId = req.user ? await resolveMemberId(req) : null;
    const prayerRequest = await prayerService.createPrayerRequest({
      member_id: memberId === null ? undefined : memberId,
      visitor_name: data.visitor_name,
      category: data.category,
      text: data.text,
      urgency: data.urgency,
      visibility: data.visibility,
      follow_up_date: data.follow_up_date,
      notes: data.notes,
    });
    
    const visitorEmail = data.visitor_email || data.email;
    const visitorName = data.visitor_name || data.name || 'Friend';
    if (visitorEmail) {
      sendAutoResponse({
        to: visitorEmail,
        name: visitorName,
        type: 'prayer',
        referenceId: prayerRequest.request_id,
      }).catch(() => {});
    }
    
    res.status(201).json({ success: true, data: prayerRequest });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllPrayerRequestsHandler = async (req: AuthRequest, res: Response) => {
  try {
    const filter: any = {
      status: req.query.status as string,
      category: req.query.category as string,
      urgency: req.query.urgency as string,
      visibility: req.query.visibility as string,
      search: req.query.search as string,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
    };
    if (!isStaffUser(req)) {
      const ownId = await resolveMemberId(req);
      if (ownId === null) {
        return res.status(200).json({ success: true, data: [], total: 0, page: 1, limit: 20, totalPages: 0 });
      }
      filter.member_id = ownId;
    }
    const prayerRequests = await prayerService.getAllPrayerRequests(filter);
    res.status(200).json(prayerRequests);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getPrayerRequestHandler = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const prayerRequest = await prayerService.getPrayerRequestById(id);
    if (!prayerRequest) {
      return res.status(404).json({ message: 'Prayer request not found' });
    }
    if (!isStaffUser(req)) {
      const ownId = await resolveMemberId(req);
      if (ownId === null || prayerRequest.member_id !== ownId) {
        return res.status(403).json({ message: 'You can only view your own prayer requests' });
      }
    }
    res.status(200).json({ success: true, data: prayerRequest });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePrayerRequestHandler = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const prayerRequest = await prayerService.updatePrayerRequest(id, req.body);
    res.status(200).json(prayerRequest);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const incrementPrayedCountHandler = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await prayerService.incrementPrayedCount(id);
    res.status(200).json({ message: 'Prayed count incremented' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const assignTeamHandler = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const team = req.body.team;
    const prayerRequest = await prayerService.assignTeam(id, team);
    res.status(200).json(prayerRequest);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const markAnsweredHandler = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const prayerRequest = await prayerService.markAnswered(id);
    res.status(200).json(prayerRequest);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getPublicPrayerWallHandler = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const prayerRequests = await prayerService.getPublicPrayerWall(page, limit);
    res.status(200).json(prayerRequests);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getPrayerStatsHandler = async (req: AuthRequest, res: Response) => {
  try {
    const stats = await prayerService.getPrayerStats();
    res.status(200).json(stats);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
