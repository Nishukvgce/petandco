import React, { useState } from 'react';
import Image from '../../../components/AppImage';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const OrderSummary = ({ 
  cartItems = [], 
  subtotal = 0, 
  shipping = 0, 
  discount = 0, 
  total = 0,
  onApplyCoupon,
  appliedCoupon = null,
  isCollapsible = false 
}) => {
  const [isExpanded, setIsExpanded] = useState(!isCollapsible);
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');

  const mockCartItems = [
    {
      id: 1,
      name: 'Organic Turmeric Powder',
      variant: '250g',
      price: 299,
      originalPrice: 349,
      quantity: 2,
      image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&h=400&fit=crop'
    },
    {
      id: 2,
      name: 'Cold Pressed Coconut Oil',
      variant: '500ml',
      price: 450,
      originalPrice: 500,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop'
    },
    {
      id: 3,
      name: 'Himalayan Pink Salt',
      variant: '1kg',
      price: 199,
      originalPrice: 249,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1518843875459-f738682238a6?w=400&h=400&fit=crop'
    }
  ];

  const items = cartItems?.length > 0 ? cartItems : mockCartItems;
  const calculatedSubtotal = subtotal || items?.reduce((sum, item) => sum + (item?.price * item?.quantity), 0);
  const calculatedShipping = shipping || (calculatedSubtotal >= 499 ? 0 : 49);
  const calculatedDiscount = discount || 0;
  const calculatedTotal = total || (calculatedSubtotal + calculatedShipping - calculatedDiscount);

  const handleApplyCoupon = () => {
    setCouponError('');
    
    if (!couponCode?.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    if (onApplyCoupon) {
      onApplyCoupon(couponCode?.toUpperCase());
      setCouponCode('');
    }
  };

  const handleRemoveCoupon = () => {
    if (onApplyCoupon) {
      onApplyCoupon(null);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Header - Collapsible on mobile */}
      {isCollapsible && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-4 flex items-center justify-between bg-muted/30 hover:bg-muted/50 transition-colors duration-200"
        >
          <div className="flex items-center space-x-2">
            <Icon name="ShoppingCart" size={20} />
            <span className="font-heading font-semibold text-foreground">
              Order Summary ({items?.length} items)
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-data font-semibold text-foreground">
              ₹{calculatedTotal?.toFixed(2)}
            </span>
            <Icon 
              name="ChevronDown" 
              size={16} 
              className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            />
          </div>
        </button>
      )}
      {/* Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {!isCollapsible && (
            <h3 className="font-heading font-semibold text-lg text-foreground">
              Order Summary
            </h3>
          )}

          {/* Cart Items */}
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {items?.map((item) => (
              <div key={item?.id} className="flex items-center space-x-3">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={item?.image}
                    alt={item?.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-data font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {item?.quantity}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-body font-medium text-sm text-foreground truncate">
                    {item?.name}
                  </h4>
                  <p className="font-caption text-xs text-muted-foreground">
                    {item?.variant}
                  </p>
                </div>
                
                <div className="text-right">
                  <p className="font-data font-semibold text-sm text-foreground">
                    ₹{(item?.price * item?.quantity)?.toFixed(2)}
                  </p>
                  {item?.originalPrice && item?.originalPrice > item?.price && (
                    <p className="font-data text-xs text-muted-foreground line-through">
                      ₹{(item?.originalPrice * item?.quantity)?.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Coupon Section */}
          <div className="border-t border-border pt-4">
            {appliedCoupon ? (
              <div className="flex items-center justify-between p-3 bg-success/10 border border-success/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Icon name="Tag" size={16} className="text-success" />
                  <span className="font-body font-medium text-success">
                    {(appliedCoupon?.code || appliedCoupon)} Applied
                  </span>
                </div>
                <button
                  onClick={handleRemoveCoupon}
                  className="text-success hover:text-success/80 transition-colors duration-200"
                >
                  <Icon name="X" size={16} />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <Input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e?.target?.value?.toUpperCase())}
                    error={couponError}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleApplyCoupon}
                    disabled={!couponCode?.trim()}
                  >
                    Apply
                  </Button>
                </div>
                {couponError && (
                  <p className="font-body text-xs text-destructive">{couponError}</p>
                )}
              </div>
            )}
          </div>

          {/* Order Totals */}
          <div className="border-t border-border pt-4 space-y-2">
            <div className="flex justify-between font-body text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-data font-medium">₹{calculatedSubtotal?.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between font-body text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span className="font-data font-medium">
                {calculatedShipping === 0 ? 'Free' : `₹${calculatedShipping?.toFixed(2)}`}
              </span>
            </div>
            
            {calculatedDiscount > 0 && (
              <div className="flex justify-between font-body text-sm">
                <span className="text-success">Discount ({appliedCoupon?.code || appliedCoupon})</span>
                <span className="font-data font-medium text-success">
                  -₹{calculatedDiscount?.toFixed(2)}
                </span>
              </div>
            )}
            
            <div className="flex justify-between font-heading font-semibold text-base pt-2 border-t border-border">
              <span>Total</span>
              <span className="font-data">₹{calculatedTotal?.toFixed(2)}</span>
            </div>
          </div>

          {/* Free Shipping Notice */}
          {calculatedSubtotal < 499 && (
            <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
              <p className="font-caption text-xs text-warning-foreground">
                Add ₹{(499 - calculatedSubtotal)?.toFixed(2)} more for free shipping!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderSummary;