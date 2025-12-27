package com.eduprajna.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.eduprajna.entity.Product;
import com.eduprajna.entity.ProductReview;
import com.eduprajna.entity.User;

@Repository
public interface ProductReviewRepository extends JpaRepository<ProductReview, Long> {
    
    // Find all active reviews for a product, ordered by most recent
    @Query("SELECT pr FROM ProductReview pr WHERE pr.product = :product AND pr.isActive = true ORDER BY pr.createdAt DESC")
    Page<ProductReview> findByProductAndIsActiveTrue(@Param("product") Product product, Pageable pageable);
    
    @Query("SELECT pr FROM ProductReview pr WHERE pr.product = :product AND pr.isActive = true ORDER BY pr.createdAt DESC")
    List<ProductReview> findByProductAndIsActiveTrue(@Param("product") Product product);

    // Find review by user and product (to check if user already reviewed)
    Optional<ProductReview> findByUserAndProductAndIsActiveTrue(User user, Product product);

    // Get average rating for a product
    @Query("SELECT AVG(pr.rating) FROM ProductReview pr WHERE pr.product = :product AND pr.isActive = true")
    Double getAverageRatingByProduct(@Param("product") Product product);

    // Get rating count for a product
    @Query("SELECT COUNT(pr) FROM ProductReview pr WHERE pr.product = :product AND pr.isActive = true")
    Long getReviewCountByProduct(@Param("product") Product product);

    // Get rating distribution for a product
    @Query("SELECT pr.rating, COUNT(pr) FROM ProductReview pr WHERE pr.product = :product AND pr.isActive = true GROUP BY pr.rating ORDER BY pr.rating DESC")
    List<Object[]> getRatingDistributionByProduct(@Param("product") Product product);

    // Find all reviews by user
    @Query("SELECT pr FROM ProductReview pr WHERE pr.user = :user AND pr.isActive = true ORDER BY pr.createdAt DESC")
    List<ProductReview> findByUserAndIsActiveTrue(@Param("user") User user);

    // Find reviews that can be written (for delivered orders)
    @Query("SELECT DISTINCT oi.product FROM OrderItem oi " +
           "WHERE oi.order.user = :user " +
           "AND oi.order.status = 'delivered' " +
           "AND NOT EXISTS (SELECT pr FROM ProductReview pr WHERE pr.user = :user AND pr.product = oi.product AND pr.isActive = true)")
    List<Product> findProductsEligibleForReview(@Param("user") User user);

    // Check if user can review a product (has ordered and received it)
    @Query("SELECT COUNT(oi) > 0 FROM OrderItem oi " +
           "WHERE oi.order.user = :user " +
           "AND oi.product = :product " +
           "AND oi.order.status = 'delivered'")
    boolean canUserReviewProduct(@Param("user") User user, @Param("product") Product product);
}