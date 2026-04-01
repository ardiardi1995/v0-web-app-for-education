import { neon } from '@neondatabase/serverless';

const SUBJECTS_BY_CLASS = {
  7: ['Pendidikan Agama dan Budi Pekerti', 'Pendidikan Pancasila', 'Bahasa Indonesia', 'Matematika', 'Ilmu Pengetahuan Alam (IPA)', 'Ilmu Pengetahuan Sosial (IPS)', 'Bahasa Inggris', 'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)', 'Informatika', 'Seni dan Prakarya'],
  8: ['Pendidikan Agama dan Budi Pekerti', 'Pendidikan Pancasila', 'Bahasa Indonesia', 'Matematika', 'Ilmu Pengetahuan Alam (IPA)', 'Ilmu Pengetahuan Sosial (IPS)', 'Bahasa Inggris', 'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)', 'Informatika', 'Seni dan Prakarya'],
  9: ['Pendidikan Agama dan Budi Pekerti', 'Pendidikan Pancasila', 'Bahasa Indonesia', 'Matematika', 'Ilmu Pengetahuan Alam (IPA)', 'Ilmu Pengetahuan Sosial (IPS)', 'Bahasa Inggris', 'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)', 'Informatika', 'Seni dan Prakarya'],
};

async function searchYouTube(query) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) throw new Error('YOUTUBE_API_KEY not set');

  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&maxResults=50&type=video&key=${apiKey}`;

  try {
    console.log(`[v0] Searching: "${query}"`);
    
    const response = await fetch(url);
    
    if (response.status === 403) {
      const errorData = await response.json();
      console.log(`[v0] ❌ 403 QUOTA EXCEEDED: ${errorData.error?.message}`);
      return [];
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`[v0] ❌ Error ${response.status}: ${errorText}`);
      return [];
    }
    
    const data = await response.json();
    console.log(`[v0] ✓ Got ${data.items ? data.items.length : 0} videos`);
    return data.items || [];
  } catch (err) {
    console.error(`[v0] ❌ Fetch ERROR: ${err.message}`);
    return [];
  }
}

export async function POST(request) {
  try {
    console.log(`\n[v0] ╔════════════════════════════════════════╗`);
    console.log(`[v0] ║  SCRAPE KELAS 7-9 SMP STARTED          ║`);
    console.log(`[v0] ╚════════════════════════════════════════╝\n`);
    
    if (!process.env.DATABASE_URL) {
      return Response.json({ error: 'DATABASE_URL not set', success: false }, { status: 500 });
    }

    if (!process.env.YOUTUBE_API_KEY) {
      return Response.json({ error: 'YOUTUBE_API_KEY not set', success: false }, { status: 500 });
    }

    const sql = neon(process.env.DATABASE_URL);
    
    console.log(`[v0] Creating videos table if not exists...`);
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

    console.log(`[v0] Deleting old kelas 7-9 data for re-scraping...`);
    await sql`DELETE FROM videos WHERE kelas IN (7, 8, 9)`;
    console.log(`[v0] ✓ Cleared old records\n`);

    let totalInserted = 0;
    let totalSearched = 0;
    let totalApiErrors = 0;
    const results = [];

    for (const kelas of [7, 8, 9]) {
      console.log(`[v0] ▶ Processing KELAS ${kelas} SMP...\n`);
      const subjects = SUBJECTS_BY_CLASS[kelas];
      
      for (const subject of subjects) {
        const query = `${subject} kelas ${kelas} SMP`;
        totalSearched++;
        console.log(`[v0] [${totalSearched}] Searching subject: ${subject}`);
        
        const videos = await searchYouTube(query);
        
        if (videos.length === 0) {
          console.log(`[v0] ⚠ No videos found for ${query}`);
          totalApiErrors++;
          results.push({ subject, kelas, found: 0, inserted: 0 });
          await new Promise(r => setTimeout(r, 1000));
          continue;
        }

        let subjectInserted = 0;
        for (const video of videos) {
          try {
            const videoId = video.id.videoId;
            const title = video.snippet.title;
            const description = video.snippet.description || '';
            const thumbnail = video.snippet.thumbnails?.medium?.url || '';

            await sql`
              INSERT INTO videos (videoid, title, description, thumbnail, category, subject, kelas, createdat)
              VALUES (
                ${videoId},
                ${title},
                ${description},
                ${thumbnail},
                'SMP',
                ${subject},
                ${kelas},
                NOW()
              )
              ON CONFLICT (videoid) DO NOTHING
            `;
            subjectInserted++;
            totalInserted++;
          } catch (e) {
            console.log(`[v0]   ✗ Failed to insert: ${e.message}`);
          }
        }
        
        console.log(`[v0] ✓ ${subject} Kelas ${kelas}: Found ${videos.length}, Inserted ${subjectInserted}\n`);
        results.push({ subject, kelas, found: videos.length, inserted: subjectInserted });
        await new Promise(r => setTimeout(r, 1000));
      }
      
      console.log(`[v0] ✓ KELAS ${kelas} SMP COMPLETE\n`);
    }

    console.log(`[v0] ╔════════════════════════════════════════╗`);
    console.log(`[v0] ║  SCRAPE SMP SUMMARY                    ║`);
    console.log(`[v0] ╠════════════════════════════════════════╣`);
    console.log(`[v0] ║  Total Searches: ${totalSearched}`);
    console.log(`[v0] ║  API Errors: ${totalApiErrors}`);
    console.log(`[v0] ║  Total Inserted: ${totalInserted}`);
    console.log(`[v0] ╚════════════════════════════════════════╝\n`);

    return Response.json({
      success: true,
      message: `Inserted ${totalInserted} videos for kelas 7-9 SMP`,
      totalVideos: totalInserted,
      totalSearched,
      apiErrors: totalApiErrors,
      details: results,
    });
  } catch (error) {
    console.error(`[v0] ❌ FATAL ERROR: ${error.message}`);
    return Response.json({ error: error.message, success: false }, { status: 500 });
  }
}
