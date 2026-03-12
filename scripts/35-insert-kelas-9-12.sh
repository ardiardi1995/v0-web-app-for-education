#!/usr/bin/env python3
import subprocess
import os

DATABASE_URL = os.getenv('DATABASE_URL')

print('[v0] Inserting Kelas 9-12 videos via psql...')

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

print(f'[v0] Generated {len(inserts)} SQL statements for Kelas 9-12')

# Execute via psql
if DATABASE_URL:
    try:
        process = subprocess.Popen(['psql', DATABASE_URL], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        sql_script = '\n'.join(inserts)
        stdout, stderr = process.communicate(input=sql_script, timeout=300)
        
        if process.returncode == 0:
            print('[v0] ✓ Successfully inserted Kelas 9-12 videos!')
        else:
            print(f'[v0] psql error: {stderr[:200]}')
            # Save to file as fallback
            with open('/tmp/kelas_9_12.sql', 'w') as f:
                f.write('\n'.join(inserts))
            print('[v0] SQL saved to /tmp/kelas_9_12.sql for manual execution')
    except FileNotFoundError:
        print('[v0] psql not found')
    except Exception as e:
        print(f'[v0] Error: {e}')
else:
    print('[v0] DATABASE_URL not set')
