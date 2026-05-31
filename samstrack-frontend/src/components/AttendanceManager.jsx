import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:8080';

export default function AttendanceManager({ currentUser }) {
  const [activeTab, setActiveTab] = useState('take'); // 'take' or 'history'
  
  // Data lists
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  
  // Take Attendance Form States
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
  const [presentStudentIds, setPresentStudentIds] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');

  // History Filter States
  const [filterDate, setFilterDate] = useState('');
  const [filterSubjectId, setFilterSubjectId] = useState('');
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [isFiltered, setIsFiltered] = useState(false);
  const [selectedRecordDetails, setSelectedRecordDetails] = useState(null); // For details modal

  // Status indicators
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchSubjects = async () => {
    try {
      const res = await fetch(`${API_BASE}/subject/get-all-subjects`);
      if (res.ok) {
        const data = await res.json();
        setSubjects(data);
        if (data.length > 0) setSelectedSubjectId(data[0].id);
      }
    } catch (err) {
      console.error('Fetch subjects error:', err);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch(`${API_BASE}/student/get-all-students`);
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      }
    } catch (err) {
      console.error('Fetch students error:', err);
    }
  };

  const fetchAttendanceHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/attendance/get-all-attendance-records`);
      if (res.ok) {
        const data = await res.json();
        // Sort descending by ID
        const sorted = data.sort((a, b) => b.id.localeCompare(a.id));
        setAttendanceRecords(sorted);
        setFilteredRecords(sorted);
      }
    } catch (err) {
      console.error('Fetch attendance logs error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Defer execution to satisfy react-hooks/set-state-in-effect rule
    setTimeout(() => {
      fetchSubjects();
      fetchStudents();
      fetchAttendanceHistory();
    }, 0);
  }, []);

  const handleStudentToggle = (studentId) => {
    setPresentStudentIds(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    const visibleStudentIds = students
      .filter(s => s.name.toLowerCase().includes(studentSearch.toLowerCase()))
      .map(s => s.id);
    
    // Union existing and visible
    setPresentStudentIds(prev => {
      const union = new Set([...prev, ...visibleStudentIds]);
      return Array.from(union);
    });
  };

  const handleDeselectAll = () => {
    const visibleStudentIds = students
      .filter(s => s.name.toLowerCase().includes(studentSearch.toLowerCase()))
      .map(s => s.id);

    // Subtract visible from present
    setPresentStudentIds(prev => prev.filter(id => !visibleStudentIds.includes(id)));
  };

  const handleSubmitAttendance = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedSubjectId) {
      setError('Please select a subject first.');
      return;
    }

    setLoading(true);
    const payload = {
      username: currentUser.username,
      subjectId: Number(selectedSubjectId),
      date: date,
      time: time,
      studentIds: presentStudentIds,
      numberOfStudents: presentStudentIds.length
    };

    try {
      const response = await fetch(`${API_BASE}/attendance/take-attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setSuccess('Attendance record submitted successfully!');
        setPresentStudentIds([]);
        fetchAttendanceHistory();
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setError('Failed to submit attendance.');
      }
    } catch (err) {
      console.error('Submit attendance error:', err);
      setError('Connection error: Could not save attendance record.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = async (e) => {
    e.preventDefault();
    if (!filterDate || !filterSubjectId) {
      setError('Please select both a date and a subject to filter.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/attendance/get-attendance-by-date-subjet/${filterDate}/${filterSubjectId}`);
      if (response.ok) {
        const data = await response.json();
        setFilteredRecords(data);
        setIsFiltered(true);
      } else {
        setError('Failed to filter attendance records.');
      }
    } catch (err) {
      console.error('Filter attendance error:', err);
      setError('Connection error: Could not reach the server.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilter = () => {
    setFilterDate('');
    setFilterSubjectId('');
    setFilteredRecords(attendanceRecords);
    setIsFiltered(false);
    setError('');
  };

  const filteredStudentsList = students.filter(s =>
    s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    String(s.id).includes(studentSearch)
  );

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="page-header">
        <div className="header-title-sec">
          <h1>Attendance Tracking</h1>
          <p>Record student attendance or review historic attendance data</p>
        </div>
        <div style={{
          display: 'flex',
          background: 'var(--bg-tertiary)',
          padding: '4px',
          borderRadius: '12px',
          border: '1px solid var(--card-border)'
        }}>
          <button 
            onClick={() => { setActiveTab('take'); setError(''); setSuccess(''); }} 
            className={`btn btn-sm ${activeTab === 'take' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: 'none', background: activeTab === 'take' ? undefined : 'transparent' }}
          >
            Take Attendance
          </button>
          <button 
            onClick={() => { setActiveTab('history'); setError(''); setSuccess(''); }} 
            className={`btn btn-sm ${activeTab === 'history' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: 'none', background: activeTab === 'history' ? undefined : 'transparent' }}
          >
            Attendance Logs
          </button>
        </div>
      </div>

      {error && (
        <div className="badge badge-danger fade-in" style={{
          padding: '0.75rem 1rem',
          borderRadius: '12px',
          display: 'block',
          textAlign: 'center',
          fontSize: '0.85rem'
        }}>
          {error}
        </div>
      )}

      {success && (
        <div className="badge badge-success fade-in" style={{
          padding: '0.75rem 1rem',
          borderRadius: '12px',
          display: 'block',
          textAlign: 'center',
          fontSize: '0.85rem'
        }}>
          {success}
        </div>
      )}

      {activeTab === 'take' ? (
        <div className="grid-cols-main-split">
          {/* Left panel: Config and Students List */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="flex-between">
              <h3>Roll Call Registry</h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="button" onClick={handleSelectAll} className="btn btn-secondary btn-sm">
                  Select All
                </button>
                <button type="button" onClick={handleDeselectAll} className="btn btn-secondary btn-sm">
                  Deselect All
                </button>
              </div>
            </div>

            <div className="search-container" style={{ marginBottom: '0.5rem' }}>
              <svg className="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                className="form-input search-input"
                placeholder="Search students by name or ID..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
              />
            </div>

            {students.length === 0 ? (
              <div className="empty-state">
                No students registered in the system. Add students first.
              </div>
            ) : filteredStudentsList.length === 0 ? (
              <div className="empty-state">
                No students match your search.
              </div>
            ) : (
              <div style={{ maxHeight: '450px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                {filteredStudentsList.map(student => {
                  const isPresent = presentStudentIds.includes(student.id);
                  return (
                    <div 
                      key={student.id} 
                      onClick={() => handleStudentToggle(student.id)}
                      className={`student-attendance-row ${isPresent ? 'present' : ''}`}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '700', minWidth: '40px' }}>
                          #{student.id}
                        </span>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{student.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{student.email}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '0.8rem', color: isPresent ? 'var(--success)' : 'var(--text-secondary)', fontWeight: '600' }}>
                          {isPresent ? 'PRESENT' : 'ABSENT'}
                        </span>
                        <div className="checkbox-custom" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right panel: Session Details & Submit */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '20px' }}>
            <h3>Session Parameters</h3>
            
            <form onSubmit={handleSubmitAttendance} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Subject Course</label>
                <select
                  required
                  className="form-input form-select"
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                >
                  <option value="" disabled>-- Choose Subject --</option>
                  {subjects.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  required
                  className="form-input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Time</label>
                <input
                  type="time"
                  required
                  className="form-input"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--card-border)',
                borderRadius: '12px',
                padding: '1rem',
                textAlign: 'center',
                margin: '0.5rem 0'
              }}>
                <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--success)', lineHeight: '1.1' }}>
                  {presentStudentIds.length}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>
                  Students Present / Total: {students.length}
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={loading || students.length === 0}
                style={{ width: '100%', padding: '0.85rem' }}
              >
                {loading ? 'Submitting...' : 'Submit Attendance Roll'}
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* History View */
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <form onSubmit={handleApplyFilter} style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            gap: '1rem',
            borderBottom: '1px solid var(--card-border)',
            paddingBottom: '1.5rem'
          }}>
            <div className="form-group" style={{ flex: '1 1 200px', marginBottom: 0 }}>
              <label className="form-label">Filter Date</label>
              <input
                type="date"
                required
                className="form-input"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>
            
            <div className="form-group" style={{ flex: '1 1 200px', marginBottom: 0 }}>
              <label className="form-label">Filter Subject</label>
              <select
                required
                className="form-input form-select"
                value={filterSubjectId}
                onChange={(e) => setFilterSubjectId(e.target.value)}
              >
                <option value="">-- Select Subject --</option>
                {subjects.map(sub => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', height: '43px' }}>
              <button type="submit" className="btn btn-primary btn-sm" style={{ height: '100%', padding: '0 1.5rem' }}>
                Filter
              </button>
              {isFiltered && (
                <button type="button" onClick={handleClearFilter} className="btn btn-secondary btn-sm" style={{ height: '100%', padding: '0 1.5rem' }}>
                  Clear Filter
                </button>
              )}
            </div>
          </form>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              Loading logs history...
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="empty-state">
              <svg className="empty-state-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>No attendance logs found matching this search.</span>
            </div>
          ) : (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Log Session ID</th>
                    <th>Date & Time</th>
                    <th>Course Subject</th>
                    <th>Attendance Yield</th>
                    <th>Facilitator</th>
                    <th style={{ width: '120px', textAlign: 'right' }}>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map(record => (
                    <tr key={record.id}>
                      <td style={{ fontFamily: 'var(--font-heading)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        #{record.id}
                      </td>
                      <td style={{ fontWeight: '600' }}>
                        {record.date} <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginLeft: '0.25rem' }}>{record.time}</span>
                      </td>
                      <td>
                        <span className="badge badge-secondary">{record.subject?.name || 'N/A'}</span>
                      </td>
                      <td>
                        <span className="badge badge-success" style={{ fontWeight: '700' }}>
                          {record.numberOfStudents} Present
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                          @{record.user?.username || 'unknown'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => setSelectedRecordDetails(record)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                        >
                          View List
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Details Dialog */}
      {selectedRecordDetails && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Attendance Details</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                  Session ID: #{selectedRecordDetails.id}
                </p>
              </div>
              <button
                onClick={() => setSelectedRecordDetails(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.5rem' }}
              >
                &times;
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--card-border)',
                borderRadius: '16px',
                padding: '1rem'
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: '600' }}>Subject</div>
                  <div style={{ fontWeight: '700', color: 'var(--primary)' }}>{selectedRecordDetails.subject?.name || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: '600' }}>Facilitator</div>
                  <div style={{ fontWeight: '700' }}>@{selectedRecordDetails.user?.username || 'unknown'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: '600' }}>Date</div>
                  <div style={{ fontWeight: '700' }}>{selectedRecordDetails.date}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: '600' }}>Time</div>
                  <div style={{ fontWeight: '700' }}>{selectedRecordDetails.time}</div>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>
                  Students Present ({selectedRecordDetails.students?.length || 0})
                </h4>
                
                {!selectedRecordDetails.students || selectedRecordDetails.students.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)' }}>
                    No students marked present.
                  </div>
                ) : (
                  <div style={{
                    maxHeight: '300px',
                    overflowY: 'auto',
                    border: '1px solid var(--card-border)',
                    borderRadius: '12px',
                    padding: '0.5rem'
                  }}>
                    {selectedRecordDetails.students.map(student => (
                      <div key={student.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.6rem 0.85rem',
                        borderBottom: '1px solid var(--card-border)',
                        fontSize: '0.9rem'
                      }}>
                        <div>
                          <span style={{ fontWeight: '600' }}>{student.name}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>({student.email})</span>
                        </div>
                        <span style={{ color: 'var(--success)', fontWeight: '700', fontSize: '0.8rem' }}>✔ PRESENT</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setSelectedRecordDetails(null)}
                className="btn btn-secondary"
              >
                Close details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
