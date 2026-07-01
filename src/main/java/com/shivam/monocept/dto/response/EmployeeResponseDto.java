package com.shivam.monocept.dto.response;

import com.shivam.monocept.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeResponseDto {
    private Long employeeId;
    private String employeeName;
    private String email;
    private String phone;
    private String designation;
    private Role role;
    private Long departmentId;
    private String departmentName;
}
