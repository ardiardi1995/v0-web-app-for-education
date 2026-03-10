-- Drop existing table if it exists
DROP TABLE IF EXISTS videos;

-- Create videos table for learning platform with lowercase column names
CREATE TABLE videos (
  id BIGSERIAL PRIMARY KEY,
  videoid VARCHAR(255) NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail VARCHAR(500),
  duration INT,
  category VARCHAR(50),
  subject VARCHAR(100),
  url VARCHAR(500),
  createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for fast queries
CREATE INDEX idx_videos_category ON videos(category);
CREATE INDEX idx_videos_subject ON videos(subject);
CREATE INDEX idx_videos_videoid ON videos(videoid);
