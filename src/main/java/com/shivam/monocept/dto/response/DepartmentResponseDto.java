package com.shivam.monocept.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentResponseDto {
    private Long departmentId;
    private String departmentName;
    private String departmentCode;
    private String location;
}
