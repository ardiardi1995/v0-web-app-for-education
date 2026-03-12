import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

const subjects: { [key: number]: string[] } = {
  9: ['Matematika', 'Fisika', 'Biologi', 'Kimia', 'Bahasa Indonesia', 'Bahasa Inggris', 'Pendidikan Pancasila'],
  10: ['Matematika', 'Fisika', 'Kimia', 'Biologi', 'Bahasa Inggris', 'Bahasa Indonesia', 'Pendidikan Pancasila'],
};

const videoMappings = {
  9: {
    Matematika: ['dQw4w9WgXcQ', '9bZkp7q19f0', 'jNQXAC9IVRw'],
    Fisika: ['vbzNXHkO4EI', 'sLyaXcXdC5I', 'F_gQKJl8n0w'],
    Biologi: ['BiO1_9_0', 'BiO2_9_1', 'BiO3_9_2'],
    Kimia: ['Chem1_9_0', 'Chem2_9_1', 'Chem3_9_2'],
    'Bahasa Indonesia': ['BiID1_9_0', 'BiID2_9_1', 'BiID3_9_2'],
    'Bahasa Inggris': ['BI1_9_0', 'BI2_9_1', 'BI3_9_2'],
    'Pendidikan Pancasila': ['PP1_9_0', 'PP2_9_1', 'PP3_9_2'],
  },
  10: {
    Matematika: ['dQw4w9WgXcQ', '9bZkp7q19f0', 'jNQXAC9IVRw'],
    Fisika: ['vbzNXHkO4EI', 'sLyaXcXdC5I', 'F_gQKJl8n0w'],
    Biologi: ['BiO1_10_0', 'BiO2_10_1', 'BiO3_10_2'],
    Kimia: ['Chem1_10_0', 'Chem2_10_1', 'Chem3_10_2'],
    'Bahasa Indonesia': ['BiID1_10_0', 'BiID2_10_1', 'BiID3_10_2'],
    'Bahasa Inggris': ['BI1_10_0', 'BI2_10_1', 'BI3_10_2'],
    'Pendidikan Pancasila': ['PP1_10_0', 'PP2_10_1', 'PP3_10_2'],
  },
};

async function fetchYouTubeData(videoId: string) {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${process.env.YOUTUBE_API_KEY}&part=snippet,contentDetails`,
      { next: { revalidate: 3600 } }
    );
    
    if (!response.ok) throw new Error('YouTube API error');
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) return null;
    
    const item = data.items[0];
    const duration = parseDuration(item.contentDetails.duration);
    
    return {
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high.url,
      duration,
    };
  } catch (error) {
    console.error(`Error fetching video ${videoId}:`, error);
    return null;
  }
}

function parseDuration(iso8601Duration: string): number {
  const regex = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/;
  const matches = iso8601Duration.match(regex);
  
  if (!matches) return 0;
  
  const hours = parseInt(matches[1] || '0', 10);
  const minutes = parseInt(matches[2] || '0', 10);
  const seconds = parseInt(matches[3] || '0', 10);
  
  return hours * 3600 + minutes * 60 + seconds;
}

async function populateVideos() {
  console.log('Starting video population for Kelas 9-10...');
  
  for (const kelas of [9, 10]) {
    for (const subject of subjects[kelas]) {
      const videoIds = videoMappings[kelas][subject as keyof (typeof videoMappings)[9]] || [];
      
      for (let i = 0; i < videoIds.length; i++) {
        const videoId = videoIds[i];
        const youtubeData = await fetchYouTubeData(videoId);
        
        if (youtubeData) {
          await sql`
            INSERT INTO videos (
              videoid, title, description, thumbnail, 
              category, subject, kelas, duration, url, createdat
            ) VALUES (
              ${videoId}, ${youtubeData.title}, ${youtubeData.description}, 
              ${youtubeData.thumbnail}, 'SMA', ${subject}, ${kelas}, 
              ${youtubeData.duration}, ${'https://youtube.com/watch?v=' + videoId}, NOW()
            )
            ON CONFLICT DO NOTHING
          `;
          console.log(`✓ Inserted: ${subject} - Kelas ${kelas} (${i + 1}/${videoIds.length})`);
        } else {
          console.log(`✗ Failed: ${videoId}`);
        }
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  }
  
  console.log('Video population completed!');
}

populateVideos().catch(console.error);
