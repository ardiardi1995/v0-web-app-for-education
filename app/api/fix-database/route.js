import { neon } from '@neondatabase/serverless';

export async function GET(request) {
  try {
    console.log('[v0] Starting database migration...');

    if (!process.env.DATABASE_URL) {
      return new Response(
        `<html><body style="font-family: Arial; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h1 style="color: red;">❌ Error</h1>
          <p>DATABASE_URL not set</p>
        </body></html>`,
        { status: 500, headers: { 'Content-Type': 'text/html' } }
      );
    }

    const sql = neon(process.env.DATABASE_URL);

    // 1. Change "Pendidikan Jasmani" to "PJOK"
    console.log('[v0] Changing Pendidikan Jasmani to PJOK...');
    const updatePJOK = await sql`
      UPDATE videos 
      SET subject = 'PJOK' 
      WHERE subject = 'Pendidikan Jasmani'
    `;
    const pjokCount = updatePJOK.length || 0;
    console.log(`[v0] Updated ${pjokCount} records: Pendidikan Jasmani → PJOK`);

    // 2. Change kelas 5 AND kelas 6 category from "SMP" to "SD"
    console.log('[v0] Changing kelas 5-6 category from SMP to SD...');
    const updateKelas56 = await sql`
      UPDATE videos 
      SET category = 'SD' 
      WHERE (kelas = 5 OR kelas = 6) AND category = 'SMP'
    `;
    const kelas56Count = updateKelas56.length || 0;
    console.log(`[v0] Updated ${kelas56Count} records: Kelas 5-6 category SMP → SD`);

    const html = `
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Database Fix Results</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px 20px;
            max-width: 700px;
            margin: 0 auto;
            background: #f5f5f5;
          }
          .container {
            background: white;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          h1 {
            color: #28a745;
            margin: 0 0 10px 0;
          }
          .subtitle {
            color: #666;
            margin-bottom: 30px;
          }
          .result {
            background: #e8f5e9;
            border-left: 4px solid #28a745;
            padding: 15px;
            margin: 15px 0;
            border-radius: 4px;
          }
          .result h3 {
            margin: 0 0 10px 0;
            color: #155724;
          }
          .result p {
            margin: 0;
            color: #155724;
            font-weight: bold;
          }
          .stats {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-top: 20px;
          }
          .stat-box {
            background: #f0f0f0;
            padding: 15px;
            border-radius: 4px;
            text-align: center;
          }
          .stat-number {
            font-size: 28px;
            font-weight: bold;
            color: #28a745;
          }
          .stat-label {
            color: #666;
            margin-top: 5px;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>✓ Database Migration Completed Successfully</h1>
          <p class="subtitle">All updates have been applied to the database</p>
          
          <div class="result">
            <h3>1. Subject Name Update</h3>
            <p>Pendidikan Jasmani → PJOK: ${pjokCount} records updated</p>
          </div>
          
          <div class="result">
            <h3>2. Kelas 5-6 Category Update</h3>
            <p>Category changed from SMP to SD: ${kelas56Count} records updated</p>
          </div>
          
          <div class="stats">
            <div class="stat-box">
              <div class="stat-number">${pjokCount}</div>
              <div class="stat-label">PJOK Records Fixed</div>
            </div>
            <div class="stat-box">
              <div class="stat-number">${kelas56Count}</div>
              <div class="stat-label">Kelas 5-6 Records Fixed</div>
            </div>
          </div>
          
          <div style="margin-top: 30px; padding: 15px; background: #e3f2fd; border-radius: 4px; color: #1565c0;">
            <strong>Total changes:</strong> ${pjokCount + kelas56Count} records updated
          </div>
        </div>
      </body>
    </html>
    `;

    return new Response(html, { headers: { 'Content-Type': 'text/html' } });
  } catch (error) {
    console.error('[v0] Migration error:', error.message);
    return new Response(
      `<html><body style="font-family: Arial; padding: 20px; max-width: 600px; margin: 0 auto;">
        <h1 style="color: red;">❌ Error</h1>
        <p style="color: #666; white-space: pre-wrap;">${error.message}</p>
      </body></html>`,
      { status: 500, headers: { 'Content-Type': 'text/html' } }
    );
  }
}
