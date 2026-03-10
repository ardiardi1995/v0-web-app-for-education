'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
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

export default function VideoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideoAndRelated = async () => {
      try {
        const response = await fetch('/api/videos');
        if (!response.ok) throw new Error('Failed to fetch videos');
        const data = await response.json();
        const allVideos = data.videos || [];

        const currentVideo = allVideos.find((v: Video) => v.id === id);
        setVideo(currentVideo || null);

        if (currentVideo) {
          const related = allVideos
            .filter((v: Video) => v.subject === currentVideo.subject && v.id !== id)
            .slice(0, 6);
          setRelatedVideos(related);
        }
      } catch (err) {
        console.error('Error fetching video:', err);
        setError('Gagal memuat video');
      } finally {
        setLoading(false);
      }
    };

    fetchVideoAndRelated();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary mx-auto mb-6"></div>
          <p className="text-lg text-foreground font-medium">Memuat video...</p>
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Link href="/">
            <Button variant="ghost" className="gap-2 mb-8">
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Beranda
            </Button>
          </Link>
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-foreground mb-2">Video Tidak Ditemukan</h1>
            <p className="text-muted-foreground">{error || 'Maaf, video yang Anda cari tidak ada.'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link href="/">
          <Button variant="ghost" className="gap-2 mb-8">
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Beranda
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Player Section */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden rounded-xl border">
              {/* YouTube Embedded Player */}
              <div className="relative w-full bg-black" style={{ aspectRatio: '16 / 9' }}>
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${video.videoid}?autoplay=0&controls=1&modestbranding=0&rel=0&fs=1&iv_load_policy=3`}
                  title={video.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </Card>

            {/* Video Info */}
            <div className="mt-8">
              <h1 className="text-3xl font-bold text-foreground mb-4 text-balance">
                {video.title}
              </h1>

              <div className="flex flex-wrap gap-3 mb-8">
                <Badge className="text-sm px-3 py-1">{video.category}</Badge>
                <Badge variant="outline" className="text-sm px-3 py-1">
                  {video.subject}
                </Badge>
              </div>

              <div className="border-t border-border pt-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">Deskripsi</h2>
                <p className="text-base text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {video.description || 'Tidak ada deskripsi untuk video ini.'}
                </p>
              </div>
            </div>
          </div>

          {/* Related Videos Sidebar */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold text-foreground mb-6">Video Terkait</h3>
            <div className="space-y-4">
              {relatedVideos.length > 0 ? (
                relatedVideos.map(relatedVideo => (
                  <Link key={relatedVideo.id} href={`/video/${relatedVideo.id}`}>
                    <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer h-full">
                      <div className="relative aspect-video bg-muted overflow-hidden">
                        {relatedVideo.thumbnail ? (
                          <img
                            src={relatedVideo.thumbnail}
                            alt={relatedVideo.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                            <p className="text-xs text-muted-foreground">No thumbnail</p>
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="font-medium text-sm text-foreground line-clamp-2">
                          {relatedVideo.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {relatedVideo.subject}
                        </p>
                      </div>
                    </Card>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Tidak ada video terkait.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
