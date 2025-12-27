package com.eduprajna.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eduprajna.entity.Address;
import com.eduprajna.entity.CartItem;
import com.eduprajna.entity.CheckoutSelection;
import com.eduprajna.entity.Order;
import com.eduprajna.entity.OrderItem;
import com.eduprajna.entity.Product;
import com.eduprajna.entity.ShippingSnapshot;
import com.eduprajna.entity.User;
import com.eduprajna.repository.AddressRepository;
import com.eduprajna.repository.CartItemRepository;
import com.eduprajna.repository.CheckoutSelectionRepository;
import com.eduprajna.repository.OrderRepository;

/**
 * OrderService handles order creation and management
 * All order operations are transactional to ensure data consistency
 */
@Service
public class OrderService {
    private static final Logger logger = LoggerFactory.getLogger(OrderService.class);
    
    private final OrderRepository orderRepo;
    private final CartItemRepository cartRepo;
    private final CheckoutSelectionRepository selectionRepo;
    private final AddressRepository addressRepo;
    private final com.eduprajna.repository.ProductRepository productRepo;

    public OrderService(OrderRepository orderRepo, CartItemRepository cartRepo, 
                       CheckoutSelectionRepository selectionRepo, AddressRepository addressRepo,
                       com.eduprajna.repository.ProductRepository productRepo) {
        this.orderRepo = orderRepo;
        this.cartRepo = cartRepo;
        this.selectionRepo = selectionRepo;
        this.addressRepo = addressRepo;
        this.productRepo = productRepo;
    }

