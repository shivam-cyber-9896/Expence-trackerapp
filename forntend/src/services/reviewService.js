import apiClient from './api';

export const reviewService = {
  /**
   * Reviews (Approves/Rejects) an expense claim.
   * @param {number|string} claimId - The claim ID to review.
   * @param {object} reviewData - The decision and comments (ReviewClaimRequestDto).
   * @returns {Promise} Resolves to ApiResponseDto<ClaimReviewResponseDto>.
   */
  review: (claimId, reviewData) => apiClient.post(`/reviews/claims/${claimId}`, reviewData),

  /**
   * Retrieves the review details associated with a claim ID.
   * @param {number|string} claimId - The ID of the reviewed claim.
   * @returns {Promise} Resolves to ApiResponseDto<ClaimReviewResponseDto>.
   */
  getByClaimId: (claimId) => apiClient.get(`/reviews/claims/${claimId}`),
};

export default reviewService;
