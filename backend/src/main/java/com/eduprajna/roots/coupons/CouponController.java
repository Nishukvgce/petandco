package com.eduprajna.roots.coupons;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/coupons")
public class CouponController {
    private final CouponService service;

    public CouponController(CouponService service) { this.service = service; }

    @GetMapping
    public List<Coupon> list() { return service.listAll(); }

    @PostMapping
    public Coupon create(@RequestBody Coupon c) { return service.create(c); }

    @PutMapping("/{id}")
    public Coupon update(@PathVariable Long id, @RequestBody Coupon c) { return service.update(id, c); }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) { service.delete(id); return ResponseEntity.noContent().build(); }

    @PostMapping("/validate")
    public ResponseEntity<?> validate(@RequestBody Map<String, Object> payload) {
        String code = (String) payload.getOrDefault("code", "");
        double subtotal = ((Number) payload.getOrDefault("subtotal", 0)).doubleValue();
        String petType = (String) payload.getOrDefault("petType", null);
        String category = (String) payload.getOrDefault("category", null);
        String subcategory = (String) payload.getOrDefault("subcategory", null);
        CouponService.ValidationResult vr = service.validate(code, subtotal, petType, category, subcategory, LocalDateTime.now());
        if (!vr.isValid()) {
            return ResponseEntity.badRequest().body(Map.of("valid", false, "reason", vr.getReason()));
        }
        return ResponseEntity.ok(Map.of(
                "valid", true,
                "discount", vr.getDiscount(),
                "coupon", Map.of(
                        "code", vr.getCoupon().getCode(),
                        "description", vr.getCoupon().getDescription(),
                        "discountType", vr.getCoupon().getDiscountType(),
                        "value", vr.getCoupon().getValue()
                )
        ));
    }
}
