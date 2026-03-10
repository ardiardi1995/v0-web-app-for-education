-- Assign kelas values to videos based on their subject and category
-- Kelas distribution for learning videos

-- SD videos: Kelas 1-6
UPDATE videos SET kelas = 1 WHERE subject IN ('Matematika', 'Bahasa Indonesia', 'IPA', 'IPS') AND category = 'SD' AND kelas IS NULL;

-- SMP videos: Kelas 7-9  
UPDATE videos SET kelas = 7 WHERE subject IN ('Matematika', 'Fisika', 'Biologi', 'Kimia', 'Bahasa Indonesia', 'Bahasa Inggris') AND category = 'SMP' AND kelas IS NULL;

-- SMA videos: Kelas 10-12
UPDATE videos SET kelas = 10 WHERE subject IN ('Matematika', 'Fisika', 'Kimia', 'Biologi', 'Bahasa Inggris') AND category = 'SMA' AND kelas IS NULL;

-- For remaining videos, distribute across kelas 1-12 based on mod
UPDATE videos 
SET kelas = CASE 
  WHEN category = 'SD' THEN MOD(id::text::bigint, 6) + 1
  WHEN category = 'SMP' THEN MOD(id::text::bigint, 3) + 7
  WHEN category = 'SMA' THEN MOD(id::text::bigint, 3) + 10
  ELSE 1
END
WHERE kelas IS NULL;

-- Final fallback for any remaining NULL values
UPDATE videos SET kelas = 1 WHERE kelas IS NULL;

