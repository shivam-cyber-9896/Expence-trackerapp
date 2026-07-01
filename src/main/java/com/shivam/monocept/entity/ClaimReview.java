package com.shivam.monocept.entity;


import jakarta.persistence.*;
import jakarta.validation.constraints.*;

import java.time.LocalDateTime;

import com.shivam.monocept.enums.ClaimStatus;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "claim_reviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ClaimReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long reviewId;

    @NotNull(message = "Claim is required")
    @OneToOne
    @JoinColumn(name = "claim_id", nullable = false, unique = true)
    private ExpenseClaim claim;

    @NotBlank(message = "Reviewer name is required")
    @Size(min = 2, max = 50, message = "Reviewer name must be between 2 and 50 characters")
    @Pattern(regexp = "^[A-Za-z ]+$", message = "Reviewer name should contain only letters and spaces")
    @Column(nullable = false, length = 50)
    private String reviewerName;

    @NotNull(message = "Status is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ClaimStatus status;

    @Size(max = 250, message = "Remarks cannot exceed 250 characters")
    @Column(length = 250)
    private String remarks;

    @Column(updatable = false)
    private LocalDateTime reviewDate = LocalDateTime.now();
}