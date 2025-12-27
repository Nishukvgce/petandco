import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import reviewApi from '../../../services/reviewApi';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const UserReviews = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [eligibleProducts, setEligibleProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('reviews'); // 'reviews' or 'eligible'
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  useEffect(() => {
    if (user?.email) {
      loadUserReviews();
      loadEligibleProducts();
    }
  }, [user]);

  const loadUserReviews = async () => {
    try {
      const userReviews = await reviewApi.getUserReviews(user.email);
      setReviews(userReviews);
    } catch (error) {
      console.error('Error loading user reviews:', error);
    }
  };

  const loadEligibleProducts = async () => {
    try {
      const eligible = await reviewApi.getEligibleProducts(user.email);
      setEligibleProducts(eligible);
    } catch (error) {
      console.error('Error loading eligible products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await reviewApi.deleteReview(reviewId);
      loadUserReviews(); // Reload reviews after deletion
      loadEligibleProducts(); // Reload eligible products as this product might become reviewable again
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting review:', error);
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
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-gray-200 rounded"></div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Reviews</h2>
        
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setTab('reviews')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              tab === 'reviews'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            My Reviews ({reviews.length})
          </button>
          <button
            onClick={() => setTab('eligible')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              tab === 'eligible'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Can Review ({eligibleProducts.length})
          </button>
        </div>
      </div>

      {/* My Reviews Tab */}
      {tab === 'reviews' && (
        <div>
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{review.productName}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex">
                          {renderStars(review.rating)}
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDate(review.createdAt)}
                        </span>
                        {review.isVerifiedPurchase && (
                          <div className="flex items-center gap-1 text-green-600">
                            <Icon name="CheckCircle" size={14} />
                            <span className="text-xs">Verified Purchase</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setShowDeleteConfirm(review.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Delete review"
                    >
                      <Icon name="Trash2" size={16} />
                    </button>
                  </div>
                  
                  {review.title && (
                    <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
                  )}
                  
                  <p className="text-gray-700 mb-3">{review.comment}</p>
                  
                  {review.helpfulCount > 0 && (
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Icon name="ThumbsUp" size={14} />
                      <span>{review.helpfulCount} people found this helpful</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Icon name="MessageCircle" size={48} className="mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h3>
              <p className="text-gray-500 mb-4">You haven't written any product reviews yet.</p>
              {eligibleProducts.length > 0 ? (
                <div className="inline-flex items-center gap-2 text-blue-600">
                  <Icon name="Star" size={16} />
                  <span className="text-sm font-medium">
                    You have {eligibleProducts.length} product{eligibleProducts.length !== 1 ? 's' : ''} waiting for review!
                  </span>
                </div>
              ) : (
                <p className="text-xs text-gray-400">Purchase and receive products to write reviews</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Eligible Products Tab */}
      {tab === 'eligible' && (
        <div>
          {eligibleProducts.length > 0 ? (
            <div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 text-blue-800 mb-2">
                  <Icon name="Star" size={18} />
                  <h4 className="font-semibold">Ready for Review</h4>
                </div>
                <p className="text-sm text-blue-700">
                  You have {eligibleProducts.length} product{eligibleProducts.length !== 1 ? 's' : ''} that have been delivered and are ready for your review. 
                  Share your experience to help other pet owners!
                </p>
              </div>
              
              <div className="space-y-4">
                {eligibleProducts.map((product) => (
                  <div key={product.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{product.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Icon name="CheckCircle" size={14} className="text-green-500" />
                          <span className="text-sm text-gray-500">
                            Delivered • Ready for review
                          </span>
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => {
                          // Navigate to product detail page with review modal
                          window.location.href = `/product-detail?id=${product.id}`;
                        }}
                        size="sm"
                        className="bg-yellow-500 hover:bg-yellow-600 text-white"
                      >
                        <Icon name="Star" size={14} className="mr-1" />
                        Write Review
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Icon name="Package" size={48} className="mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Products to Review</h3>
              <p className="text-gray-500 mb-4">
                Products you've purchased and received will appear here when they're ready for review.
              </p>
              <div className="text-xs text-gray-400">
                <p>💡 Tip: Reviews help other pet owners make informed decisions!</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Delete Review</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this review? This action cannot be undone.
            </p>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleDeleteReview(showDeleteConfirm)}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserReviews;