package com.shivam.monocept.controller;

import com.shivam.monocept.dto.request.EmployeeRequestDto;
import com.shivam.monocept.dto.response.ApiResponseDto;
import com.shivam.monocept.dto.response.EmployeeResponseDto;
import com.shivam.monocept.dto.response.PaginationResponseDto;
import com.shivam.monocept.service.EmployeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;

    @PostMapping
    public ResponseEntity<ApiResponseDto<EmployeeResponseDto>> createEmployee(@Valid @RequestBody EmployeeRequestDto request) {
        EmployeeResponseDto response = employeeService.createEmployee(request);
        return new ResponseEntity<>(new ApiResponseDto<>(true, "Employee created successfully", response), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponseDto<EmployeeResponseDto>> updateEmployee(
            @PathVariable Long id,
            @Valid @RequestBody EmployeeRequestDto request) {
        EmployeeResponseDto response = employeeService.updateEmployee(id, request);
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Employee updated successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseDto<EmployeeResponseDto>> getEmployeeById(@PathVariable Long id) {
        EmployeeResponseDto response = employeeService.getEmployeeById(id);
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Employee retrieved successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponseDto<PaginationResponseDto<EmployeeResponseDto>>> getAllEmployees(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "employeeId") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {
        PaginationResponseDto<EmployeeResponseDto> response = employeeService.getAllEmployees(page, size, sortBy, direction);
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Employees retrieved successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseDto<Void>> deleteEmployee(@PathVariable Long id) {
        employeeService.deleteEmployee(id);
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Employee deleted successfully", null));
    }
}
