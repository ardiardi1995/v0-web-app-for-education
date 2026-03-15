import { neon } from '@neondatabase/serverless';

export async function GET(request) {
  if (!process.env.DATABASE_URL) {
    return Response.json(
      { success: false, error: 'DATABASE_URL not set' },
      { status: 500 }
    );
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    // Create the videos table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS videos (
        id SERIAL PRIMARY KEY,
        videoid VARCHAR(255) UNIQUE NOT NULL,
        title VARCHAR(500) NOT NULL,
        description TEXT,
        thumbnail VARCHAR(500),
        category VARCHAR(100),
        subject VARCHAR(100),
        kelas INTEGER,
        createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    return Response.json({ success: true, message: 'Videos table created successfully' });
  } catch (error) {
    console.error('[v0] Error creating table:', error);
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : 'Error creating table' },
      { status: 500 }
    );
  }
}
