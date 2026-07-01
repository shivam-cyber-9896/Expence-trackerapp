package com.shivam.monocept.dto.response;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogResponseDto {
    private Long logId;
    private String action;
    private String performedBy;
    private LocalDateTime actionTime;
    private String entityName;
    private Long entityId;
}
