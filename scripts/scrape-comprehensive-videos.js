import fetch from 'node-fetch';
import pg from 'pg';

const { Client } = pg;

const API_KEY = process.env.YOUTUBE_API_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

if (!API_KEY) {
  console.error('❌ YOUTUBE_API_KEY not found');
  process.exit(1);
}

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found');
  process.exit(1);
}

// Comprehensive video search queries for all class levels and subjects
const searchQueries = [
  // SD (Sekolah Dasar) - Kelas 1-6
  { query: 'kelas 1 matematika SD pembelajaran', category: 'SD', subject: 'Matematika', grade: '1' },
  { query: 'kelas 1 bahasa indonesia SD pembelajaran', category: 'SD', subject: 'Bahasa Indonesia', grade: '1' },
  { query: 'kelas 1 IPA SD pembelajaran', category: 'SD', subject: 'IPA', grade: '1' },
  { query: 'kelas 2 matematika SD pembelajaran', category: 'SD', subject: 'Matematika', grade: '2' },
  { query: 'kelas 2 bahasa indonesia SD pembelajaran', category: 'SD', subject: 'Bahasa Indonesia', grade: '2' },
  { query: 'kelas 2 IPA SD pembelajaran', category: 'SD', subject: 'IPA', grade: '2' },
  { query: 'kelas 3 matematika SD pembelajaran', category: 'SD', subject: 'Matematika', grade: '3' },
  { query: 'kelas 3 bahasa indonesia SD pembelajaran', category: 'SD', subject: 'Bahasa Indonesia', grade: '3' },
  { query: 'kelas 3 IPA SD pembelajaran', category: 'SD', subject: 'IPA', grade: '3' },
  { query: 'kelas 4 matematika SD pembelajaran', category: 'SD', subject: 'Matematika', grade: '4' },
  { query: 'kelas 4 IPA SD pembelajaran', category: 'SD', subject: 'IPA', grade: '4' },
  { query: 'kelas 5 matematika SD pembelajaran', category: 'SD', subject: 'Matematika', grade: '5' },
  { query: 'kelas 5 IPA SD pembelajaran', category: 'SD', subject: 'IPA', grade: '5' },
  { query: 'kelas 6 matematika SD pembelajaran', category: 'SD', subject: 'Matematika', grade: '6' },
  { query: 'kelas 6 IPA SD pembelajaran', category: 'SD', subject: 'IPA', grade: '6' },

  // SMP (Sekolah Menengah Pertama) - Kelas 7-9
  { query: 'kelas 7 matematika SMP pembelajaran', category: 'SMP', subject: 'Matematika', grade: '7' },
  { query: 'kelas 7 fisika SMP pembelajaran', category: 'SMP', subject: 'Fisika', grade: '7' },
  { query: 'kelas 7 biologi SMP pembelajaran', category: 'SMP', subject: 'Biologi', grade: '7' },
  { query: 'kelas 7 bahasa inggris SMP pembelajaran', category: 'SMP', subject: 'Bahasa Inggris', grade: '7' },
  { query: 'kelas 8 matematika SMP pembelajaran', category: 'SMP', subject: 'Matematika', grade: '8' },
  { query: 'kelas 8 fisika SMP pembelajaran', category: 'SMP', subject: 'Fisika', grade: '8' },
  { query: 'kelas 8 biologi SMP pembelajaran', category: 'SMP', subject: 'Biologi', grade: '8' },
  { query: 'kelas 8 bahasa inggris SMP pembelajaran', category: 'SMP', subject: 'Bahasa Inggris', grade: '8' },
  { query: 'kelas 9 matematika SMP pembelajaran', category: 'SMP', subject: 'Matematika', grade: '9' },
  { query: 'kelas 9 fisika SMP pembelajaran', category: 'SMP', subject: 'Fisika', grade: '9' },
  { query: 'kelas 9 biologi SMP pembelajaran', category: 'SMP', subject: 'Biologi', grade: '9' },
  { query: 'kelas 9 bahasa inggris SMP pembelajaran', category: 'SMP', subject: 'Bahasa Inggris', grade: '9' },

  // SMA (Sekolah Menengah Atas) - Kelas 10-12
  { query: 'kelas 10 matematika SMA pembelajaran', category: 'SMA', subject: 'Matematika', grade: '10' },
  { query: 'kelas 10 fisika SMA pembelajaran', category: 'SMA', subject: 'Fisika', grade: '10' },
  { query: 'kelas 10 kimia SMA pembelajaran', category: 'SMA', subject: 'Kimia', grade: '10' },
  { query: 'kelas 10 biologi SMA pembelajaran', category: 'SMA', subject: 'Biologi', grade: '10' },
  { query: 'kelas 11 matematika SMA pembelajaran', category: 'SMA', subject: 'Matematika', grade: '11' },
  { query: 'kelas 11 fisika SMA pembelajaran', category: 'SMA', subject: 'Fisika', grade: '11' },
  { query: 'kelas 11 kimia SMA pembelajaran', category: 'SMA', subject: 'Kimia', grade: '11' },
  { query: 'kelas 11 biologi SMA pembelajaran', category: 'SMA', subject: 'Biologi', grade: '11' },
  { query: 'kelas 12 matematika SMA pembelajaran', category: 'SMA', subject: 'Matematika', grade: '12' },
  { query: 'kelas 12 fisika SMA pembelajaran', category: 'SMA', subject: 'Fisika', grade: '12' },
  { query: 'kelas 12 kimia SMA pembelajaran', category: 'SMA', subject: 'Kimia', grade: '12' },
  { query: 'kelas 12 biologi SMA pembelajaran', category: 'SMA', subject: 'Biologi', grade: '12' },
];

