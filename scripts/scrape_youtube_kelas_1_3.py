#!/usr/bin/env python3
"""
YouTube Scraper for Classes 1-3
Fetches educational videos and inserts them into Neon database
"""

import os
import json
import time
import urllib.request
import urllib.parse
from urllib.error import URLError
import psycopg
from datetime import datetime

# Configuration
SUBJECTS_BY_CLASS = {
    1: ['Matematika', 'Bahasa Indonesia', 'IPA', 'IPS'],
    2: ['Matematika', 'Bahasa Indonesia', 'IPA', 'IPS'],
    3: ['Matematika', 'Bahasa Indonesia', 'IPA', 'IPS'],
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

def insert_videos_to_db(kelas, subject, videos):
    """Insert videos into the database"""
    if not videos:
        return 0
    
    try:
        # Connect to database
        with psycopg.connect(DATABASE_URL) as conn:
            with conn.cursor() as cur:
                inserted = 0
                for video in videos:
                    try:
                        cur.execute("""
                            INSERT INTO videos (videoid, title, description, thumbnail, subject, kelas, category, createdat)
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                            ON CONFLICT (videoid) DO NOTHING
                        """, (
                            video['videoid'],
                            video['title'],
                            video['description'],
                            video['thumbnail'],
                            subject,
                            kelas,
                            'SD',
                            datetime.now()
                        ))
                        
                        if cur.rowcount > 0:
                            inserted += 1
                    except Exception as e:
                        print(f'[v0] Error inserting video {video.get("videoid")}: {e}')
                        continue
                
                conn.commit()
                return inserted
                
    except Exception as e:
        print(f'[v0] Database error: {e}')
        return 0

def main():
    """Main scraper function"""
    print('[v0] Starting YouTube scraper for classes 1-3...')
    
    # Validate environment variables
    if not DATABASE_URL:
        print('[v0] ERROR: DATABASE_URL environment variable is not set')
        return False
    
    if not YOUTUBE_API_KEY:
        print('[v0] ERROR: YOUTUBE_API_KEY environment variable is not set')
        return False
    
    total_inserted = 0
    
    try:
        # Scrape for each class
        for kelas in [1, 2, 3]:
            subjects = SUBJECTS_BY_CLASS[kelas]
            
            for subject in subjects:
                keyword = f'{subject} kelas {kelas} pelajaran'
                
                # Search YouTube
                videos = search_youtube_videos(keyword, max_results=20)
                
                if videos:
                    # Insert into database
                    inserted = insert_videos_to_db(kelas, subject, videos)
                    total_inserted += inserted
                    print(f'[v0] Inserted {inserted} new videos for {subject} kelas {kelas}')
                
                # Rate limiting - respect YouTube API quotas
                time.sleep(0.8)
        
        print(f'[v0] ✓ Scraping complete! Total videos inserted: {total_inserted}')
        return True
        
    except Exception as e:
        print(f'[v0] Fatal error: {e}')
        return False

if __name__ == '__main__':
    success = main()
    exit(0 if success else 1)
