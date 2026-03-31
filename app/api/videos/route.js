import { neon } from '@neondatabase/serverless';

// API Route: GET /api/videos
// Returns all learning videos from database
// Timestamp: 2024-rebuild-force
export async function GET(request) {
  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    return Response.json(
      {
        success: false,
        error: 'DATABASE_URL environment variable is not set. Please configure your Neon database connection in your project settings.',
        videos: [],
      },
      { status: 500 }
    );
  }

  try {
    const sql = neon(process.env.DATABASE_URL);

    // Query uses CORRECT database column names:
    // - videoid (all lowercase, no underscore)
    // - createdat (all lowercase, no underscore)
    const result = await sql`
      SELECT id, videoid, title, description, thumbnail, category, subject, kelas, createdat 
      FROM videos 
      ORDER BY createdat DESC 
      LIMIT 10000
    `;

    const videos = result.map(row => ({
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
  }
}
