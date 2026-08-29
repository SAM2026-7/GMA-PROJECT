import knex from 'knex';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const knexConfig = require(join(__dirname, '..', 'knexfile.ts'));
const db = knex(knexConfig.development);

export async function up() {
  await db.schema.createTable('submissions', (table) => {
    table.increments('id').primary();
    table.string('name', 100).notNullable();
    table.string('phone', 20).notNullable();
    table.string('program', 20).notNullable();
    table.string('preferred_date', 20).notNullable();
    table.text('message');
    table.string('status', 20).defaultTo('new').notNullable();
    table.string('submitted_at', 50).notNullable();
    table.string('created_at', 50).notNullable();
    table.string('updated_at', 50).notNullable();
  });

  await db.schema.createTable('admins', (table) => {
    table.increments('id').primary();
    table.string('email', 100).unique().notNullable();
    table.string('password_hash', 255).notNullable();
    table.string('name', 100);
    table.string('created_at', 50).notNullable();
  });
}

export async function down() {
  await db.schema.dropTableIfExists('admins');
  await db.schema.dropTableIfExists('submissions');
}
