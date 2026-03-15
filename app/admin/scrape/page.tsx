'use client';

import { useState, useEffect } from 'react';

export default function ScrapeAdminPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleScrape = async () => {
    setLoading(true);
    setLogs(['Starting YouTube scrape for kelas 1-3...']);
    setResult(null);
    
    try {
      const response = await fetch('/api/scrape-kelas-1-3-new', {
        method: 'POST',
      });
      const data = await response.json();
      
      setResult(data);
      setLogs(prev => [...prev, JSON.stringify(data, null, 2)]);
    } catch (error: any) {
      setResult({ error: error.message, success: false });
      setLogs(prev => [...prev, `Error: ${error.message}`]);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', maxWidth: '900px', margin: '0 auto' }} suppressHydrationWarning>
      <h1>Scrape YouTube Videos - Kelas 1-3</h1>
      <p>Scrape educational videos from YouTube for classes 1-3 (SD). This will insert all videos directly into the database.</p>
      
      <button 
        onClick={handleScrape} 
        disabled={loading}
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          fontWeight: 'bold',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? 'Scraping... Please wait (~3-5 minutes)' : 'START SCRAPE KELAS 1-3'}
      </button>

      {logs.length > 0 && (
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px', border: '1px solid #ddd', maxHeight: '300px', overflowY: 'auto' }}>
          <h3>Logs:</h3>
          {logs.map((log, idx) => (
            <pre key={idx} style={{ fontSize: '12px', margin: '5px 0', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {log}
            </pre>
          ))}
        </div>
      )}

      {result && (
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: result.success ? '#d4edda' : '#f8d7da', borderRadius: '4px', border: `1px solid ${result.success ? '#c3e6cb' : '#f5c6cb'}` }}>
          <h3 style={{ color: result.success ? '#155724' : '#721c24', marginTop: 0 }}>
            {result.success ? '✓ Success!' : '✗ Error'}
          </h3>
          <p style={{ color: result.success ? '#155724' : '#721c24' }}>
            {result.message || result.error}
          </p>
          {result.totalVideos && (
            <p style={{ color: result.success ? '#155724' : '#721c24', fontWeight: 'bold' }}>
              Total videos inserted: {result.totalVideos}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
