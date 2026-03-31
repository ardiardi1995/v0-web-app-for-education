import { neon } from '@neondatabase/serverless';

export async function GET(request) {
  try {
    if (!process.env.DATABASE_URL) {
      return new Response(
        `<html><body style="font-family: Arial; padding: 20px;">
          <h1 style="color: red;">ERROR: DATABASE_URL not set</h1>
        </body></html>`,
        { status: 500, headers: { 'Content-Type': 'text/html' } }
      );
    }

    const sql = neon(process.env.DATABASE_URL);

    // Check for unique subjects
    const subjects = await sql`
      SELECT DISTINCT subject FROM videos ORDER BY subject
    `;

    // Check for unique categories
    const categories = await sql`
      SELECT DISTINCT category FROM videos ORDER BY category
    `;

    // Check kelas 5-6 data
    const kelas5Data = await sql`
      SELECT subject, category, COUNT(*) as count FROM videos WHERE kelas = 5 GROUP BY subject, category ORDER BY subject
    `;

    const kelas6Data = await sql`
      SELECT subject, category, COUNT(*) as count FROM videos WHERE kelas = 6 GROUP BY subject, category ORDER BY subject
    `;

    const totalRecords = await sql`SELECT COUNT(*) as total FROM videos`;

    const html = `
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
          .container { max-width: 1000px; margin: 0 auto; }
          h1 { color: #333; }
          h2 { color: #0066cc; margin-top: 30px; border-bottom: 2px solid #0066cc; padding-bottom: 10px; }
          .info-box { background: white; padding: 15px; border-radius: 4px; margin: 15px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          table { width: 100%; border-collapse: collapse; background: white; margin: 15px 0; }
          th { background: #0066cc; color: white; padding: 10px; text-align: left; }
          td { padding: 10px; border-bottom: 1px solid #eee; }
          tr:hover { background: #f9f9f9; }
          .count { font-weight: bold; color: #0066cc; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 15px 0; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Database Diagnostic Report</h1>
          
          <div class="info-box">
            <strong>Total Records:</strong> <span class="count">${totalRecords[0].total}</span>
          </div>

          <h2>All Unique Subjects</h2>
          <table>
            <tr><th>Subject</th></tr>
            ${subjects.map(s => `<tr><td>${s.subject}</td></tr>`).join('')}
          </table>

          <h2>All Unique Categories</h2>
          <table>
            <tr><th>Category</th></tr>
            ${categories.map(c => `<tr><td>${c.category}</td></tr>`).join('')}
          </table>

          <h2>Kelas 5 - Subject & Category Distribution</h2>
          <table>
            <tr><th>Subject</th><th>Category</th><th>Count</th></tr>
            ${kelas5Data.map(r => `<tr><td>${r.subject}</td><td>${r.category}</td><td class="count">${r.count}</td></tr>`).join('')}
          </table>

          <h2>Kelas 6 - Subject & Category Distribution</h2>
          <table>
            <tr><th>Subject</th><th>Category</th><th>Count</th></tr>
            ${kelas6Data.map(r => `<tr><td>${r.subject}</td><td>${r.category}</td><td class="count">${r.count}</td></tr>`).join('')}
          </table>

          ${kelas6Data.some(r => r.category === 'SMP') ? `
            <div class="warning">
              <strong>⚠️ Found SMP category in Kelas 6!</strong> Run /api/fix-database to convert to SD.
            </div>
          ` : ''}

          ${subjects.some(s => s.subject === 'Pendidikan Jasmani') ? `
            <div class="warning">
              <strong>⚠️ Found "Pendidikan Jasmani" subject!</strong> Run /api/fix-database to convert to PJOK.
            </div>
          ` : ''}
        </div>
      </body>
    </html>
    `;

    return new Response(html, { headers: { 'Content-Type': 'text/html' } });
  } catch (error) {
    console.error('[v0] Error:', error.message);
    return new Response(
      `<html><body style="font-family: Arial; padding: 20px;">
        <h1 style="color: red;">ERROR</h1>
        <p>${error.message}</p>
      </body></html>`,
      { status: 500, headers: { 'Content-Type': 'text/html' } }
    );
  }
}
