import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Logo from '../components/common/Logo';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    }
  };

  return (
    <div style={styles.container}>
      <div className="card" style={styles.loginCard}>
        <div style={styles.logoContainer}>
          <Logo size={48} style={{ marginBottom: '12px' }} />
          <h2 style={styles.title}>Welcome Back</h2>
          <p style={styles.subtitle}>Sign in to your ExpenseControl account</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={styles.submitBtn}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={styles.footer}>
          <span style={styles.footerText}>New to the system? </span>
          <Link to="/register" style={styles.link}>
            Request account
          </Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: 'var(--bg-app)',
    padding: '20px',
  },
  loginCard: {
    width: '100%',
    maxWidth: '420px',
    padding: '40px 32px',
    textAlign: 'center',
    backgroundColor: '#ffffff',
  },
  logoContainer: {
    marginBottom: '32px',
  },
  logo: {
    fontSize: '48px',
    display: 'inline-block',
    marginBottom: '16px',
  },
  title: {
    color: 'var(--text-main)',
    fontSize: '24px',
    fontWeight: '800',
    margin: '0 0 8px 0',
  },
  subtitle: {
    color: 'var(--text-muted)',
    fontSize: '14px',
    margin: 0,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  submitBtn: {
    width: '100%',
    padding: '12px',
    marginTop: '16px',
    fontSize: '15px',
  },
  footer: {
    marginTop: '28px',
    fontSize: '14px',
  },
  footerText: {
    color: 'var(--text-muted)',
  },
  link: {
    color: 'var(--primary)',
    textDecoration: 'none',
    fontWeight: '700',
  },
};

export default Login;
