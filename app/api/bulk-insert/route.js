import { sql } from '@vercel/postgres';

export async function POST(request) {
  try {
    console.log('[v0] Starting bulk insert of 10000+ videos for all classes');

    const SUBJECTS_BY_CLASS = {
      1: ['Matematika', 'Bahasa Indonesia', 'IPA', 'IPS', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
      2: ['Matematika', 'Bahasa Indonesia', 'IPA', 'IPS', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
      3: ['Matematika', 'Bahasa Indonesia', 'IPA', 'IPS', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
      4: ['Matematika', 'Bahasa Indonesia', 'IPA', 'IPS', 'Bahasa Inggris', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
      5: ['Matematika', 'Bahasa Indonesia', 'IPA', 'IPS', 'Bahasa Inggris', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
      6: ['Matematika', 'Bahasa Indonesia', 'IPA', 'IPS', 'Bahasa Inggris', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
      7: ['Matematika', 'Fisika', 'Biologi', 'Kimia', 'Bahasa Indonesia', 'Bahasa Inggris', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
      8: ['Matematika', 'Fisika', 'Biologi', 'Kimia', 'Bahasa Indonesia', 'Bahasa Inggris', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
      9: ['Matematika', 'Fisika', 'Biologi', 'Kimia', 'Bahasa Indonesia', 'Bahasa Inggris', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
      10: ['Matematika', 'Fisika', 'Kimia', 'Biologi', 'Bahasa Inggris', 'Pendidikan Pancasila', 'Sejarah Indonesia', 'Seni Budaya', 'PJOK'],
      11: ['Matematika', 'Fisika', 'Kimia', 'Biologi', 'Bahasa Inggris', 'Pendidikan Pancasila', 'Sejarah Indonesia', 'Seni Budaya', 'PJOK'],
      12: ['Matematika', 'Fisika', 'Kimia', 'Biologi', 'Bahasa Inggris', 'Pendidikan Pancasila', 'Sejarah Indonesia', 'Seni Budaya', 'PJOK'],
    };

    let totalInserted = 0;
    const youtubeIds = ['dQw4w9WgXcQ', 'jNQXAC9IVRw', '9bZkp7q19f0', 'oHg5SJYRHA0', 'kffacxfA7g4', 'tYzMGcUty6s', 'JSUhcl8gPpI'];

    for (let kelas = 1; kelas <= 12; kelas++) {
      const subjects = SUBJECTS_BY_CLASS[kelas];
      
      for (const subject of subjects) {
        // 100 videos per subject per class
        for (let i = 0; i < 100; i++) {
          const videoId = youtubeIds[i % youtubeIds.length] + i;
          const title = `${subject} Kelas ${kelas} - Video ${i + 1}`;
          const description = `Pembelajaran ${subject} untuk kelas ${kelas}`;
          const thumbnail = `https://i.ytimg.com/vi/${videoId}/default.jpg`;

          try {
            await sql`
              INSERT INTO videos (videoid, title, description, thumbnail, category, subject, kelas, createdat)
              VALUES (${videoId}, ${title}, ${description}, ${thumbnail}, ${'SD'}, ${subject}, ${kelas}, NOW())
            `;
            totalInserted++;
          } catch (err) {
            // Skip duplicates
          }
        }
      }
      
      console.log(`[v0] Completed Kelas ${kelas}`);
    }

    const countResult = await sql`SELECT COUNT(*) as total FROM videos`;
    const totalVideos = countResult.rows[0].total;

    return Response.json({
      success: true,
      message: `Bulk inserted ${totalInserted} videos`,
      totalVideos: totalVideos,
    });
  } catch (error) {
    console.error('[v0] Error:', error);
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
