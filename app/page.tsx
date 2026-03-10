'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';

interface Video {
  id: string;
  video_id: string;
  title: string;
  description: string;
  thumbnail: string;
  category: string;
  subject: string;
  created_at: string;
}

export default function Home() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [loading, setLoading] = useState(true);

  // Fetch videos on mount
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch('/api/videos');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const videosList = Array.isArray(data.videos) ? data.videos : [];
        setVideos(videosList);
        setFilteredVideos(videosList);
      } catch (error) {
        console.error('Error fetching videos:', error);
        setVideos([]);
        setFilteredVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  // Filter videos based on search and filters
  useEffect(() => {
    let result = videos;

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter(video => video.category === selectedCategory);
    }

    // Subject filter
    if (selectedSubject !== 'all') {
      result = result.filter(video => video.subject === selectedSubject);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        video =>
          video.title.toLowerCase().includes(query) ||
          video.description.toLowerCase().includes(query)
      );
    }

    setFilteredVideos(result);
  }, [videos, searchQuery, selectedCategory, selectedSubject]);

  const categories = ['all', 'SD', 'SMP', 'SMA'];
  const subjects = ['all', 'Matematika', 'Bahasa Indonesia', 'IPA', 'IPS', 'Bahasa Inggris', 'Fisika', 'Kimia', 'Biologi'];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground">Loading videos...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary/10 to-transparent py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-foreground mb-2 text-balance">
            Platform Pembelajaran Video
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Koleksi video pembelajaran dari SD hingga SMA
          </p>

          {/* Search Bar */}
          <div className="relative mb-8">
            <Search className="absolute left-4 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cari video pembelajaran..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-11"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Filters */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category Filter */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Tingkat Pendidikan</h3>
              <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                <TabsList className="w-full">
                  {categories.map(cat => (
                    <TabsTrigger key={cat} value={cat} className="flex-1">
                      {cat === 'all' ? 'Semua' : cat}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            {/* Subject Filter */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Mata Pelajaran</h3>
              <div className="flex flex-wrap gap-2">
                {subjects.map(subject => (
                  <Badge
                    key={subject}
                    variant={selectedSubject === subject ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setSelectedSubject(subject)}
                  >
                    {subject === 'all' ? 'Semua' : subject}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Videos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.length > 0 ? (
            filteredVideos.map(video => (
              <a
                key={video.id}
                href={`https://www.youtube.com/watch?v=${video.video_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                  <div className="relative aspect-video bg-muted overflow-hidden">
                    {video.thumbnail ? (
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <p className="text-muted-foreground">No thumbnail</p>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                      {video.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {video.description}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="secondary">{video.category}</Badge>
                      <Badge variant="outline">{video.subject}</Badge>
                    </div>
                  </div>
                </Card>
              </a>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground mb-2">Tidak ada video ditemukan</p>
              <p className="text-sm text-muted-foreground">
                Coba ubah filter atau cari dengan keyword lain
              </p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-center text-muted-foreground">
            Menampilkan <span className="font-semibold text-foreground">{filteredVideos.length}</span> dari{' '}
            <span className="font-semibold text-foreground">{videos.length}</span> video
          </p>
        </div>
      </div>
    </main>
  );
}
