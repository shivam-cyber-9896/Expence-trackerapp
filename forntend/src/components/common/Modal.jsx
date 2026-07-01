import { motion, AnimatePresence } from 'framer-motion';

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md', // sm, md, lg
}) => {
  const getWidth = () => {
    switch (size) {
      case 'sm':
        return '400px';
      case 'lg':
        return '800px';
      case 'md':
      default:
        return '540px';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={styles.overlay}>
          {/* Backdrop blur click wrapper */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={styles.backdrop}
          />
          
          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: 'spring', duration: 0.3 }}
            style={{
              ...styles.dialog,
              maxWidth: getWidth(),
            }}
          >
            {/* Header */}
            <div style={styles.header}>
              <h3 style={styles.title}>{title}</h3>
              <button onClick={onClose} style={styles.closeBtn}>
                ✕
              </button>
            </div>
            
            {/* Body */}
            <div style={styles.body}>{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    backdropFilter: 'blur(4px)',
  },
  dialog: {
    position: 'relative',
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: '15px', // matching design radius
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    zIndex: 1001,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    border: '1px solid #e2e8f0',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '18px 24px',
    borderBottom: '1px solid #e2e8f0',
  },
  title: {
    fontSize: '17px',
    fontWeight: '700',
    color: 'var(--text-main)',
    margin: 0,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    color: 'var(--text-muted)',
    transition: 'color 0.2s',
  },
  body: {
    padding: '24px',
    overflowY: 'auto',
    maxHeight: 'calc(100vh - 120px)',
  },
};

export default Modal;
