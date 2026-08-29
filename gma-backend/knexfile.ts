require('dotenv').config();

module.exports = {
  development: {
    client: 'better-sqlite3',
    connection: { filename: process.env.DATABASE_PATH || './data/gma.db' },
    useNullAsDefault: true,
    pool: { min: 0, max: 1 },
    migrations: {
      directory: './migrations',
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: './seeds',
    },
  },
  staging: {
    client: 'better-sqlite3',
    connection: { filename: './data/gma.db' },
    useNullAsDefault: true,
    pool: { min: 0, max: 1 },
    migrations: { directory: './migrations' },
  },
  production: {
    client: 'better-sqlite3',
    connection: { filename: './data/gma.db' },
    useNullAsDefault: true,
    pool: { min: 0, max: 1 },
    migrations: { directory: './migrations' },
  },
};
