package com.eduprajna.dto;

public class ReviewStatsDTO {
    public Double averageRating;
    public Long totalReviews;
    public RatingDistributionDTO[] ratingDistribution;

    public ReviewStatsDTO() {}

    public ReviewStatsDTO(Double averageRating, Long totalReviews, RatingDistributionDTO[] ratingDistribution) {
        this.averageRating = averageRating;
        this.totalReviews = totalReviews;
        this.ratingDistribution = ratingDistribution;
    }
}