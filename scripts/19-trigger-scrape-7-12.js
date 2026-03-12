#!/usr/bin/env node

const http = require('http');

async function triggerScraping() {
  console.log('[v0] Triggering YouTube scraper for Kelas 7-12...');
  
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/scrape-youtube-real',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('[v0] Scraping result:', result);
          resolve(result);
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', reject);
    req.write(JSON.stringify({}));
    req.end();
  });
}

triggerScraping()
  .then((result) => {
    console.log('[v0] Success! Total videos: ', result.totalVideos);
    process.exit(0);
  })
  .catch((err) => {
    console.error('[v0] Failed:', err.message);
    process.exit(1);
  });
