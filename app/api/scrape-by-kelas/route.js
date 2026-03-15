import { neon } from '@neondatabase/serverless';

const SUBJECTS_BY_CLASS = {
  1: ['Matematika', 'Bahasa Indonesia', 'IPAS', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
  2: ['Matematika', 'Bahasa Indonesia', 'IPAS', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
  3: ['Matematika', 'Bahasa Indonesia', 'IPAS', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
  4: ['Matematika', 'Bahasa Indonesia', 'IPAS', 'Bahasa Inggris', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
  5: ['Matematika', 'Bahasa Indonesia', 'IPAS', 'Bahasa Inggris', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
  6: ['Matematika', 'Bahasa Indonesia', 'IPAS', 'Bahasa Inggris', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
  7: ['Matematika', 'Fisika', 'Biologi', 'Kimia', 'Bahasa Indonesia', 'Bahasa Inggris', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
  8: ['Matematika', 'Fisika', 'Biologi', 'Kimia', 'Bahasa Indonesia', 'Bahasa Inggris', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
  9: ['Matematika', 'Fisika', 'Biologi', 'Kimia', 'Bahasa Indonesia', 'Bahasa Inggris', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
  10: ['Matematika', 'Fisika', 'Kimia', 'Biologi', 'Bahasa Inggris', 'Pendidikan Pancasila', 'Seni Budaya', 'PJOK'],
  11: ['Matematika', 'Fisika', 'Kimia', 'Biologi', 'Bahasa Inggris', 'Pendidikan Pancasila', 'Seni Budaya', 'PJOK'],
  12: ['Matematika', 'Fisika', 'Kimia', 'Biologi', 'Bahasa Inggris', 'Pendidikan Pancasila', 'Seni Budaya', 'PJOK'],
};

function getCategory(kelas) {
  if (kelas <= 6) return 'SD';
  if (kelas <= 9) return 'SMP';
  return 'SMA';
}

async function searchYouTubeVideos(query, maxResults = 20) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) throw new Error('YOUTUBE_API_KEY not set');

  console.log(`[v0] DEBUG: API Key present: ${apiKey ? 'YES' : 'NO'}`);
  console.log(`[v0] DEBUG: API Key length: ${apiKey ? apiKey.length : 0}`);
  console.log(`[v0] DEBUG: API Key starts with: ${apiKey ? apiKey.substring(0, 8) + '...' : 'NONE'}`);

  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&maxResults=${maxResults}&type=video&order=relevance&key=${apiKey}`;

  try {
    console.log(`[v0] DEBUG: Fetching URL for query: "${query}"`);
    const response = await fetch(url);
    
    console.log(`[v0] DEBUG: Response status: ${response.status}`);
    
    if (response.status === 403) {
      console.warn(`[v0] YouTube API quota exceeded (403) for: ${query}`);
      return [];
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[v0] YouTube API error ${response.status}: ${errorText}`);
      throw new Error(`YouTube API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`[v0] DEBUG: Got ${data.items ? data.items.length : 0} results for "${query}"`);
    return data.items || [];
  } catch (error) {
    console.error(`[v0] Error searching for "${query}":`, error.message);
    return [];
  }
}

export async function POST(request) {
  try {
    const { kelas } = await request.json();
    
    if (!kelas || kelas < 1 || kelas > 12) {
      return Response.json({ error: 'Invalid kelas (1-12)', success: false }, { status: 400 });
    }

    if (!process.env.DATABASE_URL) {
      return Response.json({ error: 'DATABASE_URL not set', success: false }, { status: 500 });
    }

    const sql = neon(process.env.DATABASE_URL);
    console.log(`[v0] Starting scrape for Kelas ${kelas}`);

    // Create table if doesn't exist
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

    const subjects = SUBJECTS_BY_CLASS[kelas];
    const category = getCategory(kelas);
    let totalInserted = 0;

    for (const subject of subjects) {
      const keywords = [
        `${subject} kelas ${kelas} pelajaran`,
        `${subject} kelas ${kelas}`,
        `belajar ${subject}`,
      ];

      for (const keyword of keywords) {
        console.log(`[v0] Searching: ${keyword}`);
        const videos = await searchYouTubeVideos(keyword, 15);

        if (videos.length === 0) continue;

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
            // Skip duplicates
          }
        }

        console.log(`[v0] Kelas ${kelas} - ${subject}: inserted ${videos.length} videos`);
        await new Promise(r => setTimeout(r, 1000)); // Rate limit
      }
    }

    console.log(`[v0] Kelas ${kelas} complete: ${totalInserted} videos inserted`);
    return Response.json({
      success: true,
      message: `Kelas ${kelas}: ${totalInserted} videos inserted`,
      totalVideos: totalInserted,
      kelas,
    });
  } catch (error) {
    console.error('[v0] Scraping error:', error);
    return Response.json({ error: error.message, success: false }, { status: 500 });
  }
}
