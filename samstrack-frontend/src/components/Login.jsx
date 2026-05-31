import { useState } from 'react';

const API_BASE = 'http://localhost:8080';

export default function Login({ onLoginSuccess }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('faculty');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (isRegistering) {
      // Register logic
      try {
        const response = await fetch(`${API_BASE}/user/register-user`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username,
            password,
            firstName,
            lastName,
            email,
            role
          })
        });
        const text = await response.text();
        if (response.ok && text.includes('Successfully')) {
          setSuccess('Registration successful! Please login.');
          setIsRegistering(false);
        } else {
          setError(text || 'Registration failed. Username may already exist.');
        }
      } catch (err) {
        console.error('Registration error:', err);
        setError('Network error: Is the backend server running?');
      } finally {
        setLoading(false);
      }
    } else {
      // Login logic
      try {
        const response = await fetch(`${API_BASE}/user/login-user`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        if (response.ok) {
          const text = await response.text();
          if (!text || text === 'null') {
            setError('Invalid username or password.');
            setLoading(false);
            return;
          }
          const user = JSON.parse(text);
          if (user && user.username) {
            onLoginSuccess(user);
          } else {
            setError('Invalid username or password.');
          }
        } else {
          setError('Invalid credentials.');
        }
      } catch (err) {
        console.error('Login error:', err);
        setError('Network error: Is the backend server running?');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '1.5rem'
    }}>
      <div className="glass-card fade-in" style={{
        width: '100%',
        maxWidth: '450px',
        padding: '2.5rem',
        border: '1px solid var(--card-border-glow)',
        boxShadow: '0 20px 50px rgba(139, 92, 246, 0.15)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            width: '60px',
            height: '60px',
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px var(--primary-glow)',
            color: 'white',
            fontWeight: '800',
            fontSize: '1.75rem',
            margin: '0 auto 1rem'
          }}>S</div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', background: 'linear-gradient(to right, #fff, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {isRegistering ? 'Create Portal Account' : 'Welcome back'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {isRegistering ? 'Register as administrator or faculty member' : 'Sign in to manage student attendance'}
          </p>
        </div>

        {error && (
          <div className="badge badge-danger fade-in" style={{
            width: '100%',
            padding: '0.75rem 1rem',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            display: 'block',
            textAlign: 'center',
            fontSize: '0.85rem'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div className="badge badge-success fade-in" style={{
            width: '100%',
            padding: '0.75rem 1rem',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            display: 'block',
            textAlign: 'center',
            fontSize: '0.85rem'
          }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              required
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
              required
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {isRegistering && (
            <>
              <div className="grid-cols-2" style={{ gap: '1rem', marginBottom: '0' }}>
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    required
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
                    required
                    className="form-input"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  required
                  className="form-input"
                  placeholder="john.doe@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">System Role</label>
                <select
                  className="form-input form-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="faculty">Faculty / Teacher</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            </>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '0.85rem', marginTop: '1rem', fontSize: '1rem' }}
          >
            {loading ? 'Processing...' : (isRegistering ? 'Register Account' : 'Sign In')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button
            type="button"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.9rem'
            }}
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError('');
              setSuccess('');
            }}
          >
            {isRegistering ? 'Already have an account? Sign In' : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
}
