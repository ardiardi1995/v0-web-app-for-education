#!/usr/bin/env node

const pg = require('pg');
const https = require('https');
const { Client } = pg;

const SUBJECTS = {
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

function youtubeSearch(query) {
  return new Promise((resolve) => {
    const apiKey = process.env.YOUTUBE_API_KEY;
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=50&key=${apiKey}&relevanceLanguage=id`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result.items || []);
        } catch (err) {
          resolve([]);
        }
      });
    }).on('error', () => resolve([]));
  });
}

async function scrapeAllClasses() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  
  try {
    await client.connect();
    console.log('[v0] Connected - Starting scrape for ALL classes 1-12 with mandatory subjects');
    
    let totalInserted = 0;
    
    for (let kelas = 1; kelas <= 12; kelas++) {
      const subjects = SUBJECTS[kelas];
      console.log(`\n[v0] === Kelas ${kelas}: ${subjects.join(', ')} ===`);
      
      for (const subject of subjects) {
        const queries = [
          `${subject} kelas ${kelas}`,
          `${subject} SMA ${kelas}`,
          `belajar ${subject} kelas ${kelas}`,
          `tutorial ${subject}`,
          `latihan ${subject}`,
        ];

        for (const query of queries) {
          console.log(`[v0] Searching: "${query}"`);
          const videos = await youtubeSearch(query);
          
          for (const video of videos) {
            try {
              const videoid = video.id.videoId;
              const title = video.snippet.title;
              const description = video.snippet.description;
              const thumbnail = video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default?.url;
              
              await client.query(
                'INSERT INTO videos (videoid, title, description, thumbnail, category, subject, kelas, createdat) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())',
                [videoid, title, description, thumbnail, 'SD', subject, kelas]
              );
              totalInserted++;
            } catch (err) {
              // Skip duplicates
            }
          }
          
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
    }
    
    const countResult = await client.query('SELECT COUNT(*) as total FROM videos');
    console.log(`\n[v0] Total videos inserted: ${totalInserted}`);
    console.log(`[v0] Grand total in database: ${countResult.rows[0].total}`);
    
    await client.end();
    process.exit(0);
  } catch (err) {
    console.error('[v0] Error:', err.message);
    process.exit(1);
  }
}

scrapeAllClasses();
