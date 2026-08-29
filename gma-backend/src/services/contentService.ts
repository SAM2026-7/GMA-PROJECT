import { query } from '../db/index';

export async function getAllContent() {
  const pages = await query('SELECT * FROM pages ORDER BY id');
  const result: any = { pages: {}, settings: {} };

  for (const page of pages) {
    const sections = await query('SELECT * FROM sections WHERE page_id = ? ORDER BY sort_order, id', [page.id]);
    result.pages[page.slug] = {
      ...page,
      sections,
    };
  }

  const settings = await query('SELECT * FROM site_settings');
  for (const setting of settings) {
    result.settings[setting.setting_key] = setting.setting_value;
  }

  const programs = await query('SELECT * FROM programs WHERE is_active = 1 ORDER BY sort_order, id');
  result.programs = programs;

  const services = await query('SELECT * FROM services WHERE is_active = 1 ORDER BY sort_order, id');
  result.services = services;

  return result;
}

export async function updateSiteSetting(key: string, value: string) {
  const existing = await query('SELECT setting_key FROM site_settings WHERE setting_key = ?', [key]);
  if (existing.length > 0) {
    await query('UPDATE site_settings SET setting_value = ?, updated_at = ? WHERE setting_key = ?', [value, new Date().toISOString(), key]);
  } else {
    await query('INSERT INTO site_settings (setting_key, setting_value, updated_at) VALUES (?, ?, ?)', [key, value, new Date().toISOString()]);
  }
  return { key, value };
}

export async function updateSection(pageId: number, sectionKey: string, data: { title?: string; content?: string; image_url?: string }) {
  const existing = await query('SELECT id FROM sections WHERE page_id = ? AND section_key = ?', [pageId, sectionKey]);
  const now = new Date().toISOString();

  if (existing.length > 0) {
    const updates: string[] = [];
    const params: any[] = [];
    if (data.title !== undefined) { updates.push('title = ?'); params.push(data.title); }
    if (data.content !== undefined) { updates.push('content = ?'); params.push(data.content); }
    if (data.image_url !== undefined) { updates.push('image_url = ?'); params.push(data.image_url); }
    updates.push('updated_at = ?');
    params.push(now);
    params.push(pageId, sectionKey);
    await query('UPDATE sections SET ' + updates.join(', ') + ' WHERE page_id = ? AND section_key = ?', params);
  } else {
    await query(
      'INSERT INTO sections (page_id, section_key, title, content, image_url, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      [pageId, sectionKey, data.title || null, data.content || null, data.image_url || null, now]
    );
  }
  return { pageId, sectionKey, ...data };
}

