/**
 * Razorpay Payment Service
 * Handles Razorpay payment gateway integration for secure online payments
 */
class RazorpayService {
  constructor() {
    // Standardize to use VITE_API_BASE_URL (without /api suffix for payments endpoint)
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';
    // Remove /api suffix if present to get base URL
    this.baseUrl = apiBaseUrl.replace(/\/api$/, '');
  }

  /**
   * Load Razorpay script dynamically
   * @returns {Promise<boolean>} - Returns true if script loaded successfully
   */
  loadRazorpayScript() {
    return new Promise((resolve) => {
      // Check if Razorpay is already loaded
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.head.appendChild(script);
    });
  }

  /**
   * Create a Razorpay order on the backend
   * @param {string} email - User email
   * @returns {Promise<Object>} - Razorpay order details
   */
  async createOrder(email) {
    try {
      const response = await fetch(`${this.baseUrl}/api/payments/razorpay/create-order?email=${encodeURIComponent(email)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Razorpay order created:', data);
      return data;
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw error;
    }
  }

  /**
   * Verify payment after successful payment
   * @param {string} email - User email
   * @param {Object} paymentData - Payment response from Razorpay
   * @returns {Promise<Object>} - Verification result
   */
  async verifyPayment(email, paymentData) {
    try {
      const response = await fetch(`${this.baseUrl}/api/payments/razorpay/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email,
          razorpay_payment_id: paymentData.razorpay_payment_id,
          razorpay_order_id: paymentData.razorpay_order_id,
          razorpay_signature: paymentData.razorpay_signature
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Payment verification failed' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Payment verified successfully:', data);
      return data;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  }

  /**
   * Process payment using Razorpay
   * @param {Object} orderData - Order details from backend
   * @param {Object} user - User information
   * @param {Function} onSuccess - Success callback
   * @param {Function} onError - Error callback
   */
  async processPayment(orderData, user, onSuccess, onError) {
    try {
      // Load Razorpay script
      const scriptLoaded = await this.loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay script');
      }

      // Configure Razorpay options
      const options = {
        key: orderData.key, // Razorpay key from backend
        amount: orderData.amount, // Amount in paisa
        currency: orderData.currency || 'INR',
        order_id: orderData.razorpay_order_id,
        name: 'Pet Co',
        description: 'Order Payment',
        image: '/assets/images/logo.png', // Your logo
        prefill: {
          name: user.name || user.firstName || '',
          email: user.email || '',
          contact: user.phone || ''
        },
        theme: {
          color: '#3B82F6' // Your primary color
        },
        modal: {
          ondismiss: () => {
            console.log('Payment modal dismissed');
            if (onError) {
              onError(new Error('Payment was cancelled by user'));
            }
          }
        },
        handler: async (response) => {
          try {
            console.log('Payment successful:', response);
            
            // Verify payment with backend
            const verificationResult = await this.verifyPayment(user.email, response);
            
            if (onSuccess) {
              onSuccess(verificationResult);
            }
          } catch (error) {
            console.error('Payment verification failed:', error);
            if (onError) {
              onError(error);
            }
          }
        }
      };

      // Create Razorpay instance and open checkout
      const razorpay = new window.Razorpay(options);
      razorpay.open();

      // Handle payment failures
      razorpay.on('payment.failed', (response) => {
        console.error('Payment failed:', response.error);
        if (onError) {
          onError(new Error(response.error.description || 'Payment failed'));
        }
      });

    } catch (error) {
      console.error('Error processing payment:', error);
      if (onError) {
        onError(error);
      }
    }
  }
}

// Export singleton instance
const razorpayService = new RazorpayService();
export default razorpayService;