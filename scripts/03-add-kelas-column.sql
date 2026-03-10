-- Add kelas (class level 1-12) column to videos table
ALTER TABLE videos ADD COLUMN IF NOT EXISTS kelas INTEGER DEFAULT 1;

-- Add comment to explain the column
COMMENT ON COLUMN videos.kelas IS 'Class level from 1 to 12 (Kelas 1-12)';
