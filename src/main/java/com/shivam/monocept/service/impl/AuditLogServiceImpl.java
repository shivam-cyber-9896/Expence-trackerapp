package com.shivam.monocept.service.impl;

import com.shivam.monocept.dto.response.AuditLogResponseDto;
import com.shivam.monocept.dto.response.PaginationResponseDto;
import com.shivam.monocept.entity.AuditLog;
import com.shivam.monocept.repository.AuditLogRepository;
import com.shivam.monocept.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final ModelMapper modelMapper;

    @Override
    @Transactional
    public void log(String action, String performedBy, String entityName, Long entityId) {
        AuditLog auditLog = new AuditLog();
        auditLog.setAction(action);
        auditLog.setPerformedBy(performedBy);
        auditLog.setEntityName(entityName);
        auditLog.setEntityId(entityId);
        auditLog.setActionTime(LocalDateTime.now());
        auditLogRepository.save(auditLog);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponseDto<AuditLogResponseDto> getAuditLogs(int page, int size, String sortBy, String direction) {
        Sort sort = direction.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<AuditLog> auditLogPage = auditLogRepository.findAll(pageable);

        List<AuditLogResponseDto> content = auditLogPage.getContent().stream()
                .map(log -> modelMapper.map(log, AuditLogResponseDto.class))
                .collect(Collectors.toList());

        return new PaginationResponseDto<>(
                content,
                auditLogPage.getNumber(),
                auditLogPage.getSize(),
                auditLogPage.getTotalElements(),
                auditLogPage.getTotalPages(),
                auditLogPage.isLast()
        );
    }
}
