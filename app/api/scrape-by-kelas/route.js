import { neon } from '@neondatabase/serverless';

const SUBJECTS_BY_CLASS = {
  1: ['Matematika', 'Bahasa Indonesia', 'IPAS', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
  2: ['Matematika', 'Bahasa Indonesia', 'IPAS', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
  3: ['Matematika', 'Bahasa Indonesia', 'IPAS', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
  4: ['Matematika', 'Bahasa Indonesia', 'IPAS', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK', 'Bahasa Inggris'],
  5: ['Matematika', 'Bahasa Indonesia', 'IPAS', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK', 'Bahasa Inggris'],
  6: ['Matematika', 'Bahasa Indonesia', 'IPAS', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK', 'Bahasa Inggris'],
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

async function searchYouTube(query) {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) throw new Error('YOUTUBE_API_KEY missing');

  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&maxResults=30&type=video&key=${key}`;
  
  try {
    const res = await fetch(url);
    if (res.status === 403) {
      console.log(`[v0] Quota error for: ${query}`);
      return [];
    }
    if (!res.ok) return [];
    const data = await res.json();
    return data.items || [];
  } catch (e) {
    console.error(`[v0] Search error: ${e.message}`);
    return [];
  }
}

export async function POST(request) {
  try {
    if (!process.env.DATABASE_URL || !process.env.YOUTUBE_API_KEY) {
      return Response.json({ success: false, message: 'Missing env vars' }, { status: 500 });
    }

    const { kelas } = await request.json();
    const sql = neon(process.env.DATABASE_URL);

    const subjects = SUBJECTS_BY_CLASS[kelas];
    const category = getCategory(kelas);
    let count = 0;

    for (const subject of subjects) {
      const query = `${subject} kelas ${kelas}`;
      console.log(`[v0] Query: ${query}`);
      
      const items = await searchYouTube(query);
      
      for (const item of items) {
        try {
          await sql`
            INSERT INTO videos (videoid, title, description, thumbnail, category, subject, kelas, createdat)
            VALUES (${item.id.videoId}, ${item.snippet.title}, ${item.snippet.description || ''}, 
                    ${item.snippet.thumbnails?.medium?.url || ''}, ${category}, ${subject}, ${kelas}, NOW())
            ON CONFLICT (videoid) DO NOTHING
          `;
          count++;
        } catch (e) {
          // skip
        }
      }

      await new Promise(r => setTimeout(r, 1000));
    }

    return Response.json({
      success: true,
      message: `Kelas ${kelas}: ${count} videos inserted`,
      totalVideos: count,
      kelas
    });
  } catch (error) {
    console.error('[v0] Error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
