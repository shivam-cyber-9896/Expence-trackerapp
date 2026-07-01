package com.shivam.monocept.repository;

import com.shivam.monocept.entity.ClaimReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ClaimReviewRepository extends JpaRepository<ClaimReview, Long> {
    Optional<ClaimReview> findByClaimClaimId(Long claimId);
}
