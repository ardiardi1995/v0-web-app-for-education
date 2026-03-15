import { neon } from '@neondatabase/serverless';

// Mata pelajaran untuk kelas 1-3 (SD) - IPAS menggabungkan IPA dan IPS
const SUBJECTS_BY_CLASS = {
  1: ['Matematika', 'Bahasa Indonesia', 'IPAS', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
  2: ['Matematika', 'Bahasa Indonesia', 'IPAS', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
  3: ['Matematika', 'Bahasa Indonesia', 'IPAS', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
};

// Get category for class
function getCategory(kelas) {
  if (kelas <= 6) return 'SD';
  if (kelas <= 9) return 'SMP';
  return 'SMA';
}

// Search YouTube for videos
async function searchYouTubeVideos(query, maxResults = 20) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new Error('YOUTUBE_API_KEY not set');
  }

  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&maxResults=${maxResults}&type=video&order=relevance&key=${apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.statusText}`);
    }
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error(`[v0] Error searching YouTube for "${query}":`, error);
    return [];
  }
}

export async function POST(request) {
  try {
    if (!process.env.DATABASE_URL) {
      return Response.json({ error: 'DATABASE_URL not set', success: false }, { status: 500 });
    }

    const sql = neon(process.env.DATABASE_URL);
    
    console.log('[v0] Starting scrape for kelas 1-3 with IPAS and mandatory subjects');

    // Step 1: Create table if doesn't exist
    console.log('[v0] Creating videos table...');
    await sql`
      CREATE TABLE IF NOT EXISTS videos (
        id SERIAL PRIMARY KEY,
        videoid VARCHAR(255) UNIQUE NOT NULL,
        title VARCHAR(500) NOT NULL,
        description TEXT,
        thumbnail VARCHAR(500),
        subject VARCHAR(100),
        kelas INT,
        category VARCHAR(50),
        createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('[v0] Videos table created/verified');

    // Step 2: Delete old IPA and IPS data
    console.log('[v0] Deleting old IPA and IPS data...');
    try {
      await sql`DELETE FROM videos WHERE subject IN ('IPA', 'IPS')`;
      console.log('[v0] Deleted old IPA and IPS data');
    } catch (e) {
      console.log('[v0] No old data to delete');
    }

    let totalInserted = 0;

    // For each class and subject combination (only Kelas 1-3)
    for (const kelas of [1, 2, 3]) {
      const subjects = SUBJECTS_BY_CLASS[kelas];
      const category = getCategory(kelas);

      for (const subject of subjects) {
        // Search queries per subject
        const keywords = [
          `${subject} kelas ${kelas} pelajaran SD`,
          `${subject} kelas ${kelas}`,
          `belajar ${subject}`,
        ];

        for (const keyword of keywords) {
          console.log(`[v0] Searching for: ${keyword}`);
          const videos = await searchYouTubeVideos(keyword, 20);

          if (videos.length === 0) {
            console.warn(`[v0] No videos found for: ${keyword}`);
            continue;
          }

          // Insert videos
          for (const video of videos) {
            try {
              await sql`
                INSERT INTO videos (videoid, title, description, thumbnail, category, subject, kelas, createdat)
                VALUES (
                  ${video.id.videoId},
                  ${video.snippet.title},
                  ${video.snippet.description || ''},
                  ${video.snippet.thumbnails?.medium?.url || 'https://i.ytimg.com/vi/default/mqdefault.jpg'},
                  ${category},
                  ${subject},
                  ${kelas},
                  NOW()
                )
                ON CONFLICT (videoid) DO NOTHING
              `;
              totalInserted++;
            } catch (err) {
              console.warn(`[v0] Failed to insert video: ${video.snippet.title}`, err.message);
            }
          }

          console.log(`[v0] Inserted videos for ${keyword}`);
          
          // Rate limiting: 800ms delay between searches
          await new Promise(resolve => setTimeout(resolve, 800));
        }
      }
    }

    console.log(`[v0] Total videos inserted: ${totalInserted}`);

    return Response.json({
      success: true,
      message: `Successfully scraped and inserted ${totalInserted} videos from YouTube for kelas 1-3 with IPAS and mandatory subjects`,
      totalVideos: totalInserted,
    });
  } catch (error) {
    console.error('[v0] Scraping error:', error);
    return Response.json(
      {
        error: error.message,
        message: 'Failed to scrape YouTube videos',
        success: false,
      },
      { status: 500 }
    );
  }
}
