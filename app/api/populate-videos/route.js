import { Client } from '@neondatabase/serverless';

// Comprehensive educational videos data for all class levels
const videosData = [
  // SD Kelas 1
  { videoid: '9bZkp7q19f0', title: 'Matematika Kelas 1 - Penjumlahan Dasar', description: 'Belajar penjumlahan untuk kelas 1 SD', category: 'SD', subject: 'Matematika' },
  { videoid: 'cq_NL0u8H7c', title: 'Bahasa Indonesia Kelas 1 - Membaca', description: 'Pembelajaran membaca kelas 1', category: 'SD', subject: 'Bahasa Indonesia' },
  
  // SD Kelas 2
  { videoid: '3WE8I3bqJ8Q', title: 'Matematika Kelas 2 - Pengurangan', description: 'Belajar pengurangan untuk kelas 2 SD', category: 'SD', subject: 'Matematika' },
  { videoid: 'oVa0h3LjFv8', title: 'IPA Kelas 2 - Hewan dan Tumbuhan', description: 'Pelajaran tentang hewan dan tumbuhan', category: 'SD', subject: 'IPA' },
  { videoid: 'Kg2DvWWnJiY', title: 'Matematika Kelas 3 - Perkalian', description: 'Pembelajaran perkalian kelas 3', category: 'SD', subject: 'Matematika' },
  
  // SD Kelas 4-6
  { videoid: 'oFy6G_ELn0Y', title: 'Matematika Kelas 4 - Pembagian', description: 'Pembelajaran pembagian kelas 4', category: 'SD', subject: 'Matematika' },
  { videoid: 'KxdlHd6e4Bs', title: 'IPA Kelas 5 - Sistem Tubuh Manusia', description: 'Belajar sistem tubuh manusia', category: 'SD', subject: 'IPA' },
  { videoid: 'RhvTEAXfwD4', title: 'Bahasa Indonesia Kelas 6 - Sastra', description: 'Pelajaran sastra Indonesia kelas 6', category: 'SD', subject: 'Bahasa Indonesia' },
  
  // SMP Kelas 7
  { videoid: 'MKwzjHSbIb4', title: 'Matematika SMP Kelas 7 - Aljabar Dasar', description: 'Pengantar aljabar untuk SMP', category: 'SMP', subject: 'Matematika' },
  { videoid: 'wRv6CoBV6m8', title: 'Fisika SMP Kelas 7 - Gaya dan Gerak', description: 'Belajar gaya dan gerak', category: 'SMP', subject: 'Fisika' },
  { videoid: 'EJmJ5hjmNqc', title: 'Biologi SMP Kelas 7 - Sel', description: 'Struktur dan fungsi sel', category: 'SMP', subject: 'Biologi' },
  { videoid: 'aV6HW_ZKPDA', title: 'Bahasa Inggris SMP Kelas 7 - Tenses', description: 'Belajar tenses bahasa Inggris', category: 'SMP', subject: 'Bahasa Inggris' },
  
  // SMP Kelas 8
  { videoid: 'y-hTi1nfqWo', title: 'Matematika SMP Kelas 8 - Persamaan Linier', description: 'Persamaan linier dua variabel', category: 'SMP', subject: 'Matematika' },
  { videoid: 'DZ8qFnblX2g', title: 'Fisika SMP Kelas 8 - Cahaya dan Cermin', description: 'Pembelajaran tentang cahaya dan lensa', category: 'SMP', subject: 'Fisika' },
  { videoid: '2L2g5Q_1xFw', title: 'Biologi SMP Kelas 8 - Sistem Pencernaan', description: 'Sistem pencernaan manusia', category: 'SMP', subject: 'Biologi' },
  { videoid: 'qF9rKXWBJ-I', title: 'Kimia SMP Kelas 8 - Atom dan Molekul', description: 'Dasar kimia atom dan molekul', category: 'SMP', subject: 'Kimia' },
  
  // SMP Kelas 9
  { videoid: '0xzjKnmcJIY', title: 'Matematika SMP Kelas 9 - Fungsi Kuadrat', description: 'Fungsi dan persamaan kuadrat', category: 'SMP', subject: 'Matematika' },
  { videoid: 'vVYVWM9l8WU', title: 'Fisika SMP Kelas 9 - Magnet dan Listrik', description: 'Magnet, listrik statis dan dinamis', category: 'SMP', subject: 'Fisika' },
  { videoid: 'XKYo7RV7_50', title: 'Biologi SMP Kelas 9 - Evolusi', description: 'Teori evolusi dan seleksi alam', category: 'SMP', subject: 'Biologi' },
  
  // SMA Kelas 10
  { videoid: 'xrGiYQ00aHI', title: 'Matematika SMA Kelas 10 - Trigonometri', description: 'Pengenalan trigonometri', category: 'SMA', subject: 'Matematika' },
  { videoid: 'EzT0t6VH_5s', title: 'Fisika SMA Kelas 10 - Kinematika', description: 'Gerak dan kinematika', category: 'SMA', subject: 'Fisika' },
  { videoid: 'rQhfAUnQnW0', title: 'Kimia SMA Kelas 10 - Struktur Atom', description: 'Struktur atom dan tabel periodik', category: 'SMA', subject: 'Kimia' },
  { videoid: 'yvH_lx5M7Ks', title: 'Biologi SMA Kelas 10 - Biologi Sel', description: 'Struktur dan fungsi sel', category: 'SMA', subject: 'Biologi' },
  
  // SMA Kelas 11
  { videoid: 'L6SFjXf73xo', title: 'Matematika SMA Kelas 11 - Limit', description: 'Konsep limit dalam kalkulus', category: 'SMA', subject: 'Matematika' },
  { videoid: 'B24J1mJRlBo', title: 'Fisika SMA Kelas 11 - Gelombang', description: 'Sifat dan jenis gelombang', category: 'SMA', subject: 'Fisika' },
  { videoid: 'vPPKRi0zT08', title: 'Biologi SMA Kelas 11 - Genetika', description: 'Biologi SMA - Genetika Mendelian', category: 'SMA', subject: 'Biologi' },
  { videoid: '3gJ0BygcS9Q', title: 'Kimia SMA Kelas 11 - Kesetimbangan', description: 'Reaksi kesetimbangan kimia', category: 'SMA', subject: 'Kimia' },
  
  // SMA Kelas 12
  { videoid: 'a9qT45xNGa4', title: 'Matematika SMA Kelas 12 - Integral', description: 'Integral dan aplikasinya', category: 'SMA', subject: 'Matematika' },
  { videoid: 'W_N7OPOVr2Q', title: 'Fisika SMA Kelas 12 - Relativitas', description: 'Teori relativitas Einstein', category: 'SMA', subject: 'Fisika' },
  { videoid: 'sV8u42f3XKU', title: 'Kimia SMA Kelas 12 - Termokimia', description: 'Energi dalam reaksi kimia', category: 'SMA', subject: 'Kimia' },
];

export async function POST(request) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();

    let inserted = 0;

    for (const video of videosData) {
      try {
        // Check if exists
        const check = await client.query(
          'SELECT id FROM videos WHERE videoid = $1',
          [video.videoid]
        );

        if (check.rows.length === 0) {
          // Get default thumbnail URL for YouTube
          const thumbnail = `https://i.ytimg.com/vi/${video.videoid}/maxresdefault.jpg`;
          
          await client.query(
            `INSERT INTO videos (videoid, title, description, thumbnail, category, subject, createdat, updatedat)
             VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
            [
              video.videoid,
              video.title,
              video.description,
              thumbnail,
              video.category,
              video.subject,
            ]
          );
          inserted++;
          console.log(`[v0] Inserted: ${video.title}`);
        }
      } catch (error) {
        console.error(`[v0] Error inserting ${video.title}:`, error.message);
      }
    }

    await client.end();

    return Response.json({
      success: true,
      inserted: inserted,
      total: videosData.length,
      message: `Inserted ${inserted} videos successfully`,
    });
  } catch (error) {
    console.error('[v0] Error:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error populating videos',
      },
      { status: 500 }
    );
  }
}
