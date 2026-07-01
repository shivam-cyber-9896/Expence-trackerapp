import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

/**
 * Route protection wrapper component.
 * Redirects to login if user is not authenticated.
 * Restricts access based on roles if allowedRoles is specified.
 */
export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Verifying credentials...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page but save the current location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const hasRole = allowedRoles.includes(user?.role);
    if (!hasRole) {
      // Redirect to dashboard if they don't have permission
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

const styles = {
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    fontFamily: '"Outfit", sans-serif',
  },
  spinner: {
    border: '4px solid rgba(255, 255, 255, 0.1)',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    borderLeftColor: '#6366f1',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    marginTop: '16px',
    fontSize: '16px',
    fontWeight: '500',
  },
};

// Add standard keyframe CSS programmatically or rely on CSS stylesheets
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(styleSheet);
}

export default ProtectedRoute;
