package com.shivam.monocept.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ExpenseCategoryRequestDto {

    @NotBlank(message = "Category name is required")
    @Size(min = 2, max = 50, message = "Category name must be between 2 and 50 characters")
    @Pattern(
        regexp = "^[A-Za-z ]+$",
        message = "Invalid category"
    )
    private String categoryName;

    @Positive(message = "Maximum limit must be greater than zero")
    private BigDecimal maxLimit;

    @Size(max = 200, message = "Description cannot exceed 200 characters")
    private String description;
}
