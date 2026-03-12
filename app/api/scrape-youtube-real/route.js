import { sql } from '@vercel/postgres';

// Mata pelajaran per kelas berdasarkan Kurikulum Merdeka (dengan mata pelajaran wajib)
const SUBJECTS_BY_CLASS = {
  1: ['Matematika', 'Bahasa Indonesia', 'IPA', 'IPS', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
  2: ['Matematika', 'Bahasa Indonesia', 'IPA', 'IPS', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
  3: ['Matematika', 'Bahasa Indonesia', 'IPA', 'IPS', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
  4: ['Matematika', 'Bahasa Indonesia', 'IPA', 'IPS', 'Bahasa Inggris', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
  5: ['Matematika', 'Bahasa Indonesia', 'IPA', 'IPS', 'Bahasa Inggris', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
  6: ['Matematika', 'Bahasa Indonesia', 'IPA', 'IPS', 'Bahasa Inggris', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
  7: ['Matematika', 'Fisika', 'Biologi', 'Kimia', 'Bahasa Indonesia', 'Bahasa Inggris', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
  8: ['Matematika', 'Fisika', 'Biologi', 'Kimia', 'Bahasa Indonesia', 'Bahasa Inggris', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
  9: ['Matematika', 'Fisika', 'Biologi', 'Kimia', 'Bahasa Indonesia', 'Bahasa Inggris', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
  10: ['Matematika', 'Fisika', 'Kimia', 'Biologi', 'Bahasa Inggris', 'Pendidikan Pancasila', 'Sejarah Indonesia', 'Seni Budaya', 'PJOK'],
  11: ['Matematika', 'Fisika', 'Kimia', 'Biologi', 'Bahasa Inggris', 'Pendidikan Pancasila', 'Sejarah Indonesia', 'Seni Budaya', 'PJOK'],
  12: ['Matematika', 'Fisika', 'Kimia', 'Biologi', 'Bahasa Inggris', 'Pendidikan Pancasila', 'Sejarah Indonesia', 'Seni Budaya', 'PJOK'],
};

// Get category for class
function getCategory(kelas) {
  if (kelas <= 6) return 'SD';
  if (kelas <= 9) return 'SMP';
  return 'SMA';
}

// Search YouTube for videos
async function searchYouTubeVideos(query, maxResults = 50) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new Error('YOUTUBE_API_KEY not set');
  }

  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&maxResults=${maxResults}&type=video&order=relevance&key=${apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.statusText}`);
    }
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error(`Error searching YouTube for "${query}":`, error);
    return [];
  }
}

export async function POST(request) {
  try {
    // Scrape ALL kelas 1-12 for mandatory subjects (NOT deleting existing data)
    const startKelas = 1;
    const endKelas = 12;
    
    console.log('[v0] Starting scrape for ALL kelas 1-12 with mandatory subjects (preserving existing data)');

    let totalInserted = 0;

    // For each class and subject combination (only Kelas 6-12)
    for (const kelas of Object.keys(SUBJECTS_BY_CLASS).map(Number).filter(k => k >= startKelas && k <= endKelas)) {
      const subjects = SUBJECTS_BY_CLASS[kelas];
      const category = getCategory(kelas);

      for (const subject of subjects) {
        // Multiple search queries per subject for more variety
        const queries = [
          `${subject} kelas ${kelas}`,
          `${subject} SMA ${kelas}`,
          `belajar ${subject} kelas ${kelas}`,
          `tutorial ${subject}`,
          `latihan soal ${subject}`,
        ];

        for (const keyword of queries) {
          console.log(`[v0] Searching for: ${keyword}`);
          const videos = await searchYouTubeVideos(keyword, 50);

          if (videos.length === 0) {
            console.warn(`[v0] No videos found for: ${keyword}`);
            continue;
          }

          // Insert videos
          for (const video of videos) {
            try {
              await sql`
              INSERT INTO videos (videoid, title, description, thumbnail, category, subject, kelas, createdat)
              VALUES (
                ${video.id.videoId},
                ${video.snippet.title},
                ${video.snippet.description || ''},
                ${video.snippet.thumbnails?.medium?.url || 'https://i.ytimg.com/vi/default/mqdefault.jpg'},
                ${category},
                ${subject},
                ${kelas},
                NOW()
              )
            `;
            totalInserted++;
          } catch (err) {
            console.warn(`[v0] Failed to insert video: ${video.snippet.title}`, err.message);
          }
        }

        console.log(`[v0] Inserted videos for ${subject} Kelas ${kelas}`);
        
        // Rate limiting: 500ms delay between searches
        await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }

    console.log(`[v0] Total videos inserted: ${totalInserted}`);

    return Response.json({
      success: true,
      message: `Successfully scraped and inserted ${totalInserted} videos from YouTube`,
      totalVideos: totalInserted,
    });
  } catch (error) {
    console.error('[v0] Scraping error:', error);
    return Response.json(
      {
        error: error.message,
        message: 'Failed to scrape YouTube videos',
      },
      { status: 500 }
    );
  }
}
