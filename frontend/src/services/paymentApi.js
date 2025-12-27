import { apiClient } from './api';

const paymentApi = {
  /**
   * Create a Razorpay order
   * @param {string} email - User email
   * @returns {Promise} Razorpay order details
   */
  createOrder: async (email) => {
    try {
      const response = await apiClient.post(
        `/payments/razorpay/create-order?email=${encodeURIComponent(email)}`
      );
      return response.data;
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw new Error(error.response?.data?.message || 'Failed to create payment order');
    }
  },

  /**
   * Verify Razorpay payment
   * @param {Object} paymentData - Payment verification data
   * @returns {Promise} Verification result
   */
  verifyPayment: async (paymentData) => {
    try {
      const response = await apiClient.post('/payments/razorpay/verify', paymentData);
      return response.data;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw new Error(error.response?.data?.message || 'Payment verification failed');
    }
  },

  /**
   * Get payment status
   * @param {string} email - User email
   * @returns {Promise} Payment status
   */
  getPaymentStatus: async (email) => {
    try {
      const response = await apiClient.get(
        `/payments/razorpay/payment-status?email=${encodeURIComponent(email)}`
      );
      return response.data;
    } catch (error) {
      console.error('Error getting payment status:', error);
      throw new Error(error.response?.data?.message || 'Failed to get payment status');
    }
  }
};

export default paymentApi;