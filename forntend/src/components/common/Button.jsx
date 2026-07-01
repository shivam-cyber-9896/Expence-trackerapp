import { motion } from 'framer-motion';

export const Button = ({
  children,
  type = 'button',
  variant = 'primary', // primary, success, danger, secondary
  disabled = false,
  loading = false,
  onClick,
  style,
  className = '',
  ...props
}) => {
  const getColors = () => {
    switch (variant) {
      case 'success':
        return {
          bg: 'var(--success)',
          hover: '#15803d',
          text: '#ffffff',
        };
      case 'danger':
        return {
          bg: 'var(--danger)',
          hover: '#b91c1c',
          text: '#ffffff',
        };
      case 'secondary':
        return {
          bg: '#f1f5f9',
          hover: '#e2e8f0',
          text: '#334155',
          border: '1px solid #cbd5e1',
        };
      case 'primary':
      default:
        return {
          bg: 'var(--primary)',
          hover: 'var(--primary-hover)',
          text: '#ffffff',
        };
    }
  };

  const colors = getColors();

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`btn ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '10px 20px',
        borderRadius: '30px', // design prompt requires rounded buttons
        fontSize: '14px',
        fontWeight: '600',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled || loading ? 0.7 : 1,
        backgroundColor: colors.bg,
        color: colors.text,
        border: colors.border || 'none',
        outline: 'none',
        transition: 'all 0.2s ease',
        fontFamily: 'inherit',
        ...style,
      }}
      onMouseOver={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.backgroundColor = colors.hover;
        }
      }}
      onMouseOut={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.backgroundColor = colors.bg;
        }
      }}
      {...props}
    >
      {loading && (
        <span style={styles.spinner}></span>
      )}
      {children}
    </motion.button>
  );
};

const styles = {
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderLeftColor: '#ffffff',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'spin 0.8s linear infinite',
  },
};

export default Button;
