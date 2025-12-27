package com.eduprajna.roots.coupons;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CouponRepository extends JpaRepository<Coupon, Long> {
    Optional<Coupon> findByCodeIgnoreCase(String code);
}
