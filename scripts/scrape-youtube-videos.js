import axios from 'axios';
import { Client } from '@neondatabase/serverless';

const API_KEY = process.env.YOUTUBE_API_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

if (!API_KEY) {
  console.error('YOUTUBE_API_KEY not found in environment variables');
  process.exit(1);
}

if (!DATABASE_URL) {
  console.error('DATABASE_URL not found in environment variables');
  process.exit(1);
}

interface Video {
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  category: string;
  subject: string;
  duration?: number;
}

// Search queries untuk berbagai tingkat dan mata pelajaran
const searchQueries = [
  // SD (Kelas 1-6)
  { query: 'matematika SD kelas 1', category: 'SD', subject: 'Matematika' },
  { query: 'bahasa indonesia SD kelas 2', category: 'SD', subject: 'Bahasa Indonesia' },
  { query: 'IPA SD kelas 3', category: 'SD', subject: 'IPA' },
  { query: 'IPS SD kelas 4', category: 'SD', subject: 'IPS' },
  
  // SMP (Kelas 7-9)
  { query: 'matematika SMP kelas 7', category: 'SMP', subject: 'Matematika' },
  { query: 'bahasa inggris SMP', category: 'SMP', subject: 'Bahasa Inggris' },
  { query: 'fisika SMP', category: 'SMP', subject: 'Fisika' },
  { query: 'biologi SMP', category: 'SMP', subject: 'Biologi' },
  
  // SMA (Kelas 10-12)
  { query: 'matematika SMA kelas 10', category: 'SMA', subject: 'Matematika' },
  { query: 'kimia SMA', category: 'SMA', subject: 'Kimia' },
  { query: 'fisika SMA', category: 'SMA', subject: 'Fisika' },
  { query: 'biologi SMA', category: 'SMA', subject: 'Biologi' },
];

async function searchYouTubeVideos(query: string, category: string, subject: string): Promise<Video[]> {
  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: query,
        type: 'video',
        maxResults: 5,
        key: API_KEY,
      },
    });

    const videos: Video[] = response.data.items.map((item: any) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.default.url,
      category,
      subject,
    }));

    return videos;
  } catch (error) {
    console.error(`Error searching for "${query}":`, error);
    return [];
  }
}

async function insertVideos(videos: Video[]): Promise<number> {
  const client = new Client({
    connectionString: DATABASE_URL,
  });

  try {
    await client.connect();
    let insertedCount = 0;

    for (const video of videos) {
      try {
        // Check if video already exists
        const checkResult = await client.query(
          'SELECT id FROM videos WHERE videoid = $1',
          [video.videoId]
        );

        if (checkResult.rows.length > 0) {
          console.log(`[SKIP] Video exists: ${video.title}`);
          continue;
        }

        // Insert video
        await client.query(
          `INSERT INTO videos (videoid, title, description, thumbnail, category, subject, createdat, updatedat)
           VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
          [
            video.videoId,
            video.title,
            video.description,
            video.thumbnail,
            video.category,
            video.subject,
          ]
        );

        console.log(`[INSERT] ${video.title}`);
        insertedCount++;
      } catch (error) {
        console.error(`Error inserting video "${video.title}":`, error);
      }
    }

    return insertedCount;
  } finally {
    await client.end();
  }
}

async function main() {
  console.log('Starting YouTube Educational Video Scraper...\n');

  let totalInserted = 0;

  for (const { query, category, subject } of searchQueries) {
    console.log(`\nSearching: ${query} (${category} - ${subject})`);
    const videos = await searchYouTubeVideos(query, category, subject);
    
    if (videos.length > 0) {
      const inserted = await insertVideos(videos);
      totalInserted += inserted;
      console.log(`Inserted ${inserted} videos from this search`);
    }

    // Rate limiting - wait 1 second between API calls
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`\n✅ Scraping complete! Total videos inserted: ${totalInserted}`);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
