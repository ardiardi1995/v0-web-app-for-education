const { neon } = await import('@neondatabase/serverless');

console.log('[v0] Starting scraper for classes 1-3...');

const SUBJECTS_BY_CLASS = {
  1: ['Matematika', 'Bahasa Indonesia', 'IPA', 'IPS'],
  2: ['Matematika', 'Bahasa Indonesia', 'IPA', 'IPS'],
  3: ['Matematika', 'Bahasa Indonesia', 'IPA', 'IPS'],
};

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

async function searchYouTubeVideos(query, maxResults = 20) {
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

async function scrapeAndInsert() {
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
    console.log('[v0] Starting YouTube scraping for classes 1-3...');
    let totalInserted = 0;

    for (let kelas = 1; kelas <= 3; kelas++) {
      const subjects = SUBJECTS_BY_CLASS[kelas];
      
      for (const subject of subjects) {
        const keyword = `${subject} kelas ${kelas} pelajaran`;
        console.log(`[v0] Scraping: ${keyword}`);
        
        try {
          const videos = await searchYouTubeVideos(keyword, 20);
          
          if (videos.length > 0) {
            let inserted = 0;
            for (const video of videos) {
              try {
                await sql`
                  INSERT INTO videos (videoid, title, description, thumbnail, subject, kelas, category, createdat)
                  VALUES (${video.videoid}, ${video.title}, ${video.description}, ${video.thumbnail}, ${subject}, ${kelas}, 'SD', NOW())
                  ON CONFLICT (videoid) DO NOTHING
                `;
                inserted++;
              } catch (insertError) {
                // Silently skip duplicates and other conflicts
              }
            }
            totalInserted += inserted;
            console.log(`[v0] Inserted ${inserted} new videos for ${subject} kelas ${kelas}`);
          }
          
          // Rate limiting to respect YouTube API quotas
          await new Promise(r => setTimeout(r, 800));
        } catch (err) {
          console.error(`[v0] Error scraping ${keyword}:`, err.message);
        }
      }
    }

    console.log(`[v0] ✓ Scraping complete! Total videos inserted: ${totalInserted}`);
    process.exit(0);
  } catch (err) {
    console.error('[v0] Fatal error:', err);
    process.exit(1);
  }
}

scrapeAndInsert();
