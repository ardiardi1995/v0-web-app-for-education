import { Client } from '@neondatabase/serverless';

export async function GET() {
  try {
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
    });

    await client.connect();

    const result = await client.query(
      'SELECT id, videoid, title, description, thumbnail, category, subject, createdat FROM videos ORDER BY createdat DESC LIMIT 1000'
    );

    await client.end();

    return Response.json({
      success: true,
      videos: result.rows,
    });
  } catch (error) {
    console.error('Error fetching videos:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        videos: [],
      },
      { status: 500 }
    );
  }
}
