#!/usr/bin/env node

const pg = require('pg');
const { Client } = pg;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

client.connect()
  .then(() => {
    console.log('[v0] Checking database status...\n');
    return client.query(`
      SELECT kelas, COUNT(*) as count 
      FROM videos 
      GROUP BY kelas 
      ORDER BY kelas
    `);
  })
  .then((result) => {
    console.log('[v0] Videos per Kelas:');
    let total = 0;
    result.rows.forEach(row => {
      console.log(`  Kelas ${row.kelas}: ${row.count} videos`);
      total += parseInt(row.count);
    });
    console.log(`\n[v0] Total videos: ${total}\n`);
    return client.query('SELECT COUNT(*) as total FROM videos');
  })
  .then((result) => {
    console.log(`[v0] Grand total: ${result.rows[0].total}`);
    process.exit(0);
  })
  .catch((err) => {
    console.error('[v0] Error:', err.message);
    process.exit(1);
  });
