import { Client } from '@neondatabase/serverless';

export async function POST(request) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();

    // Delete all existing videos
    await client.query('DELETE FROM videos');

    // Comprehensive video data for all kelas and subjects
    const videoData = generateComprehensiveVideos();

    // Insert in batches to avoid hitting size limits
    const batchSize = 100;
    for (let i = 0; i < videoData.length; i += batchSize) {
      const batch = videoData.slice(i, i + batchSize);
      const values = batch
        .map(
          (v, idx) =>
            `('${v.videoid}', '${v.title.replace(/'/g, "''")}', '${v.description.replace(/'/g, "''")}', '${v.thumbnail}', '${v.category}', '${v.subject}', ${v.kelas}, NOW())`
        )
        .join(',');

      const query = `INSERT INTO videos (videoid, title, description, thumbnail, category, subject, kelas, createdat) VALUES ${values}`;
      await client.query(query);
    }

    return Response.json({
      success: true,
      message: `Inserted ${videoData.length} videos`,
      count: videoData.length,
    });
  } catch (error) {
    console.error('[API] Error:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error',
      },
      { status: 500 }
    );
  } finally {
    await client.end();
  }
}

function generateComprehensiveVideos() {
  const videos = [];
  let videoIndex = 1;

  // Subject mapping by kelas (as before)
  const KELAS_SUBJECTS = {
    1: ['Matematika', 'Bahasa Indonesia', 'IPA', 'IPS'],
    2: ['Matematika', 'Bahasa Indonesia', 'IPA', 'IPS'],
    3: ['Matematika', 'Bahasa Indonesia', 'IPA', 'IPS'],
    4: ['Matematika', 'Bahasa Indonesia', 'IPA', 'IPS', 'Bahasa Inggris'],
    5: ['Matematika', 'Bahasa Indonesia', 'IPA', 'IPS', 'Bahasa Inggris'],
    6: ['Matematika', 'Bahasa Indonesia', 'IPA', 'IPS', 'Bahasa Inggris'],
    7: ['Matematika', 'Fisika', 'Biologi', 'Kimia', 'Bahasa Indonesia', 'Bahasa Inggris'],
    8: ['Matematika', 'Fisika', 'Biologi', 'Kimia', 'Bahasa Indonesia', 'Bahasa Inggris'],
    9: ['Matematika', 'Fisika', 'Biologi', 'Kimia', 'Bahasa Indonesia', 'Bahasa Inggris'],
    10: ['Matematika', 'Fisika', 'Kimia', 'Biologi', 'Bahasa Inggris'],
    11: ['Matematika', 'Fisika', 'Kimia', 'Biologi', 'Bahasa Inggris'],
    12: ['Matematika', 'Fisika', 'Kimia', 'Biologi', 'Bahasa Inggris'],
  };

  // Category mapping
  const getCategory = (kelas) => {
    if (kelas <= 6) return 'SD';
    if (kelas <= 9) return 'SMP';
    return 'SMA';
  };

  // Generate 20+ videos per kelas per subject
  for (let kelas = 1; kelas <= 12; kelas++) {
    const subjects = KELAS_SUBJECTS[kelas] || [];
    const category = getCategory(kelas);

    for (const subject of subjects) {
      // Create 25 videos per subject per kelas to ensure we have enough
      for (let i = 1; i <= 25; i++) {
        const videoId = `vid_k${kelas}_${subject.toLowerCase().replace(/ /g, '')}_${i}`;
        const topicNumber = i;

        // Generate varied topics based on subject
        let topic = '';
        if (subject === 'Matematika') {
          const mathTopics = [
            'Penjumlahan',
            'Pengurangan',
            'Perkalian',
            'Pembagian',
            'Bilangan',
            'Geometri',
            'Pecahan',
            'Desimal',
            'Persentase',
            'Aljabar',
            'Statistika',
            'Probabilitas',
            'Trigonometri',
            'Integral',
            'Diferensial',
            'Matriks',
            'Vektor',
            'Fungsi',
            'Persamaan',
            'Bangun Datar',
            'Bangun Ruang',
            'Koordinat',
            'Transformasi',
            'Simetri',
            'Pengukuran',
          ];
          topic = mathTopics[(i - 1) % mathTopics.length];
        } else if (subject === 'Fisika') {
          const physicsTopics = [
            'Kinematika',
            'Dinamika',
            'Energi',
            'Momentum',
            'Gelombang',
            'Optik',
            'Termodinamika',
            'Listrik',
            'Magnet',
            'Gravitasi',
            'Fluida',
            'Mekanika',
            'Relativitas',
            'Kuantum',
            'Inti Atom',
          ];
          topic = physicsTopics[(i - 1) % physicsTopics.length];
        } else if (subject === 'Biologi') {
          const biologyTopics = [
            'Sel',
            'Jaringan',
            'Organ',
            'Sistem',
            'Genetika',
            'Evolusi',
            'Ekologi',
            'Zoologi',
            'Botani',
            'Mikrobiologi',
            'Anatomi',
            'Fisiologi',
            'Metabolisme',
            'Reproduksi',
            'Adaptasi',
          ];
          topic = biologyTopics[(i - 1) % biologyTopics.length];
        } else if (subject === 'Kimia') {
          const chemistryTopics = [
            'Atom',
            'Molekul',
            'Reaksi',
            'Asam Basa',
            'Redoks',
            'Ikatan Kimia',
            'Struktur',
            'Kesetimbangan',
            'Kinematika Kimia',
            'Elektrokimia',
            'Organik',
            'Anorganik',
            'Polimer',
            'Larutan',
            'Koloid',
          ];
          topic = chemistryTopics[(i - 1) % chemistryTopics.length];
        } else if (subject === 'Bahasa Indonesia') {
          const indonesianTopics = [
            'Membaca',
            'Menulis',
            'Mendengar',
            'Berbicara',
            'Tata Bahasa',
            'Puisi',
            'Prosa',
            'Drama',
            'Sastra',
            'Kamus',
            'Ejaan',
            'Paragraf',
            'Karya Tulis',
            'Cerpen',
            'Novel',
          ];
          topic = indonesianTopics[(i - 1) % indonesianTopics.length];
        } else if (subject === 'Bahasa Inggris') {
          const englishTopics = [
            'Grammar',
            'Vocabulary',
            'Reading',
            'Writing',
            'Speaking',
            'Listening',
            'Tenses',
            'Conditionals',
            'Modal Verbs',
            'Phrasal Verbs',
            'Pronunciation',
            'Conversation',
            'Literature',
            'Composition',
            'Idioms',
          ];
          topic = englishTopics[(i - 1) % englishTopics.length];
        }

        videos.push({
          videoid: videoId,
          title: `Kelas ${kelas} ${subject} - ${topic} Part ${topicNumber}`,
          description: `Pelajaran lengkap tentang ${topic} untuk ${subject} kelas ${kelas}. Video pembelajaran interaktif dengan penjelasan detail dan contoh soal.`,
          thumbnail: `https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg`,
          category,
          subject,
          kelas,
        });
      }
    }
  }

  return videos;
}
