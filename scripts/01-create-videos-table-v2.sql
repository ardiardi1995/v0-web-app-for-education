-- Create videos table with correct schema
CREATE TABLE IF NOT EXISTS videos (
  id BIGSERIAL PRIMARY KEY,
  videoid VARCHAR(255) NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail VARCHAR(500),
  duration INT,
  category VARCHAR(50),
  subject VARCHAR(100),
  url VARCHAR(500),
  kelas INT,
  createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_videos_category ON videos(category);
CREATE INDEX IF NOT EXISTS idx_videos_subject ON videos(subject);
CREATE INDEX IF NOT EXISTS idx_videos_videoid ON videos(videoid);
CREATE INDEX IF NOT EXISTS idx_videos_kelas ON videos(kelas);
