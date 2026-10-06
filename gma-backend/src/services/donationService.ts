import { query } from '../db/index';
import { Donation, PaginatedResult } from '../types/index';

interface DonationFilter {
  member_id?: number;
  category?: string;
  status?: string;
  method?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
  page?: number;
  limit?: number;
}

function generateReference(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(10000 + Math.random() * 90000);
  return `GIV-${year}-${random}`;
}

export async function createDonation(data: {
  member_id?: number | null;
  donor_name: string;
  donor_email?: string;
  donor_phone?: string;
  category: string;
  amount: number;
  method: string;
  currency?: string;
  reference_note?: string;
  notes?: string;
  status?: string;
  pledged?: number;
}): Promise<Donation> {
  const now = new Date().toISOString();
  let reference = generateReference();
  for (let attempt = 0; attempt < 5; attempt++) {
    const existing = await query('SELECT id FROM donations WHERE reference = ?', [reference]);
    if (existing.length === 0) break;
    reference = generateReference();
  }

  await query(
    `INSERT INTO donations (reference, member_id, donor_name, donor_email, donor_phone, category, amount, method, currency, reference_note, notes, status, pledged, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      reference,
      data.member_id || null,
      data.donor_name,
      data.donor_email || null,
      data.donor_phone || null,
      data.category,
      data.amount,
      data.method,
      data.currency || 'NGN',
      data.reference_note || null,
      data.notes || null,
      data.status || 'recorded',
      data.pledged ? 1 : 0,
      now,
      now,
    ]
  );

  const results = await query('SELECT * FROM donations WHERE reference = ?', [reference]);
  return results[0] as Donation;
}

export async function getAllDonations(filter: DonationFilter): Promise<PaginatedResult<Donation>> {
  const page = filter.page || 1;
  const limit = filter.limit || 20;
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const params: any[] = [];

  if (filter.member_id) {
    conditions.push('d.member_id = ?');
    params.push(filter.member_id);
  }
  if (filter.category) {
    conditions.push('d.category = ?');
    params.push(filter.category);
  }
  if (filter.status) {
    conditions.push('d.status = ?');
    params.push(filter.status);
  }
  if (filter.method) {
    conditions.push('d.method = ?');
    params.push(filter.method);
  }
  if (filter.start_date) {
    conditions.push('d.created_at >= ?');
    params.push(filter.start_date);
  }
  if (filter.end_date) {
    conditions.push('d.created_at <= ?');
    params.push(`${filter.end_date}T23:59:59.999Z`);
  }
  if (filter.search) {
    conditions.push('(d.donor_name LIKE ? OR d.reference LIKE ? OR d.donor_email LIKE ?)');
    params.push(`%${filter.search}%`, `%${filter.search}%`, `%${filter.search}%`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await query(`SELECT COUNT(*) as count FROM donations d ${whereClause}`, params);
  const total = (countResult[0] as any).count || 0;

  const donations = await query(
    `SELECT d.*, m.member_id as member_code
     FROM donations d
     LEFT JOIN members m ON d.member_id = m.id
     ${whereClause}
     ORDER BY d.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return {
    data: donations as Donation[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getDonationById(id: number): Promise<Donation | undefined> {
  const results = await query('SELECT * FROM donations WHERE id = ?', [id]);
  return results[0] as Donation | undefined;
}

export async function updateDonation(
  id: number,
  data: Partial<{
    donor_name: string;
    donor_email: string;
    donor_phone: string;
    category: string;
    amount: number;
    method: string;
    reference_note: string;
    notes: string;
    status: string;
    pledged: number;
    member_id: number;
  }>
): Promise<Donation> {
  const now = new Date().toISOString();
  const fields: string[] = [];
  const params: any[] = [];

  if (data.donor_name !== undefined) { fields.push('donor_name = ?'); params.push(data.donor_name); }
  if (data.donor_email !== undefined) { fields.push('donor_email = ?'); params.push(data.donor_email); }
  if (data.donor_phone !== undefined) { fields.push('donor_phone = ?'); params.push(data.donor_phone); }
  if (data.category !== undefined) { fields.push('category = ?'); params.push(data.category); }
  if (data.amount !== undefined) { fields.push('amount = ?'); params.push(data.amount); }
  if (data.method !== undefined) { fields.push('method = ?'); params.push(data.method); }
  if (data.reference_note !== undefined) { fields.push('reference_note = ?'); params.push(data.reference_note); }
  if (data.notes !== undefined) { fields.push('notes = ?'); params.push(data.notes); }
  if (data.status !== undefined) { fields.push('status = ?'); params.push(data.status); }
  if (data.pledged !== undefined) { fields.push('pledged = ?'); params.push(data.pledged ? 1 : 0); }
  if (data.member_id !== undefined) { fields.push('member_id = ?'); params.push(data.member_id); }

  if (fields.length === 0) {
    const existing = await getDonationById(id);
    if (!existing) throw new Error('Donation not found');
    return existing;
  }

  fields.push('updated_at = ?');
  params.push(now);
  params.push(id);

  await query(`UPDATE donations SET ${fields.join(', ')} WHERE id = ?`, params);
  const results = await query('SELECT * FROM donations WHERE id = ?', [id]);
  return results[0] as Donation;
}

export async function deleteDonation(id: number): Promise<boolean> {
  const existing = await query('SELECT id FROM donations WHERE id = ?', [id]);
  if (existing.length === 0) return false;
  await query('DELETE FROM donations WHERE id = ?', [id]);
  return true;
}

export async function getGivingStats(): Promise<{
  totalAmount: number;
  totalCount: number;
  thisMonth: number;
  thisYear: number;
  byCategory: { category: string; total: number; count: number }[];
  byMethod: { method: string; total: number; count: number }[];
}> {
  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const yearStart = `${now.getFullYear()}-01-01`;

  const totalResult = await query('SELECT COALESCE(SUM(amount), 0) as total, COUNT(*) as count FROM donations');
  const monthResult = await query('SELECT COALESCE(SUM(amount), 0) as total FROM donations WHERE created_at >= ?', [monthStart]);
  const yearResult = await query('SELECT COALESCE(SUM(amount), 0) as total FROM donations WHERE created_at >= ?', [yearStart]);
  const byCategory = await query(
    'SELECT category, COALESCE(SUM(amount), 0) as total, COUNT(*) as count FROM donations GROUP BY category ORDER BY total DESC'
  );
  const byMethod = await query(
    'SELECT method, COALESCE(SUM(amount), 0) as total, COUNT(*) as count FROM donations GROUP BY method ORDER BY total DESC'
  );

  return {
    totalAmount: (totalResult[0] as any).total || 0,
    totalCount: (totalResult[0] as any).count || 0,
    thisMonth: (monthResult[0] as any).total || 0,
    thisYear: (yearResult[0] as any).total || 0,
    byCategory: byCategory as { category: string; total: number; count: number }[],
    byMethod: byMethod as { method: string; total: number; count: number }[],
  };
}
