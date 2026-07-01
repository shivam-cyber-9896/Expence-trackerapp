import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { departmentService } from '../services';
import Logo from '../components/common/Logo';

export const Register = () => {
  const [formData, setFormData] = useState({
    employeeName: '',
    email: '',
    phone: '',
    designation: '',
    password: '',
    departmentId: '',
    role: 'ROLE_EMPLOYEE',
  });
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await departmentService.getAll({ page: 0, size: 100, sortBy: 'departmentName', direction: 'asc' });
        if (response && response.success && response.data) {
          const content = response.data.content || [];
          const filtered = content.filter(d => 
            d.departmentCode !== 'ADMIN' && 
            d.departmentName?.toUpperCase() !== 'ADMINISTRATION'
          );
          setDepartments(filtered);
        }
      } catch (err) {
        console.error('Failed to load departments for registration:', err);
      }
    };
    fetchDepartments();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!/^[A-Za-z ]{3,50}$/.test(formData.employeeName)) {
      setError('Employee name must be between 3 and 50 characters, alphabets only');
      return;
    }
    if (!/^[6-9][0-9]{9}$/.test(formData.phone)) {
      setError('Phone number must be a valid 10-digit number starting with 6-9');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      const payload = {
        ...formData,
        departmentId: Number(formData.departmentId),
      };

      const response = await register(payload);
      if (response && response.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Check details and retry.');
    }
  };

  return (
    <div style={styles.container}>
      <div className="card" style={styles.registerCard}>
        <div style={styles.logoContainer}>
          <Logo size={48} style={{ marginBottom: '12px' }} />
          <h2 style={styles.title}>Create Account</h2>
          <p style={styles.subtitle}>Register as an employee in the system</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && (
          <div className="alert alert-success">
            Registration successful! Redirecting to login...
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              name="employeeName"
              placeholder="John Doe"
              value={formData.employeeName}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <div style={styles.row}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="john.doe@company.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Phone Number (10 digit)</label>
              <input
                type="text"
                name="phone"
                placeholder="9876543210"
                value={formData.phone}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
          </div>

          <div style={styles.row}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Designation</label>
              <input
                type="text"
                name="designation"
                placeholder="Software Engineer"
                value={formData.designation}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                placeholder="••••••"
                value={formData.password}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Department</label>
            {departments.length === 0 ? (
              <input
                type="number"
                name="departmentId"
                placeholder="ID (e.g. 1)"
                value={formData.departmentId}
                onChange={handleChange}
                required
                className="form-input"
              />
            ) : (
              <select
                name="departmentId"
                value={formData.departmentId}
                onChange={handleChange}
                required
                className="form-select"
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.departmentId} value={dept.departmentId}>
                    {dept.departmentName}
                  </option>
                ))}
              </select>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="btn btn-primary"
            style={styles.submitBtn}
          >
            {loading ? 'Submitting...' : 'Register'}
          </button>
        </form>

        <div style={styles.footer}>
          <span style={styles.footerText}>Already have an account? </span>
          <Link to="/login" style={styles.link}>
            Sign In
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
  registerCard: {
    width: '100%',
    maxWidth: '520px',
    padding: '40px 32px',
    textAlign: 'center',
    backgroundColor: '#ffffff',
  },
  logoContainer: {
    marginBottom: '28px',
  },
  logo: {
    fontSize: '48px',
    display: 'inline-block',
    marginBottom: '12px',
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
  row: {
    display: 'flex',
    gap: '16px',
  },
  submitBtn: {
    width: '100%',
    padding: '12px',
    marginTop: '16px',
    fontSize: '15px',
  },
  footer: {
    marginTop: '24px',
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

export default Register;
