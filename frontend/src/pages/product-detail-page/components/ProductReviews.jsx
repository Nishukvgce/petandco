import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import reviewApi from '../../../services/reviewApi';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ProductReviews = ({ productId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showCreateReview, setShowCreateReview] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [userHasReviewed, setUserHasReviewed] = useState(false);

  useEffect(() => {
    if (productId) {
      loadReviews();
      loadStats();
      checkUserReviewStatus();
    }
  }, [productId, currentPage, user]);

  const loadReviews = async () => {
    try {
      const response = await reviewApi.getProductReviews(productId, currentPage, 10);
      setReviews(response.reviews || []);
      setTotalPages(response.totalPages || 0);
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await reviewApi.getProductReviewStats(productId);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const checkUserReviewStatus = async () => {
    if (!user?.email) {
      setLoading(false);
      return;
    }

    try {
      // Check if user has already reviewed this product
      const userReviews = await reviewApi.getUserReviews(user.email);
      const hasReviewed = userReviews.some(review => review.productId === parseInt(productId));
      setUserHasReviewed(hasReviewed);

      // Check if user can review (has purchased and received the product)
      const eligibleProducts = await reviewApi.getEligibleProducts(user.email);
      const canReviewProduct = eligibleProducts.some(product => product.id === parseInt(productId));
      setCanReview(canReviewProduct && !hasReviewed);
    } catch (error) {
      console.error('Error checking review status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReview = () => {
    setShowCreateReview(true);
  };

  const handleReviewCreated = () => {
    setShowCreateReview(false);
    setCanReview(false);
    setUserHasReviewed(true);
    loadReviews();
    loadStats();
  };

  const handleMarkHelpful = async (reviewId) => {
    try {
      await reviewApi.markReviewHelpful(reviewId);
      loadReviews(); // Reload to get updated helpful count
    } catch (error) {
      console.error('Error marking review helpful:', error);
    }
  };

  const renderStars = (rating, size = 16) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Icon
        key={index}
        name="Star"
        size={size}
        className={`${
          index < rating
            ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date?.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading font-semibold text-lg text-foreground">
          Customer Reviews {stats && `(${stats.totalReviews})`}
        </h3>
        
        {canReview && (
          <Button onClick={handleCreateReview} className="ml-4">
            Write a Review
          </Button>
        )}
      </div>

      {/* Review Statistics */}
      {stats && stats.totalReviews > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
              <span className="font-heading font-bold text-3xl text-foreground">
                {stats.averageRating?.toFixed(1)}
              </span>
              <div className="flex">
                {renderStars(Math.round(stats.averageRating), 20)}
              </div>
            </div>
            <p className="font-body text-muted-foreground">
              Based on {stats.totalReviews} reviews
            </p>
          </div>

          <div className="space-y-2">
            {stats.ratingDistribution?.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-12">
                  <span className="font-caption text-sm text-foreground">{rating}</span>
                  <Icon name="Star" size={12} className="text-yellow-400 fill-current" />
                </div>
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div
                    className="bg-yellow-400 rounded-full h-2 transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="font-caption text-sm text-muted-foreground w-8">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-border pb-6 last:border-b-0 last:pb-0">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="font-heading font-semibold text-primary">
                    {review.userName?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-body font-medium text-foreground">
                        {review.userName}
                      </h4>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {renderStars(review.rating)}
                        </div>
                        <span className="font-caption text-sm text-muted-foreground">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                    </div>
                    
                    {review.isVerifiedPurchase && (
                      <div className="flex items-center gap-1 text-green-600">
                        <Icon name="CheckCircle" size={14} />
                        <span className="font-caption text-xs">Verified Purchase</span>
                      </div>
                    )}
                  </div>
                  
                  {review.title && (
                    <h5 className="font-medium text-foreground">{review.title}</h5>
                  )}
                  
                  <p className="font-body text-muted-foreground">
                    {review.comment}
                  </p>
                  
                  {review.helpfulCount > 0 && (
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleMarkHelpful(review.id)}
                        className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors duration-200"
                      >
                        <Icon name="ThumbsUp" size={14} />
                        <span className="font-caption text-sm">
                          Helpful ({review.helpfulCount})
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <Icon name="MessageCircle" size={48} className="mx-auto mb-4 opacity-50" />
          <p>No reviews yet. Be the first to review this product!</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
            disabled={currentPage === 0}
          >
            Previous
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, index) => {
              const pageNum = currentPage < 3 ? index : currentPage - 2 + index;
              if (pageNum >= totalPages) return null;
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1 rounded text-sm ${
                    currentPage === pageNum
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {pageNum + 1}
                </button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
            disabled={currentPage === totalPages - 1}
          >
            Next
          </Button>
        </div>
      )}

      {/* Create Review Modal */}
      {showCreateReview && (
        <CreateReviewModal
          productId={productId}
          userEmail={user?.email}
          onClose={() => setShowCreateReview(false)}
          onReviewCreated={handleReviewCreated}
        />
      )}
    </div>
  );
};

// Create Review Modal Component
const CreateReviewModal = ({ productId, userEmail, onClose, onReviewCreated }) => {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    
    if (!comment.trim()) {
      setError('Please write a comment');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await reviewApi.createReview(userEmail, productId, rating, comment.trim(), title.trim());
      onReviewCreated();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create review');
    } finally {
      setLoading(false);
    }
  };

  const renderStarRating = () => {
    return Array.from({ length: 5 }, (_, index) => (
      <button
        key={index}
        type="button"
        onClick={() => setRating(index + 1)}
        className={`text-2xl ${
          index < rating ? 'text-yellow-400' : 'text-gray-300'
        } hover:text-yellow-400 transition-colors`}
      >
        ⭐
      </button>
    ));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Rating *</label>
            <div className="flex gap-1">
              {renderStarRating()}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Title (optional)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Brief summary of your review"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Comment *</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Share your experience with this product"
              required
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductReviews;