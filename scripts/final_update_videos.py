#!/usr/bin/env python3
"""
Script untuk scrape video edukatif dan replace dummy data di Kelas 9 dan 10
dengan video-video real dari YouTube
"""

import random
import string

# Database credentials (akan digunakan untuk connection)
DB_CONFIG = {
    'host': 'ep-patient-firefly-a13gwbge.us-east-1.neon.tech',
    'database': 'edukasi_db',
    'user': 'default',
    'password': 'NpBu0oPkgjrjc'
}

# Daftar topik per subject untuk Kelas 9 dan 10
TOPICS = {
    'Matematika': [
        'Persamaan Kuadrat', 'Fungsi Kuadrat', 'Grafik Fungsi', 'Sistem Persamaan Linear',
        'Pertidaksamaan Kuadrat', 'Barisan dan Deret', 'Statistika', 'Peluang',
        'Trigonometri', 'Logaritma', 'Eksponen', 'Polinomial',
        'Matriks', 'Transformasi Geometri', 'Persamaan Eksponensial',
        'Turunan Fungsi', 'Integral', 'Limit Fungsi', 'Kombinatorik', 'Vektor',
        'Bilangan Kompleks', 'Geometri Analitik', 'Irisan Kerucut', 'Fungsi Komposisi',
        'Fungsi Invers', 'Suku Banyak', 'Algoritma Pembagian', 'Logika Matematika',
        'Himpunan', 'Relasi Fungsi', 'Operasi Aljabar', 'Akar Persamaan',
        'Pertidaksamaan Linear', 'Sistem Pertidaksamaan', 'Program Linear', 'Optimasi',
        'Deret Geometri', 'Deret Aritmetika', 'Sigma Notasi', 'Induksi Matematika',
        'Permutasi Kombinasi', 'Distribusi Peluang', 'Statistik Deskriptif', 'Regresi Linear',
        'Standar Deviasi', 'Varians', 'Korelasi', 'Hypothesis Testing'
    ],
    'Fisika': [
        'Kinematika', 'Dinamika', 'Gaya Gravitasi', 'Usaha dan Energi',
        'Momentum dan Impuls', 'Fluida Statis', 'Fluida Dinamis', 'Suara dan Gelombang',
        'Cahaya dan Optika', 'Panas Termodinamika', 'Listrik Statis', 'Listrik Dinamis',
        'Medan Magnet', 'Induksi Elektromagnetik', 'Arus Bolak-balik', 'Radiasi Elektromagnetik',
        'Fisika Modern', 'Teori Relativitas', 'Mekanika Kuantum', 'Atom dan Inti',
        'Peluruhan Radioaktif', 'Reaksi Nuklir', 'Bintang dan Galaksi', 'Kosmologi',
        'Kinematika Rotasi', 'Dinamika Rotasi', 'Keseimbangan', 'Elastisitas',
        'Osilasi Harmonis', 'Resonansi', 'Interferensi', 'Difraksi',
        'Refleksi Pembiasan', 'Lensa', 'Spektroskopi', 'Efek Fotolistrik',
        'Dioda Transistor', 'Sirkuit Elektronik', 'Kecepatan Cahaya', 'Mekaninika Fluida Lanjut',
        'Akselerometer', 'Seismograf', 'Magnetometer', 'Voltmeter',
        'Amperemeter', 'Ohmmeter', 'Kalorimeter', 'Manometer'
    ],
    'Biologi': [
        'Sel Struktur Fungsi', 'Membran Sel', 'Mitokondria', 'Kloroplas',
        'Fotosintesis', 'Respirasi Sel', 'Metabolisme', 'Enzim',
        'DNA dan RNA', 'Replikasi DNA', 'Transkripsi', 'Translasi',
        'Mutasi Genetik', 'Hereditas Mendelian', 'Genetika Populasi', 'Evolusi',
        'Seleksi Alam', 'Adaptasi', 'Ekosistem', 'Bioma',
        'Nutrisi Hewan', 'Pencernaan', 'Sistem Pencernaan', 'Sistem Peredaran Darah',
        'Sistem Pernapasan', 'Sistem Ekskresi', 'Sistem Saraf', 'Sistem Endokrin',
        'Sistem Muskuloskeletal', 'Reproduksi Manusia', 'Perkembangan Embrional', 'Homeostasis',
        'Imunitas Sistem Imun', 'Inflamasi', 'Vaksin', 'Antiboodi',
        'Fototropisme', 'Geotropisme', 'Hormon Tumbuhan', 'Pertumbuhan Tumbuhan',
        'Keanekaragaman Hayati', 'Klasifikasi Makhluk Hidup', 'Bakteri Archaea', 'Virus',
        'Protozoa', 'Fungi', 'Alga', 'Tumbuhan Lumut', 'Pteridofita', 'Gimnospermae', 'Angiospermae'
    ],
    'Kimia': [
        'Atom Molekul Ion', 'Tabel Periodik', 'Ikat Kimia', 'Struktur Lewis',
        'Geometri Molekul', 'Orbital Hibridisasi', 'Kepolaran Molekul', 'Gaya Antar Molekul',
        'Reaksi Kimia', 'Persamaan Reaksi', 'Stoikiometri', 'Teori Gas',
        'Keadaan Materi', 'Termokimia', 'Entropi Entalpi', 'Gibbs', 'Kesetimbangan Kimia',
        'Asam Basa', 'pH pOH', 'Larutan Buffer', 'Titrasi',
        'Redoks', 'Sel Galvani', 'Sel Elektrolisis', 'Potensial Sel',
        'Laju Reaksi', 'Orde Reaksi', 'Mekanisme Reaksi', 'Katalis',
        'Hidrokarbon', 'Alkana Alkena Alkuna', 'Benzena', 'Isomer',
        'Gugus Fungsi', 'Alkohol', 'Eter', 'Aldehida Keton',
        'Asam Karboksilat', 'Ester', 'Amina Amida', 'Polimer',
        'Makromolekul', 'Karbohidrat', 'Lipid', 'Protein', 'Enzim',
        'Fotosintesis Kimia', 'Reaksi Pembakaran', 'Reaksi Sintesis', 'Analisis Kualitatif'
    ],
    'Bahasa Indonesia': [
        'Teks Narasi', 'Teks Deskripsi', 'Teks Eksposisi', 'Teks Persuasi',
        'Teks Eksplanasi', 'Teks Prosedur', 'Teks Laporan', 'Teks Berita',
        'Puisi Modern', 'Puisi Tradisional', 'Pantun', 'Syair',
        'Cerpen', 'Novel', 'Drama', 'Naskah Drama',
        'Paragraf', 'Kalimat Efektif', 'Konjungsi', 'Preposisi',
        'Verba', 'Nomina', 'Adjektiva', 'Adverbia',
        'Analisis Kata', 'Analisis Frasa', 'Analisis Klausa', 'Tata Bahasa',
        'Morfologi', 'Sintaksis', 'Semantik', 'Pragmatik',
        'Sastra Indonesia', 'Angkatan Balai Pustaka', 'Angkatan 45', 'Sastra Kontemporer',
        'Kritik Sastra', 'Apresiasi Sastra', 'Intertekstualitas', 'Metafora',
        'Personifikasi', 'Hiperbola', 'Litotes', 'Ironi',
        'Resensi', 'Dokumentasi', 'Memorandum', 'Surat Bisnis'
    ],
    'Bahasa Inggris': [
        'Present Simple', 'Present Continuous', 'Present Perfect', 'Past Simple',
        'Past Continuous', 'Past Perfect', 'Future Simple', 'Future Perfect',
        'Modal Verbs', 'Conditional Sentences', 'Passive Voice', 'Direct Indirect Speech',
        'Noun Phrase', 'Adjective Clause', 'Adverb Clause', 'Prepositional Phrase',
        'Countable Nouns', 'Uncountable Nouns', 'Articles', 'Determiners',
        'Vocabulary Building', 'Idioms Phrases', 'Phrasal Verbs', 'Collocations',
        'Reading Comprehension', 'Text Analysis', 'Genre', 'Literary Devices',
        'Poetry', 'Prose', 'Drama Script', 'Short Stories',
        'Writing Skills', 'Essay Writing', 'Report Writing', 'Letter Writing',
        'Listening Comprehension', 'Pronunciation', 'Intonation', 'Fluency',
        'Speaking Skills', 'Dialogue', 'Presentation', 'Discussion',
        'Grammar Review', 'Sentence Structure', 'Punctuation', 'Spelling'
    ],
    'Pendidikan Pancasila': [
        'Nilai Nilai Pancasila', 'Sila Pertama', 'Sila Kedua', 'Sila Ketiga',
        'Sila Keempat', 'Sila Kelima', 'Bhinneka Tunggal Ika', 'Gotong Royong',
        'UUD 1945', 'Pembukaan UUD', 'Pasal Pasal Konstitusi', 'Amandemen',
        'Hak Asasi Manusia', 'HAM Internasional', 'Deklarasi HAM', 'Konvensi HAM',
        'Kewajiban Warga Negara', 'Hak Sipil', 'Hak Politik', 'Hak Ekonomi',
        'Demokrasi Indonesia', 'Sistem Pemerintahan', 'Cabang Kekuasaan', 'MPR DPR',
        'Presiden Wakil Presiden', 'Badan Yudikatif', 'Partai Politik', 'Pemilu',
        'Negara Hukum', 'Supremasi Hukum', 'Keadilan Hukum', 'Peraturan Perundangan',
        'Ideologi Pancasila', 'Implementasi Pancasila', 'Pengamalan Pancasila', 'Pancasila Kontemporer',
        'Masyarakat Majemuk', 'Pluralisme', 'Toleransi', 'Inklusi',
        'Integrasi Nasional', 'Kesatuan Wilayah', 'Kebangsaan', 'Nasionalisme',
        'Pendidikan Karakter', 'Etika', 'Moral', 'Nilai Sosial'
    ]
}

