package com.shivam.monocept.dto.response;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MonthlySummaryResponseDto {
    private Long departmentId;
    private String departmentName;
    private Integer month;
    private Integer year;
    private BigDecimal totalBudget;
    private BigDecimal totalApprovedClaims;
    private BigDecimal totalPendingClaims;
    private BigDecimal remainingBudget;
    private long pendingClaimsCount;
    private long approvedClaimsCount;
    private long rejectedClaimsCount;
}
