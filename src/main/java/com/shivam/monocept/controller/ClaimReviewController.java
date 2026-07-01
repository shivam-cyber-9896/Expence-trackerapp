package com.shivam.monocept.controller;

import com.shivam.monocept.dto.request.ReviewClaimRequestDto;
import com.shivam.monocept.dto.response.ApiResponseDto;
import com.shivam.monocept.dto.response.ClaimReviewResponseDto;
import com.shivam.monocept.service.ClaimReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ClaimReviewController {

    private final ClaimReviewService claimReviewService;

    @PostMapping("/claims/{claimId}")
    public ResponseEntity<ApiResponseDto<ClaimReviewResponseDto>> reviewClaim(
            @PathVariable Long claimId,
            @Valid @RequestBody ReviewClaimRequestDto request) {
        ClaimReviewResponseDto response = claimReviewService.reviewClaim(claimId, request);
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Claim review submitted successfully", response));
    }

    @GetMapping("/claims/{claimId}")
    public ResponseEntity<ApiResponseDto<ClaimReviewResponseDto>> getReviewByClaimId(@PathVariable Long claimId) {
        ClaimReviewResponseDto response = claimReviewService.getReviewByClaimId(claimId);
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Claim review retrieved successfully", response));
    }
}
