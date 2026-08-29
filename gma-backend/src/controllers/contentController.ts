import { Response } from 'express';
import { AuthRequest } from '../types/index';
import { getAllContent, updateSiteSetting, updateSection, createTestimony, getAllTestimonies, approveTestimony, rejectTestimony, getApprovedTestimonies, createProject, getAllProjects, updateProject, deleteProject, createAnnouncement, getAllAnnouncements, updateAnnouncement, deleteAnnouncement, getActiveAnnouncements } from '../services/contentService';

export async function getPublicContent(_req: AuthRequest, res: Response) {
  try {
    const content = await getAllContent();
    return res.status(200).json({ success: true, data: content });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch content' });
  }
}

export async function updateSettingHandler(req: AuthRequest, res: Response) {
  try {
    const { key, value } = req.body;
    if (!key || value === undefined) {
      return res.status(400).json({ error: 'Key and value are required' });
    }
    const result = await updateSiteSetting(key, value);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update setting' });
  }
}

export async function updateSectionHandler(req: AuthRequest, res: Response) {
  try {
    const { page_slug, section_key, title, content, image_url } = req.body;
    if (!page_slug || !section_key) {
      return res.status(400).json({ error: 'page_slug and section_key are required' });
    }
    const pages = await require('../db/index').query('SELECT id FROM pages WHERE slug = ?', [page_slug]);
    if (!pages.length) {
      return res.status(404).json({ error: 'Page not found' });
    }
    const result = await updateSection(pages[0].id, section_key, { title, content, image_url });
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update section' });
  }
}

export async function createTestimonyHandler(req: AuthRequest, res: Response) {
  try {
    const { author_name, title, content, category } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
    const testimony = await createTestimony({ author_name, title, content, category, member_id: req.user?.id });
    return res.status(201).json({ success: true, data: testimony });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create testimony' });
  }
}

export async function getAllTestimoniesHandler(req: AuthRequest, res: Response) {
  try {
    const { status, category, search, page, limit } = req.query;
    const result = await getAllTestimonies({
      status: status as string,
      category: category as string,
      search: search as string,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch testimonies' });
  }
}

export async function getApprovedTestimoniesHandler(req: AuthRequest, res: Response) {
  try {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const result = await getApprovedTestimonies(page, limit);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch testimonies' });
  }
}

export async function approveTestimonyHandler(req: AuthRequest, res: Response) {
  try {
    const id = Number(req.params.id);
    const testimony = await approveTestimony(id);
    return res.status(200).json({ success: true, data: testimony });
  } catch (error) {
    return res.status(404).json({ error: 'Testimony not found' });
  }
}

export async function rejectTestimonyHandler(req: AuthRequest, res: Response) {
  try {
    const id = Number(req.params.id);
    const testimony = await rejectTestimony(id);
    return res.status(200).json({ success: true, data: testimony });
  } catch (error) {
    return res.status(404).json({ error: 'Testimony not found' });
  }
}

export async function createProjectHandler(req: AuthRequest, res: Response) {
  try {
    const { title, description, category, target_amount, current_amount, start_date, end_date, image_url, status } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    const project = await createProject({ title, description, category, target_amount, current_amount, start_date, end_date, image_url, status, created_by: req.user?.id });
    return res.status(201).json({ success: true, data: project });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create project' });
  }
}

export async function getAllProjectsHandler(req: AuthRequest, res: Response) {
  try {
    const { status, category, search, page, limit } = req.query;
    const result = await getAllProjects({
      status: status as string,
      category: category as string,
      search: search as string,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch projects' });
  }
}

export async function updateProjectHandler(req: AuthRequest, res: Response) {
  try {
    const id = Number(req.params.id);
    const { title, description, category, target_amount, current_amount, start_date, end_date, image_url, status } = req.body;
    const project = await updateProject(id, { title, description, category, target_amount, current_amount, start_date, end_date, image_url, status });
    return res.status(200).json({ success: true, data: project });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update project';
    return res.status(404).json({ error: message });
  }
}

export async function deleteProjectHandler(req: AuthRequest, res: Response) {
  try {
    const id = Number(req.params.id);
    await deleteProject(id);
    return res.status(200).json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    return res.status(404).json({ error: 'Project not found' });
  }
}

export async function createAnnouncementHandler(req: AuthRequest, res: Response) {
  try {
    const { title, content, audience, target_audience, category, priority, start_date, end_date, image_url, status } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
    const announcement = await createAnnouncement({ title, content, target_audience: target_audience || audience, category, priority, start_date, end_date, image_url, status, created_by: req.user?.id });
    return res.status(201).json({ success: true, data: announcement });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create announcement' });
  }
}

export async function getAllAnnouncementsHandler(req: AuthRequest, res: Response) {
  try {
    const { status, category, search, page, limit } = req.query;
    const result = await getAllAnnouncements({
      status: status as string,
      category: category as string,
      search: search as string,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch announcements' });
  }
}

export async function getActiveAnnouncementsHandler(req: AuthRequest, res: Response) {
  try {
    const announcements = await getActiveAnnouncements();
    return res.status(200).json({ success: true, data: announcements });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch active announcements' });
  }
}

export async function updateAnnouncementHandler(req: AuthRequest, res: Response) {
  try {
    const id = Number(req.params.id);
    const { title, content, audience, target_audience, category, priority, start_date, end_date, image_url, status } = req.body;
    const announcement = await updateAnnouncement(id, { title, content, target_audience: target_audience || audience, category, priority, start_date, end_date, image_url, status });
    return res.status(200).json({ success: true, data: announcement });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update announcement';
    return res.status(404).json({ error: message });
  }
}

export async function deleteAnnouncementHandler(req: AuthRequest, res: Response) {
  try {
    const id = Number(req.params.id);
    await deleteAnnouncement(id);
    return res.status(200).json({ success: true, message: 'Announcement deleted successfully' });
  } catch (error) {
    return res.status(404).json({ error: 'Announcement not found' });
  }
}
