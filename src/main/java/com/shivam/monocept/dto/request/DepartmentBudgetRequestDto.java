package com.shivam.monocept.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class DepartmentBudgetRequestDto {

    @NotNull(message = "Department is required")
    private Long departmentId;

    @NotNull(message = "Month is required")
    @Min(value = 1, message = "Month must be between 1 and 12")
    @Max(value = 12, message = "Month must be between 1 and 12")
    private Integer month;

    @NotNull(message = "Year is required")
    @Min(value = 2024, message = "Year must be 2024 or later")
    @Max(value = 2100, message = "Year must be 2100 or earlier")
    private Integer year;

    @NotNull(message = "Monthly budget is required")
    @Positive(message = "Budget must be greater than zero")
    private BigDecimal monthlyBudget;
}
