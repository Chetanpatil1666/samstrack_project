import { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import StudentsManager from './components/StudentsManager';
import SubjectsManager from './components/SubjectsManager';
import UsersManager from './components/UsersManager';
import AttendanceManager from './components/AttendanceManager';
import PromoPanel from './components/PromoPanel';

// Sidebar Icons declared outside the component to satisfy static-components rule
const DashboardIcon = () => (
  <svg className="nav-icon" viewBox="0 0 24 24">
    <rect x="3" y="3" width="7" height="9" />
    <rect x="14" y="3" width="7" height="5" />
    <rect x="14" y="12" width="7" height="9" />
    <rect x="3" y="16" width="7" height="5" />
  </svg>
);

const StudentsIcon = () => (
  <svg className="nav-icon" viewBox="0 0 24 24">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const SubjectsIcon = () => (
  <svg className="nav-icon" viewBox="0 0 24 24">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const AttendanceIcon = () => (
  <svg className="nav-icon" viewBox="0 0 24 24">
    <polyline points="9 11 12 14 22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);

const UsersIcon = () => (
  <svg className="nav-icon" viewBox="0 0 24 24">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="nav-icon" viewBox="0 0 24 24" style={{ stroke: 'var(--danger)' }}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const PromoIcon = () => (
  <svg className="nav-icon" viewBox="0 0 24 24">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'students', 'subjects', 'users', 'attendance'
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const cachedUser = localStorage.getItem('sams_user');
    if (cachedUser) {
      try {
        const parsed = JSON.parse(cachedUser);
        // Defer state update to avoid synchronous setState inside useEffect
        setTimeout(() => {
          setCurrentUser(parsed);
        }, 0);
      } catch (error) {
        console.error('Error parsing cached user:', error);
        localStorage.removeItem('sams_user');
      }
    }
    setTimeout(() => {
      setAuthChecked(true);
    }, 0);
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    localStorage.setItem('sams_user', JSON.stringify(user));
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('sams_user');
    setCurrentView('dashboard');
  };

  if (!authChecked) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-secondary)'
      }}>
        Verifying Session...
      </div>
    );
  }

  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const renderActiveView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard user={currentUser} setView={setCurrentView} />;
      case 'students':
        return <StudentsManager />;
      case 'subjects':
        return <SubjectsManager />;
      case 'users':
        if (currentUser.role === 'admin') {
          return <UsersManager />;
        }
        return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--danger)' }}>Unauthorized access. Admins only.</div>;
      case 'attendance':
        return <AttendanceManager currentUser={currentUser} />;
      case 'promo':
        return <PromoPanel />;
      default:
        return <Dashboard user={currentUser} setView={setCurrentView} />;
    }
  };

  const getInitials = (user) => {
    const f = user.firstName ? user.firstName[0] : '';
    const l = user.lastName ? user.lastName[0] : '';
    return (f + l).toUpperCase() || user.username.slice(0, 2).toUpperCase();
  };

  const getFullName = (user) => {
    if (user.firstName || user.lastName) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
    return user.username;
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="logo-section">
          <div className="logo-icon">S</div>
          <div className="logo-text">SamsTrack</div>
        </div>

        <nav style={{ flexGrow: 1 }}>
          <ul className="nav-menu">
            <li>
              <div 
                onClick={() => setCurrentView('dashboard')} 
                className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
              >
                <DashboardIcon />
                Dashboard
              </div>
            </li>
            <li>
              <div 
                onClick={() => setCurrentView('attendance')} 
                className={`nav-item ${currentView === 'attendance' ? 'active' : ''}`}
              >
                <AttendanceIcon />
                Attendance
              </div>
            </li>
            <li>
              <div 
                onClick={() => setCurrentView('students')} 
                className={`nav-item ${currentView === 'students' ? 'active' : ''}`}
              >
                <StudentsIcon />
                Students
              </div>
            </li>
            <li>
              <div 
                onClick={() => setCurrentView('subjects')} 
                className={`nav-item ${currentView === 'subjects' ? 'active' : ''}`}
              >
                <SubjectsIcon />
                Subjects
              </div>
            </li>
            {currentUser.role === 'admin' && (
              <li>
                <div 
                  onClick={() => setCurrentView('users')} 
                  className={`nav-item ${currentView === 'users' ? 'active' : ''}`}
                >
                  <UsersIcon />
                  Accounts
                </div>
              </li>
            )}
            <li>
              <div 
                onClick={() => setCurrentView('promo')} 
                className={`nav-item ${currentView === 'promo' ? 'active' : ''}`}
              >
                <PromoIcon />
                Showcase
              </div>
            </li>
          </ul>
        </nav>

        {/* User profile widget at the bottom */}
        <div className="user-profile-widget">
          <div className="profile-info">
            <div className="profile-avatar">
              {getInitials(currentUser)}
            </div>
            <div className="profile-meta">
              <span className="profile-name" title={getFullName(currentUser)}>
                {getFullName(currentUser)}
              </span>
              <span className="profile-role">
                {currentUser.role || 'faculty'}
              </span>
            </div>
          </div>
          <div 
            onClick={handleLogout} 
            className="nav-item"
            style={{ 
              color: 'var(--danger)', 
              padding: '0.5rem', 
              borderRadius: '8px',
              justifyContent: 'center',
              background: 'rgba(244, 63, 94, 0.05)',
              marginTop: '0.25rem',
              textAlign: 'center'
            }}
          >
            <LogoutIcon />
            <span style={{ fontWeight: '600' }}>Sign Out</span>
          </div>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="main-wrapper">
        {renderActiveView()}
      </main>
    </div>
  );
}
