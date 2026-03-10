import { Client } from '@neondatabase/serverless';

export async function GET() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();

    // Query menggunakan column names yang benar: videoid, createdat (lowercase)
    const result = await client.query(`
      SELECT id, videoid, title, description, thumbnail, category, subject, createdat 
      FROM videos 
      ORDER BY createdat DESC 
      LIMIT 1000
    `);

    return Response.json({
      success: true,
      videos: result.rows,
    });
  } catch (error) {
    console.error('[API] Error fetching videos:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        videos: [],
      },
      { status: 500 }
    );
  } finally {
    await client.end();
  }
}
