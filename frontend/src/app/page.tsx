"use client";
import { useEffect, useState } from 'react';

type Incident = {
  id: string;
  title: string;
  description: string;
  rootCause: string | null;
  suggestedFix: string | null;
  status: string;
  createdAt: string;
};

export default function Home() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/incidents');
      const data = await res.json();
      setIncidents(data);
    } catch (err) {
      console.error("Failed to fetch incidents", err);
    } finally {
      setLoading(false);
    }
  };

  const triggerMockIncident = async () => {
    try {
      await fetch('http://localhost:3001/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: "SELECT * FROM users WHERE last_login > '2023-01-01' ORDER BY created_at DESC;",
          executionCount: 1500,
          totalTimeMs: 1800000,
          meanTimeMs: 1200,
          maxTimeMs: 4500
        })
      });
      // Refresh list after a small delay to allow LLM analysis mock to complete
      setTimeout(fetchIncidents, 2500);
    } catch (err) {
      console.error("Failed to trigger mock incident", err);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <div>
          <h1>DevOps Incident Copilot</h1>
          <p style={{color: '#94a3b8', margin: 0}}>AI-Powered Infrastructure Monitoring & Diagnosis</p>
        </div>
        <button className="btn btn-primary" onClick={triggerMockIncident}>
          Simulate Outage
        </button>
      </header>

      <main>
        {loading ? (
          <div className="empty-state">Loading active incidents...</div>
        ) : incidents.length === 0 ? (
          <div className="empty-state">
            <h2>All Systems Operational</h2>
            <p>No performance regressions or incidents detected.</p>
          </div>
        ) : (
          <div className="grid">
            {incidents.map((incident) => (
              <div key={incident.id} className="card">
                <div className="card-header">
                  <h3 className="card-title">{incident.title}</h3>
                  <span className={`badge ${incident.status === 'OPEN' ? 'badge-danger' : 'badge-success'}`}>
                    {incident.status}
                  </span>
                </div>
                
                <p style={{color: '#cbd5e1', fontSize: '0.875rem', lineHeight: '1.5'}}>
                  {incident.description}
                </p>
                
                {incident.rootCause ? (
                  <>
                    <div className="section-label">AI Root Cause Analysis</div>
                    <p style={{color: '#f8fafc', fontSize: '0.875rem'}}>{incident.rootCause}</p>
                    
                    <div className="section-label">Suggested Fix</div>
                    <div className="code-block">{incident.suggestedFix}</div>
                  </>
                ) : (
                  <p style={{color: '#94a3b8', fontSize: '0.875rem', fontStyle: 'italic', marginTop: '1rem'}}>
                    Copilot is analyzing the root cause...
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
