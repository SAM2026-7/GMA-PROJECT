import { Router } from 'express';
import { getPublicContent, updateSettingHandler, updateSectionHandler, createTestimonyHandler, getAllTestimoniesHandler, getApprovedTestimoniesHandler, approveTestimonyHandler, rejectTestimonyHandler, createProjectHandler, getAllProjectsHandler, updateProjectHandler, deleteProjectHandler, createAnnouncementHandler, getAllAnnouncementsHandler, getActiveAnnouncementsHandler, updateAnnouncementHandler, deleteAnnouncementHandler } from '../controllers/contentController';
import { authMiddleware } from '../middleware/auth';

export const contentRouter = Router();

contentRouter.get('/', getPublicContent);
contentRouter.post('/testimonies', createTestimonyHandler);
contentRouter.get('/testimonies/approved', getApprovedTestimoniesHandler);
contentRouter.get('/projects', getAllProjectsHandler);
contentRouter.get('/announcements/active', getActiveAnnouncementsHandler);

contentRouter.use(authMiddleware);
contentRouter.put('/settings', updateSettingHandler);
contentRouter.put('/sections', updateSectionHandler);
contentRouter.get('/testimonies', getAllTestimoniesHandler);
contentRouter.patch('/testimonies/:id/approve', approveTestimonyHandler);
contentRouter.patch('/testimonies/:id/reject', rejectTestimonyHandler);
contentRouter.post('/projects', createProjectHandler);
contentRouter.put('/projects/:id', updateProjectHandler);
contentRouter.delete('/projects/:id', deleteProjectHandler);
contentRouter.post('/announcements', createAnnouncementHandler);
contentRouter.get('/announcements', getAllAnnouncementsHandler);
contentRouter.put('/announcements/:id', updateAnnouncementHandler);
contentRouter.delete('/announcements/:id', deleteAnnouncementHandler);
