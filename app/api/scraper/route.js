import { neon } from '@neondatabase/serverless';

const SUBJECTS_BY_CLASS = {
  1: ['Matematika', 'Bahasa Indonesia', 'IPAS', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
  2: ['Matematika', 'Bahasa Indonesia', 'IPAS', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
  3: ['Matematika', 'Bahasa Indonesia', 'IPAS', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
};

async function searchYouTube(query) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) throw new Error('YOUTUBE_API_KEY not set');

  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&maxResults=10&type=video&key=${apiKey}`;
  
  const response = await fetch(url);
  if (!response.ok) throw new Error(`YouTube API error: ${response.status}`);
  
  const data = await response.json();
  return data.items || [];
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (!process.env.DATABASE_URL) {
    return Response.json({ success: false, error: 'DATABASE_URL not set' }, { status: 500 });
  }

  if (!process.env.YOUTUBE_API_KEY) {
    return Response.json({ success: false, error: 'YOUTUBE_API_KEY not set' }, { status: 500 });
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    if (action === 'setup') {
      // Create table
      await sql`
        CREATE TABLE IF NOT EXISTS videos (
          id SERIAL PRIMARY KEY,
          videoid VARCHAR(255) UNIQUE NOT NULL,
          title VARCHAR(500) NOT NULL,
          description TEXT,
          thumbnail VARCHAR(500),
          category VARCHAR(100),
          subject VARCHAR(100),
          kelas INTEGER,
          createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      return Response.json({ success: true, message: 'Table created' });
    }

    if (action === 'delete-old') {
      // Delete old IPA and IPS data
      const result = await sql`
        DELETE FROM videos 
        WHERE subject IN ('IPA', 'IPS')
      `;
      return Response.json({ success: true, message: `Deleted old data` });
    }

    if (action === 'scrape') {
      let totalInserted = 0;

      for (let kelas = 1; kelas <= 3; kelas++) {
        const subjects = SUBJECTS_BY_CLASS[kelas];
        
        for (const subject of subjects) {
          const keyword = `${subject} kelas ${kelas} pelajaran`;
          console.log(`[v0] Scraping: ${keyword}`);
          
          try {
            const results = await searchYouTube(keyword);
            
            for (const item of results) {
              if (!item.id?.videoId) continue;
              
              try {
                await sql`
                  INSERT INTO videos (videoid, title, description, thumbnail, subject, kelas, category, createdat)
                  VALUES (
                    ${item.id.videoId},
                    ${item.snippet.title},
                    ${item.snippet.description || ''},
                    ${item.snippet.thumbnails?.medium?.url || ''},
                    ${subject},
                    ${kelas},
                    'SD',
                    NOW()
                  )
                  ON CONFLICT (videoid) DO NOTHING
                `;
                totalInserted++;
              } catch (e) {
                // Skip duplicate or other errors
              }
            }
            
            // Rate limit
            await new Promise(r => setTimeout(r, 500));
          } catch (err) {
            console.error(`[v0] Error scraping ${keyword}:`, err.message);
          }
        }
      }

      return Response.json({ 
        success: true, 
        message: `Scraped and inserted ${totalInserted} videos` 
      });
    }

    return Response.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('[v0] Error:', error);
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : 'Error' },
      { status: 500 }
    );
  }
}
