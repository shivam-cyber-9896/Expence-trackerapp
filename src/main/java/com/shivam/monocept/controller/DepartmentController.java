package com.shivam.monocept.controller;

import com.shivam.monocept.dto.request.DepartmentRequestDto;
import com.shivam.monocept.dto.response.ApiResponseDto;
import com.shivam.monocept.dto.response.DepartmentResponseDto;
import com.shivam.monocept.dto.response.PaginationResponseDto;
import com.shivam.monocept.service.DepartmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentService departmentService;

    @PostMapping
    public ResponseEntity<ApiResponseDto<DepartmentResponseDto>> createDepartment(@Valid @RequestBody DepartmentRequestDto request) {
        DepartmentResponseDto response = departmentService.createDepartment(request);
        return new ResponseEntity<>(new ApiResponseDto<>(true, "Department created successfully", response), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponseDto<DepartmentResponseDto>> updateDepartment(
            @PathVariable Long id,
            @Valid @RequestBody DepartmentRequestDto request) {
        DepartmentResponseDto response = departmentService.updateDepartment(id, request);
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Department updated successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseDto<DepartmentResponseDto>> getDepartmentById(@PathVariable Long id) {
        DepartmentResponseDto response = departmentService.getDepartmentById(id);
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Department retrieved successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponseDto<PaginationResponseDto<DepartmentResponseDto>>> getAllDepartments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "departmentId") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {
        PaginationResponseDto<DepartmentResponseDto> response = departmentService.getAllDepartments(page, size, sortBy, direction);
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Departments retrieved successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseDto<Void>> deleteDepartment(@PathVariable Long id) {
        departmentService.deleteDepartment(id);
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Department deleted successfully", null));
    }
}
