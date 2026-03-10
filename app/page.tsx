'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Play, Filter, X } from 'lucide-react';
import Link from 'next/link';

interface Video {
  id: string;
  videoid: string;
  title: string;
  description: string;
  thumbnail: string;
  category: string;
  subject: string;
  kelas: number;
  createdat: string;
}

// Subject availability by kelas
const KELAS_SUBJECTS: Record<number, string[]> = {
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

export default function Home() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKelas, setSelectedKelas] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

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

    // Kelas filter
    if (selectedKelas) {
      result = result.filter(video => video.kelas === selectedKelas);
    }

    // Subject filter
    if (selectedSubject) {
      result = result.filter(video => video.subject === selectedSubject);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        video =>
          video.title.toLowerCase().includes(query) ||
          video.description.toLowerCase().includes(query) ||
          video.subject.toLowerCase().includes(query)
      );
    }

    setFilteredVideos(result);
  }, [videos, searchQuery, selectedKelas, selectedSubject]);

  // Get available subjects for selected kelas
  const availableSubjects = selectedKelas ? KELAS_SUBJECTS[selectedKelas] || [] : [];
  
  // Reset subject filter when kelas changes
  useEffect(() => {
    setSelectedSubject(null);
  }, [selectedKelas]);

  const kelas = Array.from({ length: 12 }, (_, i) => i + 1);
  
  const activeFilters = [selectedKelas ? `Kelas ${selectedKelas}` : null, selectedSubject].filter(Boolean);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary mx-auto mb-6"></div>
          <p className="text-lg text-foreground font-medium">Memuat video pembelajaran...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <div className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 text-balance">
              Perpustakaan Video Pembelajaran
            </h1>
            <p className="text-base text-muted-foreground">
              Ribuan video berkualitas untuk pembelajaran SD, SMP, dan SMA
            </p>
          </div>

          {/* Search Bar */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Cari video pembelajaran..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-11 rounded-lg"
              />
            </div>
            <Button
              variant={showFilters ? 'default' : 'outline'}
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className="rounded-lg"
            >
              <Filter className="h-5 w-5" />
            </Button>
          </div>

          {/* Active Filters Display */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {selectedKelas && (
                <Badge variant="secondary" className="gap-2">
                  Kelas {selectedKelas}
                  <button
                    onClick={() => setSelectedKelas(null)}
                    className="hover:text-foreground ml-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {selectedSubject && (
                <Badge variant="secondary" className="gap-2">
                  {selectedSubject}
                  <button
                    onClick={() => setSelectedSubject(null)}
                    className="hover:text-foreground ml-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {activeFilters.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedKelas(null);
                    setSelectedSubject(null);
                  }}
                  className="text-xs"
                >
                  Hapus Filter
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-muted/50 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Kelas Filter */}
              <div>
                <h3 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wide">
                  Pilih Kelas
                </h3>
                <div className="flex flex-wrap gap-2">
                  {kelas.map(k => (
                    <Button
                      key={k}
                      variant={selectedKelas === k ? 'default' : 'outline'}
                      onClick={() => setSelectedKelas(selectedKelas === k ? null : k)}
                      className="rounded-lg"
                      size="sm"
                    >
                      Kelas {k}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Subject Filter - Only shows subjects for selected kelas */}
              <div>
                <h3 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wide">
                  Mata Pelajaran
                </h3>
                {selectedKelas ? (
                  <div className="flex flex-wrap gap-2">
                    {availableSubjects.map(subject => (
                      <Button
                        key={subject}
                        variant={selectedSubject === subject ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedSubject(selectedSubject === subject ? null : subject)}
                        className="rounded-full text-xs"
                      >
                        {subject}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Pilih kelas terlebih dahulu</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Results Info */}
        <div className="mb-8">
          <p className="text-sm text-muted-foreground">
            Menampilkan <span className="font-semibold text-foreground">{filteredVideos.length}</span> dari{' '}
            <span className="font-semibold text-foreground">{videos.length}</span> video
          </p>
        </div>

        {/* Videos Grid */}
        {filteredVideos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
            {filteredVideos.map(video => (
              <Link
                key={video.id}
                href={`/video/${video.id}`}
                className="group h-full"
              >
                <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col border hover:border-primary/50 rounded-xl">
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-muted overflow-hidden">
                    {video.thumbnail ? (
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <div className="text-center">
                          <Play className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-xs text-muted-foreground">Tidak ada thumbnail</p>
                        </div>
                      </div>
                    )}
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                      <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg">
                        <Play className="h-7 w-7 text-primary fill-primary" />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors duration-200">
                      {video.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                      {video.description || 'Tidak ada deskripsi'}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs">{video.category}</Badge>
                      <Badge variant="outline" className="text-xs">{video.subject}</Badge>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="col-span-full">
            <Card className="p-12 text-center border-dashed">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Tidak ada video ditemukan</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Coba ubah filter atau gunakan kata kunci pencarian lain
              </p>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}
