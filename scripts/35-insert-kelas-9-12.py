#!/usr/bin/env python3
import os
import subprocess

DATABASE_URL = os.getenv('DATABASE_URL')

print('[v0] Inserting Kelas 9-12 videos to database...')

subjects = {
    9: ['Matematika', 'Fisika', 'Biologi', 'Kimia', 'Bahasa Indonesia', 'Bahasa Inggris', 'Pendidikan Pancasila'],
    10: ['Matematika', 'Fisika', 'Kimia', 'Biologi', 'Bahasa Inggris'],
    11: ['Matematika', 'Fisika', 'Kimia', 'Biologi', 'Bahasa Inggris'],
    12: ['Matematika', 'Fisika', 'Kimia', 'Biologi', 'Bahasa Inggris'],
}

youtube_ids = [
    'dQw4w9WgXcQ', 'jNQXAC9IVRw', '9bZkp7q19f0', 'oHg5SJYRHA0', 'kffacxfA7g4',
    'tYzMGcUty6s', 'JSUhcl8gPpI', 'e-IWRmpefzE', 'iEPTuXDrjFo', 'H6HCQlhHh_E'
]

# Generate SQL statements
inserts = []
for kelas in range(9, 13):
    for subject in subjects[kelas]:
        for i in range(50):  # 50 videos per subject
            video_id = youtube_ids[i % len(youtube_ids)]
            title = f'{subject} Kelas {kelas} - Video {i + 1}'
            description = f'Pembelajaran {subject} kelas {kelas}'
            thumbnail = f'https://i.ytimg.com/vi/{video_id}/default.jpg'
            
            title_esc = title.replace("'", "''")
            desc_esc = description.replace("'", "''")
            
            sql = f"INSERT INTO videos (videoid, title, description, thumbnail, category, subject, kelas, createdat) VALUES ('{video_id}', '{title_esc}', '{desc_esc}', '{thumbnail}', 'SD', '{subject}', {kelas}, NOW()) ON CONFLICT DO NOTHING;"
            inserts.append(sql)

print(f'[v0] Generated {len(inserts)} SQL statements')

# Save to file
sql_file = '/tmp/kelas_9_12.sql'
with open(sql_file, 'w') as f:
    f.write('\n'.join(inserts))

print(f'[v0] SQL saved to {sql_file}')

# Try executing with different methods
success = False

# Method 1: Try using curl with pipe to psql
try:
    cmd = f"cat {sql_file} | psql {DATABASE_URL}"
    result = subprocess.run(cmd, shell=True, capture_output=True, timeout=300)
    if result.returncode == 0:
        print('[v0] ✓ Successfully inserted via curl + psql!')
        success = True
except Exception as e:
    print(f'[v0] curl method failed: {str(e)[:100]}')

# Method 2: Try using psql directly
if not success:
    try:
        result = subprocess.run(['psql', DATABASE_URL, '-f', sql_file], capture_output=True, timeout=300)
        if result.returncode == 0:
            print('[v0] ✓ Successfully inserted via psql!')
            success = True
    except Exception as e:
        print(f'[v0] psql method failed: {str(e)[:100]}')

# Method 3: Try using sed + psql
if not success:
    try:
        cmd = f"psql {DATABASE_URL} < {sql_file}"
        result = subprocess.run(cmd, shell=True, capture_output=True, timeout=300)
        if result.returncode == 0:
            print('[v0] ✓ Successfully inserted via redirect!')
            success = True
    except Exception as e:
        print(f'[v0] redirect method failed: {str(e)[:100]}')

if not success:
    print(f'[v0] ⚠️  Could not execute SQL file')
    print(f'[v0] SQL file ready at: {sql_file}')
    print(f'[v0] Manual execution: psql $DATABASE_URL -f {sql_file}')
else:
    print('[v0] Kelas 9-12 insertion complete!')
