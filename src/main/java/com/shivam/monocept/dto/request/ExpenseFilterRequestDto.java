package com.shivam.monocept.dto.request;

import java.math.BigDecimal;
import java.time.LocalDate;
import com.shivam.monocept.enums.ClaimStatus;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ExpenseFilterRequestDto {
    private Long employeeId;
    private Long departmentId;
    private ClaimStatus status;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal minAmount;
    private BigDecimal maxAmount;
    private Integer month;
    private Integer year;
    private Long categoryId;
}
