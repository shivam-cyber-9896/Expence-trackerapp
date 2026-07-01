import { NavLink } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { 
  FiGrid, 
  FiFolder, 
  FiUsers, 
  FiTag, 
  FiDollarSign, 
  FiCheckSquare, 
  FiBriefcase, 
  FiTrendingUp, 
  FiSettings 
} from 'react-icons/fi';

export const Sidebar = ({ collapsed }) => {
  const { user } = useAuth();
  
  const isManagerOrAdmin = user?.role === 'ROLE_ADMIN';
  const isAdmin = user?.role === 'ROLE_ADMIN';

  const menuItems = [
    { to: '/dashboard', label: 'Dashboard', icon: <FiGrid size={18} />, show: true },
    { to: '/claims', label: 'Expense Claims', icon: <FiDollarSign size={18} />, show: true },
    { to: '/budgets', label: 'Department Budgets', icon: <FiBriefcase size={18} />, show: isManagerOrAdmin },
    { to: '/departments', label: 'Departments', icon: <FiFolder size={18} />, show: isAdmin },
    { to: '/employees', label: 'Employees', icon: <FiUsers size={18} />, show: isAdmin },
    { to: '/categories', label: 'Expense Categories', icon: <FiTag size={18} />, show: isAdmin },
    { to: '/reviews', label: 'Review Claims', icon: <FiCheckSquare size={18} />, show: isManagerOrAdmin },
    { to: '/monthly-summary', label: 'Monthly Summary', icon: <FiTrendingUp size={18} />, show: isManagerOrAdmin },
    { to: '/settings', label: 'Settings', icon: <FiSettings size={18} />, show: true },
  ];

  return (
    <aside style={{
      ...styles.sidebar,
      width: collapsed ? '70px' : '260px',
    }}>
      <div style={styles.menuList}>
        {menuItems.map((item, index) => {
          if (!item.show) return null;
          
          return (
            <NavLink 
              key={index}
              to={item.to} 
              style={({ isActive }) => ({
                ...styles.link,
                ...(isActive ? styles.activeLink : {}),
                justifyContent: collapsed ? 'center' : 'flex-start',
                padding: collapsed ? '12px' : '12px 16px',
              })}
              title={collapsed ? item.label : ''}
            >
              <span style={styles.icon}>{item.icon}</span>
              {!collapsed && <span style={styles.linkLabel}>{item.label}</span>}
            </NavLink>
          );
        })}
      </div>
    </aside>
  );
};

const styles = {
  sidebar: {
    backgroundColor: 'var(--bg-sidebar)',
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - 70px)',
    overflowY: 'auto',
    overflowX: 'hidden',
    transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    zIndex: 99,
  },
  menuList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    padding: '24px 12px',
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    borderRadius: '10px',
    color: '#94a3b8',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
  },
  activeLink: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    color: '#ffffff',
  },
  icon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkLabel: {
    marginLeft: '12px',
    whiteSpace: 'nowrap',
  },
};

export default Sidebar;
