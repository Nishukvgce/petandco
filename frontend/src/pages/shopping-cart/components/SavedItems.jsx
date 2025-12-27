import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const SavedItems = ({ savedItems = [], onMoveToCart, onRemoveFromSaved }) => {
  if (savedItems?.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="font-heading font-semibold text-lg text-foreground mb-4">
        Saved for Later ({savedItems?.length})
      </h2>
      <div className="space-y-4">
        {savedItems?.map((item) => {
          const discountAmount = item?.originalPrice - item?.price;
          const discountPercentage = Math.round((discountAmount / item?.originalPrice) * 100);
          
          return (
            <div key={item?.id} className="bg-card border border-border rounded-lg p-4 shadow-warm">
              <div className="flex gap-4">
                {/* Product Image */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={item?.image}
                    alt={item?.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-body font-semibold text-foreground truncate">
                        {item?.name}
                      </h3>
                      <p className="font-caption text-sm text-muted-foreground">
                        {item?.variant}
                      </p>
                      
                      {/* Badges */}
                      {item?.badges && item?.badges?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item?.badges?.slice(0, 2)?.map((badge, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-caption font-medium bg-accent/10 text-accent"
                            >
                              {badge}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => onRemoveFromSaved(item?.id)}
                      className="p-1 hover:bg-destructive/10 hover:text-destructive rounded transition-colors duration-200 ml-2"
                      aria-label="Remove from saved"
                    >
                      <Icon name="X" size={16} />
                    </button>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-data font-bold text-foreground">
                      ₹{item?.price?.toFixed(2)}
                    </span>
                    {discountAmount > 0 && (
                      <>
                        <span className="font-data text-sm text-muted-foreground line-through">
                          ₹{item?.originalPrice?.toFixed(2)}
                        </span>
                        <span className="font-caption text-xs font-medium text-success bg-success/10 px-2 py-1 rounded">
                          {discountPercentage}% OFF
                        </span>
                      </>
                    )}
                  </div>

                  {/* Stock Status */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-success rounded-full"></div>
                      <span className="font-caption text-xs text-success">In Stock</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => onMoveToCart(item)}
                      iconName="ShoppingCart"
                      iconPosition="left"
                      iconSize={14}
                    >
                      Move to Cart
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveFromSaved(item?.id)}
                      iconName="Trash2"
                      iconPosition="left"
                      iconSize={14}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SavedItems;