#!/usr/bin/env node

const pg = require('pg');
const { Client } = pg;

console.log('[v0] Checking video counts for Kelas 7-12...');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

client.connect()
  .then(() => {
    console.log('[v0] Database connected\n');
    return client.query('SELECT kelas, subject, COUNT(*) as count FROM videos WHERE kelas BETWEEN 7 AND 12 GROUP BY kelas, subject ORDER BY kelas, subject');
  })
  .then((result) => {
    console.log('[v0] Video count per Kelas and Subject:');
    console.log('===================================================');
    
    if (result.rows.length === 0) {
      console.log('[v0] No videos found in Kelas 7-12');
    } else {
      const grouped = {};
      result.rows.forEach(row => {
        if (!grouped[row.kelas]) grouped[row.kelas] = [];
        grouped[row.kelas].push(row);
      });
      
      Object.keys(grouped).sort((a,b) => a-b).forEach(kelas => {
        let total = 0;
        console.log(`\nKelas ${kelas}:`);
        grouped[kelas].forEach(row => {
          console.log(`  - ${row.subject}: ${row.count} videos`);
          total += parseInt(row.count);
        });
        console.log(`  Total Kelas ${kelas}: ${total}`);
      });
    }
    
    console.log('\n===================================================');
    return client.query('SELECT COUNT(*) as total FROM videos WHERE kelas BETWEEN 7 AND 12');
  })
  .then((result) => {
    console.log(`[v0] Total videos in Kelas 7-12: ${result.rows[0].total}`);
    process.exit(0);
  })
  .catch((err) => {
    console.error('[v0] Error:', err.message);
    process.exit(1);
  });
