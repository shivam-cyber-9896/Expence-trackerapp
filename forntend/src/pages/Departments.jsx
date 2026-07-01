import { useState, useEffect } from 'react';
import { departmentService } from '../services';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import PageHeader from '../components/common/PageHeader';
import Pagination from '../components/common/Pagination';
import EmptyState from '../components/common/EmptyState';
import Loader from '../components/common/Loader';
import { FiSearch, FiEdit, FiTrash2, FiPlus, FiArrowUp, FiArrowDown } from 'react-icons/fi';

export const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [location, setLocation] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Filter/Search and pagination states
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('departmentId');
  const [direction, setDirection] = useState('asc');

  useEffect(() => {
    fetchDepartments();
  }, [page, sortBy, direction]);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const response = await departmentService.getAll({ 
        page, 
        size: 5, 
        sortBy, 
        direction 
      });
      if (response && response.success && response.data) {
        setDepartments(response.data.content || []);
        setTotalPages(response.data.totalPages || 1);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch departments list');
    } finally {
      setLoading(false);
    }
  };

  const handleResetForm = () => {
    setName('');
    setCode('');
    setLocation('');
    setEditingId(null);
    setError(null);
  };

  const handleEditClick = (dept) => {
    setEditingId(dept.departmentId);
    setName(dept.departmentName || '');
    setCode(dept.departmentCode || '');
    setLocation(dept.location || '');
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    // Basic frontend validations matching backend requirements
    if (!/^[A-Za-z ]+$/.test(name)) {
      setError('Department Name must contain only alphabets');
      setSubmitting(false);
      return;
    }
    if (!/^[A-Z]{2,5}$/.test(code)) {
      setError('Department Code must be 2 to 5 uppercase characters');
      setSubmitting(false);
      return;
    }

    try {
      const payload = {
        departmentName: name,
        departmentCode: code,
        location,
      };

      let response;
      if (editingId) {
        response = await departmentService.update(editingId, payload);
      } else {
        response = await departmentService.create(payload);
      }

      if (response && response.success) {
        setSuccess(editingId ? 'Department updated successfully' : 'Department created successfully');
        handleResetForm();
        fetchDepartments();
      }
    } catch (err) {
      setError(err.message || 'Failed to submit department form');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to delete department #${id}?`)) return;
    
    setError(null);
    setSuccess(null);
    try {
      const response = await departmentService.delete(id);
      if (response && response.success) {
        setSuccess('Department deleted successfully');
        fetchDepartments();
      }
    } catch (err) {
      setError(err.message || 'Failed to delete department');
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

  // Local filtering based on Search Bar (for responsive quick search)
  const filteredDepartments = departments.filter(dept => 
    dept.departmentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.departmentCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="slide-up">
      <PageHeader 
        title="Departments Management" 
        subtitle="Manage company structural divisions, codes, and operational physical sites."
        action={
          !editingId && (
            <Button onClick={() => handleResetForm()} variant="secondary">
              Clear Inputs
            </Button>
          )
        }
      />

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div style={styles.mainLayout}>
        {/* Department List Grid */}
        <div style={styles.listCol}>
          <Card hoverLift={false} style={{ width: '100%' }}>
            <div style={styles.listHeader}>
              <h2 style={styles.sectionTitle}>Registered Divisions</h2>
              
              <div style={styles.searchBox}>
                <FiSearch style={styles.searchIcon} />
                <input 
                  type="text" 
                  placeholder="Filter departments..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={styles.searchInput}
                />
              </div>
            </div>

            {loading ? (
              <Loader message="Fetching organizational departments..." />
            ) : filteredDepartments.length === 0 ? (
              <EmptyState 
                title="No Departments Found" 
                description="Create a department on the right to populate the system directory." 
              />
            ) : (
              <>
                <div className="table-wrapper">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th onClick={() => toggleSort('departmentId')} style={styles.thSortable}>
                          ID {sortBy === 'departmentId' && (direction === 'asc' ? <FiArrowUp /> : <FiArrowDown />)}
                        </th>
                        <th onClick={() => toggleSort('departmentName')} style={styles.thSortable}>
                          Name {sortBy === 'departmentName' && (direction === 'asc' ? <FiArrowUp /> : <FiArrowDown />)}
                        </th>
                        <th onClick={() => toggleSort('departmentCode')} style={styles.thSortable}>
                          Code {sortBy === 'departmentCode' && (direction === 'asc' ? <FiArrowUp /> : <FiArrowDown />)}
                        </th>
                        <th>Location</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDepartments.map((dept) => (
                        <tr key={dept.departmentId}>
                          <td style={{ fontWeight: '700' }}>#{dept.departmentId}</td>
                          <td style={{ fontWeight: '600' }}>{dept.departmentName}</td>
                          <td>
                            <span className="badge badge-role">
                              {dept.departmentCode}
                            </span>
                          </td>
                          <td>{dept.location}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <Button 
                                onClick={() => handleEditClick(dept)} 
                                variant="secondary" 
                                style={styles.actionBtn}
                                title="Edit Department"
                              >
                                <FiEdit size={13} />
                              </Button>
                              <Button 
                                onClick={() => handleDelete(dept.departmentId)} 
                                variant="secondary" 
                                style={{ ...styles.actionBtn, color: 'var(--danger)' }}
                                title="Delete Department"
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
        </div>

        {/* Create / Edit Form */}
        <div style={styles.formCol}>
          <Card hoverLift={false} style={{ width: '100%' }}>
            <h2 style={styles.sectionTitle}>
              {editingId ? `Edit Department #${editingId}` : 'Add Department'}
            </h2>
            
            <form onSubmit={handleSubmit} style={styles.form}>
              <div className="form-group">
                <label className="form-label">Department Name</label>
                <input
                  type="text"
                  placeholder="e.g. Finance, Marketing"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Department Code (Capital Letters)</label>
                <input
                  type="text"
                  placeholder="e.g. FIN, MKT"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Location / Site</label>
                <input
                  type="text"
                  placeholder="e.g. New York Headquarters"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  className="form-input"
                />
              </div>

              <div style={styles.btnRow}>
                <Button 
                  type="submit" 
                  disabled={submitting} 
                  variant="primary" 
                  style={{ flex: 1 }}
                >
                  {submitting ? 'Saving...' : 'Save'}
                </Button>
                {editingId && (
                  <Button 
                    onClick={() => handleResetForm()} 
                    variant="secondary"
                  >
                    Cancel
                  </Button>
                )}
                <Button 
                  type="button" 
                  onClick={() => {
                    setName('');
                    setCode('');
                    setLocation('');
                  }} 
                  variant="secondary"
                >
                  Reset
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

const styles = {
  mainLayout: {
    display: 'flex',
    gap: '30px',
    flexWrap: 'wrap',
  },
  listCol: {
    flex: '2 1 500px',
  },
  formCol: {
    flex: '1 1 300px',
    alignSelf: 'flex-start',
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
  btnRow: {
    display: 'flex',
    gap: '10px',
    marginTop: '16px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
};

export default Departments;
