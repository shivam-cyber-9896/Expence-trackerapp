package com.shivam.monocept.service;

import com.shivam.monocept.dto.request.ExpenseCategoryRequestDto;
import com.shivam.monocept.dto.response.ExpenseCategoryResponseDto;
import com.shivam.monocept.dto.response.PaginationResponseDto;

public interface ExpenseCategoryService {
    ExpenseCategoryResponseDto createCategory(ExpenseCategoryRequestDto request);
    ExpenseCategoryResponseDto updateCategory(Long id, ExpenseCategoryRequestDto request);
    ExpenseCategoryResponseDto getCategoryById(Long id);
    PaginationResponseDto<ExpenseCategoryResponseDto> getAllCategories(int page, int size, String sortBy, String direction);
    void deleteCategory(Long id);
}
