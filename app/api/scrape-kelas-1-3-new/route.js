import { neon } from '@neondatabase/serverless';

const SUBJECTS_BY_CLASS = {
  1: ['Matematika', 'Bahasa Indonesia', 'IPAS', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
  2: ['Matematika', 'Bahasa Indonesia', 'IPAS', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
  3: ['Matematika', 'Bahasa Indonesia', 'IPAS', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
};

async function searchYouTube(query) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) throw new Error('YOUTUBE_API_KEY not set');

  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&maxResults=25&type=video&key=${apiKey}`;

  try {
    const response = await fetch(url);
    if (response.status === 403) {
      console.log(`[v0] Quota exceeded for: ${query}`);
      return [];
    }
    if (!response.ok) return [];
    
    const data = await response.json();
    return data.items || [];
  } catch (err) {
    console.error(`[v0] Error: ${err.message}`);
    return [];
  }
}

export async function POST(request) {
  try {
    if (!process.env.DATABASE_URL) {
      return Response.json({ error: 'DATABASE_URL not set', success: false }, { status: 500 });
    }

    const sql = neon(process.env.DATABASE_URL);
    
    console.log('[v0] Starting scrape kelas 1-3');

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

    await sql`DELETE FROM videos WHERE subject IN ('IPA', 'IPS')`;

    let totalInserted = 0;

    for (const kelas of [1, 2, 3]) {
      const subjects = SUBJECTS_BY_CLASS[kelas];
      
      for (const subject of subjects) {
        const query = `${subject} kelas ${kelas}`;
        console.log(`[v0] Searching: ${query}`);
        
        const videos = await searchYouTube(query);
        
        for (const video of videos) {
          try {
            await sql`
              INSERT INTO videos (videoid, title, description, thumbnail, category, subject, kelas, createdat)
              VALUES (
                ${video.id.videoId},
                ${video.snippet.title},
                ${video.snippet.description || ''},
                ${video.snippet.thumbnails?.medium?.url || ''},
                'SD',
                ${subject},
                ${kelas},
                NOW()
              )
              ON CONFLICT (videoid) DO NOTHING
            `;
            totalInserted++;
          } catch (e) {}
        }
        
        console.log(`[v0] Got ${videos.length} videos for ${query}`);
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    return Response.json({
      success: true,
      message: `Inserted ${totalInserted} videos for kelas 1-3`,
      totalVideos: totalInserted,
    });
  } catch (error) {
    console.error('[v0] Error:', error.message);
    return Response.json({ error: error.message, success: false }, { status: 500 });
  }
}
