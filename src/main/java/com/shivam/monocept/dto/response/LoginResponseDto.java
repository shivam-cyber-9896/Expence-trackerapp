package com.shivam.monocept.dto.response;

import com.shivam.monocept.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponseDto {
    private String accessToken;
    private String tokenType = "Bearer";
    private String email;
    private Role role;
    private Long employeeId;

    public LoginResponseDto(String accessToken, String email, Role role, Long employeeId) {
        this.accessToken = accessToken;
        this.email = email;
        this.role = role;
        this.employeeId = employeeId;
        this.tokenType = "Bearer";
    }
}
