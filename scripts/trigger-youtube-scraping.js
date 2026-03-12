#!/usr/bin/env node

const pg = require('pg');
const https = require('https');
const { Client } = pg;

console.log('[v0] Checking environment...');
console.log('[v0] DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('[v0] YOUTUBE_API_KEY exists:', !!process.env.YOUTUBE_API_KEY);

const SUBJECTS_BY_CLASS = {
  1: ['Matematika', 'Bahasa Indonesia', 'IPA', 'IPS'],
  2: ['Matematika', 'Bahasa Indonesia', 'IPA', 'IPS'],
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
    const url = new URL('https://www.googleapis.com/youtube/v3/search');
    url.searchParams.append('part', 'snippet');
    url.searchParams.append('q', query);
    url.searchParams.append('type', 'video');
    url.searchParams.append('maxResults', 50);
    url.searchParams.append('key', apiKey);
    url.searchParams.append('relevanceLanguage', 'id');

    https.get(url.toString(), (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result.items || []);
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

    // Delete old videos
    await client.query('DELETE FROM videos');
    console.log('[v0] Cleared old videos');

    let totalInserted = 0;

    for (let kelas = 1; kelas <= 12; kelas++) {
      const subjects = SUBJECTS_BY_CLASS[kelas];
      
      for (const subject of subjects) {
        const query = `${subject} kelas ${kelas} pembelajaran`;
        console.log(`[v0] Scraping: ${query}`);
        
        try {
          const videos = await youtubeSearch(query);
          
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
          
          // Rate limit
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (err) {
          console.error(`[v0] Error scraping ${query}:`, err.message);
        }
      }
    }

    console.log(`[v0] Total videos inserted: ${totalInserted}`);
    await client.end();
    process.exit(0);
  } catch (err) {
    console.error('[v0] Error:', err);
    process.exit(1);
  }
}

scrapeAndPopulate();
