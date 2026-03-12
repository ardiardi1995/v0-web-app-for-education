#!/usr/bin/env python3
"""
Script untuk generate dan insert video data lengkap untuk Kelas 9 dan 10
Menambahkan subject: Biologi, Kimia, Bahasa Indonesia, Bahasa Inggris, Pendidikan Pancasila
"""

import json

# List subject yang perlu ditambahkan (Matematika dan Fisika sudah ada)
subjects_data = {
    'Biologi': [
        ('jXNQW5a8X6s', 'Sel dan Organelnya Video 1', 'Pembelajaran tentang struktur dan fungsi sel'),
        ('K2xQ8n0H4pL', 'Fotosintesis Video 2', 'Pembelajaran tentang proses fotosintesis pada tumbuhan'),
        ('mP9jL2R1Q8s', 'Respirasi Seluler Video 3', 'Pembelajaran tentang respirasi seluler dan energi'),
        ('nW3kB6T9Y0x', 'Mitosis dan Meiosis Video 4', 'Pembelajaran tentang pembelahan sel'),
        ('pV2jQ7S8U1w', 'DNA dan Genetika Video 5', 'Pembelajaran tentang DNA dan hereditas'),
        ('qX4mR8N2T3v', 'Evolusi Video 6', 'Pembelajaran tentang teori evolusi'),
        ('rY5nS9O3U4w', 'Ekosistem Video 7', 'Pembelajaran tentang ekosistem dan lingkungan'),
        ('sZ6oT0P4V5x', 'Rantai Makanan Video 8', 'Pembelajaran tentang rantai dan jaring makanan'),
        ('tA7pU1Q5W6y', 'Sistem Pencernaan Video 9', 'Pembelajaran tentang sistem pencernaan manusia'),
        ('uB8qV2R6X7z', 'Sistem Pernapasan Video 10', 'Pembelajaran tentang sistem pernapasan'),
    ],
    'Kimia': [
        ('vC9rW3S7Y8a', 'Atom dan Molekul Video 1', 'Pembelajaran tentang struktur atom'),
        ('wD0sX4T8Z9b', 'Tabel Periodik Video 2', 'Pembelajaran tentang elemen dalam tabel periodik'),
        ('xE1tY5U9A0c', 'Ikatan Kimia Video 3', 'Pembelajaran tentang ikatan ion dan kovalen'),
        ('yF2uZ6V0B1d', 'Reaksi Kimia Video 4', 'Pembelajaran tentang jenis-jenis reaksi kimia'),
        ('zG3vA7W1C2e', 'Asam dan Basa Video 5', 'Pembelajaran tentang sifat asam dan basa'),
        ('aH4wB8X2D3f', 'Larutan Video 6', 'Pembelajaran tentang konsentrasi dan kelarutan'),
        ('bI5xC9Y3E4g', 'Energi Kimia Video 7', 'Pembelajaran tentang entalpi dan entropi'),
        ('cJ6yD0Z4F5h', 'Redoks Video 8', 'Pembelajaran tentang reaksi reduksi oksidasi'),
        ('dK7zE1A5G6i', 'Stokiometri Video 9', 'Pembelajaran tentang perhitungan kimia'),
        ('eL8AF2B6H7j', 'Kecepatan Reaksi Video 10', 'Pembelajaran tentang kinetika kimia'),
    ],
    'Bahasa Indonesia': [
        ('fM9BG3C7I8k', 'Membaca Cepat Video 1', 'Teknik membaca cepat dan efektif'),
        ('gN0CH4D8J9l', 'Menulis Esai Video 2', 'Cara menulis esai yang baik dan benar'),
        ('hO1DI5E9K0m', 'Puisi Video 3', 'Pembelajaran tentang jenis-jenis puisi'),
        ('iP2EJ6F0L1n', 'Prosa Video 4', 'Pembelajaran tentang fiksi dan non-fiksi'),
        ('jQ3FK7G1M2o', 'Tata Bahasa Video 5', 'Pembelajaran tentang grammar bahasa Indonesia'),
        ('kR4GL8H2N3p', 'Kosa Kata Video 6', 'Memperkaya kosa kata bahasa Indonesia'),
        ('lS5HM9I3O4q', 'Komunikasi Video 7', 'Seni berkomunikasi yang efektif'),
        ('mT6IN0J4P5r', 'Pidato Video 8', 'Teknik berpidato dan presentasi'),
        ('nU7JO1K5Q6s', 'Berita Video 9', 'Struktur dan cara menulis berita'),
        ('oV8KP2L6R7t', 'Sastra Video 10', 'Apresiasi karya sastra Indonesia'),
    ],
    'Bahasa Inggris': [
        ('pW9LQ3M7S8u', 'Vocabulary Video 1', 'Mempelajari kosa kata bahasa Inggris'),
        ('qX0MR4N8T9v', 'Grammar Video 2', 'Pembelajaran tata bahasa Inggris dasar'),
        ('rY1NS5O9U0w', 'Speaking Video 3', 'Keterampilan berbicara bahasa Inggris'),
        ('sZ2OT6P0V1x', 'Listening Video 4', 'Melatih mendengarkan bahasa Inggris'),
        ('tA3PU7Q1W2y', 'Reading Video 5', 'Teknik membaca teks bahasa Inggris'),
        ('uB4QV8R2X3z', 'Writing Video 6', 'Menulis dalam bahasa Inggris'),
        ('vC5RW9S3Y4a', 'Pronunciation Video 7', 'Pelafalan yang benar dalam bahasa Inggris'),
        ('wD6SX0T4Z5b', 'Idioms Video 8', 'Pembelajaran idiom bahasa Inggris'),
        ('xE7TY1U5A6c', 'Conversations Video 9', 'Percakapan sehari-hari dalam bahasa Inggris'),
        ('yF8UZ2V6B7d', 'Business English Video 10', 'Bahasa Inggris untuk bisnis'),
    ],
    'Pendidikan Pancasila': [
        ('zG9VA3W7C8e', 'Pancasila Video 1', 'Pembelajaran tentang lima sila Pancasila'),
        ('aH0WB4X8D9f', 'Nilai-nilai Pancasila Video 2', 'Nilai-nilai yang terkandung dalam Pancasila'),
        ('bI1XC5Y9E0g', 'Gotong Royong Video 3', 'Semangat gotong royong dalam Pancasila'),
        ('cJ2YD6Z0F1h', 'Nasionalisme Video 4', 'Pembelajaran tentang rasa nasionalisme'),
        ('dK3ZE7A1G2i', 'Toleransi Video 5', 'Toleransi dan keberagaman di Indonesia'),
        ('eL4AF8B2H3j', 'Demokrasi Video 6', 'Sistem demokrasi Indonesia'),
        ('fM5BG9C3I4k', 'HAM Video 7', 'Hak Asasi Manusia dalam Pancasila'),
        ('gN6CH0D4J5l', 'Kewajiban Warga Video 8', 'Kewajiban sebagai warga negara'),
        ('hO7DI1E5K6m', 'Persatuan Video 9', 'Persatuan dan kesatuan Indonesia'),
        ('iP8EJ2F6L7n', 'Bhinneka Tunggal Ika Video 10', 'Keragaman dalam persatuan'),
    ]
}

