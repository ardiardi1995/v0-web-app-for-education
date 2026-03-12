#!/usr/bin/env node

const pg = require('pg');
const https = require('https');
const { Client } = pg;

const SUBJECTS = {
  1: ['Matematika', 'Bahasa Indonesia', 'IPA', 'IPS', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
  2: ['Matematika', 'Bahasa Indonesia', 'IPA', 'IPS', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
  3: ['Matematika', 'Bahasa Indonesia', 'IPA', 'IPS', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
  4: ['Matematika', 'Bahasa Indonesia', 'IPA', 'IPS', 'Bahasa Inggris', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
  5: ['Matematika', 'Bahasa Indonesia', 'IPA', 'IPS', 'Bahasa Inggris', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
  6: ['Matematika', 'Bahasa Indonesia', 'IPA', 'IPS', 'Bahasa Inggris', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
};

const client = new Client({ connectionString: process.env.DATABASE_URL });
let totalInserted = 0;
let classesProcessed = 0;

function youtubeSearch(query, callback) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=50&key=${apiKey}&relevanceLanguage=id`;
  
  https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      try {
        const result = JSON.parse(data);
        callback(result.items || []);
      } catch (err) {
        callback([]);
      }
    });
  }).on('error', (err) => {
    console.error('[v0] Search error:', err.message);
    callback([]);
  });
}

function insertVideos(videos, subject, kelas, callback) {
  let insertedCount = 0;
  
  function insertNext(index) {
    if (index >= videos.length) {
      callback(insertedCount);
      return;
    }
    
    const video = videos[index];
    const videoid = video.id.videoId;
    const title = video.snippet.title;
    const description = video.snippet.description;
    const thumbnail = video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default?.url;
    
    client.query(
      'INSERT INTO videos (videoid, title, description, thumbnail, category, subject, kelas, createdat) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) ON CONFLICT DO NOTHING',
      [videoid, title, description, thumbnail, 'SD', subject, kelas],
      (err) => {
        if (!err) insertedCount++;
        insertNext(index + 1);
      }
    );
  }
  
  insertNext(0);
}

function processClass(kelas, callback) {
  const subjects = SUBJECTS[kelas];
  let subjectIndex = 0;
  
  function processSubject() {
    if (subjectIndex >= subjects.length) {
      console.log(`[v0] Finished Kelas ${kelas}`);
      classesProcessed++;
      callback();
      return;
    }
    
    const subject = subjects[subjectIndex];
    console.log(`[v0] Kelas ${kelas} - ${subject}`);
    
    const queries = [
      `${subject} kelas ${kelas}`,
      `${subject} pembelajaran`,
      `belajar ${subject}`,
    ];
    
    let queryIndex = 0;
    
    function processQuery() {
      if (queryIndex >= queries.length) {
        subjectIndex++;
        setTimeout(processSubject, 500);
        return;
      }
      
      youtubeSearch(queries[queryIndex], (videos) => {
        console.log(`[v0] Found ${videos.length} videos`);
        insertVideos(videos, subject, kelas, (count) => {
          totalInserted += count;
          queryIndex++;
          setTimeout(processQuery, 300);
        });
      });
    }
    
    processQuery();
  }
  
  processSubject();
}

client.connect((err) => {
  if (err) {
    console.error('[v0] Connection error:', err.message);
    process.exit(1);
  }
  
  console.log('[v0] Connected - Scraping Kelas 1-6 with mandatory subjects');
  
  let kelasIndex = 1;
  
  function processNextClass() {
    if (kelasIndex > 6) {
      client.query('SELECT COUNT(*) as total FROM videos', (err, result) => {
        if (!err) {
          console.log(`[v0] Total inserted: ${totalInserted}`);
          console.log(`[v0] Grand total: ${result.rows[0].total}`);
        }
        client.end();
        process.exit(0);
      });
      return;
    }
    
    processClass(kelasIndex, () => {
      kelasIndex++;
      processNextClass();
    });
  }
  
  processNextClass();
});
