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
    console.log(`\n[v0] ========== YOUTUBE API CALL ==========`);
    console.log(`[v0] Query: "${query}"`);
    console.log(`[v0] API Key set: ${apiKey ? 'YES' : 'NO'}`);
    console.log(`[v0] API Key length: ${apiKey.length}`);
    console.log(`[v0] API Key first 10 chars: ${apiKey.substring(0, 10)}`);
    console.log(`[v0] Calling URL: ${url.substring(0, 120)}...`);
    
    const startTime = Date.now();
    const response = await fetch(url);
    const endTime = Date.now();
    
    console.log(`[v0] Response received in ${endTime - startTime}ms`);
    console.log(`[v0] Response status: ${response.status}`);
    console.log(`[v0] Response headers: ${JSON.stringify(Object.fromEntries(response.headers))}`);
    
    if (response.status === 403) {
      const errorData = await response.json();
      console.log(`[v0] ❌ 403 QUOTA EXCEEDED`);
      console.log(`[v0] Error message: ${errorData.error?.message}`);
      console.log(`[v0] Error reason: ${errorData.error?.errors?.[0]?.reason}`);
      console.log(`[v0] Full error: ${JSON.stringify(errorData, null, 2)}`);
      return [];
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`[v0] ❌ Error ${response.status}: ${errorText}`);
      return [];
    }
    
    const data = await response.json();
    console.log(`[v0] ✓ Success! Got ${data.items ? data.items.length : 0} videos`);
    if (data.items && data.items.length > 0) {
      console.log(`[v0] First video: "${data.items[0].snippet.title}"`);
      console.log(`[v0] Video IDs: ${data.items.map(v => v.id.videoId).join(', ')}`);
    }
    console.log(`[v0] ========== END API CALL ==========\n`);
    return data.items || [];
  } catch (err) {
    console.error(`[v0] ❌ Fetch ERROR: ${err.message}`);
    console.error(`[v0] Stack: ${err.stack}`);
    return [];
  }
}

export async function POST(request) {
  try {
    console.log(`\n[v0] ╔════════════════════════════════════════╗`);
    console.log(`[v0] ║  SCRAPE KELAS 1-3 STARTED             ║`);
    console.log(`[v0] ╚════════════════════════════════════════╝\n`);
    
    if (!process.env.DATABASE_URL) {
      console.error(`[v0] ❌ DATABASE_URL not set!`);
      return Response.json({ error: 'DATABASE_URL not set', success: false }, { status: 500 });
    }
    console.log(`[v0] ✓ DATABASE_URL is set`);

    if (!process.env.YOUTUBE_API_KEY) {
      console.error(`[v0] ❌ YOUTUBE_API_KEY not set!`);
      return Response.json({ error: 'YOUTUBE_API_KEY not set', success: false }, { status: 500 });
    }
    console.log(`[v0] ✓ YOUTUBE_API_KEY is set (length: ${process.env.YOUTUBE_API_KEY.length})`);

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
    console.log(`[v0] ✓ Videos table ready`);

    console.log(`[v0] Deleting old IPA/IPS data...`);
    const deleteResult = await sql`DELETE FROM videos WHERE subject IN ('IPA', 'IPS')`;
    console.log(`[v0] ✓ Deleted old records\n`);

    let totalInserted = 0;
    let totalSearched = 0;
    let totalApiErrors = 0;
    const results = [];

    for (const kelas of [1, 2, 3]) {
      console.log(`[v0] ▶ Processing KELAS ${kelas}...\n`);
      const subjects = ['Matematika', 'Bahasa Indonesia', 'IPAS', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'];
      
      for (const subject of subjects) {
        const query = `${subject} kelas ${kelas}`;
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

            console.log(`[v0]   → Inserting: "${title.substring(0, 50)}..." (ID: ${videoId})`);

            await sql`
              INSERT INTO videos (videoid, title, description, thumbnail, category, subject, kelas, createdat)
              VALUES (
                ${videoId},
                ${title},
                ${description},
                ${thumbnail},
                'SD',
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
      
      console.log(`[v0] ✓ KELAS ${kelas} COMPLETE\n`);
    }

    console.log(`[v0] ╔════════════════════════════════════════╗`);
    console.log(`[v0] ║  SCRAPE SUMMARY                        ║`);
    console.log(`[v0] ╠════════════════════════════════════════╣`);
    console.log(`[v0] ║  Total Searches: ${totalSearched}`);
    console.log(`[v0] ║  API Errors: ${totalApiErrors}`);
    console.log(`[v0] ║  Total Inserted: ${totalInserted}`);
    console.log(`[v0] ╚════════════════════════════════════════╝\n`);

    return Response.json({
      success: true,
      message: `Inserted ${totalInserted} videos for kelas 1-3`,
      totalVideos: totalInserted,
      totalSearched,
      apiErrors: totalApiErrors,
      details: results,
    });
  } catch (error) {
    console.error(`[v0] ❌ FATAL ERROR: ${error.message}`);
    console.error(`[v0] Stack: ${error.stack}`);
    return Response.json({ error: error.message, success: false }, { status: 500 });
  }
}
