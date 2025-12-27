package com.eduprajna.Controller;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eduprajna.entity.Product;
import com.eduprajna.entity.User;
import com.eduprajna.service.ProductService;
import com.eduprajna.service.UserService;

/**
 * Development controller for seeding the database with sample data
 * WARNING: Only use in development/testing environments
 */
@RestController
@RequestMapping("/api/dev")
@CrossOrigin(origins = { "http://localhost:3000", "http://127.0.0.1:3000",
        "https://nishmitha-pet-co.vercel.app" }, allowCredentials = "true")
public class DevController {

    private static final Logger logger = LoggerFactory.getLogger(DevController.class);

    private final UserService userService;
    private final ProductService productService;

    public DevController(UserService userService, ProductService productService) {
        this.userService = userService;
        this.productService = productService;
    }

    /**
     * Seed the database with sample users from the original MySQL dump
     * This endpoint creates the admin and test user accounts
     */
    @PostMapping("/seed-users")
    public ResponseEntity<?> seedUsers() {
        try {
            logger.info("Starting database seeding with sample users...");

            // Check if admin user already exists
            if (userService.findByEmail("admin@petco.com").isPresent()) {
                logger.info("Sample users already exist, skipping seeding");
                return ResponseEntity.ok(Map.of(
                        "message", "Sample users already exist",
                        "admin_email", "admin@petco.com",
                        "user_email", "nishu@gmail.com"));
            }

            // Create admin user (from MySQL dump)
            User admin = new User();
            admin.setEmail("admin@petco.com");
            admin.setName("Admin");
            admin.setPasswordHash("admin123"); // In production, this should be hashed
            admin.setPhone("9845651468");
            admin.setRole("ADMIN");
            admin.setIsActive(true);
            admin.setLoyaltyPoints(0);
            admin.setTotalOrders(0);
            admin.setMemberSince(LocalDate.of(2025, 9, 24));
            admin.setCreatedAt(OffsetDateTime.of(2025, 9, 24, 10, 35, 10, 0, OffsetDateTime.now().getOffset()));
            admin.setUpdatedAt(OffsetDateTime.of(2025, 9, 24, 10, 35, 10, 0, OffsetDateTime.now().getOffset()));
            admin.setLastPasswordChange(
                    OffsetDateTime.of(2025, 9, 24, 10, 35, 10, 0, OffsetDateTime.now().getOffset()));

            // Create test user (from MySQL dump)
            User testUser = new User();
            testUser.setEmail("nishu@gmail.com");
            testUser.setName("S");
            testUser.setPasswordHash("1234"); // In production, this should be hashed
            testUser.setPhone("9845651468");
            testUser.setRole("user");
            testUser.setGender("Female");
            testUser.setDateOfBirth(LocalDate.of(2001, 7, 18));
            testUser.setIsActive(true);
            testUser.setLoyaltyPoints(0);
            testUser.setTotalOrders(3);
            testUser.setMemberSince(LocalDate.of(2025, 9, 24));
            testUser.setCreatedAt(
                    OffsetDateTime.of(2025, 9, 24, 5, 10, 28, 779408000, OffsetDateTime.now().getOffset()));
            testUser.setUpdatedAt(
                    OffsetDateTime.of(2025, 9, 29, 11, 17, 10, 416344000, OffsetDateTime.now().getOffset()));
            testUser.setLastPasswordChange(
                    OffsetDateTime.of(2025, 9, 27, 7, 33, 58, 236364000, OffsetDateTime.now().getOffset()));

            // Save users
            User savedAdmin = userService.save(admin);
            User savedUser = userService.save(testUser);

            logger.info("Successfully seeded database with {} users", 2);

            return ResponseEntity.ok(Map.of(
                    "message", "Database seeded successfully",
                    "users_created", 2,
                    "admin_user", Map.of(
                            "id", savedAdmin.getId(),
                            "email", savedAdmin.getEmail(),
                            "role", savedAdmin.getRole()),
                    "test_user", Map.of(
                            "id", savedUser.getId(),
                            "email", savedUser.getEmail(),
                            "role", savedUser.getRole())));

        } catch (Exception e) {
            logger.error("Error seeding database", e);
            return ResponseEntity.status(500).body(Map.of(
                    "error", "Failed to seed database",
                    "message", e.getMessage()));
        }
    }

    /**
     * Get current database status
     */
    @GetMapping("/status")
    public ResponseEntity<?> getDatabaseStatus() {
        try {
            long userCount = userService.count();
            boolean hasAdmin = userService.findByEmail("admin@petco.com").isPresent();
            boolean hasTestUser = userService.findByEmail("nishu@gmail.com").isPresent();

            return ResponseEntity.ok(Map.of(
                    "total_users", userCount,
                    "has_admin_user", hasAdmin,
                    "has_test_user", hasTestUser,
                    "database_ready", hasAdmin && hasTestUser));
        } catch (Exception e) {
            logger.error("Error checking database status", e);
            return ResponseEntity.status(500).body(Map.of(
                    "error", "Failed to check database status",
                    "message", e.getMessage()));
        }
    }

    /**
     * Create sample products for testing
     */
    @PostMapping("/seed-products")
    public ResponseEntity<?> seedProducts() {
        try {
            logger.info("Creating sample products for testing...");

            // Create sample products with different stock scenarios
            createSampleProduct(60L, "Royal Canin Maxi Adult Dog Food", "Premium dog food for large breed dogs", 2499.0,
                    50, true);
            createSampleProduct(61L, "Whiskas Ocean Fish Cat Food", "Delicious cat food with ocean fish flavor", 149.0,
                    100, true);
            createSampleProduct(62L, "Pedigree Adult Dog Food", "Complete nutrition for adult dogs", 499.0, null, true); // Unlimited
                                                                                                                         // stock
            createSampleProduct(63L, "Royal Canin Persian Cat Food", "Specialized food for Persian cats", 1299.0, 0,
                    false); // Out of stock
            createSampleProduct(64L, "Hills Science Diet", "Veterinary recommended dog food", 3499.0, 5, true); // Low
                                                                                                                // stock

            return ResponseEntity.ok(Map.of(
                    "message", "Sample products created successfully",
                    "products_created", 5));

        } catch (Exception e) {
            logger.error("Error creating sample products", e);
            return ResponseEntity.status(500).body(Map.of(
                    "error", "Failed to create sample products",
                    "message", e.getMessage()));
        }
    }

    private void createSampleProduct(Long id, String name, String description, Double price, Integer stockQuantity,
            Boolean inStock) {
        // Check if product already exists
        Product existing = productService.getById(id);
        if (existing != null) {
            logger.info("Product {} already exists, updating stock info", id);
            existing.setStockQuantity(stockQuantity);
            existing.setInStock(inStock);
            productService.save(existing);
        } else {
            Product product = new Product();
            product.setId(id);
            product.setName(name);
            product.setDescription(description);
            product.setPrice(price);
            product.setOriginalPrice(price + 100.0);
            product.setCategory("dog");
            product.setSubcategory("food");
            product.setStockQuantity(stockQuantity);
            product.setInStock(inStock);
            product.setIsActive(true);
            product.setBrand("Test Brand");
            product.setWeight("1kg");
            product.setImageUrl("/api/admin/products/images/default-product.jpg");
            productService.save(product);
            logger.info("Created sample product: {} with stock: {}, inStock: {}", name, stockQuantity, inStock);
        }
    }

    /**
     * Easy way to seed users via GET request for debugging
     */
    @GetMapping("/seed-users-get")
    public ResponseEntity<?> seedUsersGet() {
        return seedUsers();
    }
}