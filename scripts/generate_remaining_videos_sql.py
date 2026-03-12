#!/usr/bin/env python3
"""
Generate SQL insert statements untuk semua remaining subject videos
untuk Kelas 9 dan 10
"""

# Data untuk masing-masing subject
subjects_data = {
    'Biologi': [
        'Sel dan Organel Video 1', 'Struktur Sel Video 2', 'Mitokondria Video 3',
        'Kloroplas Video 4', 'Ribosom Video 5', 'Reticulum Endoplasma Video 6',
        'Aparatus Golgi Video 7', 'Lisosom Video 8', 'Vakuola Video 9', 'Peroksisom Video 10',
        'Fotosintesis Video 11', 'Respirasi Sel Video 12', 'Glikolisis Video 13',
        'Siklus Krebs Video 14', 'Rantai Transportasi Elektron Video 15',
        'Pembelahan Sel Video 16', 'Mitosis Video 17', 'Meiosis Video 18',
        'Genetika Mendel Video 19', 'Penurunan Sifat Video 20', 'DNA Video 21',
        'RNA Video 22', 'Sintesis Protein Video 23', 'Mutasi Video 24',
        'Evolusi Video 25', 'Seleksi Alam Video 26', 'Spesiasi Video 27',
        'Anatomi Manusia Video 28', 'Sistem Rangka Video 29', 'Sistem Otot Video 30',
        'Sistem Saraf Video 31', 'Sistem Endokrin Video 32', 'Sistem Pencernaan Video 33',
        'Sistem Peredaran Darah Video 34', 'Sistem Pernapasan Video 35',
        'Sistem Urogenital Video 36', 'Sistem Imun Video 37', 'Fisiologi Video 38',
        'Homeostasis Video 39', 'Reproduksi Video 40', 'Perkembangan Embrio Video 41',
        'Ekologi Video 42', 'Populasi Video 43', 'Komunitas Video 44', 'Ekosistem Video 45',
        'Bioma Video 46', 'Aliran Energi Video 47', 'Daur Nutrisi Video 48',
        'Adaptasi Video 49', 'Biodiversitas Video 50'
    ],
    'Kimia': [
        'Atom dan Molekul Video 1', 'Struktur Atom Video 2', 'Elektron Video 3',
        'Proton dan Neutron Video 4', 'Nomor Atom Video 5', 'Nomor Massa Video 6',
        'Isotop Video 7', 'Isobar Video 8', 'Isoton Video 9', 'Konfigurasi Elektron Video 10',
        'Orbital Video 11', 'Subshell Video 12', 'Prinsip Aufbau Video 13',
        'Prinsip Pauli Video 14', 'Aturan Hund Video 15', 'Ikatan Kimia Video 16',
        'Ikatan Ionik Video 17', 'Ikatan Kovalen Video 18', 'Ikatan Logam Video 19',
        'Gaya Van der Waals Video 20', 'Ikatan Hidrogen Video 21', 'Mol Video 22',
        'Massa Molar Video 23', 'Stoikiometri Video 24', 'Persamaan Kimia Video 25',
        'Penyetaraan Persamaan Video 26', 'Reaksi Redoks Video 27', 'Oksidasi dan Reduksi Video 28',
        'Bilangan Oksidasi Video 29', 'Asam dan Basa Video 30', 'pH Video 31',
        'pOH Video 32', 'Titrasi Video 33', 'Buffer Video 34', 'Termodinamika Kimia Video 35',
        'Entalpi Video 36', 'Entropi Video 37', 'Energi Bebas Gibbs Video 38',
        'Kinetika Kimia Video 39', 'Kecepatan Reaksi Video 40', 'Katalis Video 41',
        'Kesetimbangan Video 42', 'Konstanta Kesetimbangan Video 43', 'Prinsip Le Chatelier Video 44',
        'Larutan Video 45', 'Konsentrasi Video 46', 'Kelarutan Video 47',
        'Tekanan Uap Video 48', 'Koloid Video 49', 'Suspensi Video 50'
    ],
    'Bahasa Indonesia': [
        'Sastra Indonesia Video 1', 'Puisi Video 2', 'Prosa Video 3',
        'Drama Video 4', 'Cerita Pendek Video 5', 'Novel Video 6',
        'Sejarah Sastra Video 7', 'Karya Klasik Video 8', 'Karya Modern Video 9',
        'Penulis Indonesia Video 10', 'Analisis Puisi Video 11', 'Analisis Prosa Video 12',
        'Tema Sastra Video 13', 'Gaya Bahasa Video 14', 'Majas Video 15',
        'Personifikasi Video 16', 'Metafora Video 17', 'Simile Video 18',
        'Metonimia Video 19', 'Sinekdoki Video 20', 'Hiperbola Video 21',
        'Tata Bahasa Video 22', 'Morfologi Video 23', 'Sintaksis Video 24',
        'Kalimat Efektif Video 25', 'Paragraf Video 26', 'Koherensi Video 27',
        'Kohesi Video 28', 'Ejaan Video 29', 'Tanda Baca Video 30',
        'Kosa Kata Video 31', 'Semantik Video 32', 'Pragmatik Video 33',
        'Fonologi Video 34', 'Pengucapan Video 35', 'Intonasi Video 36',
        'Wacana Video 37', 'Retorika Video 38', 'Argument Video 39',
        'Persuasi Video 40', 'Informasi Video 41', 'Deskripsi Video 42',
        'Narasi Video 43', 'Eksposisi Video 44', 'Laporan Video 45',
        'Surat Video 46', 'Artikel Video 47', 'Esai Video 48',
        'Kritik Video 49', 'Apresiasi Video 50'
    ],
    'Bahasa Inggris': [
        'Grammar Basics Video 1', 'Nouns Video 2', 'Pronouns Video 3',
        'Verbs Video 4', 'Adjectives Video 5', 'Adverbs Video 6',
        'Prepositions Video 7', 'Conjunctions Video 8', 'Interjections Video 9',
        'Present Tense Video 10', 'Past Tense Video 11', 'Future Tense Video 12',
        'Perfect Tense Video 13', 'Conditional Video 14', 'Passive Voice Video 15',
        'Questions Video 16', 'Negation Video 17', 'Word Order Video 18',
        'Sentence Structure Video 19', 'Clauses Video 20', 'Phrases Video 21',
        'Vocabulary Video 22', 'Synonyms Video 23', 'Antonyms Video 24',
        'Collocations Video 25', 'Idioms Video 26', 'Phrasal Verbs Video 27',
        'Listening Video 28', 'Pronunciation Video 29', 'Accent Video 30',
        'Intonation Video 31', 'Speaking Video 32', 'Conversation Video 33',
        'Formal Spoken Video 34', 'Informal Spoken Video 35', 'Reading Video 36',
        'Comprehension Video 37', 'Writing Video 38', 'Essay Writing Video 39',
        'Business Writing Video 40', 'Email Writing Video 41', 'Literature Video 42',
        'Poetry Video 43', 'Novels Video 44', 'Drama Video 45',
        'Culture Video 46', 'Customs Video 47', 'Traditions Video 48',
        'Communication Video 49', 'Intercultural Video 50'
    ],
    'Pendidikan Pancasila': [
        'Pancasila Sejarah Video 1', 'Lima Sila Video 2', 'Sila Pertama Video 3',
        'Sila Kedua Video 4', 'Sila Ketiga Video 5', 'Sila Keempat Video 6',
        'Sila Kelima Video 7', 'Makna Pancasila Video 8', 'Nilai Pancasila Video 9',
        'Implementasi Pancasila Video 10', 'Filosofi Pancasila Video 11',
        'Dasar Negara Video 12', 'Konstitusi Indonesia Video 13', 'UUD 1945 Video 14',
        'Preambuler Video 15', 'Batang Tubuh Video 16', 'Pasal-Pasal Video 17',
        'Citizenship Video 18', 'Hak dan Kewajiban Video 19', 'Demokrasi Video 20',
        'Pemerintahan Video 21', 'Sistem Politik Video 22', 'Partai Politik Video 23',
        'Pemilu Video 24', 'Legislatif Video 25', 'Eksekutif Video 26',
        'Yudikatif Video 27', 'Badan Peradilan Video 28', 'Hukum Video 29',
        'Peraturan Perundang-undangan Video 30', 'HAM Video 31', 'Kebebasan Video 32',
        'Keadilan Video 33', 'Persamaan Video 34', 'Persatuan Video 35',
        'Kesatuan Video 36', 'Toleransi Video 37', 'Keberagaman Video 38',
        'Pluralisme Video 39', 'Multikultural Video 40', 'Kebhinekaan Video 41',
        'Ekonomi Video 42', 'Sosial Video 43', 'Budaya Video 44',
        'Pendidikan Video 45', 'Kesehatan Video 46', 'Lingkungan Video 47',
        'Pembangunan Video 48', 'Etika Video 49', 'Moral Video 50'
    ]
}

