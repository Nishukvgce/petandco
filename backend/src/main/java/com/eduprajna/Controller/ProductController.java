package com.eduprajna.Controller;

import java.io.IOException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.eduprajna.entity.Product;
import com.eduprajna.service.ProductService;
import com.eduprajna.service.StorageService;

@RestController
@RequestMapping("/api/admin/products")
// Allow local dev, Vercel preview and production frontend domains
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000", "https://nishmitha-pet-co.vercel.app", "https://pet-cotraditional.in", "https://www.pet-cotraditional.in"}, allowCredentials = "true")

public class ProductController {
    private final Logger log = LoggerFactory.getLogger(ProductController.class);
    
    @Autowired
    private ProductService productService;

    @Autowired
    private StorageService storageService;

    @Autowired
    private com.eduprajna.service.CloudinaryStorageService cloudinaryStorageService;
    
    // Customer-facing endpoint that filters out-of-stock products
    @GetMapping("/customer")
    public ResponseEntity<List<Product>> getCustomerProducts(
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "sub", required = false) String sub,
            @RequestParam(value = "type", required = false) String type,
            @RequestParam(value = "petType", required = false) String petType
    ) {
        // Normalize type parameter (prioritize 'type' over 'petType')
        String effectiveType = normalizeTypeParameter(type, petType);
        
        // Normalize category and subcategory parameters
        String normalizedCategory = normalizeParameter(category);
        String normalizedSub = normalizeParameter(sub);
        
        log.info("ProductController: Customer request - type: '{}', category: '{}', sub: '{}'", 
                effectiveType, normalizedCategory, normalizedSub);
        
        List<Product> products = getFilteredProductsWithType(normalizedCategory, normalizedSub, effectiveType);
        
        // Filter out products that are completely out of stock
        List<Product> inStockProducts = products.stream()
            .filter(this::hasAvailableStock)
            .collect(Collectors.toList());
            
        // Enrich all products with metadata for frontend display
        inStockProducts.forEach(this::enrichProductMetadata);
        
        log.info("ProductController: Returning {} in-stock products out of {} total products for customers", 
                inStockProducts.size(), products.size());
                
        return ResponseEntity.ok()
            .cacheControl(CacheControl.maxAge(5, TimeUnit.MINUTES))
            .body(inStockProducts);
    }
    
    // Enhanced filtering method that handles type-first filtering
    private List<Product> getFilteredProductsWithType(String category, String sub, String type) {
        List<Product> products;
        
        try {
            log.info("ProductController: Filtering products - type: '{}', category: '{}', sub: '{}'", 
                    type, category, sub);
            
            // Type-first filtering: if type provided, filter by type first
            if (type != null && !type.isBlank()) {
                products = productService.getFilteredProductsByType(type, category, sub);
                log.info("ProductController: Type-filtered query returned {} products", products.size());
                
                // If no products found with strict type filtering, try fallback strategies
                if (products.isEmpty()) {
                    log.info("ProductController: No products found by type '{}', trying category-based fallback", type);
                    
                    List<Product> allProducts = productService.getAll();
                    
                    if ("Pharmacy".equalsIgnoreCase(type)) {
                        // Fallback: find products by pharmacy-related categories
                        products = allProducts.stream()
                            .filter(p -> isPharmacyProduct(p, category, sub))
                            .collect(Collectors.toList());
                    } else if ("Dog".equalsIgnoreCase(type)) {
                        // Fallback: find products by dog-related categories or metadata
                        products = allProducts.stream()
                            .filter(p -> isDogProduct(p, category, sub))
                            .collect(Collectors.toList());
                    } else if ("Cat".equalsIgnoreCase(type)) {
                        // Fallback: find products by cat-related categories or metadata
                        products = allProducts.stream()
                            .filter(p -> isCatProduct(p, category, sub))
                            .collect(Collectors.toList());
                    } else if ("Outlet".equalsIgnoreCase(type)) {
                        // Fallback: find products by outlet-related categories or metadata
                        products = allProducts.stream()
                            .filter(p -> isOutletProduct(p, category, sub))
                            .collect(Collectors.toList());
                    }
                        
                    log.info("ProductController: Fallback strategy found {} products", products.size());
                }
            } else {
                // Fallback to category/subcategory filtering
                products = productService.getFilteredProducts(category, sub);
                log.info("ProductController: Category-filtered query returned {} products", products.size());
            }
            
            return products;
        } catch (Exception e) {
            log.error("ProductController: Error filtering products", e);
            return productService.getAll();
        }
    }
    
    // Helper method to identify pharmacy products by category patterns
    private boolean isPharmacyProduct(Product p, String category, String sub) {
        if (p == null || !Boolean.TRUE.equals(p.getIsActive())) return false;
        
        // Check if product type is pharmacy
        if ("Pharmacy".equalsIgnoreCase(p.getType())) return true;
        
        // Check metadata for pharmacy indicators
        Map<String, Object> metadata = p.getMetadata();
        if (metadata != null) {
            Object metaType = metadata.get("type");
            Object petType = metadata.get("petType");
            if ("Pharmacy".equalsIgnoreCase(String.valueOf(metaType)) || 
                "Pharmacy".equalsIgnoreCase(String.valueOf(petType))) {
                return true;
            }
        }
        
        // Check category patterns for pharmacy products
        String productCategory = p.getCategory();
        String productSubcategory = p.getSubcategory();
        
        if (productCategory != null) {
            String catLower = productCategory.toLowerCase();
            if (catLower.contains("pharmacy") || catLower.contains("medicine") || 
                catLower.contains("supplement") || catLower.contains("prescription")) {
                
                // If specific category/subcategory filters provided, check them
                if (category != null && !category.isBlank()) {
                    if (!productCategory.toLowerCase().contains(category.toLowerCase())) {
                        return false;
                    }
                }
                
                if (sub != null && !sub.isBlank() && productSubcategory != null) {
                    if (!productSubcategory.toLowerCase().contains(sub.toLowerCase())) {
                        return false;
                    }
                }
                
                return true;
            }
        }
        
        return false;
    }
    
    // Helper method to identify dog products
    private boolean isDogProduct(Product p, String category, String sub) {
        if (p == null || !Boolean.TRUE.equals(p.getIsActive())) return false;
        
        // Check if product type is dog
        if ("Dog".equalsIgnoreCase(p.getType())) return true;
        
        // Check metadata for dog indicators
        Map<String, Object> metadata = p.getMetadata();
        if (metadata != null) {
            Object metaType = metadata.get("type");
            Object petType = metadata.get("petType");
            if ("Dog".equalsIgnoreCase(String.valueOf(metaType)) || 
                "Dog".equalsIgnoreCase(String.valueOf(petType))) {
                return matchesCategoryAndSub(p, category, sub);
            }
        }
        
        // Check category patterns for dog products
        String productCategory = p.getCategory();
        if (productCategory != null && productCategory.toLowerCase().contains("dog")) {
            return matchesCategoryAndSub(p, category, sub);
        }
        
        return false;
    }
    
    // Helper method to identify cat products
    private boolean isCatProduct(Product p, String category, String sub) {
        if (p == null || !Boolean.TRUE.equals(p.getIsActive())) return false;
        
        // Check if product type is cat
        if ("Cat".equalsIgnoreCase(p.getType())) return true;
        
        // Check metadata for cat indicators
        Map<String, Object> metadata = p.getMetadata();
        if (metadata != null) {
            Object metaType = metadata.get("type");
            Object petType = metadata.get("petType");
            if ("Cat".equalsIgnoreCase(String.valueOf(metaType)) || 
                "Cat".equalsIgnoreCase(String.valueOf(petType))) {
                return matchesCategoryAndSub(p, category, sub);
            }
        }
        
        // Check category patterns for cat products
        String productCategory = p.getCategory();
        if (productCategory != null && productCategory.toLowerCase().contains("cat")) {
            return matchesCategoryAndSub(p, category, sub);
        }
        
        return false;
    }
    
    // Helper method to identify outlet products
    private boolean isOutletProduct(Product p, String category, String sub) {
        if (p == null || !Boolean.TRUE.equals(p.getIsActive())) return false;
        
        // Check if product type is outlet
        if ("Outlet".equalsIgnoreCase(p.getType())) return true;
        
        // Check metadata for outlet indicators
        Map<String, Object> metadata = p.getMetadata();
        if (metadata != null) {
            Object metaType = metadata.get("type");
            Object petType = metadata.get("petType");
            if ("Outlet".equalsIgnoreCase(String.valueOf(metaType)) || 
                "Outlet".equalsIgnoreCase(String.valueOf(petType))) {
                return matchesCategoryAndSub(p, category, sub);
            }
        }
        
        return false;
    }
    
    // Helper method to check category and subcategory matching
    private boolean matchesCategoryAndSub(Product p, String category, String sub) {
        String productCategory = p.getCategory();
        String productSubcategory = p.getSubcategory();
        
        // If specific category filter provided, check it
        if (category != null && !category.isBlank() && productCategory != null) {
            if (!productCategory.toLowerCase().contains(category.toLowerCase())) {
                return false;
            }
        }
        
        // If specific subcategory filter provided, check it
        if (sub != null && !sub.isBlank() && productSubcategory != null) {
            if (!productSubcategory.toLowerCase().contains(sub.toLowerCase())) {
                return false;
            }
        }
        
        return true;
    }
    
    private List<Product> getFilteredProducts(String category, String sub) {
        List<Product> products;
        
        try {
            // Properly decode URL parameters to handle %20, +, and other encoded characters
            String decodedCategory = null;
            String decodedSub = null;
            
            if (category != null && !category.isBlank()) {
                decodedCategory = URLDecoder.decode(category, StandardCharsets.UTF_8);
                log.info("ProductController: Original category='{}', decoded category='{}'", category, decodedCategory);
            }
            
            if (sub != null && !sub.isBlank()) {
                decodedSub = URLDecoder.decode(sub, StandardCharsets.UTF_8);
                log.info("ProductController: Original sub='{}', decoded sub='{}'", sub, decodedSub);
            }
            
            // Use database-level filtering for better performance
            if ((decodedCategory != null && !decodedCategory.isBlank()) || (decodedSub != null && !decodedSub.isBlank())) {
                products = productService.getFilteredProducts(decodedCategory, decodedSub);
            } else {
                products = productService.getAll();
            }
            
            return products;
        } catch (Exception e) {
            log.error("ProductController: Error processing customer product request", e);
            return productService.getAll();
        }
    }

    // Overload to support type-based filtering (e.g., OUTLET)
    private List<Product> getFilteredProducts(String category, String sub, String type) {
        // Type-first filtering: if type provided, filter strictly by product.type or metadata petType/type equality
        List<Product> base = getFilteredProducts(category, sub);
        if (type == null || type.isBlank()) return base;

        final String typeParam = type.toLowerCase();
        List<Product> typed = base.stream().filter(p -> matchesTypeStrict(p, typeParam)).collect(Collectors.toList());
        return typed;
    }
    
    private boolean hasAvailableStock(Product product) {
        // Check if product is active and marked as in stock
        if (product.getIsActive() == null || !product.getIsActive() || 
            product.getInStock() == null || !product.getInStock()) {
            return false;
        }
        
        // If product has variants, check if any variant has stock
        if (product.hasVariants()) {
            return product.getVariants().stream()
                .anyMatch(variant -> {
                    Object stockObj = variant.get("stock");
                    if (stockObj instanceof Number) {
                        return ((Number) stockObj).intValue() > 0;
                    } else if (stockObj instanceof String) {
                        try {
                            return Integer.parseInt((String) stockObj) > 0;
                        } catch (NumberFormatException e) {
                            return false;
                        }
                    }
                    return false;
                });
        }
        
        // For non-variant products, check main stock quantity
        return product.getStockQuantity() != null && product.getStockQuantity() > 0;
    }
    
    @GetMapping
    public ResponseEntity<List<Product>> getAll(
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "sub", required = false) String sub,
            @RequestParam(value = "type", required = false) String type,
            @RequestParam(value = "petType", required = false) String petType
    ) {
        // Normalize type parameter (prioritize 'type' over 'petType')
        String effectiveType = normalizeTypeParameter(type, petType);
        
        // Normalize category and subcategory parameters
        String normalizedCategory = normalizeParameter(category);
        String normalizedSub = normalizeParameter(sub);
        
        log.info("ProductController: Admin request - type: '{}', category: '{}', sub: '{}'", 
                effectiveType, normalizedCategory, normalizedSub);
        
        List<Product> products = getFilteredProductsWithType(normalizedCategory, normalizedSub, effectiveType);
        
        // Enrich all products with metadata for frontend display
        products.forEach(this::enrichProductMetadata);
        
        log.info("ProductController: Returning {} products for admin panel", products.size());
        
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(30, TimeUnit.SECONDS).cachePublic())
                .body(products);
    }

    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> testEndpoint() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Backend is working!");
        response.put("timestamp", java.time.LocalDateTime.now().toString());
        
        List<Product> allProducts = productService.getAll();
        response.put("totalProducts", allProducts.size());
        
        // Debug: Show some sample products and their types
        List<Map<String, Object>> sampleProducts = new ArrayList<>();
        allProducts.stream().limit(5).forEach(p -> {
            Map<String, Object> productInfo = new HashMap<>();
            productInfo.put("id", p.getId());
            productInfo.put("name", p.getName());
            productInfo.put("type", p.getType());
            productInfo.put("category", p.getCategory());
            productInfo.put("subcategory", p.getSubcategory());
            
            // Check metadata for type info as well
            Map<String, Object> metadata = p.getMetadata();
            if (metadata != null) {
                productInfo.put("metadataType", metadata.get("type"));
                productInfo.put("metadataPetType", metadata.get("petType"));
            }
            
            sampleProducts.add(productInfo);
        });
        response.put("sampleProducts", sampleProducts);
        
        // Count by type
        Map<String, Long> typeCount = new HashMap<>();
        allProducts.forEach(p -> {
            String type = p.getType();
            if (type == null || type.isBlank()) {
                // Check metadata
                Map<String, Object> metadata = p.getMetadata();
                if (metadata != null) {
                    Object metaType = metadata.get("type");
                    Object petType = metadata.get("petType");
                    type = metaType != null ? metaType.toString() : 
                           (petType != null ? petType.toString() : "null");
                }
                if (type == null || type.isBlank()) type = "null";
            }
            typeCount.put(type, typeCount.getOrDefault(type, 0L) + 1);
        });
        response.put("typeDistribution", typeCount);
        
        return ResponseEntity.ok(response);
    }
    
    // Debug endpoint specifically for pharmacy products
    @GetMapping("/debug/pharmacy")
    public ResponseEntity<Map<String, Object>> debugPharmacyProducts() {
        Map<String, Object> response = new HashMap<>();
        
        // Get all products
        List<Product> allProducts = productService.getAll();
        
        // Find products that might be pharmacy products
        List<Product> pharmacyByType = allProducts.stream()
            .filter(p -> "Pharmacy".equalsIgnoreCase(p.getType()))
            .collect(Collectors.toList());
            
        List<Product> pharmacyByCategory = allProducts.stream()
            .filter(p -> {
                String cat = p.getCategory();
                return cat != null && (
                    cat.toLowerCase().contains("pharmacy") ||
                    cat.toLowerCase().contains("medicine") ||
                    cat.toLowerCase().contains("supplement")
                );
            })
            .collect(Collectors.toList());
            
        List<Product> pharmacyByMetadata = allProducts.stream()
            .filter(p -> {
                Map<String, Object> metadata = p.getMetadata();
                if (metadata == null) return false;
                Object type = metadata.get("type");
                Object petType = metadata.get("petType");
                return ("Pharmacy".equalsIgnoreCase(String.valueOf(type))) ||
                       ("Pharmacy".equalsIgnoreCase(String.valueOf(petType)));
            })
            .collect(Collectors.toList());
        
        response.put("totalProducts", allProducts.size());
        response.put("pharmacyByType", pharmacyByType.size());
        response.put("pharmacyByCategory", pharmacyByCategory.size());
        response.put("pharmacyByMetadata", pharmacyByMetadata.size());
        
        // Show details of potential pharmacy products
        List<Map<String, Object>> potentialPharmacy = new ArrayList<>();
        pharmacyByCategory.stream().limit(10).forEach(p -> {
            Map<String, Object> info = new HashMap<>();
            info.put("id", p.getId());
            info.put("name", p.getName());
            info.put("type", p.getType());
            info.put("category", p.getCategory());
            info.put("subcategory", p.getSubcategory());
            info.put("isActive", p.getIsActive());
            info.put("inStock", p.getInStock());
            
            Map<String, Object> metadata = p.getMetadata();
            if (metadata != null) {
                info.put("metadataKeys", new ArrayList<>(metadata.keySet()));
                info.put("metadataType", metadata.get("type"));
                info.put("metadataPetType", metadata.get("petType"));
            }
            potentialPharmacy.add(info);
        });
        response.put("potentialPharmacyProducts", potentialPharmacy);
        
        return ResponseEntity.ok(response);
    }
    
    // Helper method to normalize type parameters with priority
    private String normalizeTypeParameter(String type, String petType) {
        if (type != null && !type.isBlank()) {
            return normalizeParameter(type);
        }
        if (petType != null && !petType.isBlank()) {
            return normalizeParameter(petType);
        }
        return null;
    }
    
    // Helper method to normalize and decode URL parameters
    private String normalizeParameter(String param) {
        if (param == null || param.isBlank()) {
            return null;
        }
        
        try {
            // Decode URL parameters and normalize
            String decoded = URLDecoder.decode(param, StandardCharsets.UTF_8);
            
            // Apply normalization mappings
            return normalizeParameterValue(decoded.trim());
        } catch (Exception e) {
            log.warn("ProductController: Failed to decode parameter '{}': {}", param, e.getMessage());
            return normalizeParameterValue(param.trim());
        }
    }
    
    // Helper method to apply parameter value normalization
    private String normalizeParameterValue(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        
        String normalized = value.toLowerCase().trim();
        
        // Type normalization
        switch (normalized) {
            case "dog":
            case "dogs":
            case "canine":
                return "Dog";
            case "cat":
            case "cats":
            case "feline":
                return "Cat";
            case "pharmacy":
            case "medicine":
            case "medical":
                return "Pharmacy";
            case "outlet":
            case "clearance":
                return "Outlet";
        }
        
        // Category normalization
        switch (normalized) {
            case "dog-food":
            case "dogfood":
            case "food":
                return "Dog Food";
            case "cat-food":
            case "catfood":
                return "Cat Food";
            case "dog-treats":
            case "dogtreats":
            case "treats":
                return "Dog Treats";
            case "cat-treats":
            case "cattreats":
                return "Cat Treats";
            case "dog-toys":
            case "dogtoys":
            case "toys":
                return "Dog Toys";
            case "cat-toys":
            case "cattoys":
                return "Cat Toys";
            case "dog-grooming":
            case "doggrooming":
            case "grooming":
                return "Dog Grooming";
            case "cat-grooming":
            case "catgrooming":
                return "Cat Grooming";
        }
        
        // Subcategory normalization
        switch (normalized) {
            case "dry":
            case "dry-food":
                return "Dry Food";
            case "wet":
            case "wet-food":
                return "Wet Food";
            case "grain-free":
            case "grainfree":
                return "Grain Free";
            case "puppy":
            case "puppy-food":
                return "Puppy Food";
            case "kitten":
            case "kitten-food":
                return "Kitten Food";
            case "hypoallergenic":
            case "hypo":
                return "Hypoallergenic";
            case "veterinary":
            case "vet":
            case "veterinary-food":
                return "Veterinary Food";
            case "chicken-free":
            case "chickenfree":
                return "Chicken Free";
            default:
                // Return title case for unknown values
                return toTitleCase(value);
        }
    }
    
    // Helper method to convert string to title case
    private String toTitleCase(String input) {
        if (input == null || input.isEmpty()) {
            return input;
        }
        
        return Arrays.stream(input.split("\\s+"))
            .map(word -> word.substring(0, 1).toUpperCase() + word.substring(1).toLowerCase())
            .collect(Collectors.joining(" "));
    }

    
    private boolean listContainsIgnoreCase(Object maybeList, String needle) {
        if (maybeList == null) return false;
        if (maybeList instanceof java.util.List) {
            for (Object o : (java.util.List<?>) maybeList) {
                if (o != null && o.toString().toLowerCase().contains(needle)) return true;
            }
        } else {
            return maybeList.toString().toLowerCase().contains(needle);
        }
        return false;
    }

    @SuppressWarnings({"rawtypes","unchecked"})
    private boolean matchesCategory(Product p, String catParam) {
        if (p == null) return false;
        if (p.getCategory() != null && p.getCategory().toLowerCase().contains(catParam)) return true;
        Map<String, Object> md = p.getMetadata();
        if (md != null) {
            Object petType = md.get("petType");
            if (petType != null && petType.toString().toLowerCase().contains(catParam)) return true;

            Object filters = md.get("filters");
            if (filters instanceof Map) {
                Map f = (Map) filters;
                for (Object k : f.keySet()) {
                    Object v = f.get(k);
                    if (listContainsIgnoreCase(v, catParam)) return true;
                }
            }
        }
        return false;
    }

    @SuppressWarnings({"rawtypes","unchecked"})
    private boolean matchesSubcategory(Product p, String subParam) {
        if (p == null) return false;
        if (p.getSubcategory() != null && p.getSubcategory().toLowerCase().contains(subParam)) return true;
        Map<String, Object> md = p.getMetadata();
        if (md != null) {
            Object label = md.get("subcategoryLabel");
            if (label != null && label.toString().toLowerCase().contains(subParam)) return true;

            Object filters = md.get("filters");
            if (filters instanceof Map) {
                Map f = (Map) filters;
                for (Object k : f.keySet()) {
                    String key = k == null ? "" : k.toString().toLowerCase();
                    if (key.contains("sub")) {
                        Object v = f.get(k);
                        if (listContainsIgnoreCase(v, subParam)) return true;
                    }
                }
            }
        }
        return false;
    }

    // Determine whether product matches a requested type (dog/cat/pharmacy/outlet)
    @SuppressWarnings({"rawtypes"})
    private boolean matchesTypeStrict(Product p, String typeParam) {
        if (p == null) return false;
        try {
            // Strict: check dedicated column, then metadata equality only
            if (p.getType() != null && p.getType().equalsIgnoreCase(typeParam)) return true;
            Map<String, Object> md = p.getMetadata();
            if (md != null) {
                Object pt = md.get("petType");
                if (pt != null && pt.toString().equalsIgnoreCase(typeParam)) return true;
                Object t = md.get("type");
                if (t != null && t.toString().equalsIgnoreCase(typeParam)) return true;
            }
        } catch (Exception ignored) { }
        return false;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getById(@PathVariable Long id) {
        Product p = productService.getById(id);
        if (p == null) return ResponseEntity.notFound().build();
        
        // Enrich metadata with column values for frontend editing
        enrichProductMetadata(p);
        
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(30, TimeUnit.SECONDS).cachePublic())
                .body(p);
    }
    
    // Enrich product metadata with values from separate columns for frontend compatibility
    @SuppressWarnings("unchecked")
    private void enrichProductMetadata(Product p) {
        if (p == null) return;
        try {
            Map<String, Object> md = p.getMetadata();
            if (md == null) md = new HashMap<>();
            
            // Add foodType to metadata if not present (for frontend reading)
            if (p.getFoodType() != null && !p.getFoodType().isBlank()) {
                md.put("foodType", p.getFoodType());
            }
            
            // Add features to metadata (parse JSON string back to array)
            // Always populate from column to ensure array format
            if (p.getFeatures() != null && !p.getFeatures().isBlank()) {
                try {
                    // Parse JSON array string ["item1", "item2"] back to List
                    String featuresJson = p.getFeatures();
                    if (featuresJson.startsWith("[") && featuresJson.endsWith("]")) {
                        List<String> featuresList = new ArrayList<>();
                        String content = featuresJson.substring(1, featuresJson.length() - 1);
                        if (!content.isBlank()) {
                            // Simple JSON array parser
                            String[] items = content.split("\",\\s*\"");
                            for (String item : items) {
                                String cleaned = item.replace("\"", "").trim();
                                if (!cleaned.isEmpty()) {
                                    featuresList.add(cleaned);
                                }
                            }
                        }
                        md.put("features", featuresList);
                    } else {
                        // If it's not a JSON array, wrap the string in a list
                        List<String> featuresList = new ArrayList<>();
                        featuresList.add(featuresJson);
                        md.put("features", featuresList);
                    }
                } catch (Exception e) {
                    try { log.warn("Failed to parse features JSON: {}", e.getMessage()); } catch (Exception ignored) {}
                    // On error, ensure we still set an empty array
                    if (!md.containsKey("features")) {
                        md.put("features", new ArrayList<>());
                    }
                }
            } else {
                // Ensure features is always an array, even if empty
                if (!md.containsKey("features")) {
                    md.put("features", new ArrayList<>());
                }
            }
            
            // Add nutrition to metadata if not present
            Map<String, String> nutrition = new HashMap<>();
            if (p.getNutritionProtein() != null && !p.getNutritionProtein().isBlank()) {
                nutrition.put("protein", p.getNutritionProtein());
            }
            if (p.getNutritionFat() != null && !p.getNutritionFat().isBlank()) {
                nutrition.put("fat", p.getNutritionFat());
            }
            if (p.getNutritionFiber() != null && !p.getNutritionFiber().isBlank()) {
                nutrition.put("fiber", p.getNutritionFiber());
            }
            if (p.getNutritionMoisture() != null && !p.getNutritionMoisture().isBlank()) {
                nutrition.put("moisture", p.getNutritionMoisture());
            }
            if (p.getNutritionAsh() != null && !p.getNutritionAsh().isBlank()) {
                nutrition.put("ash", p.getNutritionAsh());
            }
            if (p.getNutritionCalories() != null && !p.getNutritionCalories().isBlank()) {
                nutrition.put("calories", p.getNutritionCalories());
            }
            if (!nutrition.isEmpty()) {
                md.put("nutrition", nutrition);
            }
            
            // Add pet-specific and product attribute fields to metadata
            if (p.getPetType() != null && !p.getPetType().isBlank()) {
                md.put("petType", p.getPetType());
            }
            if (p.getMaterial() != null && !p.getMaterial().isBlank()) {
                md.put("material", p.getMaterial());
            }
            if (p.getScent() != null && !p.getScent().isBlank()) {
                md.put("scent", p.getScent());
            }
            if (p.getSuitableFor() != null && !p.getSuitableFor().isBlank()) {
                md.put("suitableFor", p.getSuitableFor());
            }
            if (p.getTreatType() != null && !p.getTreatType().isBlank()) {
                md.put("treatType", p.getTreatType());
            }
            if (p.getTexture() != null && !p.getTexture().isBlank()) {
                md.put("texture", p.getTexture());
            }
            if (p.getSubcategoryLabel() != null && !p.getSubcategoryLabel().isBlank()) {
                md.put("subcategoryLabel", p.getSubcategoryLabel());
            }
            if (p.getServingSize() != null && !p.getServingSize().isBlank()) {
                md.put("servingSize", p.getServingSize());
            }
            if (p.getPackCount() != null && !p.getPackCount().isBlank()) {
                md.put("packCount", p.getPackCount());
            }
            if (p.getWeightUnit() != null && !p.getWeightUnit().isBlank()) {
                md.put("weightUnit", p.getWeightUnit());
            }
            
            // Add flavors and colors (parse if JSON array string)
            if (p.getFlavors() != null && !p.getFlavors().isBlank()) {
                try {
                    String flavorsStr = p.getFlavors();
                    if (flavorsStr.startsWith("[") && flavorsStr.endsWith("]")) {
                        // Parse JSON array
                        List<String> flavorsList = new ArrayList<>();
                        String content = flavorsStr.substring(1, flavorsStr.length() - 1);
                        if (!content.isBlank()) {
                            String[] items = content.split("\",\\s*\"");
                            for (String item : items) {
                                String cleaned = item.replace("\"", "").trim();
                                if (!cleaned.isEmpty()) {
                                    flavorsList.add(cleaned);
                                }
                            }
                        }
                        md.put("flavors", flavorsList);
                    } else {
                        md.put("flavors", flavorsStr);
                    }
                } catch (Exception e) {
                    md.put("flavors", p.getFlavors());
                }
            }
            
            if (p.getColors() != null && !p.getColors().isBlank()) {
                try {
                    String colorsStr = p.getColors();
                    if (colorsStr.startsWith("[") && colorsStr.endsWith("]")) {
                        // Parse JSON array
                        List<String> colorsList = new ArrayList<>();
                        String content = colorsStr.substring(1, colorsStr.length() - 1);
                        if (!content.isBlank()) {
                            String[] items = content.split("\",\\s*\"");
                            for (String item : items) {
                                String cleaned = item.replace("\"", "").trim();
                                if (!cleaned.isEmpty()) {
                                    colorsList.add(cleaned);
                                }
                            }
                        }
                        md.put("colors", colorsList);
                    } else {
                        md.put("colors", colorsStr);
                    }
                } catch (Exception e) {
                    md.put("colors", p.getColors());
                }
            }
            
            // Add pharmacy fields to metadata
            Map<String, Object> pharmacy = new HashMap<>();
            if (p.getPrescriptionRequired() != null) {
                pharmacy.put("prescriptionRequired", p.getPrescriptionRequired());
            }
            if (p.getDosageForm() != null && !p.getDosageForm().isBlank()) {
                pharmacy.put("dosageForm", p.getDosageForm());
            }
            if (p.getStrength() != null && !p.getStrength().isBlank()) {
                pharmacy.put("strength", p.getStrength());
            }
            if (p.getActiveIngredient() != null && !p.getActiveIngredient().isBlank()) {
                pharmacy.put("activeIngredient", p.getActiveIngredient());
            }
            if (p.getManufacturer() != null && !p.getManufacturer().isBlank()) {
                pharmacy.put("manufacturer", p.getManufacturer());
            }
            if (p.getIndications() != null && !p.getIndications().isBlank()) {
                pharmacy.put("indications", p.getIndications());
            }
            if (p.getContraindications() != null && !p.getContraindications().isBlank()) {
                pharmacy.put("contraindications", p.getContraindications());
            }
            if (p.getExpiryDate() != null && !p.getExpiryDate().isBlank()) {
                pharmacy.put("expiryDate", p.getExpiryDate());
            }
            if (!pharmacy.isEmpty()) {
                md.put("pharmacy", pharmacy);
            }
            
            // Ensure variants are present and properly formatted
            Object variantsObj = md.get("variants");
            if (variantsObj instanceof List) {
                List<?> variantsList = (List<?>) variantsObj;
                try {
                    log.debug("Product {} has {} variants in metadata", p.getId(), variantsList.size());
                    
                    // Log variant details for debugging
                    for (int i = 0; i < variantsList.size() && i < 3; i++) {
                        Object variant = variantsList.get(i);
                        if (variant instanceof Map) {
                            Map<?, ?> variantMap = (Map<?, ?>) variant;
                            log.debug("Variant {}: id={}, weight/size={}/{}, price={}, stock={}", 
                                i + 1,
                                variantMap.get("id"),
                                variantMap.get("weight"),
                                variantMap.get("size"),
                                variantMap.get("price"),
                                variantMap.get("stock"));
                        }
                    }
                } catch (Exception ignored) {}
            } else {
                // No variants found - log warning if stock is > 0
                if (p.getStockQuantity() != null && p.getStockQuantity() > 0) {
                    try {
                        log.warn("Product {} has stock ({}) but no variants in metadata", 
                            p.getId(), p.getStockQuantity());
                    } catch (Exception ignored) {}
                }
            }
            
            // Update metadata
            p.setMetadata(md);
        } catch (Exception e) {
            try { log.warn("Failed to enrich product metadata for product {}: {}", 
                p.getId(), e.getMessage()); } catch (Exception ignored) {}
        }
    }

    @GetMapping("/{id}/stock")
    public ResponseEntity<Map<String, Object>> getStockInfo(@PathVariable Long id) {
        Product p = productService.getById(id);
        if (p == null) return ResponseEntity.notFound().build();
        
        Map<String, Object> stockInfo = new HashMap<>();
        stockInfo.put("productId", p.getId());
        stockInfo.put("productName", p.getName());
        stockInfo.put("inStock", p.getInStock());
        stockInfo.put("stockQuantity", p.getStockQuantity());
        stockInfo.put("isActive", p.getIsActive());
        
        // Calculate if product is available
        boolean available = true;
        String status = "In Stock";
        
        if (p.getInStock() != null && !p.getInStock()) {
            available = false;
            status = "Explicitly marked as out of stock";
        } else if (p.getStockQuantity() != null && p.getStockQuantity() <= 0) {
            available = false;
            status = "Stock quantity is " + p.getStockQuantity();
        } else if (!p.getIsActive()) {
            available = false;
            status = "Product is inactive";
        }
        
        stockInfo.put("available", available);
        stockInfo.put("status", status);
        
        return ResponseEntity.ok(stockInfo);
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<Product> create(
            @RequestPart("product") Product p,
            @RequestParam(value = "image", required = false) MultipartFile imageFile,
            @RequestParam(value = "images", required = false) MultipartFile[] images
    ) throws IOException {
        // Normalize and extract all fields from metadata to separate columns
        normalizeAndExtractFields(p);
        // Support both single 'image' (backwards compatibility) and multiple 'images'
        // If UPLOAD_DIR env var is set we prefer local storage for development
        boolean preferLocal = System.getenv("UPLOAD_DIR") != null && !System.getenv("UPLOAD_DIR").isEmpty();
        if (images != null && images.length > 0) {
            // Filter and upload only valid image files; ignore others
            List<MultipartFile> imgs = new java.util.ArrayList<>();
            for (MultipartFile m : images) {
                if (m == null || m.isEmpty()) continue;
                if (storageService.isImage(m) || storageService.detectImageExtension(m) != null) {
                    imgs.add(m);
                } else {
                    try { log.warn("Ignoring non-image upload part: {}", m.getOriginalFilename()); } catch (Exception ignored) {}
                }
            }
            List<String> urls = imagesWithUpload(imgs.toArray(new MultipartFile[0]));
            if (!urls.isEmpty()) {
                // store full list in metadata and keep first as imageUrl for legacy
                p.getMetadata().put("images", urls);
                p.setImageUrl(urls.get(0));
            }
        } else if (imageFile != null && !imageFile.isEmpty()) {
            if (!storageService.isImage(imageFile) && storageService.detectImageExtension(imageFile) == null) {
                try { log.warn("Ignoring non-image single upload: {}", imageFile.getOriginalFilename()); } catch (Exception ignored) {}
            } else {
                // Always store locally for development reliability; optionally try Cloudinary but do not block
                try {
                    String local = storageService.store(imageFile);
                    if (local != null) {
                        p.getMetadata().put("images", java.util.List.of(local));
                        p.setImageUrl(local);
                    }
                } catch (Exception se) {
                    try { log.warn("Local storage failed for imageFile: {}", se.getMessage()); } catch (Exception ignored) {}
                }

                // Attempt Cloudinary upload in background; if successful, update imageUrl/publicId
                try {
                    com.eduprajna.service.CloudinaryStorageService.UploadResult cres = null;
                    if (preferLocal && p.getMetadata().get("images") instanceof java.util.List) {
                        // try to upload from the local path we just saved
                        java.util.List<?> imgs = (java.util.List<?>) p.getMetadata().get("images");
                        if (!imgs.isEmpty()) {
                            String localPath = imgs.get(0).toString();
                            cres = cloudinaryStorageService.uploadLocal(localPath);
                        }
                    }
                    if (cres == null) {
                        cres = cloudinaryStorageService.upload(imageFile);
                    }
                    if (cres != null && cres.getUrl() != null) {
                        p.setImageUrl(cres.getUrl());
                        p.setImagePublicId(cres.getPublicId());
                        // Replace local path with cloud URL to avoid duplicates
                        p.getMetadata().put("images", java.util.List.of(cres.getUrl()));
                    }
                } catch (Exception ce) {
                    try { log.warn("Cloudinary upload skipped/failed for imageFile: {}", ce.getMessage()); } catch (Exception ignored) {}
                }
            }
        }
        
        // Save the product
        Product saved = productService.save(p);
        
        // Enrich metadata with column values for frontend display
        enrichProductMetadata(saved);
        
        return ResponseEntity.ok(saved);
    }

    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<Product> update(
            @PathVariable Long id,
            @RequestPart("product") Product p,
            @RequestParam(value = "image", required = false) MultipartFile imageFile,
            @RequestParam(value = "images", required = false) MultipartFile[] images
    ) throws IOException {
        p.setId(id);
        
        // Preserve existing images from metadata before normalization
        List<String> existingImages = new ArrayList<>();
        if (p.getMetadata() != null && p.getMetadata().get("images") instanceof List) {
            try {
                List<?> imgList = (List<?>) p.getMetadata().get("images");
                for (Object img : imgList) {
                    if (img != null) existingImages.add(img.toString());
                }
            } catch (Exception e) {
                try { log.warn("Failed to preserve existing images: {}", e.getMessage()); } catch (Exception ignored) {}
            }
        }
        
        // Normalize and extract all fields from metadata to separate columns
        normalizeAndExtractFields(p);
        
        if (images != null && images.length > 0) {
            for (MultipartFile m : images) {
                if (m != null && !m.isEmpty() && !storageService.isImage(m)) {
                    return ResponseEntity.badRequest().build();
                }
            }
            List<String> urls = imagesWithUpload(images);
            if (!urls.isEmpty()) {
                // Merge new uploads with existing images
                List<String> allImages = new ArrayList<>(existingImages);
                allImages.addAll(urls);
                // Remove duplicates while preserving order
                List<String> uniqueImages = allImages.stream().distinct().collect(java.util.stream.Collectors.toList());
                p.getMetadata().put("images", uniqueImages);
                p.setImageUrl(uniqueImages.get(0));
            } else if (!existingImages.isEmpty()) {
                // No new images, keep existing ones
                p.getMetadata().put("images", existingImages);
                p.setImageUrl(existingImages.get(0));
            }
        } else if (imageFile != null && !imageFile.isEmpty()) {
            if (!storageService.isImage(imageFile)) {
                return ResponseEntity.badRequest().build();
            }
            // Store locally first
            try {
                String local = storageService.store(imageFile);
                if (local != null) {
                    p.getMetadata().put("images", java.util.List.of(local));
                    p.setImageUrl(local);
                }
            } catch (Exception se) {
                try { log.warn("Local storage failed for update imageFile: {}", se.getMessage()); } catch (Exception ignored) {}
            }

            // Attempt Cloudinary upload as well
            try {
                com.eduprajna.service.CloudinaryStorageService.UploadResult res = null;
                // prefer uploading from the saved local copy if present
                Object existing = p.getMetadata().get("images");
                if (existing instanceof java.util.List && !((java.util.List<?>) existing).isEmpty()) {
                    String localPath = ((java.util.List<?>) existing).get(0).toString();
                    res = cloudinaryStorageService.uploadLocal(localPath);
                }
                if (res == null) {
                    res = cloudinaryStorageService.upload(imageFile);
                }
                if (res != null) {
                    p.setImageUrl(res.getUrl());
                    p.setImagePublicId(res.getPublicId());
                    // Replace local path with cloud URL to avoid duplicates
                    p.getMetadata().put("images", java.util.List.of(res.getUrl()));
                }
            } catch (Exception ce) {
                try { log.warn("Cloudinary upload skipped/failed for update imageFile: {}", ce.getMessage()); } catch (Exception ignored) {}
            }
        } else if (!existingImages.isEmpty()) {
            // No new images uploaded, preserve existing images
            p.getMetadata().put("images", existingImages);
            if (p.getImageUrl() == null || p.getImageUrl().isEmpty()) {
                p.setImageUrl(existingImages.get(0));
            }
        }
        
        // Save the product
        Product saved = productService.save(p);
        
        // Enrich metadata with column values for frontend display
        enrichProductMetadata(saved);
        
        return ResponseEntity.ok(saved);
    }

    /**
     * Patch endpoint to update a single variant's stock count.
     * This avoids multipart handling when only a simple numeric update is needed.
     */
    @PatchMapping("/{id}/variant/{variantId}/stock")
    public ResponseEntity<Product> updateVariantStock(
            @PathVariable Long id,
            @PathVariable String variantId,
            @RequestParam("stock") Integer stock
    ) {
        try {
            Product existing = productService.getById(id);
            if (existing == null) return ResponseEntity.notFound().build();

            // Ensure metadata and variants structure
            Map<String, Object> md = existing.getMetadata();
            if (md == null) md = new java.util.HashMap<>();
            Object variantsObj = md.get("variants");
            if (!(variantsObj instanceof java.util.List)) {
                // if variants missing, nothing to update
                return ResponseEntity.badRequest().build();
            }

            @SuppressWarnings("unchecked")
            java.util.List<Map<String, Object>> variants = (java.util.List<Map<String, Object>>) variantsObj;
            boolean found = false;
            for (Map<String, Object> v : variants) {
                Object vid = v.get("id");
                if (vid != null && vid.toString().equals(variantId)) {
                    // store as Integer or String - prefer integer
                    v.put("stock", stock);
                    found = true;
                    break;
                }
            }

            if (!found) return ResponseEntity.notFound().build();

            // persist changes
            existing.setMetadata(md);
            Product saved = productService.save(existing);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            try { log.error("Failed to update variant stock", e); } catch (Exception ignored) {}
            return ResponseEntity.status(500).build();
        }
    }

    // Normalize and extract all fields from metadata to separate columns
    @SuppressWarnings({"rawtypes", "unchecked"})
    private void normalizeAndExtractFields(Product p) {
        if (p == null) return;
        try {
            Map<String, Object> md = p.getMetadata();
            if (md == null) md = new HashMap<>();
            
            // Extract type (Dog/Cat/Pharmacy/Outlet) to separate column
            String t = p.getType();
            if ((t == null || t.isBlank()) && md != null) {
                Object mv = md.get("type");
                if (mv != null) {
                    p.setType(mv.toString());
                }
                // Remove type from metadata to avoid duplication
                md.remove("type");
            }
            
            // Extract foodType (Veg/Non-Veg) to separate column - prioritize top-level, then metadata
            String foodType = p.getFoodType();
            if (foodType == null || foodType.isBlank()) {
                Object ft = md.get("foodType");
                if (ft != null) foodType = ft.toString();
            }
            if (foodType != null && !foodType.isBlank()) {
                // Normalize foodType values
                if ("VEG".equalsIgnoreCase(foodType) || "Veg".equalsIgnoreCase(foodType)) {
                    p.setFoodType("Veg");
                } else if ("NON_VEG".equalsIgnoreCase(foodType) || "Non-Veg".equalsIgnoreCase(foodType) || "Non-VEG".equalsIgnoreCase(foodType)) {
                    p.setFoodType("Non-Veg");
                } else {
                    p.setFoodType(foodType);
                }
            }
            
            // Extract features array to features column (store as JSON string)
            // Check both top-level features field and metadata.features
            Object featuresObj = md.get("features");
            if (featuresObj != null) {
                if (featuresObj instanceof List) {
                    // Convert List to JSON array string format: ["feature1", "feature2"]
                    List<?> featuresList = (List<?>) featuresObj;
                    if (!featuresList.isEmpty()) {
                        StringBuilder jsonBuilder = new StringBuilder("[");
                        boolean first = true;
                        for (Object feature : featuresList) {
                            if (feature != null && !feature.toString().trim().isEmpty()) {
                                if (!first) jsonBuilder.append(", ");
                                jsonBuilder.append("\"").append(feature.toString().replace("\"", "\\\"")).append("\"");
                                first = false;
                            }
                        }
                        jsonBuilder.append("]");
                        p.setFeatures(jsonBuilder.toString());
                    }
                } else if (featuresObj instanceof String && !((String) featuresObj).isBlank()) {
                    p.setFeatures((String) featuresObj);
                }
            }
            
            // Extract nutrition information to separate columns
            // Check both top-level and metadata for nutrition data
            Object nutritionObj = md.get("nutrition");
            if (nutritionObj instanceof Map) {
                Map<String, Object> nutrition = (Map<String, Object>) nutritionObj;
                
                Object protein = nutrition.get("protein");
                if (protein != null && !protein.toString().isBlank()) {
                    p.setNutritionProtein(protein.toString());
                }
                
                Object fat = nutrition.get("fat");
                if (fat != null && !fat.toString().isBlank()) {
                    p.setNutritionFat(fat.toString());
                }
                
                Object fiber = nutrition.get("fiber");
                if (fiber != null && !fiber.toString().isBlank()) {
                    p.setNutritionFiber(fiber.toString());
                }
                
                Object moisture = nutrition.get("moisture");
                if (moisture != null && !moisture.toString().isBlank()) {
                    p.setNutritionMoisture(moisture.toString());
                }
                
                Object ash = nutrition.get("ash");
                if (ash != null && !ash.toString().isBlank()) {
                    p.setNutritionAsh(ash.toString());
                }
                
                Object calories = nutrition.get("calories");
                if (calories != null && !calories.toString().isBlank()) {
                    p.setNutritionCalories(calories.toString());
                }
            }
            
            // Extract pet and product attribute fields to separate columns
            Object petTypeObj = md.get("petType");
            if (petTypeObj != null && !petTypeObj.toString().isBlank()) {
                p.setPetType(petTypeObj.toString());
            }
            
            Object materialObj = md.get("material");
            if (materialObj != null && !materialObj.toString().isBlank()) {
                p.setMaterial(materialObj.toString());
            }
            
            Object scentObj = md.get("scent");
            if (scentObj != null && !scentObj.toString().isBlank()) {
                p.setScent(scentObj.toString());
            }
            
            Object suitableForObj = md.get("suitableFor");
            if (suitableForObj != null && !suitableForObj.toString().isBlank()) {
                p.setSuitableFor(suitableForObj.toString());
            }
            
            Object treatTypeObj = md.get("treatType");
            if (treatTypeObj != null && !treatTypeObj.toString().isBlank()) {
                p.setTreatType(treatTypeObj.toString());
            }
            
            Object textureObj = md.get("texture");
            if (textureObj != null && !textureObj.toString().isBlank()) {
                p.setTexture(textureObj.toString());
            }
            
            Object subcategoryLabelObj = md.get("subcategoryLabel");
            if (subcategoryLabelObj != null && !subcategoryLabelObj.toString().isBlank()) {
                p.setSubcategoryLabel(subcategoryLabelObj.toString());
            }
            
            Object servingSizeObj = md.get("servingSize");
            if (servingSizeObj != null && !servingSizeObj.toString().isBlank()) {
                p.setServingSize(servingSizeObj.toString());
            }
            
            Object packCountObj = md.get("packCount");
            if (packCountObj != null && !packCountObj.toString().isBlank()) {
                p.setPackCount(packCountObj.toString());
            }
            
            Object weightUnitObj = md.get("weightUnit");
            if (weightUnitObj != null && !weightUnitObj.toString().isBlank()) {
                p.setWeightUnit(weightUnitObj.toString());
            }
            
            // Extract flavors and colors (can be arrays or strings)
            Object flavorsObj = md.get("flavors");
            if (flavorsObj != null) {
                if (flavorsObj instanceof List) {
                    List<?> flavorsList = (List<?>) flavorsObj;
                    if (!flavorsList.isEmpty()) {
                        StringBuilder jsonBuilder = new StringBuilder("[");
                        boolean first = true;
                        for (Object flavor : flavorsList) {
                            if (flavor != null && !flavor.toString().trim().isEmpty()) {
                                if (!first) jsonBuilder.append(", ");
                                jsonBuilder.append("\"").append(flavor.toString().replace("\"", "\\\"")).append("\"");
                                first = false;
                            }
                        }
                        jsonBuilder.append("]");
                        p.setFlavors(jsonBuilder.toString());
                    }
                } else if (!flavorsObj.toString().isBlank()) {
                    p.setFlavors(flavorsObj.toString());
                }
            }
            
            Object colorsObj = md.get("colors");
            if (colorsObj != null) {
                if (colorsObj instanceof List) {
                    List<?> colorsList = (List<?>) colorsObj;
                    if (!colorsList.isEmpty()) {
                        StringBuilder jsonBuilder = new StringBuilder("[");
                        boolean first = true;
                        for (Object color : colorsList) {
                            if (color != null && !color.toString().trim().isEmpty()) {
                                if (!first) jsonBuilder.append(", ");
                                jsonBuilder.append("\"").append(color.toString().replace("\"", "\\\"")).append("\"");
                                first = false;
                            }
                        }
                        jsonBuilder.append("]");
                        p.setColors(jsonBuilder.toString());
                    }
                } else if (!colorsObj.toString().isBlank()) {
                    p.setColors(colorsObj.toString());
                }
            }
            
            // Extract pharmacy fields from metadata.pharmacy object
            Object pharmacyObj = md.get("pharmacy");
            if (pharmacyObj instanceof Map) {
                Map<String, Object> pharmacy = (Map<String, Object>) pharmacyObj;
                
                Object prescriptionReq = pharmacy.get("prescriptionRequired");
                if (prescriptionReq != null) {
                    p.setPrescriptionRequired(Boolean.parseBoolean(prescriptionReq.toString()));
                }
                
                Object dosageForm = pharmacy.get("dosageForm");
                if (dosageForm != null && !dosageForm.toString().isBlank()) {
                    p.setDosageForm(dosageForm.toString());
                }
                
                Object strength = pharmacy.get("strength");
                if (strength != null && !strength.toString().isBlank()) {
                    p.setStrength(strength.toString());
                }
                
                Object activeIngredient = pharmacy.get("activeIngredient");
                if (activeIngredient != null && !activeIngredient.toString().isBlank()) {
                    p.setActiveIngredient(activeIngredient.toString());
                }
                
                Object manufacturer = pharmacy.get("manufacturer");
                if (manufacturer != null && !manufacturer.toString().isBlank()) {
                    p.setManufacturer(manufacturer.toString());
                }
                
                Object indications = pharmacy.get("indications");
                if (indications != null && !indications.toString().isBlank()) {
                    p.setIndications(indications.toString());
                }
                
                Object contraindications = pharmacy.get("contraindications");
                if (contraindications != null && !contraindications.toString().isBlank()) {
                    p.setContraindications(contraindications.toString());
                }
                
                Object expiryDate = pharmacy.get("expiryDate");
                if (expiryDate != null && !expiryDate.toString().isBlank()) {
                    p.setExpiryDate(expiryDate.toString());
                }
            }
            
            // Ensure metadata doesn't duplicate data stored in columns - remove redundant entries
            // Keep variants and images in metadata as they are complex structures
            if (p.getFeatures() != null && !p.getFeatures().isBlank()) {
                md.remove("features");
            }
            if (p.getPetType() != null && !p.getPetType().isBlank()) {
                md.remove("petType");
            }
            if (p.getMaterial() != null && !p.getMaterial().isBlank()) {
                md.remove("material");
            }
            if (p.getScent() != null && !p.getScent().isBlank()) {
                md.remove("scent");
            }
            if (p.getSuitableFor() != null && !p.getSuitableFor().isBlank()) {
                md.remove("suitableFor");
            }
            if (p.getTreatType() != null && !p.getTreatType().isBlank()) {
                md.remove("treatType");
            }
            if (p.getTexture() != null && !p.getTexture().isBlank()) {
                md.remove("texture");
            }
            if (p.getSubcategoryLabel() != null && !p.getSubcategoryLabel().isBlank()) {
                md.remove("subcategoryLabel");
            }
            if (p.getServingSize() != null && !p.getServingSize().isBlank()) {
                md.remove("servingSize");
            }
            if (p.getPackCount() != null && !p.getPackCount().isBlank()) {
                md.remove("packCount");
            }
            if (p.getWeightUnit() != null && !p.getWeightUnit().isBlank()) {
                md.remove("weightUnit");
            }
            if (p.getFlavors() != null && !p.getFlavors().isBlank()) {
                md.remove("flavors");
            }
            if (p.getColors() != null && !p.getColors().isBlank()) {
                md.remove("colors");
            }
            if (p.getPrescriptionRequired() != null || p.getDosageForm() != null || 
                p.getStrength() != null || p.getActiveIngredient() != null ||
                p.getManufacturer() != null || p.getIndications() != null ||
                p.getContraindications() != null || p.getExpiryDate() != null) {
                md.remove("pharmacy");
            }
            if (p.getNutritionProtein() != null || p.getNutritionFat() != null || 
                p.getNutritionFiber() != null || p.getNutritionMoisture() != null ||
                p.getNutritionAsh() != null || p.getNutritionCalories() != null) {
                // Keep nutrition in metadata for backward compatibility but mark as extracted
                // Don't remove it as it might be used by frontend
            }
            
            // Validate and ensure variants are properly stored
            Object variantsObj = md.get("variants");
            int variantCount = 0;
            if (variantsObj instanceof List) {
                List<?> variantsList = (List<?>) variantsObj;
                variantCount = variantsList.size();
                
                // Validate each variant has minimum required fields (lenient validation)
                for (int i = 0; i < variantsList.size(); i++) {
                    Object variantObj = variantsList.get(i);
                    if (variantObj instanceof Map) {
                        Map<?, ?> variant = (Map<?, ?>) variantObj;
                        
                        // Log variant details for debugging
                        try {
                            log.debug("Variant {}: id={}, weight={}, size={}, price={}, stock={}", 
                                i + 1, 
                                variant.get("id"),
                                variant.get("weight"),
                                variant.get("size"),
                                variant.get("price"),
                                variant.get("stock"));
                        } catch (Exception ignored) {}
                        
                        // Optional: Warn if variant is missing important fields
                        if (!variant.containsKey("id") || variant.get("id") == null) {
                            log.warn("Variant {} is missing 'id' field", i + 1);
                        }
                        if (!variant.containsKey("price") && !variant.containsKey("originalPrice")) {
                            log.warn("Variant {} is missing price information", i + 1);
                        }
                        if (!variant.containsKey("stock")) {
                            log.warn("Variant {} is missing 'stock' field, defaulting to 0", i + 1);
                        }
                    }
                }
                
                // Recalculate total stock from variants
                int totalStock = 0;
                for (Object varObj : variantsList) {
                    if (varObj instanceof Map) {
                        Map<?, ?> variant = (Map<?, ?>) varObj;
                        Object stockObj = variant.get("stock");
                        if (stockObj != null) {
                            try {
                                if (stockObj instanceof Number) {
                                    totalStock += ((Number) stockObj).intValue();
                                } else {
                                    totalStock += Integer.parseInt(stockObj.toString());
                                }
                            } catch (NumberFormatException e) {
                                log.warn("Invalid stock value for variant {}: {}", variant.get("id"), stockObj);
                            }
                        }
                    }
                }
                
                // Update product stock from variants
                p.setStockQuantity(totalStock);
                p.setInStock(totalStock > 0);
                
                try {
                    log.info("Variants processed: {} variants found, total stock: {}, inStock: {}", 
                        variantCount, totalStock, p.getInStock());
                } catch (Exception ignored) {}
            }
            
            // Validate required fields
            if (p.getName() == null || p.getName().isBlank()) {
                throw new IllegalArgumentException("Product name is required");
            }
            if (p.getBrand() == null || p.getBrand().isBlank()) {
                throw new IllegalArgumentException("Product brand is required");
            }
            if (p.getType() == null || p.getType().isBlank()) {
                throw new IllegalArgumentException("Product type (Dog/Cat/Pharmacy/Outlet) is required");
            }
            
            // foodType is optional - only applies to food products
            if (p.getFoodType() == null || p.getFoodType().isBlank()) {
                log.debug("Product foodType not provided, setting to null");
                p.setFoodType(null);
            }
            
            // Update metadata back to product (this includes variants)
            p.setMetadata(md);
            
            try {
                log.info("Product normalized - name: {}, brand: {}, type: {}, foodType: {}, features: {}, nutrition: {}/{}/{}/{}/{}/{}, variants: {}", 
                    p.getName(), p.getBrand(), p.getType(), p.getFoodType(),
                    (p.getFeatures() != null ? "present" : "null"),
                    p.getNutritionProtein(), p.getNutritionFat(), p.getNutritionFiber(),
                    p.getNutritionMoisture(), p.getNutritionAsh(), p.getNutritionCalories(),
                    variantCount);
            } catch (Exception ignored) {}
        } catch (IllegalArgumentException e) {
            // Re-throw validation errors
            throw e;
        } catch (Exception e) {
            try { log.error("Error normalizing product fields: {}", e.getMessage(), e); } catch (Exception ignored) {}
            throw new IllegalStateException("Failed to process product data: " + e.getMessage());
        }
    }

    // Helper to upload multiple files and return their URLs
    private List<String> imagesWithUpload(MultipartFile[] images) {
        List<String> urls = new java.util.ArrayList<>();
        for (MultipartFile img : images) {
            try {
                if (img == null || img.isEmpty()) continue;
                // Always store locally first so uploads are persisted to UPLOAD_DIR
                try {
                    String local = storageService.store(img);
                    if (local != null) urls.add(local);
                } catch (Exception le) {
                    try { log.warn("Local storage failed for image: {}", le.getMessage()); } catch (Exception ignored) {}
                }

                // Then attempt Cloudinary (best-effort) using the already-saved local file
                try {
                    // storageService.store returned an API path like "/admin/products/images/xxxx.jpg"
                    // use uploadLocal to read that saved file and upload it to Cloudinary
                    com.eduprajna.service.CloudinaryStorageService.UploadResult res = cloudinaryStorageService.uploadLocal(urls.get(urls.size() - 1));
                    if (res != null && res.getUrl() != null) {
                        // also add cloud URL to the list for completeness
                        urls.add(res.getUrl());
                    }
                } catch (Exception ce) {
                    try { log.warn("Cloudinary upload failed for one image: {}", ce.getMessage()); } catch (Exception ignored) {}
                }
            } catch (Exception ex) {
                try { log.warn("Failed to process image: {}", ex.getMessage()); } catch (Exception ignored) {}
            }
        }
        return urls;
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        // Load product to get image URL before deleting DB row
        try {
            Product existing = productService.getById(id);
            if (existing != null) {
                boolean deletedSomething = false;
                // Try Cloudinary public id first
                if (existing.getImagePublicId() != null && !existing.getImagePublicId().isEmpty()) {
                    try {
                        cloudinaryStorageService.delete(existing.getImagePublicId());
                        deletedSomething = true;
                    } catch (Exception e) {
                        try { log.warn("Cloudinary deletion failed: {}", e.getMessage()); } catch (Exception ignored) {}
                    }
                }

                // If not deleted via Cloudinary, try to delete by URL or local filename
                if (!deletedSomething && existing.getImageUrl() != null) {
                    try {
                        // If imageUrl looks like an absolute URL, ask Cloudinary to delete by URL (service handles it)
                        if (existing.getImageUrl().startsWith("http://") || existing.getImageUrl().startsWith("https://")) {
                            try { cloudinaryStorageService.delete(existing.getImageUrl()); deletedSomething = true; } catch (Exception e) { }
                        } else {
                            // Treat as local path: extract filename and delete from local storage
                            String filename = storageService.extractFilenameFromUrl(existing.getImageUrl());
                            if (filename != null) storageService.delete(filename);
                        }
                    } catch (Exception ex) {
                        try { log.warn("Failed to delete stored image: {}", ex.getMessage()); } catch (Exception ignored) {}
                    }
                }
            }
        } catch (Exception ignored) {
            // Ignore errors during image deletion; proceed to delete DB row
        }
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // Serve uploaded images via API so frontend can display them
    @GetMapping("/images/{filename:.+}")
    public ResponseEntity<Resource> getImage(@PathVariable String filename) throws IOException {
        long start = System.currentTimeMillis();
        Resource resource = null;
        long readDuration = 0;
        MediaType contentType = null;
        try {
            resource = storageService.loadAsResource(filename);
            readDuration = System.currentTimeMillis() - start;
            contentType = storageService.probeMediaType(filename);
        } catch (IOException ioe) {
            try { log.warn("Requested image not found: {}", filename); } catch (Exception ignored) {}
            return ResponseEntity.notFound().build();
        }

        // Log small diagnostic info to help debug cold-start vs file-read slowness
        try {
            log.info("Image request served: {} (readDuration={} ms)", filename, readDuration);
        } catch (Exception ignored) {}

        return ResponseEntity.ok()
                .header(HttpHeaders.CACHE_CONTROL, "max-age=86400, public")
                .header("X-Served-By", "local-storage")
                .header("X-Read-Duration-ms", String.valueOf(readDuration))
                .contentType(contentType)
                .body(resource);
    }

    // List all stored image filenames (or absolute URLs)
    @GetMapping("/images")
    public ResponseEntity<List<String>> listImages() {
        // Only list image files
        List<String> files = storageService.listAll();
        List<String> urls = files.stream()
            .filter(name -> storageService.isImageFilename(name))
            .map(name -> "/api/admin/products/images/" + name)
            .collect(Collectors.toList());
        return ResponseEntity.ok(urls);
    }

    // Admin utility: remove non-image files from upload folder (useful for dev cleanup)
    @PostMapping("/images/cleanup")
    public ResponseEntity<List<String>> cleanupUploads() {
        List<String> deleted = storageService.sanitizeUploads();
        return ResponseEntity.ok(deleted);
    }
}