#!/usr/bin/env python3
import os
import sys

DATABASE_URL = os.getenv('DATABASE_URL')

if not DATABASE_URL:
    print('[v0] ERROR: DATABASE_URL not set')
    exit(1)

print('[v0] Starting bulk insert via neon serverless client...')

# Try to import neon_serverless
try:
    from neon_serverless import connect
    HAS_NEON = True
except ImportError:
    HAS_NEON = False
    print('[v0] neon_serverless not available, trying psycopg2...')

# Try import psycopg2
if not HAS_NEON:
    try:
        import psycopg2
        HAS_PSYCOPG2 = True
    except ImportError:
        HAS_PSYCOPG2 = False

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

if HAS_NEON:
    print('[v0] Using neon_serverless client...')
    try:
        conn = connect(DATABASE_URL)
        cursor = conn.cursor()
        
        total_inserted = 0
        for kelas in range(1, 13):
            subjects = SUBJECTS[kelas]
            for subject in subjects:
                for i in range(100):
                    video_id = YOUTUBE_IDS[(kelas * 10 + i) % len(YOUTUBE_IDS)]
                    title = f'{subject} Kelas {kelas} - Video {i + 1}'
                    description = f'Materi pembelajaran {subject} untuk kelas {kelas}'
                    thumbnail = f'https://i.ytimg.com/vi/{video_id}/default.jpg'
                    
                    try:
                        cursor.execute(
                            'INSERT INTO videos (videoid, title, description, thumbnail, category, subject, kelas, createdat) VALUES (%s, %s, %s, %s, %s, %s, %s, NOW())',
                            (video_id, title, description, thumbnail, 'SD', subject, kelas)
                        )
                        total_inserted += 1
                    except:
                        pass  # Skip duplicates
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print(f'[v0] ✓ Inserted {total_inserted} videos via neon!')
        exit(0)
    except Exception as e:
        print(f'[v0] neon_serverless error: {e}')

elif HAS_PSYCOPG2:
    print('[v0] Using psycopg2 client...')
    try:
        import psycopg2
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()
        
        total_inserted = 0
        for kelas in range(1, 13):
            subjects = SUBJECTS[kelas]
            for subject in subjects:
                for i in range(100):
                    video_id = YOUTUBE_IDS[(kelas * 10 + i) % len(YOUTUBE_IDS)]
                    title = f'{subject} Kelas {kelas} - Video {i + 1}'
                    description = f'Materi pembelajaran {subject} untuk kelas {kelas}'
                    thumbnail = f'https://i.ytimg.com/vi/{video_id}/default.jpg'
                    
                    try:
                        cursor.execute(
                            'INSERT INTO videos (videoid, title, description, thumbnail, category, subject, kelas, createdat) VALUES (%s, %s, %s, %s, %s, %s, %s, NOW())',
                            (video_id, title, description, thumbnail, 'SD', subject, kelas)
                        )
                        total_inserted += 1
                    except:
                        pass  # Skip duplicates
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print(f'[v0] ✓ Inserted {total_inserted} videos via psycopg2!')
        exit(0)
    except Exception as e:
        print(f'[v0] psycopg2 error: {e}')

else:
    print('[v0] ERROR: No Python database client available (neon_serverless or psycopg2)')
    print('[v0] Available methods: neon_serverless=' + str(HAS_NEON) + ', psycopg2=' + str(HAS_PSYCOPG2))
    exit(1)

