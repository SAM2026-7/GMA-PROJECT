import { Response } from 'express';
import { SiteSettingsSchema } from '../utils/validators';
import { AuthRequest } from '../types';
import { getSiteSettings, updateSiteSettings } from '../services/siteSettingsService';

export async function getSiteSettingsHandler(_req: AuthRequest, res: Response) {
  try {
    const settings = await getSiteSettings();
    return res.status(200).json({ success: true, data: settings });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to load site settings' });
  }
}

export async function updateSiteSettingsHandler(req: AuthRequest, res: Response) {
  try {
    const updates = SiteSettingsSchema.parse(req.body);
    const settings = await updateSiteSettings(updates);
    return res.status(200).json({ success: true, data: settings });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation failed', details: error.message });
    }
    return res.status(500).json({ error: 'Failed to update site settings' });
  }
}
