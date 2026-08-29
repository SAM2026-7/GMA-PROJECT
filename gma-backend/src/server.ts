import { createApp } from './app';
import { config } from './config/index';
import { migrate } from './db/migrate';
import { seedAll } from './db/seed';

const app = createApp();

async function start() {
  try {
    await migrate();
    await seedAll();
  } catch (error) {
    console.error('Startup error:', error);
  }

  app.listen(config.port, () => {
    console.log(`GMA Backend running on http://localhost:${config.port}`);
    console.log(`API Docs: http://localhost:${config.port}/api-docs`);
    console.log(`Health: http://localhost:${config.port}/health`);
  });
}

start();
