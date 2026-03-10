-- Create videos table for learning platform
CREATE TABLE IF NOT EXISTS videos (
  id BIGSERIAL PRIMARY KEY,
  videoId VARCHAR(255) NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail VARCHAR(500),
  duration INT,
  category VARCHAR(50),
  subject VARCHAR(100),
  url VARCHAR(500),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_videos_category ON videos(category);
CREATE INDEX IF NOT EXISTS idx_videos_subject ON videos(subject);
CREATE INDEX IF NOT EXISTS idx_videos_videoId ON videos(videoId);
