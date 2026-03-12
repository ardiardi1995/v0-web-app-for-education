console.log('[v0] Calling YouTube scraper endpoint...');

// Call the API endpoint
const response = await fetch('http://localhost:3000/api/scrape-youtube-real', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
});

const data = await response.json();

if (response.ok) {
  console.log('[v0] SUCCESS:', data.message);
  console.log('[v0] Total videos scraped:', data.totalVideos);
} else {
  console.error('[v0] ERROR:', data.error || data.message);
  process.exit(1);
}
