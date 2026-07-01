package com.shivam.monocept.controller;

import com.shivam.monocept.dto.request.ChangePasswordRequestDto;
import com.shivam.monocept.dto.request.EmployeeRequestDto;
import com.shivam.monocept.dto.request.LoginRequestDto;
import com.shivam.monocept.dto.response.ApiResponseDto;
import com.shivam.monocept.dto.response.EmployeeResponseDto;
import com.shivam.monocept.dto.response.LoginResponseDto;
import com.shivam.monocept.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponseDto<EmployeeResponseDto>> register(@Valid @RequestBody EmployeeRequestDto request) {
        EmployeeResponseDto response = authService.register(request);
        return new ResponseEntity<>(new ApiResponseDto<>(true, "Employee registered successfully", response), HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponseDto<LoginResponseDto>> login(@Valid @RequestBody LoginRequestDto request) {
        LoginResponseDto response = authService.login(request);
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Login successful", response));
    }

    @PutMapping("/change-password")
    public ResponseEntity<ApiResponseDto<Void>> changePassword(
            @Valid @RequestBody ChangePasswordRequestDto request,
            Principal principal) {
        authService.changePassword(principal.getName(), request);
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Password updated successfully", null));
    }
}
