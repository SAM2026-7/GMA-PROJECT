import { Response } from 'express';
import { AuthRequest } from '../types/index';
import { registerUser, loginUser } from '../services/userService';

export async function registerHandler(req: AuthRequest, res: Response) {
  try {
    const { email, password, name, firstName, lastName } = req.body;
    const fullName = name || ((firstName || '') + (lastName ? ' ' + lastName : '')).trim();
    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }
    const user = await registerUser({ email, password, name: fullName });
    return res.status(201).json({ success: true, data: user });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Registration failed';
    const status = message === 'Email already registered' ? 409 : 400;
    return res.status(status).json({ error: message });
  }
}

export async function loginHandler(req: AuthRequest, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const result = await loginUser({ email, password });
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed';
    let status = 401;
    if (message === 'Account is deactivated') status = 403;
    if (message === 'Email and password are required') status = 400;
    return res.status(status).json({ error: message });
  }
}

export async function meHandler(req: AuthRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  return res.status(200).json({ success: true, data: req.user });
}
