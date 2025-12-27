import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import { Link } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const OrderSummary = ({ 
  subtotal, 
  discount, 
  shipping, 
  total, 
  onApplyCoupon, 
  appliedCoupon,
  onPincodeChange,
  pincode,
  shippingLocation 
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [pincodeInput, setPincodeInput] = useState(pincode || '');

  const handleApplyCoupon = () => {
    if (couponCode?.trim()) {
      onApplyCoupon(couponCode);
      setCouponCode('');
    }
  };

  const handlePincodeSubmit = () => {
    if (pincodeInput?.trim()) {
      onPincodeChange(pincodeInput);
    }
  };

  const freeShippingThreshold = shippingLocation === 'bengaluru' ? 499 : 999;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-warm sticky top-4">
      <h2 className="font-heading font-semibold text-lg text-foreground mb-4">
        Order Summary
      </h2>
      {/* Shipping Calculator */}
      <div className="mb-6">
        <h3 className="font-body font-medium text-foreground mb-3">
          Delivery Location
        </h3>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Enter pincode"
            value={pincodeInput}
            onChange={(e) => setPincodeInput(e?.target?.value)}
            className="flex-1"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handlePincodeSubmit}
            iconName="MapPin"
            iconSize={16}
          >
            Check
          </Button>
        </div>
        {shippingLocation && (
          <p className="font-caption text-sm text-muted-foreground mt-2">
            Delivering to: {shippingLocation === 'bengaluru' ? 'Bengaluru' : 'Other Cities'}
          </p>
        )}
      </div>
      {/* Free Shipping Progress */}
      {remainingForFreeShipping > 0 && (
        <div className="mb-6 p-4 bg-warning/10 border border-warning/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="Truck" size={16} className="text-warning" />
            <p className="font-caption text-sm font-medium text-warning-foreground">
              Add ₹{remainingForFreeShipping?.toFixed(2)} more for FREE shipping!
            </p>
          </div>
          <div className="w-full bg-warning/20 rounded-full h-2">
            <div 
              className="bg-warning h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
            />
          </div>
        </div>
      )}
      {/* Coupon Code */}
      <div className="mb-6">
        <h3 className="font-body font-medium text-foreground mb-3">
          Coupon Code
        </h3>
        {appliedCoupon ? (
          <div className="flex items-center justify-between p-3 bg-success/10 border border-success/20 rounded-lg">
            <div className="flex items-center gap-2">
              <Icon name="Tag" size={16} className="text-success" />
              <span className="font-data font-medium text-success">
                {appliedCoupon?.code}
              </span>
            </div>
            <button
              onClick={() => onApplyCoupon(null)}
              className="text-success hover:text-success/80 transition-colors duration-200"
            >
              <Icon name="X" size={16} />
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e?.target?.value?.toUpperCase())}
              className="flex-1"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleApplyCoupon}
              disabled={!couponCode?.trim()}
            >
              Apply
            </Button>
          </div>
        )}
        
        {/* Available Coupons */}
        <div className="mt-3 p-3 bg-muted/50 rounded-lg">
          <p className="font-caption text-xs font-medium text-foreground mb-2">
            Available Offers:
          </p>
          <div className="space-y-1">
            <p className="font-caption text-xs text-muted-foreground">
              • FLAT10: 10% off on orders ≥₹1,499
            </p>
            <p className="font-caption text-xs text-muted-foreground">
              • FREE50: Free shipping on orders ≥₹{freeShippingThreshold}
            </p>
          </div>
        </div>
      </div>
      {/* Price Breakdown */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between font-body text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-data font-medium text-foreground">
            ₹{subtotal?.toFixed(2)}
          </span>
        </div>
        
        {discount > 0 && (
          <div className="flex justify-between font-body text-sm">
            <span className="text-success">Discount</span>
            <span className="font-data font-medium text-success">
              -₹{discount?.toFixed(2)}
            </span>
          </div>
        )}
        
        <div className="flex justify-between font-body text-sm">
          <span className="text-muted-foreground">Shipping</span>
          <span className="font-data font-medium text-foreground">
            {shipping === 0 ? 'FREE' : `₹${shipping?.toFixed(2)}`}
          </span>
        </div>
        
        <div className="border-t border-border pt-3">
          <div className="flex justify-between font-heading font-semibold text-lg">
            <span className="text-foreground">Total</span>
            <span className="font-data text-foreground">₹{total?.toFixed(2)}</span>
          </div>
        </div>
      </div>
      {/* Checkout Button */}
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
      {/* Security Badge */}
      <div className="flex items-center justify-center gap-2 mt-4 p-3 bg-muted/50 rounded-lg">
        <Icon name="Shield" size={16} className="text-success" />
        <p className="font-caption text-xs text-muted-foreground">
          Secure checkout with 256-bit SSL encryption
        </p>
      </div>
    </div>
  );
};

export default OrderSummary;