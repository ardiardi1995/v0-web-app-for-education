#!/usr/bin/env node

const pg = require('pg');
const https = require('https');
const { Client } = pg;

const SUBJECTS_BY_CLASS = {
  9: ['Matematika', 'Fisika', 'Biologi', 'Kimia', 'Bahasa Indonesia', 'Bahasa Inggris'],
  10: ['Matematika', 'Fisika', 'Kimia', 'Biologi', 'Bahasa Inggris'],
  11: ['Matematika', 'Fisika', 'Kimia', 'Biologi', 'Bahasa Inggris'],
  12: ['Matematika', 'Fisika', 'Kimia', 'Biologi', 'Bahasa Inggris'],
};

function youtubeSearch(query, pageToken = '') {
  return new Promise((resolve) => {
    const apiKey = process.env.YOUTUBE_API_KEY;
    let searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=50&key=${apiKey}&relevanceLanguage=id`;
    if (pageToken) searchUrl += `&pageToken=${pageToken}`;
    
    https.get(searchUrl, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve({ items: result.items || [], nextPageToken: result.nextPageToken });
        } catch (err) {
          resolve({ items: [], nextPageToken: '' });
        }
      });
    }).on('error', () => resolve({ items: [], nextPageToken: '' }));
  });
}

async function scrapeKelas912() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('[v0] Connected to database');
    console.log('[v0] Scraping Kelas 9-12 (NOT deleting existing data)');
    
    let totalInserted = 0;
    
    for (let kelas = 9; kelas <= 12; kelas++) {
      const subjects = SUBJECTS_BY_CLASS[kelas];
      console.log(`\n[v0] Scraping Kelas ${kelas}: ${subjects.join(', ')}`);
      
      for (const subject of subjects) {
        // Multiple search queries per subject to get more videos
        const queries = [
          `${subject} kelas ${kelas} pembelajaran`,
          `${subject} SMA ${kelas}`,
          `belajar ${subject} kelas ${kelas}`,
          `tutorial ${subject} kelas ${kelas}`,
          `latihan ${subject} kelas ${kelas}`,
        ];
        
        for (const query of queries) {
          console.log(`[v0] Searching: "${query}"`);
          
          let pageToken = '';
          let pageCount = 0;
          
          // Get multiple pages per search (up to 3 pages = 150 videos)
          while (pageCount < 3) {
            const result = await youtubeSearch(query, pageToken);
            const videos = result.items;
            
            if (videos.length === 0) break;
            
            console.log(`[v0] Found ${videos.length} videos (page ${pageCount + 1})`);
            
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
            
            pageToken = result.nextPageToken;
            if (!pageToken) break;
            
            pageCount++;
            await new Promise(resolve => setTimeout(resolve, 300));
          }
          
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
    }
    
    console.log(`\n[v0] Total videos inserted for Kelas 9-12: ${totalInserted}`);
    
    // Check final count
    const countResult = await client.query('SELECT COUNT(*) as total FROM videos');
    console.log(`[v0] Grand total videos in database: ${countResult.rows[0].total}`);
    
    await client.end();
    process.exit(0);
  } catch (err) {
    console.error('[v0] Error:', err.message);
    process.exit(1);
  }
}

scrapeKelas912();
