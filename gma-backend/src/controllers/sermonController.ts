import { Response } from 'express';
import { AuthRequest } from '../types/index';
import { createSermon, getAllSermons, getSermonById, updateSermon, deleteSermon, getRecentSermons } from '../services/sermonService';

export async function createSermonHandler(req: AuthRequest, res: Response) {
  try {
    const { title, speaker, category, description, scripture_reference, audio_url, video_url, notes_url, thumbnail_url, duration_minutes, series_name, series_order, status, published_at } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    const sermon = await createSermon({ title, speaker, category, description, scripture_reference, audio_url, video_url, notes_url, thumbnail_url, duration_minutes, series_name, series_order, status, published_at, created_by: req.user?.id });
    return res.status(201).json({ success: true, data: sermon });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create sermon' });
  }
}

export async function getAllSermonsHandler(req: AuthRequest, res: Response) {
  try {
    const { status, category, speaker, search, page, limit } = req.query;
    const result = await getAllSermons({
      status: status as string,
      category: category as string,
      speaker: speaker as string,
      search: search as string,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch sermons' });
  }
}

export async function getSermonByIdHandler(req: AuthRequest, res: Response) {
  try {
    const id = Number(req.params.id);
    const sermon = await getSermonById(id);
    if (!sermon) {
      return res.status(404).json({ error: 'Sermon not found' });
    }
    return res.status(200).json({ success: true, data: sermon });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch sermon' });
  }
}

export async function updateSermonHandler(req: AuthRequest, res: Response) {
  try {
    const id = Number(req.params.id);
    const { title, speaker, category, description, scripture_reference, audio_url, video_url, notes_url, thumbnail_url, duration_minutes, series_name, series_order, status, published_at } = req.body;
    const sermon = await updateSermon(id, { title, speaker, category, description, scripture_reference, audio_url, video_url, notes_url, thumbnail_url, duration_minutes, series_name, series_order, status, published_at });
    return res.status(200).json({ success: true, data: sermon });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update sermon';
    return res.status(404).json({ error: message });
  }
}

export async function deleteSermonHandler(req: AuthRequest, res: Response) {
  try {
    const id = Number(req.params.id);
    await deleteSermon(id);
    return res.status(200).json({ success: true, message: 'Sermon deleted successfully' });
  } catch (error) {
    return res.status(404).json({ error: 'Sermon not found' });
  }
}

export async function getRecentSermonsHandler(req: AuthRequest, res: Response) {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 5;
    const sermons = await getRecentSermons(limit);
    return res.status(200).json({ success: true, data: sermons });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch recent sermons' });
  }
}
