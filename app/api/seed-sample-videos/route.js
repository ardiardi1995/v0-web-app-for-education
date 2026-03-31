import { neon } from '@neondatabase/serverless';

// Sample video data for kelas 1-3 with all subjects
const SAMPLE_VIDEOS = [
  // Kelas 1 - Matematika
  { kelas: 1, subject: 'Matematika', title: 'Belajar Angka 1-10 untuk Anak SD Kelas 1', description: 'Video pembelajaran dasar angka 1 hingga 10 untuk siswa SD kelas 1', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  { kelas: 1, subject: 'Matematika', title: 'Penjumlahan Dasar Kelas 1 SD', description: 'Belajar penjumlahan dasar untuk anak kelas 1', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  { kelas: 1, subject: 'Matematika', title: 'Pengurangan Mudah untuk Kelas 1', description: 'Pembelajaran pengurangan yang menyenangkan untuk kelas 1', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  { kelas: 1, subject: 'Matematika', title: 'Bentuk Geometri Dasar SD Kelas 1', description: 'Mengenal bentuk lingkaran, segitiga, dan persegi', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  
  // Kelas 1 - Bahasa Indonesia
  { kelas: 1, subject: 'Bahasa Indonesia', title: 'Membaca Huruf Alfabet untuk Kelas 1', description: 'Belajar membaca huruf A-Z dengan cara yang menyenangkan', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  { kelas: 1, subject: 'Bahasa Indonesia', title: 'Menulis Huruf Kecil dan Besar', description: 'Panduan menulis huruf besar dan kecil untuk pemula', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  { kelas: 1, subject: 'Bahasa Indonesia', title: 'Vocab Dasar Bahasa Indonesia Kelas 1', description: 'Mempelajari kosakata dasar bahasa Indonesia', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  { kelas: 1, subject: 'Bahasa Indonesia', title: 'Membaca Kalimat Sederhana', description: 'Belajar membaca kalimat-kalimat pendek untuk anak SD', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  
  // Kelas 1 - IPAS
  { kelas: 1, subject: 'IPAS', title: 'Mengenal Anggota Tubuh Manusia Kelas 1', description: 'Pembelajaran tentang bagian-bagian tubuh manusia', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  { kelas: 1, subject: 'IPAS', title: 'Habitat Hewan dan Tumbuhan untuk Anak', description: 'Memahami tempat tinggal berbagai hewan dan tanaman', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  { kelas: 1, subject: 'IPAS', title: 'Alam Sekitar Kita - Musim dan Cuaca', description: 'Mengenal musim, cuaca, dan perubahan alam sekitar', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  { kelas: 1, subject: 'IPAS', title: 'Makanan Sehat untuk Anak Kelas 1', description: 'Pembelajaran tentang jenis makanan yang sehat', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  
  // Kelas 1 - Pendidikan Pancasila
  { kelas: 1, subject: 'Pendidikan Pancasila', title: 'Lima Sila Pancasila untuk Anak Kelas 1', description: 'Pengenalan lima sila Pancasila dengan cara yang mudah dipahami', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  { kelas: 1, subject: 'Pendidikan Pancasila', title: 'Menghormati dan Menghargai Perbedaan', description: 'Belajar menghormati teman yang berbeda dari kita', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  { kelas: 1, subject: 'Pendidikan Pancasila', title: 'Sikap Jujur untuk Anak Kelas 1', description: 'Pentingnya kejujuran dalam kehidupan sehari-hari', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  { kelas: 1, subject: 'Pendidikan Pancasila', title: 'Gotong Royong dan Kerja Sama', description: 'Belajar tentang kerja sama dan gotong royong', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  
  // Kelas 1 - Pendidikan Agama Islam
  { kelas: 1, subject: 'Pendidikan Agama Islam', title: 'Mengenal Rukun Islam untuk Anak Kelas 1', description: 'Pembelajaran lima rukun Islam dengan cerita yang menyenangkan', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  { kelas: 1, subject: 'Pendidikan Agama Islam', title: 'Doa Sehari-hari untuk Anak Muslim', description: 'Mengajarkan doa-doa penting untuk anak kelas 1', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  { kelas: 1, subject: 'Pendidikan Agama Islam', title: 'Adab Makan dan Minum dalam Islam', description: 'Belajar etika makan dan minum menurut ajaran Islam', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  { kelas: 1, subject: 'Pendidikan Agama Islam', title: 'Berbuat Baik kepada Orang Tua', description: 'Pentingnya berbakti kepada kedua orang tua', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  
  // Kelas 1 - Seni Budaya
  { kelas: 1, subject: 'Seni Budaya', title: 'Menggambar untuk Anak Kelas 1', description: 'Belajar teknik dasar menggambar untuk pemula', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  { kelas: 1, subject: 'Seni Budaya', title: 'Mewarnai dengan Krayon dan Pensil Warna', description: 'Cara mewarnai yang rapi dan menyenangkan', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  { kelas: 1, subject: 'Seni Budaya', title: 'Lagu Anak-Anak Indonesia yang Terkenal', description: 'Mengajarkan lagu-lagu anak tradisional Indonesia', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  { kelas: 1, subject: 'Seni Budaya', title: 'Kerajinan Tangan Sederhana untuk Anak', description: 'Membuat kerajinan tangan dari bahan sederhana', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  
  // Kelas 1 - PJOK
  { kelas: 1, subject: 'PJOK', title: 'Olahraga Dasar untuk Anak Kelas 1', description: 'Pembelajaran gerak dasar olahraga untuk pemula', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  { kelas: 1, subject: 'PJOK', title: 'Senam Ritmik untuk Anak-Anak', description: 'Gerakan senam yang menyenangkan untuk anak SD', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  { kelas: 1, subject: 'PJOK', title: 'Permainan Tradisional Indonesia untuk Anak', description: 'Belajar bermain permainan tradisional yang seru', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  { kelas: 1, subject: 'PJOK', title: 'Kesehatan dan Kebersihan Pribadi', description: 'Pentingnya menjaga kesehatan dan kebersihan diri', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  
  // Kelas 2 - Matematika
  { kelas: 2, subject: 'Matematika', title: 'Penjumlahan dan Pengurangan hingga 100', description: 'Belajar penjumlahan dan pengurangan untuk kelas 2', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  { kelas: 2, subject: 'Matematika', title: 'Perkalian untuk Anak Kelas 2 SD', description: 'Pengenalan dasar perkalian untuk siswa kelas 2', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  { kelas: 2, subject: 'Matematika', title: 'Pembagian Sederhana Kelas 2', description: 'Pembelajaran pembagian untuk pemula', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  { kelas: 2, subject: 'Matematika', title: 'Jam dan Waktu untuk Kelas 2', description: 'Belajar membaca jam dan memahami waktu', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  
  // Kelas 2 - Bahasa Indonesia  
  { kelas: 2, subject: 'Bahasa Indonesia', title: 'Membaca Cerita Pendek Kelas 2', description: 'Latihan membaca cerita untuk meningkatkan pemahaman', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  { kelas: 2, subject: 'Bahasa Indonesia', title: 'Menulis Kalimat Panjang', description: 'Belajar menulis kalimat yang panjang dan benar', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  { kelas: 2, subject: 'Bahasa Indonesia', title: 'Kosakata Lanjutan Bahasa Indonesia', description: 'Memperluas kosakata bahasa Indonesia kelas 2', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  { kelas: 2, subject: 'Bahasa Indonesia', title: 'Memahami Isi Cerita yang Dibaca', description: 'Latihan memahami isi dan pesan dalam cerita', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  
  // Kelas 2 - IPAS
  { kelas: 2, subject: 'IPAS', title: 'Macam-macam Tumbuhan untuk Kelas 2', description: 'Mengenal berbagai jenis tumbuhan dan cirinya', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  { kelas: 2, subject: 'IPAS', title: 'Siklus Hidup Hewan dan Tumbuhan', description: 'Belajar tentang metamorfosis dan pertumbuhan', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  { kelas: 2, subject: 'IPAS', title: 'Sistem Pernapasan Manusia Sederhana', description: 'Memahami cara manusia bernafas', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  { kelas: 2, subject: 'IPAS', title: 'Bumi dan Langit - Gerhana Matahari dan Bulan', description: 'Penjelasan gerhana untuk anak kelas 2', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  
  // Kelas 2 - Pendidikan Pancasila
  { kelas: 2, subject: 'Pendidikan Pancasila', title: 'Nilai-nilai Pancasila dalam Kehidupan', description: 'Bagaimana mengamalkan nilai Pancasila sehari-hari', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  { kelas: 2, subject: 'Pendidikan Pancasila', title: 'Menghormati Hak dan Kewajiban Teman', description: 'Memahami hak dan kewajiban dalam persahabatan', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  { kelas: 2, subject: 'Pendidikan Pancasila', title: 'Sikap Toleransi terhadap Keberagaman', description: 'Belajar menghargai keberagaman di sekolah', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  { kelas: 2, subject: 'Pendidikan Pancasila', title: 'Tanggung Jawab Sebagai Siswa yang Baik', description: 'Memahami tanggung jawab di sekolah dan rumah', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  
  // Kelas 2 - Pendidikan Agama Islam
  { kelas: 2, subject: 'Pendidikan Agama Islam', title: 'Mengenal Nabi dan Rasul Islam', description: 'Cerita-cerita tentang nabi dan rasul untuk anak', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  { kelas: 2, subject: 'Pendidikan Agama Islam', title: 'Shalat Berjamaah untuk Anak Muslim', description: 'Panduan shalat berjamaah yang mudah dipahami', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  { kelas: 2, subject: 'Pendidikan Agama Islam', title: 'Sedekah dan Berbagi dengan Sesama', description: 'Pentingnya berbagi dan bersedekah dalam Islam', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  { kelas: 2, subject: 'Pendidikan Agama Islam', title: 'Bulan Ramadhan dan Puasa untuk Anak', description: 'Memahami makna puasa dan bulan Ramadhan', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  
  // Kelas 2 - Seni Budaya
  { kelas: 2, subject: 'Seni Budaya', title: 'Teknik Melukis dengan Cat Air', description: 'Belajar melukis dengan teknik cat air untuk anak', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  { kelas: 2, subject: 'Seni Budaya', title: 'Membuat Topeng Dari Kertas Bekas', description: 'Kerajinan membuat topeng yang menyenangkan', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  { kelas: 2, subject: 'Seni Budaya', title: 'Tari Tradisional Indonesia untuk Anak', description: 'Mengenal dan mempelajari tari tradisional', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  { kelas: 2, subject: 'Seni Budaya', title: 'Musik dan Alat Musik Tradisional', description: 'Berkenalan dengan alat musik tradisional', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  
  // Kelas 2 - PJOK
  { kelas: 2, subject: 'PJOK', title: 'Teknik Lari dan Jalan Cepat', description: 'Belajar teknik dasar berlari yang benar', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  { kelas: 2, subject: 'PJOK', title: 'Permainan Bola Sederhana untuk Anak', description: 'Olahraga bola yang cocok untuk kelas 2', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  { kelas: 2, subject: 'PJOK', title: 'Yoga untuk Anak-Anak Kelas 2', description: 'Gerakan yoga yang menenangkan untuk anak', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  { kelas: 2, subject: 'PJOK', title: 'Kebersihan Diri dan Kesehatan Tubuh', description: 'Menjaga kebersihan dan kesehatan sejak dini', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },

  // Kelas 3 - Matematika
  { kelas: 3, subject: 'Matematika', title: 'Perkalian dan Pembagian Kelas 3', description: 'Mendalami perkalian dan pembagian untuk kelas 3', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  { kelas: 3, subject: 'Matematika', title: 'Operasi Hitung Campur Kelas 3', description: 'Kombinasi operasi hitung untuk soal lebih kompleks', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  { kelas: 3, subject: 'Matematika', title: 'Bangun Datar dan Sifat-sifatnya', description: 'Memahami berbagai bangun datar dan cirinya', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  { kelas: 3, subject: 'Matematika', title: 'Pengukuran Panjang, Berat, dan Isi', description: 'Belajar berbagai jenis pengukuran', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },

  // Kelas 3 - Bahasa Indonesia
  { kelas: 3, subject: 'Bahasa Indonesia', title: 'Membaca Pemahaman Kelas 3', description: 'Latihan membaca dan pemahaman untuk kelas 3', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  { kelas: 3, subject: 'Bahasa Indonesia', title: 'Menulis Cerita Pendek dengan Rapi', description: 'Panduan menulis cerita yang menarik', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  { kelas: 3, subject: 'Bahasa Indonesia', title: 'Puisi dan Pantun untuk Anak', description: 'Pengenalan puisi dan pantun tradisional', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  { kelas: 3, subject: 'Bahasa Indonesia', title: 'Tata Bahasa Dasar Indonesia', description: 'Pembelajaran tata bahasa untuk kelas 3', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },

  // Kelas 3 - IPAS
  { kelas: 3, subject: 'IPAS', title: 'Sistem Pencernaan Manusia Sederhana', description: 'Memahami cara pencernaan manusia bekerja', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  { kelas: 3, subject: 'IPAS', title: 'Rantai Makanan dan Jaring Makanan', description: 'Belajar tentang hubungan makhluk hidup', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  { kelas: 3, subject: 'IPAS', title: 'Cuaca dan Perubahan Musim', description: 'Memahami berbagai kondisi cuaca dan musim', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  { kelas: 3, subject: 'IPAS', title: 'Sumber Daya Alam dan Pemanfaatannya', description: 'Mengenal sumber daya alam di Indonesia', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },

  // Kelas 3 - Pendidikan Pancasila
  { kelas: 3, subject: 'Pendidikan Pancasila', title: 'Keberagaman Indonesia dan Kesatuan', description: 'Memahami keberagaman dalam kesatuan', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  { kelas: 3, subject: 'Pendidikan Pancasila', title: 'Demokrasi Sederhana untuk Anak', description: 'Pengenalan konsep demokrasi untuk kelas 3', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  { kelas: 3, subject: 'Pendidikan Pancasila', title: 'Kepemimpinan Kelas yang Baik', description: 'Belajar menjadi pemimpin yang adil', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  { kelas: 3, subject: 'Pendidikan Pancasila', title: 'Lingkungan Sekolah yang Aman', description: 'Menjaga keamanan lingkungan sekolah', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },

  // Kelas 3 - Pendidikan Agama Islam
  { kelas: 3, subject: 'Pendidikan Agama Islam', title: 'Kisah-kisah Teladan dari Nabi', description: 'Cerita inspiratif dari para nabi untuk anak', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  { kelas: 3, subject: 'Pendidikan Agama Islam', title: 'Akhlak Mulia dalam Kehidupan', description: 'Belajar tentang akhlak baik dari Islam', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  { kelas: 3, subject: 'Pendidikan Agama Islam', title: 'Hari Raya Idul Fitri dan Idul Adha', description: 'Memahami makna hari raya dalam Islam', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  { kelas: 3, subject: 'Pendidikan Agama Islam', title: 'Doa-doa Penting dalam Kehidupan', description: 'Menghafalkan doa-doa penting untuk anak', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },

  // Kelas 3 - Seni Budaya
  { kelas: 3, subject: 'Seni Budaya', title: 'Menggambar Perspektif Sederhana', description: 'Belajar menggambar dengan perspektif yang tepat', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  { kelas: 3, subject: 'Seni Budaya', title: 'Batik Indonesia untuk Anak', description: 'Mengenal dan membuat batik sederhana', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  { kelas: 3, subject: 'Seni Budaya', title: 'Wayang Kulit Cerita Ramayana', description: 'Pengenalan wayang dan cerita Ramayana', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  { kelas: 3, subject: 'Seni Budaya', title: 'Instrumen Musik Angklung dan Gamelan', description: 'Berkenalan dengan alat musik tradisional', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },

  // Kelas 3 - PJOK
  { kelas: 3, subject: 'PJOK', title: 'Teknik Dasar Lempar dan Tangkap', description: 'Belajar lempar tangkap dengan teknik yang benar', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  { kelas: 3, subject: 'PJOK', title: 'Permainan Bulutangkis untuk Anak', description: 'Pengenalan olahraga bulutangkis untuk pemula', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  { kelas: 3, subject: 'PJOK', title: 'Renang Gaya Bebas Dasar', description: 'Belajar teknik renang gaya bebas sederhana', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  { kelas: 3, subject: 'PJOK', title: 'Pentingnya Olahraga untuk Kesehatan', description: 'Memahami manfaat olahraga teratur bagi tubuh', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
];

export async function POST(request) {
  try {
    if (!process.env.DATABASE_URL) {
      return Response.json({ error: 'DATABASE_URL not set', success: false }, { status: 500 });
    }

    const sql = neon(process.env.DATABASE_URL);
    
    console.log('[v0] Seeding sample educational videos for kelas 1-3...');

    // Create table if doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS videos (
        id SERIAL PRIMARY KEY,
        videoid VARCHAR(255) UNIQUE NOT NULL,
        title VARCHAR(500) NOT NULL,
        description TEXT,
        thumbnail VARCHAR(500),
        subject VARCHAR(100),
        kelas INT,
        category VARCHAR(50),
        createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    let inserted = 0;
    
    for (const video of SAMPLE_VIDEOS) {
      try {
        const videoid = `sample-${video.kelas}-${video.subject.replace(/\s+/g, '-').toLowerCase()}-${Math.random().toString(36).substring(2, 9)}`;
        
        await sql`
          INSERT INTO videos (videoid, title, description, thumbnail, category, subject, kelas, createdat)
          VALUES (
            ${videoid},
            ${video.title},
            ${video.description},
            ${video.thumbnail},
            'SD',
            ${video.subject},
            ${video.kelas},
            NOW()
          )
          ON CONFLICT (videoid) DO NOTHING
        `;
        inserted++;
      } catch (err) {
        console.error('[v0] Error inserting video:', err.message);
      }
    }

    console.log(`[v0] Successfully seeded ${inserted} sample videos`);

    return Response.json({
      success: true,
      message: `Successfully seeded ${inserted} sample educational videos for kelas 1-3 with all subjects`,
      totalVideos: inserted,
    });
  } catch (error) {
    console.error('[v0] Seeding error:', error);
    return Response.json(
      {
        error: error.message,
        message: 'Failed to seed sample videos',
        success: false,
      },
      { status: 500 }
    );
  }
}
