package com.shivam.monocept.entity;


import jakarta.persistence.*;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(
    name = "department_budgets",
    uniqueConstraints = {
        @UniqueConstraint(
            columnNames = { "department_id", "month", "year" }
        )
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentBudget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long budgetId;

    @NotNull(message = "Department is required")
    @ManyToOne
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @NotNull(message = "Month is required")
    @Min(value = 1, message = "Month must be between 1 and 12")
    @Max(value = 12, message = "Month must be between 1 and 12")
    @Column(nullable = false)
    private Integer month;

    @NotNull(message = "Year is required")
    @Min(value = 2024, message = "Year must be 2024 or later")
    @Max(value = 2100, message = "Year must be 2100 or earlier")
    @Column(nullable = false)
    private Integer year;

    @NotNull(message = "Monthly budget is required")
    @Positive(message = "Budget must be greater than zero")
    @Column(nullable = false)
    private BigDecimal monthlyBudget;
}