package com.shivam.monocept.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Column;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "departments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long departmentId;

    @NotBlank(message = "Department name is required")
    @Size(min = 2, max = 50, message = "Department name must be between 2 and 50 characters")
    @Pattern(
        regexp = "^[A-Za-z ]+$",
        message = "Department name should contain only alphabets and spaces"
    )
    @Column(unique = true, nullable = false, length = 50)
    private String departmentName;

    @NotBlank(message = "Department code is required")
    @Pattern(
        regexp = "^[A-Z]{2,5}$",
        message = "Department code must be 2-5 uppercase letters"
    )
    @Column(unique = true, nullable = false, length = 5)
    private String departmentCode;

    @NotBlank(message = "Location is required")
    @Size(min = 2, max = 100, message = "Location must be between 2 and 100 characters")
    @Column(nullable = false, length = 100)
    private String location;
}