package com.shivam.monocept.service;

import com.shivam.monocept.dto.request.ChangePasswordRequestDto;
import com.shivam.monocept.dto.request.EmployeeRequestDto;
import com.shivam.monocept.dto.request.LoginRequestDto;
import com.shivam.monocept.dto.response.EmployeeResponseDto;
import com.shivam.monocept.dto.response.LoginResponseDto;

public interface AuthService {
    EmployeeResponseDto register(EmployeeRequestDto request);
    LoginResponseDto login(LoginRequestDto request);
    void changePassword(String email, ChangePasswordRequestDto request);
}
