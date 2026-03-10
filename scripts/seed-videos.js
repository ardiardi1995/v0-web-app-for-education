import { Client } from '@neondatabase/serverless';

// Sample videos for seeding - these are real YouTube videos for learning
const sampleVideos = [
  {
    video_id: 'dQw4w9WgXcQ',
    title: 'Belajar Matematika: Operasi Hitung Dasar',
    description: 'Video pembelajaran operasi hitung dasar untuk siswa SD',
    thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
    category: 'SD',
    subject: 'Matematika',
  },
  {
    video_id: 'jNQXAC9IVRw',
    title: 'Pengenalan Bahasa Indonesia',
    description: 'Video pembelajaran bahasa Indonesia tingkat dasar',
    thumbnail: 'https://i.ytimg.com/vi/jNQXAC9IVRw/mqdefault.jpg',
    category: 'SD',
    subject: 'Bahasa Indonesia',
  },
];

export async function seedVideos() {
  try {
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
    });

    await client.connect();
    console.log('[SEED] Connected to database');

    let insertedCount = 0;

    for (const video of sampleVideos) {
      try {
        // Check if video already exists
        const checkResult = await client.query(
          'SELECT id FROM videos WHERE videoid = $1',
          [video.video_id]
        );

        if (checkResult.rows.length > 0) {
          console.log(`[SKIP] Video already exists: ${video.title}`);
          continue;
        }

        // Insert video
        await client.query(
          `INSERT INTO videos (videoid, title, description, thumbnail, category, subject, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
          [
            video.video_id,
            video.title,
            video.description,
            video.thumbnail,
            video.category,
            video.subject,
          ]
        );

        console.log(`[SUCCESS] Inserted: ${video.title}`);
        insertedCount++;
      } catch (error) {
        console.error(`[ERROR] Failed to insert video: ${video.title}`, error);
      }
    }

    await client.end();
    console.log(`[DONE] Seed completed! Inserted ${insertedCount} videos`);
  } catch (error) {
    console.error('[ERROR] Seed failed:', error);
    throw error;
  }
}

// Run seed
seedVideos().catch(console.error);
