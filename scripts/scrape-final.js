import { neon } from '@neondatabase/serverless';
import https from 'https';

// Subjects untuk SD Kelas 1-3 (kurikulum terbaru)
const SUBJECTS_BY_CLASS = {
  1: ['Matematika', 'Bahasa Indonesia', 'IPAS', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
  2: ['Matematika', 'Bahasa Indonesia', 'IPAS', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
  3: ['Matematika', 'Bahasa Indonesia', 'IPAS', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
};

const DATABASE_URL = process.env.DATABASE_URL;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// Helper untuk fetch dengan timeout
async function fetchWithTimeout(url, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => reject(new Error('Fetch timeout')), timeout);
    
    https.get(url, (response) => {
      clearTimeout(timeoutId);
      let data = '';
      
      response.on('data', chunk => {
        data += chunk;
      });
      
      response.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', (e) => {
      clearTimeout(timeoutId);
      reject(e);
    });
  });
}

async function searchYouTubeVideos(query, maxResults = 15) {
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&maxResults=${maxResults}&type=video&key=${YOUTUBE_API_KEY}`;
    
    const data = await fetchWithTimeout(url);
    
    if (!data.items) {
      console.log(`[v0] No results for: ${query}`);
      return [];
    }
    
    return data.items.map(item => ({
      videoid: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
    }));
  } catch (error) {
    console.error(`[v0] Error searching: ${query}`, error.message);
    return [];
  }
}

async function deleteOldData(sql, kelas) {
  try {
    const result = await sql`
      DELETE FROM videos 
      WHERE kelas = ${kelas} AND (subject = 'IPA' OR subject = 'IPS')
    `;
    console.log(`[v0] Deleted old IPA/IPS data for kelas ${kelas}`);
  } catch (error) {
    console.error(`[v0] Error deleting old data:`, error.message);
  }
}

async function insertVideos(sql, kelas, subject, videos) {
  let inserted = 0;
  
  for (const video of videos) {
    try {
      await sql`
        INSERT INTO videos (videoid, title, description, thumbnail, subject, kelas, category, createdat)
        VALUES (${video.videoid}, ${video.title}, ${video.description}, ${video.thumbnail}, ${subject}, ${kelas}, 'SD', NOW())
        ON CONFLICT (videoid) DO NOTHING
      `;
      inserted++;
    } catch (error) {
      // Ignore duplicate errors
    }
  }
  
  return inserted;
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
  
  const sql = neon(DATABASE_URL);
  let totalInserted = 0;
  
  try {
    console.log('[v0] Starting scraping for classes 1-3...\n');
    
    // Process each class
    for (let kelas = 1; kelas <= 3; kelas++) {
      console.log(`\n--- Processing Kelas ${kelas} ---`);
      
      // Delete old IPA/IPS data
      await deleteOldData(sql, kelas);
      
      const subjects = SUBJECTS_BY_CLASS[kelas];
      
      // Scrape each subject
      for (const subject of subjects) {
        const keyword = `${subject} kelas ${kelas} pelajaran`;
        console.log(`[v0] Scraping: ${keyword}`);
        
        try {
          const videos = await searchYouTubeVideos(keyword, 15);
          
          if (videos.length > 0) {
            const inserted = await insertVideos(sql, kelas, subject, videos);
            totalInserted += inserted;
            console.log(`    ✓ Inserted ${inserted}/${videos.length} videos`);
          } else {
            console.log(`    ✗ No videos found`);
          }
          
          // Rate limit
          await new Promise(r => setTimeout(r, 1000));
        } catch (err) {
          console.error(`[v0] Error with ${subject}:`, err.message);
        }
      }
    }
    
    console.log(`\n[v0] ✓ Scraping complete! Total videos inserted: ${totalInserted}`);
    process.exit(0);
  } catch (error) {
    console.error('[v0] Fatal error:', error);
    process.exit(1);
  }
}

main();
