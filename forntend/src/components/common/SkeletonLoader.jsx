export const SkeletonLoader = ({ type = 'card', count = 1 }) => {
  const renderItems = () => {
    return Array.from({ length: count }).map((_, index) => {
      if (type === 'table') {
        return (
          <div key={index} style={styles.tableRow}>
            <div className="skeleton" style={{ ...styles.bar, width: '10%' }}></div>
            <div className="skeleton" style={{ ...styles.bar, width: '30%' }}></div>
            <div className="skeleton" style={{ ...styles.bar, width: '20%' }}></div>
            <div className="skeleton" style={{ ...styles.bar, width: '20%' }}></div>
            <div className="skeleton" style={{ ...styles.bar, width: '10%' }}></div>
          </div>
        );
      }
      
      if (type === 'list') {
        return (
          <div key={index} style={styles.listItem}>
            <div className="skeleton" style={styles.circle}></div>
            <div style={styles.listDetails}>
              <div className="skeleton" style={{ ...styles.bar, width: '40%', height: '14px' }}></div>
              <div className="skeleton" style={{ ...styles.bar, width: '70%', height: '10px', marginTop: '6px' }}></div>
            </div>
          </div>
        );
      }

      // Default card type
      return (
        <div key={index} style={styles.card}>
          <div className="skeleton" style={styles.cardHeader}></div>
          <div className="skeleton" style={{ ...styles.bar, width: '80%', height: '16px', marginTop: '16px' }}></div>
          <div className="skeleton" style={{ ...styles.bar, width: '50%', height: '12px', marginTop: '8px' }}></div>
        </div>
      );
    });
  };

  return <div style={styles.container}>{renderItems()}</div>;
};

const styles = {
  container: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '15px',
    padding: '24px',
    boxShadow: 'var(--shadow-sm)',
  },
  cardHeader: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
  },
  bar: {
    height: '14px',
    borderRadius: '4px',
  },
  tableRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '16px',
    borderBottom: '1px solid #e2e8f0',
    alignItems: 'center',
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '12px 0',
  },
  circle: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
  },
  listDetails: {
    flex: 1,
  },
};

export default SkeletonLoader;
