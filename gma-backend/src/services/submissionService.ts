import { query } from '../db/index';

export async function createSubmission(data: {
  name: string;
  phone: string;
  program?: string;
  preferred_date?: string;
  message?: string;
  type?: string;
  email?: string;
  subject?: string;
  category?: string;
}) {
  const submittedAt = new Date().toISOString();
  await query(
    `INSERT INTO submissions (name, phone, program, preferred_date, message, type, email, subject, category, submitted_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.name,
      data.phone,
      data.program || data.type || 'general',
      data.preferred_date || submittedAt.substring(0, 10),
      data.message || null,
      data.type || 'general',
      data.email || null,
      data.subject || null,
      data.category || null,
      submittedAt,
      submittedAt,
      submittedAt,
    ]
  );
  const results = await query('SELECT * FROM submissions WHERE created_at = ? ORDER BY id DESC LIMIT 1', [submittedAt]);
  return results[0];
}

export async function getAllSubmissions(page: number = 1, limit: number = 20, type?: string) {
  const offset = (page - 1) * limit;
  let where = '';
  const params: any[] = [];
  if (type) {
    where = 'WHERE type = ?';
    params.push(type);
  }
  const totalResult = await query(`SELECT COUNT(*) as count FROM submissions ${where}`, params);
  const total = (totalResult[0] as any).count || 0;

  const submissions = await query(
    `SELECT * FROM submissions ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return {
    submissions,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getSubmissionById(id: number) {
  const results = await query('SELECT * FROM submissions WHERE id = ?', [id]);
  return results[0];
}

export async function updateSubmissionStatus(id: number, status: 'new' | 'contacted' | 'closed') {
  const updatedAt = new Date().toISOString();
  await query('UPDATE submissions SET status = ?, updated_at = ? WHERE id = ?', [status, updatedAt, id]);
  const updated = await query('SELECT * FROM submissions WHERE id = ?', [id]);
  return updated[0];
}

export async function deleteSubmission(id: number) {
  const existing = await query('SELECT id FROM submissions WHERE id = ?', [id]);
  if (!existing.length) return false;
  await query('DELETE FROM submissions WHERE id = ?', [id]);
  return true;
}
