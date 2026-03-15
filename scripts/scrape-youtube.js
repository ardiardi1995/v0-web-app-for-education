const https = require('https');
const { Pool } = require('pg');

console.log('[v0] Starting YouTube scraper for classes 1-3...');

// Configuration
const SUBJECTS_BY_CLASS = {
  1: ['Matematika', 'Bahasa Indonesia', 'IPAS', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
  2: ['Matematika', 'Bahasa Indonesia', 'IPAS', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
  3: ['Matematika', 'Bahasa Indonesia', 'IPAS', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
};

const DATABASE_URL = process.env.DATABASE_URL;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

if (!DATABASE_URL) {
  console.error('[v0] ERROR: DATABASE_URL not set');
  process.exit(1);
}

if (!YOUTUBE_API_KEY) {
  console.error('[v0] ERROR: YOUTUBE_API_KEY not set');
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL });

async function searchYouTube(query) {
  return new Promise((resolve, reject) => {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&maxResults=20&type=video&key=${YOUTUBE_API_KEY}`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.items) {
            resolve(json.items.map(item => ({
              videoid: item.id.videoId,
              title: item.snippet.title,
              description: item.snippet.description,
              thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
            })));
          } else {
            resolve([]);
          }
        } catch (e) {
          resolve([]);
        }
      });
    }).on('error', () => resolve([]));
  });
}

async function main() {
  const client = await pool.connect();
  let totalInserted = 0;
  
  try {
    for (let kelas = 1; kelas <= 3; kelas++) {
      console.log(`[v0] Processing Kelas ${kelas}...`);
      
      // Delete old IPA/IPS data
      await client.query('DELETE FROM videos WHERE kelas = $1 AND (subject = $2 OR subject = $3)', [kelas, 'IPA', 'IPS']);
      console.log(`[v0] Deleted old IPA/IPS videos for kelas ${kelas}`);
      
      const subjects = SUBJECTS_BY_CLASS[kelas];
      
      for (const subject of subjects) {
        const keyword = `${subject} kelas ${kelas} pelajaran`;
        console.log(`[v0] Scraping: ${keyword}`);
        
        const videos = await searchYouTube(keyword);
        
        for (const video of videos) {
          try {
            await client.query(
              `INSERT INTO videos (videoid, title, description, thumbnail, subject, kelas, category, createdat)
               VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
               ON CONFLICT (videoid) DO NOTHING`,
              [video.videoid, video.title, video.description, video.thumbnail, subject, kelas, 'SD']
            );
            totalInserted++;
          } catch (e) {
            // Skip duplicates silently
          }
        }
        
        // Rate limiting
        await new Promise(r => setTimeout(r, 800));
      }
    }
    
    console.log(`[v0] ✓ Complete! Inserted ${totalInserted} videos`);
  } catch (error) {
    console.error('[v0] Error:', error);
  } finally {
    client.release();
    await pool.end();
    process.exit(0);
  }
}

main();
