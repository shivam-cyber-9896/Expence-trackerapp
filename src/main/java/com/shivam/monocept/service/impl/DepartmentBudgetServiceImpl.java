package com.shivam.monocept.service.impl;

import com.shivam.monocept.dto.request.DepartmentBudgetRequestDto;
import com.shivam.monocept.dto.response.DepartmentBudgetResponseDto;
import com.shivam.monocept.dto.response.MonthlySummaryResponseDto;
import com.shivam.monocept.dto.response.PaginationResponseDto;
import com.shivam.monocept.entity.Department;
import com.shivam.monocept.entity.DepartmentBudget;
import com.shivam.monocept.enums.ClaimStatus;
import com.shivam.monocept.exception.DuplicateResourceException;
import com.shivam.monocept.exception.ResourceNotFoundException;
import com.shivam.monocept.repository.DepartmentBudgetRepository;
import com.shivam.monocept.repository.DepartmentRepository;
import com.shivam.monocept.repository.ExpenseClaimRepository;
import com.shivam.monocept.service.AuditLogService;
import com.shivam.monocept.service.DepartmentBudgetService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DepartmentBudgetServiceImpl implements DepartmentBudgetService {

    private final DepartmentBudgetRepository departmentBudgetRepository;
    private final DepartmentRepository departmentRepository;
    private final ExpenseClaimRepository expenseClaimRepository;
    private final AuditLogService auditLogService;
    private final ModelMapper modelMapper;

    @Override
    @Transactional
    public DepartmentBudgetResponseDto createBudget(DepartmentBudgetRequestDto request) {
        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + request.getDepartmentId()));

        Optional<DepartmentBudget> existing = departmentBudgetRepository.findByDepartmentDepartmentIdAndMonthAndYear(
                request.getDepartmentId(), request.getMonth(), request.getYear());

        if (existing.isPresent()) {
            throw new DuplicateResourceException("Budget already defined for department " +
                    department.getDepartmentName() + " for " + request.getMonth() + "/" + request.getYear());
        }

        DepartmentBudget budget = modelMapper.map(request, DepartmentBudget.class);
        budget.setDepartment(department);
        DepartmentBudget saved = departmentBudgetRepository.save(budget);

        auditLogService.log("CREATED", "SYSTEM", "DepartmentBudget", saved.getBudgetId());

        return mapToResponseDto(saved);
    }

    @Override
    @Transactional
    public DepartmentBudgetResponseDto updateBudget(Long id, DepartmentBudgetRequestDto request) {
        DepartmentBudget budget = departmentBudgetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department Budget not found with id: " + id));

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + request.getDepartmentId()));

        Optional<DepartmentBudget> existing = departmentBudgetRepository.findByDepartmentDepartmentIdAndMonthAndYear(
                request.getDepartmentId(), request.getMonth(), request.getYear());

        if (existing.isPresent() && !existing.get().getBudgetId().equals(id)) {
            throw new DuplicateResourceException("Budget already defined for department " +
                    department.getDepartmentName() + " for " + request.getMonth() + "/" + request.getYear());
        }

        budget.setDepartment(department);
        budget.setMonth(request.getMonth());
        budget.setYear(request.getYear());
        budget.setMonthlyBudget(request.getMonthlyBudget());

        DepartmentBudget updated = departmentBudgetRepository.save(budget);

        auditLogService.log("UPDATED", "SYSTEM", "DepartmentBudget", updated.getBudgetId());

        return mapToResponseDto(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public DepartmentBudgetResponseDto getBudgetById(Long id) {
        DepartmentBudget budget = departmentBudgetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department Budget not found with id: " + id));
        return mapToResponseDto(budget);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponseDto<DepartmentBudgetResponseDto> getAllBudgets(int page, int size, String sortBy, String direction) {
        Sort sort = direction.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<DepartmentBudget> budgetPage = departmentBudgetRepository.findAll(pageable);

        List<DepartmentBudgetResponseDto> content = budgetPage.getContent().stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());

        return new PaginationResponseDto<>(
                content,
                budgetPage.getNumber(),
                budgetPage.getSize(),
                budgetPage.getTotalElements(),
                budgetPage.getTotalPages(),
                budgetPage.isLast()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public MonthlySummaryResponseDto getMonthlySummary(Long departmentId, int month, int year) {
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + departmentId));

        Optional<DepartmentBudget> budgetOpt = departmentBudgetRepository.findByDepartmentDepartmentIdAndMonthAndYear(
                departmentId, month, year);

        BigDecimal totalBudget = budgetOpt.map(DepartmentBudget::getMonthlyBudget).orElse(BigDecimal.ZERO);

        BigDecimal totalApproved = expenseClaimRepository.sumAmountByDepartmentAndMonthAndYearAndStatus(
                departmentId, month, year, ClaimStatus.APPROVED);

        BigDecimal totalPending = expenseClaimRepository.sumAmountByDepartmentAndMonthAndYearAndStatus(
                departmentId, month, year, ClaimStatus.PENDING);

        BigDecimal remainingBudget = totalBudget.subtract(totalApproved);

        long pendingCount = expenseClaimRepository.countByDepartmentAndMonthAndYearAndStatus(
                departmentId, month, year, ClaimStatus.PENDING);

        long approvedCount = expenseClaimRepository.countByDepartmentAndMonthAndYearAndStatus(
                departmentId, month, year, ClaimStatus.APPROVED);

        long rejectedCount = expenseClaimRepository.countByDepartmentAndMonthAndYearAndStatus(
                departmentId, month, year, ClaimStatus.REJECTED);

        return new MonthlySummaryResponseDto(
                departmentId,
                department.getDepartmentName(),
                month,
                year,
                totalBudget,
                totalApproved,
                totalPending,
                remainingBudget,
                pendingCount,
                approvedCount,
                rejectedCount
        );
    }

    @Override
    @Transactional
    public void deleteBudget(Long id) {
        DepartmentBudget budget = departmentBudgetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department Budget not found with id: " + id));
        departmentBudgetRepository.delete(budget);
        auditLogService.log("DELETED", "SYSTEM", "DepartmentBudget", id);
    }

    private DepartmentBudgetResponseDto mapToResponseDto(DepartmentBudget budget) {
        DepartmentBudgetResponseDto dto = modelMapper.map(budget, DepartmentBudgetResponseDto.class);
        dto.setDepartmentId(budget.getDepartment().getDepartmentId());
        dto.setDepartmentName(budget.getDepartment().getDepartmentName());
        return dto;
    }
}
