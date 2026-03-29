import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (email, password) => setForm({ email, password });

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="logo-icon">🎓</div>
          <h1>College ERP</h1>
          <p>Admission Management System</p>
        </div>

        {error && <div className="login-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              placeholder="Enter your email"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              id="login-password"
              type="password"
              className="form-input"
              placeholder="Enter your password"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              required
            />
          </div>
          <button
            id="login-btn"
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : '→ Sign In'}
          </button>
        </form>

        <div className="login-demo">
          <p>Demo Accounts (click to fill):</p>
          <div className="demo-creds">
            <code
              style={{ cursor: 'pointer' }}
              onClick={() => fillDemo('admin@erp.com', 'admin123')}
            >
              🔑 Admin: admin@erp.com / admin123
            </code>
            <code
              style={{ cursor: 'pointer' }}
              onClick={() => fillDemo('officer@erp.com', 'officer123')}
            >
              📋 Officer: officer@erp.com / officer123
            </code>
            <code
              style={{ cursor: 'pointer' }}
              onClick={() => fillDemo('mgmt@erp.com', 'mgmt123')}
            >
              📊 Management: mgmt@erp.com / mgmt123
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
