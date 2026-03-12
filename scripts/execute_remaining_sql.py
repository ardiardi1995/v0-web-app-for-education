import random

# Generate comprehensive YouTube video data for remaining subjects
subjects_data = {
    'Biologi': {
        'topics': ['Sel dan Organisasi Sel', 'Sistem Pencernaan', 'Sistem Pernapasan', 'Sistem Sirkulasi', 'Sistem Saraf', 'Sistem Otot', 'Sistem Endokrin', 'Sistem Imun', 'Reproduksi', 'Genetika', 'Evolusi', 'Ekologi', 'Fotosintesis', 'Respirasi Sel', 'DNA dan RNA'],
        'video_ids': ['BiO1', 'BiO2', 'BiO3', 'BiO4', 'BiO5', 'BiO6', 'BiO7', 'BiO8', 'BiO9', 'BiO10']
    },
    'Kimia': {
        'topics': ['Struktur Atom', 'Tabel Periodik', 'Ikatan Kimia', 'Reaksi Kimia', 'Termodinamika', 'Kinetika Kimia', 'Keseimbangan Kimia', 'Asam Basa', 'Redoks', 'Kimia Organik', 'Polimer', 'Koloid', 'Larutan', 'Elektrokimia', 'Kesetimbangan Dinamis'],
        'video_ids': ['Chem1', 'Chem2', 'Chem3', 'Chem4', 'Chem5', 'Chem6', 'Chem7', 'Chem8', 'Chem9', 'Chem10']
    },
    'Bahasa Indonesia': {
        'topics': ['Tata Bahasa', 'Puisi dan Prosa', 'Cerpen', 'Novel', 'Drama', 'Pidato', 'Debat', 'Menulis Formal', 'Membaca Kritis', 'Analisis Teks', 'Sastra Klasik', 'Sastra Modern', 'Kamus dan Tata Kata', 'Ejaan dan Diksi', 'Apresiasi Sastra'],
        'video_ids': ['BiID1', 'BiID2', 'BiID3', 'BiID4', 'BiID5', 'BiID6', 'BiID7', 'BiID8', 'BiID9', 'BiID10']
    },
    'Bahasa Inggris': {
        'topics': ['Grammar Dasar', 'Tenses', 'Modal Verbs', 'Passive Voice', 'Conditionals', 'Speaking Skills', 'Reading Comprehension', 'Writing Essays', 'Listening Skills', 'Vocabulary', 'Pronunciation', 'Idioms and Phrases', 'Literature', 'Conversations', 'Presentation Skills'],
        'video_ids': ['BI1', 'BI2', 'BI3', 'BI4', 'BI5', 'BI6', 'BI7', 'BI8', 'BI9', 'BI10']
    },
    'Pendidikan Pancasila': {
        'topics': ['Pancasila dan Ideologi', 'Nilai-nilai Pancasila', 'Demokrasi Indonesia', 'Hak dan Kewajiban', 'Konstitusi', 'Partisipasi Warga', 'Pluralisme', 'Integritas Nasional', 'Persatuan dan Kesatuan', 'Etika Sosial', 'Kepemimpinan', 'Toleransi Antar Agama', 'Kewarganegaraan', 'Hukum Indonesia', 'Pembangunan Berkelanjutan'],
        'video_ids': ['PP1', 'PP2', 'PP3', 'PP4', 'PP5', 'PP6', 'PP7', 'PP8', 'PP9', 'PP10']
    }
}

# Generate SQL INSERT statements
statements = []

for subject, data in subjects_data.items():
    for kelas in [9, 10]:
        values = []
        for i, vid_id in enumerate(data['video_ids']):
            topic = data['topics'][i % len(data['topics'])]
            video_id = f"{vid_id}_{kelas}_{i}"
            title = f"{subject} Kelas {kelas} - {topic} Video {i+1}"
            description = f"Pembelajaran {subject} untuk kelas {kelas} tentang {topic}"
            thumbnail = f"https://i.ytimg.com/vi/{video_id}/default.jpg"
            
            value = f"('{video_id}', '{title}', '{description}', '{thumbnail}', 'SMA', '{subject}', {kelas}, NOW())"
            values.append(value)
        
        sql = f"INSERT INTO videos (videoid, title, description, thumbnail, category, subject, kelas, createdat) VALUES {', '.join(values)} ON CONFLICT DO NOTHING;"
        statements.append(sql)

# Print statements
print(f"Generated {len(statements)} SQL INSERT statements:")
for i, stmt in enumerate(statements, 1):
    print(f"Statement {i}: {len(stmt)} characters")
    print(stmt[:100] + "...")
    print()

print(f"\nTotal INSERT statements: {len(statements)}")
print(f"Each statement will insert 10 videos")
print(f"Total videos for Kelas 9 and 10: {len(statements) * 10}")

# Output statements as JSON for Python to use
import json
print("\n[SQL_STATEMENTS]")
print(json.dumps(statements))
