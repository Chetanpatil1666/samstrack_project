import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:8080';

export default function AnalyticsManager() {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  
  // Filter States
  const [selectedSubjectId, setSelectedSubjectId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalyticsData() {
      try {
        const [studentsRes, subjectsRes, recordsRes] = await Promise.all([
          fetch(`${API_BASE}/student/get-all-students`).then(res => res.json()).catch(() => []),
          fetch(`${API_BASE}/subject/get-all-subjects`).then(res => res.json()).catch(() => []),
          fetch(`${API_BASE}/attendance/get-all-attendance-records`).then(res => res.json()).catch(() => [])
        ]);

        setStudents(studentsRes);
        setSubjects(subjectsRes);
        setAttendanceRecords(recordsRes);
      } catch (error) {
        console.error("Failed to load analytics data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchAnalyticsData();
  }, []);

  // 1. Calculate general stats
  const totalClassesConducted = attendanceRecords.length;

  // Compute attendance stats per student
  const studentMetrics = students.map(student => {
    // Overall stats
    let overallConducted = totalClassesConducted;
    let overallAttended = 0;

    // Subject-wise stats
    const subjectBreakdown = {};
    subjects.forEach(sub => {
      subjectBreakdown[sub.id] = { conducted: 0, attended: 0 };
    });

    // Parse attendance records to count attendance
    attendanceRecords.forEach(record => {
      const subId = record.subject?.id;
      if (subId && subjectBreakdown[subId]) {
        subjectBreakdown[subId].conducted += 1;
      }

      // Check if student was present in this record
      const isPresent = record.students?.some(s => s.id === student.id);
      if (isPresent) {
        overallAttended += 1;
        if (subId && subjectBreakdown[subId]) {
          subjectBreakdown[subId].attended += 1;
        }
      }
    });

    return {
      id: student.id,
      name: student.name,
      email: student.email,
      overallConducted,
      overallAttended,
      subjectBreakdown
    };
  });

  // Calculate stats based on selection
  let displayMetrics = [];
  let aggregateAvgAttendance = 0;
  let atRiskCount = 0;
  let conductedCountForDisplay = 0;

  if (selectedSubjectId === 'all') {
    conductedCountForDisplay = totalClassesConducted;
    displayMetrics = studentMetrics.map(metrics => {
      const percentage = metrics.overallConducted > 0 
        ? Math.round((metrics.overallAttended / metrics.overallConducted) * 100) 
        : 100;
      
      if (percentage < 75) atRiskCount += 1;
      
      return {
        ...metrics,
        conducted: metrics.overallConducted,
        attended: metrics.overallAttended,
        percentage
      };
    });
  } else {
    const subId = Number(selectedSubjectId);
    // Count classes conducted for this specific subject
    conductedCountForDisplay = attendanceRecords.filter(r => r.subject?.id === subId).length;

    displayMetrics = studentMetrics.map(metrics => {
      const breakdown = metrics.subjectBreakdown[subId] || { conducted: 0, attended: 0 };
      const percentage = conductedCountForDisplay > 0 
        ? Math.round((breakdown.attended / conductedCountForDisplay) * 100) 
        : 100;

      if (percentage < 75) atRiskCount += 1;

      return {
        ...metrics,
        conducted: conductedCountForDisplay,
        attended: breakdown.attended,
        percentage
      };
    });
  }

  // Calculate Average Attendance Rate across all display students
  if (displayMetrics.length > 0) {
    const sum = displayMetrics.reduce((acc, curr) => acc + curr.percentage, 0);
    aggregateAvgAttendance = Math.round(sum / displayMetrics.length);
  } else {
    aggregateAvgAttendance = 100;
  }

  // Find Top Performing Subject
  let topPerformingSubject = 'N/A';
  let bestSubjectRate = -1;

  subjects.forEach(sub => {
    const records = attendanceRecords.filter(r => r.subject?.id === sub.id);
    if (records.length > 0) {
      let totalAttendanceSum = 0;
      let totalOpportunity = records.length * students.length;
      
      if (totalOpportunity > 0) {
        records.forEach(r => {
          totalAttendanceSum += r.students?.length || 0;
        });
        const avg = Math.round((totalAttendanceSum / totalOpportunity) * 100);
        if (avg > bestSubjectRate) {
          bestSubjectRate = avg;
          topPerformingSubject = `${sub.name} (${avg}%)`;
        }
      }
    }
  });

  // Filter display metrics by search query
  const filteredMetrics = displayMetrics.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(m.id).includes(searchQuery)
  );

  // Helper styles for progress bar color and status
  const getStatusMeta = (percentage) => {
    if (percentage >= 85) {
      return { 
        label: 'Excellent', 
        badgeClass: 'badge-success', 
        color: 'var(--success)', 
        glow: 'var(--success-glow)' 
      };
    } else if (percentage >= 75) {
      return { 
        label: 'Good', 
        badgeClass: 'badge-primary', 
        color: 'var(--primary)', 
        glow: 'var(--primary-glow)' 
      };
    } else if (percentage >= 60) {
      return { 
        label: 'Warning', 
        badgeClass: 'badge-secondary', 
        color: 'var(--warning)', 
        glow: 'rgba(245, 158, 11, 0.3)' 
      };
    } else {
      return { 
        label: 'Critical', 
        badgeClass: 'badge-danger', 
        color: 'var(--danger)', 
        glow: 'var(--danger-glow)' 
      };
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Page Header */}
      <div className="page-header print-hidden">
        <div className="header-title-sec">
          <h1>Attendance Analytics</h1>
          <p>Analyze performance metrics, average yields, and student attendance risks</p>
        </div>
        <div className="header-actions">
          <button onClick={handlePrint} className="btn btn-secondary">
            <svg className="nav-icon" viewBox="0 0 24 24">
              <path d="M6 9V2h12v7" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Print Report
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: '1.25rem' }}>Loading Performance Data...</div>
        </div>
      ) : (
        <>
          {/* Printable Report Title Section */}
          <div className="print-only-block" style={{ display: 'none', marginBottom: '2rem', borderBottom: '2px solid #ccc', paddingBottom: '1rem' }}>
            <h1 style={{ color: '#000', fontSize: '2.2rem' }}>SamsTrack Attendance Yield Report</h1>
            <p style={{ color: '#555', marginTop: '0.25rem' }}>
              Generated Date: {new Date().toLocaleDateString()} | 
              Filtered Course: {selectedSubjectId === 'all' ? 'All Subjects' : subjects.find(s => s.id === Number(selectedSubjectId))?.name || ''}
            </p>
          </div>

          {/* Metric KPI cards */}
          <div className="grid-cols-4 print-kpis">
            <div className="glass-card hoverable stat-widget" style={{ padding: '1.5rem' }}>
              <div className="stat-icon-container secondary">
                <svg className="nav-icon" style={{ width: '28px', height: '28px' }} viewBox="0 0 24 24">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              </div>
              <div className="stat-data">
                <span className="stat-value">{conductedCountForDisplay}</span>
                <span className="stat-label">Sessions Tracked</span>
              </div>
            </div>

            <div className="glass-card hoverable stat-widget" style={{ padding: '1.5rem' }}>
              <div className="stat-icon-container success">
                <svg className="nav-icon" style={{ width: '28px', height: '28px' }} viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4l3 3" />
                </svg>
              </div>
              <div className="stat-data">
                <span className="stat-value" style={{ color: aggregateAvgAttendance >= 75 ? 'var(--success)' : 'var(--warning)' }}>
                  {aggregateAvgAttendance}%
                </span>
                <span className="stat-label">Avg Attendance Rate</span>
              </div>
            </div>

            <div className="glass-card hoverable stat-widget" style={{ padding: '1.5rem' }}>
              <div className="stat-icon-container accent">
                <svg className="nav-icon" style={{ width: '28px', height: '28px' }} viewBox="0 0 24 24">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </div>
              <div className="stat-data">
                <span className="stat-value" style={{ color: atRiskCount > 0 ? 'var(--danger)' : 'var(--text-primary)' }}>
                  {atRiskCount}
                </span>
                <span className="stat-label">At-Risk Students (&lt;75%)</span>
              </div>
            </div>

            <div className="glass-card hoverable stat-widget" style={{ padding: '1.5rem' }}>
              <div className="stat-icon-container primary">
                <svg className="nav-icon" style={{ width: '28px', height: '28px' }} viewBox="0 0 24 24">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <div className="stat-data" style={{ overflow: 'hidden' }}>
                <span className="stat-value" style={{ fontSize: '1.15rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', minHeight: '31px', display: 'flex', alignItems: 'center' }}>
                  {topPerformingSubject}
                </span>
                <span className="stat-label">Top Course Yield</span>
              </div>
            </div>
          </div>

          {/* Filters card */}
          <div className="glass-card print-hidden" style={{ padding: '1.25rem 1.75rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', flex: '1 1 auto' }}>
                <div className="form-group" style={{ marginBottom: 0, minWidth: '220px' }}>
                  <label className="form-label">Filter Course Subject</label>
                  <select
                    className="form-input form-select"
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                  >
                    <option value="all">All Subjects (Overall)</option>
                    {subjects.map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group" style={{ marginBottom: 0, minWidth: '280px' }}>
                  <label className="form-label">Search Student</label>
                  <div className="search-container" style={{ marginBottom: 0 }}>
                    <svg className="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ left: '0.85rem' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      className="form-input"
                      style={{ paddingLeft: '2.5rem', paddingY: '0.65rem' }}
                      placeholder="Search by name, ID or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Analytics Table */}
          <div className="glass-card print-card" style={{ padding: '1.5rem' }}>
            <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
              <h3>Student Progress Directory</h3>
              <span className="badge badge-secondary print-hidden" style={{ textTransform: 'none' }}>
                Displaying {filteredMetrics.length} of {students.length} Students
              </span>
            </div>

            {filteredMetrics.length === 0 ? (
              <div className="empty-state">
                <svg className="empty-state-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>No attendance stats match your selection criteria.</span>
              </div>
            ) : (
              <div className="table-container">
                <table className="custom-table print-table">
                  <thead>
                    <tr>
                      <th style={{ width: '80px' }}>ID</th>
                      <th>Student Registry Name</th>
                      <th>Email Address</th>
                      <th>Attended Sessions</th>
                      <th style={{ minWidth: '180px' }}>Attendance Yield</th>
                      <th style={{ width: '120px', textAlign: 'right' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMetrics.map(metrics => {
                      const statusMeta = getStatusMeta(metrics.percentage);
                      return (
                        <tr key={metrics.id}>
                          <td style={{ fontWeight: '700', color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>
                            #{metrics.id}
                          </td>
                          <td style={{ fontWeight: '600' }}>{metrics.name}</td>
                          <td style={{ color: 'var(--text-secondary)' }}>{metrics.email}</td>
                          <td>
                            <span style={{ fontWeight: '700', color: metrics.percentage >= 75 ? 'var(--text-primary)' : 'var(--danger)' }}>
                              {metrics.attended}
                            </span>
                            <span style={{ color: 'var(--text-muted)' }}> / {metrics.conducted}</span>
                          </td>
                          <td>
                            {/* Premium Progress Bar Wrapper */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <span style={{ minWidth: '35px', fontWeight: '800', color: statusMeta.color, fontSize: '0.85rem' }}>
                                {metrics.percentage}%
                              </span>
                              <div style={{
                                flexGrow: 1,
                                height: '8px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                borderRadius: '4px',
                                overflow: 'hidden',
                                position: 'relative'
                              }}>
                                <div style={{
                                  width: `${metrics.percentage}%`,
                                  height: '100%',
                                  background: statusMeta.color,
                                  boxShadow: `0 0 10px ${statusMeta.glow}`,
                                  borderRadius: '4px',
                                  transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                                }} />
                              </div>
                            </div>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <span className={`badge ${statusMeta.badgeClass}`}>
                              {statusMeta.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Embedded CSS Rules for Print Screen functionality */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
            font-size: 12pt;
          }
          .print-hidden, .sidebar, .page-header, .header-actions {
            display: none !important;
          }
          .main-wrapper {
            margin-left: 0 !important;
            max-width: 100% !important;
            padding: 0 !important;
          }
          .glass-card {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
          }
          .custom-table th {
            background: #eee !important;
            color: #333 !important;
            border-bottom: 2px solid #333 !important;
          }
          .custom-table td {
            color: #111 !important;
            border-bottom: 1px solid #ccc !important;
          }
          .badge {
            border: 1px solid #777 !important;
            color: #333 !important;
            background: transparent !important;
          }
          .print-only-block {
            display: block !important;
          }
          .print-kpis {
            grid-template-columns: repeat(4, 1fr) !important;
            gap: 10px !important;
            margin-bottom: 1.5rem !important;
          }
          .print-kpis .glass-card {
            border: 1px solid #ddd !important;
            padding: 10px !important;
            text-align: center;
          }
          .stat-icon-container {
            display: none !important;
          }
          .stat-value {
            font-size: 1.4rem !important;
            color: #000 !important;
          }
          .stat-label {
            font-size: 0.75rem !important;
            color: #555 !important;
          }
        }
      `}</style>
    </div>
  );
}
