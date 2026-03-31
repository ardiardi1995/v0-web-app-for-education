import { neon } from '@neondatabase/serverless';

console.log('[v0] Starting setup and scraping for classes 1-3...');
console.log('[v0] DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
console.log('[v0] YOUTUBE_API_KEY:', process.env.YOUTUBE_API_KEY ? 'SET' : 'NOT SET');

const SUBJECTS_BY_CLASS = {
  1: ['Matematika', 'Bahasa Indonesia', 'IPA', 'IPS'],
  2: ['Matematika', 'Bahasa Indonesia', 'IPA', 'IPS'],
  3: ['Matematika', 'Bahasa Indonesia', 'IPA', 'IPS'],
};

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

async function searchYouTubeVideos(query, maxResults = 30) {
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&maxResults=${maxResults}&type=video&key=${YOUTUBE_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.items) {
      console.log(`[v0] No results found for: ${query}`);
      return [];
    }
    
    return data.items.map(item => ({
      videoid: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
    }));
  } catch (error) {
    console.error(`[v0] Error searching YouTube for "${query}":`, error.message);
    return [];
  }
}

async function setupAndScrape() {
  if (!process.env.DATABASE_URL) {
    console.error('[v0] ERROR: DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  if (!process.env.YOUTUBE_API_KEY) {
    console.error('[v0] ERROR: YOUTUBE_API_KEY environment variable is not set');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    // Step 1: Create table with correct schema
    console.log('[v0] Creating videos table...');
    await sql`
      CREATE TABLE IF NOT EXISTS videos (
        id BIGSERIAL PRIMARY KEY,
        videoid VARCHAR(255) NOT NULL UNIQUE,
        title TEXT NOT NULL,
        description TEXT,
        thumbnail VARCHAR(500),
        duration INT,
        category VARCHAR(50),
        subject VARCHAR(100),
        url VARCHAR(500),
        kelas INT,
        createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('[v0] Table created successfully');

    // Step 2: Create indexes
    console.log('[v0] Creating indexes...');
    await sql`CREATE INDEX IF NOT EXISTS idx_videos_category ON videos(category);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_videos_subject ON videos(subject);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_videos_videoid ON videos(videoid);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_videos_kelas ON videos(kelas);`;
    console.log('[v0] Indexes created');

    // Step 3: Scrape and insert videos for classes 1-3
    console.log('[v0] Starting YouTube scraping for classes 1-3...');
    let totalInserted = 0;

    for (let kelas = 1; kelas <= 3; kelas++) {
      const subjects = SUBJECTS_BY_CLASS[kelas];
      
      for (const subject of subjects) {
        const keyword = `${subject} kelas ${kelas} pelajaran`;
        console.log(`[v0] Scraping: ${keyword}`);
        
        try {
          const videos = await searchYouTubeVideos(keyword, 30);
          
          if (videos.length > 0) {
            for (const video of videos) {
              try {
                await sql`
                  INSERT INTO videos (videoid, title, description, thumbnail, subject, kelas, category, createdat)
                  VALUES (${video.videoid}, ${video.title}, ${video.description}, ${video.thumbnail}, ${subject}, ${kelas}, 'SD', NOW())
                  ON CONFLICT (videoid) DO NOTHING
                `;
              } catch (insertError) {
                // Silently skip duplicates
                if (!insertError.message.includes('duplicate')) {
                  console.error(`[v0] Error inserting video:`, insertError.message);
                }
              }
            }
            totalInserted += videos.length;
            console.log(`[v0] Inserted ${videos.length} videos for ${subject} kelas ${kelas}`);
          }
          
          // Rate limiting to respect YouTube API quotas
          await new Promise(r => setTimeout(r, 500));
        } catch (err) {
          console.error(`[v0] Error scraping ${keyword}:`, err.message);
        }
      }
    }

    console.log(`[v0] ✓ Setup complete! Total videos inserted: ${totalInserted}`);
    console.log('[v0] Videos are now available in the database for classes 1-3');
  } catch (err) {
    console.error('[v0] Error:', err);
    process.exit(1);
  }
}

setupAndScrape();
