'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play } from 'lucide-react';
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
  const [selectedKelas, setSelectedKelas] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
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

  // Filter videos based on filters
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

    setFilteredVideos(result);
  }, [videos, selectedKelas, selectedSubject]);

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

          {/* Filters - Always visible with dropdown selects */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Kelas Filter Dropdown */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">Pilih Kelas</label>
              <select
                value={selectedKelas ?? ''}
                onChange={(e) => setSelectedKelas(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">-- Semua Kelas --</option>
                {kelas.map(k => (
                  <option key={k} value={k}>
                    Kelas {k}
                  </option>
                ))}
              </select>
            </div>

            {/* Mata Pelajaran Filter Dropdown */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">Mata Pelajaran</label>
              <select
                value={selectedSubject ?? ''}
                onChange={(e) => setSelectedSubject(e.target.value || null)}
                disabled={!selectedKelas}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">-- Semua Mata Pelajaran --</option>
                {selectedKelas && availableSubjects.map(subject => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filters Display */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
              {selectedKelas && (
                <Badge variant="secondary" className="gap-2">
                  Kelas {selectedKelas}
                </Badge>
              )}
              {selectedSubject && (
                <Badge variant="secondary" className="gap-2">
                  {selectedSubject}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

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