async function searchYouTubeVideos(query, category, subject, grade) {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
        query
      )}&type=video&maxResults=3&key=${API_KEY}`
    );
    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      console.log(`  ⚠️  No results for: ${query}`);
      return [];
    }

    return data.items.map(item => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.default.url,
      category,
      subject,
      grade,
    }));
  } catch (error) {
    console.error(`  ❌ Error searching for "${query}":`, error.message);
    return [];
  }
}

async function insertVideo(client, video) {
  try {
    // Check if video already exists
    const checkResult = await client.query(
      'SELECT id FROM videos WHERE videoid = $1',
      [video.videoId]
    );

    if (checkResult.rows.length > 0) {
      return false; // Video already exists
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

    return true; // Successfully inserted
  } catch (error) {
    console.error('  ❌ Error inserting video:', error.message);
    return false;
  }
}

async function clearOldVideos(client) {
  try {
    console.log('\n🗑️  Clearing old videos...');
    const result = await client.query('DELETE FROM videos');
    console.log(`✅ Cleared ${result.rowCount} old videos`);
  } catch (error) {
    console.error('❌ Error clearing videos:', error.message);
  }
}

async function main() {
  const client = new Client({
    connectionString: DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Clear old videos
    await clearOldVideos(client);

    console.log('🔍 Scraping comprehensive learning videos...\n');

    let totalInserted = 0;
    let totalProcessed = 0;

    // Process each search query
    for (const searchItem of searchQueries) {
      console.log(`📚 Searching: ${searchItem.grade ? `Kelas ${searchItem.grade}` : ''} ${searchItem.subject} (${searchItem.category})`);

      const videos = await searchYouTubeVideos(
        searchItem.query,
        searchItem.category,
        searchItem.subject,
        searchItem.grade
      );

      for (const video of videos) {
        const inserted = await insertVideo(client, video);
        if (inserted) {
          totalInserted++;
          console.log(`  ✅ Added: ${video.title.substring(0, 50)}...`);
        }
        totalProcessed++;
      }

      // Add delay to avoid API rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n' + '='.repeat(60));
    console.log(`✅ Scraping complete!`);
    console.log(`📊 Processed: ${totalProcessed} videos`);
    console.log(`💾 Inserted: ${totalInserted} new videos`);
    console.log('='.repeat(60));
  } catch (error) {
    console.error('❌ Fatal error:', error);
  } finally {
    await client.end();
  }
}

main().catch(console.error);