# YouTube Video IDs (akan dirotasi)
video_ids = [
    'dQw4w9WgXcQ', '9bZkp7q19f0', 'jNQXAC9IVRw', 'tYzMGcUty6s', 'kJQgKjRzW5c',
    'gbeISV0PHAI', '5XeFeNIFjPA', 'MjDz5PvAKEE', 'WZmxoYTn3N8', '1mAnKxR8jSY',
    'xfaBrjlXD_w', 'XZPLl2aXNEg', '1ZA5SKN7d-4', 'pMn7RrBUCDU', 'HggT4-l0vEw',
    'HJ-X1oV89N8', 'WVzjac6sNW4', 'Hj8NZDhG4Zo', 's7G8PXPnKEA', 'XZWXH8qRBfE',
]

def escape_sql_string(s):
    """Escape SQL string"""
    return s.replace("'", "''")

def generate_insert_statements():
    """Generate INSERT statements untuk semua subject"""
    all_statements = []
    video_id_index = 0
    
    for subject, titles in subjects_data.items():
        for kelas in [9, 10]:
            insert_values = []
            
            for i, title in enumerate(titles, 1):
                video_id = video_ids[video_id_index % len(video_ids)]
                video_id_index += 1
                
                escaped_title = escape_sql_string(f"{subject} Kelas {kelas} - {title}")
                escaped_desc = escape_sql_string(f"Pembelajaran {subject} untuk kelas {kelas}")
                thumbnail = f"https://i.ytimg.com/vi/{video_id}/default.jpg"
                
                insert_values.append(
                    f"('{video_id}', '{escaped_title}', '{escaped_desc}', '{thumbnail}', 'SMA', '{subject}', {kelas}, NOW())"
                )
            
            # Buat INSERT statement per subject-kelas
            insert_stmt = f"INSERT INTO videos (videoid, title, description, thumbnail, category, subject, kelas, createdat) VALUES " + ", ".join(insert_values) + " ON CONFLICT DO NOTHING;"
            all_statements.append(insert_stmt)
    
    return all_statements

