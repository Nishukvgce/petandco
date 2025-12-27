import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import CartItem from './components/CartItem';
import OrderSummary from './components/OrderSummary';
import EmptyCart from './components/EmptyCart';
import RelatedProducts from './components/RelatedProducts';
import SavedItems from './components/SavedItems';

import Button from '../../components/ui/Button';

const ShoppingCart = () => {
  const { 
    cartItems, 
    savedItems, 
    updateQuantity, 
    removeFromCart, 
    saveForLater, 
    moveToCart, 
    removeFromSaved,
    addToCart,
    appliedCoupon,
    couponDiscount,
    applyCoupon,
    removeCoupon
  } = useCart();
  const [pincode, setPincode] = useState('');
  const [shippingLocation, setShippingLocation] = useState('');

  // Calculate totals
  const subtotal = cartItems?.reduce((sum, item) => {
    const price = parseFloat(item?.price) || 0;
    const quantity = parseInt(item?.quantity) || 0;
    return sum + (price * quantity);
  }, 0);
  const discount = couponDiscount || 0;
  const discountedSubtotal = subtotal - discount;
  
  // Shipping calculation based on location
  const getShippingCost = () => {
    if (shippingLocation === 'bengaluru') {
      return discountedSubtotal >= 499 ? 0 : 49;
    } else if (shippingLocation === 'other') {
      return discountedSubtotal >= 999 ? 0 : 99;
    }
    return 0;
  };
  
  const shipping = getShippingCost();
  const total = discountedSubtotal + shipping;

  const handleUpdateQuantity = (itemId, newQuantity) => {
    updateQuantity(itemId, newQuantity);
  };

  const handleRemoveItem = (itemId) => {
    removeFromCart(itemId);
  };

  const handleSaveForLater = (itemId) => {
    saveForLater(itemId);
  };

  const handleMoveToCart = (item) => {
    moveToCart(item);
  };

  const handleRemoveFromSaved = (itemId) => {
    removeFromSaved(itemId);
  };

  const handleApplyCoupon = async (couponCode) => {
    if (!couponCode) { removeCoupon(); return; }
    const res = await applyCoupon({ code: couponCode, context: {} });
    if (!res.valid) {
      alert(res.reason || 'Invalid coupon');
    }
  };

  const handlePincodeChange = (newPincode) => {
    setPincode(newPincode);
    // Mock pincode validation
    const bengaluruPincodes = ['560001', '560002', '560003', '560004', '560005'];
    if (bengaluruPincodes?.includes(newPincode)) {
      setShippingLocation('bengaluru');
    } else {
      setShippingLocation('other');
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
  };

  const breadcrumbItems = [
    { label: 'Home', path: '/homepage' },
    { label: 'Shopping Cart', path: '/shopping-cart' }
  ];

  return (
    <>
      <Helmet>
        <title>Shopping Cart - PET&CO | Review Your Natural Products</title>
        <meta name="description" content="Review and modify your cart items. Secure checkout with natural and organic food products. Free shipping available on orders above ₹499 in Bengaluru." />
        <meta name="keywords" content="shopping cart, natural products, organic food, checkout, free shipping, PET&CO" />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Header 
          cartItemCount={cartItems?.length}
          cartItems={cartItems}
          onSearch={(query) => console.log('Search:', query)}
        />

        <main className="container mx-auto px-4 py-6">
          <Breadcrumb customItems={breadcrumbItems} />

          {cartItems?.length === 0 ? (
            <EmptyCart />
          ) : (
            <>
              {/* Checkout Progress */}
              <div className="bg-card border border-border rounded-warm-lg p-6 mb-6">
                <h2 className="font-heading font-bold text-lg text-foreground mb-4">
                  Checkout Process
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-3 p-3 bg-primary/10 rounded-warm-md border border-primary/20">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                      1
                    </div>
                    <div>
                      <p className="font-body font-semibold text-sm text-primary">Cart</p>
                      <p className="font-body text-xs text-muted-foreground">Review items</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-warm-md">
                    <div className="w-8 h-8 bg-muted text-muted-foreground rounded-full flex items-center justify-center font-bold text-sm">
                      2
                    </div>
                    <div>
                      <p className="font-body font-semibold text-sm text-foreground">Shipping</p>
                      <p className="font-body text-xs text-muted-foreground">Address & delivery</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-warm-md">
                    <div className="w-8 h-8 bg-muted text-muted-foreground rounded-full flex items-center justify-center font-bold text-sm">
                      3
                    </div>
                    <div>
                      <p className="font-body font-semibold text-sm text-foreground">Payment</p>
                      <p className="font-body text-xs text-muted-foreground">Choose method</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-warm-md">
                    <div className="w-8 h-8 bg-muted text-muted-foreground rounded-full flex items-center justify-center font-bold text-sm">
                      4
                    </div>
                    <div>
                      <p className="font-body font-semibold text-sm text-foreground">Review</p>
                      <p className="font-body text-xs text-muted-foreground">Place order</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cart Header */}
              <div className="flex items-center justify-between mb-6">
                <h1 className="font-heading font-bold text-2xl lg:text-3xl text-foreground">
                  Shopping Cart ({cartItems?.length} {cartItems?.length === 1 ? 'item' : 'items'})
                </h1>
                <Link to="/">
                  <Button variant="ghost" iconName="ArrowLeft" iconPosition="left">
                    Continue Shopping
                  </Button>
                </Link>
              </div>

              {/* Main Cart Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items - Left Column */}
                <div className="lg:col-span-2">
                  <div className="space-y-4">
                    {cartItems?.map((item) => (
                      <CartItem
                        key={item?.id}
                        item={item}
                        onUpdateQuantity={handleUpdateQuantity}
                        onRemoveItem={handleRemoveItem}
                        onSaveForLater={handleSaveForLater}
                      />
                    ))}
                  </div>

                  {/* Saved Items */}
                  <SavedItems
                    savedItems={savedItems}
                    onMoveToCart={handleMoveToCart}
                    onRemoveFromSaved={handleRemoveFromSaved}
                  />
                </div>

                {/* Order Summary - Right Column */}
                <div className="lg:col-span-1">
                  <OrderSummary
                    subtotal={subtotal}
                    discount={discount}
                    shipping={shipping}
                    total={total}
                    onApplyCoupon={handleApplyCoupon}
                    appliedCoupon={appliedCoupon}
                    onPincodeChange={handlePincodeChange}
                    pincode={pincode}
                    shippingLocation={shippingLocation}
                  />
                </div>
              </div>

              {/* Related Products */}
              <RelatedProducts onAddToCart={handleAddToCart} />
            </>
          )}
        </main>

        {/* Mobile Sticky Checkout */}
        {cartItems?.length > 0 && (
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 shadow-warm-lg z-50">
            <div className="flex items-center justify-between mb-2">
              <span className="font-body text-sm text-muted-foreground">
                Total ({cartItems?.length} items)
              </span>
              <span className="font-data font-bold text-lg text-foreground">
                ₹{total?.toFixed(2)}
              </span>
            </div>
            <Link to="/checkout-process">
              <Button
                variant="default"
                fullWidth
                size="lg"
                iconName="ArrowRight"
                iconPosition="right"
              >
                Proceed to Checkout
              </Button>
            </Link>
          </div>
        )}

        {/* Footer Spacer for Mobile */}
        {cartItems?.length > 0 && <div className="lg:hidden h-24" />}
      </div>
    </>
  );
};

export default ShoppingCart;