import os
import psycopg2
from urllib.request import urlopen
import json
import time

db_url = os.getenv('DATABASE_URL')
api_key = os.getenv('YOUTUBE_API_KEY')

conn = psycopg2.connect(db_url)
cur = conn.cursor()

print('[v0] Starting scrape for mandatory subjects and Kelas 9-12')

queries = [
    (1, 'Pendidikan Pancasila', 'Pendidikan Pancasila kelas 1'),
    (1, 'Pendidikan Agama Islam', 'Pendidikan Agama Islam kelas 1'),
    (1, 'Seni Budaya', 'Seni Budaya kelas 1'),
    (1, 'PJOK', 'PJOK kelas 1'),
    (2, 'Pendidikan Pancasila', 'Pendidikan Pancasila kelas 2'),
    (2, 'Pendidikan Agama Islam', 'Pendidikan Agama Islam kelas 2'),
    (2, 'Seni Budaya', 'Seni Budaya kelas 2'),
    (2, 'PJOK', 'PJOK kelas 2'),
    (3, 'Pendidikan Pancasila', 'Pendidikan Pancasila kelas 3'),
    (3, 'Pendidikan Agama Islam', 'Pendidikan Agama Islam kelas 3'),
    (3, 'Seni Budaya', 'Seni Budaya kelas 3'),
    (3, 'PJOK', 'PJOK kelas 3'),
    (9, 'Matematika', 'Matematika kelas 9 pembelajaran'),
    (9, 'Fisika', 'Fisika kelas 9 pembelajaran'),
    (9, 'Biologi', 'Biologi kelas 9 pembelajaran'),
    (9, 'Kimia', 'Kimia kelas 9 pembelajaran'),
    (10, 'Matematika', 'Matematika kelas 10 pembelajaran'),
    (10, 'Fisika', 'Fisika kelas 10 pembelajaran'),
    (11, 'Matematika', 'Matematika kelas 11 pembelajaran'),
    (11, 'Fisika', 'Fisika kelas 11 pembelajaran'),
    (12, 'Matematika', 'Matematika kelas 12 pembelajaran'),
    (12, 'Fisika', 'Fisika kelas 12 pembelajaran'),
]

total_inserted = 0

for kelas, subject, search_query in queries:
    print(f'[v0] Searching: {search_query}')
    
    url = f'https://www.googleapis.com/youtube/v3/search?part=snippet&q={search_query}&type=video&maxResults=50&key={api_key}&relevanceLanguage=id'
    
    try:
        response = urlopen(url)
        data = json.loads(response.read())
        videos = data.get('items', [])
        
        print(f'[v0] Found {len(videos)} videos')
        
        for video in videos:
            try:
                videoid = video['id']['videoId']
                title = video['snippet']['title']
                description = video['snippet']['description']
                thumbnail = video['snippet']['thumbnails'].get('medium', {}).get('url') or video['snippet']['thumbnails'].get('default', {}).get('url')
                
                cur.execute(
                    'INSERT INTO videos (videoid, title, description, thumbnail, category, subject, kelas, createdat) VALUES (%s, %s, %s, %s, %s, %s, %s, NOW())',
                    (videoid, title, description, thumbnail, 'SD', subject, kelas)
                )
                total_inserted += 1
            except Exception as e:
                pass
        
        conn.commit()
        time.sleep(0.3)
    except Exception as e:
        print(f'[v0] Error: {str(e)}')

cur.execute('SELECT COUNT(*) FROM videos')
total = cur.fetchone()[0]

print(f'[v0] Total inserted: {total_inserted}')
print(f'[v0] Grand total in database: {total}')

cur.close()
conn.close()
