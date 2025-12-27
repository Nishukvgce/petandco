package com.eduprajna.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eduprajna.dto.ProductReviewDTO;
import com.eduprajna.dto.RatingDistributionDTO;
import com.eduprajna.dto.ReviewStatsDTO;
import com.eduprajna.entity.Order;
import com.eduprajna.entity.Product;
import com.eduprajna.entity.ProductReview;
import com.eduprajna.entity.User;
import com.eduprajna.repository.OrderRepository;
import com.eduprajna.repository.ProductRepository;
import com.eduprajna.repository.ProductReviewRepository;
import com.eduprajna.repository.UserRepository;

@Service
@Transactional
public class ProductReviewService {

    @Autowired
    private ProductReviewRepository reviewRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    /**
     * Create a new product review
     */
    public ProductReviewDTO createReview(String userEmail, Long productId, Integer rating, String comment, String title) {
        // Validate user
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Validate product
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        // Check if user already reviewed this product
        Optional<ProductReview> existingReview = reviewRepository.findByUserAndProductAndIsActiveTrue(user, product);
        if (existingReview.isPresent()) {
            throw new IllegalArgumentException("You have already reviewed this product");
        }

        // Check if user can review this product (has ordered and received it)
        boolean canReview = reviewRepository.canUserReviewProduct(user, product);
        if (!canReview) {
            throw new IllegalArgumentException("You can only review products you have purchased and received");
        }

        // Find the order for verified purchase
        Order order = orderRepository.findFirstByUserAndStatusAndItemsProductOrderByCreatedAtDesc(
                user, "delivered", product).orElse(null);

        // Create review
        ProductReview review = new ProductReview(user, product, order, rating, comment, title);
        review = reviewRepository.save(review);

        // Update product rating cache (if you want to store it in product)
        updateProductRatingCache(product);

        return convertToDTO(review);
    }

    /**
     * Get reviews for a product with pagination
     */
    public Page<ProductReviewDTO> getProductReviews(Long productId, int page, int size) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        Pageable pageable = PageRequest.of(page, size);
        Page<ProductReview> reviews = reviewRepository.findByProductAndIsActiveTrue(product, pageable);

        return reviews.map(this::convertToDTO);
    }

    /**
     * Get review statistics for a product
     */
    public ReviewStatsDTO getProductReviewStats(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        Double averageRating = reviewRepository.getAverageRatingByProduct(product);
        Long totalReviews = reviewRepository.getReviewCountByProduct(product);
        List<Object[]> distribution = reviewRepository.getRatingDistributionByProduct(product);

        // Convert to rating distribution
        RatingDistributionDTO[] ratingDistribution = new RatingDistributionDTO[5];
        for (int i = 1; i <= 5; i++) {
            ratingDistribution[i-1] = new RatingDistributionDTO(i, 0L, 0.0);
        }

        for (Object[] dist : distribution) {
            Integer rating = (Integer) dist[0];
            Long count = (Long) dist[1];
            Double percentage = totalReviews > 0 ? (count.doubleValue() / totalReviews) * 100 : 0.0;
            ratingDistribution[rating-1] = new RatingDistributionDTO(rating, count, percentage);
        }

        return new ReviewStatsDTO(averageRating != null ? averageRating : 0.0, totalReviews, ratingDistribution);
    }

    /**
     * Get products that user can review (delivered but not reviewed)
     */
    public List<Product> getProductsEligibleForReview(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return reviewRepository.findProductsEligibleForReview(user);
    }

    /**
     * Get user's reviews
     */
    public List<ProductReviewDTO> getUserReviews(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<ProductReview> reviews = reviewRepository.findByUserAndIsActiveTrue(user);
        return reviews.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    /**
     * Update helpful count for a review
     */
    public void markReviewHelpful(Long reviewId) {
        ProductReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found"));

        review.setHelpfulCount(review.getHelpfulCount() + 1);
        reviewRepository.save(review);
    }

    /**
     * Update product rating cache in metadata
     */
    private void updateProductRatingCache(Product product) {
        try {
            Double avgRating = reviewRepository.getAverageRatingByProduct(product);
            Long reviewCount = reviewRepository.getReviewCountByProduct(product);

            if (product.getMetadata() == null) {
                product.setMetadata(new java.util.HashMap<>());
            }

            product.getMetadata().put("averageRating", avgRating != null ? avgRating : 0.0);
            product.getMetadata().put("reviewCount", reviewCount != null ? reviewCount : 0L);

            productRepository.save(product);
        } catch (Exception e) {
            // Log error but don't fail the review creation
            System.err.println("Failed to update product rating cache: " + e.getMessage());
        }
    }

    /**
     * Convert entity to DTO
     */
    private ProductReviewDTO convertToDTO(ProductReview review) {
        return new ProductReviewDTO(
                review.getId(),
                review.getUser().getId(),
                review.getUser().getName(),
                review.getProduct().getId(),
                review.getProduct().getName(),
                review.getRating(),
                review.getComment(),
                review.getTitle(),
                review.getIsVerifiedPurchase(),
                review.getHelpfulCount(),
                review.getCreatedAt(),
                review.getUpdatedAt()
        );
    }
}