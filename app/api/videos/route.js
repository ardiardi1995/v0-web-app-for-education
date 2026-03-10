import { Client } from '@neondatabase/serverless';

// API Route: GET /api/videos
// Returns all learning videos from database
// Timestamp: 2024-rebuild-force
export async function GET(request) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();

    // Query uses CORRECT database column names:
    // - videoid (all lowercase, no underscore)
    // - createdat (all lowercase, no underscore)
    const result = await client.query(
      `SELECT id, videoid, title, description, thumbnail, category, subject, kelas, createdat 
       FROM videos 
       ORDER BY createdat DESC 
       LIMIT 1000`
    );

    const videos = result.rows.map(row => ({
      id: row.id,
      videoid: row.videoid,
      title: row.title,
      description: row.description,
      thumbnail: row.thumbnail,
      category: row.category,
      subject: row.subject,
      kelas: row.kelas || 1,
      createdat: row.createdat,
    }));

    return Response.json({
      success: true,
      videos: videos,
      count: videos.length,
    });
  } catch (error) {
    console.error('[API] Error:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error',
        videos: [],
      },
      { status: 500 }
    );
  } finally {
    await client.end();
  }
}
