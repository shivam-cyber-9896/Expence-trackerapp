import { useState } from 'react';
import useAuth from '../hooks/useAuth';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import PageHeader from '../components/common/PageHeader';
import Modal from '../components/common/Modal';
import Swal from 'sweetalert2';
import { authService } from '../services';

export const Settings = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleOpenModal = () => {
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await authService.changePassword({
        oldPassword,
        newPassword
      });

      if (response && response.success) {
        setIsModalOpen(false);
        Swal.fire({
          title: 'Success!',
          text: 'Your password was successfully updated.',
          icon: 'success',
          confirmButtonColor: 'var(--primary)',
          borderRadius: '15px'
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to update password. Verify current password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="slide-up" style={{ color: 'var(--text-main)' }}>
      <PageHeader 
        title="Settings & System Configurations" 
        subtitle="Manage user configurations, system roles, and app settings."
      />

      <div style={styles.grid}>
        <Card hoverLift={false} style={styles.card}>
          <h3 style={styles.sectionTitle}>User Account</h3>
          
          <div style={styles.infoGroup}>
            <div style={styles.infoRow}>
              <span>Email Address:</span>
              <strong>{user?.email}</strong>
            </div>
            <div style={styles.infoRow}>
              <span>System Role:</span>
              <span className="badge badge-role">{user?.role}</span>
            </div>
            <div style={styles.infoRow}>
              <span>Associated Employee ID:</span>
              <strong>#{user?.employeeId || 'N/A'}</strong>
            </div>
          </div>
        </Card>

        <Card hoverLift={false} style={styles.card}>
          <h3 style={styles.sectionTitle}>Security Settings</h3>
          <p style={styles.text}>Authentication token is active. Session is secured using JWT with HMAC-SHA512.</p>
          <Button variant="secondary" onClick={handleOpenModal}>
            Update Password
          </Button>
        </Card>
      </div>

      {/* Password Update Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Update Account Password"
      >
        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div className="alert alert-danger" style={{ fontSize: '13px', padding: '10px' }}>{error}</div>}
          
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input
              type="password"
              placeholder="••••••"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">New Password</label>
            <input
              type="password"
              placeholder="Min 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <input
              type="password"
              placeholder="Repeat new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="form-input"
            />
          </div>

          <div style={styles.modalBtnRow}>
            <Button type="submit" disabled={submitting} variant="primary" style={{ flex: 1 }}>
              {submitting ? 'Updating...' : 'Save Password'}
            </Button>
            <Button onClick={() => setIsModalOpen(false)} variant="secondary">
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
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    maxWidth: '600px',
  },
  card: {
    backgroundColor: '#ffffff',
    textAlign: 'left',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '800',
    color: 'var(--text-main)',
    margin: '0 0 16px 0',
  },
  infoGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '8px',
  },
  text: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    lineHeight: '1.5',
    marginBottom: '16px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    textAlign: 'left',
  },
  modalBtnRow: {
    display: 'flex',
    gap: '10px',
    marginTop: '18px',
  },
};

export default Settings;
