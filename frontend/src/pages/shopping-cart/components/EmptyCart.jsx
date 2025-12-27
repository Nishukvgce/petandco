import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const EmptyCart = () => {
  const suggestedCategories = [
    {
      name: 'Sweets',
      path: '/?category=sweets',
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&h=200&fit=crop',
      description: 'Traditional handmade sweets'
    },
    {
      name: 'Savouries',
      path: '/?category=savouries',
      image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=300&h=200&fit=crop',
      description: 'Crispy and flavorful snacks'
    },
    {
      name: 'Pickles',
      path: '/?category=pickles',
      image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=300&h=200&fit=crop',
      description: 'Authentic homemade pickles'
    },
    {
      name: 'Kitchen Essentials',
      path: '/?category=kitchen-essentials',
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300&h=200&fit=crop',
      description: 'Natural oils and spices'
    }
  ];

  const popularProducts = [
    {
      id: 1,
      name: 'Organic Turmeric Powder',
      price: 149,
      originalPrice: 199,
      image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=200&h=200&fit=crop',
      rating: 4.8,
      reviews: 156
    },
    {
      id: 2,
      name: 'Homemade Mango Pickle',
      price: 299,
      originalPrice: 349,
      image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=200&h=200&fit=crop',
      rating: 4.9,
      reviews: 203
    },
    {
      id: 3,
      name: 'Cold Pressed Coconut Oil',
      price: 399,
      originalPrice: 499,
      image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200&h=200&fit=crop',
      rating: 4.7,
      reviews: 89
    }
  ];

  return (
    <div className="text-center py-12">
      {/* Empty Cart Icon */}
      <div className="mb-8">
        <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
          <Icon name="ShoppingCart" size={48} className="text-muted-foreground" />
        </div>
        <h2 className="font-heading font-semibold text-2xl text-foreground mb-2">
          Your cart is empty
        </h2>
        <p className="font-body text-muted-foreground max-w-md mx-auto">
          Looks like you haven't added any items to your cart yet. Start shopping to fill it up with natural goodness!
        </p>
      </div>
      {/* Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
        <Link to="/homepage">
          <Button variant="default" size="lg" iconName="Home" iconPosition="left">
            Go to Homepage
          </Button>
        </Link>
        <Link to="/">
          <Button variant="outline" size="lg" iconName="Search" iconPosition="left">
            Browse Products
          </Button>
        </Link>
      </div>
      {/* Suggested Categories */}
      <div className="mb-12">
        <h3 className="font-heading font-semibold text-xl text-foreground mb-6">
          Shop by Category
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {suggestedCategories?.map((category, index) => (
            <Link
              key={index}
              to={category?.path}
              className="group bg-card border border-border rounded-lg overflow-hidden hover:shadow-warm-md transition-all duration-300"
            >
              <div className="aspect-video overflow-hidden">
                <Image
                  src={category?.image}
                  alt={category?.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <h4 className="font-body font-semibold text-foreground mb-1">
                  {category?.name}
                </h4>
                <p className="font-caption text-sm text-muted-foreground">
                  {category?.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
      {/* Popular Products */}
      <div>
        <h3 className="font-heading font-semibold text-xl text-foreground mb-6">
          Popular Products
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularProducts?.map((product) => {
            const discountPercentage = Math.round(((product?.originalPrice - product?.price) / product?.originalPrice) * 100);
            
            return (
              <div
                key={product?.id}
                className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-warm-md transition-all duration-300"
              >
                <div className="aspect-square overflow-hidden">
                  <Image
                    src={product?.image}
                    alt={product?.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h4 className="font-body font-semibold text-foreground mb-2 line-clamp-2">
                    {product?.name}
                  </h4>
                  
                  {/* Rating removed from UI */}
                  
                  {/* Price */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-data font-bold text-lg text-foreground">
                      ₹{product?.price}
                    </span>
                    <span className="font-data text-sm text-muted-foreground line-through">
                      ₹{product?.originalPrice}
                    </span>
                    <span className="font-caption text-xs font-medium text-success bg-success/10 px-2 py-1 rounded">
                      {discountPercentage}% OFF
                    </span>
                  </div>
                  
                  <Button
                    variant="outline"
                    fullWidth
                    size="sm"
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
      </div>
    </div>
  );
};

export default EmptyCart;