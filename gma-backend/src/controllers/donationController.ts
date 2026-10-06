import { Response } from 'express';
import { AuthRequest } from '../types/index';
import { isStaffUser, resolveMemberId } from '../middleware/auth';
import {
  createDonation,
  getAllDonations,
  getDonationById,
  updateDonation,
  deleteDonation,
  getGivingStats,
} from '../services/donationService';
import { sendAutoResponse } from '../services/emailService';

export async function createDonationHandler(req: AuthRequest, res: Response) {
  try {
    const body = req.body || {};
    const memberId = req.user ? await resolveMemberId(req) : null;
    const donorName = body.donorName || body.donor_name || body.name;
    const amount = Number(body.amount);

    if (!donorName) {
      return res.status(400).json({ error: 'Donor name is required' });
    }
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'A valid amount greater than zero is required' });
    }
    if (!body.category) {
      return res.status(400).json({ error: 'Giving category is required' });
    }
    if (!body.method) {
      return res.status(400).json({ error: 'Payment method is required' });
    }

    const donation = await createDonation({
      member_id: memberId,
      donor_name: donorName,
      donor_email: body.donorEmail || body.donor_email || body.email || (req.user ? req.user.email : undefined),
      donor_phone: body.donorPhone || body.donor_phone || body.phone,
      category: body.category,
      amount,
      method: body.method,
      reference_note: body.reference || body.reference_note,
      notes: body.notes,
      status: body.status || (req.user ? 'recorded' : 'pledged'),
      pledged: !req.user ? 1 : 0,
    });

    if (donation.donor_email) {
      sendAutoResponse({
        to: donation.donor_email,
        name: donation.donor_name,
        type: 'giving',
        referenceId: donation.reference,
      }).catch(() => {});
    }

    return res.status(201).json({ success: true, data: donation });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to record giving' });
  }
}

export async function getAllDonationsHandler(req: AuthRequest, res: Response) {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    let memberId = req.query.member_id ? parseInt(req.query.member_id as string) : undefined;
    if (!isStaffUser(req)) {
      const ownId = await resolveMemberId(req);
      if (ownId === null) {
        return res.status(200).json({ success: true, data: [], total: 0, page, limit, totalPages: 0 });
      }
      memberId = ownId;
    }
    const result = await getAllDonations({
      page,
      limit,
      member_id: memberId,
      category: req.query.category as string | undefined,
      status: req.query.status as string | undefined,
      method: req.query.method as string | undefined,
      start_date: req.query.start_date as string | undefined,
      end_date: req.query.end_date as string | undefined,
      search: req.query.search as string | undefined,
    });
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch giving records' });
  }
}

export async function getDonationHandler(req: AuthRequest, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const donation = await getDonationById(id);
    if (!donation) {
      return res.status(404).json({ error: 'Giving record not found' });
    }
    if (!isStaffUser(req)) {
      const ownId = await resolveMemberId(req);
      if (ownId === null || donation.member_id !== ownId) {
        return res.status(403).json({ error: 'You can only view your own giving records' });
      }
    }
    return res.status(200).json({ success: true, data: donation });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch giving record' });
  }
}

export async function updateDonationHandler(req: AuthRequest, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const existing = await getDonationById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Giving record not found' });
    }
    const updated = await updateDonation(id, req.body);
    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    return res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to update giving record' });
  }
}

export async function deleteDonationHandler(req: AuthRequest, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const deleted = await deleteDonation(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Giving record not found' });
    }
    return res.status(200).json({ success: true, message: 'Giving record deleted' });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to delete giving record' });
  }
}

export async function getGivingStatsHandler(req: AuthRequest, res: Response) {
  try {
    const stats = await getGivingStats();
    return res.status(200).json({ success: true, data: stats });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch giving stats' });
  }
}
