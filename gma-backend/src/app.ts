import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import { healthRouter } from './routes/health';
import { authRouter } from './routes/auth';
import { bookingsRouter } from './routes/bookings';
import { casesRouter } from './routes/cases';
import { sessionsRouter } from './routes/sessions';
import { chatRouter } from './routes/chat';
import { prayerRouter } from './routes/prayer';
import { followupsRouter } from './routes/followups';
import { notificationsRouter } from './routes/notifications';
import { auditRouter } from './routes/audit';
import { analyticsRouter } from './routes/analytics';
import { eventsRouter } from './routes/events';
import { sermonsRouter } from './routes/sermons';
import { contentRouter } from './routes/content';
import { siteSettingsRouter } from './routes/siteSettings';
import { submissionsRouter } from './routes/submissions';
import { membersRouter } from './routes/members';
import { staffRouter } from './routes/staff';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';

export function createApp() {
  const app = express();

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          'default-src': ["'self'"],
          'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          'script-src-attr': ["'unsafe-inline'"],
          'style-src': ["'self'", "'unsafe-inline'"],
          'img-src': ["'self'", 'data:', 'https:'],
          'connect-src': ["'self'", 'http://localhost:3000', 'http://127.0.0.1:3000'],
          'font-src': ["'self'", 'data:'],
          'object-src': ["'none'"],
          'base-uri': ["'self'"],
          'form-action': ["'self'"]
        }
      }
    })
  );
  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json());
  app.use(morgan('dev'));

  app.get('/api-docs', (_req, res) => {
    res.send(`<!DOCTYPE html><html><head><title>GMA Backend API Docs</title><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css"/></head><body><div id="swagger-ui"></div><script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script><script>window.onload=function(){SwaggerUIBundle({url:'/openapi.json',dom_id:'#swagger-ui'})}</script></body></html>`);
  });

  app.get('/openapi.json', (_req, res) => {
    res.json({
      openapi: '3.0.0',
      info: { title: 'GMA City Complex API', version: '2.0.0', description: 'Pastoral Care & Member Support Management System' },
      paths: {
        '/health': { get: { summary: 'Health check' } },
        '/api/auth/register': { post: { summary: 'Register member' } },
        '/api/auth/login': { post: { summary: 'Login' } },
        '/api/auth/me': { get: { summary: 'Current user', security: [{ bearerAuth: [] }] } },
        '/api/bookings': { get: { summary: 'List bookings', security: [{ bearerAuth: [] }] }, post: { summary: 'Create booking' } },
        '/api/cases': { get: { summary: 'List cases', security: [{ bearerAuth: [] }] }, post: { summary: 'Create case' } },
        '/api/sessions': { get: { summary: 'List sessions', security: [{ bearerAuth: [] }] }, post: { summary: 'Create session' } },
        '/api/chat/conversations': { get: { summary: 'List conversations', security: [{ bearerAuth: [] }] } },
        '/api/chat/messages': { post: { summary: 'Send message', security: [{ bearerAuth: [] }] } },
        '/api/prayer': { get: { summary: 'List prayer requests' }, post: { summary: 'Create prayer request' } },
        '/api/followups': { get: { summary: 'List followups', security: [{ bearerAuth: [] }] } },
        '/api/notifications': { get: { summary: 'List notifications', security: [{ bearerAuth: [] }] }, post: { summary: 'Send email response', security: [{ bearerAuth: [] }] } },
        '/api/analytics/dashboard': { get: { summary: 'Dashboard stats', security: [{ bearerAuth: [] }] } },
        '/api/events': { get: { summary: 'List events' } },
        '/api/sermons': { get: { summary: 'List sermons' } },
        '/api/content': { get: { summary: 'Public content' } },
      },
      components: { securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } } },
    });
  });

  app.use('/health', healthRouter);
  app.use('/api/auth', rateLimiter, authRouter);
  app.use('/api/bookings', bookingsRouter);
  app.use('/api/cases', casesRouter);
  app.use('/api/sessions', sessionsRouter);
  app.use('/api/chat', chatRouter);
  app.use('/api/prayer', prayerRouter);
  app.use('/api/followups', followupsRouter);
  app.use('/api/notifications', notificationsRouter);
  app.use('/api/audit', auditRouter);
  app.use('/api/analytics', analyticsRouter);
  app.use('/api/events', eventsRouter);
  app.use('/api/sermons', sermonsRouter);
  app.use('/api/content', contentRouter);
  app.use('/api/site-settings', siteSettingsRouter);
  app.use('/api/submissions', submissionsRouter);
  app.use('/api/members', membersRouter);
  app.use('/api/staff', staffRouter);

  const staticRoot = path.resolve(__dirname, '../../');
  app.use(express.static(staticRoot));

  app.get('/login', (_req, res) => res.redirect('/pages/login.html'));
  app.get('/login.html', (_req, res) => res.redirect('/pages/login.html'));
  app.get('/register', (_req, res) => res.redirect('/pages/register.html'));
  app.get('/admin', (_req, res) => res.redirect('/admin/dashboard.html'));
  app.get('/member', (_req, res) => res.redirect('/member/dashboard.html'));
  app.get('/', (_req, res) => res.redirect('/index.html'));

  app.use((_req, res) => {
    res.status(404).sendFile(path.join(staticRoot, 'index.html'));
  });

  app.use(errorHandler);

  return app;
}
