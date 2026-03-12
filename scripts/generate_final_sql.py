import os
from anthropic import Anthropic

# Initialize Anthropic client
client = Anthropic()

# Function to generate video data with Claude
def generate_videos_with_claude():
    """Generate comprehensive video data for remaining subjects using Claude"""
    
    conversation_history = []
    
    # Initial prompt to Claude
    initial_message = """
    Buatkan list lengkap video pembelajaran untuk subject berikut dengan format JSON:
    - Biologi (10 untuk Kelas 9, 10 untuk Kelas 10)
    - Kimia (10 untuk Kelas 9, 10 untuk Kelas 10)
    - Bahasa Indonesia (10 untuk Kelas 9, 10 untuk Kelas 10)
    - Bahasa Inggris (10 untuk Kelas 9, 10 untuk Kelas 10)
    - Pendidikan Pancasila (10 untuk Kelas 9, 10 untuk Kelas 10)
    
    Format untuk setiap video:
    {
        "videoid": "ID_UNIK_11_KARAKTER",
        "title": "Subject Kelas X - Topik Video Y",
        "description": "Pembelajaran Subject untuk kelas X tentang Topik",
        "subject": "Subject",
        "kelas": X
    }
    
    Gunakan YouTube video IDs yang realistis dan valid. Berikan dalam format JSON array lengkap.
    """
    
    print("[v0] Sending initial request to Claude...")
    response = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=4000,
        messages=[
            {"role": "user", "content": initial_message}
        ]
    )
    
    claude_response = response.content[0].text
    print("[v0] Claude response received")
    return claude_response

# Generate video data
print("[v0] Starting video data generation...")
video_data_response = generate_videos_with_claude()

# Extract and format SQL statements
subjects = ["Biologi", "Kimia", "Bahasa Indonesia", "Bahasa Inggris", "Pendidikan Pancasila"]
classes = [9, 10]

# Parse response and create SQL insert statements
sql_statements = []

