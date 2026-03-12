#!/usr/bin/env node

const pg = require('pg');
const https = require('https');
const { Client } = pg;

const SUBJECTS_BY_CLASS = {
  8: ['Matematika', 'Fisika', 'Biologi', 'Kimia', 'Bahasa Indonesia', 'Bahasa Inggris'],
  9: ['Matematika', 'Fisika', 'Biologi', 'Kimia', 'Bahasa Indonesia', 'Bahasa Inggris'],
  10: ['Matematika', 'Fisika', 'Kimia', 'Biologi', 'Bahasa Inggris'],
  11: ['Matematika', 'Fisika', 'Kimia', 'Biologi', 'Bahasa Inggris'],
  12: ['Matematika', 'Fisika', 'Kimia', 'Biologi', 'Bahasa Inggris'],
};

function youtubeSearch(query) {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.YOUTUBE_API_KEY;
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=50&key=${apiKey}&relevanceLanguage=id`;
    
    https.get(searchUrl, (res) => {
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

async function scrapeKelas812() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('[v0] Connected to database');
    
    await client.query('DELETE FROM videos WHERE kelas >= 8 AND kelas <= 12');
    console.log('[v0] Cleared Kelas 8-12');
    
    let totalInserted = 0;
    
    for (let kelas = 8; kelas <= 12; kelas++) {
      const subjects = SUBJECTS_BY_CLASS[kelas];
      console.log(`\n[v0] Scraping Kelas ${kelas}: ${subjects.join(', ')}`);
      
      for (const subject of subjects) {
        const query = `${subject} kelas ${kelas} pembelajaran`;
        console.log(`[v0] Searching: "${query}"`);
        
        const videos = await youtubeSearch(query);
        console.log(`[v0] Found ${videos.length} videos`);
        
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
        
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    console.log(`\n[v0] Total videos inserted: ${totalInserted}`);
    await client.end();
    process.exit(0);
  } catch (err) {
    console.error('[v0] Error:', err.message);
    process.exit(1);
  }
}

scrapeKelas812();
