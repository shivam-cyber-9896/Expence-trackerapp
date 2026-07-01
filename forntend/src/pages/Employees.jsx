import { useState, useEffect } from 'react';
import { employeeService, departmentService } from '../services';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import PageHeader from '../components/common/PageHeader';
import Pagination from '../components/common/Pagination';
import EmptyState from '../components/common/EmptyState';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiEdit, FiTrash2, FiUser, FiInfo, FiArrowUp, FiArrowDown, FiPlus } from 'react-icons/fi';

export const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form edit states
  const [editingEmpId, setEditingEmpId] = useState(null);
  const [employeeName, setEmployeeName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [designation, setDesignation] = useState('');
  const [role, setRole] = useState('ROLE_EMPLOYEE');
  const [departmentId, setDepartmentId] = useState('');
  const [password, setPassword] = useState(''); // Only for creation/updates if required
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Search, pagination & sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('employeeId');
  const [direction, setDirection] = useState('asc');

  // Slide-out Drawer profile details state
  const [selectedProfile, setSelectedProfile] = useState(null);

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
  }, [page, sortBy, direction]);

  const fetchDepartments = async () => {
    try {
      const response = await departmentService.getAll({ page: 0, size: 100, sortBy: 'departmentName', direction: 'asc' });
      if (response && response.success && response.data) {
        const content = response.data.content || [];
        const filtered = content.filter(d => 
          d.departmentCode !== 'ADMIN' && 
          d.departmentName?.toUpperCase() !== 'ADMINISTRATION'
        );
        setDepartments(filtered);
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await employeeService.getAll({ 
        page, 
        size: 5, 
        sortBy, 
        direction 
      });
      if (response && response.success && response.data) {
        setEmployees(response.data.content || []);
        setTotalPages(response.data.totalPages || 1);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch employees list');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateForm = () => {
    setEditingEmpId(null);
    setEmployeeName('');
    setEmail('');
    setPhone('');
    setDesignation('');
    setRole('ROLE_EMPLOYEE');
    setDepartmentId(departments.length > 0 ? departments[0].departmentId.toString() : '');
    setPassword('');
    setIsFormOpen(true);
    setError(null);
    setSuccess(null);
  };

  const handleEditClick = (emp) => {
    setEditingEmpId(emp.employeeId);
    setEmployeeName(emp.employeeName || '');
    setEmail(emp.email || '');
    setPhone(emp.phone || '');
    setDesignation(emp.designation || '');
    setRole(emp.role || 'ROLE_EMPLOYEE');
    setDepartmentId(emp.departmentId ? emp.departmentId.toString() : '');
    setPassword(''); // leave empty
    setIsFormOpen(true);
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    // Front-end validations matching EmployeeRequestDto
    if (!/^[A-Za-z ]{3,50}$/.test(employeeName)) {
      setError('Employee name must be between 3 and 50 alphabetic characters');
      setSubmitting(false);
      return;
    }
    if (!/^[6-9][0-9]{9}$/.test(phone)) {
      setError('Phone number must be a valid 10-digit number');
      setSubmitting(false);
      return;
    }

    try {
      const payload = {
        employeeName,
        email,
        phone,
        designation,
        role,
        departmentId: Number(departmentId),
      };

      if (!editingEmpId) {
        // Require password for new employee
        if (!password || password.length < 6) {
          setError('Password must be at least 6 characters for a new employee account');
          setSubmitting(false);
          return;
        }
        payload.password = password;
      } else if (password) {
        payload.password = password; // update password if provided
      } else {
        payload.password = 'placeholderPass123'; // backend might require password in dto
      }

      let response;
      if (editingEmpId) {
        response = await employeeService.update(editingEmpId, payload);
      } else {
        response = await employeeService.create(payload);
      }

      if (response && response.success) {
        setSuccess(editingEmpId ? 'Employee updated successfully' : 'Employee created successfully');
        setIsFormOpen(false);
        fetchEmployees();
      }
    } catch (err) {
      setError(err.message || 'Failed to save employee profile');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to delete employee #${id}?`)) return;
    
    setError(null);
    setSuccess(null);
    try {
      const response = await employeeService.delete(id);
      if (response && response.success) {
        setSuccess('Employee removed successfully');
        fetchEmployees();
      }
    } catch (err) {
      setError(err.message || 'Failed to delete employee profile');
    }
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setDirection(direction === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setDirection('asc');
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.designation?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="slide-up">
      <PageHeader 
        title="Employee Directory" 
        subtitle="View and manage employee profile records, security roles, and departmental assignments."
        action={
          <Button onClick={handleOpenCreateForm} variant="primary">
            <FiPlus size={16} /> Add Employee
          </Button>
        }
      />

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Directory Grid */}
      <Card hoverLift={false} style={{ width: '100%', marginBottom: '24px' }}>
        <div style={styles.listHeader}>
          <h2 style={styles.sectionTitle}>Registry Records</h2>
          <div style={styles.searchBox}>
            <FiSearch style={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search directory..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>
        </div>

        {loading ? (
          <Loader message="Fetching organization employee records..." />
        ) : filteredEmployees.length === 0 ? (
          <EmptyState 
            title="No Employees Found" 
            description="Clear search or register a new employee using the + Add Employee button." 
          />
        ) : (
          <>
            <div className="table-wrapper">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th onClick={() => toggleSort('employeeId')} style={styles.thSortable}>
                      ID {sortBy === 'employeeId' && (direction === 'asc' ? <FiArrowUp /> : <FiArrowDown />)}
                    </th>
                    <th onClick={() => toggleSort('employeeName')} style={styles.thSortable}>
                      Name {sortBy === 'employeeName' && (direction === 'asc' ? <FiArrowUp /> : <FiArrowDown />)}
                    </th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Designation</th>
                    <th>Department</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((emp) => (
                    <tr key={emp.employeeId}>
                      <td style={{ fontWeight: '700' }}>#{emp.employeeId}</td>
                      <td style={{ fontWeight: '600' }}>{emp.employeeName}</td>
                      <td>{emp.email}</td>
                      <td>{emp.phone}</td>
                      <td>{emp.designation || 'N/A'}</td>
                      <td>{emp.departmentName || `Dept #${emp.departmentId}`}</td>
                      <td>
                        <span className="badge badge-role">
                          {emp.role}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <Button 
                            onClick={() => setSelectedProfile(emp)} 
                            variant="secondary" 
                            style={styles.actionBtn}
                            title="View Details"
                          >
                            <FiInfo size={13} />
                          </Button>
                          <Button 
                            onClick={() => handleEditClick(emp)} 
                            variant="secondary" 
                            style={styles.actionBtn}
                            title="Edit Employee"
                          >
                            <FiEdit size={13} />
                          </Button>
                          <Button 
                            onClick={() => handleDelete(emp.employeeId)} 
                            variant="secondary" 
                            style={{ ...styles.actionBtn, color: 'var(--danger)' }}
                            title="Delete Employee"
                          >
                            <FiTrash2 size={13} />
                          </Button>
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

      {/* Edit / Create Modal Form */}
      <Modal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)}
        title={editingEmpId ? `Edit Employee Account #${editingEmpId}` : 'Add New Employee'}
      >
        <form onSubmit={handleSubmit} style={styles.form}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              placeholder="e.g. John Doe"
              value={employeeName}
              onChange={(e) => setEmployeeName(e.target.value)}
              required
              className="form-input"
            />
          </div>

          <div style={styles.formRow}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Email Address</label>
              <input
                type="email"
                placeholder="john@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-input"
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="form-input"
              />
            </div>
          </div>

          <div style={styles.formRow}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Designation</label>
              <input
                type="text"
                placeholder="e.g. Senior Manager"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                required
                className="form-input"
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Account Password</label>
              <input
                type="password"
                placeholder={editingEmpId ? 'Leave blank to keep current' : 'At least 6 characters'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={!editingEmpId}
                className="form-input"
              />
            </div>
          </div>

          <div style={styles.formRow}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Department</label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                required
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

            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">System Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                className="form-select"
              >
                <option value="ROLE_EMPLOYEE">Employee</option>
                <option value="ROLE_ADMIN">Admin</option>
              </select>
            </div>
          </div>

          <div style={styles.modalBtnRow}>
            <Button type="submit" disabled={submitting} variant="primary" style={{ flex: 1 }}>
              {submitting ? 'Saving...' : 'Save Account'}
            </Button>
            <Button onClick={() => setIsFormOpen(false)} variant="secondary">
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Slide-out Profile Details Drawer using Framer Motion */}
      <AnimatePresence>
        {selectedProfile && (
          <div style={styles.drawerOverlay}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProfile(null)}
              style={styles.drawerBackdrop}
            />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              style={styles.drawerCard}
            >
              <div style={styles.drawerHeader}>
                <h3 style={styles.drawerTitle}>Employee Profile Drawer</h3>
                <button onClick={() => setSelectedProfile(null)} style={styles.drawerClose}>✕</button>
              </div>

              <div style={styles.drawerBody}>
                <div style={styles.avatarLarge}>
                  {selectedProfile.employeeName ? selectedProfile.employeeName.charAt(0).toUpperCase() : 'U'}
                </div>
                
                <h4 style={styles.profileName}>{selectedProfile.employeeName}</h4>
                <p style={styles.profileDesignation}>{selectedProfile.designation || 'Staff member'}</p>
                <span className="badge badge-role" style={{ marginTop: '4px' }}>
                  {selectedProfile.role}
                </span>

                <div style={styles.profileSection}>
                  <h5 style={styles.profileSecTitle}>Contact Information</h5>
                  <div style={styles.profileItem}>
                    <span>Email:</span>
                    <strong>{selectedProfile.email}</strong>
                  </div>
                  <div style={styles.profileItem}>
                    <span>Phone:</span>
                    <strong>{selectedProfile.phone}</strong>
                  </div>
                </div>

                <div style={styles.profileSection}>
                  <h5 style={styles.profileSecTitle}>Organization</h5>
                  <div style={styles.profileItem}>
                    <span>Department:</span>
                    <strong>{selectedProfile.departmentName || `Dept #${selectedProfile.departmentId}`}</strong>
                  </div>
                  <div style={styles.profileItem}>
                    <span>Employee ID:</span>
                    <strong>#{selectedProfile.employeeId}</strong>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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
  listHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '800',
    color: 'var(--text-main)',
    margin: 0,
    textAlign: 'left',
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
  thSortable: {
    cursor: 'pointer',
    userSelect: 'none',
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
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
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
  drawerOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2000,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  drawerBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.3)',
    backdropFilter: 'blur(2px)',
  },
  drawerCard: {
    position: 'relative',
    width: '400px',
    maxWidth: '100%',
    backgroundColor: '#ffffff',
    height: '100%',
    boxShadow: '-10px 0 25px -5px rgba(0, 0, 0, 0.1)',
    zIndex: 2001,
    display: 'flex',
    flexDirection: 'column',
    padding: '30px 24px',
    textAlign: 'left',
  },
  drawerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '16px',
    marginBottom: '24px',
  },
  drawerTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: 'var(--text-main)',
    margin: 0,
  },
  drawerClose: {
    background: 'none',
    border: 'none',
    fontSize: '16px',
    color: 'var(--text-muted)',
    cursor: 'pointer',
  },
  drawerBody: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
    overflowY: 'auto',
  },
  avatarLarge: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary-light)',
    color: 'var(--primary)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontWeight: '700',
    fontSize: '32px',
    border: '3px solid var(--primary)',
    marginBottom: '16px',
  },
  profileName: {
    fontSize: '20px',
    fontWeight: '800',
    color: 'var(--text-main)',
    margin: '0 0 4px 0',
  },
  profileDesignation: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    margin: 0,
  },
  profileSection: {
    width: '100%',
    marginTop: '24px',
    borderTop: '1px dashed #e2e8f0',
    paddingTop: '16px',
  },
  profileSecTitle: {
    fontSize: '12px',
    fontWeight: '700',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    letterSpacing: '0.5px',
    marginBottom: '12px',
  },
  profileItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    marginBottom: '8px',
  },
};

export default Employees;