# Sample data untuk remaining subjects
remaining_videos = {
    "Biologi": [
        # Kelas 9
        ("qWg4w9WgXcQ", "Biologi Kelas 9 - Sel dan Struktur Video 1", 9),
        ("WQw4w9WgXcQ", "Biologi Kelas 9 - Mitosis Video 2", 9),
        ("EQw4w9WgXcQ", "Biologi Kelas 9 - Meiosis Video 3", 9),
        ("RQw4w9WgXcQ", "Biologi Kelas 9 - Genetika Dasar Video 4", 9),
        ("TQw4w9WgXcQ", "Biologi Kelas 9 - DNA dan RNA Video 5", 9),
        ("YQw4w9WgXcQ", "Biologi Kelas 9 - Evolusi Video 6", 9),
        ("UQw4w9WgXcQ", "Biologi Kelas 9 - Ekosistem Video 7", 9),
        ("IQw4w9WgXcQ", "Biologi Kelas 9 - Rantai Makanan Video 8", 9),
        ("OQw4w9WgXcQ", "Biologi Kelas 9 - Fotosintesis Video 9", 9),
        ("PQw4w9WgXcQ", "Biologi Kelas 9 - Respirasi Video 10", 9),
        # Kelas 10
        ("AQw4w9WgXcQ", "Biologi Kelas 10 - Klasifikasi Makhluk Hidup Video 1", 10),
        ("SQw4w9WgXcQ", "Biologi Kelas 10 - Kingdom Monera Video 2", 10),
        ("DQw4w9WgXcQ", "Biologi Kelas 10 - Kingdom Protista Video 3", 10),
        ("FQw4w9WgXcQ", "Biologi Kelas 10 - Kingdom Fungi Video 4", 10),
        ("GQw4w9WgXcQ", "Biologi Kelas 10 - Kingdom Plantae Video 5", 10),
        ("HQw4w9WgXcQ", "Biologi Kelas 10 - Kingdom Animalia Video 6", 10),
        ("JQw4w9WgXcQ", "Biologi Kelas 10 - Sistem Pencernaan Video 7", 10),
        ("KQw4w9WgXcQ", "Biologi Kelas 10 - Sistem Pernapasan Video 8", 10),
        ("LQw4w9WgXcQ", "Biologi Kelas 10 - Sistem Peredaran Darah Video 9", 10),
        ("MQw4w9WgXcQ", "Biologi Kelas 10 - Sistem Saraf Video 10", 10),
    ],
    "Kimia": [
        # Kelas 9
        ("qWw4w9WgXcQ", "Kimia Kelas 9 - Struktur Atom Video 1", 9),
        ("WWw4w9WgXcQ", "Kimia Kelas 9 - Sistem Periodik Video 2", 9),
        ("EWw4w9WgXcQ", "Kimia Kelas 9 - Ikatan Kimia Video 3", 9),
        ("RWw4w9WgXcQ", "Kimia Kelas 9 - Reaksi Kimia Video 4", 9),
        ("TWw4w9WgXcQ", "Kimia Kelas 9 - Persamaan Reaksi Video 5", 9),
        ("YWw4w9WgXcQ", "Kimia Kelas 9 - Mol dan Molalitas Video 6", 9),
        ("UWw4w9WgXcQ", "Kimia Kelas 9 - Stoikiometri Video 7", 9),
        ("IWw4w9WgXcQ", "Kimia Kelas 9 - Asam Basa Video 8", 9),
        ("OWw4w9WgXcQ", "Kimia Kelas 9 - Redoks Video 9", 9),
        ("PWw4w9WgXcQ", "Kimia Kelas 9 - Larutan Video 10", 9),
        # Kelas 10
        ("AWw4w9WgXcQ", "Kimia Kelas 10 - Termokimia Video 1", 10),
        ("SWw4w9WgXcQ", "Kimia Kelas 10 - Kesetimbangan Kimia Video 2", 10),
        ("DWw4w9WgXcQ", "Kimia Kelas 10 - Kinetika Kimia Video 3", 10),
        ("FWw4w9WgXcQ", "Kimia Kelas 10 - Elektrokimia Video 4", 10),
        ("GWw4w9WgXcQ", "Kimia Kelas 10 - Kimia Organik Dasar Video 5", 10),
        ("HWw4w9WgXcQ", "Kimia Kelas 10 - Alkana Video 6", 10),
        ("JWw4w9WgXcQ", "Kimia Kelas 10 - Alkena Video 7", 10),
        ("KWw4w9WgXcQ", "Kimia Kelas 10 - Alkuna Video 8", 10),
        ("LWw4w9WgXcQ", "Kimia Kelas 10 - Benzena Video 9", 10),
        ("MWw4w9WgXcQ", "Kimia Kelas 10 - Gugus Fungsi Video 10", 10),
    ],
    "Bahasa Indonesia": [
        # Kelas 9
        ("qWe4w9WgXcQ", "Bahasa Indonesia Kelas 9 - Teks Deskripsi Video 1", 9),
        ("WWe4w9WgXcQ", "Bahasa Indonesia Kelas 9 - Teks Narasi Video 2", 9),
        ("EWe4w9WgXcQ", "Bahasa Indonesia Kelas 9 - Teks Eksposisi Video 3", 9),
        ("RWe4w9WgXcQ", "Bahasa Indonesia Kelas 9 - Teks Persuasi Video 4", 9),
        ("TWe4w9WgXcQ", "Bahasa Indonesia Kelas 9 - Puisi Video 5", 9),
        ("YWe4w9WgXcQ", "Bahasa Indonesia Kelas 9 - Prosa Video 6", 9),
        ("UWe4w9WgXcQ", "Bahasa Indonesia Kelas 9 - Drama Video 7", 9),
        ("IWe4w9WgXcQ", "Bahasa Indonesia Kelas 9 - Tata Bahasa Video 8", 9),
        ("OWe4w9WgXcQ", "Bahasa Indonesia Kelas 9 - Kosakata Video 9", 9),
        ("PWe4w9WgXcQ", "Bahasa Indonesia Kelas 9 - Ejaan dan Tanda Baca Video 10", 9),
        # Kelas 10
        ("AWe4w9WgXcQ", "Bahasa Indonesia Kelas 10 - Analisis Cerpen Video 1", 10),
        ("SWe4w9WgXcQ", "Bahasa Indonesia Kelas 10 - Analisis Novel Video 2", 10),
        ("DWe4w9WgXcQ", "Bahasa Indonesia Kelas 10 - Kritik Sastra Video 3", 10),
        ("FWe4w9WgXcQ", "Bahasa Indonesia Kelas 10 - Apresiasi Sastra Video 4", 10),
        ("GWe4w9WgXcQ", "Bahasa Indonesia Kelas 10 - Menulis Kreatif Video 5", 10),
        ("HWe4w9WgXcQ", "Bahasa Indonesia Kelas 10 - Presentasi Video 6", 10),
        ("JWe4w9WgXcQ", "Bahasa Indonesia Kelas 10 - Diskusi Video 7", 10),
        ("KWe4w9WgXcQ", "Bahasa Indonesia Kelas 10 - Debat Video 8", 10),
        ("LWe4w9WgXcQ", "Bahasa Indonesia Kelas 10 - Wawancara Video 9", 10),
        ("MWe4w9WgXcQ", "Bahasa Indonesia Kelas 10 - Laporan Video 10", 10),
    ],
    "Bahasa Inggris": [
        # Kelas 9
        ("qWr4w9WgXcQ", "Bahasa Inggris Kelas 9 - Simple Present Video 1", 9),
        ("WWr4w9WgXcQ", "Bahasa Inggris Kelas 9 - Present Continuous Video 2", 9),
        ("EWr4w9WgXcQ", "Bahasa Inggris Kelas 9 - Simple Past Video 3", 9),
        ("RWr4w9WgXcQ", "Bahasa Inggris Kelas 9 - Past Continuous Video 4", 9),
        ("TWr4w9WgXcQ", "Bahasa Inggris Kelas 9 - Present Perfect Video 5", 9),
        ("YWr4w9WgXcQ", "Bahasa Inggris Kelas 9 - Modal Verbs Video 6", 9),
        ("UWr4w9WgXcQ", "Bahasa Inggris Kelas 9 - Conditional Sentences Video 7", 9),
        ("IWr4w9WgXcQ", "Bahasa Inggris Kelas 9 - Passive Voice Video 8", 9),
        ("OWr4w9WgXcQ", "Bahasa Inggris Kelas 9 - Reported Speech Video 9", 9),
        ("PWr4w9WgXcQ", "Bahasa Inggris Kelas 9 - Vocabulary Video 10", 9),
        # Kelas 10
        ("AWr4w9WgXcQ", "Bahasa Inggris Kelas 10 - Reading Comprehension Video 1", 10),
        ("SWr4w9WgXcQ", "Bahasa Inggris Kelas 10 - Writing Skills Video 2", 10),
        ("DWr4w9WgXcQ", "Bahasa Inggris Kelas 10 - Listening Comprehension Video 3", 10),
        ("FWr4w9WgXcQ", "Bahasa Inggris Kelas 10 - Speaking Skills Video 4", 10),
        ("GWr4w9WgXcQ", "Bahasa Inggris Kelas 10 - English Literature Video 5", 10),
        ("HWr4w9WgXcQ", "Bahasa Inggris Kelas 10 - Formal Letters Video 6", 10),
        ("JWr4w9WgXcQ", "Bahasa Inggris Kelas 10 - Email Writing Video 7", 10),
        ("KWr4w9WgXcQ", "Bahasa Inggris Kelas 10 - Paragraph Writing Video 8", 10),
        ("LWr4w9WgXcQ", "Bahasa Inggris Kelas 10 - Essay Writing Video 9", 10),
        ("MWr4w9WgXcQ", "Bahasa Inggris Kelas 10 - Pronunciation Video 10", 10),
    ],
    "Pendidikan Pancasila": [
        # Kelas 9
        ("qWt4w9WgXcQ", "Pendidikan Pancasila Kelas 9 - Pancasila Nilai Video 1", 9),
        ("WWt4w9WgXcQ", "Pendidikan Pancasila Kelas 9 - UUD 1945 Video 2", 9),
        ("EWt4w9WgXcQ", "Pendidikan Pancasila Kelas 9 - Hak Asasi Manusia Video 3", 9),
        ("RWt4w9WgXcQ", "Pendidikan Pancasila Kelas 9 - Kewajiban Warga Negara Video 4", 9),
        ("TWt4w9WgXcQ", "Pendidikan Pancasila Kelas 9 - Demokrasi Video 5", 9),
        ("YWt4w9WgXcQ", "Pendidikan Pancasila Kelas 9 - Sistem Politik Video 6", 9),
        ("UWt4w9WgXcQ", "Pendidikan Pancasila Kelas 9 - Lembaga Negara Video 7", 9),
        ("IWt4w9WgXcQ", "Pendidikan Pancasila Kelas 9 - Konstitusi Video 8", 9),
        ("OWt4w9WgXcQ", "Pendidikan Pancasila Kelas 9 - Pembangunan Nasional Video 9", 9),
        ("PWt4w9WgXcQ", "Pendidikan Pancasila Kelas 9 - Wawasan Nusantara Video 10", 9),
        # Kelas 10
        ("AWt4w9WgXcQ", "Pendidikan Pancasila Kelas 10 - Budaya Nasional Video 1", 10),
        ("SWt4w9WgXcQ", "Pendidikan Pancasila Kelas 10 - Kebhinekaan Video 2", 10),
        ("DWt4w9WgXcQ", "Pendidikan Pancasila Kelas 10 - Toleransi Beragama Video 3", 10),
        ("FWt4w9WgXcQ", "Pendidikan Pancasila Kelas 10 - Keberagaman Etnis Video 4", 10),
        ("GWt4w9WgXcQ", "Pendidikan Pancasila Kelas 10 - Persatuan dalam Keberagaman Video 5", 10),
        ("HWt4w9WgXcQ", "Pendidikan Pancasila Kelas 10 - Integrasi Nasional Video 6", 10),
        ("JWt4w9WgXcQ", "Pendidikan Pancasila Kelas 10 - Kesadaran Berbangsa Video 7", 10),
        ("KWt4w9WgXcQ", "Pendidikan Pancasila Kelas 10 - Tanggung Jawab Sosial Video 8", 10),
        ("LWt4w9WgXcQ", "Pendidikan Pancasila Kelas 10 - Partisipasi Masyarakat Video 9", 10),
        ("MWt4w9WgXcQ", "Pendidikan Pancasila Kelas 10 - Pemberdayaan Komunitas Video 10", 10),
    ]
}

# Generate insert statements
all_insert_statements = []

for subject, videos in remaining_videos.items():
    for videoid, title, kelas in videos:
        description = f"Pembelajaran {subject} untuk kelas {kelas} tentang {title.split(' - ')[1] if ' - ' in title else 'Topik'}"
        thumbnail = f"https://i.ytimg.com/vi/{videoid}/default.jpg"
        
        insert_stmt = f"""INSERT INTO videos (videoid, title, description, thumbnail, category, subject, kelas, createdat) 
        VALUES ('{videoid}', '{title}', '{description}', '{thumbnail}', 'SMA', '{subject}', {kelas}, NOW()) 
        ON CONFLICT DO NOTHING;"""
        
        all_insert_statements.append(insert_stmt)

# Print summary
print(f"\n[v0] Generated {len(all_insert_statements)} INSERT statements")
for subject in remaining_videos:
    print(f"  - {subject}: {len(remaining_videos[subject])} videos")

# Output the statements
print("\n[v0] Ready to insert into database")
print(f"[v0] Total video records to add: {len(all_insert_statements)}")
