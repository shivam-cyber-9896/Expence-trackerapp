import apiClient from './api';

export const auditLogService = {
  /**
   * Retrieves paginated list of audit logs.
   * @param {object} params - Pagination params (page, size, sortBy, direction).
   * @returns {Promise} Resolves to ApiResponseDto<PaginationResponseDto<AuditLogResponseDto>>.
   */
  getAll: (params = { page: 0, size: 10, sortBy: 'actionTime', direction: 'desc' }) => 
    apiClient.get('/audit-logs', { params }),
};

export default auditLogService;
