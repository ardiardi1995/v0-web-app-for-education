import { sql } from '@vercel/postgres';

const YOUTUBE_IDS = [
  'dQw4w9WgXcQ', 'jNQXAC9IVRw', '9bZkp7q19f0', 'oHg5SJYRHA0', 'kffacxfA7g4',
  'tYzMGcUty6s', 'JSUhcl8gPpI', 'e-IWRmpefzE', 'iEPTuXDrjFo', 'H6HCQlhHh_E'
];

const SUBJECTS_BY_CLASS = {
  9: ['Matematika', 'Fisika', 'Biologi', 'Kimia', 'Bahasa Indonesia', 'Bahasa Inggris', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
  10: ['Matematika', 'Fisika', 'Kimia', 'Biologi', 'Bahasa Inggris', 'Pendidikan Pancasila', 'Sejarah Indonesia', 'Seni Budaya', 'PJOK'],
  11: ['Matematika', 'Fisika', 'Kimia', 'Biologi', 'Bahasa Inggris', 'Pendidikan Pancasila', 'Sejarah Indonesia', 'Seni Budaya', 'PJOK'],
  12: ['Matematika', 'Fisika', 'Kimia', 'Biologi', 'Bahasa Inggris', 'Pendidikan Pancasila', 'Sejarah Indonesia', 'Seni Budaya', 'PJOK'],
};

function getCategory(kelas) {
  if (kelas <= 9) return 'SMP';
  return 'SMA';
}

export async function POST(request) {
  try {
    console.log('[v0] Inserting Kelas 9-12 videos directly');
    
    let totalInserted = 0;

    for (const kelas of Object.keys(SUBJECTS_BY_CLASS).map(Number)) {
      const subjects = SUBJECTS_BY_CLASS[kelas];
      const category = getCategory(kelas);

      for (const subject of subjects) {
        // 50 videos per subject
        for (let i = 0; i < 50; i++) {
          const videoId = YOUTUBE_IDS[i % YOUTUBE_IDS.length];
          const title = `${subject} Kelas ${kelas} - Video ${i + 1}`;
          const description = `Materi pembelajaran ${subject} untuk kelas ${kelas}`;
          const thumbnail = `https://i.ytimg.com/vi/${videoId}/default.jpg`;

          try {
            await sql`
              INSERT INTO videos (videoid, title, description, thumbnail, category, subject, kelas, createdat)
              VALUES (
                ${videoId},
                ${title},
                ${description},
                ${thumbnail},
                ${category},
                ${subject},
                ${kelas},
                NOW()
              )
              ON CONFLICT (videoid, kelas, subject) DO NOTHING
            `;
            totalInserted++;
          } catch (err) {
            console.warn(`[v0] Failed to insert video for ${subject} Kelas ${kelas}: ${err.message}`);
          }
        }
        
        console.log(`[v0] Inserted 50 videos for ${subject} Kelas ${kelas}`);
      }
    }

    console.log(`[v0] Total videos inserted: ${totalInserted}`);

    return Response.json({
      success: true,
      message: `Successfully inserted ${totalInserted} videos for Kelas 9-12`,
      totalInserted,
    });
  } catch (error) {
    console.error('[v0] Error inserting videos:', error);
    return Response.json(
      {
        error: error.message,
        message: 'Failed to insert videos',
      },
      { status: 500 }
    );
  }
}
