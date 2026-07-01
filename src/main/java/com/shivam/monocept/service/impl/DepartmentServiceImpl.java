package com.shivam.monocept.service.impl;

import com.shivam.monocept.dto.request.DepartmentRequestDto;
import com.shivam.monocept.dto.response.DepartmentResponseDto;
import com.shivam.monocept.dto.response.PaginationResponseDto;
import com.shivam.monocept.entity.Department;
import com.shivam.monocept.exception.DepartmentExpenseException;
import com.shivam.monocept.exception.DuplicateResourceException;
import com.shivam.monocept.exception.ResourceNotFoundException;
import com.shivam.monocept.repository.DepartmentBudgetRepository;
import com.shivam.monocept.repository.DepartmentRepository;
import com.shivam.monocept.repository.EmployeeRepository;
import com.shivam.monocept.service.AuditLogService;
import com.shivam.monocept.service.DepartmentService;
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
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;
    private final DepartmentBudgetRepository departmentBudgetRepository;
    private final AuditLogService auditLogService;
    private final ModelMapper modelMapper;

    @Override
    @Transactional
    public DepartmentResponseDto createDepartment(DepartmentRequestDto request) {
        if (departmentRepository.existsByDepartmentName(request.getDepartmentName())) {
            throw new DuplicateResourceException("Department with name " + request.getDepartmentName() + " already exists");
        }
        if (departmentRepository.existsByDepartmentCode(request.getDepartmentCode())) {
            throw new DuplicateResourceException("Department with code " + request.getDepartmentCode() + " already exists");
        }

        Department department = modelMapper.map(request, Department.class);
        Department savedDepartment = departmentRepository.save(department);

        auditLogService.log("CREATED", "SYSTEM", "Department", savedDepartment.getDepartmentId());

        return modelMapper.map(savedDepartment, DepartmentResponseDto.class);
    }

    @Override
    @Transactional
    public DepartmentResponseDto updateDepartment(Long id, DepartmentRequestDto request) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));

        if (!department.getDepartmentName().equalsIgnoreCase(request.getDepartmentName()) &&
                departmentRepository.existsByDepartmentName(request.getDepartmentName())) {
            throw new DuplicateResourceException("Department with name " + request.getDepartmentName() + " already exists");
        }
        if (!department.getDepartmentCode().equalsIgnoreCase(request.getDepartmentCode()) &&
                departmentRepository.existsByDepartmentCode(request.getDepartmentCode())) {
            throw new DuplicateResourceException("Department with code " + request.getDepartmentCode() + " already exists");
        }

        department.setDepartmentName(request.getDepartmentName());
        department.setDepartmentCode(request.getDepartmentCode());
        department.setLocation(request.getLocation());

        Department updatedDepartment = departmentRepository.save(department);

        auditLogService.log("UPDATED", "SYSTEM", "Department", updatedDepartment.getDepartmentId());

        return modelMapper.map(updatedDepartment, DepartmentResponseDto.class);
    }

    @Override
    @Transactional(readOnly = true)
    public DepartmentResponseDto getDepartmentById(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));
        return modelMapper.map(department, DepartmentResponseDto.class);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponseDto<DepartmentResponseDto> getAllDepartments(int page, int size, String sortBy, String direction) {
        Sort sort = direction.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Department> departmentPage = departmentRepository.findAll(pageable);

        List<DepartmentResponseDto> content = departmentPage.getContent().stream()
                .map(dept -> modelMapper.map(dept, DepartmentResponseDto.class))
                .collect(Collectors.toList());

        return new PaginationResponseDto<>(
                content,
                departmentPage.getNumber(),
                departmentPage.getSize(),
                departmentPage.getTotalElements(),
                departmentPage.getTotalPages(),
                departmentPage.isLast()
        );
    }

    @Override
    @Transactional
    public void deleteDepartment(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));

        if (employeeRepository.existsByDepartmentDepartmentId(id)) {
            throw new DepartmentExpenseException("Cannot delete department: it has active employees registered under it.");
        }
        if (departmentBudgetRepository.existsByDepartmentDepartmentId(id)) {
            throw new DepartmentExpenseException("Cannot delete department: it has monthly budgets defined.");
        }

        departmentRepository.delete(department);
        auditLogService.log("DELETED", "SYSTEM", "Department", id);
    }
}
