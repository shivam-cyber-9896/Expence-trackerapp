import apiClient from './api';

export const employeeService = {
  /**
   * Creates a new employee profile.
   * @param {object} employeeData - The employee details (EmployeeRequestDto).
   * @returns {Promise} Resolves to ApiResponseDto<EmployeeResponseDto>.
   */
  create: (employeeData) => apiClient.post('/employees', employeeData),

  /**
   * Updates an existing employee profile.
   * @param {number|string} id - The employee ID.
   * @param {object} employeeData - The updated details (EmployeeRequestDto).
   * @returns {Promise} Resolves to ApiResponseDto<EmployeeResponseDto>.
   */
  update: (id, employeeData) => apiClient.put(`/employees/${id}`, employeeData),

  /**
   * Retrieves an employee profile by its ID.
   * @param {number|string} id - The employee ID.
   * @returns {Promise} Resolves to ApiResponseDto<EmployeeResponseDto>.
   */
  getById: (id) => apiClient.get(`/employees/${id}`),

  /**
   * Retrieves all employee profiles with pagination and sorting.
   * @param {object} params - Pagination params (page, size, sortBy, direction).
   * @returns {Promise} Resolves to ApiResponseDto<PaginationResponseDto<EmployeeResponseDto>>.
   */
  getAll: (params = { page: 0, size: 10, sortBy: 'employeeId', direction: 'asc' }) => 
    apiClient.get('/employees', { params }),

  /**
   * Deletes an employee profile.
   * @param {number|string} id - The employee ID.
   * @returns {Promise} Resolves to ApiResponseDto<Void>.
   */
  delete: (id) => apiClient.delete(`/employees/${id}`),
};

export default employeeService;
