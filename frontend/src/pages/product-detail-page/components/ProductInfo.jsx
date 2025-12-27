import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const ProductInfo = ({ product, onAddToCart, onAddToWishlist, isInWishlist }) => {
  const [selectedVariant, setSelectedVariant] = useState(product?.variants?.[0]);
  const [quantity, setQuantity] = useState(1);

  // Determine available stock from variant or product
  const availableStock = (selectedVariant?.stock ?? product?.stockQuantity ?? 0) || 0;
  const inStock = (selectedVariant?.stock ?? product?.stockQuantity ?? 0) > 0 && (product?.inStock ?? true);

  const handleVariantChange = (variantId) => {
    const variant = product?.variants?.find(v => v?.id === variantId);
    if (variant) {
      setSelectedVariant(variant);
      // Reset quantity when variant changes to avoid accidentally adding wrong counts
      setQuantity(1);
    }
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    // Cap quantity between 1 and available stock
    if (newQuantity >= 1 && newQuantity <= Math.max(availableStock, 0)) {
      setQuantity(newQuantity);
    } else if (newQuantity > availableStock) {
      alert('Stock limit exceeded');
      setQuantity(Math.max(availableStock, 1));
    }
  };

  const handleAddToCart = () => {
    if (!inStock || availableStock <= 0) {
      alert('This product is out of stock');
      return;
    }
    if (quantity > availableStock) {
      alert('Stock limit exceeded');
      return;
    }
    // Provide enough info for both logged-in (server) and guest (local) carts
    onAddToCart({
      id: product?.id,
      productId: product?.id,
      name: product?.name,
      price: parseFloat(selectedVariant?.price ?? product?.variants?.[0]?.price ?? 0) || 0,
      originalPrice: parseFloat(selectedVariant?.originalPrice ?? product?.variants?.[0]?.originalPrice ?? selectedVariant?.price ?? product?.variants?.[0]?.price ?? 0) || 0,
      image: product?.images?.[0] || product?.imageUrl || product?.image,
      stockQuantity: availableStock,
      variantId: selectedVariant?.id,
      quantity: quantity
    });
  };

  const discountPercentage = Math.round(
    selectedVariant?.originalPrice
      ? ((selectedVariant?.originalPrice - selectedVariant?.price) / selectedVariant?.originalPrice) * 100
      : 0
  );

  // Numeric prices
  const unitPrice = parseFloat(selectedVariant?.price) || 0;
  const totalPrice = unitPrice * (parseInt(quantity) || 1);

  const variantOptions = product?.variants?.map(variant => ({
    value: variant?.id,
    label: `${variant?.weight} - ₹${variant?.price?.toFixed(2)}`
  }));

  return (
    <div className="space-y-6">
      {/* Product Title and Brand */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {product?.brand && (
            <a href={`/brands/${encodeURIComponent(product.brand)}`} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium border border-primary/20 hover:underline">
              {product?.brand}
            </a>
          )}
          {product?.isPopular && (
            <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 border border-secondary/20">
              <Icon name="TrendingUp" size={14} />
              Popular
            </span>
          )}
          {product?.isNew && (
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium border border-green-200">
              New
            </span>
          )}
        </div>
        <h1 className="font-heading font-bold text-2xl lg:text-3xl text-foreground mb-2 flex items-center gap-2">
          {product?.name}
          {product?.rating && (
            <span className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs font-semibold ml-2">
              <Icon name="Star" size={14} className="text-yellow-400" />
              {product.rating}
            </span>
          )}
        </h1>
        <p className="font-body text-muted-foreground">
          {product?.shortDescription}
        </p>

        {/* Rating and Reviews */}
        {product?.rating && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <div className="flex items-center">
                {[...Array(5)]?.map((_, index) => (
                  <Icon 
                    key={index}
                    name="Star"
                    size={16}
                    className={index < Math.floor(product?.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                  />
                ))}
              </div>
              <span className="font-medium text-foreground ml-1">
                {product?.rating}
              </span>
            </div>
            <span className="text-muted-foreground">•</span>
            <span className="font-body text-sm text-muted-foreground">
              {product?.reviewCount || 0} reviews
            </span>
          </div>
        )}

        {/* Quick Info Tags */}
        <div className="flex flex-wrap gap-2 pt-2">
          {product?.petType && (
            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium">
              For {product.petType}
            </span>
          )}
          {product?.category && (
            <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs font-medium">
              {product.category}
            </span>
          )}
          {product?.ageGroup && (
            <span className="bg-orange-50 text-orange-700 px-2 py-1 rounded text-xs font-medium">
              {product.ageGroup}
            </span>
          )}
        </div>
      </div>

      {/* Stock Status */}
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${inStock ? 'bg-success' : 'bg-destructive'}`}></div>
        <span className={`text-sm font-medium ${inStock ? 'text-success' : 'text-destructive'}`}>
          {inStock ? `In Stock (${availableStock} units available)` : 'Out of Stock'}
        </span>
      </div>
      {/* Product Badges */}
      <div className="flex flex-wrap gap-2">
        {product?.badges?.map((badge, index) => (
          <span
            key={index}
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-caption font-medium bg-accent/10 text-accent border border-accent/20"
          >
            {badge}
          </span>
        ))}
      </div>
      {/* Pricing */}
      <div className="bg-card rounded-lg border border-border p-4 space-y-3">
        <h3 className="font-heading font-semibold text-lg text-foreground">Pricing</h3>
        <div className="flex items-baseline gap-3">
          <span className="font-heading font-bold text-3xl text-foreground">
            ₹{unitPrice.toFixed(2)}
          </span>
          {selectedVariant?.originalPrice > selectedVariant?.price && (
            <>
              <span className="font-data text-xl text-muted-foreground line-through">
                ₹{(parseFloat(selectedVariant?.originalPrice) || 0).toFixed(2)}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700 border border-green-200">
                <Icon name="TrendingDown" size={14} className="mr-1" />
                Save {Math.round(discountPercentage)}%
              </span>
            </>
          )}
        </div>
        <p className="font-caption text-sm text-muted-foreground">
          Inclusive of all taxes
        </p>


        {/* Pincode input removed. Now handled by popup from header. */}

        {/* Delivery info removed as per request */}

        {/* COD and Free Delivery info */}
        <div className="flex flex-col gap-1 mt-2 ml-1">
          <div className="flex items-center gap-2 text-sm">
            <Icon name="CreditCard" size={16} className="text-blue-600" />
            COD available for orders between <span className="font-medium">₹700-₹5000</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Icon name="Truck" size={16} className="text-green-600" />
            Free delivery on orders above <span className="font-medium">₹599</span>
          </div>
        </div>

        {quantity > 1 && (
          <div className="bg-primary/5 rounded-lg p-3 border border-primary/20">
            <p className="font-heading font-semibold text-lg text-primary">
              Total: ₹{totalPrice.toFixed(2)} for {quantity} {quantity === 1 ? 'item' : 'items'}
            </p>
          </div>
        )}
      </div>
      {/* Variant Selection */}
      <div className="bg-card rounded-lg border border-border p-4 space-y-4">
        <h3 className="font-heading font-semibold text-lg text-foreground">Select Options</h3>
        <p className="text-sm text-muted-foreground">Weight/Size</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {product?.variants?.map((variant, i) => {
            const isActive = selectedVariant?.id === variant?.id;
            const variantPrice = parseFloat(variant?.price) || 0;
            const variantOriginalPrice = parseFloat(variant?.originalPrice) || 0;
            const variantDiscount = variantOriginalPrice && variantOriginalPrice > variantPrice ? 
              Math.round(100 - (variantPrice / variantOriginalPrice) * 100) : 0;
            const isBestOffer = i === 0; // Mark first option as best offer
            
            return (
              <div
                key={variant?.id}
                className={`relative border rounded-lg transition-all cursor-pointer hover:shadow-md ${
                  isActive ? 'border-orange-500 shadow-md' : 'border-border hover:border-orange-300'
                }`}
                onClick={() => handleVariantChange(variant?.id)}
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
                  <div className="text-xs text-muted-foreground mb-2 font-medium">
                    {variant?.weight || variant?.size || variant?.label || 'Default'}
                  </div>
                  
                  {/* Price */}
                  <div className="font-bold text-lg text-foreground mb-1">
                    ₹{variantPrice.toFixed(0)}
                  </div>
                  
                  {/* Original Price and Discount */}
                  <div className="flex items-center justify-between">
                    {variantOriginalPrice && variantOriginalPrice > variantPrice ? (
                      <div className="text-xs text-muted-foreground line-through">
                        MRP ₹{variantOriginalPrice.toFixed(0)}
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
                  {variant?.perUnit && (
                    <div className="text-xs text-muted-foreground mt-2">
                      (₹{parseFloat(variant.perUnit).toFixed(0)}/{variant.unitType || 'unit'})
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Quantity and Add to Cart */}
      <div className="bg-card rounded-lg border border-border p-4 space-y-4">
        <h3 className="font-heading font-semibold text-lg text-foreground">Quantity & Cart</h3>
        <div className="flex items-center gap-4">
          <span className="font-body font-medium text-foreground">Quantity:</span>
          <div className="flex items-center border border-border rounded-lg shadow-sm">
            <button
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1}
              className="w-10 h-10 flex items-center justify-center hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 rounded-l-lg"
            >
              <Icon name="Minus" size={16} />
            </button>
            <span className="w-12 text-center font-data font-medium bg-muted/30 h-10 flex items-center justify-center">
              {quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(1)}
              disabled={quantity >= availableStock}
              className="w-10 h-10 flex items-center justify-center hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 rounded-r-lg"
            >
              <Icon name="Plus" size={16} />
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="default"
            onClick={handleAddToCart}
            iconName="ShoppingCart"
            iconPosition="left"
            className="flex-1 h-12"
            disabled={!inStock}
          >
            {`Add to Cart - ₹${((parseFloat(selectedVariant?.price) || 0) * (quantity || 1)).toFixed(2)}`}
          </Button>
          <Button
            variant="outline"
            onClick={onAddToWishlist}
            iconName={isInWishlist ? "Heart" : "Heart"}
            size="icon"
            className={`h-12 w-12 ${isInWishlist ? "text-destructive" : ""}`}
          >
          </Button>
        </div>
      </div>
      
      {/* Stock Status */}
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${inStock ? 'bg-success' : 'bg-destructive'}`}></div>
        {inStock ? (
          <span className="font-caption text-sm text-success font-medium">
            In Stock ({availableStock} units available)
          </span>
        ) : (
          <span className="font-caption text-sm text-destructive font-medium">
            Out of Stock
          </span>
        )}
      </div>
    </div>
  );
};

export default ProductInfo;