    /**
     * Place order transactionally
     * This method creates an order from cart items and clears the cart
     * All operations are wrapped in a transaction for data consistency
     */
    @Transactional
    public Order placeOrder(User user) {
        logger.debug("Placing order for user: {}", user.getEmail());
        
        // 1. Get cart items
        List<CartItem> cart = cartRepo.findByUser(user);
        if (cart.isEmpty()) {
            throw new IllegalStateException("Cart is empty");
        }
        logger.debug("Found {} items in cart for user: {}", cart.size(), user.getEmail());
        
        // 1b. Validate stock availability for all items before proceeding
        for (CartItem ci : cart) {
            Product product = ci.getProduct();
            String variantId = ci.getVariantId();
            int qty = ci.getQuantity() != null ? ci.getQuantity() : 0;
            
            logger.debug("Checking stock for product: {} (ID: {}), variantId: {}, quantity: {}", 
                product.getName(), product.getId(), variantId, qty);
            
            if (qty <= 0) {
                throw new IllegalStateException("Invalid quantity for product: " + product.getName());
            }
            
            // Simple stock validation - just check if product is in stock
            boolean isInStock = false;
            String stockInfo = "unknown";
            
            try {
                // Check if product has an inStock flag
                Boolean productInStock = product.getInStock();
                Integer stockQuantity = product.getStockQuantity();
                
                if (productInStock != null && !productInStock) {
                    isInStock = false;
                    stockInfo = "marked as out of stock";
                } else if (stockQuantity != null && stockQuantity > 0) {
                    isInStock = stockQuantity >= qty;
                    stockInfo = "main stock: " + stockQuantity;
                } else {
                    // Try variant stock if available
                    try {
                        if (variantId != null && !variantId.isEmpty()) {
                            Integer variantStock = product.getVariantStock(variantId);
                            if (variantStock != null) {
                                isInStock = variantStock >= qty;
                                stockInfo = "variant stock: " + variantStock;
                            } else {
                                isInStock = false;
                                stockInfo = "variant not found";
                            }
                        } else {
                            isInStock = false;
                            stockInfo = "no stock information";
                        }
                    } catch (Exception variantEx) {
                        logger.warn("Error checking variant stock: {}", variantEx.getMessage());
                        isInStock = false;
                        stockInfo = "variant check failed";
                    }
                }
                
                logger.debug("Stock check result for product {}: isInStock={}, info={}", 
                    product.getName(), isInStock, stockInfo);
                
                if (!isInStock) {
                    throw new IllegalStateException("Insufficient stock for product: " + product.getName() + " (" + stockInfo + ")");
                }
                
            } catch (IllegalStateException e) {
                // Re-throw stock validation errors
                throw e;
            } catch (Exception e) {
                logger.error("Error during stock validation for product {}: {}", product.getId(), e.getMessage());
                throw new IllegalStateException("Unable to validate stock for product: " + product.getName());
            }
        }
        
        // 2. Get checkout selection
        CheckoutSelection selection = selectionRepo.findByUser(user)
            .orElseThrow(() -> new IllegalStateException("No checkout selection found"));
        
        // 3. Get selected address
        Address address = addressRepo.findById(selection.getAddressId())
            .orElseThrow(() -> new IllegalStateException("Selected address not found"));
        
        // 4. Create order
        Order order = new Order();
        order.setUser(user);
        order.setDeliveryOption(selection.getDeliveryOption());
        order.setPaymentMethod(selection.getPaymentMethod());
        
        // 5. Create shipping snapshot
        ShippingSnapshot shippingSnapshot = new ShippingSnapshot();
        shippingSnapshot.setName(address.getName());
        shippingSnapshot.setPhone(address.getPhone());
        shippingSnapshot.setStreet(address.getStreet());
        shippingSnapshot.setCity(address.getCity());
        shippingSnapshot.setState(address.getState());
        shippingSnapshot.setPincode(address.getPincode());
        shippingSnapshot.setLandmark(address.getLandmark());
        shippingSnapshot.setAddressType(address.getAddressType());
        order.setShipping(shippingSnapshot);
        
        // 6. Calculate totals
        double subtotal = cart.stream()
            .mapToDouble(ci -> (ci.getPriceAtAdd() != null ? ci.getPriceAtAdd() : 0.0) * ci.getQuantity())
            .sum();
        double shippingFee = "express".equalsIgnoreCase(selection.getDeliveryOption()) ? 100.0 : 50.0;
        double total = subtotal + shippingFee;
        
        order.setSubtotal(subtotal);
        order.setShippingFee(shippingFee);
        order.setTotal(total);
        
        // 7. Create order items
        List<OrderItem> orderItems = cart.stream().map(cartItem -> {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(cartItem.getProduct());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPrice(cartItem.getPriceAtAdd());
            orderItem.setVariantId(cartItem.getVariantId()); // Store variant ID
            
            // Decrement stock for the purchased product (variant-aware)
            Product product = cartItem.getProduct();
            String variantId = cartItem.getVariantId();
            int qty = cartItem.getQuantity() != null ? cartItem.getQuantity() : 0;
            
            try {
                boolean hasVariants = product.hasVariants();
                if (variantId != null && !variantId.isEmpty() && hasVariants) {
                    // Update variant stock
                    List<Map<String, Object>> variants = product.getVariants();
                    for (Map<String, Object> variant : variants) {
                        if (variantId.equals(variant.get("id"))) {
                            Object stockObj = variant.get("stock");
                            int currentStock = 0;
                            if (stockObj instanceof Number) {
                                currentStock = ((Number) stockObj).intValue();
                            } else if (stockObj instanceof String) {
                                try {
                                    currentStock = Integer.parseInt((String) stockObj);
                                } catch (NumberFormatException e) {
                                    currentStock = 0;
                                }
                            }
                            int newStock = Math.max(currentStock - qty, 0);
                            variant.put("stock", newStock);
                            logger.debug("Updated variant {} stock from {} to {}", variantId, currentStock, newStock);
                            break;
                        }
                    }
                    product.setVariants(variants);
                } else {
                    // Update main product stock
                    Integer stockQty = product.getStockQuantity();
                    int available = stockQty != null ? stockQty : 0;
                    int newQty = Math.max(available - qty, 0);
                    product.setStockQuantity(newQty);
                    product.setInStock(newQty > 0);
                    logger.debug("Updated main product stock from {} to {}", available, newQty);
                }
                
                productRepo.save(product);
            } catch (Exception e) {
                logger.error("Error updating stock for product {}: {}", product.getId(), e.getMessage());
                // Don't fail the entire order for stock update errors
            }
            return orderItem;
        }).collect(Collectors.toList());
        order.setItems(orderItems);
        
        // 8. Save order
        Order savedOrder = orderRepo.save(order);
        logger.info("Order created with ID: {} for user: {}", savedOrder.getId(), user.getEmail());
        
        // 9. Clear cart after successful order creation
        cartRepo.deleteByUser(user);
        logger.info("Cart cleared for user: {}", user.getEmail());
        
        // 10. Update user's order count
        user.incrementTotalOrders();
        
        return savedOrder;
    }

