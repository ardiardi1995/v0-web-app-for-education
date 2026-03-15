'use client';

import { useState } from 'react';

export default function ScrapeAllClassesPage() {
  const [loading, setLoading] = useState<number | null>(null);
  const [result, setResult] = useState(null);
  const [logs, setLogs] = useState<string[]>([]);

  const handleScrapeByKelas = async (kelas: number) => {
    setLoading(kelas);
    setLogs([`Starting YouTube scrape for Kelas ${kelas}...`]);
    try {
      const response = await fetch('/api/scrape-by-kelas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kelas }),
      });
      const data = await response.json();
      setResult(data);
      setLogs(prev => [...prev, JSON.stringify(data, null, 2)]);
    } catch (error) {
      setResult({ error: error.message, success: false });
      setLogs(prev => [...prev, `Error: ${error.message}`]);
    } finally {
      setLoading(null);
    }
  };

  const handleInsertSampleData = async () => {
    setLoading(-1);
    setLogs(['Starting to insert sample educational data...']);
    try {
      const response = await fetch('/api/insert-sample-data', {
        method: 'POST',
      });
      const data = await response.json();
      setResult(data);
      setLogs(prev => [...prev, JSON.stringify(data, null, 2)]);
    } catch (error) {
      setResult({ error: error.message, success: false });
      setLogs(prev => [...prev, `Error: ${error.message}`]);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', overflow: 'auto', height: '100vh', scrollbarWidth: 'auto', scrollbarColor: '#888 #f1f1f1' }}>
      <style>{`
        ::-webkit-scrollbar { width: 12px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; }
        ::-webkit-scrollbar-thumb { background: #888; border-radius: 6px; }
        ::-webkit-scrollbar-thumb:hover { background: #555; }
        .kelas-group { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px; margin: 15px 0; }
        button { padding: 8px 12px; font-size: 14px; cursor: pointer; border: none; border-radius: 4px; transition: opacity 0.2s; }
        button:disabled { opacity: 0.6; cursor: not-allowed; }
        button:hover:not(:disabled) { opacity: 0.9; }
        .sd { background-color: #4CAF50; color: white; }
        .smp { background-color: #2196F3; color: white; }
        .sma { background-color: #FF9800; color: white; }
      `}</style>
      
      <h1>Scrape YouTube Videos Per Kelas</h1>
      <p>Click tombol di bawah untuk scrape YouTube videos untuk setiap kelas. Setiap kelas di-scrape terpisah agar quota API aman.</p>
      
      <div style={{ marginBottom: '30px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '4px', border: '1px solid #ffc107' }}>
        <h3 style={{ marginTop: 0, color: '#856404' }}>⚠️ YouTube API Quota Habis?</h3>
        <p style={{ color: '#856404' }}>Jika YouTube API terus mengembalikan error "quota exceeded", gunakan tombol di bawah untuk insert data sample yang siap pakai:</p>
        <button 
          onClick={handleInsertSampleData} 
          disabled={loading !== null}
          style={{
            padding: '12px 20px',
            fontSize: '16px',
            cursor: loading !== null ? 'not-allowed' : 'pointer',
            opacity: loading !== null ? 0.6 : 1,
            backgroundColor: '#ffc107',
            color: '#333',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 'bold',
          }}
        >
          {loading === -1 ? 'Inserting...' : '📥 Insert Sample Educational Data (Kelas 1-12)'}
        </button>
      </div>

      <h2>Atau Scrape Per Kelas dari YouTube</h2>
      <div className="kelas-group">
        {[1, 2, 3, 4, 5, 6].map(kelas => (
          <button
            key={kelas}
            onClick={() => handleScrapeByKelas(kelas)}
            disabled={loading !== null}
            className="sd"
          >
            {loading === kelas ? `Scraping...` : `Kelas ${kelas}`}
          </button>
        ))}
      </div>

      <h2>SMP Kelas 7-9</h2>
      <div className="kelas-group">
        {[7, 8, 9].map(kelas => (
          <button
            key={kelas}
            onClick={() => handleScrapeByKelas(kelas)}
            disabled={loading !== null}
            className="smp"
          >
            {loading === kelas ? `Scraping...` : `Kelas ${kelas}`}
          </button>
        ))}
      </div>

      <h2>SMA Kelas 10-12</h2>
      <div className="kelas-group">
        {[10, 11, 12].map(kelas => (
          <button
            key={kelas}
            onClick={() => handleScrapeByKelas(kelas)}
            disabled={loading !== null}
            className="sma"
          >
            {loading === kelas ? `Scraping...` : `Kelas ${kelas}`}
          </button>
        ))}
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
            {result.success ? '✓ Sukses!' : '✗ Error'}
          </h3>
          <p>{result.message || result.error}</p>
          {result.totalVideos && <p><strong>Total videos: {result.totalVideos}</strong></p>}
        </div>
      )}
    </div>
  );
}
