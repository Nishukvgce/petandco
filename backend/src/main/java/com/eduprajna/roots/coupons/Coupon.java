package com.eduprajna.roots.coupons;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "coupons")
public class Coupon {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String code;

    private String description;

    @Enumerated(EnumType.STRING)
    private DiscountType discountType; // PERCENT or FIXED

    @Column(nullable = false)
    private double value; // percent or fixed amount

    private Double minSubtotal; // null means no minimum

    private String applicablePetType; // Dog/Cat or null
    private String applicableCategory; // e.g., Cat Treats or null
    private String applicableSubcategory; // e.g., Crunchy Treats or null

    private LocalDateTime startDate; // optional
    private LocalDateTime endDate;   // optional

    @Column(nullable = false)
    private boolean active = true;

    public enum DiscountType { PERCENT, FIXED }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public DiscountType getDiscountType() { return discountType; }
    public void setDiscountType(DiscountType discountType) { this.discountType = discountType; }
    public double getValue() { return value; }
    public void setValue(double value) { this.value = value; }
    public Double getMinSubtotal() { return minSubtotal; }
    public void setMinSubtotal(Double minSubtotal) { this.minSubtotal = minSubtotal; }
    public String getApplicablePetType() { return applicablePetType; }
    public void setApplicablePetType(String applicablePetType) { this.applicablePetType = applicablePetType; }
    public String getApplicableCategory() { return applicableCategory; }
    public void setApplicableCategory(String applicableCategory) { this.applicableCategory = applicableCategory; }
    public String getApplicableSubcategory() { return applicableSubcategory; }
    public void setApplicableSubcategory(String applicableSubcategory) { this.applicableSubcategory = applicableSubcategory; }
    public LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }
    public LocalDateTime getEndDate() { return endDate; }
    public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
