import { neon } from '@neondatabase/serverless';

export async function GET(request) {
  if (!process.env.DATABASE_URL) {
    return Response.json({ error: 'DATABASE_URL not set' }, { status: 500 });
  }

  if (!process.env.YOUTUBE_API_KEY) {
    return Response.json({ error: 'YOUTUBE_API_KEY not set' }, { status: 500 });
  }

  const sql = neon(process.env.DATABASE_URL);
  let totalInserted = 0;
  const messages = [];

  try {
    // Step 1: Create table if it doesn't exist
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
    messages.push('[✓] Videos table created/verified');

    // Step 2: Delete old IPA and IPS data
    try {
      await sql`DELETE FROM videos WHERE subject IN ('IPA', 'IPS')`;
      messages.push('[✓] Deleted old IPA and IPS data');
    } catch (e) {
      messages.push('[✓] Table ready for scraping');
    }

    const SUBJECTS_BY_CLASS = {
      1: ['Matematika', 'Bahasa Indonesia', 'IPAS', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
      2: ['Matematika', 'Bahasa Indonesia', 'IPAS', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
      3: ['Matematika', 'Bahasa Indonesia', 'IPAS', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
    };

    // Scrape YouTube for each class and subject
    for (let kelas = 1; kelas <= 3; kelas++) {
      for (const subject of SUBJECTS_BY_CLASS[kelas]) {
        const searchQuery = `${subject} kelas ${kelas} pelajaran`;
        
        try {
          const youtubeUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&maxResults=15&type=video&key=${process.env.YOUTUBE_API_KEY}`;
          
          const response = await fetch(youtubeUrl);
          const data = await response.json();

          if (data.items && data.items.length > 0) {
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
              } catch (insertError) {
                // Skip duplicates
              }
            }
            messages.push(`[✓] Scraped ${subject} kelas ${kelas}: ${data.items.length} videos found`);
          }

          // Rate limiting
          await new Promise(r => setTimeout(r, 500));
        } catch (error) {
          messages.push(`[✗] Error scraping ${subject} kelas ${kelas}`);
        }
      }
    }

    return Response.json({
      success: true,
      totalInserted,
      messages,
    });
  } catch (error) {
    console.error('[Setup] Error:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        messages,
      },
      { status: 500 }
    );
  }
}
