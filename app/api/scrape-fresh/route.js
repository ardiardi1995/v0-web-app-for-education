import { neon } from '@neondatabase/serverless';

const SUBJECTS = {
  1: ['Matematika', 'Bahasa Indonesia', 'IPAS', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
  2: ['Matematika', 'Bahasa Indonesia', 'IPAS', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
  3: ['Matematika', 'Bahasa Indonesia', 'IPAS', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
  4: ['Matematika', 'Bahasa Indonesia', 'IPAS', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK', 'Bahasa Inggris'],
  5: ['Matematika', 'Bahasa Indonesia', 'IPAS', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK', 'Bahasa Inggris'],
  6: ['Matematika', 'Bahasa Indonesia', 'IPAS', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK', 'Bahasa Inggris'],
  7: ['Matematika', 'Fisika', 'Biologi', 'Kimia', 'Bahasa Indonesia', 'Bahasa Inggris', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
  8: ['Matematika', 'Fisika', 'Biologi', 'Kimia', 'Bahasa Indonesia', 'Bahasa Inggris', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
  9: ['Matematika', 'Fisika', 'Biologi', 'Kimia', 'Bahasa Indonesia', 'Bahasa Inggris', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
};

async function searchYouTube(query) {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) throw new Error('Missing YOUTUBE_API_KEY');
  
  try {
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&maxResults=25&type=video&key=${key}`);
    if (res.status === 403) return [];
    if (!res.ok) return [];
    const data = await res.json();
    return data.items || [];
  } catch (e) {
    return [];
  }
}

export async function POST(req) {
  try {
    const { kelas } = await req.json();
    if (!kelas || kelas < 1 || kelas > 12) return Response.json({ error: 'Invalid kelas' }, { status: 400 });
    
    const sql = neon(process.env.DATABASE_URL);
    let inserted = 0;
    const subjects = SUBJECTS[kelas] || [];
    
    for (const subject of subjects) {
      const videos = await searchYouTube(`${subject} kelas ${kelas}`);
      for (const v of videos) {
        try {
          await sql`INSERT INTO videos (videoid, title, description, thumbnail, category, subject, kelas, createdat) VALUES (${v.id.videoId}, ${v.snippet.title}, ${v.snippet.description || ''}, ${v.snippet.thumbnails?.medium?.url || ''}, 'SD', ${subject}, ${kelas}, NOW()) ON CONFLICT DO NOTHING`;
          inserted++;
        } catch (e) {}
      }
      await new Promise(r => setTimeout(r, 600));
    }
    
    return Response.json({ success: true, message: `Kelas ${kelas}: ${inserted} videos inserted`, totalVideos: inserted, kelas });
  } catch (e) {
    return Response.json({ error: e.message, success: false }, { status: 500 });
  }
}
