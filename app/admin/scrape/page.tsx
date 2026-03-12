'use client';

import { useState } from 'react';

export default function ScrapeKelas612Page() {
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
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Scrape YouTube Videos for Kelas 6-12</h1>
      <p>This page will scrape real YouTube educational videos for Kelas 6-12</p>
      
      <button 
        onClick={handleScrape} 
        disabled={loading}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? 'Scraping... (This may take a few minutes)' : 'Start Scraping Kelas 6-12'}
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
