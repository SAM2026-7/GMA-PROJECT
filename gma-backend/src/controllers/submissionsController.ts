import { Response } from 'express';
import {
  createSubmission,
  getAllSubmissions,
  getSubmissionById,
  updateSubmissionStatus,
  deleteSubmission,
} from '../services/submissionService';
import { AuthRequest } from '../types/index';
import { sendAutoResponse } from '../services/emailService';

export async function createSubmissionHandler(req: AuthRequest, res: Response) {
  try {
    const { name, phone, program, preferred_date, message, type, email, subject, category, content, description } = req.body;
    const submissionName = name || '';
    const submissionPhone = phone || '';
    const submissionProgram = program || type || 'general';
    const submissionDate = preferred_date || new Date().toISOString().substring(0, 10);
    const submissionMessage = message || content || description || '';

    if (!submissionName) {
      return res.status(400).json({ error: 'Name is required' });
    }
    const submission = await createSubmission({
      name: submissionName,
      phone: submissionPhone,
      program: submissionProgram,
      preferred_date: submissionDate,
      message: submissionMessage,
      type: type || 'general',
      email,
      subject,
      category,
    });
    
    const recipient = email || phone;
    if (recipient) {
      const submissionType = type === 'contact' ? 'contact' : type === 'giving' ? 'contact' : type === 'visitor' ? 'contact' : 'general';
      sendAutoResponse({
        to: recipient,
        name: submissionName,
        type: submissionType as any,
        referenceId: String(submission.id),
      }).catch(() => {});
    }
    
    return res.status(201).json({ success: true, data: submission });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create submission' });
  }
}

export async function listSubmissionsHandler(req: AuthRequest, res: Response) {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const type = req.query.type as string | undefined;
    const result = await getAllSubmissions(page, limit, type);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch submissions' });
  }
}

export async function getSubmissionHandler(req: AuthRequest, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const submission = await getSubmissionById(id);
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }
    return res.status(200).json({ success: true, data: submission });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch submission' });
  }
}

export async function updateSubmissionHandler(req: AuthRequest, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    if (!status || !['new', 'contacted', 'closed'].includes(status)) {
      return res.status(400).json({ error: 'Valid status is required (new, contacted, closed)' });
    }
    const updated = await updateSubmissionStatus(id, status);
    if (!updated) {
      return res.status(404).json({ error: 'Submission not found' });
    }
    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update submission' });
  }
}

export async function deleteSubmissionHandler(req: AuthRequest, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const deleted = await deleteSubmission(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Submission not found' });
    }
    return res.status(200).json({ success: true, message: 'Submission deleted' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete submission' });
  }
}
