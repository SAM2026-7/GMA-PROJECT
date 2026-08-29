import { Router } from 'express';
import { createEventHandler, getAllEventsHandler, getEventByIdHandler, updateEventHandler, deleteEventHandler, getUpcomingEventsHandler } from '../controllers/eventController';
import { authMiddleware } from '../middleware/auth';

export const eventsRouter = Router();

eventsRouter.post('/', authMiddleware, createEventHandler);
eventsRouter.get('/', authMiddleware, getAllEventsHandler);
eventsRouter.get('/upcoming', getUpcomingEventsHandler);
eventsRouter.get('/:id', getEventByIdHandler);
eventsRouter.put('/:id', authMiddleware, updateEventHandler);
eventsRouter.delete('/:id', authMiddleware, deleteEventHandler);
