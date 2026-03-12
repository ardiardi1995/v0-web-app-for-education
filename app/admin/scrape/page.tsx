'use client';

import { useState } from 'react';

export default function ScrapeKelas812Page() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleScrape = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/scrape-youtube-real', {
        method: 'POST',
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: error.message });
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
      `}</style>
      <h1>Scrape YouTube Videos for Kelas 8-12</h1>
      <p>This page will scrape real YouTube educational videos for Kelas 8-12</p>
      
      <button 
        onClick={handleScrape} 
        disabled={loading}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1,
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
        }}
      >
        {loading ? 'Scraping... (This may take several minutes)' : 'Start Scraping Kelas 8-12'}
      </button>

      {result && (
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
          <h3>{result.success ? 'Success!' : 'Error'}</h3>
          <p>{result.message || result.error}</p>
          {result.totalVideos && <p>Total videos inserted: {result.totalVideos}</p>}
        </div>
      )}
    </div>
  );
}
