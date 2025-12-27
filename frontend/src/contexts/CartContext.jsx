import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import cartApi from '../services/cartApi';
import wishlistApi from '../services/wishlistApi';
import apiClient from '../services/api';
import couponApi from '../services/couponApi';
import productApi from '../services/productApi';

const CartContext = createContext({});

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);

  // Resolve relative image URLs using API base URL so cart images match product images
  const resolveImageUrl = (candidate) => {
    const src = candidate || '';
    if (!src) return '/assets/images/no_image.png';
    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) return src;
    const base = apiClient?.defaults?.baseURL || '';
    return src.startsWith('/') ? `${base}${src}` : `${base}/${src}`;
  };

  // Simple notification function
  const showNotification = (message, type = 'success') => {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
      type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    }`;
    notification.innerHTML = `
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          ${
            type === 'success'
              ? '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>'
              : '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>'
          }
        </svg>
        <span>${message}</span>
      </div>
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  };

  const { user } = useAuth();

  // Load cart from backend for logged-in users; fallback to local for guests
  useEffect(() => {
    const init = async () => {
      const savedForLater = localStorage.getItem('neenu_saved_items');
      const savedWishlist = localStorage.getItem('neenu_wishlist');
      if (savedForLater) {
        try {
          setSavedItems(JSON.parse(savedForLater));
        } catch {}
      }
      if (savedWishlist) {
        try {
          setWishlistItems(JSON.parse(savedWishlist));
        } catch {}
      }
      if (user?.email) {
        try {
          const serverCart = await cartApi.getCart(user.email);
          // Build a product cache to resolve variant labels
          const uniqueIds = Array.from(new Set((serverCart || []).map(ci => ci.productId).filter(Boolean)));
          const productMap = {};
          for (const pid of uniqueIds) {
            try {
              productMap[pid] = await productApi.getById(pid);
            } catch {}
          }

          const resolveVariantLabel = (pid, vid) => {
            const p = productMap[pid];
            if (!p) return null;
            const variants = Array.isArray(p?.variants) && p.variants.length > 0
              ? p.variants
              : (Array.isArray(p?.metadata?.variants) ? p.metadata.variants : []);
            if (vid && variants.length > 0) {
              const match = variants.find(v => (v?.id || v?.variantId || v?.code) === vid);
              if (match) return match.label || match.weight || match.size || null;
            }
            // fallback for default/no variant
            return p?.weight || p?.size || null;
          };

          setCartItems(
            (serverCart || []).map((ci) => ({
              id: `${ci.productId}-${ci.variantId || 'default'}`,
              productId: ci.productId,
              name: ci.name,
              image: resolveImageUrl(ci.imageUrl || ci.image),
              price: ci.price,
              originalPrice: ci.originalPrice || ci.price,
              quantity: ci.quantity,
              variantId: ci.variantId || null,
              variant: resolveVariantLabel(ci.productId, ci.variantId) || 'Default',
            }))
          );
        } catch {
          const savedCart = localStorage.getItem('neenu_cart');
          if (savedCart) {
            try {
              setCartItems(JSON.parse(savedCart));
            } catch {}
          } else {
            // Add sample cart items for demonstration
            const sampleCartItems = [
              {
                id: 'sample-1',
                name: 'Royal Canin Adult Dog Food - Chicken & Rice',
                description: 'Complete nutritional formula for adult dogs (1-7 years). Made with high-quality protein and precise nutrition for optimal health.',
                image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400&h=400&fit=crop&crop=center',
                price: 899.99,
                originalPrice: 999.99,
                quantity: 1,
                variant: '1kg',
                brand: 'Royal Canin',
                category: 'Dog Food',
                sku: 'RC-DF-001',
                rating: 4.5,
                reviews: 328,
                inStock: true,
                stockCount: 15,
                features: [
                  'High-quality protein for muscle maintenance',
                  'Antioxidants for immune support',
                  'Optimal digestibility',
                  'Balanced nutrition for adult dogs'
                ],
                specifications: {
                  'Life Stage': 'Adult (1-7 years)',
                  'Breed Size': 'All sizes',
                  'Primary Protein': 'Chicken',
                  'Weight': '1kg',
                  'Shelf Life': '18 months'
                },
                nutritionalInfo: {
                  'Crude Protein': '22% min',
                  'Crude Fat': '12% min',
                  'Crude Fiber': '4% max',
                  'Moisture': '10% max'
                }
              },
              {
                id: 'sample-2',
                name: 'Interactive Dog Toy Ball',
                description: 'Engaging puzzle ball that dispenses treats while your dog plays. Made with non-toxic materials and designed for medium-sized dogs.',
                image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=400&fit=crop&crop=center',
                price: 299.99,
                originalPrice: 349.99,
                quantity: 2,
                variant: 'Medium',
                brand: 'PetCo',
                category: 'Dog Toys',
                sku: 'PC-TOY-002',
                rating: 4.2,
                reviews: 156,
                inStock: true,
                stockCount: 8,
                features: [
                  'Treat dispensing mechanism',
                  'Durable rubber construction',
                  'Mental stimulation for dogs',
                  'Easy to clean design'
                ],
                specifications: {
                  'Size': 'Medium (3.5 inches diameter)',
                  'Material': 'Non-toxic rubber',
                  'Weight': '200g',
                  'Age Range': '6 months and up',
                  'Suitable For': 'Dogs 15-50 lbs'
                },
                careInstructions: [
                  'Hand wash with warm soapy water',
                  'Air dry completely',
                  'Inspect regularly for wear',
                  'Replace if damaged'
                ]
              },
              {
                id: 'sample-3',
                name: 'Premium Cat Litter - Clumping Formula',
                description: 'Superior clumping cat litter with odor control technology. Made from natural clay with 99% dust-free formula for your cat\'s health.',
                image: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400&h=400&fit=crop&crop=center',
                price: 599.99,
                originalPrice: 699.99,
                quantity: 1,
                variant: '10kg',
                brand: 'Fresh Step',
                category: 'Cat Litter',
                sku: 'FS-LIT-003',
                rating: 4.7,
                reviews: 892,
                inStock: true,
                stockCount: 25,
                features: [
                  'Superior clumping action',
                  '10-day odor control',
                  '99% dust-free formula',
                  'Low tracking technology',
                  'Safe for multi-cat households'
                ],
                specifications: {
                  'Type': 'Clumping clay litter',
                  'Weight': '10kg',
                  'Coverage': 'Up to 60 days for 1 cat',
                  'Scent': 'Unscented',
                  'Texture': 'Fine granules'
                },
                benefits: [
                  'Easy scooping and cleaning',
                  'Reduces litter box odors',
                  'Safe for cats and humans',
                  'Environmentally conscious'
                ]
              },
              {
                id: 'sample-4',
                name: 'Premium Dog Leash - Reflective Safety',
                description: 'High-quality nylon leash with reflective stitching for night walks. Comfortable padded handle and heavy-duty clip for maximum security.',
                image: 'https://images.unsplash.com/photo-1601758125946-6ec2ef64daf8?w=400&h=400&fit=crop&crop=center',
                price: 449.99,
                originalPrice: 549.99,
                quantity: 1,
                variant: '6ft - Large',
                brand: 'PetSafe',
                category: 'Dog Accessories',
                sku: 'PS-LEA-004',
                rating: 4.6,
                reviews: 445,
                inStock: true,
                stockCount: 12,
                features: [
                  'Reflective stitching for visibility',
                  'Padded handle for comfort',
                  'Heavy-duty metal clip',
                  'Weather-resistant nylon',
                  'Available in multiple colors'
                ],
                specifications: {
                  'Length': '6 feet',
                  'Width': '1 inch',
                  'Material': 'Heavy-duty nylon',
                  'Hardware': 'Zinc alloy',
                  'Weight Capacity': 'Up to 90 lbs'
                },
                safetyFeatures: [
                  'Reflective threading',
                  'Secure locking mechanism',
                  'Reinforced stitching',
                  'Anti-slip handle grip'
                ]
              }
            ];
            setCartItems(sampleCartItems);
            console.log('Added sample cart items for checkout demonstration');
          }
        }
      } else {
        const savedCart = localStorage.getItem('neenu_cart');
        if (savedCart) {
          try {
            setCartItems(JSON.parse(savedCart));
          } catch {}
        } else {
          // Add sample cart items for guest users for demonstration
          const sampleCartItems = [
            {
              id: 'sample-1',
              name: 'Royal Canin Adult Dog Food - Chicken & Rice',
              description: 'Complete nutritional formula for adult dogs (1-7 years). Made with high-quality protein and precise nutrition for optimal health.',
              image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400&h=400&fit=crop&crop=center',
              price: 899.99,
              originalPrice: 999.99,
              quantity: 1,
              variant: '1kg',
              brand: 'Royal Canin',
              category: 'Dog Food',
              sku: 'RC-DF-001',
              rating: 4.5,
              reviews: 328,
              inStock: true,
              stockCount: 15,
              features: [
                'High-quality protein for muscle maintenance',
                'Antioxidants for immune support',
                'Optimal digestibility',
                'Balanced nutrition for adult dogs'
              ],
              specifications: {
                'Life Stage': 'Adult (1-7 years)',
                'Breed Size': 'All sizes',
                'Primary Protein': 'Chicken',
                'Weight': '1kg',
                'Shelf Life': '18 months'
              },
              nutritionalInfo: {
                'Crude Protein': '22% min',
                'Crude Fat': '12% min',
                'Crude Fiber': '4% max',
                'Moisture': '10% max'
              }
            },
            {
              id: 'sample-2',
              name: 'Interactive Dog Toy Ball',
              description: 'Engaging puzzle ball that dispenses treats while your dog plays. Made with non-toxic materials and designed for medium-sized dogs.',
              image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=400&fit=crop&crop=center',
              price: 299.99,
              originalPrice: 349.99,
              quantity: 2,
              variant: 'Medium',
              brand: 'PetCo',
              category: 'Dog Toys',
              sku: 'PC-TOY-002',
              rating: 4.2,
              reviews: 156,
              inStock: true,
              stockCount: 8,
              features: [
                'Treat dispensing mechanism',
                'Durable rubber construction',
                'Mental stimulation for dogs',
                'Easy to clean design'
              ],
              specifications: {
                'Size': 'Medium (3.5 inches diameter)',
                'Material': 'Non-toxic rubber',
                'Weight': '200g',
                'Age Range': '6 months and up',
                'Suitable For': 'Dogs 15-50 lbs'
              },
              careInstructions: [
                'Hand wash with warm soapy water',
                'Air dry completely',
                'Inspect regularly for wear',
                'Replace if damaged'
              ]
            },
            {
              id: 'sample-3',
              name: 'Premium Cat Litter - Clumping Formula',
              description: 'Superior clumping cat litter with odor control technology. Made from natural clay with 99% dust-free formula for your cat\'s health.',
              image: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400&h=400&fit=crop&crop=center',
              price: 599.99,
              originalPrice: 699.99,
              quantity: 1,
              variant: '10kg',
              brand: 'Fresh Step',
              category: 'Cat Litter',
              sku: 'FS-LIT-003',
              rating: 4.7,
              reviews: 892,
              inStock: true,
              stockCount: 25,
              features: [
                'Superior clumping action',
                '10-day odor control',
                '99% dust-free formula',
                'Low tracking technology',
                'Safe for multi-cat households'
              ],
              specifications: {
                'Type': 'Clumping clay litter',
                'Weight': '10kg',
                'Coverage': 'Up to 60 days for 1 cat',
                'Scent': 'Unscented',
                'Texture': 'Fine granules'
              },
              benefits: [
                'Easy scooping and cleaning',
                'Reduces litter box odors',
                'Safe for cats and humans',
                'Environmentally conscious'
              ]
            },
            {
              id: 'sample-4',
              name: 'Premium Dog Leash - Reflective Safety',
              description: 'High-quality nylon leash with reflective stitching for night walks. Comfortable padded handle and heavy-duty clip for maximum security.',
              image: 'https://images.unsplash.com/photo-1601758125946-6ec2ef64daf8?w=400&h=400&fit=crop&crop=center',
              price: 449.99,
              originalPrice: 549.99,
              quantity: 1,
              variant: '6ft - Large',
              brand: 'PetSafe',
              category: 'Dog Accessories',
              sku: 'PS-LEA-004',
              rating: 4.6,
              reviews: 445,
              inStock: true,
              stockCount: 12,
              features: [
                'Reflective stitching for visibility',
                'Padded handle for comfort',
                'Heavy-duty metal clip',
                'Weather-resistant nylon',
                'Available in multiple colors'
              ],
              specifications: {
                'Length': '6 feet',
                'Width': '1 inch',
                'Material': 'Heavy-duty nylon',
                'Hardware': 'Zinc alloy',
                'Weight Capacity': 'Up to 90 lbs'
              },
              safetyFeatures: [
                'Reflective threading',
                'Secure locking mechanism',
                'Reinforced stitching',
                'Anti-slip handle grip'
              ]
            }
          ];
          setCartItems(sampleCartItems);
          console.log('Added sample cart items for guest checkout demonstration');
        }
      }
    };
    init();
  }, [user?.email]);

  // Save cart/saved/wishlist to localStorage
  useEffect(() => {
    localStorage.setItem('neenu_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('neenu_saved_items', JSON.stringify(savedItems));
  }, [savedItems]);

  useEffect(() => {
    localStorage.setItem('neenu_wishlist', JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  // Load wishlist from backend
  useEffect(() => {
    const loadWishlist = async () => {
      if (!user?.email) return;
      try {
        const items = await wishlistApi.getAll(user.email);
        const normalized = (items || []).map((it) => ({
          id: it.productId,
          name: it.productName,
          image: resolveImageUrl(it.productImage),
          price: it.productPrice,
          originalPrice: it.productPrice,
          inStock: it.inStock !== false,
          stockQuantity: it.stockQuantity ?? null,
          category: it.category,
          brand: it.brand,
          addedDate: it.createdAt,
        }));
        setWishlistItems(normalized);
      } catch {
        // silent fallback
      }
    };
    loadWishlist();
  }, [user?.email]);

  const addToCart = async (product, quantity = 1) => {
    const sanitizedProduct = {
      ...product,
      price: parseFloat(product.price) || 0,
      originalPrice: parseFloat(product.originalPrice) || parseFloat(product.price) || 0,
      quantity: parseInt(quantity) || 1,
    };

    const availableStock = sanitizedProduct.stock ?? sanitizedProduct.stockQuantity ?? null;
    if (availableStock !== null) {
      if (parseInt(availableStock) <= 0) {
        showNotification('This product is out of stock', 'error');
        return;
      }
      if (sanitizedProduct.quantity > parseInt(availableStock)) {
        showNotification('Stock limit exceeded', 'error');
        sanitizedProduct.quantity = parseInt(availableStock);
      }
    }

    if (user?.email) {
      try {
        const apiPayload = {
          productId: sanitizedProduct.productId || sanitizedProduct.id,
          quantity: sanitizedProduct.quantity,
        };
        
        // Add variant information if available
        if (sanitizedProduct.variantId) {
          apiPayload.variantId = sanitizedProduct.variantId;
        }
        
        const apiResponse = await cartApi.add(user.email, apiPayload);

        setCartItems((prev) => {
          const key = `${apiPayload.productId}-${sanitizedProduct.variantId || 'default'}`;
          const existingItem = prev.find((item) => item.id === key);
          if (existingItem) {
            showNotification(`Updated ${sanitizedProduct.name} quantity in cart!`);
            return prev.map((item) =>
              item.id === key
                ? {
                    ...item,
                    quantity: apiResponse.quantity,
                    price: apiResponse.price,
                    originalPrice: apiResponse.originalPrice || apiResponse.price,
                    image: resolveImageUrl(apiResponse.imageUrl || item.image),
                    productId: apiPayload.productId,
                    variantId: sanitizedProduct.variantId || null,
                  }
                : item
            );
          } else {
            showNotification(`${sanitizedProduct.name} added to cart!`);
            return [
              ...prev,
              {
                id: key,
                name: apiResponse.name,
                image: resolveImageUrl(apiResponse.imageUrl),
                price: apiResponse.price,
                originalPrice: apiResponse.originalPrice || apiResponse.price,
                quantity: apiResponse.quantity,
                variant: sanitizedProduct.variant || 'Default',
                category: sanitizedProduct.category,
                brand: sanitizedProduct.brand,
                productId: apiPayload.productId,
                variantId: sanitizedProduct.variantId || null,
              },
            ];
          }
        });
      } catch (error) {
        showNotification(error?.message || 'Failed to add to cart. Please try again.', 'error');
        return;
      }
    } else {
      // Guest user
      setCartItems((prev) => {
        const key = `${sanitizedProduct.productId || sanitizedProduct.id}-${sanitizedProduct.variantId || 'default'}`;
        const existingItem = prev.find((item) => item.id === key);
        const currentQty = existingItem ? parseInt(existingItem.quantity) || 0 : 0;
        const requestedQty = parseInt(quantity) || 1;
        let newQty = currentQty + requestedQty;
        if (availableStock !== null && newQty > parseInt(availableStock)) {
          showNotification('Stock limit exceeded', 'error');
          newQty = parseInt(availableStock);
        }

        if (existingItem) {
          showNotification(`Updated ${sanitizedProduct.name} quantity in cart!`);
          return prev.map((item) =>
            item.id === key ? { ...item, quantity: newQty } : item
          );
        } else {
          showNotification(`${sanitizedProduct.name} added to cart!`);
          return [
            ...prev,
            {
              ...sanitizedProduct,
              id: key,
              quantity: Math.max(1, Math.min(requestedQty, availableStock ?? requestedQty)),
            },
          ];
        }
      });
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity: newQuantity } : item))
    );
    if (user?.email) {
      try {
        // For authenticated users, persist by actual productId (DTO provides productId)
        const cartItem = cartItems.find((ci) => ci.id === itemId);
        const productId = cartItem?.productId || itemId;
        const variantId = cartItem?.variantId || cartItem?.variant?.id || undefined;
        await cartApi.update(user.email, { productId, quantity: newQuantity, variantId });
      } catch {}
    }
  };

  const removeFromCart = async (itemId) => {
    const item = cartItems.find((ci) => ci.id === itemId);
    setCartItems((prev) => prev.filter((i) => i.id !== itemId));
    if (user?.email && item) {
      try {
        await cartApi.remove(user.email, { productId: item.productId || itemId, variantId: item.variantId || undefined });
      } catch {}
    }
  };

  const saveForLater = (itemId) => {
    const item = cartItems.find((item) => item.id === itemId);
    if (item) {
      setSavedItems((prev) => [...prev, { ...item, quantity: 1 }]);
      removeFromCart(itemId);
    }
  };

  const moveToCart = (item) => {
    addToCart(item, 1);
    setSavedItems((prev) => prev.filter((saved) => saved.id !== item.id));
  };

  const removeFromSaved = (itemId) => {
    setSavedItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Coupon handling
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);

  const applyCoupon = async ({ code, context = {} }) => {
    const subtotal = getCartTotal();
    if (!code || subtotal <= 0) {
      setAppliedCoupon(null);
      setCouponDiscount(0);
      return { valid: false, reason: 'No items in cart' };
    }
    const { petType = null, category = null, subcategory = null } = context;
    const res = await couponApi.validate({ code, subtotal, petType, category, subcategory });
    if (!res.valid) {
      setAppliedCoupon(null);
      setCouponDiscount(0);
      return res;
    }
    setAppliedCoupon({ code, meta: res?.coupon });
    setCouponDiscount(res?.discount || 0);
    return { valid: true, discount: res?.discount || 0 };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
  };

  const getCartTotal = () => {
    return cartItems.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 0;
      return sum + price * quantity;
    }, 0);
  };

  const getCartItemCount = () => {
    return cartItems.reduce((count, item) => count + (parseInt(item.quantity) || 0), 0);
  };

  const addToWishlist = async (product) => {
    const already = wishlistItems.some((w) => w.id === product.id);
    if (already) {
      showNotification(`${product.name} is already in wishlist!`, 'error');
      return;
    }
    if (user?.email) {
      try {
        await wishlistApi.add(user.email, { productId: product.id });
        showNotification(`${product.name} added to wishlist!`);
        setWishlistItems((prev) => [...prev, { inStock: true, ...product }]);
        return;
      } catch (e) {
        showNotification(e?.message || 'Failed to add to wishlist', 'error');
        return;
      }
    }
    showNotification(`${product.name} added to wishlist!`);
    setWishlistItems((prev) => [...prev, { inStock: true, ...product }]);
  };

  const removeFromWishlist = async (productId) => {
    if (user?.email) {
      try {
        await wishlistApi.remove(user.email, { productId });
      } catch (e) {
        showNotification(e?.message || 'Failed to remove from wishlist', 'error');
      }
    }
    setWishlistItems((prev) => {
      const product = prev.find((item) => item.id === productId);
      if (product) {
        showNotification(`${product.name} removed from wishlist!`);
      }
      return prev.filter((item) => item.id !== productId);
    });
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some((item) => item.id === productId);
  };

  const value = {
    cartItems,
    savedItems,
    wishlistItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    saveForLater,
    moveToCart,
    removeFromSaved,
    clearCart,
    getCartTotal,
    getCartItemCount,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    appliedCoupon,
    couponDiscount,
    applyCoupon,
    removeCoupon,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
