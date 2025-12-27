import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import MegaMenu from '../../components/ui/MegaMenu';
import HeroSlider from '../../components/ui/HeroSlider';
import CategoryTiles from './components/CategoryTiles';
import BestsellersCarousel from './components/BestsellersCarousel';
import PromoCards from '../../components/ui/PromoCards';
import Essential from './components/Essential';
import FeaturedBrands, { DecodingCatsSection } from './components/FeaturedBrands';
import HouseOfPetCo from './components/HouseOfPetCo';
import CatBanner from './components/CatBanner';
import DogBanner from './components/DogBanner';
import Footer from './components/Footer';
import MobileBottomNav from '../../components/ui/MobileBottomNav';
import WinterCollection from './components/WinterCollection'; // Updated import path for WinterCollection

// MobileHome removed to unify mobile and desktop into one responsive page

import { useCart } from '../../contexts/CartContext';

const Homepage = () => {
  const { addToCart, getCartItemCount, cartItems } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMegaMenuOpenMobile, setIsMegaMenuOpenMobile] = useState(false);

  // Mock cart data for demonstration
  useEffect(() => {
    const mockCartItems = [
      {
        id: 1,
        name: "Traditional Mysore Pak",
        price: 399,
        image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=400&fit=crop",
        variant: "250g",
        quantity: 2
      },
      {
        id: 2,
        name: "Homemade Mango Pickle",
        price: 280,
        image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=400&fit=crop",
        variant: "500g",
        quantity: 1
      }
    ];
    // The original code had setCartItems(mockCartItems) here which would be incorrect if CartContext doesn't manage initial state this way.
    // Assuming addToCart handles adding items and the context maintains the state.
    // If initial cart state is needed, it should be handled within CartContext.
  }, []);

  const handleAddToCart = (product) => {
    const cartItem = {
      id: `${product.id}-default`,
      productId: product.id,
      name: product.name,
      price: product.salePrice || product.price,
      originalPrice: product.originalPrice || product.price,
      image: product.image,
      variant: 'Default',
      category: product.category,
      brand: product.brand
    };
    addToCart(cartItem, 1);
    console.log('Added to cart:', cartItem);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    // Navigate to product collection with search query (homepage search handling)
    window.location.href = `/?search=${encodeURIComponent(query)}`;
  };

  return (
    <>
      <Helmet>
        <title>PET&CO - Premium Natural & Handmade Food Products</title>
        <meta
          name="description"
          content="Discover authentic Indian flavors with PET&CO premium handmade food products. From traditional sweets to organic spices, experience pure natural taste with free shipping on orders above ₹499."
        />
        <meta name="keywords" content="natural food products, handmade sweets, organic spices, traditional pickles, pure ghee, Indian food, authentic flavors, chemical-free, preservative-free" />
        <meta property="og:title" content="PET&CO - Premium Natural & Handmade Food Products" />
        <meta property="og:description" content="Discover authentic Indian flavors with premium handmade food products. Free shipping on orders above ₹499." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://neenusnatural.com/homepage" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="PET&CO - Premium Natural Food Products" />
        <meta name="twitter:description" content="Authentic Indian flavors, handmade with love. Free shipping on orders above ₹499." />
        <link rel="canonical" href="https://neenusnatural.com/homepage" />
      </Helmet>

      {/* Mobile-first content (small screens) - reuse existing components instead of a separate mobile page */}
      <div className="lg:hidden">
        <div className="bg-[#163f81] text-white text-center py-1 text-sm">GST 2.0 Reforms</div>

        <div className="flex items-center justify-between px-4 py-2">
          <button aria-label="Open menu" className="p-2" onClick={() => setIsMegaMenuOpenMobile(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="text-center">
            <div className="text-sm">Delivering to <span className="font-semibold">560034</span></div>
            <button className="text-xs text-[#ff7a00]">Change</button>
          </div>

          <button aria-label="Wishlist" className="p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21.382 4.318 12.682a4.5 4.5 0 010-6.364z" />
            </svg>
          </button>
        </div>

        {/* Mobile MegaMenu (drawer) */}
        <MegaMenu
          isOpen={isMegaMenuOpenMobile}
          onClose={() => setIsMegaMenuOpenMobile(false)}
          activeCategory={null}
        />

        <div className="flex items-center px-4 py-2 gap-3">
          <img src="/assets/images/logo.png" alt="logo" className="w-10 h-10 object-contain" />
          <div className="flex-1">
            <input
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(searchQuery); }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for products"
              className="w-full border border-[#e6e6e6] rounded-full px-4 py-2 text-sm"
            />
          </div>
        </div>

        <main className="pb-28">
          {/* Hero Slider */}
          <HeroSlider />

          {/* Promo cards (coupons / codes) - placed directly after hero */}
          <PromoCards />

          {/* Essentials section (below promo cards) */}
          <Essential />

          {/* Featured Brands (next section) */}
          <FeaturedBrands />

          {/* From the House of PET&CO */}
          <HouseOfPetCo />

          {/* Cat banner between HouseOfPetCo and Decoding Cats */}
          <CatBanner />

          {/* Decoding Cats section (moved out of FeaturedBrands so it appears after the banner) */}
          <DecodingCatsSection />

          {/* Dog banner above Winter Collection */}
          <DogBanner />

          {/* Winter Collection Section */}
          <WinterCollection /> {/* Integrated WinterCollection component */}

          {/* Category Tiles */}
          <CategoryTiles />

          {/* Bestsellers Carousel */}
          <BestsellersCarousel onAddToCart={handleAddToCart} />

          {/* Winter Collection Section */}
          <WinterCollection /> {/* Integrated WinterCollection component */}
        </main>

        {/* Footer */}
        <Footer />

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav />
      </div>

      {/* Desktop / large screens */}
      <div className="hidden lg:block min-h-screen bg-background">
        {/* Header */}
        <Header
          cartItemCount={getCartItemCount()}
          onSearch={handleSearch}
          cartItems={cartItems}
        />

        {/* Main Content */}
        <main>
          {/* Hero Slider */}
          <HeroSlider />

          {/* Promo cards (coupons / codes) - placed directly after hero */}
          <PromoCards />

          {/* Essentials (below promo cards) */}
          <Essential />

          {/* Featured Brands (next section) */}
          <FeaturedBrands />

          {/* From the House of PET&CO */}
          <HouseOfPetCo />

          {/* Cat banner between HouseOfPetCo and Decoding Cats */}
          <CatBanner />

          {/* Decoding Cats section (moved out of FeaturedBrands so it appears after the banner) */}
          <DecodingCatsSection />

          {/* Dog banner above Winter Collection */}
          <DogBanner />

          {/* Winter Collection Section */}
          <WinterCollection />

          {/* Category Tiles */}
          <CategoryTiles />

          {/* Bestsellers Carousel */}
          <BestsellersCarousel onAddToCart={handleAddToCart} />

          {/* Newsletter Section removed per request */}
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
};

export default Homepage;