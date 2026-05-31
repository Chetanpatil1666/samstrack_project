import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:8080';

export default function Dashboard({ user, setView }) {
  const [stats, setStats] = useState({
    students: 0,
    subjects: 0,
    faculty: 0,
    attendanceCount: 0
  });
  const [recentRecords, setRecentRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [studentsRes, subjectsRes, facultyRes, attendanceRes] = await Promise.all([
          fetch(`${API_BASE}/student/get-all-students`).then(res => res.json()).catch(() => []),
          fetch(`${API_BASE}/subject/get-all-subjects`).then(res => res.json()).catch(() => []),
          fetch(`${API_BASE}/user/get-all-faculty`).then(res => res.json()).catch(() => []),
          fetch(`${API_BASE}/attendance/get-all-attendance-records`).then(res => res.json()).catch(() => [])
        ]);

        setStats({
          students: studentsRes.length,
          subjects: subjectsRes.length,
          faculty: facultyRes.length,
          attendanceCount: attendanceRes.length
        });

        // Sort by ID (which is YYYYMMDDHHmmssSSS string) descending to show newest first
        const sortedRecords = [...attendanceRes].sort((a, b) => b.id.localeCompare(a.id));
        setRecentRecords(sortedRecords.slice(0, 5));
      } catch (error) {
        console.error("Failed to load dashboard statistics:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="glass-card" style={{
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(99, 102, 241, 0.05))',
        border: '1px solid rgba(139, 92, 246, 0.2)',
        padding: '2rem 2.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.85rem', marginBottom: '0.5rem' }}>
            Hello, {user.firstName || user.username}! 👋
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Welcome to the SamsTrack Attendance Portal. Here is your overview for today.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => setView('attendance')} className="btn btn-primary">
            <svg className="nav-icon" viewBox="0 0 24 24">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
            Take Attendance
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: '1.25rem' }}>Loading Overview Statistics...</div>
        </div>
      ) : (
        <>
          <div className="grid-cols-4">
            <div className="glass-card hoverable stat-widget">
              <div className="stat-icon-container primary">
                <svg className="nav-icon" style={{ width: '28px', height: '28px' }} viewBox="0 0 24 24">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div className="stat-data">
                <span className="stat-value">{stats.students}</span>
                <span className="stat-label">Total Students</span>
              </div>
            </div>

            <div className="glass-card hoverable stat-widget">
              <div className="stat-icon-container secondary">
                <svg className="nav-icon" style={{ width: '28px', height: '28px' }} viewBox="0 0 24 24">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
              </div>
              <div className="stat-data">
                <span className="stat-value">{stats.subjects}</span>
                <span className="stat-label">Total Subjects</span>
              </div>
            </div>

            <div className="glass-card hoverable stat-widget">
              <div className="stat-icon-container success">
                <svg className="nav-icon" style={{ width: '28px', height: '28px' }} viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <div className="stat-data">
                <span className="stat-value">{stats.attendanceCount}</span>
                <span className="stat-label">Attendance Logs</span>
              </div>
            </div>

            <div className="glass-card hoverable stat-widget">
              <div className="stat-icon-container accent">
                <svg className="nav-icon" style={{ width: '28px', height: '28px' }} viewBox="0 0 24 24">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
              </div>
              <div className="stat-data">
                <span className="stat-value">{stats.faculty}</span>
                <span className="stat-label">Faculty Staff</span>
              </div>
            </div>
          </div>

          <div className="grid-cols-main-split">
            <div className="glass-card">
              <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                <h3>Recent Attendance Activity</h3>
                <button onClick={() => setView('attendance')} className="btn btn-secondary btn-sm">
                  View All History
                </button>
              </div>

              {recentRecords.length === 0 ? (
                <div className="empty-state">
                  <svg className="empty-state-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  <span>No attendance has been taken yet.</span>
                </div>
              ) : (
                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Date & Time</th>
                        <th>Subject</th>
                        <th>Students Present</th>
                        <th>Submitted By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentRecords.map((record) => (
                        <tr key={record.id}>
                          <td style={{ fontWeight: '500' }}>
                            {record.date} <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginLeft: '0.5rem' }}>{record.time}</span>
                          </td>
                          <td>
                            <span className="badge badge-secondary">{record.subject?.name || 'N/A'}</span>
                          </td>
                          <td>
                            <span style={{ fontWeight: '700', color: 'var(--success)' }}>
                              {record.numberOfStudents}
                            </span> present
                          </td>
                          <td>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                              @{record.user?.username || 'unknown'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h3>Quick Actions</h3>
              
              <button 
                onClick={() => setView('attendance')} 
                className="btn btn-secondary" 
                style={{ justifyContent: 'flex-start', padding: '1rem', width: '100%' }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  color: 'var(--success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '0.75rem'
                }}>✔</div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>Record Attendance</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Mark student presents for today</div>
                </div>
              </button>

              <button 
                onClick={() => setView('students')} 
                className="btn btn-secondary" 
                style={{ justifyContent: 'flex-start', padding: '1rem', width: '100%' }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(139, 92, 246, 0.1)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '0.75rem'
                }}>👤</div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>Manage Students</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>View, add or edit student profiles</div>
                </div>
              </button>

              <button 
                onClick={() => setView('subjects')} 
                className="btn btn-secondary" 
                style={{ justifyContent: 'flex-start', padding: '1rem', width: '100%' }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(99, 102, 241, 0.1)',
                  color: 'var(--secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '0.75rem'
                }}>📚</div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>Curriculum Subjects</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Configure subjects in the system</div>
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
