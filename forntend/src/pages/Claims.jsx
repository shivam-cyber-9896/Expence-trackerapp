import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import useAuth from '../hooks/useAuth';
import { jsPDF } from 'jspdf';
import { claimService, categoryService, departmentService, employeeService } from '../services';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import PageHeader from '../components/common/PageHeader';
import Pagination from '../components/common/Pagination';
import EmptyState from '../components/common/EmptyState';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';
import { 
  FiSearch, 
  FiPlus, 
  FiEdit, 
  FiTrash2, 
  FiInfo, 
  FiDownload, 
  FiCalendar, 
  FiDollarSign, 
  FiFilter, 
  FiCheckCircle 
} from 'react-icons/fi';

export const Claims = () => {
  const { user } = useAuth();
  const [claims, setClaims] = useState([]);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Flow State: 'list' or 'submit'
  const [viewMode, setViewMode] = useState('list');

  // Search, pagination & filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Form submit state
  const isEmployee = user?.role === 'ROLE_EMPLOYEE';
  const [formEmployeeId, setFormEmployeeId] = useState('');
  const [formDeptName, setFormDeptName] = useState('Select Employee to auto-fill');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formExpenseDate, setFormExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [formDescription, setFormDescription] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [myProfile, setMyProfile] = useState(null);

  // Auto-fill employee profile for ROLE_EMPLOYEE
  useEffect(() => {
    const fetchMyProfile = async () => {
      if (isEmployee && user?.employeeId) {
        try {
          const response = await employeeService.getById(user.employeeId);
          if (response && response.success && response.data) {
            setMyProfile(response.data);
            setFormEmployeeId(response.data.employeeId.toString());
            setFormDeptName(response.data.departmentName || `Department #${response.data.departmentId}`);
          }
        } catch (err) {
          console.error('Failed to fetch employee profile:', err);
        }
      }
    };
    fetchMyProfile();
  }, [user]);

  // Details Modal state
  const [selectedClaim, setSelectedClaim] = useState(null);

  useEffect(() => {
    fetchClaims();
    fetchCategories();
    fetchDepartments();
    fetchEmployees();
  }, [page, statusFilter, categoryFilter, deptFilter, monthFilter, yearFilter]);

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAll({ page: 0, size: 100, sortBy: 'categoryName', direction: 'asc' });
      if (response && response.success && response.data) {
        setCategories(response.data.content || []);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await departmentService.getAll({ page: 0, size: 100, sortBy: 'departmentName', direction: 'asc' });
      if (response && response.success && response.data) {
        setDepartments(response.data.content || []);
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await employeeService.getAll({ page: 0, size: 100, sortBy: 'employeeName', direction: 'asc' });
      if (response && response.success && response.data) {
        setEmployees(response.data.content || []);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size: 5,
        sortBy: 'claimId',
        direction: 'desc'
      };

      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.categoryId = Number(categoryFilter);
      if (deptFilter) params.departmentId = Number(deptFilter);
      // Backend mapping
      
      const response = await claimService.getAll(params);
      if (response && response.success && response.data) {
        setClaims(response.data.content || []);
        setTotalPages(response.data.totalPages || 1);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch expense claims');
    } finally {
      setLoading(false);
    }
  };

  // Auto-fill department when employee changes (admin flow only)
  useEffect(() => {
    if (!isEmployee) {
      if (formEmployeeId) {
        const emp = employees.find(e => e.employeeId.toString() === formEmployeeId);
        if (emp) {
          setFormDeptName(emp.departmentName || `Department #${emp.departmentId}`);
        }
      } else {
        setFormDeptName('Select Employee to auto-fill');
      }
    }
  }, [formEmployeeId, employees, isEmployee]);

  const handleResetForm = () => {
    if (!isEmployee) {
      setFormEmployeeId('');
      setFormDeptName('Select Employee to auto-fill');
    }
    setFormCategoryId('');
    setFormAmount('');
    setFormExpenseDate(new Date().toISOString().split('T')[0]);
    setFormDescription('');
    setFormErrors({});
  };

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormErrors({});

    // Validate inputs
    const errors = {};
    if (!formEmployeeId) errors.employeeId = 'Employee selection is required';
    if (!formCategoryId) errors.categoryId = 'Expense category is required';
    if (!formAmount || parseFloat(formAmount) <= 0) errors.amount = 'Amount must be greater than zero';
    if (!formExpenseDate) errors.expenseDate = 'Expense transaction date is required';
    if (!formDescription) errors.description = 'Description is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setSubmitting(false);
      return;
    }

    try {
      const payload = {
        employeeId: Number(formEmployeeId),
        categoryId: Number(formCategoryId),
        amount: parseFloat(formAmount),
        expenseDate: formExpenseDate,
        description: formDescription,
      };

      const response = await claimService.create(payload);
      if (response && response.success) {
        handleResetForm();
        setViewMode('list');
        fetchClaims();
        
        // SweetAlert2 success popup as required
        Swal.fire({
          title: 'Success!',
          text: 'Your expense claim was successfully submitted for approval.',
          icon: 'success',
          confirmButtonColor: 'var(--primary)',
          borderRadius: '15px',
        });
      }
    } catch (err) {
      Swal.fire({
        title: 'Error!',
        text: err.message || 'Failed to submit claim.',
        icon: 'error',
        confirmButtonColor: 'var(--primary)',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClaim = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'var(--danger)',
      cancelButtonColor: '#cbd5e1',
      confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
      try {
        const response = await claimService.delete(id);
        if (response && response.success) {
          fetchClaims();
          Swal.fire('Deleted!', 'Expense claim has been removed.', 'success');
        }
      } catch (err) {
        Swal.fire('Error!', err.message || 'Failed to delete claim.', 'error');
      }
    }
  };

  // Export to CSV UI placeholder
  const handleExportCSV = () => {
    Swal.fire({
      title: 'CSV Export Initiated',
      text: 'Exporting items to ExpenseClaims.csv (Simulated UI action)',
      icon: 'info',
      timer: 2000,
      showConfirmButton: false,
    });
  };

  // Generate beautiful PDF report for a single claim
  const handleGenerateSinglePDF = (claim) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Header banner
    doc.setFillColor(37, 99, 235); // Corporate Blue: #2563EB
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('REIMBURSEMENT CLAIM REPORT', 15, 22);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 15, 30);
    doc.text(`ExpenseControl System`, 155, 30);

    // Section 1: Employee info
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('Employee Information', 15, 55);

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(15, 58, 195, 58);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105);
    doc.text('Employee Name:', 15, 66);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text(claim.employeeName || 'N/A', 55, 66);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('Email Address:', 15, 73);
    doc.setTextColor(15, 23, 42);
    doc.text(claim.email || 'N/A', 55, 73);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('Department:', 15, 80);
    doc.setTextColor(15, 23, 42);
    doc.text(claim.departmentName || `Dept #${claim.departmentId}`, 55, 80);

    // Section 2: Claim info
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('Claim details', 15, 95);
    doc.line(15, 98, 195, 98);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105);
    doc.text('Claim Reference:', 15, 106);
    doc.setTextColor(15, 23, 42);
    doc.text(`#${claim.claimId}`, 55, 106);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('Category:', 15, 113);
    doc.setTextColor(15, 23, 42);
    doc.text(claim.categoryName || `Category #${claim.categoryId}`, 55, 113);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('Expense Date:', 15, 120);
    doc.setTextColor(15, 23, 42);
    doc.text(claim.expenseDate, 55, 120);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('Claimed Amount:', 15, 127);
    doc.setTextColor(37, 99, 235);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`$${claim.amount?.toFixed(2)}`, 55, 127);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105);
    doc.text('Description:', 15, 136);
    doc.setTextColor(15, 23, 42);
    const splitDesc = doc.splitTextToSize(claim.description || 'No description provided.', 140);
    doc.text(splitDesc, 55, 136);

    // Section 3: Status info
    const splitDescLines = splitDesc.length;
    const reviewStartY = 142 + (splitDescLines * 5);

    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('Supervisor Review Decision', 15, reviewStartY);
    doc.line(15, reviewStartY + 3, 195, reviewStartY + 3);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105);
    doc.text('Current Status:', 15, reviewStartY + 11);
    
    const statusText = claim.status || 'PENDING';
    if (statusText === 'APPROVED') {
      doc.setTextColor(22, 163, 74);
    } else if (statusText === 'REJECTED') {
      doc.setTextColor(220, 38, 38);
    } else {
      doc.setTextColor(245, 158, 11);
    }
    doc.setFont('helvetica', 'bold');
    doc.text(statusText, 55, reviewStartY + 11);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('Reviewer Name:', 15, reviewStartY + 18);
    doc.setTextColor(15, 23, 42);
    doc.text(claim.reviewerName || 'Pending Decision', 55, reviewStartY + 18);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('Remarks / Notes:', 15, reviewStartY + 25);
    doc.setTextColor(15, 23, 42);
    const splitRemarks = doc.splitTextToSize(claim.remarks || 'No notes added.', 140);
    doc.text(splitRemarks, 55, reviewStartY + 25);

    // Signatures area
    const sigY = reviewStartY + 35 + (splitRemarks.length * 5);
    doc.setDrawColor(203, 213, 225);
    doc.line(15, sigY, 85, sigY);
    doc.line(125, sigY, 195, sigY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('Employee Signature', 15, sigY + 5);
    doc.text('Authorized Approver Signature', 125, sigY + 5);

    doc.save(`ExpenseClaimReport_${claim.claimId}.pdf`);
  };

  // Generate PDF for the list of claims
  const handleExportPDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Banner
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, 210, 30, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('EXPENSE REIMBURSEMENTS SUMMARY LIST', 15, 18);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Generated: ${new Date().toLocaleDateString()} | Active Filter List`, 15, 25);

    // Headers
    let startY = 40;
    doc.setFillColor(241, 245, 249);
    doc.rect(15, startY, 180, 8, 'F');

    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('ID', 17, startY + 5.5);
    doc.text('Employee Name', 30, startY + 5.5);
    doc.text('Date', 85, startY + 5.5);
    doc.text('Category', 115, startY + 5.5);
    doc.text('Amount', 155, startY + 5.5);
    doc.text('Status', 178, startY + 5.5);

    // Grid rows
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    let totalAmt = 0;
    
    filteredClaims.forEach((c, idx) => {
      const rowY = startY + 8 + (idx * 8);
      totalAmt += c.amount || 0;

      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(15, rowY, 180, 8, 'F');
      }

      doc.setDrawColor(241, 245, 249);
      doc.setLineWidth(0.3);
      doc.line(15, rowY + 8, 195, rowY + 8);

      doc.text(`#${c.claimId}`, 17, rowY + 5.5);
      
      const truncName = c.employeeName?.length > 25 ? c.employeeName.substring(0, 22) + '...' : c.employeeName || 'N/A';
      doc.text(truncName, 30, rowY + 5.5);
      
      doc.text(c.expenseDate || '', 85, rowY + 5.5);
      
      const truncCat = c.categoryName?.length > 18 ? c.categoryName.substring(0, 15) + '...' : c.categoryName || 'N/A';
      doc.text(truncCat, 115, rowY + 5.5);
      
      doc.text(`$${c.amount?.toFixed(2)}`, 155, rowY + 5.5);

      const statusText = c.status || 'PENDING';
      if (statusText === 'APPROVED') {
        doc.setTextColor(22, 163, 74);
      } else if (statusText === 'REJECTED') {
        doc.setTextColor(220, 38, 38);
      } else {
        doc.setTextColor(245, 158, 11);
      }
      doc.setFont('helvetica', 'bold');
      doc.text(statusText, 178, rowY + 5.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
    });

    const footerY = startY + 8 + (filteredClaims.length * 8) + 4;
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.8);
    doc.line(15, footerY, 195, footerY);

    doc.setFont('helvetica', 'bold');
    doc.text('Total Summary Metrics:', 30, footerY + 6);
    doc.text(`Count: ${filteredClaims.length}`, 115, footerY + 6);
    doc.setTextColor(37, 99, 235);
    doc.text(`$${totalAmt.toFixed(2)}`, 155, footerY + 6);

    doc.save('ExpenseClaimsSummaryList.pdf');
  };

  // Advanced Filtering
  const filteredClaims = claims.filter(c => {
    // Filter locally by Search (email/desc) and Amount Ranges
    const matchesSearch = c.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesAmount = true;
    if (minAmount && c.amount < parseFloat(minAmount)) matchesAmount = false;
    if (maxAmount && c.amount > parseFloat(maxAmount)) matchesAmount = false;

    let matchesMonthYear = true;
    if (c.expenseDate) {
      const dateParts = c.expenseDate.split('-'); // yyyy-MM-dd
      if (monthFilter && Number(dateParts[1]) !== Number(monthFilter)) matchesMonthYear = false;
      if (yearFilter && Number(dateParts[0]) !== Number(yearFilter)) matchesMonthYear = false;
    }

    return matchesSearch && matchesAmount && matchesMonthYear;
  });

  return (
    <div className="slide-up">
      <PageHeader 
        title="Expense Claims" 
        subtitle="Submit expense reimbursement forms, filter logs, and track approvals."
        action={
          viewMode === 'list' ? (
            <Button onClick={() => setViewMode('submit')} variant="primary">
              <FiPlus size={16} /> Submit Expense Claim
            </Button>
          ) : (
            <Button onClick={() => setViewMode('list')} variant="secondary">
              Back to Claims List
            </Button>
          )
        }
      />

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {viewMode === 'submit' ? (
        /* ================= SUBMIT EXPENSE CLAIM FORM ================= */
        <Card hoverLift={false} style={styles.formCard}>
          <h2 style={styles.sectionTitle}>New Expense Claim Form</h2>
          <p style={styles.formSub}>Provide transaction details and receipt amounts for reimbursement validation.</p>

          <form onSubmit={handleClaimSubmit} style={styles.twoColForm}>
            <div style={styles.formCol}>
              <div className="form-group">
                <label className="form-label">{isEmployee ? 'Submitting As' : 'Employee Selection'}</label>
                {isEmployee ? (
                  <input
                    type="text"
                    value={myProfile?.employeeName || user?.email || 'Loading...'}
                    disabled
                    className="form-input"
                    style={styles.disabledInput}
                  />
                ) : (
                  <select
                    value={formEmployeeId}
                    onChange={(e) => setFormEmployeeId(e.target.value)}
                    className={`form-select ${formErrors.employeeId ? 'invalid-field' : ''}`}
                    style={formErrors.employeeId ? styles.errorField : {}}
                  >
                    <option value="">Choose Employee</option>
                    {employees.map(e => (
                      <option key={e.employeeId} value={e.employeeId}>
                        {e.employeeName} ({e.email})
                      </option>
                    ))}
                  </select>
                )}
                {formErrors.employeeId && <span style={styles.errorText}>{formErrors.employeeId}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Department (Auto-filled)</label>
                <input
                  type="text"
                  value={formDeptName}
                  disabled
                  className="form-input"
                  style={styles.disabledInput}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Expense Classification Category</label>
                <select
                  value={formCategoryId}
                  onChange={(e) => setFormCategoryId(e.target.value)}
                  className={`form-select ${formErrors.categoryId ? 'invalid-field' : ''}`}
                  style={formErrors.categoryId ? styles.errorField : {}}
                >
                  <option value="">Choose Category</option>
                  {categories.map(cat => (
                    <option key={cat.categoryId} value={cat.categoryId}>
                      {cat.categoryName} (Max: ${cat.maxLimit})
                    </option>
                  ))}
                </select>
                {formErrors.categoryId && <span style={styles.errorText}>{formErrors.categoryId}</span>}
              </div>
            </div>

            <div style={styles.formCol}>
              <div className="form-group">
                <label className="form-label">Expense Date</label>
                <input
                  type="date"
                  value={formExpenseDate}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setFormExpenseDate(e.target.value)}
                  className={`form-input ${formErrors.expenseDate ? 'invalid-field' : ''}`}
                  style={formErrors.expenseDate ? styles.errorField : {}}
                />
                {formErrors.expenseDate && <span style={styles.errorText}>{formErrors.expenseDate}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Reimbursement Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  className={`form-input ${formErrors.amount ? 'invalid-field' : ''}`}
                  style={formErrors.amount ? styles.errorField : {}}
                />
                {formErrors.amount && <span style={styles.errorText}>{formErrors.amount}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Description / Business Purpose</label>
                <textarea
                  placeholder="Explain details of this purchase..."
                  rows="3"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className={`form-textarea ${formErrors.description ? 'invalid-field' : ''}`}
                  style={formErrors.description ? styles.errorField : {}}
                />
                {formErrors.description && <span style={styles.errorText}>{formErrors.description}</span>}
              </div>
            </div>

            <div style={styles.formFullWidth}>
              <div style={styles.btnRow}>
                <Button type="submit" disabled={submitting} variant="primary" style={styles.submitBtn}>
                  {submitting ? 'Submitting...' : 'Submit Claim'}
                </Button>
                <Button onClick={handleResetForm} variant="secondary">
                  Reset
                </Button>
                <Button onClick={() => setViewMode('list')} variant="secondary">
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        </Card>
      ) : (
        /* ================= EXPENSE CLAIMS DATA TABLE VIEW ================= */
        <Card hoverLift={false} style={{ width: '100%' }}>
          <div style={styles.tableToolbar}>
            <h2 style={styles.sectionTitle}>Expense Logs</h2>
            
            <div style={styles.toolbarActions}>
              <div style={styles.searchBox}>
                <FiSearch style={styles.searchIcon} />
                <input 
                  type="text" 
                  placeholder="Search claims..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={styles.searchInput}
                />
              </div>

              <Button onClick={() => setShowAdvancedFilters(!showAdvancedFilters)} variant="secondary" style={styles.filterBtn}>
                <FiFilter /> Filter
              </Button>

              <Button onClick={handleExportCSV} variant="secondary" style={styles.exportBtn}>
                <FiDownload /> Export CSV
              </Button>

              <Button onClick={handleExportPDF} variant="secondary" style={styles.exportBtn}>
                <FiDownload /> Export PDF
              </Button>
            </div>
          </div>

          {/* Advanced Filter Panel */}
          {showAdvancedFilters && (
            <div style={styles.filterPanel}>
              <div style={styles.filterRow}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Department</label>
                  <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="form-select">
                    <option value="">All Departments</option>
                    {departments.map(d => (
                      <option key={d.departmentId} value={d.departmentId}>{d.departmentName}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Category</label>
                  <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="form-select">
                    <option value="">All Categories</option>
                    {categories.map(c => (
                      <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Status</label>
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="form-select">
                    <option value="">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
              </div>

              <div style={styles.filterRow}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Month</label>
                  <select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} className="form-select">
                    <option value="">All Months</option>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Year</label>
                  <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} className="form-select">
                    <option value="">All Years</option>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                    <option value="2028">2028</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Amount Range ($)</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input type="number" placeholder="Min" value={minAmount} onChange={(e) => setMinAmount(e.target.value)} className="form-input" style={{ width: '50%' }} />
                    <input type="number" placeholder="Max" value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)} className="form-input" style={{ width: '50%' }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <Loader message="Loading claims..." />
          ) : filteredClaims.length === 0 ? (
            <EmptyState 
              title="No Claims Found" 
              description="No logs matching your selection found." 
            />
          ) : (
            <>
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
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClaims.map((claim) => (
                      <tr key={claim.claimId}>
                        <td style={{ fontWeight: '700' }}>#{claim.claimId}</td>
                        <td>{claim.email || 'N/A'}</td>
                        <td>{claim.departmentName || `Dept #${claim.departmentId}`}</td>
                        <td>{claim.categoryName || `Category #${claim.categoryId}`}</td>
                        <td style={{ fontWeight: '600' }}>${claim.amount?.toFixed(2)}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <FiCalendar size={13} style={{ color: 'var(--text-muted)' }} />
                            {claim.expenseDate}
                          </div>
                        </td>
                        <td>
                          <span className={`badge badge-${claim.status?.toLowerCase()}`}>
                            {claim.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <Button 
                              onClick={() => setSelectedClaim(claim)} 
                              variant="secondary" 
                              style={styles.actionBtn}
                              title="View Details"
                            >
                              <FiInfo size={13} />
                            </Button>
                            {claim.status === 'PENDING' && (
                              <Button 
                                onClick={() => handleDeleteClaim(claim.claimId)} 
                                variant="secondary" 
                                style={{ ...styles.actionBtn, color: 'var(--danger)' }}
                                title="Delete Claim"
                              >
                                <FiTrash2 size={13} />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
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
      )}

      {/* Claim Details Modal View */}
      <Modal
        isOpen={!!selectedClaim}
        onClose={() => setSelectedClaim(null)}
        title={selectedClaim ? `Claim Invoice Details #${selectedClaim.claimId}` : ''}
        size="md"
      >
        {selectedClaim && (
          <div style={styles.modalBody}>
            {/* Employee Information */}
            <div style={styles.detailsBlock}>
              <h4 style={styles.blockTitle}>Employee Information</h4>
              <div style={styles.gridInfo}>
                <div style={styles.infoCell}>
                  <span>Email:</span>
                  <strong>{selectedClaim.email || 'N/A'}</strong>
                </div>
                <div style={styles.infoCell}>
                  <span>Department:</span>
                  <strong>{selectedClaim.departmentName || `Dept #${selectedClaim.departmentId}`}</strong>
                </div>
              </div>
            </div>

            {/* Expense Information */}
            <div style={styles.detailsBlock}>
              <h4 style={styles.blockTitle}>Expense Information</h4>
              <div style={styles.gridInfo}>
                <div style={styles.infoCell}>
                  <span>Category:</span>
                  <strong>{selectedClaim.categoryName || `Category #${selectedClaim.categoryId}`}</strong>
                </div>
                <div style={styles.infoCell}>
                  <span>Amount:</span>
                  <strong style={{ color: 'var(--primary)', fontSize: '16px' }}>
                    ${selectedClaim.amount?.toFixed(2)}
                  </strong>
                </div>
                <div style={styles.infoCell}>
                  <span>Date:</span>
                  <strong>{selectedClaim.expenseDate}</strong>
                </div>
                <div style={styles.infoCell}>
                  <span>Description:</span>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                    {selectedClaim.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Review Information */}
            {selectedClaim.status !== 'PENDING' && (
              <div style={styles.detailsBlock}>
                <h4 style={styles.blockTitle}>Review Decision</h4>
                <div style={styles.gridInfo}>
                  <div style={styles.infoCell}>
                    <span>Reviewer:</span>
                    <strong>{selectedClaim.reviewerName || 'Supervisor'}</strong>
                  </div>
                  <div style={styles.infoCell}>
                    <span>Remarks:</span>
                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                      {selectedClaim.remarks || 'No notes added.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Status Timeline */}
            <div style={styles.detailsBlock}>
              <h4 style={styles.blockTitle}>Processing Timeline</h4>
              <div style={styles.timeline}>
                <div style={styles.timelineItem}>
                  <div style={{ ...styles.timelineNode, backgroundColor: 'var(--primary)' }}>
                    <FiCheckCircle size={12} color="#fff" />
                  </div>
                  <div style={styles.timelineContent}>
                    <span>Claim Submitted</span>
                    <small>Date: {selectedClaim.expenseDate}</small>
                  </div>
                </div>

                <div style={styles.timelineItem}>
                  <div style={{
                    ...styles.timelineNode,
                    backgroundColor: selectedClaim.status !== 'PENDING' ? 'var(--primary)' : '#e2e8f0'
                  }}>
                    <FiCheckCircle size={12} color="#fff" />
                  </div>
                  <div style={styles.timelineContent}>
                    <span>Manager Review</span>
                    <small>Status: {selectedClaim.status}</small>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <Button onClick={() => handleGenerateSinglePDF(selectedClaim)} variant="primary">
                <FiDownload /> Download PDF
              </Button>
              <Button onClick={() => setSelectedClaim(null)} variant="secondary">
                Close Detail
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

const styles = {
  container: {
    color: 'var(--text-main)',
  },
  header: {
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '800',
    color: 'var(--text-main)',
    margin: 0,
    textAlign: 'left',
  },
  tableToolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  toolbarActions: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: '30px',
    padding: '6px 14px',
    border: '1px solid var(--border-color)',
  },
  searchIcon: {
    color: 'var(--text-muted)',
    marginRight: '6px',
  },
  searchInput: {
    background: 'none',
    border: 'none',
    outline: 'none',
    fontSize: '13px',
  },
  filterBtn: {
    borderRadius: '30px',
  },
  exportBtn: {
    borderRadius: '30px',
  },
  filterPanel: {
    backgroundColor: '#f8fafc',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    padding: '16px',
    marginBottom: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  filterRow: {
    display: 'flex',
    gap: '16px',
  },
  actionBtn: {
    padding: '6px 10px',
    borderRadius: '8px',
  },
  emptyState: {
    padding: '40px',
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '15px',
  },
  formCard: {
    maxWidth: '850px',
    margin: '0 auto',
    backgroundColor: '#ffffff',
  },
  formSub: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    marginBottom: '24px',
    textAlign: 'left',
  },
  twoColForm: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '24px',
  },
  formCol: {
    flex: '1 1 350px',
    display: 'flex',
    flexDirection: 'column',
  },
  formFullWidth: {
    width: '100%',
  },
  disabledInput: {
    backgroundColor: '#f8fafc',
    color: 'var(--text-muted)',
    cursor: 'not-allowed',
  },
  btnRow: {
    display: 'flex',
    gap: '12px',
    marginTop: '20px',
  },
  submitBtn: {
    flex: 1,
  },
  errorText: {
    fontSize: '12px',
    color: 'var(--danger)',
    fontWeight: '600',
    textAlign: 'left',
    marginTop: '4px',
  },
  errorField: {
    borderColor: 'var(--danger)',
    boxShadow: '0 0 0 3px rgba(220, 38, 38, 0.15)',
  },
  modalBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    textAlign: 'left',
  },
  detailsBlock: {
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '16px',
  },
  blockTitle: {
    fontSize: '14px',
    fontWeight: '700',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    marginBottom: '10px',
    letterSpacing: '0.5px',
  },
  gridInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  infoCell: {
    fontSize: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  timeline: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginTop: '10px',
    position: 'relative',
    paddingLeft: '24px',
  },
  timelineItem: {
    display: 'flex',
    alignItems: 'flex-start',
    position: 'relative',
  },
  timelineNode: {
    position: 'absolute',
    left: '-24px',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  timelineContent: {
    display: 'flex',
    flexDirection: 'column',
    fontSize: '13px',
    gap: '2px',
  },
};

// Append styles inside CSS variables
if (typeof document !== 'undefined') {
  const css = `
    .badge-pending {
      background-color: var(--warning-bg);
      color: var(--warning);
    }
    .badge-approved {
      background-color: var(--success-bg);
      color: var(--success);
    }
    .badge-rejected {
      background-color: var(--danger-bg);
      color: var(--danger);
    }
  `;
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = css;
  document.head.appendChild(styleSheet);
}

export default Claims;