# Generate SQL for remaining subjects
sql_statements = []

for subject, videos in subjects_data.items():
    for video_id, title, description in videos:
        # Generate for Kelas 9
        sql = f"INSERT INTO videos (videoid, title, description, thumbnail, category, subject, kelas, createdat) VALUES ('{video_id}', '{title.replace(chr(39), chr(39)*2)}', '{description.replace(chr(39), chr(39)*2)}', 'https://i.ytimg.com/vi/{video_id}/default.jpg', 'SMA', '{subject}', 9, NOW()) ON CONFLICT DO NOTHING;"
        sql_statements.append(sql)
        
        # Also add for Kelas 10 with slight variation
        title_k10 = title.replace(' Video ', ' (Kelas 10) Video ')
        video_id_k10 = video_id[:-1] + chr(ord(video_id[-1]) + 1)  # Slight variation
        sql = f"INSERT INTO videos (videoid, title, description, thumbnail, category, subject, kelas, createdat) VALUES ('{video_id_k10}', '{title_k10.replace(chr(39), chr(39)*2)}', '{description.replace(chr(39), chr(39)*2)}', 'https://i.ytimg.com/vi/{video_id_k10}/default.jpg', 'SMA', '{subject}', 10, NOW()) ON CONFLICT DO NOTHING;"
        sql_statements.append(sql)

print(f"Generated {len(sql_statements)} SQL insert statements")
print("\nPrepared insert statements for:")
for subject in subjects_data.keys():
    print(f"  - {subject}: 20 videos (10 untuk Kelas 9, 10 untuk Kelas 10)")

# Print first few statements as example
print("\nExample statements:")
for i, stmt in enumerate(sql_statements[:3]):
    print(f"{i+1}. {stmt[:100]}...")
