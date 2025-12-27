package com.eduprajna.entity;

import java.time.OffsetDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "product_reviews")
public class ProductReview {
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order; // Link to order for verified purchase

    @Column(nullable = false)
    private Integer rating; // 1-5 stars

    @Column(columnDefinition = "TEXT")
    private String comment;

    @Column(length = 100)
    private String title; // Review title/summary

    @Column(nullable = false)
    private Boolean isVerifiedPurchase = false;

    @Column(nullable = false)
    private Boolean isActive = true;

    @Column(nullable = false)
    private Integer helpfulCount = 0;

    @Column(nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    private OffsetDateTime updatedAt;

    // Constructors
    public ProductReview() {}

    public ProductReview(User user, Product product, Order order, Integer rating, String comment, String title) {
        this.user = user;
        this.product = product;
        this.order = order;
        this.rating = rating;
        this.comment = comment;
        this.title = title;
        this.isVerifiedPurchase = (order != null);
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

    public Order getOrder() { return order; }
    public void setOrder(Order order) { 
        this.order = order;
        this.isVerifiedPurchase = (order != null);
    }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public Boolean getIsVerifiedPurchase() { return isVerifiedPurchase; }
    public void setIsVerifiedPurchase(Boolean isVerifiedPurchase) { this.isVerifiedPurchase = isVerifiedPurchase; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public Integer getHelpfulCount() { return helpfulCount; }
    public void setHelpfulCount(Integer helpfulCount) { this.helpfulCount = helpfulCount; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }
}