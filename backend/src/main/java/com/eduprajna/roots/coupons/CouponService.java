package com.eduprajna.roots.coupons;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CouponService {
    private final CouponRepository repo;

    public CouponService(CouponRepository repo) {
        this.repo = repo;
    }

    public List<Coupon> listAll() { return repo.findAll(); }

    public Coupon create(Coupon c) { return repo.save(c); }

    public Optional<Coupon> get(Long id) { return repo.findById(id); }

    public Coupon update(Long id, Coupon data) {
        return repo.findById(id).map(c -> {
            c.setCode(data.getCode());
            c.setDescription(data.getDescription());
            c.setDiscountType(data.getDiscountType());
            c.setValue(data.getValue());
            c.setMinSubtotal(data.getMinSubtotal());
            c.setApplicablePetType(data.getApplicablePetType());
            c.setApplicableCategory(data.getApplicableCategory());
            c.setApplicableSubcategory(data.getApplicableSubcategory());
            c.setStartDate(data.getStartDate());
            c.setEndDate(data.getEndDate());
            c.setActive(data.isActive());
            return repo.save(c);
        }).orElseThrow(() -> new IllegalArgumentException("Coupon not found"));
    }

    public void delete(Long id) { repo.deleteById(id); }

    public Optional<Coupon> findByCode(String code) { return repo.findByCodeIgnoreCase(code); }

    @Transactional(readOnly = true)
    public ValidationResult validate(String code, double subtotal, String petType, String category, String subcategory, LocalDateTime now) {
        Optional<Coupon> oc = findByCode(code);
        if (oc.isEmpty()) return ValidationResult.invalid("Coupon not found");
        Coupon c = oc.get();
        if (!c.isActive()) return ValidationResult.invalid("Coupon is inactive");
        if (c.getStartDate() != null && now.isBefore(c.getStartDate())) return ValidationResult.invalid("Coupon not started yet");
        if (c.getEndDate() != null && now.isAfter(c.getEndDate())) return ValidationResult.invalid("Coupon expired");
        if (c.getMinSubtotal() != null && subtotal < c.getMinSubtotal()) return ValidationResult.invalid("Minimum order not met");
        if (c.getApplicablePetType() != null && petType != null && !c.getApplicablePetType().equalsIgnoreCase(petType)) return ValidationResult.invalid("Not applicable for pet type");
        if (c.getApplicableCategory() != null && category != null && !c.getApplicableCategory().equalsIgnoreCase(category)) return ValidationResult.invalid("Not applicable for category");
        if (c.getApplicableSubcategory() != null && subcategory != null && !c.getApplicableSubcategory().equalsIgnoreCase(subcategory)) return ValidationResult.invalid("Not applicable for subcategory");

        double discount;
        if (c.getDiscountType() == Coupon.DiscountType.PERCENT) {
            discount = Math.round(subtotal * c.getValue() / 100.0);
        } else {
            discount = c.getValue();
        }
        if (discount < 0) discount = 0;
        if (discount > subtotal) discount = subtotal;
        return ValidationResult.valid(c, discount);
    }

    public static class ValidationResult {
        private final boolean valid;
        private final String reason;
        private final Coupon coupon;
        private final double discount;

        private ValidationResult(boolean valid, String reason, Coupon coupon, double discount) {
            this.valid = valid; this.reason = reason; this.coupon = coupon; this.discount = discount;
        }
        public static ValidationResult invalid(String reason) { return new ValidationResult(false, reason, null, 0); }
        public static ValidationResult valid(Coupon c, double discount) { return new ValidationResult(true, null, c, discount); }
        public boolean isValid() { return valid; }
        public String getReason() { return reason; }
        public Coupon getCoupon() { return coupon; }
        public double getDiscount() { return discount; }
    }
}
