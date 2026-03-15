const { neon } = require('@neondatabase/serverless');
const https = require('https');

const DATABASE_URL = process.env.DATABASE_URL;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

const SUBJECTS_BY_CLASS = {
  1: ['Matematika', 'Bahasa Indonesia', 'IPAS', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
  2: ['Matematika', 'Bahasa Indonesia', 'IPAS', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
  3: ['Matematika', 'Bahasa Indonesia', 'IPAS', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
};

async function searchYouTube(query, maxResults = 15) {
  return new Promise((resolve, reject) => {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&maxResults=${maxResults}&type=video&key=${YOUTUBE_API_KEY}`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const videos = (json.items || []).map(item => ({
            videoid: item.id.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
          }));
          resolve(videos);
        } catch (e) {
          resolve([]);
        }
      });
    }).on('error', () => resolve([]));
  });
}

async function main() {
  if (!DATABASE_URL) {
    console.error('[v0] ERROR: DATABASE_URL not set');
    process.exit(1);
  }
  if (!YOUTUBE_API_KEY) {
    console.error('[v0] ERROR: YOUTUBE_API_KEY not set');
    process.exit(1);
  }

  try {
    const sql = neon(DATABASE_URL);

    // Step 1: Create table
    console.log('[v0] Creating videos table...');
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS videos (
          id SERIAL PRIMARY KEY,
          videoid VARCHAR(255) UNIQUE NOT NULL,
          title VARCHAR(500) NOT NULL,
          description TEXT,
          thumbnail VARCHAR(500),
          category VARCHAR(100),
          subject VARCHAR(100) NOT NULL,
          kelas INTEGER NOT NULL,
          createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      console.log('[v0] ✓ Videos table created/exists');
    } catch (e) {
      console.log('[v0] ✓ Videos table already exists');
    }

    // Step 2: Delete old IPA/IPS data
    console.log('[v0] Deleting old IPA/IPS data...');
    try {
      await sql`DELETE FROM videos WHERE subject IN ('IPA', 'IPS')`;
      console.log('[v0] ✓ Old IPA/IPS data deleted');
    } catch (e) {
      console.log('[v0] (No old data to delete)');
    }

    // Step 3: Scrape and insert
    let totalInserted = 0;
    for (let kelas = 1; kelas <= 3; kelas++) {
      const subjects = SUBJECTS_BY_CLASS[kelas];
      for (const subject of subjects) {
        const keyword = `${subject} kelas ${kelas} pelajaran sekolah`;
        console.log(`[v0] Scraping: ${keyword}`);
        
        try {
          const videos = await searchYouTube(keyword, 15);
          
          for (const video of videos) {
            try {
              await sql`
                INSERT INTO videos (videoid, title, description, thumbnail, subject, kelas, category)
                VALUES (${video.videoid}, ${video.title}, ${video.description}, ${video.thumbnail}, ${subject}, ${kelas}, 'SD')
                ON CONFLICT (videoid) DO NOTHING
              `;
              totalInserted++;
            } catch (e) {
              // Skip duplicates
            }
          }
          console.log(`[v0]   → Inserted ${videos.length} videos`);
          
          // Rate limiting
          await new Promise(r => setTimeout(r, 1000));
        } catch (e) {
          console.error(`[v0] Error scraping ${keyword}:`, e.message);
        }
      }
    }

    console.log(`\n[v0] ✓✓✓ SUCCESS! Total videos inserted: ${totalInserted}`);
    process.exit(0);
  } catch (error) {
    console.error('[v0] Fatal error:', error);
    process.exit(1);
  }
}

main();
