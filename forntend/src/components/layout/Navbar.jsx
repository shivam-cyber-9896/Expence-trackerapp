import { FiMenu } from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';
import Logo from '../common/Logo';

export const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();

  return (
    <nav style={styles.navbar}>
      <div style={styles.left}>
        <button onClick={toggleSidebar} style={styles.collapseBtn} title="Toggle Sidebar">
          <FiMenu size={20} />
        </button>
        <div style={styles.brand}>
          <Logo size={24} style={{ marginRight: '10px' }} />
          <span style={styles.brandText}>ExpenseControl</span>
        </div>
      </div>
      
      <div style={styles.right}>
        {user && (
          <div style={styles.userInfo}>
            <div style={styles.profile}>
              <div style={styles.avatar}>
                {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
              </div>
              <div style={styles.meta}>
                <span style={styles.email}>{user.email}</span>
                <span className="badge badge-role">{user.role}</span>
              </div>
            </div>
            <button onClick={logout} style={styles.logoutButton}>
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '70px',
    padding: '0 24px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid var(--border-color)',
    color: 'var(--text-main)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: 'var(--shadow-sm)',
    fontFamily: 'var(--font-family)',
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  collapseBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6px',
    borderRadius: '8px',
    transition: 'background-color 0.2s',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  brandIcon: {
    fontSize: '24px',
  },
  brandText: {
    fontSize: '18px',
    fontWeight: '800',
    letterSpacing: '-0.5px',
    color: 'var(--primary)',
  },
  center: {
    flex: '0 1 400px',
  },
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: '30px',
    padding: '6px 16px',
    width: '100%',
    border: '1px solid transparent',
    transition: 'border-color 0.2s',
  },
  searchIcon: {
    color: 'var(--text-muted)',
    marginRight: '8px',
  },
  searchInput: {
    background: 'none',
    border: 'none',
    outline: 'none',
    width: '100%',
    fontSize: '13px',
    color: 'var(--text-main)',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  iconBtn: {
    position: 'relative',
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s',
  },
  badgeDot: {
    position: 'absolute',
    top: '6px',
    right: '6px',
    width: '8px',
    height: '8px',
    backgroundColor: 'var(--danger)',
    borderRadius: '50%',
    border: '2px solid #ffffff',
  },
  profile: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  avatar: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary-light)',
    color: 'var(--primary)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontWeight: '700',
    fontSize: '16px',
    border: '2px solid var(--primary)',
  },
  meta: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  email: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-main)',
  },
  logoutButton: {
    backgroundColor: 'transparent',
    border: '1px solid var(--danger)',
    color: 'var(--danger)',
    padding: '6px 16px',
    borderRadius: '30px', // rounded button
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};

export default Navbar;
