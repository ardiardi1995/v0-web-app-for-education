'use client';

import { useState } from 'react';

export default function ScrapeAllClassesPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [logs, setLogs] = useState<string[]>([]);

  const handleScrape = async () => {
    setLoading(true);
    setLogs(['Starting scrape for kelas 1-3 with IPAS and mandatory subjects...']);
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
      <h1>Scrape YouTube Videos for Kelas 1-3 (SD)</h1>
      <p>This page will scrape real YouTube educational videos for kelas 1-3 with the correct Indonesian curriculum:</p>
      <ul>
        <li><strong>IPAS</strong> (Ilmu Pengetahuan Alam dan Sosial) - replaces old IPA and IPS</li>
        <li><strong>Pendidikan Pancasila</strong></li>
        <li><strong>Pendidikan Agama Islam</strong></li>
        <li><strong>Seni Budaya</strong></li>
        <li><strong>PJOK</strong> (Pendidikan Jasmani, Olahraga, dan Kesehatan)</li>
        <li><strong>Matematika</strong></li>
        <li><strong>Bahasa Indonesia</strong></li>
      </ul>
      
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
          marginTop: '20px',
        }}
      >
        {loading ? 'Scraping... (This may take 5-10 minutes)' : 'Start Scraping Kelas 1-3 with IPAS & Mandatory Subjects'}
      </button>

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
