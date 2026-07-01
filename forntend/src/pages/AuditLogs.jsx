import { useState, useEffect } from 'react';
import { auditLogService } from '../services';

export const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await auditLogService.getAll({
        page,
        size: 10,
        sortBy: 'actionTime',
        direction: 'desc'
      });
      if (response && response.success && response.data) {
        setLogs(response.data.content || []);
        setTotalPages(response.data.totalPages || 1);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch system audit logs');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 className="page-title">System Audit Logs</h1>
        <p className="page-subtitle">Security audit history tracking operations across entities (Admin Access).</p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card" style={styles.logCard}>
        <h2 style={styles.sectionTitle}>Audit Event Trail</h2>
        
        {loading ? (
          <p>Loading security audit logs...</p>
        ) : logs.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No audit trail logs are currently registered.</p>
          </div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Log ID</th>
                    <th>Action Done</th>
                    <th>Performed By</th>
                    <th>Action Timestamp</th>
                    <th>Entity</th>
                    <th>Entity ID</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.logId}>
                      <td style={{ fontWeight: '700' }}>#{log.logId}</td>
                      <td>
                        <span className="badge badge-role" style={{ textTransform: 'none' }}>
                          {log.action}
                        </span>
                      </td>
                      <td style={{ fontWeight: '500' }}>{log.performedBy || 'System'}</td>
                      <td>{log.actionTime ? new Date(log.actionTime).toLocaleString() : 'N/A'}</td>
                      <td>{log.entityName}</td>
                      <td>{log.entityId}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Simple Pagination Controls */}
            {totalPages > 1 && (
              <div style={styles.pagination}>
                <button
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  className="btn btn-secondary"
                  style={styles.pageBtn}
                >
                  Previous
                </button>
                <span style={styles.pageIndicator}>
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                  className="btn btn-secondary"
                  style={styles.pageBtn}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    color: 'var(--text-main)',
  },
  header: {
    marginBottom: '20px',
    textAlign: 'left',
  },
  logCard: {
    backgroundColor: '#ffffff',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '800',
    color: 'var(--text-main)',
    margin: '0 0 20px 0',
    textAlign: 'left',
  },
  emptyState: {
    padding: '40px',
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '15px',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '20px',
    marginTop: '20px',
  },
  pageBtn: {
    padding: '8px 16px',
    fontSize: '13px',
  },
  pageIndicator: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-muted)',
  },
};

export default AuditLogs;
