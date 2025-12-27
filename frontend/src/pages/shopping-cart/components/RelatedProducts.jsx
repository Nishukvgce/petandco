import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';
import productApi from '../../../services/productApi';
import apiClient from '../../../services/api';

const RelatedProducts = ({ onAddToCart }) => {
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Resolve relative image URLs returned by backend to absolute URLs using API base
  const resolveImageUrl = (p) => {
    const candidate = p?.imageUrl || p?.image || p?.image_path || p?.thumbnailUrl;
    if (!candidate) return '/assets/images/no_image.png';
    if (candidate.startsWith('http://') || candidate.startsWith('https://') || candidate.startsWith('data:')) {
      return candidate;
    }
    const base = apiClient?.defaults?.baseURL || '';
    return candidate.startsWith('/') ? `${base}${candidate}` : `${base}/${candidate}`;
  };

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch products from database (customer API filters out-of-stock products)
        const products = await productApi.getCustomerProducts({ limit: 4 });
        
        // Transform the data to match the expected format
        const transformedProducts = products?.map(product => {
          const resolvedImageUrl = resolveImageUrl(product);
          console.log('RelatedProducts - Product image resolution:', {
            productId: product.id,
            originalImageUrl: product.imageUrl || product.image,
            resolvedImageUrl
          });
          
          return {
            id: product.id,
            name: product.name,
            price: parseFloat(product.price) || 0,
            originalPrice: parseFloat(product.originalPrice) || parseFloat(product.price) || 0,
            image: resolvedImageUrl,
            rating: parseFloat(product.rating) || 4.5,
            reviews: parseInt(product.reviewCount) || Math.floor(Math.random() * 100) + 10,
            badges: product.tags ? (Array.isArray(product.tags) ? product.tags : product.tags.split(',').map(tag => tag.trim())) : [],
            variant: product.variant || product.weight || product.size || '1 unit',
            category: product.category,
            description: product.description
          };
        }) || [];
        
        setRelatedProducts(transformedProducts);
      } catch (err) {
        console.error('Failed to fetch related products:', err);
        setError(err.message || 'Failed to load related products');
        // Fallback to empty array on error
        setRelatedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, []);

  const handleAddToCart = (product) => {
    const cartItem = {
      id: product?.id,
      name: product?.name,
      price: product?.price,
      originalPrice: product?.originalPrice,
      image: product?.image,
      variant: product?.variant,
      badges: product?.badges,
      quantity: 1
    };
    onAddToCart(cartItem);
  };

  return (
    <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading font-semibold text-xl text-foreground">
          You might also like
        </h2>
        <Link to="/">
          <Button variant="ghost" size="sm" iconName="ArrowRight" iconPosition="right">
            View All
          </Button>
        </Link>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-card border border-border rounded-lg overflow-hidden animate-pulse">
              <div className="aspect-square bg-muted"></div>
              <div className="p-4">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded mb-2 w-2/3"></div>
                <div className="h-3 bg-muted rounded mb-3 w-1/2"></div>
                <div className="h-8 bg-muted rounded"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">
            {error}
          </p>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            iconName="RotateCcw"
            iconPosition="left"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Products Grid */}
      {!loading && !error && relatedProducts?.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {relatedProducts?.map((product) => {
            const discountPercentage = product.originalPrice > product.price 
              ? Math.round(((product?.originalPrice - product?.price) / product?.originalPrice) * 100)
              : 0;
            
            return (
              <div
                key={product?.id}
                className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-warm-md transition-all duration-300 group"
              >
                {/* Product Image */}
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={product?.image}
                    alt={product?.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Discount Badge */}
                  {discountPercentage > 0 && (
                    <div className="absolute top-2 left-2">
                      <span className="bg-destructive text-destructive-foreground text-xs font-caption font-bold px-2 py-1 rounded">
                        {discountPercentage}% OFF
                      </span>
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      className="p-2 bg-background/90 hover:bg-background rounded-full shadow-warm transition-colors duration-200"
                      aria-label="Add to wishlist"
                    >
                      <Icon name="Heart" size={16} />
                    </button>
                  </div>
                </div>
                
                {/* Product Info */}
                <div className="p-4">
                  {/* Badges */}
                  {product?.badges && product?.badges?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {product?.badges?.slice(0, 2)?.map((badge, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-caption font-medium bg-accent/10 text-accent"
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <Link to={`/product-detail-page?id=${product?.id}`}>
                      <h3 className="font-body font-semibold text-foreground mb-1 hover:text-primary transition-colors duration-200 line-clamp-2">
                        {product?.name}
                      </h3>
                    </Link>
                    <Link to={`/product-full/${product?.id}`} className="text-xs text-primary hover:underline ml-2">
                      Full
                    </Link>
                  </div>
                  
                  <p className="font-caption text-sm text-muted-foreground mb-2">
                    {product?.variant}
                  </p>

                  {/* Rating removed from UI */}

                  {/* Price */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-data font-bold text-lg text-foreground">
                      ₹{product?.price}
                    </span>
                    {product?.originalPrice > product?.price && (
                      <span className="font-data text-sm text-muted-foreground line-through">
                        ₹{product?.originalPrice}
                      </span>
                    )}
                  </div>

                  {/* Add to Cart Button */}
                  <Button
                    variant="outline"
                    fullWidth
                    size="sm"
                    onClick={() => handleAddToCart(product)}
                    iconName="ShoppingCart"
                    iconPosition="left"
                    iconSize={16}
                  >
                    Add to Cart
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* No Products State */}
      {!loading && !error && relatedProducts?.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">
            No related products found.
          </p>
          <Link to="/">
            <Button variant="outline">
              Browse All Products
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default RelatedProducts;