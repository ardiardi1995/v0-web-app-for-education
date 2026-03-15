const { neon } = require('@neondatabase/serverless');

async function scrapeAndPopulate() {
  console.log('[v0] Starting scraper...\n');

  const DATABASE_URL = process.env.DATABASE_URL;
  const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

  if (!DATABASE_URL) {
    console.error('[v0] ERROR: DATABASE_URL not set');
    process.exit(1);
  }

  if (!YOUTUBE_API_KEY) {
    console.error('[v0] ERROR: YOUTUBE_API_KEY not set');
    process.exit(1);
  }

  const sql = neon(DATABASE_URL);

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
    console.log('[v0] ✓ Videos table created/verified\n');

    // Step 2: Delete old IPA/IPS data
    console.log('[v0] Deleting old IPA/IPS data...');
    await sql`DELETE FROM videos WHERE subject IN ('IPA', 'IPS')`;
    console.log('[v0] ✓ Deleted old IPA/IPS data\n');

    // Step 3: Scrape YouTube
    console.log('[v0] Starting YouTube scraping for classes 1-3...\n');

    const SUBJECTS_BY_CLASS = {
      1: ['Matematika', 'Bahasa Indonesia', 'IPAS', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
      2: ['Matematika', 'Bahasa Indonesia', 'IPAS', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
      3: ['Matematika', 'Bahasa Indonesia', 'IPAS', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
    };

    let totalInserted = 0;
    let subjectCount = 0;
    const totalSubjects = 3 * 7; // 3 classes x 7 subjects

    for (let kelas = 1; kelas <= 3; kelas++) {
      const subjects = SUBJECTS_BY_CLASS[kelas];

      for (const subject of subjects) {
        subjectCount++;
        const searchQuery = `${subject} kelas ${kelas} pelajaran SD`;
        console.log(`[${subjectCount}/${totalSubjects}] Scraping: ${searchQuery}`);

        try {
          const youtubeUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&maxResults=15&type=video&key=${YOUTUBE_API_KEY}`;
          
          const response = await fetch(youtubeUrl);
          const data = await response.json();

          if (data.items && Array.isArray(data.items)) {
            let inserted = 0;
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
                inserted++;
                totalInserted++;
              } catch (err) {
                // Skip duplicates
              }
            }
            console.log(`     ✓ Found ${data.items.length} videos, inserted ${inserted} new videos\n`);
          } else {
            console.log(`     ✗ No results found\n`);
          }

          // Rate limiting to respect YouTube API quotas
          await new Promise(r => setTimeout(r, 800));
        } catch (error) {
          console.error(`     ✗ Error: ${error.message}\n`);
        }
      }
    }

    console.log('========================================');
    console.log(`[v0] ✓ Scraping complete!`);
    console.log(`[v0] Total videos inserted: ${totalInserted}`);
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[v0] Fatal error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

scrapeAndPopulate();
