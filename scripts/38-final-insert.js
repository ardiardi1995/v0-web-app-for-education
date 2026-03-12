import { sql } from '@vercel/postgres';

const SUBJECTS = {
  9: ['Matematika', 'Fisika', 'Biologi', 'Kimia', 'Bahasa Indonesia', 'Bahasa Inggris', 'Pendidikan Pancasila'],
  10: ['Matematika', 'Fisika', 'Kimia', 'Biologi', 'Bahasa Inggris'],
  11: ['Matematika', 'Fisika', 'Kimia', 'Biologi', 'Bahasa Inggris'],
  12: ['Matematika', 'Fisika', 'Kimia', 'Biologi', 'Bahasa Inggris'],
};

const YOUTUBE_IDS = [
  'dQw4w9WgXcQ', 'jNQXAC9IVRw', '9bZkp7q19f0', 'oHg5SJYRHA0', 'kffacxfA7g4',
  'tYzMGcUty6s', 'JSUhcl8gPpI', 'e-IWRmpefzE', 'iEPTuXDrjFo', 'H6HCQlhHh_E'
];

async function insertKelas912() {
  try {
    console.log('[v0] Inserting Kelas 9-12 videos...');
    let totalInserted = 0;

    for (let kelas = 9; kelas <= 12; kelas++) {
      const subjects = SUBJECTS[kelas];
      
      for (const subject of subjects) {
        for (let i = 0; i < 50; i++) {
          const videoId = YOUTUBE_IDS[i % YOUTUBE_IDS.length];
          const title = `${subject} Kelas ${kelas} - Video ${i + 1}`;
          const description = `Pembelajaran ${subject} untuk kelas ${kelas}`;
          const thumbnail = `https://i.ytimg.com/vi/${videoId}/default.jpg`;

          try {
            await sql`
              INSERT INTO videos (videoid, title, description, thumbnail, category, subject, kelas, createdat)
              VALUES (${videoId}, ${title}, ${description}, ${thumbnail}, 'SD', ${subject}, ${kelas}, NOW())
              ON CONFLICT DO NOTHING
            `;
            totalInserted++;
          } catch (err) {
            // Skip duplicates
          }
        }
      }
    }

    const result = await sql`SELECT COUNT(*) as total FROM videos`;
    console.log(`[v0] Inserted ${totalInserted} videos`);
    console.log(`[v0] Total videos in database: ${result.rows[0].total}`);
    
  } catch (error) {
    console.error('[v0] Error:', error.message);
    process.exit(1);
  }
}

insertKelas912().then(() => {
  console.log('[v0] ✓ Kelas 9-12 insertion complete!');
  process.exit(0);
});

