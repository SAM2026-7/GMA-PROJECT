import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query, saveDb } from '../db/index';
import { config } from '../config/index';

export async function registerUser(data: { email: string; password: string; name: string }) {
  const existing = await query('SELECT id FROM users WHERE email = ?', [data.email]);
  if (existing.length > 0) {
    throw new Error('Email already registered');
  }

  const passwordHash = await bcrypt.hash(data.password, 10);
  const now = new Date().toISOString();

  await query(
    'INSERT INTO users (email, password_hash, name, role, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [data.email, passwordHash, data.name, 'member', 1, now, now]
  );

  const user = await query('SELECT id, email, name, role, is_active, created_at FROM users WHERE email = ?', [data.email]);
  return user[0];
}

export async function loginUser(data: { email: string; password: string }) {
  const users = await query('SELECT * FROM users WHERE email = ?', [data.email]);
  const user = users[0] as {
    id: number;
    email: string;
    password_hash: string;
    name: string;
    role: string;
    is_active: number;
  } | undefined;

  if (!user) {
    throw new Error('Invalid credentials');
  }

  if (!user.is_active) {
    throw new Error('Account is deactivated');
  }

  const isValid = await bcrypt.compare(data.password, user.password_hash);
  if (!isValid) {
    throw new Error('Invalid credentials');
  }

  const token = (jwt.sign as any)(
    { user: { id: user.id, email: user.email, name: user.name, role: user.role } },
    config.jwtSecret,
    { expiresIn: config.jwtExpiry }
  );

  const now = new Date().toISOString();
  await query('UPDATE users SET last_login = ?, updated_at = ? WHERE id = ?', [now, now, user.id]);

  return {
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  };
}

export async function getUserById(id: number) {
  const users = await query(
    'SELECT id, email, name, role, is_active, last_login, created_at, updated_at FROM users WHERE id = ?',
    [id]
  );
  return users[0] || null;
}

export async function getUserByEmail(email: string) {
  const users = await query(
    'SELECT id, email, name, role, is_active, last_login, created_at, updated_at FROM users WHERE email = ?',
    [email]
  );
  return users[0] || null;
}

export async function getUsers(filter: { role?: string; status?: string; search?: string; page?: number; limit?: number }) {
  const page = filter.page || 1;
  const limit = filter.limit || 20;
  const offset = (page - 1) * limit;

  let where = 'WHERE 1=1';
  const params: any[] = [];

  if (filter.role) {
    where += ' AND role = ?';
    params.push(filter.role);
  }

  if (filter.status) {
    if (filter.status === 'active') {
      where += ' AND is_active = 1';
    } else if (filter.status === 'inactive') {
      where += ' AND is_active = 0';
    }
  }

  if (filter.search) {
    where += ' AND (name LIKE ? OR email LIKE ?)';
    params.push(`%${filter.search}%`, `%${filter.search}%`);
  }

  const countResult = await query(`SELECT COUNT(*) as total FROM users ${where}`, params);
  const total = countResult[0]?.total || 0;

  const users = await query(
    `SELECT id, email, name, role, is_active, last_login, created_at, updated_at FROM users ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return { users, total, page, limit };
}

export async function updateUser(id: number, data: { email?: string; name?: string; role?: string; is_active?: number; password?: string }) {
  const existing = await query('SELECT id FROM users WHERE id = ?', [id]);
  if (existing.length === 0) {
    throw new Error('User not found');
  }

  const updates: string[] = [];
  const params: any[] = [];

  if (data.email !== undefined) {
    const emailCheck = await query('SELECT id FROM users WHERE email = ? AND id != ?', [data.email, id]);
    if (emailCheck.length > 0) {
      throw new Error('Email already in use');
    }
    updates.push('email = ?');
    params.push(data.email);
  }

  if (data.name !== undefined) {
    updates.push('name = ?');
    params.push(data.name);
  }

  if (data.role !== undefined) {
    updates.push('role = ?');
    params.push(data.role);
  }

  if (data.is_active !== undefined) {
    updates.push('is_active = ?');
    params.push(data.is_active);
  }

  if (data.password !== undefined) {
    const passwordHash = await bcrypt.hash(data.password, 10);
    updates.push('password_hash = ?');
    params.push(passwordHash);
  }

  if (updates.length === 0) {
    return getUserById(id);
  }

  updates.push('updated_at = ?');
  params.push(new Date().toISOString());
  params.push(id);

  await query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);

  return getUserById(id);
}

export async function deleteUser(id: number) {
  const existing = await query('SELECT id FROM users WHERE id = ?', [id]);
  if (existing.length === 0) {
    throw new Error('User not found');
  }

  await query('DELETE FROM users WHERE id = ?', [id]);
  return { success: true };
}
