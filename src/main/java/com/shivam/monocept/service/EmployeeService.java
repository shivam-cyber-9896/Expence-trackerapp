package com.shivam.monocept.service;

import com.shivam.monocept.dto.request.EmployeeRequestDto;
import com.shivam.monocept.dto.response.EmployeeResponseDto;
import com.shivam.monocept.dto.response.PaginationResponseDto;

public interface EmployeeService {
    EmployeeResponseDto createEmployee(EmployeeRequestDto request);
    EmployeeResponseDto updateEmployee(Long id, EmployeeRequestDto request);
    EmployeeResponseDto getEmployeeById(Long id);
    PaginationResponseDto<EmployeeResponseDto> getAllEmployees(int page, int size, String sortBy, String direction);
    void deleteEmployee(Long id);
}
