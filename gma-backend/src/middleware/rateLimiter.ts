import { Request, Response, NextFunction } from 'express';

export function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const windowMs = 60 * 1000;
  const maxRequests = 20;
  const key = req.ip || 'unknown';

  const hits = (global as any).rateLimitHits || {};
  const now = Date.now();

  if (!hits[key]) hits[key] = [];
  hits[key] = hits[key].filter((t: number) => now - t < windowMs);

  if (hits[key].length >= maxRequests) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  hits[key].push(now);
  (global as any).rateLimitHits = hits;
  next();
}