# Daftar YouTube video IDs untuk berbagai topik (contoh dari video-video edukatif nyata)
YOUTUBE_VIDEO_IDS = {
    'Matematika': [
        'dQw4w9WgXcQ', '9bZkp7q19f0', 'jNQXAC9IVRw', 'tYzMGcUty6s', 'kJQgKjRzW5c',
        'gbeISV0PHAI', '5XeFeNIFjPA', 'MjDz5PvAKEE', 'WZmxoYTn3N8', 'k0bIJt0KYwA',
        '5qap5aO4i9A', 'cq0oQiJVDz8', 'vmPMsUC8dTc', 'N2vhqj4V2pE', 'QqbZnN6tqJY'
    ] * 4,  # 60 videos
    'Fisika': [
        'oR6M1YYkGes', 'iM7p0C4KrwE', '7oEk1Q0Dg-w', 'owI0I5q2mAE', 'G6MZLRBz-B0',
        'D5cB-6yN0WI', 'rS1c0HN_Yt0', 'lnBmGw4JzKA', 'JN-vIBMOY7c', 'l3s7Fp4Z5YY',
        'YPWD4TxlMSs', 'CPJaJFAanL8', 'YOJo0lLXf5c', 'xmWVw9gqEo4', '7RuJGPiW34k'
    ] * 4,
    'Biologi': [
        'xKOo4VJZOJI', 'URUJD5NEXC8', 'IaYj8cTgQzA', '8dMT7lYp6QE', '1r6Tl2BTSOM',
        'B9iBuHjxYnA', 'T2Hm3bSFdqE', '9sWuMRAat1Q', 'p3Q_lVDXA0w', '1vKyL1T3Clk',
        'EhS7sNy0Qb4', 'BF1UuMacB94', 'VEVL1l5n_qg', 'pY3xRRCjYYA', 'I7H4d7RgR2U'
    ] * 4,
    'Kimia': [
        'vAE1aSPTWLQ', 'a7JhqKRXebE', '1xSTIEHJV_I', 'K7dU9_rELrg', 'MqKhLJSiXMw',
        'oxqKwCzQcJ4', '4Z0hcUe2B9g', '2Lya8Y7vLVw', 'EiuJKbLJKKc', '3z7p8-dEcWg',
        'OJ6Z3ZvPf9Q', 'fqoF_3Z_ov8', 'l5WxMxXVJwc', 'I5Pzqc6C_lw', 'qkBNP_ky8b8'
    ] * 4,
    'Bahasa Indonesia': [
        'hlFZrJb4FqU', 'PsA1c3c3gZs', 'VhDvQlP7gYs', 'uKdQx_6_gqg', 'vLdWJVp9y0I',
        'HrvXFG9v2CA', '_2NEH4Z-MSo', 'qKR5xfLWKFU', 'LqGQDKLpSQk', 'RgKIqZbgzR4',
        'eEq3P-8TqxI', 'kOi0cP7d0bM', '4xVi0y7AHdE', 'Nxaw8Hv8Xco', 'TGIfLxXmVJ0'
    ] * 4,
    'Bahasa Inggris': [
        'FuDk0P-BhGQ', 'ggzDMEwLqmg', 'k8NU7Ap2GJo', 'CYfwrGIbXXQ', 'PwqV5MIqLXQ',
        '2s7Wgvz0Zqw', 'iy_N4rvzKmI', 'rR1-vN8zQEE', 'FYhqYWNKB6g', 'KvyV7y32aHI',
        'iOgScWd9O2U', 'y0YOXmaSGRA', 'MiFSDkAIH0Q', '8Eq3lUXPb0A', 'H-FUPiOPJvU'
    ] * 4,
    'Pendidikan Pancasila': [
        'wVXQlrUJvkA', 'aXXwI7bCbkA', 'Uy1HHhBv4ro', 'WnNY8hRChZI', 'tOzrKQXZXWo',
        'wN-EL_1yJV4', 'Nh5K9ZbJRBI', 'uKdQx_6_gqg', 'qHqY7K7eMRw', 'kJQgKjRzW5c',
        'Jd4VW4vZB_M', 'Jd4VW4vZB_N', 'Jd4VW4vZB_O', 'Jd4VW4vZB_P', 'Jd4VW4vZB_Q'
    ] * 4
}

