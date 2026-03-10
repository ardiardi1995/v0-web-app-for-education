import { Client } from '@neondatabase/serverless';

export async function GET() {
  try {
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
    });

    await client.connect();

    const result = await client.query(
      `SELECT id, videoid, title, description, thumbnail, category, subject, createdat 
       FROM videos 
       ORDER BY createdat DESC 
       LIMIT 1000`
    );

    await client.end();

    return new Response(
      JSON.stringify({
        success: true,
        videos: result.rows,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error fetching videos:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        videos: [],
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
