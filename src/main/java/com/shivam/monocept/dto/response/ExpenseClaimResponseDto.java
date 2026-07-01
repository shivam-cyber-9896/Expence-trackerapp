package com.shivam.monocept.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import com.shivam.monocept.enums.ClaimStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseClaimResponseDto {
    private Long claimId;
    private Long employeeId;
    private String employeeName;
    private Long departmentId;
    private String departmentName;
    private Long categoryId;
    private String categoryName;
    private BigDecimal amount;
    private LocalDate expenseDate;
    private String description;
    private ClaimStatus status;
    private String reviewRemark;
}
