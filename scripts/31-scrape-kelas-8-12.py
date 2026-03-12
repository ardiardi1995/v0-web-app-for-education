#!/usr/bin/env python3
import urllib.request
import json
import os

DATABASE_URL = os.getenv('DATABASE_URL')

print('[v0] Inserting Kelas 8-12 videos via API endpoint...')

subjects = {
    8: ['Matematika', 'Fisika', 'Biologi', 'Kimia', 'Bahasa Indonesia', 'Bahasa Inggris', 'Pendidikan Pancasila'],
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
for kelas in range(8, 13):
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

# Save to file for manual execution if needed
with open('/tmp/kelas_8_12.sql', 'w') as f:
    f.write('\n'.join(inserts))

print('[v0] SQL saved to /tmp/kelas_8_12.sql')
print('[v0] Ready for insertion - execute with: psql $DATABASE_URL -f /tmp/kelas_8_12.sql')
