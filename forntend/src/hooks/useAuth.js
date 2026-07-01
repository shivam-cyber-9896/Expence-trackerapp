import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Custom hook to easily consume the Authentication Context.
 * @returns {object} The authentication state and methods (user, token, login, logout, etc).
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;
