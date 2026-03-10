import { Client } from '@neondatabase/serverless';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// Search keywords untuk berbagai tingkat pendidikan dan mata pelajaran
const searchQueries = [
  // SD (Sekolah Dasar)
  'pembelajaran matematika sd', 'pembelajaran bahasa indonesia sd',
  'pembelajaran ipa sd', 'pembelajaran ips sd',
  
  // SMP (Sekolah Menengah Pertama)
  'pembelajaran matematika smp', 'pembelajaran bahasa indonesia smp',
  'pembelajaran ipa smp', 'pembelajaran ips smp',
  'pembelajaran bahasa inggris smp',
  
  // SMA (Sekolah Menengah Atas)
  'pembelajaran matematika sma', 'pembelajaran bahasa indonesia sma',
  'pembelajaran fisika sma', 'pembelajaran kimia sma',
  'pembelajaran biologi sma',
];

function getEducationLevel(query) {
  if (query.includes('sd')) return 'SD';
  if (query.includes('smp')) return 'SMP';
  if (query.includes('sma')) return 'SMA';
  return 'Umum';
}

function getSubject(query) {
  if (query.includes('matematika')) return 'Matematika';
  if (query.includes('bahasa indonesia')) return 'Bahasa Indonesia';
  if (query.includes('ipa')) return 'IPA';
  if (query.includes('ips')) return 'IPS';
  if (query.includes('bahasa inggris')) return 'Bahasa Inggris';
  if (query.includes('fisika')) return 'Fisika';
  if (query.includes('kimia')) return 'Kimia';
  if (query.includes('biologi')) return 'Biologi';
  return 'Lainnya';
}

async function searchYouTube(query) {
  try {
    const params = new URLSearchParams({
      part: 'snippet',
      q: query,
      type: 'video',
      maxResults: 5,
      key: YOUTUBE_API_KEY,
      relevanceLanguage: 'id',
      order: 'relevance',
    });

    const response = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`);
    
    if (!response.ok) {
      console.error(`YouTube API error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error(`YouTube search error for "${query}":`, error.message);
    return [];
  }
}

async function insertVideoToDatabase(client, video, educationLevel, subject) {
  try {
    const videoId = video.id.videoId;
    const title = video.snippet.title;
    const description = video.snippet.description;
    const thumbnail = video.snippet.thumbnails?.medium?.url || null;

    // Check if video already exists
    const checkResult = await client.query(
      'SELECT id FROM videos WHERE videoid = $1',
      [videoId]
    );

    if (checkResult.rows.length > 0) {
      console.log(`[SKIP] Video exists: ${title}`);
      return false;
    }

    await client.query(
      `INSERT INTO videos (videoid, title, description, thumbnail, category, subject, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
      [videoId, title, description, thumbnail, educationLevel, subject]
    );

    console.log(`[SUCCESS] Inserted: ${title}`);
    return true;
  } catch (error) {
    console.error(`Failed to insert video:`, error.message);
    return false;
  }
}

export async function GET(request) {
  // Verify Vercel Cron secret
  if (request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  if (!YOUTUBE_API_KEY) {
    return new Response('Missing YOUTUBE_API_KEY', { status: 500 });
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL });

  try {
    await client.connect();
    console.log('[DB] Connected to Neon database');

    let totalInserted = 0;
    let totalSkipped = 0;

    for (const query of searchQueries) {
      console.log(`[SEARCH] Fetching videos for: "${query}"`);
      
      const videos = await searchYouTube(query);
      const educationLevel = getEducationLevel(query);
      const subject = getSubject(query);

      for (const video of videos) {
        const inserted = await insertVideoToDatabase(client, video, educationLevel, subject);
        if (inserted) {
          totalInserted++;
        } else {
          totalSkipped++;
        }
      }

      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    const message = `Scraper finished! Inserted: ${totalInserted}, Skipped: ${totalSkipped}`;
    console.log(`[DONE] ${message}`);

    return new Response(JSON.stringify({ success: true, message, totalInserted, totalSkipped }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[ERROR] Scraper failed:', error.message);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    await client.end();
  }
}
