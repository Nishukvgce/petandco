package com.eduprajna.Controller;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.eduprajna.dto.WishlistItemDTO;
import com.eduprajna.entity.User;
import com.eduprajna.service.UserService;
import com.eduprajna.service.WishlistService;

@RestController
@RequestMapping("/api/wishlist")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000", "https://nishmitha-pet-co.vercel.app"}, allowCredentials = "true")
public class WishlistController {
    private static final Logger logger = LoggerFactory.getLogger(WishlistController.class);

    @Autowired
    private WishlistService wishlistService;
    
    @Autowired
    private UserService userService;

    private User requireUser(String email) {
        return userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
    }

    @GetMapping
    public ResponseEntity<?> getWishlist(@RequestParam("email") String email) {
        try {
            logger.debug("Fetching wishlist for user: {}", email);
            User user = requireUser(email);
            List<WishlistItemDTO> items = wishlistService.getWishlist(user);
            return ResponseEntity.ok(items);
        } catch (RuntimeException e) {
            logger.error("Error fetching wishlist for user: {}", email, e);
            return ResponseEntity.status(404).body("User not found");
        } catch (Exception e) {
            logger.error("Unexpected error fetching wishlist for user: {}", email, e);
            return ResponseEntity.status(500).body("Internal server error");
        }
    }

    @GetMapping("/count")
    public ResponseEntity<?> getWishlistCount(@RequestParam("email") String email) {
        try {
            logger.debug("Counting wishlist for user: {}", email);
            User user = requireUser(email);
            long count = wishlistService.count(user);
            return ResponseEntity.ok(count);
        } catch (RuntimeException e) {
            logger.error("Error counting wishlist for user: {}", email, e);
            return ResponseEntity.status(404).body("User not found");
        } catch (Exception e) {
            logger.error("Unexpected error counting wishlist for user: {}", email, e);
            return ResponseEntity.status(500).body("Internal server error");
        }
    }

    @PostMapping
    public ResponseEntity<?> addToWishlist(@RequestParam("email") String email, @RequestBody Map<String, Object> body) {
        try {
            logger.debug("Adding to wishlist for user: {}", email);
            if (body.get("productId") == null) {
                return ResponseEntity.badRequest().body("Product ID is required");
            }
            Long productId = ((Number) body.get("productId")).longValue();
            User user = requireUser(email);
            WishlistItemDTO saved = wishlistService.addToWishlist(user, productId);
            return ResponseEntity.ok(saved);
        } catch (RuntimeException e) {
            logger.error("Error adding to wishlist for user: {}", email, e);
            return ResponseEntity.status(404).body("User or product not found");
        } catch (Exception e) {
            logger.error("Unexpected error adding to wishlist for user: {}", email, e);
            return ResponseEntity.status(500).body("Internal server error");
        }
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<?> removeFromWishlist(@RequestParam("email") String email, @PathVariable("productId") Long productId) {
        try {
            logger.debug("Removing from wishlist for user: {} product: {}", email, productId);
            User user = requireUser(email);
            wishlistService.removeFromWishlist(user, productId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            logger.error("Error removing from wishlist for user: {}", email, e);
            return ResponseEntity.status(404).body("User or product not found");
        } catch (Exception e) {
            logger.error("Unexpected error removing from wishlist for user: {}", email, e);
            return ResponseEntity.status(500).body("Internal server error");
        }
    }
}
