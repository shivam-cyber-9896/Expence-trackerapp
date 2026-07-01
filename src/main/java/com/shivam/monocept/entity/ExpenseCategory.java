package com.shivam.monocept.entity;


import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Column;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;

import java.math.BigDecimal;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "expense_categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long categoryId;

    @NotBlank(message = "Category name is required")
    @Size(min = 2, max = 50, message = "Category name must be between 2 and 50 characters")
    @Pattern(
        regexp = "^[A-Za-z ]+$",
        message = "Category should contain only letters"
    )
    @Column(unique = true, nullable = false, length = 50)
    private String categoryName;

    @Positive(message = "Maximum limit must be greater than zero")
    private BigDecimal maxLimit;

    @Size(max = 200, message = "Description cannot exceed 200 characters")
    private String description;
}