export async function createTestimony(data: {
  member_id?: number;
  author_name?: string;
  title: string;
  content: string;
  category?: string;
  status?: string;
}) {
  const now = new Date().toISOString();

  await query(
    `INSERT INTO testimonies (
      member_id, author_name, title, content, category, status,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.member_id || null,
      data.author_name || null,
      data.title,
      data.content,
      data.category || 'general',
      data.status || 'pending',
      now,
      now,
    ]
  );

  const testimony = await query('SELECT * FROM testimonies WHERE created_at = ? ORDER BY id DESC LIMIT 1', [now]);
  return testimony[0];
}

export async function getAllTestimonies(filter: {
  status?: string;
  category?: string;
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

  if (filter.search) {
    where += ' AND (title LIKE ? OR content LIKE ? OR author_name LIKE ?)';
    params.push(`%${filter.search}%`, `%${filter.search}%`, `%${filter.search}%`);
  }

  const countResult = await query(`SELECT COUNT(*) as total FROM testimonies ${where}`, params);
  const total = countResult[0]?.total || 0;

  const testimonies = await query(
    `SELECT * FROM testimonies ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return { testimonies, total, page, limit };
}

export async function approveTestimony(id: number) {
  const existing = await query('SELECT id FROM testimonies WHERE id = ?', [id]);
  if (existing.length === 0) {
    throw new Error('Testimony not found');
  }

  await query('UPDATE testimonies SET status = ?, updated_at = ? WHERE id = ?', ['approved', new Date().toISOString(), id]);
  const testimony = await query('SELECT * FROM testimonies WHERE id = ?', [id]);
  return testimony[0];
}

export async function rejectTestimony(id: number) {
  const existing = await query('SELECT id FROM testimonies WHERE id = ?', [id]);
  if (existing.length === 0) {
    throw new Error('Testimony not found');
  }

  await query('UPDATE testimonies SET status = ?, updated_at = ? WHERE id = ?', ['rejected', new Date().toISOString(), id]);
  const testimony = await query('SELECT * FROM testimonies WHERE id = ?', [id]);
  return testimony[0];
}

export async function getApprovedTestimonies(page: number = 1, limit: number = 10) {
  const offset = (page - 1) * limit;

  const countResult = await query('SELECT COUNT(*) as total FROM testimonies WHERE status = ?', ['approved']);
  const total = countResult[0]?.total || 0;

  const testimonies = await query(
    `SELECT * FROM testimonies WHERE status = 'approved' ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [limit, offset]
  );

  return { testimonies, total, page, limit };
}

export async function createProject(data: {
  title: string;
  description?: string;
  category?: string;
  target_amount?: number;
  current_amount?: number;
  start_date?: string;
  end_date?: string;
  image_url?: string;
  status?: string;
  created_by?: number;
}) {
  const now = new Date().toISOString();

  await query(
    `INSERT INTO projects (
      title, description, category, target_amount, current_amount,
      start_date, end_date, image_url, status, created_by,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.title,
      data.description || null,
      data.category || 'general',
      data.target_amount || 0,
      data.current_amount || 0,
      data.start_date || null,
      data.end_date || null,
      data.image_url || null,
      data.status || 'active',
      data.created_by || null,
      now,
      now,
    ]
  );

  const project = await query('SELECT * FROM projects WHERE created_at = ? ORDER BY id DESC LIMIT 1', [now]);
  return project[0];
}

export async function getAllProjects(filter: {
  status?: string;
  category?: string;
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

  if (filter.search) {
    where += ' AND (title LIKE ? OR description LIKE ?)';
    params.push(`%${filter.search}%`, `%${filter.search}%`);
  }

  const countResult = await query(`SELECT COUNT(*) as total FROM projects ${where}`, params);
  const total = countResult[0]?.total || 0;

  const projects = await query(
    `SELECT * FROM projects ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return { projects, total, page, limit };
}

export async function updateProject(id: number, data: {
  title?: string;
  description?: string;
  category?: string;
  target_amount?: number;
  current_amount?: number;
  start_date?: string;
  end_date?: string;
  image_url?: string;
  status?: string;
}) {
  const existing = await query('SELECT id FROM projects WHERE id = ?', [id]);
  if (existing.length === 0) {
    throw new Error('Project not found');
  }

  const updates: string[] = [];
  const params: any[] = [];

  const fields = [
    'title', 'description', 'category', 'target_amount', 'current_amount',
    'start_date', 'end_date', 'image_url', 'status',
  ] as const;

  for (const field of fields) {
    if (data[field] !== undefined) {
      updates.push(`${field} = ?`);
      params.push(data[field]);
    }
  }

  if (updates.length === 0) {
    const project = await query('SELECT * FROM projects WHERE id = ?', [id]);
    return project[0];
  }

  updates.push('updated_at = ?');
  params.push(new Date().toISOString());
  params.push(id);

  await query(`UPDATE projects SET ${updates.join(', ')} WHERE id = ?`, params);

  const project = await query('SELECT * FROM projects WHERE id = ?', [id]);
  return project[0];
}

export async function deleteProject(id: number) {
  const existing = await query('SELECT id FROM projects WHERE id = ?', [id]);
  if (existing.length === 0) {
    throw new Error('Project not found');
  }

  await query('DELETE FROM projects WHERE id = ?', [id]);
  return { success: true };
}

export async function updateProjectAmount(id: number, amount: number) {
  const existing = await query('SELECT id, current_amount FROM projects WHERE id = ?', [id]);
  if (existing.length === 0) {
    throw new Error('Project not found');
  }

  const newAmount = (existing[0].current_amount || 0) + amount;
  await query('UPDATE projects SET current_amount = ?, updated_at = ? WHERE id = ?', [newAmount, new Date().toISOString(), id]);

  const project = await query('SELECT * FROM projects WHERE id = ?', [id]);
  return project[0];
}

export async function createAnnouncement(data: {
  title: string;
  content: string;
  target_audience?: string;
  category?: string;
  priority?: string;
  start_date?: string;
  end_date?: string;
  image_url?: string;
  status?: string;
  created_by?: number;
}) {
  const now = new Date().toISOString();

  await query(
    `INSERT INTO announcements (
      title, content, target_audience, category, priority, start_date, end_date,
      image_url, status, created_by, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.title,
      data.content,
      data.target_audience || 'all',
      data.category || 'general',
      data.priority || 'normal',
      data.start_date || null,
      data.end_date || null,
      data.image_url || null,
      data.status || 'active',
      data.created_by || null,
      now,
      now,
    ]
  );

  const announcement = await query('SELECT * FROM announcements WHERE created_at = ? ORDER BY id DESC LIMIT 1', [now]);
  return announcement[0];
}

export async function getAllAnnouncements(filter: {
  status?: string;
  category?: string;
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

  if (filter.search) {
    where += ' AND (title LIKE ? OR content LIKE ?)';
    params.push(`%${filter.search}%`, `%${filter.search}%`);
  }

  const countResult = await query(`SELECT COUNT(*) as total FROM announcements ${where}`, params);
  const total = countResult[0]?.total || 0;

  const announcements = await query(
    `SELECT * FROM announcements ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return { announcements, total, page, limit };
}

export async function updateAnnouncement(id: number, data: {
  title?: string;
  content?: string;
  target_audience?: string;
  category?: string;
  priority?: string;
  start_date?: string;
  end_date?: string;
  image_url?: string;
  status?: string;
}) {
  const existing = await query('SELECT id FROM announcements WHERE id = ?', [id]);
  if (existing.length === 0) {
    throw new Error('Announcement not found');
  }

  const updates: string[] = [];
  const params: any[] = [];

  const fields = [
    'title', 'content', 'target_audience', 'category', 'priority', 'start_date',
    'end_date', 'image_url', 'status',
  ] as const;

  for (const field of fields) {
    if (data[field] !== undefined) {
      updates.push(`${field} = ?`);
      params.push(data[field]);
    }
  }

  if (updates.length === 0) {
    const announcement = await query('SELECT * FROM announcements WHERE id = ?', [id]);
    return announcement[0];
  }

  updates.push('updated_at = ?');
  params.push(new Date().toISOString());
  params.push(id);

  await query(`UPDATE announcements SET ${updates.join(', ')} WHERE id = ?`, params);

  const announcement = await query('SELECT * FROM announcements WHERE id = ?', [id]);
  return announcement[0];
}

export async function deleteAnnouncement(id: number) {
  const existing = await query('SELECT id FROM announcements WHERE id = ?', [id]);
  if (existing.length === 0) {
    throw new Error('Announcement not found');
  }

  await query('DELETE FROM announcements WHERE id = ?', [id]);
  return { success: true };
}

export async function getActiveAnnouncements() {
  const now = new Date().toISOString();
  const announcements = await query(
    `SELECT * FROM announcements WHERE status = 'active' AND (start_date IS NULL OR start_date <= ?) AND (end_date IS NULL OR end_date >= ?) ORDER BY created_at DESC`,
    [now, now]
  );
  return announcements;
}
