import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const RelatedProducts = ({ products, onAddToCart }) => {
  const handleAddToCart = (product) => {
    onAddToCart({
      productId: product?.id,
      variantId: product?.variants?.[0]?.id,
      quantity: 1
    });
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading font-semibold text-lg text-foreground">
          You might also like
        </h3>
        <Link
          to="/"
          className="font-body text-sm text-primary hover:text-primary/80 transition-colors duration-200"
        >
          View All
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {products?.map((product) => (
          <div key={product?.id} className="group">
            <div className="bg-muted/50 rounded-lg border border-border hover:shadow-warm-md transition-all duration-300">
              <div className="relative aspect-square rounded-t-lg overflow-hidden">
                <Link to={`/product-detail-page?id=${product?.id}`}>
                  <Image
                    src={product?.image}
                    alt={product?.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>

                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    className="w-8 h-8 bg-background/80 hover:bg-background rounded-full flex items-center justify-center shadow-warm"
                    aria-label="Add to wishlist"
                  >
                    <Icon name="Heart" size={16} />
                  </button>
                </div>

                {product?.badges && product?.badges?.length > 0 && (
                  <div className="absolute top-2 left-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-caption font-medium bg-accent/90 text-white">
                      {product?.badges?.[0]}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <Link to={`/product-detail-page?id=${product?.id}`}>
                      <h4 className="font-body font-medium text-foreground hover:text-primary transition-colors duration-200 line-clamp-2">
                        {product?.name}
                      </h4>
                    </Link>
                    <Link to={`/product-full/${product?.id}`} className="text-xs text-primary hover:underline ml-2">
                      Full
                    </Link>
                  </div>
                  <p className="font-caption text-sm text-muted-foreground mt-1">
                    {product?.variants?.[0]?.weight}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-data font-semibold text-foreground">
                    ₹{product?.variants?.[0]?.price?.toFixed(2)}
                  </span>
                  {product?.variants?.[0]?.originalPrice > product?.variants?.[0]?.price && (
                    <span className="font-data text-sm text-muted-foreground line-through">
                      ₹{product?.variants?.[0]?.originalPrice?.toFixed(2)}
                    </span>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={() => handleAddToCart(product)}
                  iconName="ShoppingCart"
                  iconPosition="left"
                  className="mt-3"
                >
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;