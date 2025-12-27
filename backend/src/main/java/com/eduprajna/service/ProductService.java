package com.eduprajna.service;

import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eduprajna.entity.Product;
import com.eduprajna.repository.CartItemRepository;
import com.eduprajna.repository.OrderItemRepository;
import com.eduprajna.repository.ProductRepository;
import com.eduprajna.repository.WishlistItemRepository;


@Service
public class ProductService {
    private final Logger log = LoggerFactory.getLogger(ProductService.class);
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private CartItemRepository cartItemRepository;
    
    @Autowired
    private OrderItemRepository orderItemRepository;
    
    @Autowired
    private WishlistItemRepository wishlistItemRepository;
    
    public List<Product> getAll() { return productRepository.findAllActive(); }
    
    // Enhanced type-first filtering method
    public List<Product> getFilteredProductsByType(String type, String category, String subcategory) {
        log.info("ProductService: Type-first filtering - type: '{}', category: '{}', subcategory: '{}'", 
                type, category, subcategory);
        
        List<Product> results = new ArrayList<>();
        
        // Type-first filtering with optional category/subcategory refinement
        if (type != null && !type.isBlank()) {
            if (category != null && !category.isBlank() && subcategory != null && !subcategory.isBlank()) {
                // Filter by all three parameters
                results = productRepository.findByTypeAndCategoryAndSubcategory(type, category, subcategory);
                log.info("ProductService: findByTypeAndCategoryAndSubcategory returned {} products", results.size());
            } else if (category != null && !category.isBlank()) {
                // Filter by type and category
                results = productRepository.findByTypeAndCategory(type, category);
                log.info("ProductService: findByTypeAndCategory returned {} products", results.size());
            } else {
                // Filter by type only
                results = productRepository.findByType(type);
                log.info("ProductService: findByType returned {} products", results.size());
            }
        } else {
            // Fallback to category/subcategory filtering
            results = getFilteredProducts(category, subcategory);
        }
        
        return results;
    }
    
    // Get products filtered by category and/or subcategory
    public List<Product> getFilteredProducts(String category, String subcategory) {
        log.info("ProductService: Filtering products with category='{}', subcategory='{}'", category, subcategory);
        
        List<Product> results = new ArrayList<>();
        
        // Try exact matches first for better precision
        if (category != null && !category.isBlank() && subcategory != null && !subcategory.isBlank()) {
            log.info("ProductService: Using findByExactCategoryAndSubcategory query");
            results = productRepository.findByExactCategoryAndSubcategory(category, subcategory);
            
            // If no exact match found, try partial match
            if (results.isEmpty()) {
                log.info("ProductService: No exact match found, trying partial match with findByCategoryAndSubcategory");
                results = productRepository.findByCategoryAndSubcategory(category, subcategory);
            }
        } else if (category != null && !category.isBlank()) {
            log.info("ProductService: Using findByExactCategory query");
            results = productRepository.findByExactCategory(category);
            
            // If no exact match found, try partial match
            if (results.isEmpty()) {
                log.info("ProductService: No exact match found, trying partial match with findByCategory");
                results = productRepository.findByCategory(category);
            }
        } else if (subcategory != null && !subcategory.isBlank()) {
            log.info("ProductService: Using findByExactSubcategory query");
            results = productRepository.findByExactSubcategory(subcategory);
            
            // If no exact match found, try partial match
            if (results.isEmpty()) {
                log.info("ProductService: No exact match found, trying partial match with findBySubcategory");
                results = productRepository.findBySubcategory(subcategory);
            }
        } else {
            log.info("ProductService: Using findAllActive query");
            results = productRepository.findAllActive();
        }
        
        log.info("ProductService: Query returned {} products", results.size());
        return results;
    }
    
    public Product save(Product p) { return productRepository.save(p); }
    
    @Transactional
    public void delete(Long id) { 
        // First find the product
        Product product = productRepository.findById(id).orElse(null);
        if (product != null) {
            // Delete all related entities first to avoid foreign key constraint violations
            cartItemRepository.deleteByProduct(product);
            orderItemRepository.deleteByProduct(product);
            wishlistItemRepository.deleteByProduct(product);
            
            // Now delete the product itself
            productRepository.deleteById(id);
        }
    }
    
    public Product getById(Long id) { return productRepository.findById(id).orElse(null); }
    
}