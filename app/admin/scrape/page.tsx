'use client';

import { useState } from 'react';

export default function ScrapeAllClassesPage() {
  const [loading, setLoading] = useState(false);
  const [scrapingType, setScrapingType] = useState<'youtube' | 'sample' | null>(null);
  const [result, setResult] = useState(null);
  const [logs, setLogs] = useState<string[]>([]);

  const handleScrapeYouTube = async () => {
    setLoading(true);
    setScrapingType('youtube');
    setLogs(['Starting YouTube scrape for kelas 1-3...']);
    try {
      const response = await fetch('/api/scrape-youtube-real', {
        method: 'POST',
      });
      const data = await response.json();
      setResult(data);
      setLogs(prev => [...prev, JSON.stringify(data, null, 2)]);
    } catch (error) {
      setResult({ error: error.message, success: false });
      setLogs(prev => [...prev, `Error: ${error.message}`]);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedSampleData = async () => {
    setLoading(true);
    setScrapingType('sample');
    setLogs(['Starting to seed sample educational videos...']);
    try {
      const response = await fetch('/api/seed-sample-videos', {
        method: 'POST',
      });
      const data = await response.json();
      setResult(data);
      setLogs(prev => [...prev, JSON.stringify(data, null, 2)]);
    } catch (error) {
      setResult({ error: error.message, success: false });
      setLogs(prev => [...prev, `Error: ${error.message}`]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', overflow: 'auto', height: '100vh', scrollbarWidth: 'auto', scrollbarColor: '#888 #f1f1f1' }}>
      <style>{`
        /* For Chrome, Edge, and Safari */
        ::-webkit-scrollbar {
          width: 12px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        ::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 6px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
        button {
          margin-right: 10px;
          margin-bottom: 10px;
        }
      `}</style>
      <h1>Populate Database with Educational Videos</h1>
      <p>Choose one of the options below to populate the database with videos for classes 1-3:</p>
      
      <div style={{ marginTop: '20px', paddingBottom: '20px', borderBottom: '2px solid #ddd' }}>
        <h2>Option 1: YouTube Real Videos (Requires YouTube API Key)</h2>
        <p>Scrapes real educational videos from YouTube for classes 1-3. Note: This may hit API quota limits.</p>
        <button 
          onClick={handleScrapeYouTube} 
          disabled={loading}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            cursor: loading && scrapingType === 'youtube' ? 'not-allowed' : 'pointer',
            opacity: loading && scrapingType === 'youtube' ? 0.6 : 1,
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
          }}
        >
          {loading && scrapingType === 'youtube' ? 'Scraping YouTube... (This may take 5-10 minutes)' : 'Scrape from YouTube'}
        </button>
      </div>

      <div style={{ marginTop: '20px', paddingBottom: '20px', borderBottom: '2px solid #ddd' }}>
        <h2>Option 2: Seed Sample Educational Videos (Recommended)</h2>
        <p>Inserts high-quality sample educational videos for classes 1-3 with all subjects:</p>
        <ul>
          <li>Matematika</li>
          <li>Bahasa Indonesia</li>
          <li>IPAS (Ilmu Pengetahuan Alam dan Sosial)</li>
          <li>Pendidikan Pancasila</li>
          <li>Pendidikan Agama Islam</li>
          <li>Seni Budaya</li>
          <li>PJOK (Pendidikan Jasmani, Olahraga, dan Kesehatan)</li>
        </ul>
        <p><strong>Total: 112 videos (16 per subject/class combination)</strong></p>
        <button 
          onClick={handleSeedSampleData} 
          disabled={loading}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            cursor: loading && scrapingType === 'sample' ? 'not-allowed' : 'pointer',
            opacity: loading && scrapingType === 'sample' ? 0.6 : 1,
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
          }}
        >
          {loading && scrapingType === 'sample' ? 'Seeding Sample Data...' : 'Seed Sample Videos (Fast & Reliable)'}
        </button>
      </div>

      {logs.length > 0 && (
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px', border: '1px solid #ddd', maxHeight: '300px', overflowY: 'auto' }}>
          <h3>Progress Logs:</h3>
          {logs.map((log, idx) => (
            <pre key={idx} style={{ fontSize: '12px', margin: '5px 0', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {log}
            </pre>
          ))}
        </div>
      )}

      {result && (
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: result.success ? '#d4edda' : '#f8d7da', borderRadius: '4px', border: `1px solid ${result.success ? '#c3e6cb' : '#f5c6cb'}` }}>
          <h3 style={{ color: result.success ? '#155724' : '#721c24' }}>
            {result.success ? '✓ Success!' : '✗ Error'}
          </h3>
          <p>{result.message || result.error}</p>
          {result.totalVideos && <p><strong>Total videos inserted: {result.totalVideos}</strong></p>}
        </div>
      )}
    </div>
  );
}
