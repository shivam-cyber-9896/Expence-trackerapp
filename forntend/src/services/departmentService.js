import apiClient from './api';

export const departmentService = {
  /**
   * Creates a new department.
   * @param {object} departmentData - The department details (DepartmentRequestDto).
   * @returns {Promise} Resolves to ApiResponseDto<DepartmentResponseDto>.
   */
  create: (departmentData) => apiClient.post('/departments', departmentData),

  /**
   * Updates an existing department.
   * @param {number|string} id - The ID of the department.
   * @param {object} departmentData - The updated details (DepartmentRequestDto).
   * @returns {Promise} Resolves to ApiResponseDto<DepartmentResponseDto>.
   */
  update: (id, departmentData) => apiClient.put(`/departments/${id}`, departmentData),

  /**
   * Retrieves a department by its ID.
   * @param {number|string} id - The ID of the department.
   * @returns {Promise} Resolves to ApiResponseDto<DepartmentResponseDto>.
   */
  getById: (id) => apiClient.get(`/departments/${id}`),

  /**
   * Retrieves all departments with pagination and sorting.
   * @param {object} params - Pagination params (page, size, sortBy, direction).
   * @returns {Promise} Resolves to ApiResponseDto<PaginationResponseDto<DepartmentResponseDto>>.
   */
  getAll: (params = { page: 0, size: 10, sortBy: 'departmentId', direction: 'asc' }) => 
    apiClient.get('/departments', { params }),

  /**
   * Deletes a department.
   * @param {number|string} id - The ID of the department.
   * @returns {Promise} Resolves to ApiResponseDto<Void>.
   */
  delete: (id) => apiClient.delete(`/departments/${id}`),
};

export default departmentService;
