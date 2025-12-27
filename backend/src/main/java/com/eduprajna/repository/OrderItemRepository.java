package com.eduprajna.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.eduprajna.entity.Order;
import com.eduprajna.entity.OrderItem;
import com.eduprajna.entity.Product;

/**
 * Repository for OrderItem entity
 * Provides database operations for order items
 */
@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    
    /**
     * Find all order items for a specific order
     * @param order The order to find items for
     * @return List of order items
     */
    List<OrderItem> findByOrder(Order order);
    
    /**
     * Find all order items for a specific order by order ID
     * @param orderId The ID of the order
     * @return List of order items
     */
    List<OrderItem> findByOrderId(Long orderId);
    
    /**
     * Delete all order items for a specific product
     * @param product The product to delete items for
     */
    @Modifying
    @Transactional
    void deleteByProduct(Product product);
}
