import apiClient from './api';

export const claimService = {
  /**
   * Submits a new expense claim.
   * @param {object} claimData - The claim details (ExpenseClaimRequestDto).
   * @returns {Promise} Resolves to ApiResponseDto<ExpenseClaimResponseDto>.
   */
  create: (claimData) => apiClient.post('/claims', claimData),

  /**
   * Updates an existing expense claim.
   * @param {number|string} id - The claim ID.
   * @param {object} claimData - The updated details (ExpenseClaimRequestDto).
   * @returns {Promise} Resolves to ApiResponseDto<ExpenseClaimResponseDto>.
   */
  update: (id, claimData) => apiClient.put(`/claims/${id}`, claimData),

  /**
   * Retrieves an expense claim by its ID.
   * @param {number|string} id - The claim ID.
   * @returns {Promise} Resolves to ApiResponseDto<ExpenseClaimResponseDto>.
   */
  getById: (id) => apiClient.get(`/claims/${id}`),

  /**
   * Retrieves claims list with optional filters and sorting parameters.
   * Parameters are mapped to ExpenseFilterRequestDto on the backend.
   * @param {object} params - Filter and pagination criteria (e.g. employeeId, status, departmentId, page, size, sortBy, direction).
   * @returns {Promise} Resolves to ApiResponseDto<PaginationResponseDto<ExpenseClaimResponseDto>>.
   */
  getAll: (params = { page: 0, size: 10, sortBy: 'claimId', direction: 'desc' }) => 
    apiClient.get('/claims', { params }),

  /**
   * Deletes an expense claim.
   * @param {number|string} id - The claim ID.
   * @returns {Promise} Resolves to ApiResponseDto<Void>.
   */
  delete: (id) => apiClient.delete(`/claims/${id}`),
};

export default claimService;
