package com.eduprajna.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.eduprajna.entity.Product;
import com.eduprajna.entity.User;
import com.eduprajna.entity.WishlistItem;

@Repository
public interface WishlistItemRepository extends JpaRepository<WishlistItem, Long> {
    List<WishlistItem> findByUserOrderByCreatedAtDesc(User user);
    Optional<WishlistItem> findByUserAndProduct(User user, Product product);
    @Modifying
    @Transactional
    void deleteByUserAndProduct(User user, Product product);
    
    @Modifying
    @Transactional
    long deleteByUserAndProduct_Id(User user, Long productId);
    
    @Modifying
    @Transactional
    long deleteByUserAndProductId(User user, Long productId);
    
    long countByUser(User user);
    
    @Modifying
    @Transactional
    void deleteByProduct(Product product);
}
