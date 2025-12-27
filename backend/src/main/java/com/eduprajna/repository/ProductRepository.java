package com.eduprajna.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.eduprajna.entity.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {
    
    // Find products by category (case insensitive, partial match)
    @Query("SELECT p FROM Product p WHERE p.isActive = true AND LOWER(p.category) LIKE LOWER(CONCAT('%', :category, '%'))")
    List<Product> findByCategory(@Param("category") String category);
    
    // Find products by subcategory (case insensitive, partial match)
    @Query("SELECT p FROM Product p WHERE p.isActive = true AND LOWER(p.subcategory) LIKE LOWER(CONCAT('%', :subcategory, '%'))")
    List<Product> findBySubcategory(@Param("subcategory") String subcategory);
    
    // Find products by both category and subcategory (partial match)
    @Query("SELECT p FROM Product p WHERE p.isActive = true AND " +
           "LOWER(p.category) LIKE LOWER(CONCAT('%', :category, '%')) AND " +
           "LOWER(p.subcategory) LIKE LOWER(CONCAT('%', :subcategory, '%'))")
    List<Product> findByCategoryAndSubcategory(@Param("category") String category, @Param("subcategory") String subcategory);
    
    // Find products by exact category match (case insensitive)
    @Query("SELECT p FROM Product p WHERE p.isActive = true AND LOWER(p.category) = LOWER(:category)")
    List<Product> findByExactCategory(@Param("category") String category);
    
    // Find products by exact subcategory match (case insensitive)
    @Query("SELECT p FROM Product p WHERE p.isActive = true AND LOWER(p.subcategory) = LOWER(:subcategory)")
    List<Product> findByExactSubcategory(@Param("subcategory") String subcategory);
    
    // Find products by exact category and subcategory match (case insensitive)
    @Query("SELECT p FROM Product p WHERE p.isActive = true AND " +
           "LOWER(p.category) = LOWER(:category) AND " +
           "LOWER(p.subcategory) = LOWER(:subcategory)")
    List<Product> findByExactCategoryAndSubcategory(@Param("category") String category, @Param("subcategory") String subcategory);
    
    // Find only active products
    @Query("SELECT p FROM Product p WHERE p.isActive = true")
    List<Product> findAllActive();
    
    // Type-based filtering methods
    @Query("SELECT p FROM Product p WHERE p.isActive = true AND LOWER(p.type) = LOWER(:type)")
    List<Product> findByType(@Param("type") String type);
    
    @Query("SELECT p FROM Product p WHERE p.isActive = true AND " +
           "LOWER(p.type) = LOWER(:type) AND " +
           "LOWER(p.category) LIKE LOWER(CONCAT('%', :category, '%'))")
    List<Product> findByTypeAndCategory(@Param("type") String type, @Param("category") String category);
    
    @Query("SELECT p FROM Product p WHERE p.isActive = true AND " +
           "LOWER(p.type) = LOWER(:type) AND " +
           "LOWER(p.category) LIKE LOWER(CONCAT('%', :category, '%')) AND " +
           "LOWER(p.subcategory) LIKE LOWER(CONCAT('%', :subcategory, '%'))")
    List<Product> findByTypeAndCategoryAndSubcategory(@Param("type") String type, @Param("category") String category, @Param("subcategory") String subcategory);
}
// CategoryRepository.java, UserRepository.java, OrderRepository.java, OrderItemRepository.java