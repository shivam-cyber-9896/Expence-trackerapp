import { createContext, useState, useEffect } from 'react';
import { authService } from '../services';
import { getUserFromToken, isTokenExpired } from '../utils/jwt';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize Auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = localStorage.getItem('accessToken');
        
        if (storedToken) {
          if (isTokenExpired(storedToken)) {
            // Token expired, perform clean up
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            setUser(null);
            setToken(null);
          } else {
            // Token valid, extract user credentials
            const storedUser = localStorage.getItem('user');
            const parsedUser = storedUser ? JSON.parse(storedUser) : getUserFromToken(storedToken);
            setUser(parsedUser);
            setToken(storedToken);
          }
        }
      } catch (error) {
        console.error('Error initializing auth state:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Log in user using credentials.
   * @param {object} credentials - { email, password }
   */
  const login = async (credentials) => {
    setLoading(true);
    try {
      const response = await authService.login(credentials);
      // Response structure: { success: true, message: '...', data: { accessToken, email, role, employeeId } }
      if (response && response.success && response.data) {
        const { accessToken, email, role, employeeId } = response.data;
        
        // Save token to localStorage
        localStorage.setItem('accessToken', accessToken);
        
        const loggedUser = {
          email,
          role,
          employeeId
        };
        
        // Save user to localStorage
        localStorage.setItem('user', JSON.stringify(loggedUser));
        
        setUser(loggedUser);
        setToken(accessToken);
        
        return response;
      }
      throw new Error(response?.message || 'Login failed');
    } catch (error) {
      console.error('Auth Context Login Error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register a new employee user.
   * @param {object} registerData - Register payload
   */
  const register = async (registerData) => {
    setLoading(true);
    try {
      const response = await authService.register(registerData);
      return response;
    } catch (error) {
      console.error('Auth Context Register Error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Log out user.
   */
  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout service failed, cleaning local storage anyway:', error);
    } finally {
      setUser(null);
      setToken(null);
      setLoading(false);
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
