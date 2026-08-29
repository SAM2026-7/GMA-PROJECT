import fs from 'fs';
import path from 'path';
import { exec, query } from '../db/index';

const SCHEMA_PATH = path.join(__dirname, '..', '..', 'migrations', 'schema.sql');

export async function migrate() {
  if (!fs.existsSync(SCHEMA_PATH)) {
    console.error('Schema file not found:', SCHEMA_PATH);
    process.exit(1);
  }

  const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
  await exec(schema);
  console.log('Migrations completed successfully');
}
