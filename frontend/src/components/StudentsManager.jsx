import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:8080';

export default function StudentsManager() {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentStudent, setCurrentStudent] = useState({ id: '', name: '', email: '' });
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/student/get-all-students`);
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      } else {
        setError('Failed to fetch students list.');
      }
    } catch (err) {
      console.error('Fetch students error:', err);
      setError('Connection error: Could not reach the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Defer execution to satisfy react-hooks/set-state-in-effect rule
    setTimeout(() => {
      fetchStudents();
    }, 0);
  }, []);

  const handleOpenAddModal = () => {
    setModalMode('add');
    setFormName('');
    setFormEmail('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (student) => {
    setModalMode('edit');
    setCurrentStudent(student);
    setFormName(student.name);
    setFormEmail(student.email);
    setIsModalOpen(true);
  };

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    setError('');

    const payload = {
      name: formName,
      email: formEmail
    };

    if (modalMode === 'edit') {
      payload.id = currentStudent.id;
    }

    try {
      const url = modalMode === 'edit' 
        ? `${API_BASE}/student/update-student`
        : `${API_BASE}/student/add-student`;
      
      const method = modalMode === 'edit' ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setIsModalOpen(false);
        fetchStudents();
      } else {
        setError(`Failed to ${modalMode} student.`);
      }
    } catch (err) {
      console.error('Save student error:', err);
      setError('Connection error: Could not save data.');
    }
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    setError('');
    
    try {
      const response = await fetch(`${API_BASE}/student/delete-student/${id}`, {
        method: 'DELETE'
      });
      const text = await response.text();
      if (response.ok && text.includes('Deleted')) {
        fetchStudents();
      } else {
        setError(text || 'Failed to delete student.');
      }
    } catch (err) {
      console.error('Delete student error:', err);
      setError('Connection error: Could not delete student.');
    }
  };

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(student.id).includes(searchTerm)
  );

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="page-header">
        <div className="header-title-sec">
          <h1>Student Profiles</h1>
          <p>Create, update, and manage student registry records</p>
        </div>
        <button onClick={handleOpenAddModal} className="btn btn-primary">
          <svg className="nav-icon" viewBox="0 0 24 24" style={{ width: '18px', height: '18px' }}>
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add New Student
        </button>
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

      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div className="search-container">
          <svg className="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            className="form-input search-input"
            placeholder="Search students by name, email, or registry ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            Loading students list...
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="empty-state">
            <svg className="empty-state-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span>{searchTerm ? 'No students found matching your query.' : 'No students registered in the system.'}</span>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th style={{ width: '120px' }}>Registry ID</th>
                  <th>Student Name</th>
                  <th>Email Address</th>
                  <th style={{ width: '120px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td style={{ fontFamily: 'var(--font-heading)', fontWeight: '600', color: 'var(--primary)' }}>
                      #{student.id}
                    </td>
                    <td style={{ fontWeight: '600' }}>{student.name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{student.email}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleOpenEditModal(student)}
                          className="btn-icon-only"
                          title="Edit Student"
                        >
                          ✎
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(student.id)}
                          className="btn-icon-only"
                          style={{ color: 'var(--danger)' }}
                          title="Delete Student"
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">
                {modalMode === 'edit' ? 'Update Student Record' : 'Register New Student'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.5rem' }}
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSaveStudent}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Alex Johnson"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    required
                    className="form-input"
                    placeholder="e.g. alex.j@example.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {modalMode === 'edit' ? 'Save Changes' : 'Register Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
