import { AuthRequest } from '../types/index';
import * as followupService from '../services/followupService';
import { Response } from 'express';

export const createFollowupHandler = async (req: AuthRequest, res: Response) => {
  try {
    const followup = await followupService.createFollowup(req.body);
    res.status(201).json(followup);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllFollowupsHandler = async (req: AuthRequest, res: Response) => {
  try {
    const filter = {
      status: req.query.status as string,
      followup_type: req.query.followup_type as string,
      priority: req.query.priority as string,
      search: req.query.search as string,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
    };
    const followups = await followupService.getAllFollowups(filter);
    res.status(200).json(followups);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getFollowupHandler = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const followup = await followupService.getFollowupById(id);
    if (!followup) {
      return res.status(404).json({ message: 'Follow-up not found' });
    }
    res.status(200).json(followup);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateFollowupHandler = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const followup = await followupService.updateFollowup(id, req.body);
    res.status(200).json(followup);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const completeFollowupHandler = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const followup = await followupService.completeFollowup(id);
    res.status(200).json(followup);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getOverdueFollowupsHandler = async (req: AuthRequest, res: Response) => {
  try {
    const followups = await followupService.getOverdueFollowups();
    res.status(200).json(followups);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getTodayFollowupsHandler = async (req: AuthRequest, res: Response) => {
  try {
    const followups = await followupService.getTodayFollowups();
    res.status(200).json(followups);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getFollowupStatsHandler = async (req: AuthRequest, res: Response) => {
  try {
    const stats = await followupService.getFollowupStats();
    res.status(200).json(stats);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getFollowupsByStaffHandler = async (req: AuthRequest, res: Response) => {
  try {
    const staffId = parseInt(req.params.staffId);
    const followups = await followupService.getFollowupsByStaff(staffId);
    res.status(200).json(followups);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
