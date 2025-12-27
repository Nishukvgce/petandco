import React, { useState } from 'react';
import { X, Heart, ShoppingCart, Star } from 'lucide-react';

const QuickViewModal = ({ 
  product, 
  isOpen, 
  onClose, 
  onAddToCart, 
  onAddToWishlist, 
  isInWishlist 
}) => {
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (!isOpen || !product) return null;

  // Ensure variants is always an array
  const variants = Array.isArray(product.variants) && product.variants.length > 0 
    ? product.variants 
    : [product.weight || product.size || 'Default'];
  const selectedVariant = variants[selectedVariantIdx] || variants[0];
  
  // Calculate pricing with variants
  const currentPrice = (typeof selectedVariant === 'object' ? selectedVariant.price : null) || product.price || 0;
  const currentOriginalPrice = (typeof selectedVariant === 'object' ? selectedVariant.originalPrice : null) || product.original || 0;
  const discount = currentOriginalPrice && currentOriginalPrice > currentPrice ? 
    Math.round(100 - (currentPrice / currentOriginalPrice) * 100) : 0;
  
  const inStock = product.inStock !== false;
  const rating = product.rating || 4.5;

  const handleAddToCart = () => {
    const cartItem = {
      id: product.id,
      productId: product.id,
      variantId: typeof selectedVariant === 'object' ? selectedVariant.id : `v${selectedVariantIdx}`,
      name: product.name,
      variant: typeof selectedVariant === 'string' ? selectedVariant : (selectedVariant.weight || selectedVariant.size || ''),
      price: parseFloat(currentPrice),
      image: product.image,
      category: product.category,
      subcategory: product.subcategory,
      brand: product.brand,
      quantity
    };
    onAddToCart(cartItem);
  };

  const handleAddToWishlist = () => {
    onAddToWishlist(product);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Quick View</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Product Image */}
            <div className="space-y-4">
              <div className="aspect-square bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {product.badges?.map((badge, idx) => (
                  <span key={idx} className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                    {badge}
                  </span>
                ))}
                {discount > 0 && (
                  <span className="bg-red-600 text-white text-xs px-2 py-1 rounded">
                    {discount}% OFF
                  </span>
                )}
                {!inStock && (
                  <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded">
                    Out of Stock
                  </span>
                )}
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-4">
              {/* Title and Brand */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{product.name}</h3>
                {product.brand && (
                  <p className="text-sm text-gray-600 mt-1">by {product.brand}</p>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex items-center text-yellow-500">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-sm text-gray-700 ml-1">{rating}</span>
                </div>
                <span className="text-sm text-gray-500">({Math.floor(Math.random() * 50) + 10} reviews)</span>
              </div>

              {/* Description */}
              {product.shortDescription && (
                <p className="text-gray-600 text-sm leading-relaxed">
                  {product.shortDescription}
                </p>
              )}

              {/* Features */}
              {product.features && product.features.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Key Features:</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.features.map((feature, idx) => (
                      <span key={idx} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Product Characteristics */}
              {(product.petType || product.lifeStage || product.subcategory) && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Product Details:</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.petType && <span className="text-xs bg-gray-100 px-2 py-1 rounded">{product.petType}</span>}
                    {product.lifeStage && <span className="text-xs bg-gray-100 px-2 py-1 rounded">{product.lifeStage}</span>}
                    {product.subcategory && <span className="text-xs bg-gray-100 px-2 py-1 rounded">{product.subcategory}</span>}
                  </div>
                </div>
              )}

              {/* Select Options - Weight/Size */}
              {variants.length >= 1 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Select Options</h4>
                  <p className="text-sm text-gray-600 mb-3">Weight/Size</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {variants.map((variant, i) => {
                      const label = typeof variant === 'string' ? variant : (variant.weight || variant.size || variant.label || 'Default');
                      const variantPrice = typeof variant === 'object' ? variant.price : currentPrice;
                      const variantOriginalPrice = typeof variant === 'object' ? variant.originalPrice : currentOriginalPrice;
                      const variantDiscount = variantOriginalPrice && variantOriginalPrice > variantPrice ? 
                        Math.round(100 - (variantPrice / variantOriginalPrice) * 100) : 0;
                      const active = i === selectedVariantIdx;
                      const isBestOffer = i === 0; // Mark first option as best offer
                      
                      return (
                        <div
                          key={i}
                          className={`relative border rounded-lg transition-all cursor-pointer ${
                            active ? 'border-orange-500 shadow-md' : 'border-gray-200 hover:border-orange-300'
                          }`}
                          onClick={() => setSelectedVariantIdx(i)}
                        >
                          {/* Best Offer Badge */}
                          {isBestOffer && (
                            <div className="absolute -top-2 left-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                              <span className="text-xs">⭐</span>
                              Best Offer
                            </div>
                          )}
                          
                          <div className="p-3 pt-4">
                            {/* Weight/Size Label */}
                            <div className="text-xs text-gray-500 mb-2 font-medium">{label}</div>
                            
                            {/* Price */}
                            <div className="font-bold text-lg text-gray-900 mb-1">
                              ₹{Number(variantPrice).toFixed(0)}
                            </div>
                            
                            {/* Original Price and Discount */}
                            <div className="flex items-center justify-between">
                              {variantOriginalPrice && variantOriginalPrice > variantPrice ? (
                                <div className="text-xs text-gray-400 line-through">
                                  MRP ₹{Number(variantOriginalPrice).toFixed(0)}
                                </div>
                              ) : (
                                <div></div>
                              )}
                              
                              {variantDiscount > 0 && (
                                <div className="text-xs text-green-600 font-medium">
                                  {variantDiscount}% OFF
                                </div>
                              )}
                            </div>
                            
                            {/* Per unit price if available */}
                            {typeof variant === 'object' && variant.perUnit && (
                              <div className="text-xs text-gray-500 mt-2">
                                (₹{Number(variant.perUnit).toFixed(0)}/{variant.unitType || 'unit'})
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Price */}
              <div className="py-4 border-t">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-gray-900">₹{Number(currentPrice).toFixed(2)}</span>
                  {currentOriginalPrice && currentOriginalPrice > currentPrice && (
                    <span className="text-lg text-gray-500 line-through">₹{Number(currentOriginalPrice).toFixed(2)}</span>
                  )}
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Quantity:</label>
                  <div className="flex items-center border border-gray-300 rounded">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1 hover:bg-gray-100 transition-colors"
                      disabled={!inStock}
                    >
                      -
                    </button>
                    <span className="px-4 py-1 min-w-[3rem] text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-1 hover:bg-gray-100 transition-colors"
                      disabled={!inStock}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAddToCart}
                  disabled={!inStock}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                    inStock 
                      ? 'bg-orange-500 text-white hover:bg-orange-600' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <ShoppingCart className="h-4 w-4" />
                  {inStock ? 'Add to Cart' : 'Out of Stock'}
                </button>
                
                <button
                  onClick={handleAddToWishlist}
                  className={`flex items-center justify-center p-3 rounded-lg border transition-colors ${
                    isInWishlist && isInWishlist(product.id)
                      ? 'border-red-500 bg-red-50 text-red-500'
                      : 'border-gray-300 hover:border-red-300 hover:text-red-500'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${isInWishlist && isInWishlist(product.id) ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;