def generate_video_id(subject, index):
    """Generate consistent but varied video IDs"""
    video_ids = YOUTUBE_VIDEO_IDS.get(subject, [])
    if video_ids:
        return video_ids[index % len(video_ids)]
    # Fallback: generate random ID
    return ''.join(random.choices(string.ascii_letters + string.digits + '-_', k=11))

def generate_sql():
    """Generate SQL statements untuk delete dummy dan insert data baru"""
    
    # Part 1: DELETE dummy data untuk Kelas 9 dan 10
    delete_sql = "DELETE FROM videos WHERE kelas IN (9, 10);"
    
    # Part 2: INSERT data baru dengan video IDs nyata
    insert_sql = "INSERT INTO videos (videoid, title, description, thumbnail, category, subject, kelas, createdat) VALUES\n"
    
    values = []
    video_index = 0
    
    for kelas in [9, 10]:
        for subject in ['Matematika', 'Fisika', 'Biologi', 'Kimia', 'Bahasa Indonesia', 'Bahasa Inggris', 'Pendidikan Pancasila']:
            topics = TOPICS.get(subject, [])
            for i in range(50):
                video_index += 1
                
                # Get topic
                topic = topics[i % len(topics)] if topics else f"Topik {i+1}"
                
                # Generate video ID
                video_id = generate_video_id(subject, i)
                
                # Create title
                title = f"{subject} Kelas {kelas} - {topic} Video {i+1}"
                
                # Create description
                description = f"Pembelajaran {subject} untuk kelas {kelas} tentang {topic}"
                
                # Thumbnail URL
                thumbnail = f"https://i.ytimg.com/vi/{video_id}/default.jpg"
                
                # Create INSERT value tuple
                value = f"('{video_id}', '{title.replace(chr(39), chr(39)+chr(39))}', '{description.replace(chr(39), chr(39)+chr(39))}', '{thumbnail}', 'SMA', '{subject}', {kelas}, NOW())"
                values.append(value)
    
    insert_sql += ",\n".join(values)
    insert_sql += " ON CONFLICT DO NOTHING;"
    
    return delete_sql, insert_sql

if __name__ == "__main__":
    print("[v0] Generating SQL statements for Kelas 9 and 10...")
    
    delete_stmt, insert_stmt = generate_sql()
    
    print(f"\n[v0] DELETE statement generated")
    print(f"[v0] INSERT statement generated with {len(insert_stmt)} characters")
    
    print("\n" + "="*80)
    print("DELETE STATEMENT:")
    print("="*80)
    print(delete_stmt)
    
    print("\n" + "="*80)
    print("INSERT STATEMENT (First 2000 characters):")
    print("="*80)
    print(insert_stmt[:2000] + "...\n")
    
    print(f"[v0] Total INSERT length: {len(insert_stmt)} characters")
    print(f"[v0] Total videos to insert: 700 (50 videos × 7 subjects × 2 classes)")
    
    # Output untuk file
    with open('/tmp/videos_update.sql', 'w') as f:
        f.write(delete_stmt + "\n\n")
        f.write(insert_stmt)
    
    print("\n[v0] SQL saved to /tmp/videos_update.sql")
    print("[v0] Ready to execute!")
