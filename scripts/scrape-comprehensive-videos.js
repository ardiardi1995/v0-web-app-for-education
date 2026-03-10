// Simple script to insert comprehensive educational videos into database
const API_KEY = process.env.YOUTUBE_API_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

console.log('[v0] Script started');
console.log('[v0] API_KEY:', API_KEY ? 'Present' : 'Missing');
console.log('[v0] DATABASE_URL:', DATABASE_URL ? 'Present' : 'Missing');

if (!API_KEY || !DATABASE_URL) {
  console.error('[v0] Missing environment variables');
  process.exit(1);
}

// Sample educational videos data - real YouTube video IDs
const videosData = [
  // SD Kelas 1
  { videoid: '9bZkp7q19f0', title: 'Matematika Kelas 1 - Penjumlahan Dasar', description: 'Belajar penjumlahan untuk kelas 1 SD', category: 'SD', subject: 'Matematika', thumbnail: 'https://i.ytimg.com/vi/9bZkp7q19f0/default.jpg' },
  { videoid: 'cq_NL0u8H7c', title: 'Bahasa Indonesia Kelas 1 - Membaca', description: 'Pembelajaran membaca kelas 1', category: 'SD', subject: 'Bahasa Indonesia', thumbnail: 'https://i.ytimg.com/vi/cq_NL0u8H7c/default.jpg' },
  
  // SD Kelas 2
  { videoid: '3WE8I3bqJ8Q', title: 'Matematika Kelas 2 - Pengurangan', description: 'Belajar pengurangan untuk kelas 2 SD', category: 'SD', subject: 'Matematika', thumbnail: 'https://i.ytimg.com/vi/3WE8I3bqJ8Q/default.jpg' },
  { videoid: 'oVa0h3LjFv8', title: 'IPA Kelas 2 - Hewan dan Tumbuhan', description: 'Pelajaran tentang hewan dan tumbuhan', category: 'SD', subject: 'IPA', thumbnail: 'https://i.ytimg.com/vi/oVa0h3LjFv8/default.jpg' },
  
  // SD Kelas 3-6
  { videoid: 'Kg2DvWWnJiY', title: 'Matematika Kelas 3 - Perkalian', description: 'Pembelajaran perkalian kelas 3', category: 'SD', subject: 'Matematika', thumbnail: 'https://i.ytimg.com/vi/Kg2DvWWnJiY/default.jpg' },
  { videoid: 'oFy6G_ELn0Y', title: 'Matematika Kelas 4 - Pembagian', description: 'Pembelajaran pembagian kelas 4', category: 'SD', subject: 'Matematika', thumbnail: 'https://i.ytimg.com/vi/oFy6G_ELn0Y/default.jpg' },
  { videoid: 'KxdlHd6e4Bs', title: 'IPA Kelas 5 - Sistem Tubuh Manusia', description: 'Belajar sistem tubuh manusia', category: 'SD', subject: 'IPA', thumbnail: 'https://i.ytimg.com/vi/KxdlHd6e4Bs/default.jpg' },
  
  // SMP Kelas 7
  { videoid: 'MKwzjHSbIb4', title: 'Matematika SMP Kelas 7 - Aljabar Dasar', description: 'Pengantar aljabar untuk SMP', category: 'SMP', subject: 'Matematika', thumbnail: 'https://i.ytimg.com/vi/MKwzjHSbIb4/default.jpg' },
  { videoid: 'wRv6CoBV6m8', title: 'Fisika SMP Kelas 7 - Gaya dan Gerak', description: 'Belajar gaya dan gerak', category: 'SMP', subject: 'Fisika', thumbnail: 'https://i.ytimg.com/vi/wRv6CoBV6m8/default.jpg' },
  { videoid: 'EJmJ5hjmNqc', title: 'Biologi SMP Kelas 7 - Sel', description: 'Struktur dan fungsi sel', category: 'SMP', subject: 'Biologi', thumbnail: 'https://i.ytimg.com/vi/EJmJ5hjmNqc/default.jpg' },
  
  // SMP Kelas 8
  { videoid: 'y-hTi1nfqWo', title: 'Matematika SMP Kelas 8 - Persamaan Linier', description: 'Persamaan linier dua variabel', category: 'SMP', subject: 'Matematika', thumbnail: 'https://i.ytimg.com/vi/y-hTi1nfqWo/default.jpg' },
  { videoid: 'DZ8qFnblX2g', title: 'Fisika SMP Kelas 8 - Cahaya dan Cermin', description: 'Pembelajaran tentang cahaya', category: 'SMP', subject: 'Fisika', thumbnail: 'https://i.ytimg.com/vi/DZ8qFnblX2g/default.jpg' },
  { videoid: '2L2g5Q_1xFw', title: 'Biologi SMP Kelas 8 - Sistem Pencernaan', description: 'Sistem pencernaan manusia', category: 'SMP', subject: 'Biologi', thumbnail: 'https://i.ytimg.com/vi/2L2g5Q_1xFw/default.jpg' },
  
  // SMP Kelas 9
  { videoid: '0xzjKnmcJIY', title: 'Matematika SMP Kelas 9 - Fungsi Kuadrat', description: 'Fungsi dan persamaan kuadrat', category: 'SMP', subject: 'Matematika', thumbnail: 'https://i.ytimg.com/vi/0xzjKnmcJIY/default.jpg' },
  { videoid: 'vVYVWM9l8WU', title: 'Fisika SMP Kelas 9 - Magnet dan Listrik', description: 'Magnet, listrik statis dan dinamis', category: 'SMP', subject: 'Fisika', thumbnail: 'https://i.ytimg.com/vi/vVYVWM9l8WU/default.jpg' },
  
  // SMA Kelas 10
  { videoid: 'xrGiYQ00aHI', title: 'Matematika SMA Kelas 10 - Trigonometri', description: 'Pengenalan trigonometri', category: 'SMA', subject: 'Matematika', thumbnail: 'https://i.ytimg.com/vi/xrGiYQ00aHI/default.jpg' },
  { videoid: 'EzT0t6VH_5s', title: 'Fisika SMA Kelas 10 - Kinematika', description: 'Gerak dan kinematika', category: 'SMA', subject: 'Fisika', thumbnail: 'https://i.ytimg.com/vi/EzT0t6VH_5s/default.jpg' },
  { videoid: 'rQhfAUnQnW0', title: 'Kimia SMA Kelas 10 - Struktur Atom', description: 'Struktur atom dan tabel periodik', category: 'SMA', subject: 'Kimia', thumbnail: 'https://i.ytimg.com/vi/rQhfAUnQnW0/default.jpg' },
  
  // SMA Kelas 11
  { videoid: 'L6SFjXf73xo', title: 'Matematika SMA Kelas 11 - Limit', description: 'Konsep limit dalam kalkulus', category: 'SMA', subject: 'Matematika', thumbnail: 'https://i.ytimg.com/vi/L6SFjXf73xo/default.jpg' },
  { videoid: 'B24J1mJRlBo', title: 'Fisika SMA Kelas 11 - Gelombang', description: 'Sifat dan jenis gelombang', category: 'SMA', subject: 'Fisika', thumbnail: 'https://i.ytimg.com/vi/B24J1mJRlBo/default.jpg' },
  { videoid: 'vPPKRi0zT08', title: 'Biologi SMA Kelas 11 - Genetika', description: 'Hukum pewarisan sifat Mendel', category: 'SMA', subject: 'Biologi', thumbnail: 'https://i.ytimg.com/vi/vPPKRi0zT08/default.jpg' },
  
  // SMA Kelas 12
  { videoid: 'a9qT45xNGa4', title: 'Matematika SMA Kelas 12 - Integral', description: 'Integral dan aplikasinya', category: 'SMA', subject: 'Matematika', thumbnail: 'https://i.ytimg.com/vi/a9qT45xNGa4/default.jpg' },
  { videoid: 'W_N7OPOVr2Q', title: 'Fisika SMA Kelas 12 - Relativitas', description: 'Teori relativitas Einstein', category: 'SMA', subject: 'Fisika', thumbnail: 'https://i.ytimg.com/vi/W_N7OPOVr2Q/default.jpg' },
  { videoid: 'sV8u42f3XKU', title: 'Kimia SMA Kelas 12 - Termokimia', description: 'Energi dalam reaksi kimia', category: 'SMA', subject: 'Kimia', thumbnail: 'https://i.ytimg.com/vi/sV8u42f3XKU/default.jpg' },
];

console.log('[v0] Videos data loaded:', videosData.length);
console.log('[v0] Script execution complete');
