package com.shivam.monocept.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ExpenseClaimRequestDto {

    @NotNull(message = "Employee is required")
    private Long employeeId;

    @NotNull(message = "Category is required")
    private Long categoryId;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be greater than zero")
    private BigDecimal amount;

    @NotNull(message = "Expense date is required")
    @PastOrPresent(message = "Expense date cannot be in the future")
    private LocalDate expenseDate;

    @NotBlank(message = "Description is required")
    @Size(max = 300, message = "Description cannot exceed 300 characters")
    private String description;
}
