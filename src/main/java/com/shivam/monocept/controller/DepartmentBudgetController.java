package com.shivam.monocept.controller;

import com.shivam.monocept.dto.request.DepartmentBudgetRequestDto;
import com.shivam.monocept.dto.response.ApiResponseDto;
import com.shivam.monocept.dto.response.DepartmentBudgetResponseDto;
import com.shivam.monocept.dto.response.MonthlySummaryResponseDto;
import com.shivam.monocept.dto.response.PaginationResponseDto;
import com.shivam.monocept.service.DepartmentBudgetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class DepartmentBudgetController {

    private final DepartmentBudgetService departmentBudgetService;

    @PostMapping
    public ResponseEntity<ApiResponseDto<DepartmentBudgetResponseDto>> createBudget(@Valid @RequestBody DepartmentBudgetRequestDto request) {
        DepartmentBudgetResponseDto response = departmentBudgetService.createBudget(request);
        return new ResponseEntity<>(new ApiResponseDto<>(true, "Department budget defined successfully", response), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponseDto<DepartmentBudgetResponseDto>> updateBudget(
            @PathVariable Long id,
            @Valid @RequestBody DepartmentBudgetRequestDto request) {
        DepartmentBudgetResponseDto response = departmentBudgetService.updateBudget(id, request);
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Department budget updated successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseDto<DepartmentBudgetResponseDto>> getBudgetById(@PathVariable Long id) {
        DepartmentBudgetResponseDto response = departmentBudgetService.getBudgetById(id);
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Department budget retrieved successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponseDto<PaginationResponseDto<DepartmentBudgetResponseDto>>> getAllBudgets(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "budgetId") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {
        PaginationResponseDto<DepartmentBudgetResponseDto> response = departmentBudgetService.getAllBudgets(page, size, sortBy, direction);
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Department budgets retrieved successfully", response));
    }

    @GetMapping("/departments/{departmentId}/summary")
    public ResponseEntity<ApiResponseDto<MonthlySummaryResponseDto>> getMonthlySummary(
            @PathVariable Long departmentId,
            @RequestParam int month,
            @RequestParam int year) {
        MonthlySummaryResponseDto response = departmentBudgetService.getMonthlySummary(departmentId, month, year);
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Monthly summary retrieved successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseDto<Void>> deleteBudget(@PathVariable Long id) {
        departmentBudgetService.deleteBudget(id);
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Department budget deleted successfully", null));
    }
}
