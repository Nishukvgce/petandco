package com.eduprajna.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.eduprajna.entity.CartItem;
import com.eduprajna.entity.Product;
import com.eduprajna.entity.User;
import com.eduprajna.repository.CartItemRepository;
import com.eduprajna.repository.ProductRepository;

@Service
public class CartService {
    private final CartItemRepository cartRepo;
    private final ProductRepository productRepo;

    public CartService(CartItemRepository cartRepo, ProductRepository productRepo) {
        this.cartRepo = cartRepo;
        this.productRepo = productRepo;
    }

    public List<CartItem> getCart(User user) {
        return cartRepo.findByUser(user);
    }

    public CartItem addToCart(User user, Long productId, int quantity) {
        return addToCart(user, productId, quantity, null);
    }

    public CartItem addToCart(User user, Long productId, int quantity, String variantId) {
        Product product = productRepo.findById(productId).orElseThrow();
        
        // Check variant-specific stock if variant is provided
        if (variantId != null && !variantId.isEmpty() && product.hasVariants()) {
            if (!product.isVariantInStock(variantId)) {
                throw new IllegalStateException("Product variant is out of stock");
            }
            Integer variantStock = product.getVariantStock(variantId);
            if (variantStock != null && variantStock <= 0) {
                throw new IllegalStateException("Product variant is out of stock");
            }
        } else {
            // Fallback to main product stock checking
            Integer stockQty = product.getStockQuantity();
            boolean explicitlyOutOfStock = product.getInStock() != null && !product.getInStock();
            if (explicitlyOutOfStock) {
                throw new IllegalStateException("Product is out of stock");
            }
            if (stockQty != null && stockQty <= 0) {
                throw new IllegalStateException("Product is out of stock");
            }
        }
        
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be at least 1");
        }
        
        // Look for existing cart item with same product and variant
        Optional<CartItem> existing = cartRepo.findByUser(user).stream()
            .filter(item -> item.getProduct().getId().equals(product.getId()) && 
                          java.util.Objects.equals(item.getVariantId(), variantId))
            .findFirst();
        CartItem item = existing.orElseGet(() -> {
            CartItem ci = new CartItem();
            ci.setUser(user);
            ci.setProduct(product);
            ci.setVariantId(variantId); // Store variant ID
            // Determine snapshot price: variant price if available else product price
            Double price = null;
            if (variantId != null && !variantId.isEmpty() && product.hasVariants()) {
                try {
                    java.util.List<java.util.Map<String, Object>> vars = product.getVariants();
                    if (vars != null) {
                        for (java.util.Map<String, Object> v : vars) {
                            if (variantId.equals(v.get("id"))) {
                                Object p = v.get("price");
                                if (p instanceof Number) price = ((Number) p).doubleValue();
                                else if (p instanceof String) price = Double.parseDouble((String) p);
                                break;
                            }
                        }
                    }
                } catch (Exception ignored) { }
            }
            if (price == null) price = product.getPrice();
            ci.setPriceAtAdd(price != null ? price : 0.0);
            ci.setQuantity(0);
            return ci;
        });
        
        // Update variant ID if different (in case user changes variant for existing cart item)
        if (variantId != null && !variantId.equals(item.getVariantId())) {
            item.setVariantId(variantId);
            // Also update snapshot price to the newly selected variant price
            if (product.hasVariants()) {
                try {
                    java.util.List<java.util.Map<String, Object>> vars = product.getVariants();
                    for (java.util.Map<String, Object> v : vars) {
                        if (variantId.equals(v.get("id"))) {
                            Object p = v.get("price");
                            Double price = null;
                            if (p instanceof Number) price = ((Number) p).doubleValue();
                            else if (p instanceof String) price = Double.parseDouble((String) p);
                            if (price != null) item.setPriceAtAdd(price);
                            break;
                        }
                    }
                } catch (Exception ignored) { }
            }
        }
        
        Integer currentQty = item.getQuantity();
        int current = currentQty != null ? currentQty : 0;
        int newQty = current + quantity;
        
        // Check stock limit against variant or main product
        Integer stockLimit;
        if (variantId != null && !variantId.isEmpty() && product.hasVariants()) {
            stockLimit = product.getVariantStock(variantId);
        } else {
            stockLimit = product.getStockQuantity();
        }
        
        if (stockLimit != null && newQty > stockLimit) {
            throw new IllegalStateException("Stock limit exceeded. Available: " + stockLimit);
        }
        
        item.setQuantity(Math.max(1, newQty));
        return cartRepo.save(item);
    }

    public CartItem updateQuantity(User user, Long productId, int quantity) {
        return updateQuantity(user, productId, quantity, null);
    }

    public CartItem updateQuantity(User user, Long productId, int quantity, String variantId) {
        Product product = productRepo.findById(productId).orElseThrow();
        Optional<CartItem> existingOpt = (variantId != null && !variantId.isEmpty())
            ? cartRepo.findByUserAndProductAndVariantId(user, product, variantId)
            : cartRepo.findByUserAndProduct(user, product);
        CartItem item = existingOpt.orElseThrow();
        // Stock checks
        Integer stockQty = null;
        if ((variantId != null && !variantId.isEmpty()) || (item.getVariantId() != null && !item.getVariantId().isEmpty())) {
            String vId = (variantId != null && !variantId.isEmpty()) ? variantId : item.getVariantId();
            if (product.hasVariants()) {
                stockQty = product.getVariantStock(vId);
            }
        }
        if (stockQty == null) {
            stockQty = product.getStockQuantity();
        }
        boolean explicitlyOutOfStock = product.getInStock() != null && !product.getInStock();
        if (explicitlyOutOfStock) {
            throw new IllegalStateException("Product is out of stock");
        }
        if (stockQty != null && stockQty <= 0) {
            throw new IllegalStateException("Product is out of stock");
        }
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be at least 1");
        }
        if (stockQty != null && quantity > stockQty) {
            throw new IllegalStateException("Stock limit exceeded. Available: " + stockQty);
        }
        item.setQuantity(quantity);
        return cartRepo.save(item);
    }

    public void removeItem(User user, Long productId) {
        removeItem(user, productId, null);
    }

    public void removeItem(User user, Long productId, String variantId) {
        Product product = productRepo.findById(productId).orElseThrow();
        if (variantId != null && !variantId.isEmpty()) {
            java.util.Optional<CartItem> match = cartRepo.findByUserAndProductAndVariantId(user, product, variantId);
            if (match.isPresent()) {
                cartRepo.deleteById(match.get().getId());
                return;
            }
            // Fallback: some historical items may have null variant for default variant
            cartRepo.findByUserAndProduct(user, product).ifPresent(ci -> cartRepo.deleteById(ci.getId()));
        } else {
            cartRepo.findByUserAndProduct(user, product)
                .ifPresent(ci -> cartRepo.deleteById(ci.getId()));
        }
    }

    public void clearCart(User user) {
        cartRepo.deleteByUser(user);
    }
}
