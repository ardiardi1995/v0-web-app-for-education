const pg = require('pg');
const https = require('https');
const { Client } = pg;

const SUBJECTS = {
  9: ['Matematika', 'Fisika', 'Biologi', 'Kimia', 'Bahasa Indonesia', 'Bahasa Inggris'],
  10: ['Matematika', 'Fisika', 'Kimia', 'Biologi', 'Bahasa Inggris'],
  11: ['Matematika', 'Fisika', 'Kimia', 'Biologi', 'Bahasa Inggris'],
  12: ['Matematika', 'Fisika', 'Kimia', 'Biologi', 'Bahasa Inggris'],
};

const client = new Client({ connectionString: process.env.DATABASE_URL });
let totalInserted = 0;

function youtubeSearch(query) {
  return new Promise((resolve) => {
    const apiKey = process.env.YOUTUBE_API_KEY;
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=50&key=${apiKey}&relevanceLanguage=id`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.items || []);
        } catch (e) {
          resolve([]);
        }
      });
    }).on('error', () => resolve([]));
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function insertVideo(videoid, title, description, thumbnail, subject, kelas) {
  try {
    await client.query(
      'INSERT INTO videos (videoid, title, description, thumbnail, category, subject, kelas, createdat) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())',
      [videoid, title, description, thumbnail, 'SD', subject, kelas]
    );
    totalInserted++;
  } catch (e) {
    // Duplicate or error - skip
  }
}

async function scrapeAll() {
  try {
    await client.connect();
    console.log('[v0] Connected. Scraping Kelas 9-12...');
    
    for (let kelas = 9; kelas <= 12; kelas++) {
      console.log(`\n[v0] Kelas ${kelas}`);
      const subjects = SUBJECTS[kelas];
      
      for (const subject of subjects) {
        const queries = [
          `${subject} kelas ${kelas}`,
          `${subject} pembelajaran ${kelas}`,
          `belajar ${subject} ${kelas}`,
          `tutorial ${subject} ${kelas}`,
          `contoh soal ${subject} ${kelas}`,
        ];
        
        for (const query of queries) {
          const videos = await youtubeSearch(query);
          console.log(`[v0] ${subject}: "${query}" -> ${videos.length} videos`);
          
          for (const video of videos) {
            const videoid = video.id.videoId;
            const title = video.snippet.title;
            const description = video.snippet.description;
            const thumbnail = video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default?.url;
            await insertVideo(videoid, title, description, thumbnail, subject, kelas);
          }
          
          await sleep(300);
        }
      }
    }
    
    console.log(`\n[v0] Total inserted: ${totalInserted}`);
    await client.end();
    process.exit(0);
  } catch (err) {
    console.error('[v0] Error:', err.message);
    process.exit(1);
  }
}

scrapeAll();
