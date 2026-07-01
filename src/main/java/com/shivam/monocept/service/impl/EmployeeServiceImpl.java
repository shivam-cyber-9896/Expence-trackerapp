package com.shivam.monocept.service.impl;

import com.shivam.monocept.dto.request.EmployeeRequestDto;
import com.shivam.monocept.dto.response.EmployeeResponseDto;
import com.shivam.monocept.dto.response.PaginationResponseDto;
import com.shivam.monocept.entity.Department;
import com.shivam.monocept.entity.Employee;
import com.shivam.monocept.exception.DepartmentExpenseException;
import com.shivam.monocept.exception.DuplicateResourceException;
import com.shivam.monocept.exception.ResourceNotFoundException;
import com.shivam.monocept.repository.DepartmentRepository;
import com.shivam.monocept.repository.EmployeeRepository;
import com.shivam.monocept.repository.ExpenseClaimRepository;
import com.shivam.monocept.service.AuditLogService;
import com.shivam.monocept.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final ExpenseClaimRepository expenseClaimRepository;
    private final AuditLogService auditLogService;
    private final ModelMapper modelMapper;

    @Override
    @Transactional
    public EmployeeResponseDto createEmployee(EmployeeRequestDto request) {
        if (employeeRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Employee with email " + request.getEmail() + " already exists");
        }
        if (employeeRepository.existsByPhone(request.getPhone())) {
            throw new DuplicateResourceException("Employee with phone " + request.getPhone() + " already exists");
        }

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + request.getDepartmentId()));

        if (department.getDepartmentCode().equalsIgnoreCase("ADMIN") || 
            department.getDepartmentName().equalsIgnoreCase("ADMINISTRATION")) {
            throw new DepartmentExpenseException("Employees cannot be added to the Administration department");
        }

        Employee employee = modelMapper.map(request, Employee.class);
        employee.setEmployeeId(null);
        employee.setDepartment(department);
        Employee savedEmployee = employeeRepository.save(employee);

        auditLogService.log("CREATED", "SYSTEM", "Employee", savedEmployee.getEmployeeId());

        EmployeeResponseDto responseDto = modelMapper.map(savedEmployee, EmployeeResponseDto.class);
        responseDto.setDepartmentId(department.getDepartmentId());
        responseDto.setDepartmentName(department.getDepartmentName());
        return responseDto;
    }

    @Override
    @Transactional
    public EmployeeResponseDto updateEmployee(Long id, EmployeeRequestDto request) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));

        if (!employee.getEmail().equalsIgnoreCase(request.getEmail()) && employeeRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Employee with email " + request.getEmail() + " already exists");
        }
        if (!employee.getPhone().equals(request.getPhone()) && employeeRepository.existsByPhone(request.getPhone())) {
            throw new DuplicateResourceException("Employee with phone " + request.getPhone() + " already exists");
        }

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + request.getDepartmentId()));

        if (department.getDepartmentCode().equalsIgnoreCase("ADMIN") || 
            department.getDepartmentName().equalsIgnoreCase("ADMINISTRATION")) {
            throw new DepartmentExpenseException("Employees cannot be assigned to the Administration department");
        }

        employee.setEmployeeName(request.getEmployeeName());
        employee.setEmail(request.getEmail());
        employee.setPhone(request.getPhone());
        employee.setDesignation(request.getDesignation());
        employee.setDepartment(department);

        Employee updatedEmployee = employeeRepository.save(employee);

        auditLogService.log("UPDATED", "SYSTEM", "Employee", updatedEmployee.getEmployeeId());

        EmployeeResponseDto responseDto = modelMapper.map(updatedEmployee, EmployeeResponseDto.class);
        responseDto.setDepartmentId(department.getDepartmentId());
        responseDto.setDepartmentName(department.getDepartmentName());
        return responseDto;
    }

    @Override
    @Transactional(readOnly = true)
    public EmployeeResponseDto getEmployeeById(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
        EmployeeResponseDto responseDto = modelMapper.map(employee, EmployeeResponseDto.class);
        responseDto.setDepartmentId(employee.getDepartment().getDepartmentId());
        responseDto.setDepartmentName(employee.getDepartment().getDepartmentName());
        return responseDto;
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponseDto<EmployeeResponseDto> getAllEmployees(int page, int size, String sortBy, String direction) {
        Sort sort = direction.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Employee> employeePage = employeeRepository.findAll(pageable);

        List<EmployeeResponseDto> content = employeePage.getContent().stream()
                .map(emp -> {
                    EmployeeResponseDto dto = modelMapper.map(emp, EmployeeResponseDto.class);
                    dto.setDepartmentId(emp.getDepartment().getDepartmentId());
                    dto.setDepartmentName(emp.getDepartment().getDepartmentName());
                    return dto;
                })
                .collect(Collectors.toList());

        return new PaginationResponseDto<>(
                content,
                employeePage.getNumber(),
                employeePage.getSize(),
                employeePage.getTotalElements(),
                employeePage.getTotalPages(),
                employeePage.isLast()
        );
    }

    @Override
    @Transactional
    public void deleteEmployee(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));

        if (expenseClaimRepository.existsByEmployeeEmployeeId(id)) {
            throw new DepartmentExpenseException("Cannot delete employee: they have active expense claims associated with them.");
        }

        employeeRepository.delete(employee);
        auditLogService.log("DELETED", "SYSTEM", "Employee", id);
    }
}
