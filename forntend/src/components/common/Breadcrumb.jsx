import { Link, useLocation } from 'react-router-dom';

export const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  if (pathnames.length === 0) return null;

  return (
    <nav aria-label="breadcrumb" style={styles.container}>
      <ol style={styles.list}>
        <li style={styles.item}>
          <Link to="/dashboard" style={styles.link}>
            Home
          </Link>
        </li>
        {pathnames.map((value, index) => {
          const last = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          
          // Capitalize first letter of path segment
          const label = value.charAt(0).toUpperCase() + value.slice(1).replace('-', ' ');

          return last ? (
            <li key={to} style={{ ...styles.item, ...styles.active }} aria-current="page">
              <span style={styles.separator}>/</span>
              {label}
            </li>
          ) : (
            <li key={to} style={styles.item}>
              <span style={styles.separator}>/</span>
              <Link to={to} style={styles.link}>
                {label}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

const styles = {
  container: {
    padding: '0 0 16px 0',
    fontFamily: 'var(--font-family)',
    textAlign: 'left',
  },
  list: {
    display: 'flex',
    flexWrap: 'wrap',
    listStyle: 'none',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    color: 'var(--text-muted)',
    fontWeight: '500',
  },
  active: {
    color: 'var(--text-main)',
    fontWeight: '600',
  },
  link: {
    color: 'var(--primary)',
    textDecoration: 'none',
  },
  separator: {
    margin: '0 8px',
    color: '#cbd5e1',
  },
};

export default Breadcrumb;
