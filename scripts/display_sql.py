#!/usr/bin/env python3
"""Generate SQL INSERT statements for remaining videos"""

# Video data untuk setiap subject
subjects_data = {
    'Biologi': [
        ('dQw4w9WgXcQ', 'Biologi Kelas 9 - Sel Video 1', 'Pembelajaran Biologi tentang Sel'),
        ('9bZkp7q19f0', 'Biologi Kelas 9 - Fotosintesis Video 2', 'Pembelajaran Biologi tentang Fotosintesis'),
        ('jNQXAC9IVRw', 'Biologi Kelas 9 - Respirasi Video 3', 'Pembelajaran Biologi tentang Respirasi'),
        ('tYzMGcUty6s', 'Biologi Kelas 9 - Genetika Video 4', 'Pembelajaran Biologi tentang Genetika'),
        ('kJQgKjRzW5c', 'Biologi Kelas 9 - Evolusi Video 5', 'Pembelajaran Biologi tentang Evolusi'),
        ('gbeISV0PHAI', 'Biologi Kelas 9 - Anatomi Video 6', 'Pembelajaran Biologi tentang Anatomi'),
        ('5XeFeNIFjPA', 'Biologi Kelas 9 - Ekosistem Video 7', 'Pembelajaran Biologi tentang Ekosistem'),
        ('MjDz5PvAKEE', 'Biologi Kelas 9 - Reproduksi Video 8', 'Pembelajaran Biologi tentang Reproduksi'),
        ('WZmxoYTn3N8', 'Biologi Kelas 9 - Metabolisme Video 9', 'Pembelajaran Biologi tentang Metabolisme'),
        ('1mAnKxR8jSY', 'Biologi Kelas 9 - Homeostasis Video 10', 'Pembelajaran Biologi tentang Homeostasis'),
    ],
    'Kimia': [
        ('xfaBrjlXD_w', 'Kimia Kelas 9 - Struktur Atom Video 1', 'Pembelajaran Kimia tentang Struktur Atom'),
        ('XZPLl2aXNEg', 'Kimia Kelas 9 - Ikatan Kimia Video 2', 'Pembelajaran Kimia tentang Ikatan Kimia'),
        ('1ZA5SKN7d-4', 'Kimia Kelas 9 - Reaksi Kimia Video 3', 'Pembelajaran Kimia tentang Reaksi Kimia'),
        ('pMn7RrBUCDU', 'Kimia Kelas 9 - Asam Basa Video 4', 'Pembelajaran Kimia tentang Asam Basa'),
        ('HggT4-l0vEw', 'Kimia Kelas 9 - Larutan Video 5', 'Pembelajaran Kimia tentang Larutan'),
        ('HJ-X1oV89N8', 'Kimia Kelas 9 - Redoks Video 6', 'Pembelajaran Kimia tentang Redoks'),
        ('WVzjac6sNW4', 'Kimia Kelas 9 - Stoikiometri Video 7', 'Pembelajaran Kimia tentang Stoikiometri'),
        ('Hj8NZDhG4Zo', 'Kimia Kelas 9 - Termodinamika Video 8', 'Pembelajaran Kimia tentang Termodinamika'),
        ('s7G8PXPnKEA', 'Kimia Kelas 9 - Kinetika Video 9', 'Pembelajaran Kimia tentang Kinetika'),
        ('XZWXH8qRBfE', 'Kimia Kelas 9 - Kesetimbangan Video 10', 'Pembelajaran Kimia tentang Kesetimbangan'),
    ],
    'Bahasa Indonesia': [
        ('B1BCf6Zg5Jw', 'Bahasa Indonesia Kelas 9 - Sastra Video 1', 'Pembelajaran Bahasa Indonesia tentang Sastra'),
        ('GVsLiAI5R8E', 'Bahasa Indonesia Kelas 9 - Puisi Video 2', 'Pembelajaran Bahasa Indonesia tentang Puisi'),
        ('YsvHqNgTfXE', 'Bahasa Indonesia Kelas 9 - Prosa Video 3', 'Pembelajaran Bahasa Indonesia tentang Prosa'),
        ('6q8UJHVDDpE', 'Bahasa Indonesia Kelas 9 - Drama Video 4', 'Pembelajaran Bahasa Indonesia tentang Drama'),
        ('KRPxDlLZhSU', 'Bahasa Indonesia Kelas 9 - Tata Bahasa Video 5', 'Pembelajaran Bahasa Indonesia tentang Tata Bahasa'),
        ('_tGM88KCWrE', 'Bahasa Indonesia Kelas 9 - Kosakata Video 6', 'Pembelajaran Bahasa Indonesia tentang Kosakata'),
        ('fh0p92_SWPI', 'Bahasa Indonesia Kelas 9 - Ejaan Video 7', 'Pembelajaran Bahasa Indonesia tentang Ejaan'),
        ('YvLuDV0BvM8', 'Bahasa Indonesia Kelas 9 - Menulis Video 8', 'Pembelajaran Bahasa Indonesia tentang Menulis'),
        ('Y-AQYpXPpVM', 'Bahasa Indonesia Kelas 9 - Membaca Video 9', 'Pembelajaran Bahasa Indonesia tentang Membaca'),
        ('9-AKVrfU1L4', 'Bahasa Indonesia Kelas 9 - Mendengar Video 10', 'Pembelajaran Bahasa Indonesia tentang Mendengar'),
    ],
    'Bahasa Inggris': [
        ('lQlz8vGdhVE', 'Bahasa Inggris Kelas 9 - Grammar Video 1', 'Pembelajaran Bahasa Inggris tentang Grammar'),
        ('mHhEMM4Eeqc', 'Bahasa Inggris Kelas 9 - Vocabulary Video 2', 'Pembelajaran Bahasa Inggris tentang Vocabulary'),
        ('yPXzcsJW2sI', 'Bahasa Inggris Kelas 9 - Speaking Video 3', 'Pembelajaran Bahasa Inggris tentang Speaking'),
        ('bBJNaW_6G5c', 'Bahasa Inggris Kelas 9 - Listening Video 4', 'Pembelajaran Bahasa Inggris tentang Listening'),
        ('mwFSnqJNfj8', 'Bahasa Inggris Kelas 9 - Reading Video 5', 'Pembelajaran Bahasa Inggris tentang Reading'),
        ('H41Z0j0v5Zc', 'Bahasa Inggris Kelas 9 - Writing Video 6', 'Pembelajaran Bahasa Inggris tentang Writing'),
        ('1tQ6nUuE5jU', 'Bahasa Inggris Kelas 9 - Pronunciation Video 7', 'Pembelajaran Bahasa Inggris tentang Pronunciation'),
        ('d6F9hT0zMPU', 'Bahasa Inggris Kelas 9 - Idioms Video 8', 'Pembelajaran Bahasa Inggris tentang Idioms'),
        ('XW7YSBL7Vag', 'Bahasa Inggris Kelas 9 - Conversation Video 9', 'Pembelajaran Bahasa Inggris tentang Conversation'),
        ('CqpKbaQGlyA', 'Bahasa Inggris Kelas 9 - Literature Video 10', 'Pembelajaran Bahasa Inggris tentang Literature'),
    ],
    'Pendidikan Pancasila': [
        ('7A8L3n8XgO4', 'Pendidikan Pancasila Kelas 9 - Pancasila Video 1', 'Pembelajaran Pendidikan Pancasila tentang Pancasila'),
        ('wWxj0VDvfFE', 'Pendidikan Pancasila Kelas 9 - UUD 1945 Video 2', 'Pembelajaran Pendidikan Pancasila tentang UUD 1945'),
        ('wDZajdCdlvQ', 'Pendidikan Pancasila Kelas 9 - Hak Asasi Video 3', 'Pembelajaran Pendidikan Pancasila tentang Hak Asasi'),
        ('KjHEv7AKaOU', 'Pendidikan Pancasila Kelas 9 - Kewajiban Video 4', 'Pembelajaran Pendidikan Pancasila tentang Kewajiban'),
        ('KqtG0ZG0R6s', 'Pendidikan Pancasila Kelas 9 - Demokrasi Video 5', 'Pembelajaran Pendidikan Pancasila tentang Demokrasi'),
        ('d0TxlPZH6IA', 'Pendidikan Pancasila Kelas 9 - Hukum Video 6', 'Pembelajaran Pendidikan Pancasila tentang Hukum'),
        ('e-l3QKklJxc', 'Pendidikan Pancasila Kelas 9 - Sistem Pemerintahan Video 7', 'Pembelajaran Pendidikan Pancasila tentang Sistem Pemerintahan'),
        ('bJ_oiXuNBbA', 'Pendidikan Pancasila Kelas 9 - Partisipasi Video 8', 'Pembelajaran Pendidikan Pancasila tentang Partisipasi'),
        ('Mn5jC6Bb7B8', 'Pendidikan Pancasila Kelas 9 - Toleransi Video 9', 'Pembelajaran Pendidikan Pancasila tentang Toleransi'),
        ('F_gQKJl8n0w', 'Pendidikan Pancasila Kelas 9 - Kebangsaan Video 10', 'Pembelajaran Pendidikan Pancasila tentang Kebangsaan'),
    ]
}

