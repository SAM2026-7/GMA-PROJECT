import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getSiteSettingsHandler,
  updateSiteSettingsHandler,
} from '../controllers/siteSettingsController';

export const siteSettingsRouter = Router();

siteSettingsRouter.get('/', getSiteSettingsHandler);
siteSettingsRouter.put('/', authMiddleware, updateSiteSettingsHandler);
