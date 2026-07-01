export const EmptyState = ({
  title = 'No records found',
  description = 'There are no items registered or matching your criteria.',
  icon = '📂',
}) => {
  return (
    <div style={styles.container} className="fade-in">
      <div style={styles.icon}>{icon}</div>
      <h3 style={styles.title}>{title}</h3>
      <p style={styles.description}>{description}</p>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '48px 24px',
    textAlign: 'center',
    backgroundColor: '#ffffff',
    borderRadius: '15px',
    border: '1px dashed var(--border-color)',
    width: '100%',
  },
  icon: {
    fontSize: '48px',
    marginBottom: '16px',
    userSelect: 'none',
  },
  title: {
    fontSize: '16px',
    fontWeight: '700',
    color: 'var(--text-main)',
    margin: '0 0 6px 0',
  },
  description: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    maxWidth: '320px',
    margin: 0,
    lineHeight: '1.4',
  },
};

export default EmptyState;
