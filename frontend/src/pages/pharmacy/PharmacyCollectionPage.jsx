import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import Footer from '../homepage/components/Footer';
import MobileBottomNav from '../../components/ui/MobileBottomNav';
import { useCart } from '../../contexts/CartContext';
import { getFilterConfig, getSortOptions } from '../../data/categoryFilters';
import productApi from '../../services/productApi';
import apiClient from '../../services/api';

const slugify = (s = '') => String(s || '').toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

const PharmacyCollectionPage = ({ subLabel }) => {
  const { addToCart, addToWishlist, isInWishlist, removeFromWishlist, getCartItemCount, cartItems } = useCart();

  const location = useLocation();
  const navigate = useNavigate();
  const pathname = String(location?.pathname || '').toLowerCase();

  // Determine which pharmacy section we're in
  const isDogPath = pathname.includes('/pharmacy/dogs');
  const isCatPath = pathname.includes('/pharmacy/cats');
  const isMedicinesPath = pathname.includes('/pharmacy/medicines');
  const isSupplementsPath = pathname.includes('/pharmacy/supplements');
  const isPrescriptionPath = pathname.includes('/pharmacy/prescription-food') || pathname.includes('/pharmacy/prescription');

  // Categories based on path - matching mega menu structure
  const categories = isDogPath
    ? [
      { id: 'medicines-for-skin', label: 'Medicines for Skin', img: '/assets/images/dog/db1.webp', path: '/pharmacy/dogs/medicines-for-skin' },
      { id: 'joint-mobility', label: 'Joint & Mobility', img: '/assets/images/dog/db2.webp', path: '/pharmacy/dogs/joint-mobility' },
      { id: 'digestive-care', label: 'Digestive Care', img: '/assets/images/dog/db3.webp', path: '/pharmacy/dogs/digestive-care' },
      { id: 'all-dog-pharmacy', label: 'All Dog Pharmacy', img: '/assets/images/dog/db4.webp', path: '/pharmacy/dogs/all-dog-pharmacy' }
    ]
    : isCatPath
      ? [
        { id: 'skin-coat-care', label: 'Skin & Coat Care', img: '/assets/images/cat/cf1.webp', path: '/pharmacy/cats/skin-coat-care' },
        { id: 'worming', label: 'Worming', img: '/assets/images/cat/cf2.webp', path: '/pharmacy/cats/worming' },
        { id: 'oral-care', label: 'Oral Care', img: '/assets/images/cat/cf3.webp', path: '/pharmacy/cats/oral-care' },
        { id: 'all-cat-pharmacy', label: 'All Cat Pharmacy', img: '/assets/images/cat/cf4.webp', path: '/pharmacy/cats/all-cat-pharmacy' }
      ]
      : isMedicinesPath
        ? [
          { id: 'antibiotics', label: 'Antibiotics', img: '/assets/images/essential/meowsi.webp', path: '/pharmacy/medicines/antibiotics' },
          { id: 'antifungals', label: 'Antifungals', img: '/assets/images/essential/whiskas.webp', path: '/pharmacy/medicines/antifungals' },
          { id: 'anti-inflammatories', label: 'Anti Inflammatories', img: '/assets/images/essential/sheba.webp', path: '/pharmacy/medicines/anti-inflammatories' },
          { id: 'pain-relief', label: 'Pain Relief', img: '/assets/images/essential/royal canin.webp', path: '/pharmacy/medicines/pain-relief' },
          { id: 'all-medicines', label: 'All Medicines', img: '/assets/images/dog/db1.webp', path: '/pharmacy/medicines/all-medicines' }
        ]
        : isSupplementsPath
          ? [
            { id: 'vitamins-minerals', label: 'Vitamins & Minerals', img: '/assets/images/essential/meowsi.webp', path: '/pharmacy/supplements/vitamins-minerals' },
            { id: 'joint-supplements', label: 'Joint Supplements', img: '/assets/images/essential/whiskas.webp', path: '/pharmacy/supplements/joint-supplements' },
            { id: 'probiotics-gut-health', label: 'Probiotics & Gut Health', img: '/assets/images/essential/sheba.webp', path: '/pharmacy/supplements/probiotics-gut-health' },
            { id: 'skin-coat-supplements', label: 'Skin & Coat Supplements', img: '/assets/images/essential/royal canin.webp', path: '/pharmacy/supplements/skin-coat-supplements' },
            { id: 'all-supplements', label: 'All Supplements', img: '/assets/images/dog/db2.webp', path: '/pharmacy/supplements/all-supplements' }
          ]
          : isPrescriptionPath
            ? [
              { id: 'renal-support', label: 'Renal Support', img: '/assets/images/essential/meowsi.webp', path: '/pharmacy/prescription-food/renal-support' },
              { id: 'hypoallergenic-diets', label: 'Hypoallergenic Diets', img: '/assets/images/essential/whiskas.webp', path: '/pharmacy/prescription-food/hypoallergenic-diets' },
              { id: 'digestive-support', label: 'Digestive Support', img: '/assets/images/essential/sheba.webp', path: '/pharmacy/prescription-food/digestive-support' },
              { id: 'weight-management', label: 'Weight Management', img: '/assets/images/essential/royal canin.webp', path: '/pharmacy/prescription-food/weight-management' },
              { id: 'all-prescription-food', label: 'All Prescription Food', img: '/assets/images/dog/db3.webp', path: '/pharmacy/prescription-food/all-prescription-food' }
            ]
            : [
              { id: 'medicines', label: 'Medicines', img: '/assets/images/essential/meowsi.webp', path: '/pharmacy/medicines' },
              { id: 'supplements', label: 'Supplements', img: '/assets/images/essential/whiskas.webp', path: '/pharmacy/supplements' },
              { id: 'prescription', label: 'Prescription Food', img: '/assets/images/essential/sheba.webp', path: '/pharmacy/prescription-food' },
              { id: 'all', label: 'All Pharmacy', img: '/assets/images/essential/royal canin.webp', path: '/pharmacy' }
            ];

  const [active, setActive] = useState(categories[categories.length - 1].label);

  // Initialize active state based on URL path
  useEffect(() => {
    const pathname = location?.pathname || '';
    const segments = pathname.split('/').filter(Boolean);
    
    // If URL has a specific subcategory segment, map it to the corresponding label
    if (segments.length >= 3) {
      const subcategorySegment = segments[2]; // e.g., "vitamins-minerals"
      
      // Find matching category by ID or slug
      const matchingCategory = categories.find(cat => {
        const catSlug = slugify(cat.label);
        return catSlug === subcategorySegment || cat.id === subcategorySegment;
      });
      
      if (matchingCategory) {
        console.log('PharmacyCollectionPage: Setting active based on URL:', subcategorySegment, '->', matchingCategory.label);
        setActive(matchingCategory.label);
      }
    }
  }, [location?.pathname, categories]);

  // Handle category click - navigate to the correct route
  const handleCategoryClick = (category) => {
    if (category.path) {
      navigate(category.path);
    }
    setActive(category.label);
  };

  const subcategoryKey = isDogPath
    ? 'dogs'
    : isCatPath
      ? 'cats'
      : isMedicinesPath
        ? 'medicines'
        : isSupplementsPath
          ? 'supplements'
          : isPrescriptionPath
            ? 'prescription'
            : 'default';

  const filterConfig = getFilterConfig('pharmacy', subcategoryKey);
  const sortOptions = getSortOptions('pharmacy', subcategoryKey);
  const filterSections = filterConfig.sections || [];
  const topFilters = (filterConfig.topFilters && filterConfig.topFilters.length > 0)
    ? filterConfig.topFilters
    : ['Brand', 'Pet Type', 'Condition', 'Product Type', 'Price', 'Size'];
  const [selectedTopFilter, setSelectedTopFilter] = useState(topFilters[0] || '');
  const [selectedSort, setSelectedSort] = useState(sortOptions[0] || 'Featured');

  useEffect(() => {
    setSelectedSort(sortOptions[0] || 'Featured');
  }, [sortOptions]);

  // Sample products
  const sampleProducts = [
    { id: 'ph1', name: 'Skin Care Medicine', image: '/assets/images/essential/meowsi.webp', badges: ['Vet Approved'], variants: ['50ml', '100ml'], price: 499, original: null },
    { id: 'ph2', name: 'Joint Support Supplement', image: '/assets/images/essential/whiskas.webp', badges: ['Best Seller'], variants: ['30 Tabs', '60 Tabs'], price: 899, original: 999 },
    { id: 'ph3', name: 'Digestive Health Formula', image: '/assets/images/essential/sheba.webp', badges: ['New'], variants: ['100g'], price: 349, original: null },
    { id: 'ph4', name: 'Probiotic Gut Supplement', image: '/assets/images/essential/meowsi.webp', badges: ['Gut Health'], variants: ['30 Caps'], price: 699, original: 799 },
  ];

  const [products, setProducts] = useState(sampleProducts);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [fetchError, setFetchError] = useState('');
  // Selected filters: mapping from section label -> Set of selected option strings
  const [selectedFilters, setSelectedFilters] = useState(() => {
    const init = {};
    (filterSections || []).forEach(s => { init[s.label] = new Set(); });
    return init;
  });

  const resolveImageUrl = (p) => {
    const candidate = p?.imageUrl || p?.image || p?.thumbnailUrl || p?.image_path;
    if (!candidate) return '/assets/images/no_image.png';
    if (/^(https?:)?\/\//i.test(candidate) || candidate.startsWith('data:')) return candidate;
    const base = apiClient?.defaults?.baseURL || '';
    return candidate.startsWith('/') ? `${base}${candidate}` : `${base}/${candidate}`;
  };

  useEffect(() => {
    const load = async () => {
      setLoadingProducts(true);
      try {
        console.log('PharmacyCollectionPage: Fetching all Pharmacy products');
        
        // Fetch all Pharmacy products - filtering will be done on frontend
        const apiData = await productApi.getCustomerProducts({ type: 'Pharmacy' });
        
        console.log('PharmacyCollectionPage: API response received:', {
          dataLength: apiData?.length || 0,
          sampleData: apiData?.slice(0, 2) || [],
          allData: apiData
        });

        const normalized = (apiData || []).map((item) => ({
          id: item?.id,
          name: item?.name || item?.title,
          image: resolveImageUrl(item),
          badges: Array.isArray(item?.badges) ? item.badges : [],
          variants: item?.variants?.map(v => v?.label || v?.size || v?.weight).filter(Boolean) || ['Default'],
          price: Number(item?.price || 0),
          original: Number(item?.originalPrice || 0) || null,
          category: item?.category || '',
          subcategory: item?.subcategory || '',
          petType: item?.petType || '',
          tags: Array.isArray(item?.tags) ? item.tags : []
        }));

        console.log('PharmacyCollectionPage: Loaded', normalized.length, 'products');

        setProducts(normalized.length ? normalized : sampleProducts);
        
        setFetchError('');
      } catch (err) {
        console.error('Pharmacy: load failed', err);
        setFetchError('Unable to load pharmacy products.');
        setProducts(sampleProducts);
      } finally {
        setLoadingProducts(false);
      }
    };

    load();
  }, [isDogPath, isCatPath, isMedicinesPath, isSupplementsPath, isPrescriptionPath]);

  // Frontend filtering by category and subcategory
  useEffect(() => {
    if (products.length === 0 || products === sampleProducts) {
      setFilteredProducts([]);
      return;
    }

    // Determine page category based on path
    let pageCategory = '';
    if (isDogPath) pageCategory = 'PHARMACY FOR DOGS';
    else if (isCatPath) pageCategory = 'PHARMACY FOR CATS';
    else if (isMedicinesPath) pageCategory = 'Medicines';
    else if (isSupplementsPath) pageCategory = 'Supplements';
    else if (isPrescriptionPath) pageCategory = 'Prescription Food';
    else pageCategory = 'Pharmacy';

    // Enhanced normalization
    const norm = s => String(s||'')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[&]/g, 'and')
      .replace(/[^\w\s-]/g, '');

    let working = products;
    
    // Step 1: Filter by category (exact match only)
    working = working.filter(p => {
      const productCategory = norm(p.category || '');
      const targetCategory = norm(pageCategory);
      return productCategory === targetCategory;
    });
    
    console.log(`PharmacyCollectionPage: After category filter (${pageCategory}): ${working.length} products`);
    
    // Step 2: Filter by subcategory if specified
    const activeSubcategory = active && !active.toLowerCase().includes('all') ? active : null;
    if (activeSubcategory && activeSubcategory.trim()) {
      const targetSub = norm(activeSubcategory);
      working = working.filter(p => {
        const productSub = norm(p.subcategory || '');
        return productSub === targetSub || 
               productSub.includes(targetSub.replace(/-/g, '')) ||
               targetSub.includes(productSub.replace(/-/g, ''));
      });
      console.log(`PharmacyCollectionPage: After subcategory filter (${activeSubcategory}): ${working.length} products`);
    }
    
    // Step 3: Apply drawer filters (selectedFilters)
    try {
      Object.keys(selectedFilters || {}).forEach(sectionLabel => {
        const selSet = selectedFilters[sectionLabel];
        if (!selSet || selSet.size === 0) return;

        const opts = Array.from(selSet);
        working = working.filter(p => {
          // helper: match price ranges
          const matchPriceOption = (opt) => {
            try {
              const price = Number(p.price || 0);
              const nums = opt.match(/(\d+)/g);
              if (!nums || nums.length === 0) return false;
              if (opt.includes('+')) {
                const min = Number(nums[0]);
                return price >= min;
              }
              if (nums.length >= 2) {
                const min = Number(nums[0]);
                const max = Number(nums[1]);
                return price >= min && price <= max;
              }
              return false;
            } catch (e) { return false; }
          };

          const matchGeneric = (opt) => {
            const norm = (s) => String(s||'').toLowerCase();
            const o = norm(opt);
            if (norm(p.name).includes(o)) return true;
            if (norm(p.category).includes(o)) return true;
            if (norm(p.subcategory).includes(o)) return true;
            if (norm(p.petType).includes(o)) return true;
            if ((p.tags || []).some(t => norm(t).includes(o))) return true;
            if ((p.badges || []).some(b => norm(b).includes(o))) return true;
            if ((p.variants || []).some(v => norm(v).includes(o))) return true;
            return false;
          };

          return opts.some(opt => {
            if (/INR/i.test(opt)) return matchPriceOption(opt);
            return matchGeneric(opt);
          });
        });
      });
    } catch (err) {
      console.error('Filtering by selectedFilters failed', err);
    }

    console.log(`PharmacyCollectionPage: Final filtered products: ${working.length}`);
    setFilteredProducts(working);
  }, [products, active, isDogPath, isCatPath, isMedicinesPath, isSupplementsPath, isPrescriptionPath, selectedFilters]);

  // Top filters
  const topRef = useRef(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const drawerContentRef = useRef(null);
  const sectionRefs = useRef({});

  const openFilterAndScroll = (key) => {
    setSelectedTopFilter(key);
    setFilterOpen(true);
    const doScroll = () => {
      const container = drawerContentRef.current;
      const el = sectionRefs.current[key];
      if (container && el) {
        const drawerHeaderHeight = 64;
        const top = el.offsetTop;
        const scrollTo = Math.max(0, top - drawerHeaderHeight - 8);
        container.scrollTo({ top: scrollTo, behavior: 'smooth' });
        try {
          el.classList.add('section-highlight');
          setTimeout(() => { el.classList.remove('section-highlight'); }, 1400);
        } catch (err) { }
      }
    };
    setTimeout(doScroll, 220);
  };

  // Filter data
  const scrollTopLeft = () => { if (topRef.current) topRef.current.scrollBy({ left: -220, behavior: 'smooth' }); };
  const scrollTopRight = () => { if (topRef.current) topRef.current.scrollBy({ left: 220, behavior: 'smooth' }); };

  const leftRef = useRef(null);
  const rightRef = useRef(null);

  const handleLeftWheel = (e) => {
    if (leftRef.current) {
      e.preventDefault();
      leftRef.current.scrollTop += e.deltaY;
    }
  };

  const handleRightWheel = (e) => {
    if (rightRef.current) {
      e.preventDefault();
      rightRef.current.scrollTop += e.deltaY;
    }
  };

  // Toggle a filter option for a given section label
  const toggleFilter = (sectionLabel, option) => {
    setSelectedFilters(prev => {
      const next = { ...prev };
      const setFor = new Set(next[sectionLabel] ? Array.from(next[sectionLabel]) : []);
      if (setFor.has(option)) setFor.delete(option); else setFor.add(option);
      next[sectionLabel] = setFor;
      return next;
    });
  };

  const clearAllFilters = () => {
    const reset = {};
    (filterSections || []).forEach(s => { reset[s.label] = new Set(); });
    setSelectedFilters(reset);
  };

  const applyFilters = () => {
    // Filtering is live; just close the drawer
    setFilterOpen(false);
  };

  const ProductCard = ({ p }) => {
    const [selectedVariant, setSelectedVariant] = useState((p.variants || [null])[0] || null);
    return (
      <article className="bg-white rounded-lg border border-border overflow-hidden shadow-sm">
        <div className="p-2 md:p-3">
          <div className="h-6 flex items-center justify-start">
            <div className="bg-green-500 text-white text-[11px] px-2 py-0.5 rounded-t-md">{p.badges?.[0]}</div>
          </div>
          <div className="mt-2 h-36 md:h-44 flex items-center justify-center bg-[#f6f8fb] rounded">
            <img src={p.image} alt={p.name} className="max-h-32 md:max-h-40 object-contain" />
          </div>
          <h3 className="mt-2 text-xs md:text-sm font-semibold text-foreground">{p.name}</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {p.variants.map((v, i) => (
              <button
                key={i}
                onClick={() => setSelectedVariant(v)}
                className={`text-[11px] px-2 py-0.5 border border-border rounded ${selectedVariant === v ? 'bg-green-600 text-white' : 'bg-white'}`}
              >
                {v}
              </button>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <div className="text-base md:text-lg font-bold">₹{p.price.toFixed(2)}</div>
              {p.original && <div className="text-sm text-muted-foreground line-through">₹{p.original}</div>}
            </div>
            <button
              onClick={() => addToCart({ id: p.id, name: p.name, price: p.price }, 1)}
              className="bg-orange-500 text-white px-3 py-1.5 rounded-full text-sm"
            >
              Add
            </button>
          </div>
        </div>
      </article>
    );
  };

  return (
    <>
      <Helmet>
        <title>Pharmacy | PET&CO</title>
        <style>{`
          .thin-gold-scroll {
            scrollbar-width: none;
            scrollbar-color: transparent transparent;
          }
          .thin-gold-scroll::-webkit-scrollbar { display: none; width: 0; height: 0; }
          .thin-gold-scroll::-webkit-scrollbar-track { background: transparent; }
          .thin-gold-scroll::-webkit-scrollbar-thumb { background: transparent; }

          html, body, #root {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          html::-webkit-scrollbar, body::-webkit-scrollbar, #root::-webkit-scrollbar {
            display: none; width: 0; height: 0;
          }

          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .hide-scrollbar::-webkit-scrollbar { display: none; }

          .top-scroll-btn { width: 34px; height: 34px; border-radius: 9999px; }

          @keyframes highlightPulse {
            0% { background: rgba(255,245,230,0); }
            30% { background: rgba(255,245,230,0.9); }
            70% { background: rgba(255,245,230,0.6); }
            100% { background: rgba(255,245,230,0); }
          }
          .section-highlight {
            animation: highlightPulse 1.2s ease-in-out;
            border-radius: 6px;
          }
        `}</style>
      </Helmet>
      <Header cartItemCount={getCartItemCount()} cartItems={cartItems} onSearch={() => { }} />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-12 gap-3 md:gap-6">
          {/* Sidebar - Categories */}
          {/* Desktop/Tablet sidebar (hidden on small screens) */}
          <aside className="hidden lg:block lg:col-span-3 xl:col-span-2">
            <div
              ref={leftRef}
              onWheel={handleLeftWheel}
              className="bg-white rounded border border-border overflow-hidden thin-gold-scroll"
              style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 220px)' }}
            >
              <ul className="divide-y">
                {categories.map((c) => (
                  <li key={c.id} className={`relative border-b ${active === c.label ? 'bg-[#fff6ee]' : ''}`}>
                    <button
                      onClick={() => handleCategoryClick(c)}
                      className="w-full text-center flex flex-col items-center gap-1 p-2 md:flex-row md:text-left md:items-center md:gap-3 md:p-4 relative z-10 cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <div className={`w-12 h-12 rounded-full overflow-hidden flex items-center justify-center border ${active === c.label ? 'ring-2 ring-orange-400' : 'border-gray-100'}`}>
                        <img src={c.img} alt={c.label} className="w-full h-full object-cover pointer-events-none" />
                      </div>
                      <span className="text-xs md:text-sm font-medium text-gray-800 mt-1 md:mt-0">{c.label}</span>
                    </button>
                    {active === c.label && (
                      <div className="absolute right-0 top-0 h-full w-1 bg-orange-400 pointer-events-none" />
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Main Content */}
          {/* Main Content */}
          {/* On small screens the main column takes full width; sidebar is replaced by a horizontal scroller above */}
          <main
            ref={rightRef}
            onWheel={handleRightWheel}
            className="col-span-12 lg:col-span-9 xl:col-span-10"
            style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 220px)' }}
          >
            {/* Mobile category scroller (horizontal) - shows on small screens */}
            <div className="lg:hidden mb-4">
              <div className="overflow-x-auto hide-scrollbar px-4">
                <div className="inline-flex items-center gap-3 py-2">
                  {categories.map((c) => {
                    const isActive = active === c.label;
                    return (
                      <button
                        key={c.id}
                        onClick={() => handleCategoryClick(c)}
                        className={`flex-shrink-0 flex flex-col items-center gap-1 p-2 bg-white rounded-lg border transition-shadow ${isActive ? 'ring-2 ring-orange-400 shadow-sm' : 'border-border'}`}
                        style={{ minWidth: 84 }}
                      >
                        <div className={`w-10 h-10 rounded-full overflow-hidden flex items-center justify-center ${isActive ? '' : ''}`}>
                          <img src={c.img} alt={c.label} className="w-full h-full object-cover pointer-events-none" />
                        </div>
                        <span className="text-xs text-center leading-tight mt-1">{c.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Top filter bar */}
            <div className="mb-4 flex items-center justify-between">
              <div className="relative flex-1 overflow-hidden">
                <button
                  onClick={scrollTopLeft}
                  aria-label="Scroll left"
                  className="top-scroll-btn hidden md:inline-flex items-center justify-center border border-border bg-white ml-1 mr-2 absolute left-0 top-1/2 transform -translate-y-1/2 z-10"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <div
                  ref={topRef}
                  className="hide-scrollbar overflow-x-auto pl-10 pr-10"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  <div className="inline-flex items-center gap-2">
                    {topFilters.map((t) => (
                      <button
                        key={t}
                        onClick={() => openFilterAndScroll(t)}
                        className={`flex items-center gap-2 text-sm px-3 py-1 border border-border rounded-full bg-white ${selectedTopFilter === t ? 'ring-1 ring-orange-300' : ''}`}
                        style={{ whiteSpace: 'nowrap' }}
                      >
                        {selectedTopFilter === t ? (
                          <span className="inline-flex items-center justify-center w-4 h-4 bg-gray-100 rounded-sm">
                            <span className="w-2 h-2 bg-green-500 rounded" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-4 h-4 bg-transparent rounded-sm" />
                        )}
                        <span>{t}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={scrollTopRight}
                  aria-label="Scroll right"
                  className="top-scroll-btn hidden md:inline-flex items-center justify-center border border-border bg-white ml-2 mr-1 absolute right-0 top-1/2 transform -translate-y-1/2 z-10"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Filter drawer trigger (mobile) */}
            <div className="absolute top-6 right-6 z-40 md:hidden">
              <button
                onClick={() => setFilterOpen(true)}
                className="flex items-center gap-2 border border-border rounded px-3 py-1 bg-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L15 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 019 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                </svg>
                <span className="text-sm">Filter</span>
              </button>
            </div>

            {/* Product grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {loadingProducts ? (
                <div className="col-span-full py-12 text-center text-muted-foreground">Loading pharmacy products...</div>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map(p => (<ProductCard key={p.id} p={p} />))
              ) : (
                <div className="col-span-full py-12 text-center">
                  <div className="text-gray-500 mb-2">
                    <div className="text-4xl mb-4">💊</div>
                    <h3 className="text-lg font-semibold mb-2">No products found</h3>
                    <p className="text-sm">No Pharmacy products match your current filters.</p>
                    <p className="text-xs mt-2 text-gray-400">Try selecting a different category or subcategory.</p>
                    {fetchError && <div className="text-xs mt-2 text-orange-600">{fetchError}</div>}
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Filter drawer */}
      <div aria-hidden={!filterOpen} className={`fixed inset-0 z-50 pointer-events-none ${filterOpen ? '' : ''}`}>
        <div
          onClick={() => setFilterOpen(false)}
          className={`absolute inset-0 bg-black/40 transition-opacity ${filterOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0'}`}
        />

        <aside
          role="dialog"
          aria-modal="true"
          className={`fixed top-0 right-0 h-full bg-white w-full sm:w-96 shadow-xl transform transition-transform pointer-events-auto ${filterOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="flex items-center justify-between p-4 border-b">
            <div>
              <div className="text-sm font-semibold">Filter</div>
              <div className="text-xs text-muted-foreground">Pharmacy Products</div>
            </div>
            <div>
              <button onClick={() => setFilterOpen(false)} className="p-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 011.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          <div ref={drawerContentRef} className="px-4 pt-4 pb-32 hide-scrollbar overflow-y-auto" style={{ maxHeight: 'calc(100vh - 140px)' }}>
            <section className="mb-6">
              <h4 className="text-sm font-medium mb-3">Sort By</h4>
              <div className="flex flex-wrap gap-2">
                {sortOptions.map(option => (
                  <button
                    key={option}
                    onClick={() => setSelectedSort(option)}
                    className={`text-xs px-3 py-1 border border-border rounded ${selectedSort === option ? 'bg-green-600 text-white border-green-600' : 'bg-white'}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </section>

            {filterSections.map(section => (
              <section
                key={section.id}
                ref={el => { sectionRefs.current[section.label] = el; }}
                className="mb-6"
              >
                <h4 className="text-sm font-medium mb-3">{section.label}</h4>
                {section.options.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {section.options.map(option => {
                          const isActiveOpt = selectedFilters[section.label] && selectedFilters[section.label].has(option);
                          return (
                            <button
                              key={option}
                              onClick={() => toggleFilter(section.label, option)}
                              className={`text-xs px-3 py-1 border rounded ${isActiveOpt ? 'bg-orange-500 text-white border-orange-500' : 'bg-white border-border'}`}
                            >
                              {option}
                            </button>
                          );
                        })}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Add options for {section.label}</p>
                )}
              </section>
            ))}
          </div>

          <div className="fixed bottom-0 right-0 left-auto w-full sm:w-96 bg-white border-t p-4 flex items-center justify-between">
            <button onClick={clearAllFilters} className="text-sm text-orange-500">Clear All</button>
            <button onClick={applyFilters} className="bg-orange-500 text-white px-5 py-2 rounded">Apply Filters</button>
          </div>
        </aside>
      </div>

      {/* Footer - Desktop Only */}
      
    <Footer />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </>
  );
};

export default PharmacyCollectionPage;
