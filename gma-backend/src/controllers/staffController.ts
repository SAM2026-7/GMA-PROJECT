import { Response } from 'express';
import { AuthRequest } from '../types/index';
import {
  createStaff,
  getStaffById,
  getAllStaff,
  updateStaff,
  deleteStaff,
  getStaffAvailability,
  getStaffWorkload,
} from '../services/staffService';

export async function createStaffHandler(req: AuthRequest, res: Response) {
  try {
    const { email, password, name, role, position, department, specialization, bio, availability, max_daily_sessions } = req.body;
    if (!email || !password || !name || !role || !position || !department) {
      return res.status(400).json({ error: 'Email, password, name, role, position, and department are required' });
    }
    const staff = await createStaff(
      { email, password, name, role },
      { position, department, specialization, bio, availability, max_daily_sessions }
    );
    return res.status(201).json({ success: true, data: staff });
  } catch (error) {
    return res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to create staff' });
  }
}

export async function getAllStaffHandler(req: AuthRequest, res: Response) {
  try {
    const { department, availability, role, search, page, limit } = req.query;
    const result = await getAllStaff({
      department: department as string,
      availability: availability as string,
      role: role as string,
      search: search as string,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch staff' });
  }
}

export async function getStaffByIdHandler(req: AuthRequest, res: Response) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid staff ID' });
    }
    const staff = await getStaffById(id);
    if (!staff) {
      return res.status(404).json({ error: 'Staff not found' });
    }
    return res.status(200).json({ success: true, data: staff });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch staff' });
  }
}

export async function updateStaffHandler(req: AuthRequest, res: Response) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid staff ID' });
    }
    const updated = await updateStaff(id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Staff not found' });
    }
    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    return res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to update staff' });
  }
}

export async function deleteStaffHandler(req: AuthRequest, res: Response) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid staff ID' });
    }
    const deleted = await deleteStaff(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Staff not found' });
    }
    return res.status(200).json({ success: true, message: 'Staff deleted' });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to delete staff' });
  }
}

export async function getStaffAvailabilityHandler(req: AuthRequest, res: Response) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid staff ID' });
    }
    const date = req.query.date as string;
    if (!date) {
      return res.status(400).json({ error: 'Date query parameter is required' });
    }
    const availability = await getStaffAvailability(id, date);
    if (!availability) {
      return res.status(404).json({ error: 'Staff not found' });
    }
    return res.status(200).json({ success: true, data: availability });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch availability' });
  }
}

export async function getStaffWorkloadHandler(req: AuthRequest, res: Response) {
  try {
    const workload = await getStaffWorkload();
    return res.status(200).json({ success: true, data: workload });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch workload' });
  }
}
