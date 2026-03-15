#!/usr/bin/env node

/**
 * YouTube Scraper for SD Classes 1-3
 * This script sets up the database and scrapes YouTube videos
 */

const baseURL = process.env.BASE_URL || 'http://localhost:3000';

async function callAPI(action) {
  console.log(`[v0] Calling API with action: ${action}`);
  
  const url = `${baseURL}/api/scraper?action=${action}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.success) {
      console.log(`[v0] ✓ ${data.message}`);
    } else {
      console.error(`[v0] ✗ Error: ${data.error}`);
      process.exit(1);
    }
    
    return data;
  } catch (error) {
    console.error(`[v0] Network error:`, error.message);
    process.exit(1);
  }
}

async function main() {
  console.log('[v0] Starting YouTube scraper for SD classes 1-3...');
  console.log(`[v0] Base URL: ${baseURL}`);
  
  // Step 1: Setup table
  console.log('\n[v0] Step 1: Creating videos table...');
  await callAPI('setup');
  
  // Step 2: Delete old data
  console.log('\n[v0] Step 2: Deleting old IPA/IPS data...');
  await callAPI('delete-old');
  
  // Step 3: Scrape new data
  console.log('\n[v0] Step 3: Scraping YouTube videos...');
  const result = await callAPI('scrape');
  
  console.log('\n[v0] ✓ Scraping complete!');
  process.exit(0);
}

main().catch(error => {
  console.error('[v0] Fatal error:', error);
  process.exit(1);
});
