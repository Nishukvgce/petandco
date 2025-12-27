package com.eduprajna.Controller;

import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.eduprajna.entity.Order;
import com.eduprajna.entity.User;
import com.eduprajna.repository.OrderRepository;
import com.eduprajna.service.OrderService;
import com.eduprajna.service.RazorpayService;
import com.eduprajna.service.UserService;

@RestController
@RequestMapping("/api/payments/razorpay")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}, allowCredentials = "true")
public class PaymentController {
    private static final Logger logger = LoggerFactory.getLogger(PaymentController.class);

    private final RazorpayService razorpayService;
    private final OrderService orderService;
    private final UserService userService;
    private final OrderRepository orderRepo;
    private final com.eduprajna.service.CartService cartService;
    private final com.eduprajna.repository.CheckoutSelectionRepository selectionRepo;
    private final com.eduprajna.repository.AddressRepository addressRepo;

    @Value("${razorpay.keyId:}")
    private String razorpayKeyId;

    public PaymentController(RazorpayService razorpayService, OrderService orderService, UserService userService, OrderRepository orderRepo,
                             com.eduprajna.service.CartService cartService,
                             com.eduprajna.repository.CheckoutSelectionRepository selectionRepo,
                             com.eduprajna.repository.AddressRepository addressRepo) {
        this.razorpayService = razorpayService;
        this.orderService = orderService;
        this.userService = userService;
        this.orderRepo = orderRepo;
        this.cartService = cartService;
        this.selectionRepo = selectionRepo;
        this.addressRepo = addressRepo;
    }

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestParam("email") String email) {
        try {
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Email is required");
            }

            User user = userService.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

            // Get checkout selection
            com.eduprajna.entity.CheckoutSelection selection = selectionRepo.findByUser(user).orElse(null);
            if (selection == null) {
                return ResponseEntity.badRequest().body("No checkout selection found. Please complete checkout steps.");
            }

            if (selection.getAddressId() == null) {
                return ResponseEntity.badRequest().body("No address selected. Please select a delivery address.");
            }

            com.eduprajna.entity.Address address = addressRepo.findById(selection.getAddressId()).orElse(null);
            if (address == null) {
                return ResponseEntity.badRequest().body("Selected address not found. Please select a valid address.");
            }

            // Use totals from checkout selection (stored when user completed checkout form)
            Double subtotal = selection.getSubtotal();
            Double shippingFee = selection.getShippingFee();
            Double total = selection.getTotal();

            // Fallback: If totals not stored, try to calculate from current cart
            if (subtotal == null || total == null) {
                java.util.List<com.eduprajna.entity.CartItem> cart = cartService.getCart(user);
                if (cart == null || cart.isEmpty()) {
                    return ResponseEntity.badRequest().body("Your cart is empty. Please add items before checkout.");
                }

                // Calculate subtotal using cart item prices, with fallback to product price
                subtotal = 0.0;
                for (com.eduprajna.entity.CartItem ci : cart) {
                    Double priceAtAdd = ci.getPriceAtAdd();
                    Double productPrice = ci.getProduct().getPrice();
                    double price = (priceAtAdd != null && priceAtAdd > 0) ? priceAtAdd : 
                                   (productPrice != null ? productPrice : 0.0);
                    subtotal += price * ci.getQuantity();
                    logger.debug("Cart item: product={}, quantity={}, price={}, line_total={}", 
                        ci.getProduct().getName(), ci.getQuantity(), price, price * ci.getQuantity());
                }
                
                shippingFee = "express".equalsIgnoreCase(selection.getDeliveryOption()) ? 100.0 : 50.0;
                total = subtotal + shippingFee;
                
                // Save calculated totals back to selection for order service
                selection.setSubtotal(subtotal);
                selection.setShippingFee(shippingFee);
                selection.setTotal(total);
                selectionRepo.save(selection);
                logger.debug("Saved calculated totals to checkout selection: subtotal={}, shippingFee={}, total={}", 
                           subtotal, shippingFee, total);
            }

            logger.debug("Razorpay order amount: {} INR = subtotal: {}, shipping: {}", total, subtotal, shippingFee);

            long amountPaise = Math.round(total * 100);

            String receipt = "receipt_" + System.currentTimeMillis() + "_" + user.getId();

            Map<String, Object> created = razorpayService.createOrder(amountPaise, "INR", receipt);

            Map<String, Object> resp = new HashMap<>();
            resp.put("key", razorpayKeyId);
            resp.put("razorpay_order_id", created.get("id"));
            resp.put("amount", created.get("amount"));
            resp.put("currency", created.get("currency"));
            resp.put("receipt", created.get("receipt"));
            resp.put("total", total);

            return ResponseEntity.ok(resp);

        } catch (Exception e) {
            logger.error("Failed to create razorpay order for {}", email, e);
            return ResponseEntity.status(500).body("Failed to create razorpay order");
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@RequestBody Map<String, String> body) {
        try {
            String email = body.get("email");
            String rzpPaymentId = body.get("razorpay_payment_id");
            String rzpOrderId = body.get("razorpay_order_id");
            String rzpSignature = body.get("razorpay_signature");

            if (email == null || rzpPaymentId == null || rzpOrderId == null || rzpSignature == null) {
                logger.warn("Payment verification: Missing required fields for email: {}", email);
                return ResponseEntity.badRequest().body(Map.of("error", "Missing required fields"));
            }

            logger.info("Verifying payment for email: {}, orderId: {}", email, rzpOrderId);

            try {
                // Verify signature
                razorpayService.verifySignature(rzpPaymentId, rzpOrderId, rzpSignature);
                logger.info("Signature verified successfully for payment: {}", rzpPaymentId);
            } catch (Exception e) {
                logger.error("Payment signature verification failed for email: {}", email, e);
                return ResponseEntity.status(400).body(Map.of("error", "Payment verification failed: " + e.getMessage()));
            }

            // Place the application order using online payment method (doesn't require cart)
            User user = userService.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
            
            // CRUCIAL: Ensure totals are calculated before placing order
            com.eduprajna.entity.CheckoutSelection selection = selectionRepo.findByUser(user).orElse(null);
            if (selection != null && (selection.getSubtotal() == null || selection.getTotal() == null)) {
                logger.warn("Totals missing in checkout selection for payment verification. Calculating fallback totals for user: {}", email);
                
                // Calculate totals as fallback
                java.util.List<com.eduprajna.entity.CartItem> cart = cartService.getCart(user);
                if (cart != null && !cart.isEmpty()) {
                    double subtotal = 0.0;
                    for (com.eduprajna.entity.CartItem ci : cart) {
                        Double priceAtAdd = ci.getPriceAtAdd();
                        Double productPrice = ci.getProduct().getPrice();
                        double price = (priceAtAdd != null && priceAtAdd > 0) ? priceAtAdd : 
                                       (productPrice != null ? productPrice : 0.0);
                        subtotal += price * ci.getQuantity();
                    }
                    
                    double shippingFee = "express".equalsIgnoreCase(selection.getDeliveryOption()) ? 100.0 : 50.0;
                    double total = subtotal + shippingFee;
                    
                    selection.setSubtotal(subtotal);
                    selection.setShippingFee(shippingFee);
                    selection.setTotal(total);
                    selectionRepo.save(selection);
                    
                    logger.info("Saved fallback totals to checkout selection for user: {} - subtotal: {}, shippingFee: {}, total: {}", 
                               email, subtotal, shippingFee, total);
                }
            }
            
            Order placed = orderService.placeOrderForOnlinePayment(user);

            // Update order with payment data
            placed.setRazorpayOrderId(rzpOrderId);
            placed.setRazorpayPaymentId(rzpPaymentId);
            placed.setPaymentStatus("paid");
            placed.setStatus("paid");
            Order updated = orderRepo.save(placed);
            
            logger.info("Order placed successfully for user: {}, orderId: {}", email, updated.getId());

            // Return a simplified response to avoid JSON nesting issues
            Map<String, Object> orderResponse = new HashMap<>();
            orderResponse.put("id", updated.getId());
            orderResponse.put("status", updated.getStatus());
            orderResponse.put("paymentStatus", updated.getPaymentStatus());
            orderResponse.put("total", updated.getTotal());
            orderResponse.put("createdAt", updated.getCreatedAt());
            orderResponse.put("razorpayOrderId", updated.getRazorpayOrderId());
            orderResponse.put("razorpayPaymentId", updated.getRazorpayPaymentId());

            Map<String, Object> resp = new HashMap<>();
            resp.put("order", orderResponse);
            resp.put("success", true);
            resp.put("message", "Payment verified and order created successfully");
            return ResponseEntity.ok(resp);

        } catch (Exception e) {
            logger.error("Payment verification failed", e);
            return ResponseEntity.status(500).body(Map.of("error", "Payment verification failed: " + e.getMessage()));
        }
    }
}