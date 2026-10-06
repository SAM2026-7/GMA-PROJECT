import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index';
import { AuthRequest, AuthUser, UserRole } from '../types/index';

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, config.jwtSecret) as { user: AuthUser };
    req.user = payload.user;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

export const STAFF_ROLES: UserRole[] = [
  'super_admin', 'admin', 'pastor', 'counselor', 'prayer_coordinator',
  'healing_minister', 'followup_officer', 'branch_admin', 'analytics_officer',
];

export function isStaffUser(req: AuthRequest): boolean {
  return !!req.user && STAFF_ROLES.includes(req.user.role);
}

export async function resolveMemberId(req: AuthRequest): Promise<number | null> {
  if (!req.user) return null;
  const { query } = await import('../db/index');
  const rows = await query('SELECT id FROM members WHERE user_id = ?', [req.user.id]);
  return (rows[0] as any)?.id ?? null;
}

export function requireStaffOrAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' });
  if (!STAFF_ROLES.includes(req.user.role)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  next();
}
