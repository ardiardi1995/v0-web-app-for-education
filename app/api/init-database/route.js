import { neon } from '@neondatabase/serverless';

export async function GET(request) {
  const startTime = Date.now();
  const messages = [];
  
  if (!process.env.DATABASE_URL) {
    return Response.json({ error: 'DATABASE_URL not set' }, { status: 500 });
  }

  if (!process.env.YOUTUBE_API_KEY) {
    return Response.json({ error: 'YOUTUBE_API_KEY not set' }, { status: 500 });
  }

  const sql = neon(process.env.DATABASE_URL);
  let totalInserted = 0;

  try {
    // Step 1: Create table
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
    messages.push('✓ Videos table created/verified');
    console.log('[v0] Table created successfully');

    // Step 2: Delete old IPA and IPS data
    console.log('[v0] Deleting old IPA and IPS data...');
    await sql`DELETE FROM videos WHERE subject IN ('IPA', 'IPS')`;
    messages.push('✓ Deleted old IPA and IPS data');

    // Step 3: Define subjects for each class
    const SUBJECTS_BY_CLASS = {
      1: ['Matematika', 'Bahasa Indonesia', 'IPAS', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
      2: ['Matematika', 'Bahasa Indonesia', 'IPAS', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
      3: ['Matematika', 'Bahasa Indonesia', 'IPAS', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
    };

    // Step 4: Scrape YouTube for each class and subject
    for (let kelas = 1; kelas <= 3; kelas++) {
      const subjects = SUBJECTS_BY_CLASS[kelas];
      
      for (const subject of subjects) {
        const keyword = `${subject} kelas ${kelas} pelajaran`;
        console.log(`[v0] Scraping: ${keyword}`);
        
        try {
          const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(keyword)}&maxResults=20&type=video&key=${process.env.YOUTUBE_API_KEY}`;
          
          const response = await fetch(searchUrl);
          const data = await response.json();
          
          if (!data.items || data.items.length === 0) {
            console.log(`[v0] No results for: ${keyword}`);
            continue;
          }

          for (const item of data.items) {
            try {
              await sql`
                INSERT INTO videos (videoid, title, description, thumbnail, subject, kelas, category, createdat)
                VALUES (
                  ${item.id.videoId},
                  ${item.snippet.title},
                  ${item.snippet.description},
                  ${item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url || ''},
                  ${subject},
                  ${kelas},
                  'SD',
                  NOW()
                )
                ON CONFLICT (videoid) DO NOTHING
              `;
              totalInserted++;
            } catch (e) {
              // Silently skip duplicates
            }
          }
          
          console.log(`[v0] Inserted videos for ${subject} kelas ${kelas}`);
          // Rate limiting
          await new Promise(r => setTimeout(r, 800));
        } catch (err) {
          console.error(`[v0] Error scraping ${keyword}:`, err.message);
        }
      }
    }

    messages.push(`✓ Total videos inserted: ${totalInserted}`);
    const duration = Date.now() - startTime;
    
    return Response.json({
      success: true,
      messages,
      totalInserted,
      duration: `${duration}ms`
    });
  } catch (error) {
    console.error('[v0] Fatal error:', error);
    return Response.json({
      success: false,
      error: error.message,
      messages
    }, { status: 500 });
  }
}
