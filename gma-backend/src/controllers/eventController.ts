import { Response } from 'express';
import { AuthRequest } from '../types/index';
import { createEvent, getAllEvents, getEventById, updateEvent, deleteEvent, getUpcomingEvents } from '../services/eventService';

export async function createEventHandler(req: AuthRequest, res: Response) {
  try {
    const { title, description, category, location, start_date, end_date, start_time, end_time, image_url, max_attendees, is_recurring, recurrence_pattern, status } = req.body;
    if (!title || !start_date) {
      return res.status(400).json({ error: 'Title and start_date are required' });
    }
    const event = await createEvent({ title, description, category, location, start_date, end_date, start_time, end_time, image_url, max_attendees, is_recurring, recurrence_pattern, status, created_by: req.user?.id });
    return res.status(201).json({ success: true, data: event });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create event' });
  }
}

export async function getAllEventsHandler(req: AuthRequest, res: Response) {
  try {
    const { status, category, search, page, limit } = req.query;
    const result = await getAllEvents({
      status: status as string,
      category: category as string,
      search: search as string,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch events' });
  }
}

export async function getEventByIdHandler(req: AuthRequest, res: Response) {
  try {
    const id = Number(req.params.id);
    const event = await getEventById(id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    return res.status(200).json({ success: true, data: event });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch event' });
  }
}

export async function updateEventHandler(req: AuthRequest, res: Response) {
  try {
    const id = Number(req.params.id);
    const { title, description, category, location, start_date, end_date, start_time, end_time, image_url, max_attendees, is_recurring, recurrence_pattern, status } = req.body;
    const event = await updateEvent(id, { title, description, category, location, start_date, end_date, start_time, end_time, image_url, max_attendees, is_recurring, recurrence_pattern, status });
    return res.status(200).json({ success: true, data: event });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update event';
    return res.status(404).json({ error: message });
  }
}

export async function deleteEventHandler(req: AuthRequest, res: Response) {
  try {
    const id = Number(req.params.id);
    await deleteEvent(id);
    return res.status(200).json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    return res.status(404).json({ error: 'Event not found' });
  }
}

export async function getUpcomingEventsHandler(req: AuthRequest, res: Response) {
  try {
    const events = await getUpcomingEvents();
    return res.status(200).json({ success: true, data: events });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch upcoming events' });
  }
}
