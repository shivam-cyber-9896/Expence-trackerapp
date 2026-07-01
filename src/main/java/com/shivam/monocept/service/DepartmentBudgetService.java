package com.shivam.monocept.service;

import com.shivam.monocept.dto.request.DepartmentBudgetRequestDto;
import com.shivam.monocept.dto.response.DepartmentBudgetResponseDto;
import com.shivam.monocept.dto.response.MonthlySummaryResponseDto;
import com.shivam.monocept.dto.response.PaginationResponseDto;

public interface DepartmentBudgetService {
    DepartmentBudgetResponseDto createBudget(DepartmentBudgetRequestDto request);
    DepartmentBudgetResponseDto updateBudget(Long id, DepartmentBudgetRequestDto request);
    DepartmentBudgetResponseDto getBudgetById(Long id);
    PaginationResponseDto<DepartmentBudgetResponseDto> getAllBudgets(int page, int size, String sortBy, String direction);
    MonthlySummaryResponseDto getMonthlySummary(Long departmentId, int month, int year);
    void deleteBudget(Long id);
}
