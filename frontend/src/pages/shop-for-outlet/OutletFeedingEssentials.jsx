import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import { useCart } from '../../contexts/CartContext';
import Footer from '../homepage/components/Footer';
import MobileBottomNav from '../../components/ui/MobileBottomNav';
import productApi from '../../services/productApi';

const categories = [
  { id: 'bowls', label: 'Bowls', img: '/assets/images/dog/db1.webp' },
  { id: 'slow-feeders', label: 'Slow Feeders', img: '/assets/images/dog/db2.webp' },
  { id: 'water-dispensers', label: 'Water Dispensers', img: '/assets/images/dog/db3.webp' },
  { id: 'feeding-mats', label: 'Feeding Mats', img: '/assets/images/dog/db4.webp' },
  { id: 'all', label: 'All Feeding Essentials', img: '/assets/images/essential/all-food.webp' }
];

const ProductCard = ({ p }) => {
  const { addToCart } = useCart();
  const [variantIdx, setVariantIdx] = useState(0);
  const variants = p.variants || [{ weight: 'Default', price: p.price, originalPrice: p.original, stock: 1 }];
  const currentVariant = variants[variantIdx];
  const currentPrice = currentVariant.price || p.price || 0;
  const originalPrice = currentVariant.originalPrice || p.original || 0;
  const discount = originalPrice > currentPrice ? Math.round(100 - (currentPrice / originalPrice) * 100) : 0;
  const isInStock = currentVariant.stock > 0;

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '/assets/images/no_image.png';
    if (imageUrl.startsWith('http')) return imageUrl;
    if (imageUrl.startsWith('/admin/')) {
      return `http://localhost:8080${imageUrl}`;
    }
    return imageUrl;
  };

  const handleAddToCart = () => {
    if (!isInStock) return;
    addToCart({
      id: p.id,
      name: p.name,
      image: getImageUrl(p.image),
      price: currentPrice,
      variant: currentVariant.weight ? `${currentVariant.weight}${currentVariant.weightUnit || ''}` : 'Default',
      quantity: 1,
      category: 'Outlet Feeding Essentials'
    });
  };

  return (
    <article className={`bg-white rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 ${
      !isInStock ? 'opacity-75' : ''
    }`}>
      <div className="p-3 md:p-4">
        <div className="h-6 flex items-center justify-between mb-3">
          <div className={`text-xs font-semibold px-3 py-1 rounded-full ${
            isInStock ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'
          }`}>
            {!isInStock ? 'Out of Stock' : (p.badges?.[0] || 'Outlet')}
          </div>
          {discount > 0 && (
            <div className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              {discount}% OFF
            </div>
          )}
        </div>
        <div className="relative mb-4">
          <div className="h-40 md:h-48 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden">
            <img 
              src={getImageUrl(p.image)} 
              alt={p.name} 
              className="max-h-full max-w-full object-contain hover:scale-105 transition-transform duration-300"
              onError={(e) => e.target.src = '/assets/images/no_image.png'}
            />
          </div>
          {!isInStock && (
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center rounded-lg">
              <span className="text-white font-bold text-sm">Out of Stock</span>
            </div>
          )}
        </div>
        <h3 className="text-sm md:text-base font-semibold text-foreground mb-3 line-clamp-2 leading-tight overflow-hidden" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>{p.name}</h3>
        {variants.length > 1 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {variants.map((v, i) => (
              <span 
                key={i} 
                onClick={() => setVariantIdx(i)}
                className={`text-xs font-medium px-3 py-1.5 border rounded-full cursor-pointer transition-all duration-200 ${
                  i === variantIdx 
                    ? 'border-orange-500 bg-orange-50 text-orange-600' 
                    : 'border-border hover:border-orange-300 hover:bg-orange-50'
                }`}
              >
                {v.weight ? `${v.weight}${v.weightUnit || ''}` : 'Default'}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <div className="text-lg md:text-xl font-bold text-foreground">₹{currentPrice}</div>
            {originalPrice > currentPrice && (
              <div className="text-sm text-muted-foreground line-through">₹{originalPrice}</div>
            )}
          </div>
          <button 
            onClick={handleAddToCart}
            disabled={!isInStock}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
              isInStock 
                ? 'bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white hover:shadow-md'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isInStock ? 'Add' : 'Unavailable'}
          </button>
        </div>
      </div>
    </article>
  );
};

const OutletFeedingEssentials = ({ initialActive = 'All Feeding Essentials' }) => {
  const [active, setActive] = useState(initialActive);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = { type: 'Outlet' };
        const apiData = await productApi.getCustomerProducts(params);
        
        let filteredProducts = (apiData || []).filter(item => {
          const categoryMatch = item?.category?.toUpperCase() === 'OUTLET FEEDING ESSENTIALS' || 
                               item?.category?.toUpperCase() === 'FEEDING ESSENTIALS' ||
                               item?.category?.toUpperCase() === 'FEEDING';
          
          if (!categoryMatch) return false;
          
          if (active === 'All Feeding Essentials') {
            return true;
          }
          
          const subcategoryMatch = item?.subcategory === active;
          return subcategoryMatch;
        });

        const normalized = filteredProducts.map(item => {
          const variants = item?.variants || [];
          const hasValidVariants = variants.length > 0;
          const primaryImage = item?.imageUrl || 
                               (item?.images && item.images.length > 0 ? item.images[0] : null) || 
                               '/assets/images/no_image.png';
          
          return {
            id: item?.id,
            name: item?.name,
            image: primaryImage,
            badges: item?.badges || ['Outlet'],
            variants: hasValidVariants ? variants : [{
              weight: 'Default',
              price: Number(item?.price || 0),
              originalPrice: Number(item?.originalPrice || item?.mrp || 0),
              stock: item?.stockQuantity || 0
            }],
            price: Number(item?.price || 0),
            original: Number(item?.originalPrice || item?.mrp || 0) || null,
            category: item?.category || '',
            subcategory: item?.subcategory || '',
            stockQuantity: item?.stockQuantity || 0
          };
        });
        
        console.log('Filtered feeding essentials for', active, ':', normalized);
        setProducts(normalized);
      } catch (err) {
        console.error('Outlet Feeding Essentials: load failed', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [active]);

  return (
    <div className="min-h-screen bg-background">
      <Helmet><title>Outlet Feeding Essentials - Pet & Co</title></Helmet>
      <Header />
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Outlet Feeding Essentials</h1>
          <p className="text-sm text-muted-foreground mt-2">Discounted feeding essentials for your pets</p>
        </div>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-72 space-y-3">
            <h3 className="text-lg font-semibold text-foreground mb-4">Categories</h3>
            {categories.map(c => (
              <button key={c.id} onClick={() => setActive(c.label)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all duration-200 hover:shadow-md ${
                  active === c.label
                    ? 'bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-500 shadow-md'
                    : 'bg-white hover:bg-gray-50 border border-border shadow-sm'
                }`}>
                <div className="flex-shrink-0">
                  <img 
                    src={c.img} 
                    alt={c.label} 
                    className="w-14 h-14 object-cover rounded-lg shadow-sm"
                    onError={(e) => e.target.src = '/assets/images/no_image.png'}
                  />
                </div>
                <div className="flex-1">
                  <div className={`font-semibold text-sm ${
                    active === c.label ? 'text-orange-600' : 'text-foreground'
                  }`}>
                    {c.label}
                  </div>
                  {active === c.label && (
                    <div className="text-xs text-orange-500 mt-1">Currently viewing</div>
                  )}
                </div>
                {active === c.label && (
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                )}
              </button>
            ))}
          </div>
          <div className="flex-1">
            <div className="mb-6 bg-white rounded-lg p-4 border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-2">{active}</h2>
              <div className="flex items-center gap-4">
                <p className="text-sm text-muted-foreground">
                  {loading ? 'Loading...' : `${products.length} products found`}
                </p>
                {products.length > 0 && !loading && (
                  <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Live inventory
                  </div>
                )}
              </div>
            </div>
            {loading ? (
              <div className="flex items-center justify-center h-64 bg-white rounded-lg border border-border">
                <div className="text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <div className="text-muted-foreground">Loading products...</div>
                </div>
              </div>
            ) : products.length === 0 ? (
              <div className="flex items-center justify-center h-64 bg-white rounded-lg border border-border">
                <div className="text-center">
                  <div className="text-6xl mb-4">🍽️</div>
                  <div className="text-foreground font-semibold mb-2">No feeding essentials found in "{active}"</div>
                  <div className="text-sm text-muted-foreground mb-4">
                    Check other categories or try again later.
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {products.map(p => <ProductCard key={p.id} p={p} />)}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer /><MobileBottomNav />
    </div>
  );
};

export default OutletFeedingEssentials;