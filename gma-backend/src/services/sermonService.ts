import { query } from '../db/index';

export async function createSermon(data: {
  title: string;
  speaker?: string;
  category?: string;
  description?: string;
  scripture_reference?: string;
  audio_url?: string;
  video_url?: string;
  notes_url?: string;
  thumbnail_url?: string;
  duration_minutes?: number;
  series_name?: string;
  series_order?: number;
  status?: string;
  published_at?: string;
  date?: string;
  created_by?: number;
}) {
  const now = new Date().toISOString();

  await query(
    `INSERT INTO sermons (
      title, speaker, date, category, description, scripture_reference,
      audio_url, video_url, notes_url, thumbnail_url, duration_minutes,
      series_name, series_order, status, published_at, created_by,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.title,
      data.speaker || null,
      data.date || now.split('T')[0],
      data.category || 'sunday',
      data.description || null,
      data.scripture_reference || null,
      data.audio_url || null,
      data.video_url || null,
      data.notes_url || null,
      data.thumbnail_url || null,
      data.duration_minutes || null,
      data.series_name || null,
      data.series_order || null,
      data.status || 'published',
      data.published_at || now,
      data.created_by || null,
      now,
      now,
    ]
  );

  const sermon = await query('SELECT * FROM sermons WHERE created_at = ? ORDER BY id DESC LIMIT 1', [now]);
  return sermon[0];
}

export async function getSermonById(id: number) {
  const sermons = await query('SELECT * FROM sermons WHERE id = ?', [id]);
  return sermons[0] || null;
}

export async function getAllSermons(filter: {
  status?: string;
  category?: string;
  speaker?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const page = filter.page || 1;
  const limit = filter.limit || 20;
  const offset = (page - 1) * limit;

  let where = 'WHERE 1=1';
  const params: any[] = [];

  if (filter.status) {
    where += ' AND status = ?';
    params.push(filter.status);
  }

  if (filter.category) {
    where += ' AND category = ?';
    params.push(filter.category);
  }

  if (filter.speaker) {
    where += ' AND speaker LIKE ?';
    params.push(`%${filter.speaker}%`);
  }

  if (filter.search) {
    where += ' AND (title LIKE ? OR speaker LIKE ? OR description LIKE ? OR scripture_reference LIKE ?)';
    params.push(`%${filter.search}%`, `%${filter.search}%`, `%${filter.search}%`, `%${filter.search}%`);
  }

  const countResult = await query(`SELECT COUNT(*) as total FROM sermons ${where}`, params);
  const total = countResult[0]?.total || 0;

  const sermons = await query(
    `SELECT * FROM sermons ${where} ORDER BY published_at DESC, created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return { sermons, total, page, limit };
}

export async function getRecentSermons(limit: number = 5) {
  const sermons = await query(
    `SELECT * FROM sermons WHERE status = 'published' ORDER BY published_at DESC LIMIT ?`,
    [limit]
  );
  return sermons;
}

export async function updateSermon(id: number, data: {
  title?: string;
  speaker?: string;
  date?: string;
  category?: string;
  description?: string;
  scripture_reference?: string;
  audio_url?: string;
  video_url?: string;
  notes_url?: string;
  thumbnail_url?: string;
  duration_minutes?: number;
  series_name?: string;
  series_order?: number;
  status?: string;
  published_at?: string;
}) {
  const existing = await query('SELECT id FROM sermons WHERE id = ?', [id]);
  if (existing.length === 0) {
    throw new Error('Sermon not found');
  }

  const updates: string[] = [];
  const params: any[] = [];

  const fields = [
    'title', 'speaker', 'date', 'category', 'description', 'scripture_reference',
    'audio_url', 'video_url', 'notes_url', 'thumbnail_url', 'duration_minutes',
    'series_name', 'series_order', 'status', 'published_at',
  ] as const;

  for (const field of fields) {
    if (data[field] !== undefined) {
      updates.push(`${field} = ?`);
      params.push(data[field]);
    }
  }

  if (updates.length === 0) {
    return getSermonById(id);
  }

  updates.push('updated_at = ?');
  params.push(new Date().toISOString());
  params.push(id);

  await query(`UPDATE sermons SET ${updates.join(', ')} WHERE id = ?`, params);

  return getSermonById(id);
}

export async function deleteSermon(id: number) {
  const existing = await query('SELECT id FROM sermons WHERE id = ?', [id]);
  if (existing.length === 0) {
    throw new Error('Sermon not found');
  }

  await query('DELETE FROM sermons WHERE id = ?', [id]);
  return { success: true };
}

export async function getSermonsByCategory(category: string) {
  const sermons = await query(
    `SELECT * FROM sermons WHERE category = ? AND status = 'published' ORDER BY published_at DESC`,
    [category]
  );
  return sermons;
}

export async function getSermonsBySpeaker(speaker: string) {
  const sermons = await query(
    `SELECT * FROM sermons WHERE speaker LIKE ? AND status = 'published' ORDER BY published_at DESC`,
    [`%${speaker}%`]
  );
  return sermons;
}
