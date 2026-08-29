import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  databasePath: process.env.DATABASE_PATH || './data/gma.db',
  jwtSecret: process.env.JWT_SECRET || 'change-me-to-a-strong-random-string',
  jwtExpiry: process.env.JWT_EXPIRY || '8h',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@gmacitycomplex.org',
  adminPassword: process.env.ADMIN_PASSWORD || 'admin123',
  enableEmail: process.env.ENABLE_EMAIL === 'true',
  smtpHost: process.env.SMTP_HOST || 'smtp.ethereal.email',
  smtpPort: parseInt(process.env.SMTP_PORT || '587', 10),
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  adminAlertEmail: process.env.ADMIN_ALERT_EMAIL || 'admin@gmacitycomplex.org',
  corsOrigin: (process.env.CORS_ORIGIN || '').split(',').filter(Boolean),
};
