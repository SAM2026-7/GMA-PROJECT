import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';
import { config } from '../config/index';

const DB_PATH = path.resolve(__dirname, '../../', config.databasePath);

let db: Database | null = null;

export async function getDb() {
  if (db) return db;

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  return db;
}

export async function saveDb() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

export async function query(sql: string, params: any[] = []) {
  const database = await getDb();
  const stmt = database.prepare(sql);
  stmt.bind(params);
  const results: any[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  await saveDb();
  return results;
}

export async function run(sql: string, params: any[] = []) {
  const database = await getDb();
  database.run(sql, params);
  await saveDb();
}

export async function exec(sql: string) {
  const database = await getDb();
  database.exec(sql);
  await saveDb();
}
