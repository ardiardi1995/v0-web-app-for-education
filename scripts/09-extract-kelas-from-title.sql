-- Extract kelas from title for existing videos
UPDATE videos 
SET kelas = CAST(substring(title, 'Kelas (\d+)') AS INTEGER)
WHERE title LIKE '%Kelas %' AND kelas = 1;

-- For videos that still don't have proper kelas after extraction, assign based on subject/category
UPDATE videos 
SET kelas = 1 
WHERE kelas = 1 AND subject IN ('Matematika', 'Bahasa Indonesia', 'IPA', 'IPS') AND category = 'SD' AND title NOT LIKE '%Kelas%';

-- Show results
SELECT kelas, COUNT(*) as total_videos, STRING_AGG(DISTINCT subject, ', ') as subjects 
FROM videos 
GROUP BY kelas 
ORDER BY kelas;
