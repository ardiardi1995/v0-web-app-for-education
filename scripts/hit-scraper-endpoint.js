#!/usr/bin/env node

/**
 * Script untuk hit endpoint /api/scrape-youtube
 * dan menjalankan scraping YouTube videos untuk kelas 1-3
 */

const BASE_URL = 'http://localhost:3000';
const ENDPOINT = '/api/scrape-youtube';

async function runScraper() {
  try {
    console.log('[v0] Starting YouTube scraper...');
    console.log(`[v0] Hitting endpoint: ${BASE_URL}${ENDPOINT}`);
    
    const response = await fetch(`${BASE_URL}${ENDPOINT}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    console.log('\n========== SCRAPING RESULTS ==========');
    console.log(`Success: ${data.success}`);
    console.log(`Total Videos Inserted: ${data.totalInserted}`);
    console.log('\nMessages:');
    data.messages.forEach(msg => console.log(`  ${msg}`));
    console.log('========================================\n');
    
    if (data.success) {
      console.log('[v0] ✓ Scraping completed successfully!');
      console.log('[v0] Videos have been populated into the database.');
      process.exit(0);
    } else {
      console.error('[v0] ✗ Scraping failed');
      console.error('[v0] Error:', data.error);
      process.exit(1);
    }
  } catch (error) {
    console.error('[v0] Error hitting endpoint:', error.message);
    console.error('[v0] Make sure your Next.js app is running with: npm run dev');
    process.exit(1);
  }
}

runScraper();
