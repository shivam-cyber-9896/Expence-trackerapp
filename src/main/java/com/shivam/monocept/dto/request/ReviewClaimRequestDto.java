package com.shivam.monocept.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import com.shivam.monocept.enums.ClaimStatus;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ReviewClaimRequestDto {

    @NotBlank(message = "Reviewer name is required")
    @Size(min = 2, max = 50, message = "Reviewer name must be between 2 and 50 characters")
    private String reviewerName;

    @NotNull(message = "Status is required")
    private ClaimStatus status;

    @Size(max = 250, message = "Remarks cannot exceed 250 characters")
    private String remarks;
}
