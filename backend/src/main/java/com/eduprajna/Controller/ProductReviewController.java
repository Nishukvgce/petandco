package com.eduprajna.Controller;

import com.eduprajna.dto.ProductReviewDTO;
import com.eduprajna.dto.ReviewStatsDTO;
import com.eduprajna.entity.Product;
import com.eduprajna.service.ProductReviewService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "https://nishmitha-pet-co.vercel.app"}, allowCredentials = "true")
public class ProductReviewController {
    
    private static final Logger logger = LoggerFactory.getLogger(ProductReviewController.class);

    @Autowired
    private ProductReviewService reviewService;

    /**
     * Create a new product review
     * POST /api/reviews
     */
    @PostMapping
    public ResponseEntity<?> createReview(@RequestBody CreateReviewRequest request, @RequestParam String userEmail) {
        try {
            logger.debug("Creating review for product {} by user {}", request.productId, userEmail);
            
            ProductReviewDTO review = reviewService.createReview(
                userEmail, 
                request.productId, 
                request.rating, 
                request.comment, 
                request.title
            );
            
            logger.info("Review created successfully: {}", review.id);
            return ResponseEntity.ok(review);
            
        } catch (IllegalArgumentException e) {
            logger.error("Invalid request for creating review: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error creating review", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to create review"));
        }
    }

    /**
     * Get reviews for a product with pagination
     * GET /api/reviews/product/{productId}
     */
    @GetMapping("/product/{productId}")
    public ResponseEntity<?> getProductReviews(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            logger.debug("Getting reviews for product {} (page: {}, size: {})", productId, page, size);
            
            Page<ProductReviewDTO> reviews = reviewService.getProductReviews(productId, page, size);
            
            return ResponseEntity.ok(Map.of(
                "reviews", reviews.getContent(),
                "totalElements", reviews.getTotalElements(),
                "totalPages", reviews.getTotalPages(),
                "currentPage", page,
                "pageSize", size
            ));
            
        } catch (IllegalArgumentException e) {
            logger.error("Invalid request for getting product reviews: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error getting product reviews", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to get reviews"));
        }
    }

    /**
     * Get review statistics for a product
     * GET /api/reviews/product/{productId}/stats
     */
    @GetMapping("/product/{productId}/stats")
    public ResponseEntity<?> getProductReviewStats(@PathVariable Long productId) {
        try {
            logger.debug("Getting review stats for product {}", productId);
            
            ReviewStatsDTO stats = reviewService.getProductReviewStats(productId);
            
            return ResponseEntity.ok(stats);
            
        } catch (IllegalArgumentException e) {
            logger.error("Invalid request for getting product review stats: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error getting product review stats", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to get review statistics"));
        }
    }

    /**
     * Get products that user can review (delivered but not reviewed)
     * GET /api/reviews/eligible-products
     */
    @GetMapping("/eligible-products")
    public ResponseEntity<?> getEligibleProducts(@RequestParam String userEmail) {
        try {
            logger.debug("Getting eligible products for review for user {}", userEmail);
            
            List<Product> products = reviewService.getProductsEligibleForReview(userEmail);
            
            return ResponseEntity.ok(products);
            
        } catch (IllegalArgumentException e) {
            logger.error("Invalid request for getting eligible products: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error getting eligible products", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to get eligible products"));
        }
    }

    /**
     * Get user's reviews
     * GET /api/reviews/user
     */
    @GetMapping("/user")
    public ResponseEntity<?> getUserReviews(@RequestParam String userEmail) {
        try {
            logger.debug("Getting reviews for user {}", userEmail);
            
            List<ProductReviewDTO> reviews = reviewService.getUserReviews(userEmail);
            
            return ResponseEntity.ok(reviews);
            
        } catch (IllegalArgumentException e) {
            logger.error("Invalid request for getting user reviews: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error getting user reviews", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to get user reviews"));
        }
    }

    /**
     * Mark a review as helpful
     * POST /api/reviews/{reviewId}/helpful
     */
    @PostMapping("/{reviewId}/helpful")
    public ResponseEntity<?> markReviewHelpful(@PathVariable Long reviewId) {
        try {
            logger.debug("Marking review {} as helpful", reviewId);
            
            reviewService.markReviewHelpful(reviewId);
            
            return ResponseEntity.ok(Map.of("message", "Review marked as helpful"));
            
        } catch (IllegalArgumentException e) {
            logger.error("Invalid request for marking review helpful: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error marking review helpful", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to mark review as helpful"));
        }
    }

    // Inner class for request body
    public static class CreateReviewRequest {
        public Long productId;
        public Integer rating;
        public String comment;
        public String title;
    }
}