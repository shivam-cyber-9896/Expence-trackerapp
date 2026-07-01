package com.shivam.monocept.controller;

import com.shivam.monocept.dto.request.ExpenseClaimRequestDto;
import com.shivam.monocept.dto.request.ExpenseFilterRequestDto;
import com.shivam.monocept.dto.response.ApiResponseDto;
import com.shivam.monocept.dto.response.ExpenseClaimResponseDto;
import com.shivam.monocept.dto.response.PaginationResponseDto;
import com.shivam.monocept.service.ExpenseClaimService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/claims")
@RequiredArgsConstructor
public class ExpenseClaimController {

    private final ExpenseClaimService expenseClaimService;

    @PostMapping
    public ResponseEntity<ApiResponseDto<ExpenseClaimResponseDto>> createClaim(@Valid @RequestBody ExpenseClaimRequestDto request) {
        ExpenseClaimResponseDto response = expenseClaimService.createClaim(request);
        return new ResponseEntity<>(new ApiResponseDto<>(true, "Expense claim submitted successfully", response), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponseDto<ExpenseClaimResponseDto>> updateClaim(
            @PathVariable Long id,
            @Valid @RequestBody ExpenseClaimRequestDto request) {
        ExpenseClaimResponseDto response = expenseClaimService.updateClaim(id, request);
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Expense claim updated successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseDto<ExpenseClaimResponseDto>> getClaimById(@PathVariable Long id) {
        ExpenseClaimResponseDto response = expenseClaimService.getClaimById(id);
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Expense claim retrieved successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponseDto<PaginationResponseDto<ExpenseClaimResponseDto>>> getClaims(
            ExpenseFilterRequestDto filter,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "claimId") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        PaginationResponseDto<ExpenseClaimResponseDto> response = expenseClaimService.getClaims(filter, page, size, sortBy, direction);
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Expense claims retrieved successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseDto<Void>> deleteClaim(@PathVariable Long id) {
        expenseClaimService.deleteClaim(id);
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Expense claim deleted successfully", null));
    }
}
