import React, { useState } from 'react';
import Icon from '../AppIcon';
import Button from './Button';
import Image from '../AppImage';

const ReviewModal = ({ 
  isOpen, 
  onClose, 
  product, 
  onSubmitReview, 
  isSubmitting = false 
}) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      alert('Please provide a rating');
      return;
    }
    
    if (!comment.trim()) {
      alert('Please write a review comment');
      return;
    }

    await onSubmitReview({
      productId: product?.id,
      rating,
      title: title.trim() || 'Review',
      comment: comment.trim()
    });

    // Reset form
    setRating(0);
    setTitle('');
    setComment('');
    onClose();
  };

  const handleClose = () => {
    setRating(0);
    setTitle('');
    setComment('');
    onClose();
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Icon name="Star" className="h-6 w-6 text-yellow-500" />
            <h2 className="text-xl font-semibold text-gray-900">Write a Review</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <Icon name="X" className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Product Info */}
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <Image 
                src={product.productImage || product.image} 
                alt={product.productName || product.name}
                className="h-16 w-16 rounded-lg object-cover"
                fallback="https://via.placeholder.com/64x64?text=Product"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate">
                {product.productName || product.name}
              </h3>
              {product.brand && (
                <p className="text-sm text-gray-500">{product.brand}</p>
              )}
              {product.variant && (
                <p className="text-sm text-gray-500">{product.variant}</p>
              )}
            </div>
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Rating <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 transition-colors"
                  disabled={isSubmitting}
                >
                  <Icon
                    name="Star"
                    className={`h-6 w-6 ${
                      star <= (hoveredRating || rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-600">
                {rating > 0 && (
                  <>
                    {rating} star{rating !== 1 ? 's' : ''}
                    {rating === 5 && ' - Excellent!'}
                    {rating === 4 && ' - Very Good!'}
                    {rating === 3 && ' - Good'}
                    {rating === 2 && ' - Fair'}
                    {rating === 1 && ' - Poor'}
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Review Title */}
          <div className="space-y-2">
            <label htmlFor="review-title" className="block text-sm font-medium text-gray-700">
              Review Title (Optional)
            </label>
            <input
              id="review-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Great product for my dog!"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting}
              maxLength={100}
            />
            <p className="text-xs text-gray-500">
              {title.length}/100 characters
            </p>
          </div>

          {/* Review Comment */}
          <div className="space-y-2">
            <label htmlFor="review-comment" className="block text-sm font-medium text-gray-700">
              Your Review <span className="text-red-500">*</span>
            </label>
            <textarea
              id="review-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="Share your experience with this product..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              disabled={isSubmitting}
              maxLength={500}
              required
            />
            <p className="text-xs text-gray-500">
              {comment.length}/500 characters
            </p>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={isSubmitting || rating === 0 || !comment.trim()}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
                  Submitting...
                </>
              ) : (
                'Submit Review'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;