import { neon } from '@neondatabase/serverless';

export async function POST(request) {
  try {
    console.log('[v0] Starting database migration...');

    if (!process.env.DATABASE_URL) {
      return Response.json({ error: 'DATABASE_URL not set', success: false }, { status: 500 });
    }

    const sql = neon(process.env.DATABASE_URL);

    // 1. Change "Pendidikan Jasmani" to "PJOK"
    console.log('[v0] Changing Pendidikan Jasmani to PJOK...');
    const updatePJOK = await sql`
      UPDATE videos 
      SET subject = 'PJOK' 
      WHERE subject = 'Pendidikan Jasmani'
    `;
    console.log(`[v0] Updated ${updatePJOK.length} records: Pendidikan Jasmani → PJOK`);

    // 2. Change kelas 6 category from "SMP" to "SD"
    console.log('[v0] Changing kelas 6 category from SMP to SD...');
    const updateKelas6 = await sql`
      UPDATE videos 
      SET category = 'SD' 
      WHERE kelas = 6 AND category = 'SMP'
    `;
    console.log(`[v0] Updated ${updateKelas6.length} records: Kelas 6 category SMP → SD`);

    return Response.json({
      success: true,
      message: 'Database migration completed',
      updates: {
        pjokChanges: updatePJOK.length || 0,
        kelas6Changes: updateKelas6.length || 0,
      }
    });
  } catch (error) {
    console.error('[v0] Migration error:', error.message);
    return Response.json({ error: error.message, success: false }, { status: 500 });
  }
}
