import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { claimService, budgetService, departmentService, employeeService } from '../services';
import Card from '../components/common/Card';
import PageHeader from '../components/common/PageHeader';
import Loader from '../components/common/Loader';
import { 
  FiFolder, 
  FiUsers, 
  FiFileText, 
  FiClock, 
  FiCheckCircle, 
  FiXCircle, 
  FiDollarSign, 
  FiPieChart, 
  FiGrid 
} from 'react-icons/fi';

export const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState({
    deptsCount: 0,
    employeesCount: 0,
    claimsCount: 0,
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    totalBudget: 0,
    approvedExpense: 0,
    remainingBudget: 0,
    recentClaims: [],
    topSpendingDepts: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [deptsRes, employeesRes, claimsRes, budgetsRes] = await Promise.all([
        departmentService.getAll({ page: 0, size: 100 }).catch(() => ({ data: { content: [] } })),
        employeeService.getAll({ page: 0, size: 100 }).catch(() => ({ data: { content: [] } })),
        claimService.getAll({ page: 0, size: 10 }).catch(() => ({ data: { content: [] } })), // get recent
        budgetService.getAll({ page: 0, size: 100 }).catch(() => ({ data: { content: [] } })),
      ]);

      const depts = deptsRes?.data?.content || [];
      const employees = employeesRes?.data?.content || [];
      
      // For comprehensive stats, let's fetch more claims to calculate sums
      const allClaimsRes = await claimService.getAll({ page: 0, size: 500 }).catch(() => ({ data: { content: [] } }));
      const allClaims = allClaimsRes?.data?.content || [];
      const budgets = budgetsRes?.data?.content || [];

      // Calculations
      const pendingClaims = allClaims.filter(c => c.status === 'PENDING');
      const approvedClaims = allClaims.filter(c => c.status === 'APPROVED');
      const rejectedClaims = allClaims.filter(c => c.status === 'REJECTED');

      const totalBudgetSum = budgets.reduce((sum, b) => sum + (b.monthlyBudget || 0), 0);
      const totalApprovedSum = approvedClaims.reduce((sum, c) => sum + (c.amount || 0), 0);
      const remaining = Math.max(0, totalBudgetSum - totalApprovedSum);

      // Top spending departments aggregator
      const deptExpenses = {};
      approvedClaims.forEach(c => {
        const dName = c.departmentName || `Dept #${c.departmentId}`;
        deptExpenses[dName] = (deptExpenses[dName] || 0) + (c.amount || 0);
      });
      const topSpending = Object.entries(deptExpenses)
        .map(([name, amount]) => ({ name, amount }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);

      setData({
        deptsCount: depts.length,
        employeesCount: employees.length,
        claimsCount: allClaims.length,
        pendingCount: pendingClaims.length,
        approvedCount: approvedClaims.length,
        rejectedCount: rejectedClaims.length,
        totalBudget: totalBudgetSum,
        approvedExpense: totalApprovedSum,
        remainingBudget: remaining,
        recentClaims: allClaims.slice(0, 5), // top 5
        topSpendingDepts: topSpending,
      });
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader message="Compiling real-time budgets and KPI counters..." />;
  }

  const kpiCards = [
    { title: 'Total Departments', value: data.deptsCount, indicator: '+12%', color: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', icon: <FiFolder size={22} /> },
    { title: 'Total Employees', value: data.employeesCount, indicator: '+8%', color: 'linear-gradient(135deg, #10b981, #047857)', icon: <FiUsers size={22} /> },
    { title: 'Total Claims', value: data.claimsCount, indicator: '+24%', color: 'linear-gradient(135deg, #6366f1, #4338ca)', icon: <FiFileText size={22} /> },
    { title: 'Pending Claims', value: data.pendingCount, indicator: 'Active', color: 'linear-gradient(135deg, #f59e0b, #d97706)', icon: <FiClock size={22} /> },
    { title: 'Approved Claims', value: data.approvedCount, indicator: 'Success', color: 'linear-gradient(135deg, #22c55e, #15803d)', icon: <FiCheckCircle size={22} /> },
    { title: 'Rejected Claims', value: data.rejectedCount, indicator: 'Critical', color: 'linear-gradient(135deg, #ef4444, #b91c1c)', icon: <FiXCircle size={22} /> },
    { title: 'Monthly Budget', value: `$${data.totalBudget?.toLocaleString()}`, indicator: 'Allocated', color: 'linear-gradient(135deg, #ec4899, #be185d)', icon: <FiDollarSign size={22} /> },
    { title: 'Approved Expenses', value: `$${data.approvedExpense?.toLocaleString()}`, indicator: 'Spent', color: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', icon: <FiPieChart size={22} /> },
    { title: 'Remaining Budget', value: `$${data.remainingBudget?.toLocaleString()}`, indicator: `${data.totalBudget ? Math.round((data.remainingBudget / data.totalBudget) * 100) : 0}% left`, color: 'linear-gradient(135deg, #14b8a6, #0f766e)', icon: <FiGrid size={22} /> },
  ];

  return (
    <div className="slide-up">
      <PageHeader 
        title="Finance Dashboard" 
        subtitle="Overview of department expenses, pending reviews, and budget utilization." 
      />

      {/* KPI Cards Grid */}
      <div style={styles.kpiGrid}>
        {kpiCards.map((kpi, idx) => (
          <Card key={idx} hoverLift={true} style={{ ...styles.kpiCard, background: kpi.color }}>
            <div style={styles.kpiHeader}>
              <span style={styles.kpiIcon}>{kpi.icon}</span>
              <span style={styles.kpiIndicator}>{kpi.indicator}</span>
            </div>
            <h2 style={styles.kpiValue}>{kpi.value}</h2>
            <p style={styles.kpiTitle}>{kpi.title}</p>
          </Card>
        ))}
      </div>

      {/* Analytics Rows */}
      <div style={styles.row}>
        {/* Recent Claims Table */}
        <Card hoverLift={false} style={styles.tableCard}>
          <h3 style={styles.sectionTitle}>Recent Expense Claims</h3>
          <div className="table-wrapper">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Claim ID</th>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentClaims.map((claim) => (
                  <tr key={claim.claimId}>
                    <td style={{ fontWeight: '700' }}>#{claim.claimId}</td>
                    <td>{claim.email || 'N/A'}</td>
                    <td>{claim.departmentName || `Dept #${claim.departmentId}`}</td>
                    <td style={{ fontWeight: '600' }}>${claim.amount?.toFixed(2)}</td>
                    <td>
                      <span className={`badge badge-${claim.status?.toLowerCase()}`}>
                        {claim.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: '16px', textAlign: 'right' }}>
            <Link to="/claims" style={{ fontSize: '13px', fontWeight: '700' }}>View All Claims →</Link>
          </div>
        </Card>

        {/* Budget Utilization Panel */}
        <div style={styles.sideCol}>
          <Card hoverLift={false} style={styles.utilizationCard}>
            <h3 style={styles.sectionTitle}>Budget Utilization</h3>
            <div style={styles.progressBlock}>
              <div style={styles.progressLabel}>
                <span>Spent vs Allocated</span>
                <span>
                  {data.totalBudget ? Math.round((data.approvedExpense / data.totalBudget) * 100) : 0}%
                </span>
              </div>
              <div style={styles.progressContainer}>
                <div style={{
                  ...styles.progressBar,
                  width: `${data.totalBudget ? Math.min(100, (data.approvedExpense / data.totalBudget) * 100) : 0}%`,
                  backgroundColor: data.approvedExpense > data.totalBudget ? 'var(--danger)' : 'var(--primary)'
                }}></div>
              </div>
              <div style={styles.progressDetails}>
                <span>Spent: ${data.approvedExpense?.toLocaleString()}</span>
                <span>Total: ${data.totalBudget?.toLocaleString()}</span>
              </div>
            </div>

            {/* Top Spending Departments */}
            <div style={{ marginTop: '24px' }}>
              <h4 style={styles.subTitle}>Top Spending Departments</h4>
              <div style={styles.deptList}>
                {data.topSpendingDepts.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No expenses recorded yet.</p>
                ) : (
                  data.topSpendingDepts.map((d, i) => (
                    <div key={i} style={styles.deptItem}>
                      <span style={{ fontSize: '14px', fontWeight: '600' }}>{d.name}</span>
                      <strong style={{ fontSize: '14px', color: 'var(--primary)' }}>${d.amount?.toFixed(2)}</strong>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const styles = {
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
    marginBottom: '32px',
  },
  kpiCard: {
    color: '#ffffff',
    border: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: '24px',
  },
  kpiHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: '16px',
  },
  kpiIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: '10px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiIndicator: {
    fontSize: '12px',
    fontWeight: '700',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: '4px 10px',
    borderRadius: '12px',
  },
  kpiValue: {
    fontSize: '28px',
    fontWeight: '800',
    margin: '0 0 4px 0',
  },
  kpiTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    margin: 0,
  },
  row: {
    display: 'flex',
    gap: '30px',
    flexWrap: 'wrap',
  },
  tableCard: {
    flex: '2 1 550px',
    backgroundColor: '#ffffff',
  },
  sideCol: {
    flex: '1 1 300px',
  },
  utilizationCard: {
    backgroundColor: '#ffffff',
    height: '100%',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '800',
    color: 'var(--text-main)',
    margin: '0 0 20px 0',
    textAlign: 'left',
  },
  subTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: 'var(--text-main)',
    marginBottom: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    textAlign: 'left',
  },
  progressBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    textAlign: 'left',
  },
  progressLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    fontWeight: '700',
  },
  progressContainer: {
    height: '8px',
    backgroundColor: '#f1f5f9',
    borderRadius: '10px',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: '10px',
    transition: 'width 0.5s ease-out',
  },
  progressDetails: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
    fontWeight: '600',
    color: 'var(--text-muted)',
  },
  deptList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    textAlign: 'left',
  },
  deptItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: '1px solid var(--border-color)',
  },
};

export default Dashboard;
