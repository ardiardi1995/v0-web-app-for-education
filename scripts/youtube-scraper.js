import https from 'https';
import { Client } from '@neondatabase/serverless';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

if (!YOUTUBE_API_KEY || !DATABASE_URL) {
  console.error('[ERROR] Missing YOUTUBE_API_KEY or DATABASE_URL environment variables');
  process.exit(1);
}

// Search keywords untuk berbagai tingkat pendidikan dan mata pelajaran
const searchQueries = [
  // SD (Sekolah Dasar)
  'pembelajaran matematika sd', 'pembelajaran bahasa indonesia sd',
  'pembelajaran ipa sd', 'pembelajaran ips sd',
  'pembelajaran pjok sd', 'pembelajaran seni sd',
  
  // SMP (Sekolah Menengah Pertama)
  'pembelajaran matematika smp', 'pembelajaran bahasa indonesia smp',
  'pembelajaran ipa smp', 'pembelajaran ips smp',
  'pembelajaran bahasa inggris smp', 'pembelajaran pjok smp',
  'pembelajaran seni smp', 'pembelajaran tik smp',
  
  // SMA (Sekolah Menengah Atas)
  'pembelajaran matematika sma', 'pembelajaran bahasa indonesia sma',
  'pembelajaran fisika sma', 'pembelajaran kimia sma',
  'pembelajaran biologi sma', 'pembelajaran ips sma',
  'pembelajaran bahasa inggris sma', 'pembelajaran sejarah sma',
];

// Function to determine education level from query
function getEducationLevel(query) {
  if (query.includes('sd')) return 'SD';
  if (query.includes('smp')) return 'SMP';
  if (query.includes('sma')) return 'SMA';
  return 'Umum';
}

// Function to determine subject from query
function getSubject(query) {
  if (query.includes('matematika')) return 'Matematika';
  if (query.includes('bahasa indonesia')) return 'Bahasa Indonesia';
  if (query.includes('ipa')) return 'IPA';
  if (query.includes('ips')) return 'IPS';
  if (query.includes('bahasa inggris')) return 'Bahasa Inggris';
  if (query.includes('fisika')) return 'Fisika';
  if (query.includes('kimia')) return 'Kimia';
  if (query.includes('biologi')) return 'Biologi';
  if (query.includes('sejarah')) return 'Sejarah';
  if (query.includes('pjok')) return 'PJOK';
  if (query.includes('seni')) return 'Seni';
  if (query.includes('tik')) return 'TIK';
  return 'Lainnya';
}

// Function to search YouTube videos
function searchYouTube(query) {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      part: 'snippet',
      q: query,
      type: 'video',
      maxResults: 5,
      key: YOUTUBE_API_KEY,
      relevanceLanguage: 'id',
      order: 'relevance',
    });

    const url = `https://www.googleapis.com/youtube/v3/search?${params}`;

    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.items || []);
        } catch (e) {
          console.error(`[ERROR] Failed to parse YouTube response for query "${query}":`, e.message);
          resolve([]);
        }
      });
    }).on('error', (err) => {
      console.error(`[ERROR] YouTube API request failed for query "${query}":`, err.message);
      reject(err);
    });
  });
}

// Function to insert video into database
async function insertVideoToDatabase(client, video, educationLevel, subject) {
  try {
    const videoId = video.id.videoId;
    const title = video.snippet.title;
    const description = video.snippet.description;
    const thumbnail = video.snippet.thumbnails.medium?.url;

    // Check if video already exists
    const checkResult = await client.query(
      'SELECT id FROM videos WHERE video_id = $1',
      [videoId]
    );

    if (checkResult.rows.length > 0) {
      console.log(`[SKIP] Video already exists: ${title}`);
      return false;
    }

    await client.query(
      `INSERT INTO videos (video_id, title, description, thumbnail, category, subject, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [videoId, title, description, thumbnail, educationLevel, subject]
    );

    console.log(`[SUCCESS] Inserted: ${title}`);
    return true;
  } catch (error) {
    console.error(`[ERROR] Failed to insert video:`, error.message);
    return false;
  }
}

// Main scraper function
async function runScraper() {
  console.log('[START] YouTube Video Scraper starting...');
  
  const client = new Client({ connectionString: DATABASE_URL });

  try {
    await client.connect();
    console.log('[DB] Connected to Neon database');

    let totalInserted = 0;
    let totalSkipped = 0;

    for (const query of searchQueries) {
      console.log(`\n[SEARCH] Fetching videos for: "${query}"`);
      
      try {
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
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`[ERROR] Failed to process query "${query}":`, error.message);
      }
    }

    console.log(`\n[DONE] Scraper finished!`);
    console.log(`[STATS] Inserted: ${totalInserted}, Skipped: ${totalSkipped}`);
  } catch (error) {
    console.error('[ERROR] Database connection failed:', error.message);
  } finally {
    await client.end();
  }
}

// Run scraper
runScraper().catch(console.error);
