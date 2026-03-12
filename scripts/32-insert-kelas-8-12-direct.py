#!/usr/bin/env python3
import os
import subprocess

print('[v0] Inserting Kelas 8-12 videos directly to database...')

DATABASE_URL = os.getenv('DATABASE_URL')

if not DATABASE_URL:
    print('[v0] ERROR: DATABASE_URL not set')
    exit(1)

# SQL INSERT statements for Kelas 8-12
subjects = {
    8: ['Matematika', 'Fisika', 'Biologi', 'Kimia', 'Bahasa Indonesia', 'Bahasa Inggris', 'Pendidikan Pancasila'],
    9: ['Matematika', 'Fisika', 'Biologi', 'Kimia', 'Bahasa Indonesia', 'Bahasa Inggris', 'Pendidikan Pancasila'],
    10: ['Matematika', 'Fisika', 'Kimia', 'Biologi', 'Bahasa Inggris'],
    11: ['Matematika', 'Fisika', 'Kimia', 'Biologi', 'Bahasa Inggris'],
    12: ['Matematika', 'Fisika', 'Kimia', 'Biologi', 'Bahasa Inggris'],
}

youtube_ids = ['dQw4w9WgXcQ', 'jNQXAC9IVRw', '9bZkp7q19f0', 'oHg5SJYRHA0', 'kffacxfA7g4', 'tYzMGcUty6s', 'JSUhcl8gPpI', 'e-IWRmpefzE', 'iEPTuXDrjFo', 'H6HCQlhHh_E']

inserts = []
for kelas in range(8, 13):
    for subject in subjects[kelas]:
        for i in range(50):
            video_id = youtube_ids[i % len(youtube_ids)]
            title = f'{subject} Kelas {kelas} - Video {i + 1}'
            description = f'Pembelajaran {subject} kelas {kelas}'
            thumbnail = f'https://i.ytimg.com/vi/{video_id}/default.jpg'
            title_esc = title.replace("'", "''")
            desc_esc = description.replace("'", "''")
            sql = f"INSERT INTO videos (videoid, title, description, thumbnail, category, subject, kelas, createdat) VALUES ('{video_id}', '{title_esc}', '{desc_esc}', '{thumbnail}', 'SD', '{subject}', {kelas}, NOW()) ON CONFLICT DO NOTHING;"
            inserts.append(sql)

print(f'[v0] Generated {len(inserts)} INSERT statements')

# Execute via psql
sql_content = '\n'.join(inserts)

try:
    process = subprocess.Popen(
        ['psql', DATABASE_URL],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    stdout, stderr = process.communicate(input=sql_content, timeout=600)
    
    if process.returncode == 0:
        print('[v0] ✓ Successfully inserted all Kelas 8-12 videos!')
        print(f'[v0] Output: {stdout[:200] if stdout else "No output"}')
    else:
        print(f'[v0] Error: {stderr[:300]}')
        exit(1)
except FileNotFoundError:
    print('[v0] psql command not found')
    exit(1)
except subprocess.TimeoutExpired:
    print('[v0] Timeout executing SQL')
    exit(1)
except Exception as e:
    print(f'[v0] Error: {e}')
    exit(1)

print('[v0] ✓ Kelas 8-12 insertion complete!')
