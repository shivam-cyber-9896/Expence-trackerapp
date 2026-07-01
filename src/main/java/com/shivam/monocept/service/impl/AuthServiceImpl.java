package com.shivam.monocept.service.impl;

import com.shivam.monocept.dto.request.ChangePasswordRequestDto;
import com.shivam.monocept.dto.request.EmployeeRequestDto;
import com.shivam.monocept.dto.request.LoginRequestDto;
import com.shivam.monocept.dto.response.EmployeeResponseDto;
import com.shivam.monocept.dto.response.LoginResponseDto;
import com.shivam.monocept.entity.Department;
import com.shivam.monocept.entity.Employee;
import com.shivam.monocept.exception.DuplicateResourceException;
import com.shivam.monocept.exception.ResourceNotFoundException;
import com.shivam.monocept.exception.DepartmentExpenseException;
import com.shivam.monocept.repository.DepartmentRepository;
import com.shivam.monocept.repository.EmployeeRepository;
import com.shivam.monocept.security.JwtTokenProvider;
import com.shivam.monocept.service.AuthService;
import com.shivam.monocept.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuditLogService auditLogService;
    private final ModelMapper modelMapper;

    @Override
    @Transactional
    public EmployeeResponseDto register(EmployeeRequestDto request) {
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
            throw new DepartmentExpenseException("Employees cannot register under the Administration department");
        }

        Employee employee = modelMapper.map(request, Employee.class);
        employee.setEmployeeId(null);
        employee.setDepartment(department);
        employee.setPassword(passwordEncoder.encode(request.getPassword()));
        employee.setRole(request.getRole());

        Employee savedEmployee = employeeRepository.save(employee);

        auditLogService.log("REGISTERED", savedEmployee.getEmail(), "Employee", savedEmployee.getEmployeeId());

        EmployeeResponseDto responseDto = modelMapper.map(savedEmployee, EmployeeResponseDto.class);
        responseDto.setDepartmentId(department.getDepartmentId());
        responseDto.setDepartmentName(department.getDepartmentName());
        return responseDto;
    }

    @Override
    @Transactional
    public LoginResponseDto login(LoginRequestDto request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        Employee employee = employeeRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with email: " + request.getEmail()));

        String token = jwtTokenProvider.generateToken(employee.getEmail(), employee.getRole().name(), employee.getEmployeeId());

        auditLogService.log("LOGGED_IN", employee.getEmail(), "Employee", employee.getEmployeeId());

        return new LoginResponseDto(token, employee.getEmail(), employee.getRole(), employee.getEmployeeId());
    }

    @Override
    @Transactional
    public void changePassword(String email, ChangePasswordRequestDto request) {
        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with email: " + email));

        if (!passwordEncoder.matches(request.getOldPassword(), employee.getPassword())) {
            throw new DepartmentExpenseException("Incorrect old password");
        }

        employee.setPassword(passwordEncoder.encode(request.getNewPassword()));
        employeeRepository.save(employee);

        auditLogService.log("PASSWORD_CHANGED", employee.getEmail(), "Employee", employee.getEmployeeId());
    }
}
