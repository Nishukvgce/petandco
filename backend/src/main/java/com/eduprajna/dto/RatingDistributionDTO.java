package com.eduprajna.dto;

public class RatingDistributionDTO {
    public Integer rating;
    public Long count;
    public Double percentage;

    public RatingDistributionDTO() {}

    public RatingDistributionDTO(Integer rating, Long count, Double percentage) {
        this.rating = rating;
        this.count = count;
        this.percentage = percentage;
    }
}