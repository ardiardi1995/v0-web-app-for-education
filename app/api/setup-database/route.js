import { neon } from '@neondatabase/serverless';

export async function GET(request) {
  if (!process.env.DATABASE_URL || !process.env.YOUTUBE_API_KEY) {
    return Response.json(
      { success: false, error: 'Missing DATABASE_URL or YOUTUBE_API_KEY' },
      { status: 500 }
    );
  }

  const sql = neon(process.env.DATABASE_URL);

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
        kelas INTEGER,
        category VARCHAR(50),
        createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('[v0] Table created successfully');

    // Step 2: Delete old IPA and IPS data
    console.log('[v0] Deleting old IPA and IPS data...');
    await sql`DELETE FROM videos WHERE subject IN ('IPA', 'IPS')`;
    console.log('[v0] Old data deleted');

    // Step 3: Scrape YouTube videos
    console.log('[v0] Starting YouTube scraping...');
    const SUBJECTS_BY_CLASS = {
      1: ['Matematika', 'Bahasa Indonesia', 'IPAS', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
      2: ['Matematika', 'Bahasa Indonesia', 'IPAS', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
      3: ['Matematika', 'Bahasa Indonesia', 'IPAS', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
    };

    let totalInserted = 0;

    for (let kelas = 1; kelas <= 3; kelas++) {
      for (const subject of SUBJECTS_BY_CLASS[kelas]) {
        const keyword = `${subject} kelas ${kelas} pelajaran`;
        console.log(`[v0] Scraping: ${keyword}`);

        try {
          const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(keyword)}&maxResults=15&type=video&key=${process.env.YOUTUBE_API_KEY}`;
          const response = await fetch(url);
          const data = await response.json();

          if (data.items && data.items.length > 0) {
            let inserted = 0;
            for (const item of data.items) {
              try {
                await sql`
                  INSERT INTO videos (videoid, title, description, thumbnail, subject, kelas, category, createdat)
                  VALUES (
                    ${item.id.videoId},
                    ${item.snippet.title},
                    ${item.snippet.description},
                    ${item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url},
                    ${subject},
                    ${kelas},
                    'SD',
                    NOW()
                  )
                  ON CONFLICT (videoid) DO NOTHING
                `;
                inserted++;
              } catch (err) {
                // Skip duplicates
              }
            }
            totalInserted += inserted;
            console.log(`[v0] Inserted ${inserted} videos for ${subject} kelas ${kelas}`);
          }

          // Rate limiting
          await new Promise(r => setTimeout(r, 500));
        } catch (err) {
          console.error(`[v0] Error scraping ${keyword}:`, err.message);
        }
      }
    }

    return Response.json({
      success: true,
      message: `Setup complete! Inserted ${totalInserted} videos`,
      videosInserted: totalInserted,
    });
  } catch (error) {
    console.error('[v0] Setup error:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
