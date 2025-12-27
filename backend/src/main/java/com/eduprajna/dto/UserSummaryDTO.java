package com.eduprajna.dto;

import java.time.OffsetDateTime;
import java.time.LocalDate;

public class UserSummaryDTO {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String role;
    private OffsetDateTime createdAt;
    private LocalDate memberSince;
    private Boolean isActive;
    private Long orderCount;
    private Long wishlistCount;
    private Integer loyaltyPoints;

    public UserSummaryDTO() {}

    public UserSummaryDTO(Long id, String name, String email, String phone, String role, 
                         OffsetDateTime createdAt, LocalDate memberSince, Boolean isActive,
                         Long orderCount, Long wishlistCount, Integer loyaltyPoints) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.role = role;
        this.createdAt = createdAt;
        this.memberSince = memberSince;
        this.isActive = isActive;
        this.orderCount = orderCount;
        this.wishlistCount = wishlistCount;
        this.loyaltyPoints = loyaltyPoints;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDate getMemberSince() { return memberSince; }
    public void setMemberSince(LocalDate memberSince) { this.memberSince = memberSince; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public Long getOrderCount() { return orderCount; }
    public void setOrderCount(Long orderCount) { this.orderCount = orderCount; }

    public Long getWishlistCount() { return wishlistCount; }
    public void setWishlistCount(Long wishlistCount) { this.wishlistCount = wishlistCount; }

    public Integer getLoyaltyPoints() { return loyaltyPoints; }
    public void setLoyaltyPoints(Integer loyaltyPoints) { this.loyaltyPoints = loyaltyPoints; }
}