import apiClient from './api';

export const authService = {
  /**
   * Registers a new employee.
   * @param {object} registerData - The registration payload (EmployeeRequestDto).
   * @returns {Promise} Resolves to ApiResponseDto<EmployeeResponseDto>.
   */
  register: (registerData) => apiClient.post('/auth/register', registerData),

  /**
   * Logs in an employee.
   * @param {object} loginData - The login credentials (LoginRequestDto).
   * @returns {Promise} Resolves to ApiResponseDto<LoginResponseDto>.
   */
  login: (loginData) => apiClient.post('/auth/login', loginData),

  /**
   * Logs out the current user by clearing localStorage credentials.
   * @returns {Promise} Resolves with success.
   */
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    return Promise.resolve({ success: true, message: 'Logged out successfully' });
  },

  /**
   * Updates/changes user password.
   * @param {object} payload - { oldPassword, newPassword }
   * @returns {Promise} Resolves to ApiResponseDto<Void>.
   */
  changePassword: (payload) => apiClient.put('/auth/change-password', payload),
};

export default authService;
