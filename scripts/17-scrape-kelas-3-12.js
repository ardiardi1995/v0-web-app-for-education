#!/usr/bin/env node

const pg = require('pg');
const https = require('https');
const { Client } = pg;

console.log('[v0] Starting YouTube scraper for Kelas 3-12');
console.log('[v0] DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
console.log('[v0] YOUTUBE_API_KEY:', process.env.YOUTUBE_API_KEY ? 'SET' : 'NOT SET');

if (!process.env.DATABASE_URL) {
  console.error('[v0] DATABASE_URL not set');
  process.exit(1);
}

if (!process.env.YOUTUBE_API_KEY) {
  console.error('[v0] YOUTUBE_API_KEY not set');
  process.exit(1);
}

const SUBJECTS_BY_CLASS = {
  3: ['Matematika', 'Bahasa Indonesia', 'IPA', 'IPS'],
  4: ['Matematika', 'Bahasa Indonesia', 'IPA', 'IPS', 'Bahasa Inggris'],
  5: ['Matematika', 'Bahasa Indonesia', 'IPA', 'IPS', 'Bahasa Inggris'],
  6: ['Matematika', 'Bahasa Indonesia', 'IPA', 'IPS', 'Bahasa Inggris'],
  7: ['Matematika', 'Fisika', 'Biologi', 'Kimia', 'Bahasa Indonesia', 'Bahasa Inggris'],
  8: ['Matematika', 'Fisika', 'Biologi', 'Kimia', 'Bahasa Indonesia', 'Bahasa Inggris'],
  9: ['Matematika', 'Fisika', 'Biologi', 'Kimia', 'Bahasa Indonesia', 'Bahasa Inggris'],
  10: ['Matematika', 'Fisika', 'Kimia', 'Biologi', 'Bahasa Inggris'],
  11: ['Matematika', 'Fisika', 'Kimia', 'Biologi', 'Bahasa Inggris'],
  12: ['Matematika', 'Fisika', 'Kimia', 'Biologi', 'Bahasa Inggris'],
};

function youtubeSearch(query) {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      reject(new Error('YOUTUBE_API_KEY not set'));
      return;
    }

    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=50&key=${apiKey}&relevanceLanguage=id`;

    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.error) {
            reject(new Error(result.error.message));
          } else {
            resolve(result.items || []);
          }
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', reject);
  });
}

async function scrapeAndPopulate() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('[v0] Connected to database');

    let totalInserted = 0;

    for (let kelas = 3; kelas <= 12; kelas++) {
      const subjects = SUBJECTS_BY_CLASS[kelas];
      console.log(`[v0] Processing Kelas ${kelas}...`);
      
      for (const subject of subjects) {
        const query = `${subject} kelas ${kelas} pembelajaran`;
        console.log(`[v0] Scraping: ${query}`);
        
        try {
          const videos = await youtubeSearch(query);
          console.log(`[v0] Found ${videos.length} videos for ${query}`);
          
          for (const video of videos) {
            const videoid = video.id.videoId;
            const title = video.snippet.title;
            const description = video.snippet.description;
            const thumbnail = video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default?.url;

            await client.query(
              'INSERT INTO videos (videoid, title, description, thumbnail, category, subject, kelas, createdat) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())',
              [videoid, title, description, thumbnail, 'SD', subject, kelas]
            );
            totalInserted++;
          }
          
          // Rate limit - wait 1 second between API calls
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (err) {
          console.error(`[v0] Error scraping ${query}:`, err.message);
        }
      }
    }

    console.log(`[v0] Total videos inserted: ${totalInserted}`);
    await client.end();
    console.log('[v0] Done!');
    process.exit(0);
  } catch (err) {
    console.error('[v0] Error:', err);
    process.exit(1);
  }
}

scrapeAndPopulate();
