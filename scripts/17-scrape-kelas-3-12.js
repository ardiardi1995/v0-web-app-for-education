#!/usr/bin/env node

const pg = require('pg');
const https = require('https');
const { Client } = pg;

console.log('[v0] Starting YouTube scraper for Kelas 6-12');

const SUBJECTS_BY_CLASS = {
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

    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=50&key=${apiKey}&relevanceLanguage=id`;
    
    https.get(searchUrl, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.error) {
            reject(new Error(`YouTube API error: ${result.error.message}`));
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

async function scrapeAndInsert() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  
  try {
    await client.connect();
    console.log('[v0] Connected to database');
    
    let totalInserted = 0;
    
    for (let kelas = 6; kelas <= 12; kelas++) {
      const subjects = SUBJECTS_BY_CLASS[kelas];
      console.log(`\n[v0] Processing Kelas ${kelas} with subjects: ${subjects.join(', ')}`);
      
      for (const subject of subjects) {
        const query = `${subject} kelas ${kelas} pembelajaran`;
        console.log(`[v0] Searching: "${query}"`);
        
        try {
          const videos = await youtubeSearch(query);
          console.log(`[v0] Found ${videos.length} videos for ${subject} kelas ${kelas}`);
          
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
            } catch (insertErr) {
              console.error(`[v0] Error inserting video: ${insertErr.message}`);
            }
          }
          
          // Rate limit: 500ms between API calls
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (searchErr) {
          console.error(`[v0] Error scraping ${subject} kelas ${kelas}: ${searchErr.message}`);
        }
      }
    }
    
    console.log(`\n[v0] Total videos inserted for Kelas 6-12: ${totalInserted}`);
    await client.end();
    process.exit(0);
  } catch (err) {
    console.error('[v0] Fatal error:', err.message);
    process.exit(1);
  }
}

scrapeAndInsert();
