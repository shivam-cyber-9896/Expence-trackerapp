package com.shivam.monocept.dto.response;

import java.time.LocalDateTime;
import com.shivam.monocept.enums.ClaimStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClaimReviewResponseDto {
    private Long reviewId;
    private Long claimId;
    private String reviewerName;
    private ClaimStatus status;
    private String remarks;
    private LocalDateTime reviewDate;
}
