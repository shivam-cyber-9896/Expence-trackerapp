import { motion } from 'framer-motion';

export const Card = ({
  children,
  glass = false,
  hoverLift = true,
  onClick,
  style,
  className = '',
  ...props
}) => {
  const baseStyle = {
    backgroundColor: glass ? 'rgba(255, 255, 255, 0.7)' : 'var(--bg-card)',
    backdropFilter: glass ? 'blur(10px)' : 'none',
    border: '1px solid var(--border-color)',
    borderRadius: '15px', // 15px radius as requested
    padding: '24px',
    boxShadow: 'var(--shadow-md)',
    fontFamily: 'inherit',
    overflow: 'hidden',
    cursor: onClick ? 'pointer' : 'default',
    ...style,
  };

  return (
    <motion.div
      whileHover={hoverLift ? { y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.06), 0 10px 10px -5px rgba(0, 0, 0, 0.02)' } : {}}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      onClick={onClick}
      className={`card ${className}`}
      style={baseStyle}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;
