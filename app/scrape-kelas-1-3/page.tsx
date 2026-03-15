'use client';

import { useState } from 'react';

export default function ScrapePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [logs, setLogs] = useState<string[]>([]);

  const handleScrape = async () => {
    setLoading(true);
    setLogs(['Starting scrape for kelas 1-3...']);
    try {
      const response = await fetch('/api/scrape-kelas-1-3-new', { method: 'POST' });
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
    <div style={{ padding: '40px', fontFamily: 'Arial', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Scrape Kelas 1-3 dari YouTube</h1>
      <p>Scrape videos untuk kelas 1-3 dengan API key baru</p>
      
      <button 
        onClick={handleScrape} 
        disabled={loading}
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1,
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
        }}
      >
        {loading ? 'Scraping...' : 'Start Scrape Kelas 1-3'}
      </button>

      {logs.length > 0 && (
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px', maxHeight: '400px', overflowY: 'auto' }}>
          <h3>Logs:</h3>
          {logs.map((log, idx) => (
            <pre key={idx} style={{ fontSize: '12px', margin: '5px 0', whiteSpace: 'pre-wrap' }}>
              {log}
            </pre>
          ))}
        </div>
      )}

      {result && (
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: result.success ? '#d4edda' : '#f8d7da', borderRadius: '4px' }}>
          <h3>{result.success ? '✓ Success!' : '✗ Error'}</h3>
          <p>{result.message || result.error}</p>
          {result.totalVideos && <p><strong>Total: {result.totalVideos} videos</strong></p>}
        </div>
      )}
    </div>
  );
}
