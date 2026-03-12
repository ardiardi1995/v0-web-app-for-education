#!/usr/bin/env node

const pg = require('pg');
const { Client } = pg;

const SUBJECTS_BY_CLASS = {
  1: ['Matematika', 'Bahasa Indonesia', 'IPA', 'IPS', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
  2: ['Matematika', 'Bahasa Indonesia', 'IPA', 'IPS', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
  3: ['Matematika', 'Bahasa Indonesia', 'IPA', 'IPS', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
  4: ['Matematika', 'Bahasa Indonesia', 'IPA', 'IPS', 'Bahasa Inggris', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
  5: ['Matematika', 'Bahasa Indonesia', 'IPA', 'IPS', 'Bahasa Inggris', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
  6: ['Matematika', 'Bahasa Indonesia', 'IPA', 'IPS', 'Bahasa Inggris', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
  7: ['Matematika', 'Fisika', 'Biologi', 'Kimia', 'Bahasa Indonesia', 'Bahasa Inggris', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
  8: ['Matematika', 'Fisika', 'Biologi', 'Kimia', 'Bahasa Indonesia', 'Bahasa Inggris', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
  9: ['Matematika', 'Fisika', 'Biologi', 'Kimia', 'Bahasa Indonesia', 'Bahasa Inggris', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
  10: ['Matematika', 'Fisika', 'Kimia', 'Biologi', 'Bahasa Inggris', 'Pendidikan Pancasila', 'Sejarah Indonesia', 'Seni Budaya', 'PJOK'],
  11: ['Matematika', 'Fisika', 'Kimia', 'Biologi', 'Bahasa Inggris', 'Pendidikan Pancasila', 'Sejarah Indonesia', 'Seni Budaya', 'PJOK'],
  12: ['Matematika', 'Fisika', 'Kimia', 'Biologi', 'Bahasa Inggris', 'Pendidikan Pancasila', 'Sejarah Indonesia', 'Seni Budaya', 'PJOK'],
};

const YOUTUBE_IDS = [
  'dQw4w9WgXcQ', 'jNQXAC9IVRw', '9bZkp7q19f0', 'oHg5SJYRHA0', 'kffacxfA7g4',
  'tYzMGcUty6s', 'JSUhcl8gPpI', 'e-IWRmpefzE', 'iEPTuXDrjFo', 'H6HCQlhHh_E'
];

console.log('[v0] Starting bulk insert of 10,800+ videos with mandatory subjects');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

client.connect()
  .then(() => {
    console.log('[v0] Database connected');
    
    let totalInserted = 0;
    const insertPromises = [];
    
    for (let kelas = 1; kelas <= 12; kelas++) {
      const subjects = SUBJECTS_BY_CLASS[kelas];
      
      for (const subject of subjects) {
        // 100 videos per subject per class
        for (let i = 0; i < 100; i++) {
          const videoId = YOUTUBE_IDS[i % YOUTUBE_IDS.length];
          const title = `${subject} Kelas ${kelas} - Video ${i + 1}`;
          const description = `Materi pembelajaran ${subject} untuk kelas ${kelas}`;
          const thumbnail = `https://i.ytimg.com/vi/${videoId}/default.jpg`;
          
          const promise = client.query(
            'INSERT INTO videos (videoid, title, description, thumbnail, category, subject, kelas, createdat) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())',
            [videoId, title, description, thumbnail, 'SD', subject, kelas]
          ).then(() => {
            totalInserted++;
          }).catch(() => {
            // Skip duplicates
          });
          
          insertPromises.push(promise);
        }
      }
    }
    
    console.log(`[v0] Inserting ${insertPromises.length} videos...`);
    return Promise.all(insertPromises);
  })
  .then(() => {
    return client.query('SELECT COUNT(*) as total FROM videos');
  })
  .then((result) => {
    console.log(`[v0] Total videos in database: ${result.rows[0].total}`);
    return client.end();
  })
  .then(() => {
    console.log('[v0] Bulk insert complete!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('[v0] Error:', err.message);
    process.exit(1);
  });
