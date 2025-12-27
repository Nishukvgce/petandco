package com.eduprajna.dto;

import java.time.OffsetDateTime;

public class ProductReviewDTO {
    public Long id;
    public Long userId;
    public String userName;
    public Long productId;
    public String productName;
    public Integer rating;
    public String comment;
    public String title;
    public Boolean isVerifiedPurchase;
    public Integer helpfulCount;
    public OffsetDateTime createdAt;
    public OffsetDateTime updatedAt;

    // Constructor for creating new review
    public ProductReviewDTO() {}

    // Constructor for response
    public ProductReviewDTO(Long id, Long userId, String userName, Long productId, String productName,
                           Integer rating, String comment, String title, Boolean isVerifiedPurchase,
                           Integer helpfulCount, OffsetDateTime createdAt, OffsetDateTime updatedAt) {
        this.id = id;
        this.userId = userId;
        this.userName = userName;
        this.productId = productId;
        this.productName = productName;
        this.rating = rating;
        this.comment = comment;
        this.title = title;
        this.isVerifiedPurchase = isVerifiedPurchase;
        this.helpfulCount = helpfulCount;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}