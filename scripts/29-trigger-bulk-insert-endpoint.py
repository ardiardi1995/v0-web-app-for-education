#!/usr/bin/env python3
import os
import sys
import subprocess

DATABASE_URL = os.getenv('DATABASE_URL')

if not DATABASE_URL:
    print('[v0] ERROR: DATABASE_URL not set')
    exit(1)

print('[v0] Starting direct database bulk insert...')

# Mata pelajaran per kelas
SUBJECTS = {
    1: ['Matematika', 'Bahasa Indonesia', 'IPA', 'IPS', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
    2: ['Matematika', 'Bahasa Indonesia', 'IPA', 'IPS', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
    3: ['Matematika', 'Bahasa Indonesia', 'IPA', 'IPS', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
    4: ['Matematika', 'Bahasa Indonesia', 'IPA', 'IPS', 'Bahasa Inggris', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
    5: ['Matematika', 'Bahasa Indonesia', 'IPA', 'IPS', 'Bahasa Inggris', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
    6: ['Matematika', 'Bahasa Indonesia', 'IPA', 'IPS', 'Bahasa Inggris', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
    7: ['Matematika', 'Fisika', 'Biologi', 'Kimia', 'Bahasa Indonesia', 'Bahasa Inggris', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
    8: ['Matematika', 'Fisika', 'Biologi', 'Kimia', 'Bahasa Indonesia', 'Bahasa Inggris', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
    9: ['Matematika', 'Fisika', 'Biologi', 'Kimia', 'Bahasa Indonesia', 'Bahasa Inggris', 'Pendidikan Pancasila', 'Pendidikan Agama Islam', 'Seni Budaya', 'PJOK'],
    10: ['Matematika', 'Fisika', 'Kimia', 'Biologi', 'Bahasa Inggris', 'Pendidikan Pancasila', 'Sejarah Indonesia', 'Seni Budaya', 'PJOK'],
    11: ['Matematika', 'Fisika', 'Kimia', 'Biologi', 'Bahasa Inggris', 'Pendidikan Pancasila', 'Sejarah Indonesia', 'Seni Budaya', 'PJOK'],
    12: ['Matematika', 'Fisika', 'Kimia', 'Biologi', 'Bahasa Inggris', 'Pendidikan Pancasila', 'Sejarah Indonesia', 'Seni Budaya', 'PJOK'],
}

YOUTUBE_IDS = ['dQw4w9WgXcQ', 'jNQXAC9IVRw', '9bZkp7q19f0', 'oHg5SJYRHA0', 'kffacxfA7g4', 'tYzMGcUty6s', 'JSUhcl8gPpI', 'e-IWRmpefzE', 'iEPTuXDrjFo', 'H6HCQlhHh_E']

print('[v0] Generating 10,800 videos for bulk insert...')

# Generate INSERT statements
sql_inserts = []
total_videos = 0

for kelas in range(1, 13):
    subjects = SUBJECTS[kelas]
    for subject in subjects:
        for i in range(100):
            video_id = YOUTUBE_IDS[(kelas * 10 + i) % len(YOUTUBE_IDS)]
            title = f'{subject} Kelas {kelas} - Video {i + 1}'
            description = f'Materi pembelajaran {subject} untuk kelas {kelas}'
            thumbnail = f'https://i.ytimg.com/vi/{video_id}/default.jpg'
            
            # Escape single quotes
            title_esc = title.replace("'", "''")
            desc_esc = description.replace("'", "''")
            
            sql = f"INSERT INTO videos (videoid, title, description, thumbnail, category, subject, kelas, createdat) VALUES ('{video_id}', '{title_esc}', '{desc_esc}', '{thumbnail}', 'SD', '{subject}', {kelas}, NOW()) ON CONFLICT DO NOTHING;"
            sql_inserts.append(sql)
            total_videos += 1

print(f'[v0] Generated {total_videos} INSERT statements')

# Write SQL to file
sql_file = '/tmp/bulk_insert.sql'
with open(sql_file, 'w') as f:
    f.write('\n'.join(sql_inserts))

print(f'[v0] SQL file saved: {sql_file}')

# Try to execute using different methods
methods_tried = []

# Method 1: Try psql
try:
    print('[v0] Trying psql...')
    result = subprocess.run(['psql', DATABASE_URL, '-f', sql_file], capture_output=True, timeout=600)
    if result.returncode == 0:
        print('[v0] ✓ Bulk insert successful via psql!')
        exit(0)
    else:
        methods_tried.append(f'psql failed: {result.stderr.decode()[:100]}')
except (FileNotFoundError, subprocess.TimeoutExpired) as e:
    methods_tried.append(f'psql not available: {str(e)[:50]}')

# Method 2: Try using curl to access database
try:
    print('[v0] Trying curl with psql...')
    result = subprocess.run(['sh', '-c', f'cat {sql_file} | psql {DATABASE_URL}'], capture_output=True, timeout=600)
    if result.returncode == 0:
        print('[v0] ✓ Bulk insert successful via curl!')
        exit(0)
    else:
        methods_tried.append(f'curl method failed: {result.stderr.decode()[:100]}')
except Exception as e:
    methods_tried.append(f'curl method error: {str(e)[:50]}')

# Method 3: Use sqlite3 if available (fallback)
try:
    print('[v0] Creating chunked SQL execution...')
    # Execute in batches of 1000 to avoid timeout
    chunk_size = 1000
    for chunk_num in range(0, len(sql_inserts), chunk_size):
        chunk = sql_inserts[chunk_num:chunk_num + chunk_size]
        chunk_sql = '\n'.join(chunk)
        
        process = subprocess.Popen(['psql', DATABASE_URL], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        stdout, stderr = process.communicate(input=chunk_sql, timeout=300)
        
        if process.returncode == 0:
            print(f'[v0] ✓ Chunk {chunk_num // chunk_size + 1} inserted')
        else:
            raise Exception(stderr)
    
    print('[v0] ✓ Bulk insert successful in chunks!')
    exit(0)
    
except Exception as e:
    methods_tried.append(f'chunked execution: {str(e)[:100]}')

print('[v0] Methods attempted:')
for method in methods_tried:
    print(f'  - {method}')

print(f'[v0] SQL file ready at: {sql_file}')
print('[v0] Manual execution: psql $DATABASE_URL -f ' + sql_file)
