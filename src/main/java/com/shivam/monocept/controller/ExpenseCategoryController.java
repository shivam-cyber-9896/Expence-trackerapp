package com.shivam.monocept.controller;

import com.shivam.monocept.dto.request.ExpenseCategoryRequestDto;
import com.shivam.monocept.dto.response.ApiResponseDto;
import com.shivam.monocept.dto.response.ExpenseCategoryResponseDto;
import com.shivam.monocept.dto.response.PaginationResponseDto;
import com.shivam.monocept.service.ExpenseCategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class ExpenseCategoryController {

    private final ExpenseCategoryService expenseCategoryService;

    @PostMapping
    public ResponseEntity<ApiResponseDto<ExpenseCategoryResponseDto>> createCategory(@Valid @RequestBody ExpenseCategoryRequestDto request) {
        ExpenseCategoryResponseDto response = expenseCategoryService.createCategory(request);
        return new ResponseEntity<>(new ApiResponseDto<>(true, "Expense Category created successfully", response), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponseDto<ExpenseCategoryResponseDto>> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody ExpenseCategoryRequestDto request) {
        ExpenseCategoryResponseDto response = expenseCategoryService.updateCategory(id, request);
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Expense Category updated successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseDto<ExpenseCategoryResponseDto>> getCategoryById(@PathVariable Long id) {
        ExpenseCategoryResponseDto response = expenseCategoryService.getCategoryById(id);
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Expense Category retrieved successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponseDto<PaginationResponseDto<ExpenseCategoryResponseDto>>> getAllCategories(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "categoryId") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {
        PaginationResponseDto<ExpenseCategoryResponseDto> response = expenseCategoryService.getAllCategories(page, size, sortBy, direction);
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Expense Categories retrieved successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseDto<Void>> deleteCategory(@PathVariable Long id) {
        expenseCategoryService.deleteCategory(id);
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Expense Category deleted successfully", null));
    }
}
