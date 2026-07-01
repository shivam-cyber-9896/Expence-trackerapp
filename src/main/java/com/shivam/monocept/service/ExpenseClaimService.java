package com.shivam.monocept.service;

import com.shivam.monocept.dto.request.ExpenseClaimRequestDto;
import com.shivam.monocept.dto.request.ExpenseFilterRequestDto;
import com.shivam.monocept.dto.response.ExpenseClaimResponseDto;
import com.shivam.monocept.dto.response.PaginationResponseDto;

public interface ExpenseClaimService {
    ExpenseClaimResponseDto createClaim(ExpenseClaimRequestDto request);
    ExpenseClaimResponseDto updateClaim(Long id, ExpenseClaimRequestDto request);
    ExpenseClaimResponseDto getClaimById(Long id);
    PaginationResponseDto<ExpenseClaimResponseDto> getClaims(ExpenseFilterRequestDto filter, int page, int size, String sortBy, String direction);
    void deleteClaim(Long id);
}
