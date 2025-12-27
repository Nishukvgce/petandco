import apiClient from './api';

const reviewApi = {
  // Create a new review
  async createReview(userEmail, productId, rating, comment, title) {
    try {
      const response = await apiClient.post('/reviews', {
        productId,
        rating,
        comment,
        title
      }, {
        params: { userEmail }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  },

  // Get reviews for a product
  async getProductReviews(productId, page = 0, size = 10) {
    try {
      const response = await apiClient.get(`/reviews/product/${productId}`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting product reviews:', error);
      throw error;
    }
  },

  // Get review statistics for a product
  async getProductReviewStats(productId) {
    try {
      const response = await apiClient.get(`/reviews/product/${productId}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error getting product review stats:', error);
      throw error;
    }
  },

  // Get products eligible for review
  async getEligibleProducts(userEmail) {
    try {
      const response = await apiClient.get('/reviews/eligible-products', {
        params: { userEmail }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting eligible products:', error);
      throw error;
    }
  },

  // Get user's reviews
  async getUserReviews(userEmail) {
    try {
      const response = await apiClient.get('/reviews/user', {
        params: { userEmail }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting user reviews:', error);
      throw error;
    }
  },

  // Mark review as helpful
  async markReviewHelpful(reviewId) {
    try {
      const response = await apiClient.post(`/reviews/${reviewId}/helpful`);
      return response.data;
    } catch (error) {
      console.error('Error marking review helpful:', error);
      throw error;
    }
  }
};

export default reviewApi;