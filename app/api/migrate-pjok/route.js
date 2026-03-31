import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export async function POST(request) {
  try {
    console.log('[v0] Starting PJOK to Pendidikan Jasmani migration...');
    
    // Update all PJOK records to Pendidikan Jasmani
    const result = await sql`
      UPDATE videos 
      SET subject = 'Pendidikan Jasmani'
      WHERE subject = 'PJOK'
    `;
    
    console.log('[v0] Migration complete');
    
    return Response.json({
      success: true,
      message: 'All PJOK videos updated to Pendidikan Jasmani',
      updated: result.count || result.rowCount || 'unknown',
    });
  } catch (error) {
    console.error('[v0] Migration error:', error.message);
    return Response.json({ 
      error: error.message, 
      success: false 
    }, { status: 500 });
  }
}
