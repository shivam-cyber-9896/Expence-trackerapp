package com.shivam.monocept.service;

import com.shivam.monocept.dto.response.AuditLogResponseDto;
import com.shivam.monocept.dto.response.PaginationResponseDto;

public interface AuditLogService {
    void log(String action, String performedBy, String entityName, Long entityId);
    PaginationResponseDto<AuditLogResponseDto> getAuditLogs(int page, int size, String sortBy, String direction);
}
