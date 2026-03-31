'use client';

import { useState, useEffect } from 'react';

export default function ScrapeKelas56Page() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleScrape = async () => {
    setLoading(true);
    setLogs(['Starting YouTube scrape for kelas 5-6...']);
    setResult(null);
    
    try {
      const response = await fetch('/api/scrape-kelas-5-6-new', {
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
      <style>{`
        /* Custom scrollbar styling */
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
        .logs-container {
          scrollbar-width: auto;
          scrollbar-color: #888 #f1f1f1;
        }
      `}</style>

      <h1>Scrape YouTube Videos - Kelas 5-6 (SMP)</h1>
      <p>Scrape educational videos from YouTube for classes 5-6 (SMP - Junior High School). This will insert all videos directly into the database.</p>
      
      <button 
        onClick={handleScrape} 
        disabled={loading}
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          fontWeight: 'bold',
          backgroundColor: '#2196F3',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? 'Scraping... Please wait (~5-8 minutes)' : 'START SCRAPE KELAS 5-6'}
      </button>

      {logs.length > 0 && (
        <div className="logs-container" style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px', border: '1px solid #ddd', maxHeight: '400px', overflowY: 'auto' }}>
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
            <>
              <p style={{ color: result.success ? '#155724' : '#721c24', fontWeight: 'bold' }}>
                Total videos inserted: {result.totalVideos}
              </p>
              <p style={{ color: result.success ? '#155724' : '#721c24' }}>
                Total searches: {result.totalSearched} | API Errors: {result.apiErrors}
              </p>
              {result.details && result.details.length > 0 && (
                <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: `1px solid ${result.success ? '#c3e6cb' : '#f5c6cb'}` }}>
                  <h4>Details:</h4>
                  <table style={{ fontSize: '12px', width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${result.success ? '#c3e6cb' : '#f5c6cb'}` }}>
                        <th style={{ textAlign: 'left', padding: '5px' }}>Subject</th>
                        <th style={{ textAlign: 'center', padding: '5px' }}>Class</th>
                        <th style={{ textAlign: 'center', padding: '5px' }}>Found</th>
                        <th style={{ textAlign: 'center', padding: '5px' }}>Inserted</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.details.map((detail: any, idx: number) => (
                        <tr key={idx} style={{ borderBottom: `1px solid ${result.success ? '#c3e6cb' : '#f5c6cb'}` }}>
                          <td style={{ padding: '5px' }}>{detail.subject}</td>
                          <td style={{ textAlign: 'center', padding: '5px' }}>{detail.kelas}</td>
                          <td style={{ textAlign: 'center', padding: '5px' }}>{detail.found}</td>
                          <td style={{ textAlign: 'center', padding: '5px', fontWeight: 'bold' }}>{detail.inserted}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
