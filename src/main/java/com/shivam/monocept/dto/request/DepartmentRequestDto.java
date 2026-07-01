package com.shivam.monocept.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class DepartmentRequestDto {

    @NotBlank(message = "Department name is required")
    @Size(min = 2, max = 50, message = "Department name must be between 2 and 50 characters")
    @Pattern(
        regexp = "^[A-Za-z ]+$",
        message = "Department name should contain only alphabets"
    )
    private String departmentName;

    @NotBlank(message = "Department code is required")
    @Pattern(
        regexp = "^[A-Z]{2,5}$",
        message = "Department code must contain only uppercase letters"
    )
    private String departmentCode;

    @NotBlank(message = "Location is required")
    @Size(min = 2, max = 100, message = "Location must be between 2 and 100 characters")
    private String location;
}
