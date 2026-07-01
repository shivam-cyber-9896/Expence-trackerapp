import { useState, useEffect } from 'react';
import { categoryService } from '../services';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import PageHeader from '../components/common/PageHeader';
import EmptyState from '../components/common/EmptyState';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';
import { FiPlus, FiEdit, FiTrash2, FiTag } from 'react-icons/fi';

export const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form edit states
  const [name, setName] = useState('');
  const [maxLimit, setMaxLimit] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await categoryService.getAll({ page: 0, size: 100, sortBy: 'categoryId', direction: 'asc' });
      if (response && response.success && response.data) {
        setCategories(response.data.content || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch categories list');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateForm = () => {
    setEditingId(null);
    setName('');
    setMaxLimit('');
    setDescription('');
    setIsFormOpen(true);
    setError(null);
    setSuccess(null);
  };

  const handleEditClick = (cat) => {
    setEditingId(cat.categoryId);
    setName(cat.categoryName || '');
    setMaxLimit(cat.maxLimit ? cat.maxLimit.toString() : '');
    setDescription(cat.description || '');
    setIsFormOpen(true);
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        categoryName: name,
        maxLimit: parseFloat(maxLimit),
        description,
      };

      let response;
      if (editingId) {
        response = await categoryService.update(editingId, payload);
      } else {
        response = await categoryService.create(payload);
      }

      if (response && response.success) {
        setSuccess(editingId ? 'Expense Category updated successfully' : 'Expense Category created successfully');
        setIsFormOpen(false);
        fetchCategories();
      }
    } catch (err) {
      setError(err.message || 'Failed to save expense category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to delete category #${id}?`)) return;

    setError(null);
    setSuccess(null);
    try {
      const response = await categoryService.delete(id);
      if (response && response.success) {
        setSuccess('Category removed successfully');
        fetchCategories();
      }
    } catch (err) {
      setError(err.message || 'Failed to delete category');
    }
  };

  return (
    <div className="slide-up">
      <PageHeader 
        title="Expense Categories" 
        subtitle="Define policy rules and reimbursement allowance limit values by expense classification type."
        action={
          <Button onClick={handleOpenCreateForm} variant="primary">
            <FiPlus size={16} /> Add Category
          </Button>
        }
      />

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {loading ? (
        <Loader message="Loading allowance matrices..." />
      ) : categories.length === 0 ? (
        <EmptyState 
          title="No Categories Configured" 
          description="Click 'Add Category' to populate expense classifications." 
        />
      ) : (
        /* Display Categories in Beautiful Cards */
        <div style={styles.grid}>
          {categories.map((cat) => (
            <Card key={cat.categoryId} hoverLift={true} style={styles.catCard}>
              <div style={styles.cardHeader}>
                <div style={styles.tagIcon}>
                  <FiTag size={20} />
                </div>
                <span style={styles.catId}>ID #{cat.categoryId}</span>
              </div>
              
              <h3 style={styles.catName}>{cat.categoryName}</h3>
              
              <div style={styles.limitContainer}>
                <span style={styles.limitLabel}>Reimbursement Max Limit</span>
                <span style={styles.limitValue}>${cat.maxLimit?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>

              <p style={styles.catDesc}>{cat.description || 'No description provided.'}</p>

              <div style={styles.btnGroup}>
                <Button 
                  onClick={() => handleEditClick(cat)} 
                  variant="secondary" 
                  style={{ flex: 1 }}
                >
                  <FiEdit size={13} /> Edit
                </Button>
                <Button 
                  onClick={() => handleDelete(cat.categoryId)} 
                  variant="secondary" 
                  style={{ flex: 1, color: 'var(--danger)', borderColor: 'var(--danger)' }}
                >
                  <FiTrash2 size={13} /> Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Category Creation / Edit Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingId ? `Edit Category #${editingId}` : 'Create Expense Category'}
      >
        <form onSubmit={handleSubmit} style={styles.form}>
          <div className="form-group">
            <label className="form-label">Category Name</label>
            <input
              type="text"
              placeholder="e.g. Travel, Office Supplies, Client Meals"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Maximum Reimbursement Limit ($)</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={maxLimit}
              onChange={(e) => setMaxLimit(e.target.value)}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description / Policy Details</label>
            <textarea
              placeholder="Provide policy guidelines for this category..."
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="form-textarea"
            />
          </div>

          <div style={styles.modalBtnRow}>
            <Button type="submit" disabled={submitting} variant="primary" style={{ flex: 1 }}>
              {submitting ? 'Saving...' : 'Save Category'}
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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '24px',
  },
  catCard: {
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  tagIcon: {
    backgroundColor: 'var(--primary-light)',
    color: 'var(--primary)',
    padding: '10px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  catId: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    fontWeight: '700',
  },
  catName: {
    fontSize: '18px',
    fontWeight: '800',
    color: 'var(--text-main)',
    margin: '0 0 12px 0',
  },
  limitContainer: {
    backgroundColor: 'var(--primary-light)',
    padding: '12px 16px',
    borderRadius: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginBottom: '16px',
  },
  limitLabel: {
    fontSize: '11px',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    fontWeight: '700',
    letterSpacing: '0.5px',
  },
  limitValue: {
    fontSize: '20px',
    fontWeight: '800',
    color: 'var(--primary)',
  },
  catDesc: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    lineHeight: '1.5',
    marginBottom: '20px',
    flex: 1,
  },
  btnGroup: {
    display: 'flex',
    gap: '10px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  modalBtnRow: {
    display: 'flex',
    gap: '10px',
    marginTop: '18px',
  },
};

export default Categories;
