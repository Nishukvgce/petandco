import React from 'react';
import { Link } from 'react-router-dom';

const MobileHome = () => {
  const copyCode = (code) => {
    try { navigator.clipboard?.writeText(code); } catch (e) {}
  };

  return (
    <div className="min-h-screen bg-white text-foreground font-sans lg:hidden">
      {/* Top tiny blue bar */}
      <div className="bg-[#163f81] text-white text-center py-1 text-xs">GST 2.0 Reforms</div>

      {/* Navigation row */}
      <div className="flex items-center px-3 py-3 bg-white">
        <button aria-label="menu" className="p-2">
          <svg className="w-6 h-6 text-gray-800" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>

        <div className="flex-1 text-sm text-center">
          <div className="text-xs text-gray-600">Delivering to <span className="font-semibold">560034</span></div>
          <button className="text-xs text-primary text-[#0e6eff]">Change</button>
        </div>

        <button aria-label="wishlist" className="p-2">
          <svg className="w-6 h-6 text-gray-800" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </button>
      </div>

      {/* Logo + Search */}
      <div className="px-4 pt-2 pb-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-md flex items-center justify-center bg-[#ff7a00] lg:bg-transparent">
          <img src="/assets/images/logo-square.png" alt="logo" className="w-8 h-8 object-contain" />
        </div>
        <div className="flex-1">
          <div className="bg-white border border-[#e6e6e6] rounded-full px-3 py-2 shadow-sm">
            <input className="w-full text-sm placeholder-gray-400" placeholder="Search for products" />
          </div>
        </div>
      </div>

      {/* Hero banner */}
      <div className="px-4">
        <div className="relative overflow-hidden rounded-2xl">
          <img src="/assets/images/banners/Dog_Toys_Banner.webp" alt="hero" className="w-full h-56 object-cover rounded-2xl" />
          <div className="absolute left-4 bottom-4 text-white">
            <h2 className="text-lg font-bold">New toys added every week!</h2>
            <p className="text-sm opacity-90">Starting At ₹129 Only</p>
            <button className="mt-3 inline-flex items-center bg-[#ff6600] text-white px-3 py-2 rounded-lg text-sm">Explore More</button>
          </div>
        </div>
      </div>

      {/* Promo coupon card (single row scrollable area below hero) */}
      <div className="px-4 mt-4">
        <div className="bg-white border border-[#ffd6c4] rounded-xl p-3 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white border border-[#ffd6c4] flex items-center justify-center">
            <img src="/assets/images/coupon.avif" alt="coupon" className="w-8 h-8 object-contain" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold">Use Code: GROOMME</div>
            <div className="text-xs text-gray-600 mt-1">Get Flat 7% OFF on Grooming Products above ₹999</div>
          </div>
          <button onClick={() => copyCode('GROOMME')} className="ml-2 px-3 py-1 border rounded-md text-sm">Copy</button>
        </div>
      </div>

      {/* Product highlight */}
      <div className="px-4 mt-6">
        <h3 className="text-lg font-bold">Top Picks, Few Clicks!</h3>
        <p className="text-sm text-gray-600 mt-1">Restock on everyday essentials</p>
      </div>

      {/* Floating WhatsApp */}
      <a href="#" className="fixed right-4 bottom-20 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 15a4 4 0 0 1-4 4H7l-4 4V5a2 2 0 0 1 2-2h12a4 4 0 0 1 4 4z"/></svg>
      </a>

      {/* Bottom navigation (fixed) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#ececec] py-2">
        <div className="max-w-md mx-auto px-4 flex justify-between items-center">
          <button className="flex flex-col items-center text-xs text-[#ff6600]">
            <svg className="w-6 h-6 mb-1" viewBox="0 0 24 24" fill="none" stroke="#ff6600"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9.5L12 3l9 6.5V21a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.5z"/></svg>
            Home
          </button>
          <button className="flex flex-col items-center text-xs text-gray-600">
            <svg className="w-6 h-6 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
            Category
          </button>
          <button className="flex flex-col items-center text-xs text-gray-600">
            <svg className="w-6 h-6 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-3.86 0-7 1.79-7 4v4h14v-4c0-2.21-3.14-4-7-4z"/></svg>
            Pharmacy
          </button>
          <button className="flex flex-col items-center text-xs text-gray-600">
            <svg className="w-6 h-6 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="10.5" cy="17.5" r="1.5"/><circle cx="17.5" cy="17.5" r="1.5"/><path d="M3 3h2l1.6 9.6A2 2 0 0 0 8.5 15h8.9a2 2 0 0 0 2-1.6L21 6H6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/></svg>
            Cart
          </button>
          <button className="flex flex-col items-center text-xs text-gray-600">
            <svg className="w-6 h-6 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 21v-2a4 4 0 0 0-3-3.87" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/><path d="M4 21v-2a4 4 0 0 1 3-3.87" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/></svg>
            Account
          </button>
        </div>
      </nav>
    </div>
  );
};

export default MobileHome;
