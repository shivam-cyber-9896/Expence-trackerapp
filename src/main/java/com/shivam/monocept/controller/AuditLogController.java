package com.shivam.monocept.controller;

import com.shivam.monocept.dto.response.ApiResponseDto;
import com.shivam.monocept.dto.response.AuditLogResponseDto;
import com.shivam.monocept.dto.response.PaginationResponseDto;
import com.shivam.monocept.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping
    public ResponseEntity<ApiResponseDto<PaginationResponseDto<AuditLogResponseDto>>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "actionTime") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        PaginationResponseDto<AuditLogResponseDto> response = auditLogService.getAuditLogs(page, size, sortBy, direction);
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Audit logs retrieved successfully", response));
    }
}
