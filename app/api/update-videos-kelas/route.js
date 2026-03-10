import { Client } from '@neondatabase/serverless';

export async function POST(request) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();

    // Subject to kelas mapping
    const subjectToKelas = {
      'Matematika': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      'Bahasa Indonesia': [1, 2, 3, 4, 5, 6, 7, 8, 9],
      'IPA': [1, 2, 3, 4, 5, 6],
      'IPS': [1, 2, 3, 4, 5, 6],
      'Bahasa Inggris': [4, 5, 6, 7, 8, 9, 10, 11, 12],
      'Fisika': [7, 8, 9, 10, 11, 12],
      'Kimia': [7, 8, 9, 10, 11, 12],
      'Biologi': [7, 8, 9, 10, 11, 12],
    };

    // Get all videos
    const result = await client.query('SELECT id, subject FROM videos WHERE kelas IS NULL OR kelas = 0');
    let updatedCount = 0;

    for (const video of result.rows) {
      const kelas = subjectToKelas[video.subject] || [1];
      const randomKelas = kelas[Math.floor(Math.random() * kelas.length)];

      await client.query(
        'UPDATE videos SET kelas = $1 WHERE id = $2',
        [randomKelas, video.id]
      );
      updatedCount++;
    }

    await client.end();

    return Response.json({
      success: true,
      message: `Updated ${updatedCount} videos with kelas`,
      updated: updatedCount,
    });
  } catch (error) {
    console.error('[API] Error:', error);
    await client.end();
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error',
      },
      { status: 500 }
    );
  }
}