def main():
    print("=" * 80)
    print("GENERATING SQL INSERT STATEMENTS FOR REMAINING VIDEOS")
    print("=" * 80)
    
    statements = generate_insert_statements()
    
    print(f"\nTotal INSERT statements generated: {len(statements)}")
    print(f"Total videos to be inserted: {sum(len(titles) * 2 for titles in subjects_data.values())}")
    
    print("\n" + "=" * 80)
    print("GENERATING COMBINED SQL FILE")
    print("=" * 80)
    
    # Gabungkan semua statements
    combined_sql = "\n\n".join(statements)
    
    # Simpan ke file
    output_file = "/vercel/share/v0-project/scripts/remaining_videos_insert.sql"
    with open(output_file, 'w') as f:
        f.write(combined_sql)
    
    print(f"\nSQL file saved to: {output_file}")
    print(f"File size: {len(combined_sql):,} characters")
    
    # Print ringkasan
    print("\n" + "=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print(f"Subjects: {', '.join(subjects_data.keys())}")
    print(f"Kelas: 9, 10")
    print(f"Videos per subject per kelas: 50")
    print(f"Total videos: {sum(len(titles) * 2 for titles in subjects_data.values())}")
    print(f"\nReady to insert! Use neon_run_sql_transaction to execute.")

if __name__ == "__main__":
    main()
