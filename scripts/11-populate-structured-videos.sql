DELETE FROM videos;

-- Kelas 1 - 4 Subjects x 50 videos = 200 videos
INSERT INTO videos (videoid, title, description, thumbnail, category, subject, kelas, createdat)
SELECT 
  'VID_K1_' || subject_idx || '_' || video_idx,
  subject_name || ' Kelas 1 - Topik ' || video_idx,
  'Video pembelajaran ' || subject_name || ' untuk kelas 1 topik ' || video_idx,
  'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
  'SD',
  subject_name,
  1,
  NOW()
FROM (
  SELECT UNNEST(ARRAY[1,2,3,4]) as subject_idx,
         UNNEST(ARRAY['Matematika', 'Bahasa Indonesia', 'IPA', 'IPS']) as subject_name
) subjects
CROSS JOIN LATERAL (
  SELECT generate_series(1, 50) as video_idx
) videos;

-- Kelas 2 - 4 Subjects x 50 videos
INSERT INTO videos (videoid, title, description, thumbnail, category, subject, kelas, createdat)
SELECT 
  'VID_K2_' || subject_idx || '_' || video_idx,
  subject_name || ' Kelas 2 - Topik ' || video_idx,
  'Video pembelajaran ' || subject_name || ' untuk kelas 2 topik ' || video_idx,
  'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
  'SD',
  subject_name,
  2,
  NOW()
FROM (
  SELECT UNNEST(ARRAY[1,2,3,4]) as subject_idx,
         UNNEST(ARRAY['Matematika', 'Bahasa Indonesia', 'IPA', 'IPS']) as subject_name
) subjects
CROSS JOIN LATERAL (
  SELECT generate_series(1, 50) as video_idx
) videos;

-- Kelas 3 - 4 Subjects x 50 videos
INSERT INTO videos (videoid, title, description, thumbnail, category, subject, kelas, createdat)
SELECT 
  'VID_K3_' || subject_idx || '_' || video_idx,
  subject_name || ' Kelas 3 - Topik ' || video_idx,
  'Video pembelajaran ' || subject_name || ' untuk kelas 3 topik ' || video_idx,
  'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
  'SD',
  subject_name,
  3,
  NOW()
FROM (
  SELECT UNNEST(ARRAY[1,2,3,4]) as subject_idx,
         UNNEST(ARRAY['Matematika', 'Bahasa Indonesia', 'IPA', 'IPS']) as subject_name
) subjects
CROSS JOIN LATERAL (
  SELECT generate_series(1, 50) as video_idx
) videos;

-- Kelas 4 - 5 Subjects x 50 videos
INSERT INTO videos (videoid, title, description, thumbnail, category, subject, kelas, createdat)
SELECT 
  'VID_K4_' || subject_idx || '_' || video_idx,
  subject_name || ' Kelas 4 - Topik ' || video_idx,
  'Video pembelajaran ' || subject_name || ' untuk kelas 4 topik ' || video_idx,
  'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
  'SD',
  subject_name,
  4,
  NOW()
FROM (
  SELECT UNNEST(ARRAY[1,2,3,4,5]) as subject_idx,
         UNNEST(ARRAY['Matematika', 'Bahasa Indonesia', 'IPA', 'IPS', 'Bahasa Inggris']) as subject_name
) subjects
CROSS JOIN LATERAL (
  SELECT generate_series(1, 50) as video_idx
) videos;

-- Kelas 5 - 5 Subjects x 50 videos
INSERT INTO videos (videoid, title, description, thumbnail, category, subject, kelas, createdat)
SELECT 
  'VID_K5_' || subject_idx || '_' || video_idx,
  subject_name || ' Kelas 5 - Topik ' || video_idx,
  'Video pembelajaran ' || subject_name || ' untuk kelas 5 topik ' || video_idx,
  'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
  'SD',
  subject_name,
  5,
  NOW()
FROM (
  SELECT UNNEST(ARRAY[1,2,3,4,5]) as subject_idx,
         UNNEST(ARRAY['Matematika', 'Bahasa Indonesia', 'IPA', 'IPS', 'Bahasa Inggris']) as subject_name
) subjects
CROSS JOIN LATERAL (
  SELECT generate_series(1, 50) as video_idx
) videos;

-- Kelas 6 - 5 Subjects x 50 videos
INSERT INTO videos (videoid, title, description, thumbnail, category, subject, kelas, createdat)
SELECT 
  'VID_K6_' || subject_idx || '_' || video_idx,
  subject_name || ' Kelas 6 - Topik ' || video_idx,
  'Video pembelajaran ' || subject_name || ' untuk kelas 6 topik ' || video_idx,
  'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
  'SD',
  subject_name,
  6,
  NOW()
FROM (
  SELECT UNNEST(ARRAY[1,2,3,4,5]) as subject_idx,
         UNNEST(ARRAY['Matematika', 'Bahasa Indonesia', 'IPA', 'IPS', 'Bahasa Inggris']) as subject_name
) subjects
CROSS JOIN LATERAL (
  SELECT generate_series(1, 50) as video_idx
) videos;

