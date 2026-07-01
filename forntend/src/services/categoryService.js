import apiClient from './api';

export const categoryService = {
  /**
   * Creates a new expense category.
   * @param {object} categoryData - The category details (ExpenseCategoryRequestDto).
   * @returns {Promise} Resolves to ApiResponseDto<ExpenseCategoryResponseDto>.
   */
  create: (categoryData) => apiClient.post('/categories', categoryData),

  /**
   * Updates an existing expense category.
   * @param {number|string} id - The category ID.
   * @param {object} categoryData - The updated details (ExpenseCategoryRequestDto).
   * @returns {Promise} Resolves to ApiResponseDto<ExpenseCategoryResponseDto>.
   */
  update: (id, categoryData) => apiClient.put(`/categories/${id}`, categoryData),

  /**
   * Retrieves an expense category by its ID.
   * @param {number|string} id - The category ID.
   * @returns {Promise} Resolves to ApiResponseDto<ExpenseCategoryResponseDto>.
   */
  getById: (id) => apiClient.get(`/categories/${id}`),

  /**
   * Retrieves all expense categories with pagination and sorting.
   * @param {object} params - Pagination params (page, size, sortBy, direction).
   * @returns {Promise} Resolves to ApiResponseDto<PaginationResponseDto<ExpenseCategoryResponseDto>>.
   */
  getAll: (params = { page: 0, size: 10, sortBy: 'categoryId', direction: 'asc' }) => 
    apiClient.get('/categories', { params }),

  /**
   * Deletes an expense category.
   * @param {number|string} id - The category ID.
   * @returns {Promise} Resolves to ApiResponseDto<Void>.
   */
  delete: (id) => apiClient.delete(`/categories/${id}`),
};

export default categoryService;
