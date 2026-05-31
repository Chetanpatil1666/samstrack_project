import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:8080';

export default function PromoPanel() {
  const [dbStatus, setDbStatus] = useState('Checking...');
  const [usersCount, setUsersCount] = useState(0);

  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await fetch(`${API_BASE}/user/get-all-user`);
        if (res.ok) {
          const data = await res.json();
          setUsersCount(data.length);
          setDbStatus('Connected (Active Pool)');
        } else {
          setDbStatus('API Connected, DB Error');
        }
      } catch (err) {
        console.error('Status check error:', err);
        setDbStatus('Offline');
      }
    }
    setTimeout(() => {
      checkStatus();
    }, 0);
  }, []);

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="page-header">
        <div className="header-title-sec">
          <h1>Platform Showcase</h1>
          <p>Explore the features, technical stack, and design implementation details of SamsTrack</p>
        </div>
      </div>

      <div className="grid-cols-2">
        {/* Left Card: Core Platform Features */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3>✨ Core Management Capabilities</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                color: 'var(--success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>✔</div>
              <div>
                <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>Interactive Roll Call</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  A seamless attendance registry. Toggle students present or absent with instant sync, a mass select utility, and timestamps down to milliseconds.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid rgba(139, 92, 246, 0.25)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>✔</div>
              <div>
                <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>Dual-Filtering Historic Logs</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Query past sessions using cross-filters by date and subject, displaying precise attendee lists and session statistics.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                color: 'var(--secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>✔</div>
              <div>
                <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>Course Directory Setup</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Flexible registry CRUD configurations for adding, editing, searching, and deleting students and curriculum subjects.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: Technical Highlights & Status */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3>⚙️ Technical Framework Stack</h3>

          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--card-border)',
            borderRadius: '16px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>CORS Origin Port</span>
              <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)' }}>4200 (Standard binding)</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Database Integration</span>
              <span style={{ fontWeight: 700, color: dbStatus.includes('Connected') ? 'var(--success)' : 'var(--danger)' }}>
                {dbStatus}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Active Portal Accounts</span>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{usersCount} registered</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Stability Status</span>
              <span style={{ fontWeight: 700, color: 'var(--success)', display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                Leak-proof DAO (Session Cleaned)
              </span>
            </div>
          </div>

          <div style={{
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            lineHeight: '1.5',
            background: 'rgba(139, 92, 246, 0.05)',
            border: '1px solid rgba(139, 92, 246, 0.15)',
            borderRadius: '12px',
            padding: '1rem'
          }}>
            <strong>🛡️ Database Session Safety Update:</strong> The Hibernate Session leak inside <code>UserDao.java</code> has been patched. Connections are now closed safely using <code>finally</code> blocks, eliminating database pool exhaustion.
          </div>
        </div>
      </div>

      {/* Full-width Card: System Architecture Mapping */}
      <div className="glass-card">
        <h3 style={{ marginBottom: '1rem' }}>📐 System Architecture Topology</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          SamsTrack implements a decoupled client-server architecture separating UI layout concerns from business logic processing.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--card-border)',
            borderRadius: '14px',
            padding: '1rem',
            textAlign: 'center'
          }}>
            <h5 style={{ color: 'var(--primary)', marginBottom: '0.25rem' }}>1. Presentation Layer</h5>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Vite + React Client, CSS Glassmorphism Engine, SVG Vectors</span>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--card-border)',
            borderRadius: '14px',
            padding: '1rem',
            textAlign: 'center'
          }}>
            <h5 style={{ color: 'var(--secondary)', marginBottom: '0.25rem' }}>2. REST controller Layer</h5>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Spring Boot MVC, CORS origin checks, Mapping endpoints</span>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--card-border)',
            borderRadius: '14px',
            padding: '1rem',
            textAlign: 'center'
          }}>
            <h5 style={{ color: 'var(--accent)', marginBottom: '0.25rem' }}>3. Data Access (DAO)</h5>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Hibernate SessionFactory query criteria, Transaction manager</span>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--card-border)',
            borderRadius: '14px',
            padding: '1rem',
            textAlign: 'center'
          }}>
            <h5 style={{ color: 'var(--success)', marginBottom: '0.25rem' }}>4. Storage Engine</h5>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>MySQL Database (Relational Tables, Auto-Schema builder)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
