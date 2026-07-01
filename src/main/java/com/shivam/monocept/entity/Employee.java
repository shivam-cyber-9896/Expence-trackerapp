package com.shivam.monocept.entity;


import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Column;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Email;

import com.shivam.monocept.enums.Role;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "employees")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long employeeId;

    @NotBlank(message = "Employee name is required")
    @Pattern(
        regexp = "^[A-Za-z ]{3,50}$",
        message = "Employee name should contain only alphabets and be 3-50 characters"
    )
    @Column(nullable = false, length = 50)
    private String employeeName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email")
    @Column(unique = true, nullable = false)
    private String email;

    @NotBlank(message = "Phone number is required")
    @Pattern(
        regexp = "^[6-9][0-9]{9}$",
        message = "Enter valid Indian mobile number"
    )
    @Column(unique = true, nullable = false, length = 10)
    private String phone;

    @NotBlank(message = "Designation is required")
    @Size(min = 2, max = 50, message = "Designation must be between 2 and 50 characters")
    @Column(nullable = false, length = 50)
    private String designation;

    @NotBlank(message = "Password is required")
    @Column(nullable = false, length = 100)
    private String password;

    @NotNull(message = "Role is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @NotNull(message = "Department is required")
    @ManyToOne
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;
}