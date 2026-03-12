import pg from 'pg';

const { Client } = pg;

// Mata pelajaran per kelas
const SUBJECTS_BY_CLASS = {
  1: ['Matematika', 'Bahasa Indonesia', 'IPA', 'IPS'],
  2: ['Matematika', 'Bahasa Indonesia', 'IPA', 'IPS'],
  3: ['Matematika', 'Bahasa Indonesia', 'IPA', 'IPS'],
  4: ['Matematika', 'Bahasa Indonesia', 'IPA', 'IPS', 'Bahasa Inggris'],
  5: ['Matematika', 'Bahasa Indonesia', 'IPA', 'IPS', 'Bahasa Inggris'],
  6: ['Matematika', 'Bahasa Indonesia', 'IPA', 'IPS', 'Bahasa Inggris'],
  7: ['Matematika', 'Fisika', 'Biologi', 'Kimia', 'Bahasa Indonesia', 'Bahasa Inggris'],
  8: ['Matematika', 'Fisika', 'Biologi', 'Kimia', 'Bahasa Indonesia', 'Bahasa Inggris'],
  9: ['Matematika', 'Fisika', 'Biologi', 'Kimia', 'Bahasa Indonesia', 'Bahasa Inggris'],
  10: ['Matematika', 'Fisika', 'Kimia', 'Biologi', 'Bahasa Inggris'],
  11: ['Matematika', 'Fisika', 'Kimia', 'Biologi', 'Bahasa Inggris'],
  12: ['Matematika', 'Fisika', 'Kimia', 'Biologi', 'Bahasa Inggris'],
};

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

async function searchYouTubeVideos(query, maxResults = 50) {
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&maxResults=${maxResults}&type=video&key=${YOUTUBE_API_KEY}`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  if (!data.items) return [];
  
  return data.items.map(item => ({
    videoid: item.id.videoId,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
  }));
}

async function populateVideos() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('[v0] Connected to database');

    // Clear existing videos
    await client.query('DELETE FROM videos');
    console.log('[v0] Cleared existing videos');

    let totalInserted = 0;

    // Scrape untuk setiap kelas dan mata pelajaran
    for (let kelas = 1; kelas <= 12; kelas++) {
      const subjects = SUBJECTS_BY_CLASS[kelas];
      
      for (const subject of subjects) {
        const keyword = `${subject} kelas ${kelas}`;
        console.log(`[v0] Scraping: ${keyword}`);
        
        try {
          const videos = await searchYouTubeVideos(keyword, 50);
          
          if (videos.length > 0) {
            for (const video of videos) {
              await client.query(
                'INSERT INTO videos (videoid, title, description, thumbnail, subject, kelas, category, createdat) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())',
                [video.videoid, video.title, video.description, video.thumbnail, subject, kelas, kelas <= 6 ? 'SD' : kelas <= 9 ? 'SMP' : 'SMA']
              );
            }
            totalInserted += videos.length;
            console.log(`[v0] Inserted ${videos.length} videos for ${subject} kelas ${kelas}`);
          }
          
          // Rate limiting
          await new Promise(r => setTimeout(r, 1000));
        } catch (err) {
          console.error(`[v0] Error scraping ${keyword}:`, err.message);
        }
      }
    }

    console.log(`[v0] Total videos inserted: ${totalInserted}`);
  } catch (err) {
    console.error('[v0] Error:', err);
  } finally {
    await client.end();
  }
}

populateVideos();
