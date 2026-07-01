package com.shivam.monocept.dto.response;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentBudgetResponseDto {
    private Long budgetId;
    private Long departmentId;
    private String departmentName;
    private Integer month;
    private Integer year;
    private BigDecimal monthlyBudget;
}
