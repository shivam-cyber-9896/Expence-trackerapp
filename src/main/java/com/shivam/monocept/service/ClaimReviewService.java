package com.shivam.monocept.service;

import com.shivam.monocept.dto.request.ReviewClaimRequestDto;
import com.shivam.monocept.dto.response.ClaimReviewResponseDto;

public interface ClaimReviewService {
    ClaimReviewResponseDto reviewClaim(Long claimId, ReviewClaimRequestDto request);
    ClaimReviewResponseDto getReviewByClaimId(Long claimId);
}
