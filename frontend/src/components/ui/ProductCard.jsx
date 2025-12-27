import React, { useState } from 'react';
import { Heart, HeartFill } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';

/**
 * Premium, unified ProductCard for all sections (dogs, cats, pharmacy, outlet, etc.)
 * Props: p (product object)
 */
const ProductCard = ({ p }) => {
  const navigate = useNavigate();
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useCart();
  const [variantIdx, setVariantIdx] = useState(0);
  const variants = p.variants && p.variants.length > 0 ? p.variants : [{ weight: 'Default', price: p.price, originalPrice: p.originalPrice || p.original, stock: 1 }];
  const currentVariant = variants[variantIdx];
  const currentPrice = currentVariant.price || p.price || 0;
  const originalPrice = currentVariant.originalPrice || p.originalPrice || p.original || 0;
  const discount = originalPrice > currentPrice ? Math.round(100 - (currentPrice / originalPrice) * 100) : 0;
  const isInStock = (currentVariant.stock ?? p.stockQuantity ?? 1) > 0;
  const brand = p.brand || (p.filters && p.filters.brands && p.filters.brands[0]) || '';

  // Wishlist logic
  const wishlisted = isInWishlist && isInWishlist(p.id);
  const handleWishlist = (e) => {
    e.stopPropagation();
    if (wishlisted) {
      removeFromWishlist(p.id);
    } else {
      addToWishlist({ id: p.id, name: p.name, image: p.image, price: currentPrice, brand });
    }
  };

  // Add to cart
  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (!isInStock) return;
    addToCart({
      id: p.id,
      name: p.name,
      image: p.image,
      price: currentPrice,
      variant: currentVariant.weight || currentVariant.size || currentVariant.label || 'Default',
      brand,
      quantity: 1,
      category: p.category || '',
    });
  };

  // Image fallback
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '/assets/images/no_image.png';
    if (imageUrl.startsWith('http')) return imageUrl;
    if (imageUrl.startsWith('/admin/')) return `http://localhost:8080${imageUrl}`;
    return imageUrl;
  };

  return (
    <article className={`bg-white rounded-2xl border border-border shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden relative group ${!isInStock ? 'opacity-70' : ''}`}
      style={{ cursor: 'pointer' }}
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        {discount > 0 && (
          <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow">{discount}% OFF</span>
        )}
        {p.badges && p.badges.length > 0 && (
          <span className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">{p.badges[0]}</span>
        )}
      </div>
      {/* Wishlist icon */}
      <button
        className="absolute top-3 right-3 z-20 bg-white/80 rounded-full p-1 shadow hover:bg-pink-100"
        onClick={handleWishlist}
        aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        {wishlisted ? <HeartFill className="text-pink-500" size={22} /> : <Heart className="text-gray-400" size={22} />}
      </button>
      {/* Product Image (clickable) */}
      <div className="h-44 md:h-56 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-t-2xl overflow-hidden relative"
        onClick={() => navigate(`/product-detail-page?id=${p.id}`)}
        style={{ cursor: 'pointer' }}
      >
        <img
          src={getImageUrl(p.image)}
          alt={p.name}
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
          onError={e => { e.target.src = '/assets/images/no_image.png'; }}
        />
        {!isInStock && (
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <span className="text-white font-bold text-lg">Out of Stock</span>
          </div>
        )}
      </div>
      {/* Product Info */}
      <div className="p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between mb-1">
          <h3
            className="text-base md:text-lg font-semibold text-foreground line-clamp-2 leading-tight overflow-hidden hover:underline"
            style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', cursor: 'pointer'}}
            onClick={() => navigate(`/product-detail-page?id=${p.id}`)}
          >
            {p.name}
          </h3>
        </div>
        {brand && <div className="text-xs text-gray-500 mb-1 font-medium">by {brand}</div>}
        {/* Variant Selector */}
        {variants.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {variants.map((v, i) => {
              const label = v.weight || v.size || v.label || v;
              const active = i === variantIdx;
              return (
                <button
                  key={i}
                  onClick={e => { e.stopPropagation(); setVariantIdx(i); }}
                  className={`text-xs px-3 py-1 border rounded-full font-semibold transition-colors ${active ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-700 border-gray-300 hover:border-orange-300'}`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}
        {/* Price and Add Button */}
        <div className="flex items-center justify-between mt-2" onClick={e => e.stopPropagation()}>
          <div>
            <div className="text-lg font-bold text-gray-900">₹{Number(currentPrice).toFixed(2)}</div>
            {originalPrice > currentPrice && (
              <div className="text-sm text-gray-400 line-through">₹{Number(originalPrice).toFixed(2)}</div>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={!isInStock}
            className={`px-5 py-2 rounded-full text-sm font-semibold shadow transition-colors duration-200 ${isInStock ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
          >
            {isInStock ? 'Add' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
