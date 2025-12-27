# Razorpay Integration Setup Guide

## Overview
This project now supports online payments through Razorpay integration. Users can choose between "Cash on Delivery" and "Pay Online" options during checkout.

## Features
- Secure online payments using Razorpay
- Support for UPI, Credit/Debit Cards, Net Banking
- Real-time payment verification
- Seamless order creation upon successful payment
- Fallback to COD for traditional users

## Setup Instructions

### 1. Get Razorpay Credentials
1. Sign up at https://razorpay.com/
2. Go to Dashboard > Settings > API Keys
3. Generate Test API Keys for development

### 2. Configure Backend
Add your Razorpay credentials to `backend/src/main/resources/application-dev.properties`:

```properties
# Razorpay Configuration
razorpay.keyId=rzp_test_your_key_id_here
razorpay.keySecret=your_test_key_secret_here
```

For production, set environment variables:
```bash
export RAZORPAY_KEY_ID=rzp_live_your_live_key_id
export RAZORPAY_KEY_SECRET=your_live_key_secret
```

### 3. Frontend Configuration
The frontend automatically detects the payment method and handles:
- Razorpay script loading
- Payment form creation
- Order verification

## Payment Flow

### For COD Orders
1. User selects "Cash on Delivery"
2. Order is placed directly
3. Payment collection happens during delivery

### For Online Orders
1. User selects "Pay Online"
2. Click "Place Order" opens Razorpay checkout
3. User completes payment using preferred method
4. Backend verifies payment signature
5. Order is automatically created upon successful payment
6. User receives order confirmation

## Database Changes
New fields added to support Razorpay:
- `orders.razorpay_order_id` - Razorpay order reference
- `orders.razorpay_payment_id` - Payment reference
- `orders.payment_status` - Payment status (pending/paid/failed)

## API Endpoints

### Create Razorpay Order
```
POST /api/payments/razorpay/create-order?email={user_email}
```

### Verify Payment
```
POST /api/payments/razorpay/verify
{
  "email": "user@email.com",
  "razorpay_payment_id": "pay_xxxxx",
  "razorpay_order_id": "order_xxxxx", 
  "razorpay_signature": "signature_xxxxx"
}
```

## Testing
1. Use Razorpay test credentials
2. Test with different payment methods
3. Verify order creation in both success and failure scenarios

## Security Notes
- Payment verification happens on backend
- Signature validation ensures payment authenticity
- Credentials should be environment variables in production
- HTTPS is required for production payments

## Support
- Razorpay Documentation: https://razorpay.com/docs/
- Test Card Numbers: https://razorpay.com/docs/payment-gateway/test-card-numbers/