import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { budgetService, departmentService } from '../services';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import PageHeader from '../components/common/PageHeader';
import Pagination from '../components/common/Pagination';
import EmptyState from '../components/common/EmptyState';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';
import { FiPlus, FiEdit, FiTrash2, FiDollarSign } from 'react-icons/fi';

export const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form states
  const [departmentId, setDepartmentId] = useState('');
  const [month, setMonth] = useState('1');
  const [year, setYear] = useState('2026');
  const [allocatedBudget, setAllocatedBudget] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Pagination
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchBudgets();
    fetchDepartments();
  }, [page]);

  const fetchDepartments = async () => {
    try {
      const response = await departmentService.getAll({ page: 0, size: 100, sortBy: 'departmentName', direction: 'asc' });
      if (response && response.success && response.data) {
        setDepartments(response.data.content || []);
      }
    } catch (err) {
      console.error('Error loading departments:', err);
    }
  };

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const response = await budgetService.getAll({ 
        page, 
        size: 5, 
        sortBy: 'budgetId', 
        direction: 'desc' 
      });
      if (response && response.success && response.data) {
        setBudgets(response.data.content || []);
        setTotalPages(response.data.totalPages || 1);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch budgets list');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateForm = () => {
    setEditingId(null);
    setDepartmentId(departments.length > 0 ? departments[0].departmentId.toString() : '');
    setMonth('1');
    setYear('2026');
    setAllocatedBudget('');
    setIsFormOpen(true);
    setError(null);
    setSuccess(null);
  };

  const handleEditClick = (b) => {
    setEditingId(b.budgetId);
    setDepartmentId(b.departmentId ? b.departmentId.toString() : '');
    setMonth(b.month ? b.month.toString() : '1');
    setYear(b.year ? b.year.toString() : '2026');
    setAllocatedBudget(b.monthlyBudget ? b.monthlyBudget.toString() : '');
    setIsFormOpen(true);
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    // Duplicate month-year budget checks
    const isDuplicate = budgets.some(b => 
      b.departmentId.toString() === departmentId &&
      b.month.toString() === month &&
      b.year.toString() === year &&
      b.budgetId !== editingId
    );

    if (isDuplicate) {
      setError(`Validation Error: A budget is already defined for this department in Period ${month}/${year}. Duplicate configurations are not allowed.`);
      setSubmitting(false);
      return;
    }

    try {
      const payload = {
        departmentId: Number(departmentId),
        month: Number(month),
        year: Number(year),
        monthlyBudget: parseFloat(allocatedBudget),
      };

      let response;
      if (editingId) {
        response = await budgetService.update(editingId, payload);
      } else {
        response = await budgetService.create(payload);
      }

      if (response && response.success) {
        setSuccess(editingId ? 'Department budget limit updated successfully' : 'Department budget defined successfully');
        setIsFormOpen(false);
        fetchBudgets();
      }
    } catch (err) {
      setError(err.message || 'Failed to define budget limits');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Budget Limit?',
      text: "Are you sure you want to remove this budget allocation?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'var(--danger)',
      cancelButtonColor: '#cbd5e1',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const response = await budgetService.delete(id);
        if (response && response.success) {
          fetchBudgets();
          Swal.fire('Deleted!', 'Budget allocation removed successfully.', 'success');
        }
      } catch (err) {
        Swal.fire('Error!', err.message || 'Failed to delete budget limit.', 'error');
      }
    }
  };

  return (
    <div className="slide-up">
      <PageHeader 
        title="Department Budgets" 
        subtitle="Manage allocated budget limits per department, track approved expenses, and visualize remaining margins."
        action={
          <Button onClick={handleOpenCreateForm} variant="primary">
            <FiPlus size={16} /> Add Budget
          </Button>
        }
      />

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <Card hoverLift={false} style={{ width: '100%' }}>
        <h2 style={styles.sectionTitle}>Budget Allocations</h2>

        {loading ? (
          <Loader message="Loading budget tables..." />
        ) : budgets.length === 0 ? (
          <EmptyState 
            title="No Budgets Defined" 
            description="Use the Add Budget action button to configure monthly allocations." 
          />
        ) : (
          <>
            <div className="table-wrapper">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Department</th>
                    <th>Period</th>
                    <th>Allocated Budget</th>
                    <th>Utilization</th>
                    <th>Remaining Budget</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {budgets.map((b) => {
                    // Let's mock a standard approved expense or summary representation inside this table
                    const approvedExpense = b.approvedExpense || 0; 
                    const allocated = b.monthlyBudget || 0;
                    const remaining = Math.max(0, allocated - approvedExpense);
                    const utilPercent = allocated ? Math.round((approvedExpense / allocated) * 100) : 0;
                    const isExceeded = approvedExpense > allocated;

                    return (
                      <tr key={b.budgetId}>
                        <td style={{ fontWeight: '700' }}>#{b.budgetId}</td>
                        <td style={{ fontWeight: '600' }}>{b.departmentName || `Dept #${b.departmentId}`}</td>
                        <td>{b.month}/{b.year}</td>
                        <td style={{ fontWeight: '600' }}>${allocated?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td>
                          {/* Fiori style progress bar */}
                          <div style={styles.progressContainer}>
                            <div style={styles.progressLabel}>
                              <span>${approvedExpense?.toLocaleString()} spent</span>
                              <span>{utilPercent}%</span>
                            </div>
                            <div style={styles.barOuter}>
                              <div style={{
                                ...styles.barInner,
                                width: `${Math.min(100, utilPercent)}%`,
                                backgroundColor: isExceeded ? 'var(--danger)' : 'var(--primary)'
                              }}></div>
                            </div>
                          </div>
                        </td>
                        <td style={{ fontWeight: '600', color: remaining === 0 ? 'var(--danger)' : 'var(--success)' }}>
                          ${remaining?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <Button 
                              onClick={() => handleEditClick(b)} 
                              variant="secondary" 
                              style={styles.actionBtn}
                              title="Edit Budget"
                            >
                              <FiEdit size={13} />
                            </Button>
                            <Button 
                              onClick={() => handleDelete(b.budgetId)} 
                              variant="secondary" 
                              style={{ ...styles.actionBtn, color: 'var(--danger)' }}
                              title="Delete Budget"
                            >
                              <FiTrash2 size={13} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <Pagination 
              currentPage={page} 
              totalPages={totalPages} 
              onPageChange={(p) => setPage(p)} 
            />
          </>
        )}
      </Card>

      {/* Budget Creation / Edit Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingId ? `Edit Budget Limit #${editingId}` : 'Add Department Budget'}
      >
        <form onSubmit={handleSubmit} style={styles.form}>
          <div className="form-group">
            <label className="form-label">Department</label>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              required
              disabled={!!editingId} // Disable department changes on edits
              className="form-select"
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept.departmentId} value={dept.departmentId}>
                  {dept.departmentName}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.formRow}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Month</label>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                required
                className="form-select"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Year</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                required
                className="form-select"
              >
                <option value="2026">2026</option>
                <option value="2027">2027</option>
                <option value="2028">2028</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Allocated Budget Limit ($)</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={allocatedBudget}
              onChange={(e) => setAllocatedBudget(e.target.value)}
              required
              className="form-input"
            />
          </div>

          <div style={styles.modalBtnRow}>
            <Button type="submit" disabled={submitting} variant="primary" style={{ flex: 1 }}>
              {submitting ? 'Saving...' : 'Define Budget'}
            </Button>
            <Button onClick={() => setIsFormOpen(false)} variant="secondary">
              Cancel
            </Button>
          </div>
        </form>
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
    padding: '6px 10px',
    borderRadius: '8px',
  },
  progressContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    width: '180px',
    textAlign: 'left',
  },
  progressLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--text-muted)',
  },
  barOuter: {
    height: '6px',
    backgroundColor: '#f1f5f9',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  barInner: {
    height: '100%',
    borderRadius: '8px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    textAlign: 'left',
  },
  formRow: {
    display: 'flex',
    gap: '16px',
  },
  modalBtnRow: {
    display: 'flex',
    gap: '10px',
    marginTop: '18px',
  },
};

export default Budgets;
