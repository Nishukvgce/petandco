package com.eduprajna.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import com.eduprajna.entity.CartItem;
import com.eduprajna.entity.Product;
import com.eduprajna.entity.User;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByUser(User user);
    Optional<CartItem> findByUserAndProduct(User user, Product product);
    Optional<CartItem> findByUserAndProductAndVariantId(User user, Product product, String variantId);
    
    @Modifying
    @Transactional
    void deleteByUser(User user);
    
    @Modifying
    @Transactional
    void deleteByProduct(Product product);
}


