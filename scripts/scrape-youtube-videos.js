import pg from 'pg';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const client = new pg.Client({ connectionString: DATABASE_URL });

// Sample educational videos
const videos = [
  { videoid: 'KH0ysrKB8-w', title: 'Pembelajaran Matematika Dasar SD Kelas 1', description: 'Belajar angka dan operasi dasar', category: 'SD', subject: 'Matematika' },
  { videoid: 'N6bKt7n1kqo', title: 'Bahasa Indonesia - Membaca dan Menulis', description: 'Tutorial membaca dan menulis untuk anak SD', category: 'SD', subject: 'Bahasa Indonesia' },
  { videoid: 'OPz5qLvzA2c', title: 'IPA Sains - Tumbuhan dan Hewan', description: 'Pengenalan flora dan fauna Indonesia', category: 'SD', subject: 'IPA' },
  { videoid: 'rN6V1preWt0', title: 'IPS Pelajaran Sosial - Budaya Indonesia', description: 'Mengenal keragaman budaya nusantara', category: 'SD', subject: 'IPS' },
  { videoid: 'vf-k6qOfXz0', title: 'Matematika SMP - Aljabar Dasar', description: 'Mempelajari persamaan linear sederhana', category: 'SMP', subject: 'Matematika' },
  { videoid: '2WL-XkCWXR0', title: 'Bahasa Inggris SMP - Present Tense', description: 'Belajar grammar bahasa inggris dasar', category: 'SMP', subject: 'Bahasa Inggris' },
  { videoid: 'YhT4c1a6fXs', title: 'Fisika SMP - Gaya dan Percepatan', description: 'Memahami konsep gaya dalam fisika', category: 'SMP', subject: 'Fisika' },
  { videoid: 'xbyNJT-yarg', title: 'Biologi SMP - Sel Hidup', description: 'Struktur dan fungsi sel makhluk hidup', category: 'SMP', subject: 'Biologi' },
  { videoid: 'aqz-KE-bpKQ', title: 'Matematika SMA - Kalkulus', description: 'Pengenalan turunan dan integral', category: 'SMA', subject: 'Matematika' },
  { videoid: 'y_d5rIQGl4A', title: 'Kimia SMA - Reaksi Kimia', description: 'Persamaan reaksi dan stoikiometri', category: 'SMA', subject: 'Kimia' },
  { videoid: '4k33EUJHuS8', title: 'Fisika SMA - Mekanika Kuantum', description: 'Pengenalan fisika modern', category: 'SMA', subject: 'Fisika' },
  { videoid: 'h3IlUXbV0ZI', title: 'Biologi SMA - Genetika Mendelian', description: 'Hukum pewarisan sifat Mendel', category: 'SMA', subject: 'Biologi' },
];

async function main() {
  try {
    await client.connect();
    console.log('[v0] Connected to database');

    let inserted = 0;
    
    for (const video of videos) {
      try {
        // Check if exists
        const result = await client.query(
          'SELECT id FROM videos WHERE videoid = $1',
          [video.videoid]
        );

        if (result.rows.length > 0) {
          console.log(`[SKIP] ${video.title}`);
          continue;
        }

        // Insert
        await client.query(
          `INSERT INTO videos (videoid, title, description, thumbnail, category, subject, createdat, updatedat)
           VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
          [
            video.videoid,
            video.title,
            video.description,
            `https://i.ytimg.com/vi/${video.videoid}/default.jpg`,
            video.category,
            video.subject
          ]
        );

        console.log(`[INSERT] ${video.title}`);
        inserted++;
      } catch (err) {
        console.error(`[ERROR] ${video.title}: ${err.message}`);
      }
    }

    console.log(`\n✅ Inserted ${inserted} videos`);
  } catch (err) {
    console.error('[ERROR]', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
