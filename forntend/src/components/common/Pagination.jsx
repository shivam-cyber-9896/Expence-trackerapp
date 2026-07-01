export const Pagination = ({
  currentPage = 0,
  totalPages = 1,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div style={styles.container}>
      <button
        disabled={currentPage === 0}
        onClick={() => onPageChange(currentPage - 1)}
        style={{
          ...styles.btn,
          ...(currentPage === 0 ? styles.disabledBtn : {}),
        }}
      >
        Previous
      </button>
      <span style={styles.label}>
        Page {currentPage + 1} of {totalPages}
      </span>
      <button
        disabled={currentPage >= totalPages - 1}
        onClick={() => onPageChange(currentPage + 1)}
        style={{
          ...styles.btn,
          ...(currentPage >= totalPages - 1 ? styles.disabledBtn : {}),
        }}
      >
        Next
      </button>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 0',
  },
  btn: {
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    color: '#334155',
    padding: '8px 16px',
    borderRadius: '30px', // rounded buttons
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  disabledBtn: {
    backgroundColor: '#f1f5f9',
    color: '#94a3b8',
    cursor: 'not-allowed',
    border: '1px solid #e2e8f0',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-muted)',
  },
};

export default Pagination;
