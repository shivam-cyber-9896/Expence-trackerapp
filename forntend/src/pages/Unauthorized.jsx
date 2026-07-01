import { Link } from 'react-router-dom';

export const Unauthorized = () => {
  return (
    <div style={styles.container}>
      <span style={styles.icon}>🚫</span>
      <h1 style={styles.title}>Unauthorized Access</h1>
      <p style={styles.message}>
        You do not have the required permissions to view this resource.
      </p>
      <Link to="/dashboard" className="btn btn-secondary">
        Back to Dashboard
      </Link>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '80vh',
    textAlign: 'center',
    color: 'var(--text-main)',
    padding: '20px',
  },
  icon: {
    fontSize: '64px',
    marginBottom: '20px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '800',
    color: 'var(--danger)',
    margin: '0 0 10px 0',
  },
  message: {
    fontSize: '16px',
    color: 'var(--text-muted)',
    maxWidth: '400px',
    margin: '0 0 28px 0',
    lineHeight: '1.5',
  },
};

export default Unauthorized;
