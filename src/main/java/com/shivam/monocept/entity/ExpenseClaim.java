package com.shivam.monocept.entity;



import jakarta.persistence.*;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.shivam.monocept.enums.ClaimStatus;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "expense_claims")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseClaim {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long claimId;

    @NotNull(message = "Employee is required")
    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @NotNull(message = "Category is required")
    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private ExpenseCategory category;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be greater than zero")
    @Column(nullable = false)
    private BigDecimal amount;

    @NotNull(message = "Expense date is required")
    @PastOrPresent(message = "Expense date cannot be in the future")
    @Column(nullable = false)
    private LocalDate expenseDate;

    @NotBlank(message = "Description is required")
    @Size(min = 3, max = 300, message = "Description must be between 3 and 300 characters")
    @Column(nullable = false, length = 300)
    private String description;

    @NotNull(message = "Status is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ClaimStatus status = ClaimStatus.PENDING;

    @Size(max = 250, message = "Review remark cannot exceed 250 characters")
    @Column(length = 250)
    private String reviewRemark;

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}