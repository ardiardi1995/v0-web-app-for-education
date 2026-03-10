-- Assign kelas values to videos based on their subject and category
-- Kelas distribution for learning videos

-- SD videos: Kelas 1-6
UPDATE videos SET kelas = 1 WHERE subject IN ('Matematika', 'Bahasa Indonesia', 'IPA', 'IPS') AND category = 'SD' LIMIT 5;
UPDATE videos SET kelas = 2 WHERE subject IN ('Matematika', 'Bahasa Indonesia', 'IPA', 'IPS') AND category = 'SD' AND kelas IS NULL LIMIT 5;
UPDATE videos SET kelas = 3 WHERE subject IN ('Matematika', 'Bahasa Indonesia', 'IPA', 'IPS') AND category = 'SD' AND kelas IS NULL LIMIT 5;
UPDATE videos SET kelas = 4 WHERE subject IN ('Matematika', 'Bahasa Indonesia', 'IPA', 'IPS', 'Bahasa Inggris') AND category = 'SD' AND kelas IS NULL LIMIT 5;
UPDATE videos SET kelas = 5 WHERE subject IN ('Matematika', 'Bahasa Indonesia', 'IPA', 'IPS', 'Bahasa Inggris') AND category = 'SD' AND kelas IS NULL LIMIT 5;
UPDATE videos SET kelas = 6 WHERE subject IN ('Matematika', 'Bahasa Indonesia', 'IPA', 'IPS', 'Bahasa Inggris') AND category = 'SD' AND kelas IS NULL LIMIT 5;

-- SMP videos: Kelas 7-9
UPDATE videos SET kelas = 7 WHERE subject IN ('Matematika', 'Fisika', 'Biologi', 'Kimia', 'Bahasa Indonesia', 'Bahasa Inggris') AND category = 'SMP' LIMIT 5;
UPDATE videos SET kelas = 8 WHERE subject IN ('Matematika', 'Fisika', 'Biologi', 'Kimia', 'Bahasa Indonesia', 'Bahasa Inggris') AND category = 'SMP' AND kelas IS NULL LIMIT 5;
UPDATE videos SET kelas = 9 WHERE subject IN ('Matematika', 'Fisika', 'Biologi', 'Kimia', 'Bahasa Indonesia', 'Bahasa Inggris') AND category = 'SMP' AND kelas IS NULL LIMIT 5;

-- SMA videos: Kelas 10-12
UPDATE videos SET kelas = 10 WHERE subject IN ('Matematika', 'Fisika', 'Kimia', 'Biologi', 'Bahasa Inggris') AND category = 'SMA' LIMIT 5;
UPDATE videos SET kelas = 11 WHERE subject IN ('Matematika', 'Fisika', 'Kimia', 'Biologi', 'Bahasa Inggris') AND category = 'SMA' AND kelas IS NULL LIMIT 5;
UPDATE videos SET kelas = 12 WHERE subject IN ('Matematika', 'Fisika', 'Kimia', 'Biologi', 'Bahasa Inggris') AND category = 'SMA' AND kelas IS NULL LIMIT 5;

-- Default remaining videos to kelas 1 if kelas is still NULL
UPDATE videos SET kelas = 1 WHERE kelas IS NULL;
