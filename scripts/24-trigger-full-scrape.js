#!/usr/bin/env node

const pg = require('pg');
const https = require('https');
const { Client } = pg;

console.log('[v0] Starting YouTube scraper for ALL classes with mandatory subjects');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

function searchYouTube(query, callback) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=50&key=${apiKey}&relevanceLanguage=id`;
  
  https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      try {
        const result = JSON.parse(data);
        callback(null, result.items || []);
      } catch (err) {
        callback(err, []);
      }
    });
  }).on('error', callback);
}

function insertVideo(client, videoid, title, description, thumbnail, kelas, subject, callback) {
  client.query(
    'INSERT INTO videos (videoid, title, description, thumbnail, category, subject, kelas, createdat) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())',
    [videoid, title, description, thumbnail, 'SD', subject, kelas],
    callback
  );
}

client.connect()
  .then(() => {
    console.log('[v0] Connected to database');
    
    const queries = [
      { kelas: 1, subject: 'Pendidikan Pancasila', query: 'Pendidikan Pancasila kelas 1' },
      { kelas: 1, subject: 'Pendidikan Agama Islam', query: 'Pendidikan Agama Islam kelas 1' },
      { kelas: 1, subject: 'Seni Budaya', query: 'Seni Budaya kelas 1' },
      { kelas: 1, subject: 'PJOK', query: 'PJOK kelas 1' },
      { kelas: 2, subject: 'Pendidikan Pancasila', query: 'Pendidikan Pancasila kelas 2' },
      { kelas: 2, subject: 'Pendidikan Agama Islam', query: 'Pendidikan Agama Islam kelas 2' },
      { kelas: 2, subject: 'Seni Budaya', query: 'Seni Budaya kelas 2' },
      { kelas: 2, subject: 'PJOK', query: 'PJOK kelas 2' },
      { kelas: 3, subject: 'Pendidikan Pancasila', query: 'Pendidikan Pancasila kelas 3' },
      { kelas: 3, subject: 'Pendidikan Agama Islam', query: 'Pendidikan Agama Islam kelas 3' },
      { kelas: 3, subject: 'Seni Budaya', query: 'Seni Budaya kelas 3' },
      { kelas: 3, subject: 'PJOK', query: 'PJOK kelas 3' },
      { kelas: 9, subject: 'Matematika', query: 'Matematika kelas 9' },
      { kelas: 9, subject: 'Fisika', query: 'Fisika kelas 9' },
      { kelas: 9, subject: 'Biologi', query: 'Biologi kelas 9' },
      { kelas: 9, subject: 'Kimia', query: 'Kimia kelas 9' },
      { kelas: 9, subject: 'Pendidikan Pancasila', query: 'Pendidikan Pancasila kelas 9' },
      { kelas: 10, subject: 'Matematika', query: 'Matematika kelas 10' },
      { kelas: 10, subject: 'Fisika', query: 'Fisika kelas 10' },
      { kelas: 10, subject: 'Pendidikan Pancasila', query: 'Pendidikan Pancasila kelas 10' },
      { kelas: 11, subject: 'Matematika', query: 'Matematika kelas 11' },
      { kelas: 11, subject: 'Fisika', query: 'Fisika kelas 11' },
      { kelas: 11, subject: 'Pendidikan Pancasila', query: 'Pendidikan Pancasila kelas 11' },
      { kelas: 12, subject: 'Matematika', query: 'Matematika kelas 12' },
      { kelas: 12, subject: 'Fisika', query: 'Fisika kelas 12' },
      { kelas: 12, subject: 'Pendidikan Pancasila', query: 'Pendidikan Pancasila kelas 12' },
    ];
    
    let totalInserted = 0;
    let processedCount = 0;
    
    const processNextQuery = () => {
      if (processedCount >= queries.length) {
        console.log(`[v0] Total videos inserted: ${totalInserted}`);
        client.end();
        process.exit(0);
        return;
      }
      
      const queryData = queries[processedCount];
      console.log(`[v0] Searching: "${queryData.query}"`);
      
      searchYouTube(queryData.query, (err, videos) => {
        if (err) {
          console.error(`[v0] Error searching: ${err.message}`);
          processedCount++;
          setTimeout(processNextQuery, 300);
          return;
        }
        
        console.log(`[v0] Found ${videos.length} videos for ${queryData.subject} Kelas ${queryData.kelas}`);
        
        let videoInserted = 0;
        const insertNextVideo = () => {
          if (videoInserted >= videos.length) {
            processedCount++;
            setTimeout(processNextQuery, 300);
            return;
          }
          
          const video = videos[videoInserted];
          const videoid = video.id.videoId;
          const title = video.snippet.title;
          const description = video.snippet.description;
          const thumbnail = video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default?.url;
          
          insertVideo(client, videoid, title, description, thumbnail, queryData.kelas, queryData.subject, (err) => {
            if (!err) totalInserted++;
            videoInserted++;
            insertNextVideo();
          });
        };
        
        insertNextVideo();
      });
    };
    
    processNextQuery();
  })
  .catch((err) => {
    console.error('[v0] Error:', err.message);
    process.exit(1);
  });
