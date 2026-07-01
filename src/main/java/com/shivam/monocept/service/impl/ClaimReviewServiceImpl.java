package com.shivam.monocept.service.impl;

import com.shivam.monocept.dto.request.ReviewClaimRequestDto;
import com.shivam.monocept.dto.response.ClaimReviewResponseDto;
import com.shivam.monocept.entity.ClaimReview;
import com.shivam.monocept.entity.Department;
import com.shivam.monocept.entity.DepartmentBudget;
import com.shivam.monocept.entity.ExpenseClaim;
import com.shivam.monocept.enums.ClaimStatus;
import com.shivam.monocept.exception.BudgetExceededException;
import com.shivam.monocept.exception.DepartmentExpenseException;
import com.shivam.monocept.exception.ResourceNotFoundException;
import com.shivam.monocept.repository.ClaimReviewRepository;
import com.shivam.monocept.repository.DepartmentBudgetRepository;
import com.shivam.monocept.repository.ExpenseClaimRepository;
import com.shivam.monocept.service.AuditLogService;
import com.shivam.monocept.service.ClaimReviewService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ClaimReviewServiceImpl implements ClaimReviewService {

    private final ClaimReviewRepository claimReviewRepository;
    private final ExpenseClaimRepository expenseClaimRepository;
    private final DepartmentBudgetRepository departmentBudgetRepository;
    private final AuditLogService auditLogService;
    private final ModelMapper modelMapper;

    @Override
    @Transactional
    public ClaimReviewResponseDto reviewClaim(Long claimId, ReviewClaimRequestDto request) {
        ExpenseClaim claim = expenseClaimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense Claim not found with id: " + claimId));

        if (claim.getStatus() != ClaimStatus.PENDING) {
            throw new DepartmentExpenseException("Claim has already been reviewed");
        }

        // Budget check during approval
        if (request.getStatus() == ClaimStatus.APPROVED) {
            Department department = claim.getEmployee().getDepartment();
            int month = claim.getExpenseDate().getMonthValue();
            int year = claim.getExpenseDate().getYear();

            DepartmentBudget budget = departmentBudgetRepository.findByDepartmentDepartmentIdAndMonthAndYear(
                    department.getDepartmentId(), month, year)
                    .orElseThrow(() -> new ResourceNotFoundException("No budget defined for department " +
                            department.getDepartmentName() + " in " + month + "/" + year));

            BigDecimal approvedSum = expenseClaimRepository.sumAmountByDepartmentAndMonthAndYearAndStatus(
                    department.getDepartmentId(), month, year, ClaimStatus.APPROVED);

            BigDecimal remainingBudget = budget.getMonthlyBudget().subtract(approvedSum);
            if (claim.getAmount().compareTo(remainingBudget) > 0) {
                throw new BudgetExceededException("Cannot approve claim: claim amount " + claim.getAmount() +
                        " exceeds remaining department budget of " + remainingBudget +
                        " for " + month + "/" + year);
            }
        }

        // Update the claim status and review remarks
        claim.setStatus(request.getStatus());
        claim.setReviewRemark(request.getRemarks());
        expenseClaimRepository.save(claim);

        // Record the claim review
        ClaimReview review = new ClaimReview();
        review.setClaim(claim);
        review.setReviewerName(request.getReviewerName());
        review.setStatus(request.getStatus());
        review.setRemarks(request.getRemarks());
        review.setReviewDate(LocalDateTime.now());

        ClaimReview savedReview = claimReviewRepository.save(review);

        auditLogService.log("REVIEWED", request.getReviewerName(), "ClaimReview", savedReview.getReviewId());

        ClaimReviewResponseDto responseDto = modelMapper.map(savedReview, ClaimReviewResponseDto.class);
        responseDto.setClaimId(claimId);
        return responseDto;
    }

    @Override
    @Transactional(readOnly = true)
    public ClaimReviewResponseDto getReviewByClaimId(Long claimId) {
        ClaimReview review = claimReviewRepository.findByClaimClaimId(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found for claim id: " + claimId));
        ClaimReviewResponseDto responseDto = modelMapper.map(review, ClaimReviewResponseDto.class);
        responseDto.setClaimId(claimId);
        return responseDto;
    }
}
