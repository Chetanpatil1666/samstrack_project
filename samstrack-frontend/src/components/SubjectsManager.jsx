import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:8080';

export default function SubjectsManager() {
  const [subjects, setSubjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentSubject, setCurrentSubject] = useState({ id: '', name: '' });
  const [formName, setFormName] = useState('');

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/subject/get-all-subjects`);
      if (response.ok) {
        const data = await response.json();
        setSubjects(data);
      } else {
        setError('Failed to fetch subjects.');
      }
    } catch (err) {
      console.error('Fetch subjects error:', err);
      setError('Connection error: Could not reach the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Defer execution to satisfy react-hooks/set-state-in-effect rule
    setTimeout(() => {
      fetchSubjects();
    }, 0);
  }, []);

  const handleOpenAddModal = () => {
    setModalMode('add');
    setFormName('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (subject) => {
    setModalMode('edit');
    setCurrentSubject(subject);
    setFormName(subject.name);
    setIsModalOpen(true);
  };

  const handleSaveSubject = async (e) => {
    e.preventDefault();
    setError('');

    const payload = {
      name: formName
    };

    if (modalMode === 'edit') {
      payload.id = currentSubject.id;
    }

    try {
      const url = modalMode === 'edit'
        ? `${API_BASE}/subject/update-subject`
        : `${API_BASE}/subject/add-subject`;

      const method = modalMode === 'edit' ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setIsModalOpen(false);
        fetchSubjects();
      } else {
        setError(`Failed to ${modalMode} subject.`);
      }
    } catch (err) {
      console.error('Save subject error:', err);
      setError('Connection error: Could not save subject.');
    }
  };

  const handleDeleteSubject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) return;
    setError('');

    try {
      const response = await fetch(`${API_BASE}/subject/delete-subject/${id}`, {
        method: 'DELETE'
      });
      const text = await response.text();
      if (response.ok && text.includes('Deleted')) {
        fetchSubjects();
      } else {
        setError(text || 'Failed to delete subject.');
      }
    } catch (err) {
      console.error('Delete subject error:', err);
      setError('Connection error: Could not delete subject.');
    }
  };

  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(subject.id).includes(searchTerm)
  );

  // Helper to generate initials for subject icon
  const getSubjectInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .slice(0, 3)
      .toUpperCase();
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="page-header">
        <div className="header-title-sec">
          <h1>Curriculum Subjects</h1>
          <p>Configure course subjects taught by the faculty</p>
        </div>
        <button onClick={handleOpenAddModal} className="btn btn-primary">
          <svg className="nav-icon" viewBox="0 0 24 24" style={{ width: '18px', height: '18px' }}>
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add New Subject
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
            placeholder="Search subjects by name or course ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            Loading subjects...
          </div>
        ) : filteredSubjects.length === 0 ? (
          <div className="empty-state">
            <svg className="empty-state-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span>{searchTerm ? 'No subjects match your query.' : 'No subjects registered.'}</span>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {filteredSubjects.map((subject) => (
              <div key={subject.id} className="glass-card hoverable" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.25rem 1.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    background: 'rgba(99, 102, 241, 0.1)',
                    border: '1px solid rgba(99, 102, 241, 0.25)',
                    color: 'var(--secondary)',
                    fontWeight: '700',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {getSubjectInitials(subject.name)}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', marginBottom: '0.15rem' }}>{subject.name}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-heading)' }}>
                      ID: #{subject.id}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <button
                    onClick={() => handleOpenEditModal(subject)}
                    className="btn-icon-only"
                    style={{ width: '32px', height: '32px', borderRadius: '8px' }}
                    title="Edit Subject"
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => handleDeleteSubject(subject.id)}
                    className="btn-icon-only"
                    style={{ width: '32px', height: '32px', borderRadius: '8px', color: 'var(--danger)' }}
                    title="Delete Subject"
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">
                {modalMode === 'edit' ? 'Update Subject Details' : 'Add Course Subject'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.5rem' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveSubject}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Subject Name</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Advanced Java Programming"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
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
                  {modalMode === 'edit' ? 'Save Changes' : 'Add Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
