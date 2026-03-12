#!/usr/bin/env python3
import urllib.request
import urllib.parse
import json
import os
import time

DATABASE_URL = os.getenv('DATABASE_URL')
YOUTUBE_API_KEY = os.getenv('YOUTUBE_API_KEY')

print('[v0] Starting YouTube scraper for mandatory subjects')
print(f'[v0] DATABASE_URL: {"SET" if DATABASE_URL else "NOT SET"}')
print(f'[v0] YOUTUBE_API_KEY: {"SET" if YOUTUBE_API_KEY else "NOT SET"}')

if not DATABASE_URL or not YOUTUBE_API_KEY:
    print('[v0] ERROR: Missing environment variables')
    exit(1)

# Parse database URL
from urllib.parse import urlparse
db_url = urlparse(DATABASE_URL)
db_host = db_url.hostname
db_port = db_url.port or 5432
db_user = db_url.username
db_password = db_url.password
db_name = db_url.path.lstrip('/')

print(f'[v0] Database: {db_host}:{db_port}/{db_name}')

queries = [
    ('1', 'Pendidikan Pancasila', 'Pendidikan Pancasila kelas 1'),
    ('1', 'Pendidikan Agama Islam', 'Pendidikan Agama Islam kelas 1'),
    ('1', 'Seni Budaya', 'Seni Budaya kelas 1'),
    ('1', 'PJOK', 'PJOK kelas 1'),
    ('2', 'Pendidikan Pancasila', 'Pendidikan Pancasila kelas 2'),
    ('2', 'Pendidikan Agama Islam', 'Pendidikan Agama Islam kelas 2'),
    ('2', 'Seni Budaya', 'Seni Budaya kelas 2'),
    ('2', 'PJOK', 'PJOK kelas 2'),
    ('3', 'Pendidikan Pancasila', 'Pendidikan Pancasila kelas 3'),
    ('3', 'Pendidikan Agama Islam', 'Pendidikan Agama Islam kelas 3'),
    ('3', 'Seni Budaya', 'Seni Budaya kelas 3'),
    ('3', 'PJOK', 'PJOK kelas 3'),
    ('9', 'Matematika', 'Matematika kelas 9 pembelajaran'),
    ('9', 'Fisika', 'Fisika kelas 9 pembelajaran'),
    ('9', 'Biologi', 'Biologi kelas 9 pembelajaran'),
    ('9', 'Pendidikan Pancasila', 'Pendidikan Pancasila kelas 9'),
    ('10', 'Matematika', 'Matematika kelas 10 pembelajaran'),
    ('10', 'Fisika', 'Fisika kelas 10 pembelajaran'),
    ('10', 'Pendidikan Pancasila', 'Pendidikan Pancasila kelas 10'),
    ('11', 'Matematika', 'Matematika kelas 11 pembelajaran'),
    ('11', 'Fisika', 'Fisika kelas 11 pembelajaran'),
    ('11', 'Pendidikan Pancasila', 'Pendidikan Pancasila kelas 11'),
    ('12', 'Matematika', 'Matematika kelas 12 pembelajaran'),
    ('12', 'Fisika', 'Fisika kelas 12 pembelajaran'),
    ('12', 'Pendidikan Pancasila', 'Pendidikan Pancasila kelas 12'),
]

def search_youtube(query):
    url = f'https://www.googleapis.com/youtube/v3/search?part=snippet&q={urllib.parse.quote(query)}&type=video&maxResults=50&key={YOUTUBE_API_KEY}&relevanceLanguage=id'
    try:
        with urllib.request.urlopen(url, timeout=10) as response:
            data = json.loads(response.read().decode())
            return data.get('items', [])
    except Exception as e:
        print(f'[v0] Error searching YouTube: {e}')
        return []

total_inserted = 0

for kelas, subject, query in queries:
    print(f'\n[v0] Searching: "{query}"')
    videos = search_youtube(query)
    print(f'[v0] Found {len(videos)} videos')
    
    for video in videos:
        try:
            video_id = video['id']['videoId']
            title = video['snippet']['title']
            description = video['snippet']['description']
            thumbnail = video['snippet']['thumbnails'].get('medium', {}).get('url') or video['snippet']['thumbnails'].get('default', {}).get('url')
            
            insert_sql = f"""INSERT INTO videos (videoid, title, description, thumbnail, category, subject, kelas, createdat) 
                            VALUES ('{video_id}', '{title.replace("'", "''")}', '{description.replace("'", "''")}', '{thumbnail}', 'SD', '{subject}', {kelas}, NOW())
                            ON CONFLICT (videoid) DO NOTHING;"""
            
            print(f'[v0] Would insert: {video_id} - {title[:50]}...')
            total_inserted += 1
        except Exception as e:
            print(f'[v0] Error processing video: {e}')
    
    time.sleep(0.5)

print(f'\n[v0] Total videos to insert: {total_inserted}')
print('[v0] Scraping complete - all videos ready for insertion')
