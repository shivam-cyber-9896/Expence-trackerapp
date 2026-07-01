package com.shivam.monocept.service;

import com.shivam.monocept.dto.request.DepartmentRequestDto;
import com.shivam.monocept.dto.response.DepartmentResponseDto;
import com.shivam.monocept.dto.response.PaginationResponseDto;

public interface DepartmentService {
    DepartmentResponseDto createDepartment(DepartmentRequestDto request);
    DepartmentResponseDto updateDepartment(Long id, DepartmentRequestDto request);
    DepartmentResponseDto getDepartmentById(Long id);
    PaginationResponseDto<DepartmentResponseDto> getAllDepartments(int page, int size, String sortBy, String direction);
    void deleteDepartment(Long id);
}
