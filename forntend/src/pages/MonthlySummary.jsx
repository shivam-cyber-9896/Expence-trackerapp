import { useState, useEffect } from 'react';
import { departmentService, budgetService } from '../services';
import Card from '../components/common/Card';
import PageHeader from '../components/common/PageHeader';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import { FiTrendingUp, FiDollarSign, FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi';

export const MonthlySummary = () => {
  const [departments, setDepartments] = useState([]);
  const [loadingDepts, setLoadingDepts] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [tableData, setTableData] = useState([]);

  // Filters state
  const [deptFilter, setDeptFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState(new Date().getMonth() + 1 + '');
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear() + '');

  // Computed summary card variables directly from backend data
  const [summary, setSummary] = useState({
    budget: 0,
    approvedExpense: 0,
    pendingExpense: 0,
    remaining: 0,
    approvedCount: 0,
    pendingCount: 0,
    rejectedCount: 0,
  });

  // On mount: fetch departments list
  useEffect(() => {
    const fetchDepartments = async () => {
      setLoadingDepts(true);
      try {
        const response = await departmentService.getAll({ page: 0, size: 100, sortBy: 'departmentName', direction: 'asc' });
        if (response && response.success && response.data) {
          setDepartments(response.data.content || []);
        }
      } catch (err) {
        console.error('Failed to load departments list:', err);
      } finally {
        setLoadingDepts(false);
      }
    };
    fetchDepartments();
  }, []);

  // Whenever filters or department list changes, fetch summary directly from backend
  useEffect(() => {
    if (!loadingDepts) {
      fetchSummaryData();
    }
  }, [deptFilter, monthFilter, yearFilter, departments, loadingDepts]);

  const fetchSummaryData = async () => {
    setSummaryLoading(true);
    try {
      const monthVal = Number(monthFilter);
      const yearVal = Number(yearFilter);

      if (deptFilter) {
        // Query single department summary directly from backend
        const response = await budgetService.getMonthlySummary(Number(deptFilter), monthVal, yearVal);
        if (response && response.success && response.data) {
          const d = response.data;
          setSummary({
            budget: Number(d.totalBudget || 0),
            approvedExpense: Number(d.totalApprovedClaims || 0),
            pendingExpense: Number(d.totalPendingClaims || 0),
            remaining: Number(d.remainingBudget || 0),
            approvedCount: Number(d.approvedClaimsCount || 0),
            pendingCount: Number(d.pendingClaimsCount || 0),
            rejectedCount: Number(d.rejectedClaimsCount || 0),
          });
          setTableData([{
            id: d.departmentId,
            name: d.departmentName || `Dept #${d.departmentId}`,
            budget: Number(d.totalBudget || 0),
            spent: Number(d.totalApprovedClaims || 0),
            remaining: Number(d.remainingBudget || 0),
            percent: d.totalBudget ? Math.round((Number(d.totalApprovedClaims || 0) / Number(d.totalBudget)) * 100) : 0
          }]);
        } else {
          // If no budget summary exists for department
          setSummary({
            budget: 0,
            approvedExpense: 0,
            pendingExpense: 0,
            remaining: 0,
            approvedCount: 0,
            pendingCount: 0,
            rejectedCount: 0,
          });
          setTableData([]);
        }
      } else {
        // Fetch summary for all departments in parallel from backend
        if (departments.length === 0) {
          setTableData([]);
          return;
        }

        const summaryPromises = departments.map(dept => 
          budgetService.getMonthlySummary(dept.departmentId, monthVal, yearVal)
            .then(res => res.data)
            .catch(() => null) // Handle gracefully if no budget defined
        );

        const results = await Promise.all(summaryPromises);
        const activeSummaries = results.filter(Boolean);

        let totalBudget = 0;
        let totalApproved = 0;
        let totalPending = 0;
        let totalRemaining = 0;
        let totalApprovedCount = 0;
        let totalPendingCount = 0;
        let totalRejectedCount = 0;

        const rows = activeSummaries.map(s => {
          const b = Number(s.totalBudget || 0);
          const a = Number(s.totalApprovedClaims || 0);
          const p = Number(s.totalPendingClaims || 0);
          const r = Number(s.remainingBudget || 0);

          totalBudget += b;
          totalApproved += a;
          totalPending += p;
          totalRemaining += r;
          totalApprovedCount += s.approvedClaimsCount || 0;
          totalPendingCount += s.pendingClaimsCount || 0;
          totalRejectedCount += s.rejectedClaimsCount || 0;

          return {
            id: s.departmentId,
            name: s.departmentName || `Dept #${s.departmentId}`,
            budget: b,
            spent: a,
            remaining: r,
            percent: b ? Math.round((a / b) * 100) : 0
          };
        });

        setSummary({
          budget: totalBudget,
          approvedExpense: totalApproved,
          pendingExpense: totalPending,
          remaining: totalRemaining,
          approvedCount: totalApprovedCount,
          pendingCount: totalPendingCount,
          rejectedCount: totalRejectedCount,
        });
        setTableData(rows);
      }
    } catch (err) {
      console.error('Failed to load monthly summaries:', err);
    } finally {
      setSummaryLoading(false);
    }
  };

  if (loadingDepts) {
    return <Loader message="Initializing summary metrics..." />;
  }

  const statCards = [
    { title: 'Monthly Budget', value: `$${summary.budget.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, color: 'var(--primary)', bg: 'var(--primary-light)', icon: <FiDollarSign size={20} /> },
    { title: 'Approved Expense', value: `$${summary.approvedExpense.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, color: 'var(--success)', bg: 'var(--success-bg)', icon: <FiCheckCircle size={20} /> },
    { title: 'Pending Expense', value: `$${summary.pendingExpense.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, color: 'var(--warning)', bg: 'var(--warning-bg)', icon: <FiClock size={20} /> },
    { title: 'Remaining Budget', value: `$${summary.remaining.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, color: '#0f766e', bg: '#f0fdfa', icon: <FiTrendingUp size={20} /> },
    { title: 'Approved Claims', value: `${summary.approvedCount} Claims`, color: 'var(--success)', bg: 'var(--success-bg)', icon: <FiCheckCircle size={20} /> },
    { title: 'Pending Claims', value: `${summary.pendingCount} Claims`, color: 'var(--warning)', bg: 'var(--warning-bg)', icon: <FiClock size={20} /> },
    { title: 'Rejected Claims', value: `${summary.rejectedCount} Claims`, color: 'var(--danger)', bg: 'var(--danger-bg)', icon: <FiXCircle size={20} /> },
  ];

  return (
    <div className="slide-up" style={{ color: 'var(--text-main)' }}>
      <PageHeader 
        title="Monthly Summary" 
        subtitle="Consolidated finance report representing aggregated budgets, expenses, and approvals directly from backend APIs." 
      />

      {/* Filter panel */}
      <Card hoverLift={false} style={styles.filterCard}>
        <div style={styles.filterRow}>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Department</label>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="form-select"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.departmentId} value={d.departmentId}>
                  {d.departmentName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Month</label>
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
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
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="form-select"
            >
              <option value="2026">2026</option>
              <option value="2027">2027</option>
              <option value="2028">2028</option>
            </select>
          </div>
        </div>
      </Card>

      {summaryLoading ? (
        <Loader message="Fetching backend monthly summaries..." />
      ) : (
        <>
          {/* Stats Summary Grid */}
          <div style={styles.grid}>
            {statCards.map((card, idx) => (
              <Card key={idx} hoverLift={true} style={styles.statCard}>
                <div style={{ ...styles.iconBox, color: card.color, backgroundColor: card.bg }}>
                  {card.icon}
                </div>
                <div style={styles.statDetails}>
                  <span style={styles.statTitle}>{card.title}</span>
                  <strong style={{ ...styles.statVal, color: card.color }}>{card.value}</strong>
                </div>
              </Card>
            ))}
          </div>

          {/* Table Section */}
          <Card hoverLift={false} style={{ width: '100%', marginTop: '30px' }}>
            <h3 style={styles.sectionTitle}>Budget Utilization Progress ({monthFilter}/{yearFilter})</h3>
            
            {tableData.length === 0 ? (
              <EmptyState 
                title="No Budgets Found" 
                description="No budget summary items returned by the backend for this period." 
              />
            ) : (
              <div className="table-wrapper">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Department Name</th>
                      <th>Allocated Budget</th>
                      <th>Approved Expense</th>
                      <th>Utilization Meter</th>
                      <th>Remaining Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((row) => (
                      <tr key={row.id}>
                        <td style={{ fontWeight: '700' }}>{row.name}</td>
                        <td style={{ fontWeight: '600' }}>${row.budget?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td>${row.spent?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td>
                          <div style={styles.progressBlock}>
                            <div style={styles.progressLabel}>
                              <span>{row.percent}%</span>
                            </div>
                            <div style={styles.barOuter}>
                              <div style={{
                                ...styles.barInner,
                                width: `${Math.min(100, row.percent)}%`,
                                backgroundColor: row.percent > 90 ? 'var(--danger)' : row.percent > 70 ? 'var(--warning)' : 'var(--success)'
                              }}></div>
                            </div>
                          </div>
                        </td>
                        <td style={{
                          fontWeight: '700',
                          color: row.remaining === 0 ? 'var(--danger)' : 'var(--success)'
                        }}>
                          ${row.remaining?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
};

const styles = {
  filterCard: {
    backgroundColor: '#ffffff',
    marginBottom: '24px',
  },
  filterRow: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '20px',
  },
  statCard: {
    backgroundColor: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '20px 24px',
  },
  iconBox: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statDetails: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    textAlign: 'left',
  },
  statTitle: {
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  statVal: {
    fontSize: '18px',
    fontWeight: '800',
    marginTop: '2px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '800',
    color: 'var(--text-main)',
    margin: '0 0 20px 0',
    textAlign: 'left',
  },
  progressBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    width: '180px',
  },
  progressLabel: {
    display: 'flex',
    justifyContent: 'flex-end',
    fontSize: '10px',
    fontWeight: '700',
    color: 'var(--text-muted)',
  },
  barOuter: {
    height: '6px',
    backgroundColor: '#f1f5f9',
    borderRadius: '10px',
    overflow: 'hidden',
  },
  barInner: {
    height: '100%',
    borderRadius: '10px',
  },
};

export default MonthlySummary;
