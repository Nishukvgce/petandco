import React from 'react';
import { Check, Package, ArrowRight, X } from 'lucide-react';

/**
 * Order Success Modal Component
 * 
 * A beautiful confirmation modal that appears when an order is successfully placed.
 * Includes order details, success animation, and next steps for the user.
 */
const OrderSuccessModal = ({ 
  isOpen, 
  onClose, 
  orderData, 
  onViewOrders, 
  onContinueShopping 
}) => {
  if (!isOpen) return null;

  // Resolve order identifier from multiple possible response shapes
  const resolveOrderId = (od) => {
    if (!od) return null;
    return od?.orderId || od?.id || od?.order_no || od?.orderNumber || od?.order_number || od?.razorpayOrderId || od?.razorpay_order_id || od?.reference || od?.ref || od?.payment?.reference || od?.payment?.razorpay_order_id || null;
  };
  const resolvedOrderId = resolveOrderId(orderData);
  const orderId = resolvedOrderId ?? null;
  const orderAmount = Number(orderData?.totalAmount ?? orderData?.amount ?? 0);
  const paymentMethod = orderData?.paymentMethod || 'COD';
  const customerName = orderData?.customerName || orderData?.user?.name || 'Customer';
  const itemCount = orderData?.items?.length || orderData?.orderItems?.length || 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl max-w-md w-full mx-auto shadow-2xl transform transition-all duration-300 scale-100 animate-in slide-in-from-bottom-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <X size={24} />
        </button>

        {/* Success Animation */}
        <div className="text-center pt-8 pb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4 animate-pulse">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full">
              <Check size={32} className="text-white animate-bounce" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Order Placed Successfully! 🎉
          </h2>
          
          <p className="text-gray-600 text-sm">
            Thank you {customerName}! Your order has been placed successfully.
          </p>
        </div>

        {/* Order Details */}
        <div className="px-8 pb-6">
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-600">Order ID</span>
              <span className="text-lg font-bold text-gray-900">{orderId ? `#${orderId}` : 'N/A'}</span>
            </div>
            
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-600">Total Amount</span>
              <span className="text-lg font-bold text-green-600">₹{Number(orderAmount).toFixed(2)}</span>
            </div>
            
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-600">Items</span>
              <span className="text-sm font-semibold text-gray-900">{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Payment</span>
              <span className="text-sm font-semibold text-gray-900">{paymentMethod}</span>
            </div>
          </div>

          {/* What's Next */}
          <div className="space-y-3 mb-6">
            <h3 className="font-semibold text-gray-900 text-sm mb-3">What happens next?</h3>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                <Check size={14} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-700">
                  Your order is placed. We’ll start processing it shortly.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mt-0.5">
                <Package size={14} className="text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-700">
                  We'll prepare and ship your order within 2-3 business days
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                <Check size={14} className="text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-700">
                  Track your order status in your account dashboard
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={onViewOrders}
              className="w-full bg-orange-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center space-x-2"
            >
              <Package size={18} />
              <span>{itemCount} View My Orders</span>
              <ArrowRight size={16} />
            </button>
            
            <button
              onClick={onContinueShopping}
              className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessModal;