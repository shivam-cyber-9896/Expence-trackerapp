package com.shivam.monocept.service.impl;

import com.shivam.monocept.dto.request.ExpenseClaimRequestDto;
import com.shivam.monocept.dto.request.ExpenseFilterRequestDto;
import com.shivam.monocept.dto.response.ExpenseClaimResponseDto;
import com.shivam.monocept.dto.response.PaginationResponseDto;
import com.shivam.monocept.entity.Department;
import com.shivam.monocept.entity.DepartmentBudget;
import com.shivam.monocept.entity.Employee;
import com.shivam.monocept.entity.ExpenseCategory;
import com.shivam.monocept.entity.ExpenseClaim;
import com.shivam.monocept.enums.ClaimStatus;
import com.shivam.monocept.exception.BudgetExceededException;
import com.shivam.monocept.exception.DepartmentExpenseException;
import com.shivam.monocept.exception.ResourceNotFoundException;
import com.shivam.monocept.repository.DepartmentBudgetRepository;
import com.shivam.monocept.repository.EmployeeRepository;
import com.shivam.monocept.repository.ExpenseCategoryRepository;
import com.shivam.monocept.repository.ExpenseClaimRepository;
import com.shivam.monocept.service.AuditLogService;
import com.shivam.monocept.service.ExpenseClaimService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import com.shivam.monocept.enums.Role;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExpenseClaimServiceImpl implements ExpenseClaimService {

    private final ExpenseClaimRepository expenseClaimRepository;
    private final EmployeeRepository employeeRepository;
    private final ExpenseCategoryRepository expenseCategoryRepository;
    private final DepartmentBudgetRepository departmentBudgetRepository;
    private final AuditLogService auditLogService;
    private final ModelMapper modelMapper;

    @Override
    @Transactional
    public ExpenseClaimResponseDto createClaim(ExpenseClaimRequestDto request) {
        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + request.getEmployeeId()));

        ExpenseCategory category = expenseCategoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Expense Category not found with id: " + request.getCategoryId()));

        // Category Limit check
        if (category.getMaxLimit() != null && request.getAmount().compareTo(category.getMaxLimit()) > 0) {
            throw new DepartmentExpenseException("Claim amount " + request.getAmount() +
                    " exceeds category maximum limit of " + category.getMaxLimit());
        }

        // Budget check
        Department department = employee.getDepartment();
        int month = request.getExpenseDate().getMonthValue();
        int year = request.getExpenseDate().getYear();

        DepartmentBudget budget = departmentBudgetRepository.findByDepartmentDepartmentIdAndMonthAndYear(
                department.getDepartmentId(), month, year)
                .orElseThrow(() -> new ResourceNotFoundException("No budget defined for department " +
                        department.getDepartmentName() + " in " + month + "/" + year));

        BigDecimal approvedSum = expenseClaimRepository.sumAmountByDepartmentAndMonthAndYearAndStatus(
                department.getDepartmentId(), month, year, ClaimStatus.APPROVED);

        BigDecimal remainingBudget = budget.getMonthlyBudget().subtract(approvedSum);
        if (request.getAmount().compareTo(remainingBudget) > 0) {
            throw new BudgetExceededException("Claim amount " + request.getAmount() +
                    " exceeds remaining department budget of " + remainingBudget +
                    " for " + month + "/" + year);
        }

        ExpenseClaim claim = modelMapper.map(request, ExpenseClaim.class);
        claim.setEmployee(employee);
        claim.setCategory(category);
        claim.setStatus(ClaimStatus.PENDING);

        ExpenseClaim savedClaim = expenseClaimRepository.save(claim);

        auditLogService.log("CREATED", employee.getEmail(), "ExpenseClaim", savedClaim.getClaimId());

        return mapToResponseDto(savedClaim);
    }

    @Override
    @Transactional
    public ExpenseClaimResponseDto updateClaim(Long id, ExpenseClaimRequestDto request) {
        ExpenseClaim claim = expenseClaimRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense Claim not found with id: " + id));

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() &&
                !(authentication instanceof AnonymousAuthenticationToken)) {
            String loggedInEmail = authentication.getName();
            Employee loggedInEmployee = employeeRepository.findByEmail(loggedInEmail)
                    .orElseThrow(() -> new ResourceNotFoundException("Logged-in employee not found"));
            if (loggedInEmployee.getRole() == Role.ROLE_EMPLOYEE &&
                    !claim.getEmployee().getEmployeeId().equals(loggedInEmployee.getEmployeeId())) {
                throw new DepartmentExpenseException("Access Denied: You cannot modify claims belonging to another employee");
            }
        }

        if (claim.getStatus() != ClaimStatus.PENDING) {
            throw new DepartmentExpenseException("Only PENDING claims can be updated");
        }

        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + request.getEmployeeId()));

        ExpenseCategory category = expenseCategoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Expense Category not found with id: " + request.getCategoryId()));

        // Category Limit check
        if (category.getMaxLimit() != null && request.getAmount().compareTo(category.getMaxLimit()) > 0) {
            throw new DepartmentExpenseException("Claim amount " + request.getAmount() +
                    " exceeds category maximum limit of " + category.getMaxLimit());
        }

        // Budget check
        Department department = employee.getDepartment();
        int month = request.getExpenseDate().getMonthValue();
        int year = request.getExpenseDate().getYear();

        DepartmentBudget budget = departmentBudgetRepository.findByDepartmentDepartmentIdAndMonthAndYear(
                department.getDepartmentId(), month, year)
                .orElseThrow(() -> new ResourceNotFoundException("No budget defined for department " +
                        department.getDepartmentName() + " in " + month + "/" + year));

        BigDecimal approvedSum = expenseClaimRepository.sumAmountByDepartmentAndMonthAndYearAndStatus(
                department.getDepartmentId(), month, year, ClaimStatus.APPROVED);

        BigDecimal remainingBudget = budget.getMonthlyBudget().subtract(approvedSum);
        if (request.getAmount().compareTo(remainingBudget) > 0) {
            throw new BudgetExceededException("Claim amount " + request.getAmount() +
                    " exceeds remaining department budget of " + remainingBudget +
                    " for " + month + "/" + year);
        }

        claim.setEmployee(employee);
        claim.setCategory(category);
        claim.setAmount(request.getAmount());
        claim.setExpenseDate(request.getExpenseDate());
        claim.setDescription(request.getDescription());

        ExpenseClaim updatedClaim = expenseClaimRepository.save(claim);

        auditLogService.log("UPDATED", employee.getEmail(), "ExpenseClaim", updatedClaim.getClaimId());

        return mapToResponseDto(updatedClaim);
    }

    @Override
    @Transactional(readOnly = true)
    public ExpenseClaimResponseDto getClaimById(Long id) {
        ExpenseClaim claim = expenseClaimRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense Claim not found with id: " + id));

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() &&
                !(authentication instanceof AnonymousAuthenticationToken)) {
            String loggedInEmail = authentication.getName();
            Employee loggedInEmployee = employeeRepository.findByEmail(loggedInEmail)
                    .orElseThrow(() -> new ResourceNotFoundException("Logged-in employee not found"));
            if (loggedInEmployee.getRole() == Role.ROLE_EMPLOYEE &&
                    !claim.getEmployee().getEmployeeId().equals(loggedInEmployee.getEmployeeId())) {
                throw new DepartmentExpenseException("Access Denied: You cannot view claims belonging to another employee");
            }
        }
        return mapToResponseDto(claim);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponseDto<ExpenseClaimResponseDto> getClaims(ExpenseFilterRequestDto filter, int page, int size, String sortBy, String direction) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() &&
                !(authentication instanceof AnonymousAuthenticationToken)) {
            String loggedInEmail = authentication.getName();
            Employee loggedInEmployee = employeeRepository.findByEmail(loggedInEmail)
                    .orElseThrow(() -> new ResourceNotFoundException("Logged-in employee not found"));
            if (loggedInEmployee.getRole() == Role.ROLE_EMPLOYEE) {
                filter.setEmployeeId(loggedInEmployee.getEmployeeId());
            }
        }

        Sort sort = direction.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Specification<ExpenseClaim> spec = buildSpecification(filter);
        Page<ExpenseClaim> claimPage = expenseClaimRepository.findAll(spec, pageable);

        List<ExpenseClaimResponseDto> content = claimPage.getContent().stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());

        return new PaginationResponseDto<>(
                content,
                claimPage.getNumber(),
                claimPage.getSize(),
                claimPage.getTotalElements(),
                claimPage.getTotalPages(),
                claimPage.isLast()
        );
    }

    @Override
    @Transactional
    public void deleteClaim(Long id) {
        ExpenseClaim claim = expenseClaimRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense Claim not found with id: " + id));

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() &&
                !(authentication instanceof AnonymousAuthenticationToken)) {
            String loggedInEmail = authentication.getName();
            Employee loggedInEmployee = employeeRepository.findByEmail(loggedInEmail)
                    .orElseThrow(() -> new ResourceNotFoundException("Logged-in employee not found"));
            if (loggedInEmployee.getRole() == Role.ROLE_EMPLOYEE &&
                    !claim.getEmployee().getEmployeeId().equals(loggedInEmployee.getEmployeeId())) {
                throw new DepartmentExpenseException("Access Denied: You cannot delete claims belonging to another employee");
            }
        }

        if (claim.getStatus() != ClaimStatus.PENDING) {
            throw new DepartmentExpenseException("Only PENDING claims can be deleted");
        }

        expenseClaimRepository.delete(claim);
        String deletedBy = (authentication != null) ? authentication.getName() : "SYSTEM";
        auditLogService.log("DELETED", deletedBy, "ExpenseClaim", id);
    }

    private ExpenseClaimResponseDto mapToResponseDto(ExpenseClaim claim) {
        ExpenseClaimResponseDto dto = modelMapper.map(claim, ExpenseClaimResponseDto.class);
        dto.setEmployeeId(claim.getEmployee().getEmployeeId());
        dto.setEmployeeName(claim.getEmployee().getEmployeeName());
        dto.setDepartmentId(claim.getEmployee().getDepartment().getDepartmentId());
        dto.setDepartmentName(claim.getEmployee().getDepartment().getDepartmentName());
        dto.setCategoryId(claim.getCategory().getCategoryId());
        dto.setCategoryName(claim.getCategory().getCategoryName());
        return dto;
    }

    private Specification<ExpenseClaim> buildSpecification(ExpenseFilterRequestDto filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter.getEmployeeId() != null) {
                predicates.add(cb.equal(root.get("employee").get("employeeId"), filter.getEmployeeId()));
            }
            if (filter.getDepartmentId() != null) {
                predicates.add(cb.equal(root.get("employee").get("department").get("departmentId"), filter.getDepartmentId()));
            }
            if (filter.getStatus() != null) {
                predicates.add(cb.equal(root.get("status"), filter.getStatus()));
            }
            if (filter.getStartDate() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("expenseDate"), filter.getStartDate()));
            }
            if (filter.getEndDate() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("expenseDate"), filter.getEndDate()));
            }
            if (filter.getMinAmount() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("amount"), filter.getMinAmount()));
            }
            if (filter.getMaxAmount() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("amount"), filter.getMaxAmount()));
            }
            if (filter.getMonth() != null) {
                predicates.add(cb.equal(cb.function("MONTH", Integer.class, root.get("expenseDate")), filter.getMonth()));
            }
            if (filter.getYear() != null) {
                predicates.add(cb.equal(cb.function("YEAR", Integer.class, root.get("expenseDate")), filter.getYear()));
            }
            if (filter.getCategoryId() != null) {
                predicates.add(cb.equal(root.get("category").get("categoryId"), filter.getCategoryId()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
