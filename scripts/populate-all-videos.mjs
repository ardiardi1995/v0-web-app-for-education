import { Client } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;

async function populateVideos() {
  const client = new Client({ connectionString: DATABASE_URL });
  
  try {
    await client.connect();
    console.log('Connected to database');
    
    // Delete existing videos
    await client.query('DELETE FROM videos');
    console.log('Deleted existing videos');
    
    // Subject mapping by kelas berdasarkan Kurikulum Merdeka
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
    
    let totalInserted = 0;
    
    // Insert 25 videos per kelas per subject
    for (let kelas = 1; kelas <= 12; kelas++) {
      const subjects = KELAS_SUBJECTS[kelas] || [];
      const category = kelas <= 6 ? 'SD' : kelas <= 9 ? 'SMP' : 'SMA';
      
      for (const subject of subjects) {
        const videos = [];
        
        for (let i = 1; i <= 25; i++) {
          const videoid = `vid_k${kelas}_${subject.toLowerCase().replace(/ /g, '')}_${i}`;
          const title = `Kelas ${kelas} ${subject} - Topik ${i}`;
          const description = `Video pembelajaran ${subject} untuk kelas ${kelas}`;
          const thumbnail = 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg';
          
          videos.push({
            videoid,
            title,
            description,
            thumbnail,
            category,
            subject,
            kelas,
          });
        }
        
        // Batch insert
        for (const batch of chunkArray(videos, 100)) {
          const values = batch
            .map(v => `('${v.videoid}', '${v.title.replace(/'/g, "''")}', '${v.description.replace(/'/g, "''")}', '${v.thumbnail}', '${v.category}', '${v.subject}', ${v.kelas}, NOW())`)
            .join(',');
          
          const query = `INSERT INTO videos (videoid, title, description, thumbnail, category, subject, kelas, createdat) VALUES ${values}`;
          await client.query(query);
          totalInserted += batch.length;
        }
        
        console.log(`Inserted ${subjects.length * 25} videos for Kelas ${kelas}`);
      }
    }
    
    console.log(`Total videos inserted: ${totalInserted}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

function chunkArray(arr, size) {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );
}

populateVideos();