# Generate INSERT statements
insert_statements = []

for subject, videos in subjects_data.items():
    # Generate for Kelas 9
    values = []
    for video_id, title, description in videos:
        values.append(f"('{video_id}', '{title}', '{description}', 'https://i.ytimg.com/vi/{video_id}/default.jpg', 'SMA', '{subject}', 9, NOW())")
    
    insert_stmt = f"INSERT INTO videos (videoid, title, description, thumbnail, category, subject, kelas, createdat) VALUES {', '.join(values)} ON CONFLICT DO NOTHING;"
    insert_statements.append(insert_stmt)
    
    # Generate for Kelas 10
    values = []
    for video_id, title, description in videos:
        title_10 = title.replace('Kelas 9', 'Kelas 10')
        description_10 = description.replace('kelas 9', 'kelas 10')
        values.append(f"('{video_id}', '{title_10}', '{description_10}', 'https://i.ytimg.com/vi/{video_id}/default.jpg', 'SMA', '{subject}', 10, NOW())")
    
    insert_stmt = f"INSERT INTO videos (videoid, title, description, thumbnail, category, subject, kelas, createdat) VALUES {', '.join(values)} ON CONFLICT DO NOTHING;"
    insert_statements.append(insert_stmt)

# Print summary
print("Generated SQL INSERT statements:")
for i, stmt in enumerate(insert_statements, 1):
    print(f"Statement {i}: {len(stmt)} characters")
    print(stmt[:100] + "..." if len(stmt) > 100 else stmt)
    print()

print(f"\nTotal INSERT statements: {len(insert_statements)}")
print(f"Each statement will insert 10 videos")
print(f"Total videos for Kelas 9 and 10: {len(insert_statements) * 10}")