-- Kelas 7 - 6 Subjects x 50 videos
INSERT INTO videos (videoid, title, description, thumbnail, category, subject, kelas, createdat)
SELECT 
  'VID_K7_' || subject_idx || '_' || video_idx,
  subject_name || ' Kelas 7 - Topik ' || video_idx,
  'Video pembelajaran ' || subject_name || ' untuk kelas 7 topik ' || video_idx,
  'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
  'SMP',
  subject_name,
  7,
  NOW()
FROM (
  SELECT UNNEST(ARRAY[1,2,3,4,5,6]) as subject_idx,
         UNNEST(ARRAY['Matematika', 'Fisika', 'Biologi', 'Kimia', 'Bahasa Indonesia', 'Bahasa Inggris']) as subject_name
) subjects
CROSS JOIN LATERAL (
  SELECT generate_series(1, 50) as video_idx
) videos;

-- Kelas 8 - 6 Subjects x 50 videos
INSERT INTO videos (videoid, title, description, thumbnail, category, subject, kelas, createdat)
SELECT 
  'VID_K8_' || subject_idx || '_' || video_idx,
  subject_name || ' Kelas 8 - Topik ' || video_idx,
  'Video pembelajaran ' || subject_name || ' untuk kelas 8 topik ' || video_idx,
  'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
  'SMP',
  subject_name,
  8,
  NOW()
FROM (
  SELECT UNNEST(ARRAY[1,2,3,4,5,6]) as subject_idx,
         UNNEST(ARRAY['Matematika', 'Fisika', 'Biologi', 'Kimia', 'Bahasa Indonesia', 'Bahasa Inggris']) as subject_name
) subjects
CROSS JOIN LATERAL (
  SELECT generate_series(1, 50) as video_idx
) videos;

-- Kelas 9 - 6 Subjects x 50 videos
INSERT INTO videos (videoid, title, description, thumbnail, category, subject, kelas, createdat)
SELECT 
  'VID_K9_' || subject_idx || '_' || video_idx,
  subject_name || ' Kelas 9 - Topik ' || video_idx,
  'Video pembelajaran ' || subject_name || ' untuk kelas 9 topik ' || video_idx,
  'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
  'SMP',
  subject_name,
  9,
  NOW()
FROM (
  SELECT UNNEST(ARRAY[1,2,3,4,5,6]) as subject_idx,
         UNNEST(ARRAY['Matematika', 'Fisika', 'Biologi', 'Kimia', 'Bahasa Indonesia', 'Bahasa Inggris']) as subject_name
) subjects
CROSS JOIN LATERAL (
  SELECT generate_series(1, 50) as video_idx
) videos;

-- Kelas 10 - 5 Subjects x 50 videos
INSERT INTO videos (videoid, title, description, thumbnail, category, subject, kelas, createdat)
SELECT 
  'VID_K10_' || subject_idx || '_' || video_idx,
  subject_name || ' Kelas 10 - Topik ' || video_idx,
  'Video pembelajaran ' || subject_name || ' untuk kelas 10 topik ' || video_idx,
  'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
  'SMA',
  subject_name,
  10,
  NOW()
FROM (
  SELECT UNNEST(ARRAY[1,2,3,4,5]) as subject_idx,
         UNNEST(ARRAY['Matematika', 'Fisika', 'Kimia', 'Biologi', 'Bahasa Inggris']) as subject_name
) subjects
CROSS JOIN LATERAL (
  SELECT generate_series(1, 50) as video_idx
) videos;

-- Kelas 11 - 5 Subjects x 50 videos
INSERT INTO videos (videoid, title, description, thumbnail, category, subject, kelas, createdat)
SELECT 
  'VID_K11_' || subject_idx || '_' || video_idx,
  subject_name || ' Kelas 11 - Topik ' || video_idx,
  'Video pembelajaran ' || subject_name || ' untuk kelas 11 topik ' || video_idx,
  'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
  'SMA',
  subject_name,
  11,
  NOW()
FROM (
  SELECT UNNEST(ARRAY[1,2,3,4,5]) as subject_idx,
         UNNEST(ARRAY['Matematika', 'Fisika', 'Kimia', 'Biologi', 'Bahasa Inggris']) as subject_name
) subjects
CROSS JOIN LATERAL (
  SELECT generate_series(1, 50) as video_idx
) videos;

-- Kelas 12 - 5 Subjects x 50 videos
INSERT INTO videos (videoid, title, description, thumbnail, category, subject, kelas, createdat)
SELECT 
  'VID_K12_' || subject_idx || '_' || video_idx,
  subject_name || ' Kelas 12 - Topik ' || video_idx,
  'Video pembelajaran ' || subject_name || ' untuk kelas 12 topik ' || video_idx,
  'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
  'SMA',
  subject_name,
  12,
  NOW()
FROM (
  SELECT UNNEST(ARRAY[1,2,3,4,5]) as subject_idx,
         UNNEST(ARRAY['Matematika', 'Fisika', 'Kimia', 'Biologi', 'Bahasa Inggris']) as subject_name
) subjects
CROSS JOIN LATERAL (
  SELECT generate_series(1, 50) as video_idx
) videos;
