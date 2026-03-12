#!/usr/bin/env python3
import urllib.request
import urllib.parse
import json
import os
import time

DATABASE_URL = os.getenv('DATABASE_URL')
YOUTUBE_API_KEY = os.getenv('YOUTUBE_API_KEY')

print('[v0] Scraping Kelas 8-12 for YouTube videos')

def search_youtube(query):
    try:
        url = f"https://www.googleapis.com/youtube/v3/search?part=snippet&q={urllib.parse.quote(query)}&type=video&maxResults=50&key={YOUTUBE_API_KEY}&relevanceLanguage=id"
        req = urllib.request.Request(url)
        req.add_header('User-Agent', 'Mozilla/5.0')
        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read())
            return data.get('items', [])
    except Exception as e:
        print(f'[v0] Error searching: {e}')
        return []

subjects = {
    8: ['Matematika', 'Fisika', 'Biologi', 'Kimia', 'Bahasa Indonesia', 'Bahasa Inggris', 'Pendidikan Pancasila'],
    9: ['Matematika', 'Fisika', 'Biologi', 'Kimia', 'Bahasa Indonesia', 'Bahasa Inggris', 'Pendidikan Pancasila'],
    10: ['Matematika', 'Fisika', 'Kimia', 'Biologi', 'Bahasa Inggris'],
    11: ['Matematika', 'Fisika', 'Kimia', 'Biologi', 'Bahasa Inggris'],
    12: ['Matematika', 'Fisika', 'Kimia', 'Biologi', 'Bahasa Inggris'],
}

total = 0
for kelas in range(8, 13):
    for subject in subjects[kelas]:
        query = f'{subject} kelas {kelas} pembelajaran'
        print(f'[v0] Searching: {query}')
        videos = search_youtube(query)
        print(f'[v0] Found {len(videos)} videos')
        total += len(videos)
        time.sleep(0.5)

print(f'[v0] Total videos found: {total}')
print('[v0] Videos ready to insert into database')
