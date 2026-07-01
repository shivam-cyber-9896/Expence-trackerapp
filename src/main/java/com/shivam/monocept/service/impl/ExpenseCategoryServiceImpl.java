package com.shivam.monocept.service.impl;

import com.shivam.monocept.dto.request.ExpenseCategoryRequestDto;
import com.shivam.monocept.dto.response.ExpenseCategoryResponseDto;
import com.shivam.monocept.dto.response.PaginationResponseDto;
import com.shivam.monocept.entity.ExpenseCategory;
import com.shivam.monocept.exception.DepartmentExpenseException;
import com.shivam.monocept.exception.DuplicateResourceException;
import com.shivam.monocept.exception.ResourceNotFoundException;
import com.shivam.monocept.repository.ExpenseCategoryRepository;
import com.shivam.monocept.repository.ExpenseClaimRepository;
import com.shivam.monocept.service.AuditLogService;
import com.shivam.monocept.service.ExpenseCategoryService;
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
public class ExpenseCategoryServiceImpl implements ExpenseCategoryService {

    private final ExpenseCategoryRepository expenseCategoryRepository;
    private final ExpenseClaimRepository expenseClaimRepository;
    private final AuditLogService auditLogService;
    private final ModelMapper modelMapper;

    @Override
    @Transactional
    public ExpenseCategoryResponseDto createCategory(ExpenseCategoryRequestDto request) {
        if (expenseCategoryRepository.existsByCategoryName(request.getCategoryName())) {
            throw new DuplicateResourceException("Expense Category with name " + request.getCategoryName() + " already exists");
        }

        ExpenseCategory category = modelMapper.map(request, ExpenseCategory.class);
        ExpenseCategory savedCategory = expenseCategoryRepository.save(category);

        auditLogService.log("CREATED", "SYSTEM", "ExpenseCategory", savedCategory.getCategoryId());

        return modelMapper.map(savedCategory, ExpenseCategoryResponseDto.class);
    }

    @Override
    @Transactional
    public ExpenseCategoryResponseDto updateCategory(Long id, ExpenseCategoryRequestDto request) {
        ExpenseCategory category = expenseCategoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense Category not found with id: " + id));

        if (!category.getCategoryName().equalsIgnoreCase(request.getCategoryName()) &&
                expenseCategoryRepository.existsByCategoryName(request.getCategoryName())) {
            throw new DuplicateResourceException("Expense Category with name " + request.getCategoryName() + " already exists");
        }

        category.setCategoryName(request.getCategoryName());
        category.setMaxLimit(request.getMaxLimit());
        category.setDescription(request.getDescription());

        ExpenseCategory updatedCategory = expenseCategoryRepository.save(category);

        auditLogService.log("UPDATED", "SYSTEM", "ExpenseCategory", updatedCategory.getCategoryId());

        return modelMapper.map(updatedCategory, ExpenseCategoryResponseDto.class);
    }

    @Override
    @Transactional(readOnly = true)
    public ExpenseCategoryResponseDto getCategoryById(Long id) {
        ExpenseCategory category = expenseCategoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense Category not found with id: " + id));
        return modelMapper.map(category, ExpenseCategoryResponseDto.class);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponseDto<ExpenseCategoryResponseDto> getAllCategories(int page, int size, String sortBy, String direction) {
        Sort sort = direction.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<ExpenseCategory> categoryPage = expenseCategoryRepository.findAll(pageable);

        List<ExpenseCategoryResponseDto> content = categoryPage.getContent().stream()
                .map(cat -> modelMapper.map(cat, ExpenseCategoryResponseDto.class))
                .collect(Collectors.toList());

        return new PaginationResponseDto<>(
                content,
                categoryPage.getNumber(),
                categoryPage.getSize(),
                categoryPage.getTotalElements(),
                categoryPage.getTotalPages(),
                categoryPage.isLast()
        );
    }

    @Override
    @Transactional
    public void deleteCategory(Long id) {
        ExpenseCategory category = expenseCategoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense Category not found with id: " + id));

        if (expenseClaimRepository.existsByCategoryCategoryId(id)) {
            throw new DepartmentExpenseException("Cannot delete category: it has active associated expense claims.");
        }

        expenseCategoryRepository.delete(category);
        auditLogService.log("DELETED", "SYSTEM", "ExpenseCategory", id);
    }
}
