package com.shivam.monocept.dto.response;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseCategoryResponseDto {
    private Long categoryId;
    private String categoryName;
    private BigDecimal maxLimit;
    private String description;
}
