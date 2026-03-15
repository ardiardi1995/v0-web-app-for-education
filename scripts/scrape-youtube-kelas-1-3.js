#!/usr/bin/env node
/**
 * YouTube Scraper for Classes 1-3
 * Fetches educational videos and inserts them into Neon database
 */

import { neon } from '@neondatabase/serverless';

// Configuration - Kurikulum SD Kelas 1-6 (IPAS menggabungkan IPA dan IPS)
const SUBJECTS_BY_CLASS = {
  1: ['Matematika', 'Bahasa Indonesia', 'IPAS', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
  2: ['Matematika', 'Bahasa Indonesia', 'IPAS', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
  3: ['Matematika', 'Bahasa Indonesia', 'IPAS', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
};

const DATABASE_URL = process.env.DATABASE_URL;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

async function searchYouTubeVideos(query, maxResults = 20) {
  try {
    console.log(`[v0] Searching YouTube for: ${query}`);
    
    const params = new URLSearchParams({
      part: 'snippet',
      q: query,
      maxResults,
      type: 'video',
      key: YOUTUBE_API_KEY
    });
    
    const url = `https://www.googleapis.com/youtube/v3/search?${params}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.items) {
      console.log(`[v0] No results found for: ${query}`);
      return [];
    }
    
    const videos = data.items.map(item => ({
      videoid: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
    }));
    
    console.log(`[v0] Found ${videos.length} videos for: ${query}`);
    return videos;
  } catch (error) {
    console.error(`[v0] Error searching YouTube for "${query}":`, error.message);
    return [];
  }
}

async function deleteOldData(sql, kelas) {
  try {
    const result = await sql`
      DELETE FROM videos 
      WHERE kelas = ${kelas} AND (subject = 'IPA' OR subject = 'IPS')
    `;
    
    console.log(`[v0] Deleted ${result.length} old IPA/IPS videos for kelas ${kelas}`);
    return true;
  } catch (error) {
    console.error(`[v0] Error deleting old data: ${error.message}`);
    return false;
  }
}

async function insertVideos(sql, kelas, subject, videos) {
  if (!videos.length) return 0;
  
  try {
    let inserted = 0;
    for (const video of videos) {
      try {
        await sql`
          INSERT INTO videos (videoid, title, description, thumbnail, subject, kelas, category, createdat)
          VALUES (${video.videoid}, ${video.title}, ${video.description}, ${video.thumbnail}, ${subject}, ${kelas}, 'SD', NOW())
          ON CONFLICT (videoid) DO NOTHING
        `;
        inserted++;
      } catch (err) {
        // Silently skip duplicates and other conflicts
      }
    }
    
    console.log(`[v0] Inserted ${inserted} new videos for ${subject} kelas ${kelas}`);
    return inserted;
  } catch (error) {
    console.error(`[v0] Database error: ${error.message}`);
    return 0;
  }
}

async function main() {
  console.log('[v0] Starting YouTube scraper for classes 1-3...');
  
  // Validate environment variables
  if (!DATABASE_URL) {
    console.error('[v0] ERROR: DATABASE_URL environment variable is not set');
    console.error('[v0] To set it, add it in your project settings -> Vars');
    process.exit(1);
  }
  
  if (!YOUTUBE_API_KEY) {
    console.error('[v0] ERROR: YOUTUBE_API_KEY environment variable is not set');
    console.error('[v0] To set it, add it in your project settings -> Vars');
    process.exit(1);
  }
  
  console.log('[v0] Environment variables found!');
  
  const sql = neon(DATABASE_URL);
  let totalInserted = 0;
  
  try {
    // Scrape for each class
    for (let kelas = 1; kelas <= 3; kelas++) {
      console.log(`\n[v0] Processing Kelas ${kelas}...`);
      
      // Delete old IPA and IPS data first
      await deleteOldData(sql, kelas);
      
      const subjects = SUBJECTS_BY_CLASS[kelas];
      
      for (const subject of subjects) {
        const keyword = `${subject} kelas ${kelas} pelajaran`;
        
        // Search YouTube
        const videos = await searchYouTubeVideos(keyword, 20);
        
        if (videos.length > 0) {
          // Insert into database
          const inserted = await insertVideos(sql, kelas, subject, videos);
          totalInserted += inserted;
        }
        
        // Rate limiting - respect YouTube API quotas
        await new Promise(r => setTimeout(r, 800));
      }
    }
    
    console.log(`\n[v0] ✓ Scraping complete! Total videos inserted: ${totalInserted}`);
    process.exit(0);
  } catch (error) {
    console.error('[v0] Fatal error:', error);
    process.exit(1);
  }
}

main();
