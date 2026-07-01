import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import useAuth from '../hooks/useAuth';
import { claimService, reviewService, budgetService, employeeService } from '../services';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import PageHeader from '../components/common/PageHeader';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';
import { FiCheck, FiX, FiInfo, FiAlertTriangle } from 'react-icons/fi';

export const ClaimReview = () => {
  const { user } = useAuth();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Review Modal state
  const [activeClaim, setActiveClaim] = useState(null);
  const [reviewerName, setReviewerName] = useState('');
  const [remarks, setRemarks] = useState('');
  const [actionType, setActionType] = useState('APPROVED'); // APPROVED or REJECTED
  
  // Budget stats state for active review
  const [budgetStats, setBudgetStats] = useState({
    remaining: 0,
    afterApproval: 0,
    loading: false,
    exceeded: false
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPendingClaims();
    // Fetch admin's employee name for reviewer signature
    const fetchReviewerName = async () => {
      if (user?.employeeId) {
        try {
          const resp = await employeeService.getById(user.employeeId);
          if (resp && resp.success && resp.data) {
            setReviewerName(resp.data.employeeName || '');
          }
        } catch (err) {
          console.error('Failed to fetch reviewer name:', err);
        }
      }
    };
    fetchReviewerName();
  }, []);

  const fetchPendingClaims = async () => {
    setLoading(true);
    try {
      const response = await claimService.getAll({ page: 0, size: 200, sortBy: 'claimId', direction: 'desc' });
      if (response && response.success && response.data) {
        const pending = (response.data.content || []).filter(c => c.status === 'PENDING');
        setClaims(pending);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch pending reviews');
    } finally {
      setLoading(false);
    }
  };

  // When a claim is selected for approval, fetch its department monthly budget summary
  const handleActionClick = async (claim, action) => {
    setActiveClaim(claim);
    setActionType(action);
    setRemarks('');

    if (action === 'APPROVED') {
      setBudgetStats(prev => ({ ...prev, loading: true }));
      try {
        // Parse date to extract month/year
        // Default to current date if missing
        let month = new Date().getMonth() + 1;
        let year = new Date().getFullYear();
        if (claim.expenseDate) {
          const parts = claim.expenseDate.split('-');
          year = Number(parts[0]);
          month = Number(parts[1]);
        }

        const response = await budgetService.getMonthlySummary(claim.departmentId, month, year);
        if (response && response.success && response.data) {
          const remaining = Number(response.data.remainingBudget) || 0;
          const afterApproval = remaining - claim.amount;
          const exceeded = afterApproval < 0;
          setBudgetStats({
            remaining,
            afterApproval,
            exceeded,
            loading: false
          });
        }
      } catch (err) {
        console.error('Failed to load budget checks:', err);
        // Fallback if no budget defined
        setBudgetStats({
          remaining: 0,
          afterApproval: -claim.amount,
          exceeded: true,
          loading: false
        });
      }
    } else {
      // Rejection does not affect remaining budget
      setBudgetStats({
        remaining: 0,
        afterApproval: 0,
        exceeded: false,
        loading: false
      });
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        reviewerName,
        status: actionType,
        remarks,
      };

      const response = await reviewService.review(activeClaim.claimId, payload);
      if (response && response.success) {
        setActiveClaim(null);
        fetchPendingClaims();
        Swal.fire({
          title: 'Review Submitted!',
          text: `Claim #${activeClaim.claimId} has been successfully ${actionType.toLowerCase()}.`,
          icon: 'success',
          confirmButtonColor: 'var(--primary)',
        });
      }
    } catch (err) {
      Swal.fire('Error!', err.message || 'Review submission failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="slide-up">
      <PageHeader 
        title="Finance Claim Reviews" 
        subtitle="Review, approve, and audit pending expense reimbursement requests against department budget limits." 
      />

      {error && <div className="alert alert-danger">{error}</div>}

      <Card hoverLift={false} style={{ width: '100%' }}>
        <h2 style={styles.sectionTitle}>Claims Awaiting Review</h2>
        
        {loading ? (
          <Loader message="Loading review queue..." />
        ) : claims.length === 0 ? (
          <EmptyState 
            title="Clean Review Queue" 
            description="There are no pending expense claims requiring validation." 
            icon="🎉"
          />
        ) : (
          <div className="table-wrapper">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Claim ID</th>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Expense Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {claims.map((claim) => (
                  <tr key={claim.claimId}>
                    <td style={{ fontWeight: '700' }}>#{claim.claimId}</td>
                    <td>{claim.email || 'N/A'}</td>
                    <td>{claim.departmentName || `Dept #${claim.departmentId}`}</td>
                    <td>{claim.categoryName || `Category #${claim.categoryId}`}</td>
                    <td style={{ fontWeight: '600' }}>${claim.amount?.toFixed(2)}</td>
                    <td>{claim.expenseDate}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Button 
                          onClick={() => handleActionClick(claim, 'APPROVED')} 
                          variant="primary" 
                          style={styles.actionBtn}
                        >
                          <FiCheck /> Approve
                        </Button>
                        <Button 
                          onClick={() => handleActionClick(claim, 'REJECTED')} 
                          variant="danger" 
                          style={styles.actionBtn}
                        >
                          <FiX /> Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Approve / Reject Modal Box */}
      <Modal
        isOpen={!!activeClaim}
        onClose={() => setActiveClaim(null)}
        title={activeClaim ? `Process Claim #${activeClaim.claimId} - ${actionType}` : ''}
      >
        {activeClaim && (
          <form onSubmit={handleReviewSubmit} style={styles.form}>
            
            {/* Claim details brief */}
            <div style={styles.claimSummary}>
              <div style={styles.summaryItem}>
                <span>Claim Amount:</span>
                <strong>${activeClaim.amount?.toFixed(2)}</strong>
              </div>
              <div style={styles.summaryItem}>
                <span>Category Name:</span>
                <span>{activeClaim.categoryName || `Category #${activeClaim.categoryId}`}</span>
              </div>
            </div>

            {/* Budget Calculation Check */}
            {actionType === 'APPROVED' && (
              <div style={styles.budgetCheckCard}>
                <h4 style={styles.budgetTitle}>Budget Impact Evaluation</h4>
                {budgetStats.loading ? (
                  <span style={{ fontSize: '13px' }}>Evaluating department allowance...</span>
                ) : (
                  <div style={styles.budgetStatsRow}>
                    <div style={styles.statCell}>
                      <span>Remaining Budget</span>
                      <strong>${budgetStats.remaining?.toFixed(2)}</strong>
                    </div>
                    <div style={styles.statCell}>
                      <span>Budget After Approval</span>
                      <strong style={{ color: budgetStats.exceeded ? 'var(--danger)' : 'var(--success)' }}>
                        ${budgetStats.afterApproval?.toFixed(2)}
                      </strong>
                    </div>
                  </div>
                )}

                {/* Exceeded Red Warning and disabled actions */}
                {!budgetStats.loading && budgetStats.exceeded && (
                  <div style={styles.warningAlert}>
                    <FiAlertTriangle size={18} style={{ marginRight: '8px', flexShrink: 0 }} />
                    <div>
                      <strong>Insufficient Budget Allocation!</strong>
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px' }}>
                        This reimbursement request exceeds the department remaining monthly budget limit. 
                        <strong> If no budget exists for this period (6/2026), please allocate one in the Department Budgets page first.</strong>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="form-group" style={{ marginTop: '16px' }}>
              <label className="form-label">Reviewer Signature</label>
              <input
                type="text"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Decision Remarks / Notes</label>
              <textarea
                placeholder="Explain approval metrics or rejection reasons..."
                rows="3"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                required={actionType === 'REJECTED'} // Remarks required for rejection
                className="form-textarea"
              />
            </div>

            <div style={styles.btnRow}>
              <Button 
                type="submit" 
                disabled={submitting || (actionType === 'APPROVED' && budgetStats.exceeded)} 
                variant={actionType === 'APPROVED' ? 'primary' : 'danger'} 
                style={{ flex: 1 }}
              >
                {submitting ? 'Processing...' : `Confirm ${actionType}`}
              </Button>
              <Button onClick={() => setActiveClaim(null)} variant="secondary">
                Cancel
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

const styles = {
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '800',
    color: 'var(--text-main)',
    margin: '0 0 20px 0',
    textAlign: 'left',
  },
  actionBtn: {
    padding: '6px 12px',
    fontSize: '13px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    textAlign: 'left',
  },
  claimSummary: {
    backgroundColor: 'var(--bg-app)',
    padding: '16px',
    borderRadius: '10px',
    border: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  summaryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
  },
  budgetCheckCard: {
    marginTop: '16px',
    backgroundColor: '#fffbeb',
    border: '1px solid #fef3c7',
    borderRadius: '10px',
    padding: '16px',
  },
  budgetTitle: {
    fontSize: '12px',
    fontWeight: '700',
    textTransform: 'uppercase',
    color: 'var(--warning)',
    marginBottom: '12px',
    letterSpacing: '0.5px',
  },
  budgetStatsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
  },
  statCell: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    fontSize: '13px',
  },
  warningAlert: {
    marginTop: '16px',
    backgroundColor: 'var(--danger-bg)',
    border: '1px solid var(--danger)',
    borderRadius: '8px',
    color: 'var(--danger)',
    padding: '12px',
    display: 'flex',
    alignItems: 'flex-start',
  },
  btnRow: {
    display: 'flex',
    gap: '10px',
    marginTop: '18px',
  },
};

export default ClaimReview;
