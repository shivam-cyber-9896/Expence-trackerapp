export const Footer = () => {
  return (
    <footer style={styles.footer}>
      <span style={styles.copyright}>
        © {new Date().getFullYear()} ExpenseControl System. All rights reserved.
      </span>
      <span style={styles.branding}>
        Secured with JWT and RBAC
      </span>
    </footer>
  );
};

const styles = {
  footer: {
    height: '50px',
    backgroundColor: '#ffffff',
    borderTop: '1px solid var(--border-color)',
    color: 'var(--text-muted)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 24px',
    fontSize: '12px',
  },
  copyright: {
    fontWeight: '500',
  },
  branding: {
    fontWeight: '600',
    color: 'var(--primary)',
  },
};

export default Footer;
