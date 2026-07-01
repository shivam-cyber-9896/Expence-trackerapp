import apiClient from './api';

export const budgetService = {
  /**
   * Defines/Creates a new department budget.
   * @param {object} budgetData - The budget details (DepartmentBudgetRequestDto).
   * @returns {Promise} Resolves to ApiResponseDto<DepartmentBudgetResponseDto>.
   */
  create: (budgetData) => apiClient.post('/budgets', budgetData),

  /**
   * Updates an existing department budget.
   * @param {number|string} id - The budget ID.
   * @param {object} budgetData - The updated details (DepartmentBudgetRequestDto).
   * @returns {Promise} Resolves to ApiResponseDto<DepartmentBudgetResponseDto>.
   */
  update: (id, budgetData) => apiClient.put(`/budgets/${id}`, budgetData),

  /**
   * Retrieves a budget by its ID.
   * @param {number|string} id - The budget ID.
   * @returns {Promise} Resolves to ApiResponseDto<DepartmentBudgetResponseDto>.
   */
  getById: (id) => apiClient.get(`/budgets/${id}`),

  /**
   * Retrieves all budgets with pagination and sorting.
   * @param {object} params - Pagination params (page, size, sortBy, direction).
   * @returns {Promise} Resolves to ApiResponseDto<PaginationResponseDto<DepartmentBudgetResponseDto>>.
   */
  getAll: (params = { page: 0, size: 10, sortBy: 'budgetId', direction: 'asc' }) => 
    apiClient.get('/budgets', { params }),

  /**
   * Retrieves the monthly budget/expense summary for a department.
   * @param {number|string} departmentId - The department ID.
   * @param {number} month - The calendar month (1-12).
   * @param {number} year - The calendar year.
   * @returns {Promise} Resolves to ApiResponseDto<MonthlySummaryResponseDto>.
   */
  getMonthlySummary: (departmentId, month, year) => 
    apiClient.get(`/budgets/departments/${departmentId}/summary`, { params: { month, year } }),

  /**
   * Deletes a department budget.
   * @param {number|string} id - The budget ID.
   * @returns {Promise} Resolves to ApiResponseDto<Void>.
   */
  delete: (id) => apiClient.delete(`/budgets/${id}`),
};

export default budgetService;