    /**
     * Place an order for online payment after signature verification
     * This method doesn't require cart items as they are already stored in checkout selection
     * @param user The user placing the order
     * @return The created order
     */
    @Transactional
    public Order placeOrderForOnlinePayment(User user) {
        logger.debug("Placing order for online payment user: {}", user.getEmail());
        
        // Get checkout selection with totals
        CheckoutSelection selection = selectionRepo.findByUser(user)
            .orElseThrow(() -> new IllegalStateException("No checkout selection found"));
        
        // Get selected address
        Address address = addressRepo.findById(selection.getAddressId())
            .orElseThrow(() -> new IllegalStateException("Selected address not found"));
        
        // Create order using checkout selection data
        Order order = new Order();
        order.setUser(user);
        order.setDeliveryOption(selection.getDeliveryOption());
        order.setPaymentMethod(selection.getPaymentMethod());
        
        // Create shipping snapshot
        ShippingSnapshot shippingSnapshot = new ShippingSnapshot();
        shippingSnapshot.setName(address.getName());
        shippingSnapshot.setPhone(address.getPhone());
        shippingSnapshot.setStreet(address.getStreet());
        shippingSnapshot.setCity(address.getCity());
        shippingSnapshot.setState(address.getState());
        shippingSnapshot.setPincode(address.getPincode());
        shippingSnapshot.setLandmark(address.getLandmark());
        shippingSnapshot.setAddressType(address.getAddressType());
        order.setShipping(shippingSnapshot);
        
        // Use totals from checkout selection
        Double subtotal = selection.getSubtotal();
        Double shippingFee = selection.getShippingFee();
        Double total = selection.getTotal();
        
        logger.debug("CheckoutSelection found - ID: {}, DeliveryOption: {}, PaymentMethod: {}", 
                    selection.getId(), selection.getDeliveryOption(), selection.getPaymentMethod());
        logger.debug("CheckoutSelection totals - subtotal: {}, shippingFee: {}, total: {}", 
                    subtotal, shippingFee, total);
        
        if (subtotal == null || shippingFee == null || total == null) {
            logger.error("Order totals are null in checkout selection. Subtotal: {}, ShippingFee: {}, Total: {}", 
                        subtotal, shippingFee, total);
            throw new IllegalStateException("Order totals not found in checkout selection");
        }
        
        order.setSubtotal(subtotal);
        order.setShippingFee(shippingFee);
        order.setTotal(total);
        
        // Try to get cart items if they still exist, otherwise create empty order
        List<CartItem> cart = cartRepo.findByUser(user);
        
        if (!cart.isEmpty()) {
            // Create order items from cart
            List<OrderItem> orderItems = cart.stream().map(cartItem -> {
                OrderItem orderItem = new OrderItem();
                orderItem.setOrder(order);
                orderItem.setProduct(cartItem.getProduct());
                orderItem.setQuantity(cartItem.getQuantity());
                orderItem.setPrice(cartItem.getPriceAtAdd());
                
                // Decrement stock
                Product product = cartItem.getProduct();
                Integer stockQuantity = product.getStockQuantity();
                Integer cartQuantity = cartItem.getQuantity();
                int available = stockQuantity != null ? stockQuantity : 0;
                int qty = cartQuantity != null ? cartQuantity : 0;
                int newQty = Math.max(available - qty, 0);
                product.setStockQuantity(newQty);
                product.setInStock(newQty > 0);
                productRepo.save(product);
                return orderItem;
            }).collect(Collectors.toList());
            order.setItems(orderItems);
            
            // Clear cart after order creation
            cartRepo.deleteByUser(user);
            logger.info("Cart cleared for user: {}", user.getEmail());
        } else {
            logger.warn("No cart items found for online payment order, creating empty order items list");
            order.setItems(new ArrayList<>());
        }
        
        // Save order
        Order savedOrder = orderRepo.save(order);
        logger.info("Online payment order created with ID: {} for user: {}", savedOrder.getId(), user.getEmail());
        
        // Update user's order count
        user.incrementTotalOrders();
        
        return savedOrder;
    }

    /**
     * Get all orders for a specific user, ordered by creation date (newest first)
     * @param user The user to get orders for
     * @return List of orders for the user
     */
    public List<Order> getUserOrders(User user) { 
        return orderRepo.findByUserOrderByCreatedAtDesc(user); 
    }
    
    /**
     * Get all orders in the system, ordered by creation date (newest first)
     * @return List of all orders
     */
    public List<Order> getAllOrders() { 
        return orderRepo.findAll().stream()
            .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
            .collect(Collectors.toList());
    }
    
    /**
     * Update the status of an order
     * @param orderId The ID of the order to update
     * @param status The new status
     * @return The updated order
     * @throws RuntimeException if order is not found
     */
    public Order updateStatus(Long orderId, String status) {
        Order order = orderRepo.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));
        
        String oldStatus = order.getStatus();
        order.setStatus(status);
        Order updatedOrder = orderRepo.save(order);
        
        logger.info("Order {} status updated from '{}' to '{}'", orderId, oldStatus, status);
        return updatedOrder;
    }
    
    /**
     * Get order by ID with all details
     * @param orderId The ID of the order
     * @return The order with all details
     * @throws RuntimeException if order is not found
     */
    public Order getOrderById(Long orderId) {
        return orderRepo.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));
    }
    
    /**
     * Get orders by status
     * @param status The status to filter by
     * @return List of orders with the specified status
     */
    public List<Order> getOrdersByStatus(String status) {
        return orderRepo.findByStatusOrderByCreatedAtDesc(status);
    }
    
    /**
     * Get orders for a user by status
     * @param user The user to get orders for
     * @param status The status to filter by
     * @return List of orders for the user with the specified status
     */
    public List<Order> getUserOrdersByStatus(User user, String status) {
        return orderRepo.findByUserAndStatusOrderByCreatedAtDesc(user, status);
    }
    
    /**
     * Get order statistics
     * @return Map containing order statistics
     */
    public java.util.Map<String, Object> getOrderStatistics() {
        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("totalOrders", orderRepo.count());
        stats.put("pendingOrders", orderRepo.countByStatus("pending"));
        stats.put("shippedOrders", orderRepo.countByStatus("shipped"));
        stats.put("deliveredOrders", orderRepo.countByStatus("delivered"));
        stats.put("totalRevenue", orderRepo.getTotalRevenue());
        return stats;
    }
}
