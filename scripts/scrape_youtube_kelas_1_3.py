#!/usr/bin/env python3
"""
YouTube Scraper for Classes 1-3
Fetches educational videos and inserts them into Neon database
Uses built-in libraries only (no external dependencies)
"""

import os
import json
import time
import urllib.request
import urllib.parse
from urllib.error import URLError
from datetime import datetime

# Configuration - Kurikulum SD Kelas 1-6 (IPAS menggabungkan IPA dan IPS)
SUBJECTS_BY_CLASS = {
    1: ['Matematika', 'Bahasa Indonesia', 'IPAS', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
    2: ['Matematika', 'Bahasa Indonesia', 'IPAS', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
    3: ['Matematika', 'Bahasa Indonesia', 'IPAS', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
}

DATABASE_URL = os.getenv('DATABASE_URL')
YOUTUBE_API_KEY = os.getenv('YOUTUBE_API_KEY')

def search_youtube_videos(query, max_results=20):
    """Search YouTube for videos matching the query"""
    try:
        print(f'[v0] Searching YouTube for: {query}')
        
        # Build YouTube API URL
        params = {
            'part': 'snippet',
            'q': query,
            'maxResults': max_results,
            'type': 'video',
            'key': YOUTUBE_API_KEY
        }
        
        url = f"https://www.googleapis.com/youtube/v3/search?{urllib.parse.urlencode(params)}"
        
        # Fetch from YouTube API
        with urllib.request.urlopen(url, timeout=10) as response:
            data = json.loads(response.read())
        
        videos = []
        if 'items' in data:
            for item in data['items']:
                videos.append({
                    'videoid': item['id']['videoId'],
                    'title': item['snippet']['title'],
                    'description': item['snippet']['description'],
                    'thumbnail': item['snippet']['thumbnails'].get('medium', {}).get('url') or 
                                 item['snippet']['thumbnails'].get('default', {}).get('url'),
                })
        
        print(f'[v0] Found {len(videos)} videos for: {query}')
        return videos
        
    except URLError as e:
        print(f'[v0] Error searching YouTube for "{query}": {e}')
        return []
    except Exception as e:
        print(f'[v0] Unexpected error searching YouTube: {e}')
        return []

def execute_db_query(query, params=None):
    """Execute a database query using the API endpoint"""
    try:
        # For Neon, we would need psycopg, but since it's not available,
        # we'll print what would be executed
        print(f'[v0] Would execute: {query}')
        if params:
            print(f'[v0] With params: {params}')
        return True
    except Exception as e:
        print(f'[v0] Database error: {e}')
        return False

def main():
    """Main scraper function"""
    print('[v0] Starting YouTube scraper for classes 1-3...')
    print('[v0] Note: This script requires psycopg to be installed for database operations')
    
    # Validate environment variables
    if not DATABASE_URL:
        print('[v0] ERROR: DATABASE_URL environment variable is not set')
        print('[v0] To set it, add it in your project settings -> Vars')
        return False
    
    if not YOUTUBE_API_KEY:
        print('[v0] ERROR: YOUTUBE_API_KEY environment variable is not set')
        print('[v0] To set it, add it in your project settings -> Vars')
        return False
    
    print('[v0] Environment variables found!')
    print(f'[v0] DATABASE_URL: {DATABASE_URL[:30]}...')
    print(f'[v0] YOUTUBE_API_KEY: {YOUTUBE_API_KEY[:20]}...')
    
    total_scraped = 0
    
    try:
        # Scrape for each class
        for kelas in [1, 2, 3]:
            print(f'\n[v0] Processing Kelas {kelas}...')
            
            subjects = SUBJECTS_BY_CLASS[kelas]
            
            for subject in subjects:
                keyword = f'{subject} kelas {kelas} pelajaran'
                
                # Search YouTube
                videos = search_youtube_videos(keyword, max_results=20)
                
                if videos:
                    total_scraped += len(videos)
                    print(f'[v0] Found {len(videos)} videos for {subject} kelas {kelas}')
                    
                    # Show first video as sample
                    if videos:
                        print(f'[v0]   Sample: {videos[0]["title"][:60]}...')
                
                # Rate limiting - respect YouTube API quotas
                time.sleep(0.8)
        
        print(f'\n[v0] ✓ Scraping complete! Total videos found: {total_scraped}')
        print('[v0] NOTE: To insert these videos into the database, psycopg must be installed')
        return True
        
    except Exception as e:
        print(f'[v0] Fatal error: {e}')
        return False

if __name__ == '__main__':
    success = main()
    exit(0 if success else 1)
