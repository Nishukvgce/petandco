import React, { useState, useEffect, useRef } from 'react';
import PincodeModal from './PincodeModal';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import pawLottie from '../../assets/paw-lottie.json';
import { useAuth } from '../../contexts/AuthContext';

import Input from './Input';
import AnnouncementBar from './AnnouncementBar';
import MegaMenu from './MegaMenu';
import CartDrawer from './CartDrawer';
import { useCart } from '../../contexts/CartContext.jsx';


const Header = ({ onSearch = () => { } }) => {
  const { cartItems, getCartItemCount, updateQuantity, removeFromCart } = useCart();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [isHidden, setIsHidden] = useState(false);
  const navRef = useRef(null);
  const [navHeight, setNavHeight] = useState(0);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [activeMegaCategory, setActiveMegaCategory] = useState(null);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef(null);
  const pawContainerRef = useRef(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [featuredProduct, setFeaturedProduct] = useState(null);
  const phrases = [
    'Search for shampoos',
    'Search for cat foods',
    'Search for dog foods',
    'Search for raincoats'
  ];
  const typingRef = useRef({ timer: null, phraseIndex: 0, charIndex: 0, deleting: false });
  const [animatedText, setAnimatedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [showAnnouncementBar, setShowAnnouncementBar] = useState(true);
  const [isPincodeModalOpen, setIsPincodeModalOpen] = useState(false);
  const [userPincode, setUserPincode] = useState(() => (typeof window !== 'undefined' && window.localStorage.getItem('userPincode')) || '');
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);


  const location = useLocation();

  const lastScrollY = useRef(0);

  useEffect(() => {
    setIsMegaMenuOpen(false);
    setIsSearchOpen(false);
    setIsAccountDropdownOpen(false);
  }, [location]);

  // Hide header on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const current = window.pageYOffset || document.documentElement.scrollTop;
      const delta = current - (lastScrollY.current || 0);

      // always show when near top
      if (current < 80) {
        setIsHidden(false);
      } else if (delta > 15) {
        // scrolled down
        setIsHidden(true);
      } else if (delta < -15) {
        // scrolled up
        setIsHidden(false);
      }

      lastScrollY.current = current;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Measure header height and set spacer so page content is pushed below fixed header
  useEffect(() => {
    const update = () => {
      if (headerRef.current) setHeaderHeight(headerRef.current.offsetHeight);
      if (navRef.current) setNavHeight(navRef.current.offsetHeight);
    };
    // measure after a short delay to allow images/fonts to load
    update();
    const t = setTimeout(update, 100);
    window.addEventListener('resize', update);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', update);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isAccountDropdownOpen && !event.target.closest('.account-dropdown')) {
        setIsAccountDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAccountDropdownOpen]);

  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setSuggestionsOpen(false);
      return;
    }
    let ignore = false;
    setSearchLoading(true);
    const timer = setTimeout(async () => {
      try {
        const list = await fetch('/api/products');
        let items = await list.json();
        const qLower = q.toLowerCase();
        const buildSearchText = (p) => {
          const parts = [];
          if (p?.name) parts.push(p.name);
          if (p?.title) parts.push(p.title);
          if (p?.category) parts.push(typeof p.category === 'string' ? p.category : (p.category?.name || ''));
          if (p?.subcategory) parts.push(typeof p.subcategory === 'string' ? p.subcategory : (p.subcategory?.name || ''));
          if (Array.isArray(p?.tags)) parts.push(p.tags.join(' '));
          return parts.join(' ').toLowerCase();
        };
        items = items.filter(p => buildSearchText(p).includes(qLower));
        const limited = items.slice(0, 8).map(p => ({
          id: p?.id,
          name: p?.name || p?.title,
          price: p?.price ?? p?.salePrice ?? 0,
          image: p?.imageUrl || p?.image || p?.thumbnailUrl || p?.image_path
        }));
        if (!ignore) {
          setSuggestions(limited);
          setSuggestionsOpen(true);
        }
      } catch (e) {
        if (!ignore) {
          setSuggestions([]);
          setSuggestionsOpen(false);
        }
      } finally {
        if (!ignore) setSearchLoading(false);
      }
    }, 250);
    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  // Typing animation effect for placeholder overlay
  useEffect(() => {
    // if user interacted or input has value, stop animation
    if (isSearchFocused || (searchQuery && searchQuery.trim() !== '')) {
      // clear any timers
      if (typingRef.current.timer) {
        clearTimeout(typingRef.current.timer);
        typingRef.current.timer = null;
      }
      setAnimatedText('');
      return;
    }

    let mounted = true;

    const tick = () => {
      const state = typingRef.current;
      const phrase = phrases[state.phraseIndex];

      if (!state.deleting) {
        // type next char
        state.charIndex = Math.min(state.charIndex + 1, phrase.length);
        if (mounted) setAnimatedText(phrase.slice(0, state.charIndex));

        if (state.charIndex === phrase.length) {
          // pause at end, then start deleting
          state.timer = setTimeout(() => {
            state.deleting = true;
            tick();
          }, 1000);
          return;
        }
        state.timer = setTimeout(tick, 80);
      } else {
        // deleting
        state.charIndex = Math.max(state.charIndex - 1, 0);
        if (mounted) setAnimatedText(phrase.slice(0, state.charIndex));

        if (state.charIndex === 0) {
          state.deleting = false;
          state.phraseIndex = (state.phraseIndex + 1) % phrases.length;
          state.timer = setTimeout(tick, 300);
          return;
        }
        state.timer = setTimeout(tick, 40);
      }
    };

    // reset state and start
    typingRef.current.timer && clearTimeout(typingRef.current.timer);
    typingRef.current.deleting = false;
    typingRef.current.charIndex = 0;
    // keep previous phraseIndex to continue loop smoothly
    tick();

    return () => {
      mounted = false;
      if (typingRef.current.timer) {
        clearTimeout(typingRef.current.timer);
        typingRef.current.timer = null;
      }
    };
  }, [isSearchFocused, searchQuery]);

  // Blinking cursor
  useEffect(() => {
    // Only blink when animatedText is present
    let id = null;
    if (animatedText !== '') {
      id = setInterval(() => {
        setShowCursor(s => !s);
      }, 530);
    } else {
      setShowCursor(true);
    }
    return () => {
      if (id) clearInterval(id);
    };
  }, [animatedText]);

  // Mount Lottie paw animation into the paw container (loads lottie-web from CDN if needed)
  useEffect(() => {
    const container = pawContainerRef.current;
    if (!container) return;

    let anim = null;
    let scriptEl = null;

    const mount = () => {
      try {
        if (window.lottie && container) {
          anim = window.lottie.loadAnimation({
            container,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            animationData: pawLottie,
          });
          // reduce playback speed (1.0 is normal speed). 0.5 = half speed
          try {
            if (anim && typeof anim.setSpeed === 'function') anim.setSpeed(0.4);
          } catch (e) {
            // ignore if setSpeed not available
          }
        }
      } catch (err) {
        // fail silently - keep SVG trail as fallback
        // eslint-disable-next-line no-console
        console.error('Failed to mount Lottie paw animation', err);
      }
    };

    if (window.lottie) {
      mount();
    } else {
      // inject CDN script
      scriptEl = document.createElement('script');
      scriptEl.src = 'https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.9.6/lottie.min.js';
      scriptEl.async = true;
      scriptEl.onload = mount;
      scriptEl.onerror = () => {
        // eslint-disable-next-line no-console
        console.error('Failed to load lottie-web from CDN');
      };
      document.body.appendChild(scriptEl);
    }

    return () => {
      if (anim && anim.destroy) anim.destroy();
      if (scriptEl && scriptEl.parentNode) scriptEl.parentNode.removeChild(scriptEl);
    };
  }, []);

  // Fetch a featured product from the API to display next to the logo
  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const res = await fetch('/api/products');
        if (!res.ok) return;
        const items = await res.json();
        if (ignore) return;
        if (Array.isArray(items) && items.length > 0) {
          // prefer an item that has an image
          const pick = items.find(p => p?.image || p?.imageUrl || p?.thumbnailUrl || p?.image_path) || items[0];
          setFeaturedProduct(pick || null);
        }
      } catch (e) {
        // fail silently
      }
    };
    load();
    return () => { ignore = true; };
  }, []);

  const handleSearch = (e) => {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery?.trim()) params.set('search', searchQuery.trim());
    const target = `/shop-for-dogs${params.toString() ? `?${params.toString()}` : ''}`;
    navigate(target);
    if (searchQuery?.trim() && onSearch) onSearch(searchQuery.trim());
  };

  const navigationItems = [
    { label: 'Products', path: '/shop-for-dogs' },
    { label: 'Account', path: '/user-account-dashboard' },
  ];

  return (
    <>
      <div id="site-header" ref={headerRef} className={`fixed top-0 left-0 right-0 z-50`}>
        {/* Top Bar - Desktop (Golden) */}
        <div className={`hidden lg:block bg-[#d4af37] text-[#0f1724] py-2 text-sm`}>
          <div className="container mx-auto px-4 flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <a className="hover:underline" href="#">Become a Franchisee</a>
              <span className="text-white/60">|</span>
              <a className="hover:underline" href="#">Store Locator</a>
              <span className="text-white/60">|</span>
              <a className="hover:underline" href="#">Track Order</a>
            </div>
            <div className="hidden sm:flex items-center text-sm font-medium">
              <span>GST 2.0 Reforms</span>
            </div>
          </div>
        </div>

        {/* Top Bar - Mobile (Blue) */}
        <div className={`lg:hidden bg-[#1e3a8a] text-white py-2 text-sm text-center font-medium`}>
          GST 2.0 Reforms
        </div>

        {/* Mobile compact header (visible on small screens) - back + rounded search */}
        <div className="lg:hidden bg-white border-b border-[#e6e6e6] py-2">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(-1)} aria-label="Back" className="p-2">
                <Icon name="ChevronLeft" size={22} />
              </button>

              <form onSubmit={handleSearch} className="flex-1 relative">
                <div className={`flex items-center bg-white rounded-full px-3 py-2 shadow-sm border ${isSearchFocused ? 'border-orange-400 ring-2 ring-orange-200' : 'border-border'}`}>
                  <Icon name="Search" size={16} className="text-gray-400 mr-2" />
                  <Input
                    ref={inputRef}
                    type="search"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e?.target?.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    className="flex-1 border-0 focus:ring-0 text-sm"
                  />
                </div>

                {/* mobile suggestions */}
                {suggestionsOpen && suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 mt-2 bg-card border border-border rounded-md shadow-warm z-50 overflow-hidden">
                    {suggestions.map(item => (
                      <button
                        key={item.id}
                        onClick={() => navigate(`/product-details/${item.id}`)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-muted/40 text-left"
                      >
                        <img src={item.image || '/assets/images/no_image.png'} alt={item.name} className="w-10 h-10 object-cover rounded" />
                        <div className="flex-1">
                          <div className="text-sm text-foreground line-clamp-1">{item.name}</div>
                          <div className="text-xs text-muted-foreground">₹{(item.price || 0).toFixed(2)}</div>
                        </div>
                        <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
                      </button>
                    ))}
                    <div className="border-t border-border">
                      <button
                        onClick={handleSearch}
                        className="w-full text-left p-3 text-sm hover:bg-muted/40"
                      >
                        View all results
                      </button>
                    </div>
                  </div>
                )}
              </form>

              {/* optional cart quick action on mobile */}
              <button onClick={() => setIsCartDrawerOpen(true)} className="p-2">
                <Icon name="ShoppingCart" size={20} />
              </button>

              {/* hamburger toggle for mobile navigation (opens MegaMenu drawer) */}
              <button
                onClick={() => { setIsMegaMenuOpen(!isMegaMenuOpen); setActiveMegaCategory(null); }}
                aria-label="Open menu"
                className="p-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Main white header with logo, large rounded search, and right actions */}
        <div className="hidden lg:block bg-white border-b border-[#e6e6e6] py-4">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              {/* Left: small orange square logo */}
              <Link to="/homepage" className="flex items-center mr-6 relative">
                <div className="w-20 h-20 bg-[#ff7a00] lg:bg-transparent rounded-md flex items-center justify-center">
                  {/* keep using existing logo if present, fallback to logo.png */}
                  <img src="/assets/images/logo.png" alt="Logo" className="w-20 h-20 object-contain" onError={(e) => { e.target.onerror = null; e.target.src = '/assets/images/logo.png' }} />
                </div>
                {/* Featured product (fallback to Lottie paw animation) */}
                {featuredProduct ? (
                  <Link
                    to={`/product-details/${featuredProduct.id}`}
                    className="pointer-events-auto hidden sm:flex items-center justify-center rounded-full overflow-hidden"
                    style={{ position: 'absolute', left: 86, top: -6, width: 34, height: 34 }}
                    aria-label={featuredProduct.name || 'Featured product'}
                  >
                    <img
                      src={featuredProduct.image || featuredProduct.imageUrl || featuredProduct.thumbnailUrl || featuredProduct.image_path}
                      alt={featuredProduct.name || featuredProduct.title || 'Product'}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </Link>
                ) : (
                  /* Lottie paw animation container (positioned relative to the logo) */
                  <div
                    ref={pawContainerRef}
                    className="pointer-events-none hidden sm:block"
                    aria-hidden="true"
                    style={{ position: 'absolute', left: 86, top: -6, width: 34, height: 34 }}
                  />
                )}
              </Link>

              {/* Center: large rounded search */}
              <div className="flex-1 mx-6 max-w-xl">
                <form onSubmit={handleSearch} className="relative">
                  <div className="gradient-outline flex items-center bg-white rounded-full px-3 py-2 shadow-sm hover:shadow-md transition-shadow duration-150 relative">
                    <Icon name="Search" size={16} className="text-gray-400 mr-3" />
                    <Input
                      ref={inputRef}
                      type="search"
                      placeholder=""
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e?.target?.value)}
                      onFocus={() => setIsSearchFocused(true)}
                      onBlur={() => setIsSearchFocused(false)}
                      className="flex-1 border-0 focus:ring-0 placeholder-gray-400 text-xs"
                    />

                    {/* Animated placeholder overlay (click focuses input) */}
                    {/* Show only when input is empty and not focused */}
                    {(!isSearchFocused && (!searchQuery || searchQuery?.trim() === '')) && (
                      <button
                        type="button"
                        onClick={() => {
                          inputRef.current?.focus();
                        }}
                        className="absolute left-10 right-4 top-1/2 -translate-y-1/2 text-left text-gray-400 text-xs pointer-events-auto"
                      >
                        <span>{animatedText}{showCursor ? '|' : ' '}</span>
                      </button>
                    )}

                  </div>
                  {/* Suggestions dropdown preserved */}
                  {suggestionsOpen && suggestions.length > 0 && (
                    <div className="absolute left-0 right-0 mt-2 bg-card border border-border rounded-md shadow-warm z-50 overflow-hidden">
                      {suggestions.map(item => (
                        <button
                          key={item.id}
                          onClick={() => navigate(`/product-details/${item.id}`)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-muted/40 text-left"
                        >
                          <img src={item.image || '/assets/images/no_image.png'} alt={item.name} className="w-10 h-10 object-cover rounded" />
                          <div className="flex-1">
                            <div className="text-sm text-foreground line-clamp-1">{item.name}</div>
                            <div className="text-xs text-muted-foreground">₹{(item.price || 0).toFixed(2)}</div>
                          </div>
                          <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
                        </button>
                      ))}
                      <div className="border-t border-border">
                        <button
                          onClick={handleSearch}
                          className="w-full text-left p-3 text-sm hover:bg-muted/40"
                        >
                          View all results
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              </div>

              {/* Right actions: pincode, wishlist, cart, login/signup button */}

              <div className="flex items-center space-x-6">

                <button
                  className="flex items-center text-sm text-gray-700 space-x-2 focus:outline-none hover:underline"
                  onClick={() => setIsPincodeModalOpen(true)}
                  aria-label="Set delivery pincode"
                  type="button"
                >
                  <Icon name="MapPin" size={18} className="text-gray-600" />
                  <span className="font-medium" id="header-pincode">{userPincode || 'Enter Pincode'}</span>
                </button>

                {/* PincodeModal Popup */}
                <PincodeModal
                  isOpen={isPincodeModalOpen}
                  onClose={() => setIsPincodeModalOpen(false)}
                  onSave={(pin) => {
                    setUserPincode(pin);
                    if (typeof window !== 'undefined') window.localStorage.setItem('userPincode', pin);
                    setIsPincodeModalOpen(false);
                  }}
                />

                <button
                  onClick={() => setIsCartDrawerOpen(true)}
                  className="relative flex items-center text-gray-800 hover:text-primary"
                  aria-label="Open cart"
                >
                  <Icon name="ShoppingCart" size={22} />
                  {getCartItemCount() > 0 && (
                    <span className="absolute -top-1 -right-2 bg-[#10b981] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {getCartItemCount()}
                    </span>
                  )}
                  <span className="ml-2 hidden sm:inline">Cart</span>
                </button>

                {user ? (
                  <div className="relative account-dropdown">
                    <button
                      onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                      className="flex items-center space-x-2 text-gray-800 hover:text-primary transition-colors"
                    >
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Icon name="User" size={16} className="text-primary" />
                      </div>
                      <span className="hidden sm:inline font-medium">{user.name || user.email?.split('@')[0]}</span>
                      <Icon name="ChevronDown" size={16} className={`transition-transform duration-200 ${isAccountDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {isAccountDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-64 bg-white border border-border rounded-lg shadow-lg py-2 z-50">
                        {/* User Info Header */}
                        <div className="px-4 py-3 border-b border-border">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <Icon name="User" size={18} className="text-primary" />
                            </div>
                            <div>
                              <div className="font-medium text-foreground">{user.name || 'User'}</div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                          </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="px-4 py-3 border-b border-border">
                          <div className="grid grid-cols-2 gap-2 text-center">
                            <div>
                              <div className="text-lg font-bold text-primary">{user.totalOrders || 5}</div>
                              <div className="text-xs text-muted-foreground">Orders</div>
                            </div>
                            <div>
                              <div className="text-lg font-bold text-warning">{user.loyaltyPoints || 245}</div>
                              <div className="text-xs text-muted-foreground">Points</div>
                            </div>
                          </div>
                        </div>

                        {/* Navigation Links */}
                        <div className="py-2">
                          <Link
                            to="/user-account-dashboard"
                            onClick={() => setIsAccountDropdownOpen(false)}
                            className="flex items-center space-x-3 px-4 py-2 text-foreground hover:bg-muted transition-colors"
                          >
                            <Icon name="LayoutDashboard" size={16} />
                            <span>Dashboard</span>
                          </Link>
                          <Link
                            to="/user-account-dashboard?section=orders"
                            onClick={() => setIsAccountDropdownOpen(false)}
                            className="flex items-center space-x-3 px-4 py-2 text-foreground hover:bg-muted transition-colors"
                          >
                            <Icon name="Package" size={16} />
                            <span>My Orders</span>
                          </Link>
                          {/* Wishlist link removed */}
                          <Link
                            to="/user-account-dashboard?section=addresses"
                            onClick={() => setIsAccountDropdownOpen(false)}
                            className="flex items-center space-x-3 px-4 py-2 text-foreground hover:bg-muted transition-colors"
                          >
                            <Icon name="MapPin" size={16} />
                            <span>Address Book</span>
                          </Link>
                          <Link
                            to="/user-account-dashboard?section=profile"
                            onClick={() => setIsAccountDropdownOpen(false)}
                            className="flex items-center space-x-3 px-4 py-2 text-foreground hover:bg-muted transition-colors"
                          >
                            <Icon name="Settings" size={16} />
                            <span>Account Settings</span>
                          </Link>
                        </div>

                        {/* Sign Out */}
                        <div className="border-t border-border pt-2">
                          <button
                            onClick={async () => {
                              setIsAccountDropdownOpen(false);
                              await signOut();
                              navigate('/');
                            }}
                            className="flex items-center space-x-3 px-4 py-2 text-destructive hover:bg-destructive/5 transition-colors w-full"
                          >
                            <Icon name="LogOut" size={16} />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => navigate('/user-login')}
                    className="inline-flex items-center bg-[#ff7a00] text-white px-4 py-2 rounded-full shadow-sm hover:brightness-95 transition-all duration-150"
                  >
                    <Icon name="User" size={16} />
                    <span className="ml-2">Login/Sign Up</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Category Navigation Row (below main header) */}
        <div ref={navRef} className={`hidden lg:block bg-[#fff6e6] border-t border-b border-[#f0e0b8] relative transition-all duration-200 ease-in-out ${isHidden ? 'h-0 overflow-hidden opacity-0' : 'h-auto opacity-100'}`}>
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between px-2 py-3">
              <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
                <button
                  className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary"
                  onClick={() => {
                    const willOpen = !(isMegaMenuOpen && activeMegaCategory === 'dogs');
                    setActiveMegaCategory(willOpen ? 'dogs' : null);
                    setIsMegaMenuOpen(willOpen);
                  }}
                >
                  <span>Dogs</span>
                  <Icon name={isMegaMenuOpen && activeMegaCategory === 'dogs' ? 'ChevronUp' : 'ChevronDown'} size={16} />
                </button>

                <button
                  className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary"
                  onClick={() => {
                    const willOpen = !(isMegaMenuOpen && activeMegaCategory === 'cats');
                    setActiveMegaCategory(willOpen ? 'cats' : null);
                    setIsMegaMenuOpen(willOpen);
                  }}
                >
                  <span>Cats</span>
                  <Icon name={isMegaMenuOpen && activeMegaCategory === 'cats' ? 'ChevronUp' : 'ChevronDown'} size={16} />
                </button>

                <Link 
                  to="/pet-services"
                  className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary"
                >
                  <span>Pet Services</span>
                  <span className="bg-green-500 text-white text-xs font-semibold px-2 py-0.5 rounded">NEW</span>
                </Link>

                <Link 
                  to="/pet-boarding"
                  className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary"
                >
                  <span>Pet Boarding</span>
                </Link>

                <button
                  className={`flex items-center gap-2 text-sm font-medium ${activeMegaCategory === 'pharmacy' ? 'text-primary' : 'text-foreground'} hover:text-primary`}
                  onClick={() => {
                    const willOpen = !(isMegaMenuOpen && activeMegaCategory === 'pharmacy');
                    setActiveMegaCategory(willOpen ? 'pharmacy' : null);
                    setIsMegaMenuOpen(willOpen);
                  }}
                >
                  <span>Pharmacy</span>
                  <span className="bg-[#ff7a00] text-white text-xs font-semibold px-2 py-0.5 rounded">NEW</span>
                  <Icon name={isMegaMenuOpen && activeMegaCategory === 'pharmacy' ? 'ChevronUp' : 'ChevronDown'} size={16} />
                </button>

                <Link 
                  to="/pet-walking"
                  className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary"
                >
                  <span>Pet walking</span>
                  <span className="bg-[#ff7a00] text-white text-xs font-semibold px-2 py-0.5 rounded">NEW</span>
                </Link>

                <button
                  className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary"
                  onClick={() => {
                    const willOpen = !(isMegaMenuOpen && activeMegaCategory === 'outlet');
                    setActiveMegaCategory(willOpen ? 'outlet' : null);
                    setIsMegaMenuOpen(willOpen);
                  }}
                >
                  <span>PET&CO Outlet</span>
                  <span className="bg-[#ff7a00] text-white text-xs font-semibold px-2 py-0.5 rounded">60% Off</span>
                  <Icon name={isMegaMenuOpen && activeMegaCategory === 'outlet' ? 'ChevronUp' : 'ChevronDown'} size={16} />
                </button>
              </div>

              {/* Brand badges removed as requested */}
            </div>
          </div>
        </div>
      </div>

      {/* Spacer to push page content below the fixed header */}
      {(() => {
        const spacerHeight = headerHeight; // Keep stable - always account for full header height
        return <div aria-hidden="true" style={{ height: spacerHeight }} className="w-full" />;
      })()}

      {/* Mobile navigation is handled by the MegaMenu drawer (opened via hamburger) */}

      {/* Mega Menu (positioned relative to the category nav container) */}
      <MegaMenu
        isOpen={isMegaMenuOpen}
        activeCategory={activeMegaCategory}
        onClose={() => { setIsMegaMenuOpen(false); setActiveMegaCategory(null); }}
        anchorOffset={headerHeight}
      />
      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartDrawerOpen}
        onClose={() => setIsCartDrawerOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
      />


    </>
  );
};

export default Header;


