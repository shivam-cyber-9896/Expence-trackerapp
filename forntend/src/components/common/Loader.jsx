export const Loader = ({ message = 'Loading system data...' }) => {
  return (
    <div style={styles.container} className="fade-in">
      <div style={styles.spinner}></div>
      <p style={styles.message}>{message}</p>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px',
    textAlign: 'center',
    fontFamily: 'var(--font-family)',
  },
  spinner: {
    border: '4px solid rgba(37, 99, 235, 0.1)',
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    borderLeftColor: 'var(--primary)',
    animation: 'spin 1s linear infinite',
  },
  message: {
    marginTop: '16px',
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-muted)',
  },
};

export default Loader;
