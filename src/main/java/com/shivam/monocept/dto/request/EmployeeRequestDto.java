package com.shivam.monocept.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Email;
import com.shivam.monocept.enums.Role;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
public class EmployeeRequestDto {

    @NotBlank(message = "Employee name is required")
    @Pattern(regexp = "^[A-Za-z ]{3,50}$", message = "Employee name is invalid")
    private String employeeName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[6-9][0-9]{9}$", message = "Invalid mobile number")
    private String phone;

    @NotBlank(message = "Designation is required")
    @Size(min = 2, max = 50, message = "Designation must be between 2 and 50 characters")
    private String designation;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotNull(message = "Role is required")
    private Role role;

    @NotNull(message = "Department is required")
    private Long departmentId;
}
