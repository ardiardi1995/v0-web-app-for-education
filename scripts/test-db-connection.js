#!/usr/bin/env node

const pg = require('pg');
const { Client } = pg;

console.log('[v0] Testing database connection...');
console.log('[v0] DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

client.connect()
  .then(() => {
    console.log('[v0] Database connected successfully');
    return client.query('SELECT COUNT(*) FROM videos WHERE kelas IN (1, 2)');
  })
  .then((result) => {
    console.log('[v0] Videos in Kelas 1-2:', result.rows[0].count);
    return client.end();
  })
  .then(() => {
    console.log('[v0] Connection closed');
    process.exit(0);
  })
  .catch((err) => {
    console.error('[v0] Error:', err.message);
    process.exit(1);
  });
