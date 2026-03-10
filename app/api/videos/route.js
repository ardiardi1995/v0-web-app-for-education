import { Client } from '@neondatabase/serverless';

// This route fetches all videos from the database
// Database columns: id, videoid, title, description, thumbnail, category, subject, createdat, updatedat
export async function GET(request) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();

    // CORRECTED QUERY - using actual database column names
    // videoid (not video_id or videoId)
    // createdat (not created_at or createdAt)
    const result = await client.query(
      'SELECT id, videoid, title, description, thumbnail, category, subject, createdat FROM videos ORDER BY createdat DESC LIMIT 1000'
    );

    const videos = result.rows.map(row => ({
      id: row.id,
      videoid: row.videoid,
      title: row.title,
      description: row.description,
      thumbnail: row.thumbnail,
      category: row.category,
      subject: row.subject,
      createdat: row.createdat,
    }));

    return Response.json({
      success: true,
      videos: videos,
      count: videos.length,
    });
  } catch (error) {
    console.error('[API/videos] Database error:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Database error',
        videos: [],
      },
      { status: 500 }
    );
  } finally {
    await client.end();
  }
}
