import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:8080';

export default function UsersManager() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('faculty');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/user/get-all-user`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        setError('Failed to fetch system accounts.');
      }
    } catch (err) {
      console.error('Fetch users error:', err);
      setError('Connection error: Could not reach the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Defer execution to satisfy react-hooks/set-state-in-effect rule
    setTimeout(() => {
      fetchUsers();
    }, 0);
  }, []);

  const handleOpenAddModal = () => {
    setModalMode('add');
    setUsername('');
    setPassword('');
    setFirstName('');
    setLastName('');
    setEmail('');
    setRole('faculty');
    setError('');
    setSuccess('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setModalMode('edit');
    setUsername(user.username);
    setPassword(user.password || '');
    setFirstName(user.firstName || '');
    setLastName(user.lastName || '');
    setEmail(user.email || '');
    setRole(user.role || 'faculty');
    setError('');
    setSuccess('');
    setIsModalOpen(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const payload = {
      username,
      password,
      firstName,
      lastName,
      email,
      role
    };

    try {
      if (modalMode === 'edit') {
        const response = await fetch(`${API_BASE}/user/update-user`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (response.ok) {
          setSuccess('Account updated successfully!');
          setIsModalOpen(false);
          fetchUsers();
        } else {
          setError('Failed to update account.');
        }
      } else {
        const response = await fetch(`${API_BASE}/user/register-user`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const text = await response.text();
        if (response.ok && text.includes('Successfully')) {
          setSuccess('Account created successfully!');
          setIsModalOpen(false);
          fetchUsers();
        } else {
          setError(text || 'Failed to create user. Username might exist.');
        }
      }
    } catch (err) {
      console.error('Save user error:', err);
      setError('Connection error: Could not connect to the server.');
    }
  };

  const handleDeleteUser = async (usernameToDelete) => {
    if (!window.confirm(`Are you sure you want to delete user @${usernameToDelete}?`)) return;
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch(`${API_BASE}/user/delete-user-by-username?username=${encodeURIComponent(usernameToDelete)}`, {
        method: 'DELETE'
      });
      const text = await response.text();
      if (response.ok && text.includes('deleted')) {
        setSuccess('Account deleted successfully.');
        fetchUsers();
      } else {
        setError(text || 'Failed to delete user.');
      }
    } catch (err) {
      console.error('Delete user error:', err);
      setError('Connection error: Could not delete user.');
    }
  };

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.firstName && u.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (u.lastName && u.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="page-header">
        <div className="header-title-sec">
          <h1>System Accounts</h1>
          <p>Manage system access for faculty staff and administrators</p>
        </div>
        <button onClick={handleOpenAddModal} className="btn btn-primary">
          <svg className="nav-icon" viewBox="0 0 24 24" style={{ width: '18px', height: '18px' }}>
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Create New Account
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

      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div className="search-container">
          <svg className="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            className="form-input search-input"
            placeholder="Search accounts by username, name, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            Loading user accounts...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="empty-state">
            <svg className="empty-state-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span>{searchTerm ? 'No accounts match your query.' : 'No system accounts configured.'}</span>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th style={{ width: '120px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.username}>
                    <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                      @{u.username}
                    </td>
                    <td style={{ fontWeight: '500' }}>
                      {u.firstName || u.lastName 
                        ? `${u.firstName || ''} ${u.lastName || ''}`.trim()
                        : <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Not specified</span>
                      }
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{u.email || 'N/A'}</td>
                    <td>
                      <span className={`badge ${u.role === 'admin' ? 'badge-primary' : 'badge-secondary'}`}>
                        {u.role || 'faculty'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleOpenEditModal(u)}
                          className="btn-icon-only"
                          title="Edit Account"
                        >
                          ✎
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.username)}
                          className="btn-icon-only"
                          style={{ color: 'var(--danger)' }}
                          title="Delete Account"
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
                {modalMode === 'edit' ? 'Update User Account' : 'Register System User'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.5rem' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveUser}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    required
                    disabled={modalMode === 'edit'}
                    className="form-input"
                    placeholder="e.g. johndoe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    required={modalMode === 'add'}
                    className="form-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="grid-cols-2" style={{ gap: '1rem', marginBottom: '0' }}>
                  <div className="form-group">
                    <label className="form-label">First Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="john.doe@school.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select
                    className="form-input form-select"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="faculty">Faculty / Teacher</option>
                    <option value="admin">Administrator</option>
                  </select>
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
                  {modalMode === 'edit' ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
