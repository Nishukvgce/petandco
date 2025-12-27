import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import Footer from '../homepage/components/Footer';
import MobileBottomNav from '../../components/ui/MobileBottomNav';
import { useCart } from '../../contexts/CartContext';
import { getFilterConfig, getSortOptions } from '../../data/categoryFilters';
import dataService from '../../services/dataService';
import apiClient from '../../services/api';
import productApi from '../../services/productApi';
import { normalizeProductFromApi, productMatchesFilterSelections, isDogProduct, isFoodProduct, getCleanUrlParams, buildApiParameters } from '../../utils/productUtils';

const categories = [
  { id: 'all', label: 'All Dog Food', img: '/assets/images/essential/all dog food.webp' },
  { id: 'dry', label: 'Dry Food', img: '/assets/images/essential/dry food.webp' },
  { id: 'wet', label: 'Wet Food', img: '/assets/images/essential/wet food.webp' },
  { id: 'grain-free', label: 'Grain Free', img: '/assets/images/essential/grain free.webp' },
  { id: 'puppy', label: 'Puppy Food', img: '/assets/images/essential/veterinary food.webp' },
  { id: 'hypo', label: 'Hypoallergenic', img: '/assets/images/essential/hypoallergenic.webp' },
  { id: 'vet', label: 'Veterinary Food', img: '/assets/images/essential/veterinary food.webp' },
  { id: 'toppers', label: 'Food Toppers & Gravy', img: '/assets/images/essential/food toppersgravy.webp' },
  { id: 'chicken-free', label: 'Chicken Free', img: '/assets/images/essential/chickenfree.webp' }
];

const sampleProducts = [
  {
    id: 'p1',
    name: "Hearty Turkey, Fish & Chicken",
    brand: 'Hearty',
    shortDescription: 'Protein-rich dry food crafted for adult dogs.',
    description: 'Complete nutrition featuring turkey, fish, and chicken with balanced carbs and omega oils.',
    image: '/assets/images/essential/sheba.webp',
    badges: ['Extra 3% OFF'],
    variants: [
      { id: 'v1', weight: '2 kg', price: 1999, stock: 10 },
      { id: 'v2', weight: '5 kg', price: 4199, stock: 6 },
      { id: 'v3', weight: '10 kg', price: 7599, stock: 4 }
    ],
    price: 1999,
    originalPrice: 2199,
    inStock: true,
    stockQuantity: 20,
    filters: {
      brands: ['Hearty'],
      lifeStages: ['Adult'],
      productTypes: ['Dry Food'],
      dogCat: ['Dog'],
      priceRanges: ['INR 1000 - INR 2000'],
      weights: ['2 kg', '5 kg', '10 kg']
    }
  },
  {
    id: 'p2',
    name: 'Royal Canin Maxi Adult Dry Dog Food',
    brand: 'Royal Canin',
    shortDescription: 'Trusted daily meal for large breed adults.',
    description: 'Supports joint health and digestion with tailored kibble for maxi dogs.',
    image: '/assets/images/essential/royal canin.webp',
    badges: ['Get Extra 5% OFF'],
    variants: [
      { id: 'v1', weight: '1 kg', price: 862.4, originalPrice: 980, stock: 18 },
      { id: 'v2', weight: '2.5 kg', price: 1999, stock: 12 },
      { id: 'v3', weight: '10 kg', price: 7199, stock: 8 }
    ],
    price: 862.4,
    originalPrice: 980,
    inStock: true,
    stockQuantity: 38,
    filters: {
      brands: ['Royal Canin'],
      lifeStages: ['Adult'],
      breedSizes: ['Large'],
      productTypes: ['Dry Food'],
      dogCat: ['Dog'],
      weights: ['1 kg', '2.5 kg', '10 kg']
    }
  },
  {
    id: 'p3',
    name: "Sara's Wholesome Classic Chicken And Brown Rice",
    brand: "Sara's",
    shortDescription: 'Gentle formula with brown rice for sensitive stomachs.',
    description: 'Slow-cooked chicken and brown rice with added probiotics for better digestion.',
    image: '/assets/images/essential/whiskas.webp',
    badges: ['Get Extra 5% OFF'],
    variants: [
      { id: 'v1', weight: '100 g', price: 99, stock: 40 },
      { id: 'v2', weight: '300 g', price: 249, stock: 30 },
      { id: 'v3', weight: 'Pack Of 7', price: 599, stock: 12 }
    ],
    price: 99,
    originalPrice: 129,
    inStock: true,
    stockQuantity: 82,
    filters: {
      brands: ["Sara's"],
      lifeStages: ['Puppy'],
      productTypes: ['Wet Food'],
      specialDiets: ['Sensitive Stomach'],
      dogCat: ['Dog'],
      weights: ['100 g', '300 g', 'Pack Of 7']
    }
  },
  {
    id: 'p4',
    name: 'Pedigree Chicken & Vegetables Adult Dry Dog Food',
    brand: 'Pedigree',
    shortDescription: 'Balanced kibble with vegetables for daily feeding.',
    description: 'Fortified with vitamins, zinc, and fiber to support immunity and digestion.',
    image: '/assets/images/essential/pedigree.webp',
    badges: ['Up to ₹500 Extra off'],
    variants: [
      { id: 'v1', weight: '370 g', price: 100, stock: 45 },
      { id: 'v2', weight: '1 kg', price: 260, stock: 40 },
      { id: 'v3', weight: '2.8 kg', price: 699, stock: 20 },
      { id: 'v4', weight: '5.5 kg', price: 1199, stock: 12 }
    ],
    price: 100,
    originalPrice: 120,
    inStock: true,
    stockQuantity: 117,
    filters: {
      brands: ['Pedigree'],
      lifeStages: ['Adult'],
      productTypes: ['Dry Food'],
      dogCat: ['Dog'],
      priceRanges: ['INR 10 - INR 300'],
      weights: ['370 g', '1 kg', '2.8 kg', '5.5 kg']
    }
  }
];

const resolveProductImage = (product) => {
  let candidate = product?.imageUrl || product?.image || '';
  if (!candidate) return '/assets/images/no_image.png';
  if (/^(https?:)?\/\//i.test(candidate) || candidate.startsWith('data:')) {
    return candidate;
  }
  if (/^[a-zA-Z]:\\/.test(candidate) || candidate.includes('\\')) {
    const parts = candidate.split(/\\|\//);
    candidate = parts[parts.length - 1];
  }
  if (/^[^/]+\.[a-zA-Z0-9]+$/.test(candidate)) {
    candidate = `/admin/products/images/${candidate}`;
  }
  const base = apiClient?.defaults?.baseURL || '';
  return candidate.startsWith('http')
    ? candidate
    : `${base}${candidate.startsWith('/') ? candidate : `/${candidate}`}`;
};

const ProductCard = ({ p }) => {
  const discount = p.originalPrice && p.originalPrice > p.price ? Math.round(100 - (p.price / p.originalPrice) * 100) : 0;
  const rating = p.rating || 4.5;
  const inStock = p.inStock !== false;
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const { addToCart } = useCart();

  const variants = Array.isArray(p.variants) && p.variants.length > 0 ? p.variants : [{ id: 'default', weight: p.weight || 'Default', price: p.price || 0 }];
  const selectedVariant = variants[selectedVariantIdx] || variants[0];
  
  // Get current price from selected variant or main product
  const currentPrice = selectedVariant?.price || p.price || 0;
  const currentOriginalPrice = selectedVariant?.originalPrice || p.originalPrice || 0;
  const variantDiscount = currentOriginalPrice && currentOriginalPrice > currentPrice ? Math.round(100 - (currentPrice / currentOriginalPrice) * 100) : discount;

  const onAdd = () => {
    const variantId = selectedVariant?.id || `v${selectedVariantIdx}`;
    const qty = 1;
    try {
      addToCart({ 
        id: p.id, 
        productId: p.id, 
        variantId, 
        name: p.name, 
        variant: selectedVariant.weight || selectedVariant.size || '', 
        price: parseFloat(currentPrice), 
        image: p.image, 
        category: p.category, 
        subcategory: p.subcategory,
        brand: p.brand 
      }, qty);
    } catch (e) {
      console.warn('Add to cart failed', e);
    }
  };

  return (
    <article className="bg-white rounded-lg border border-border overflow-hidden shadow hover:shadow-lg transition-shadow">
      <div className="p-3">
        <div className="relative">
          {/* Enhanced badges display */}
          <div className="absolute top-2 left-2 z-20 flex flex-col gap-1">
            {variantDiscount > 0 && (
              <div className="bg-red-600 text-white text-[11px] px-2 py-0.5 rounded">{variantDiscount}% OFF</div>
            )}
            {p.badges && p.badges.length > 0 && p.badges.slice(0, 2).map((badge, idx) => (
              <div key={idx} className="bg-green-500 text-white text-[11px] px-2 py-0.5 rounded">{badge}</div>
            ))}
            {!inStock && (
              <div className="bg-gray-500 text-white text-[11px] px-2 py-0.5 rounded">Out of Stock</div>
            )}
          </div>
          
          <div className="mt-2 h-56 md:h-64 flex items-center justify-center bg-[#f6f8fb] rounded-lg overflow-hidden shadow-sm">
            <Link to={`/product-full/${p.id}`} className="absolute inset-0 z-10" aria-label={`Open ${p.name} full page`} />
            <img src={p.image} alt={p.name} className="max-h-56 md:max-h-64 object-contain relative z-0" />
          </div>
        </div>

        <div className="mt-3">
          <h3 className="text-sm font-semibold text-foreground line-clamp-2">{p.name}</h3>
          {variants.length > 1 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {variants.map((v, i) => {
                const label = typeof v === 'string' ? v : (v.weight || v.label || `${v.size || ''}`);
                const variantPrice = v.price || p.price;
                const active = i === selectedVariantIdx;
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedVariantIdx(i)}
                    className={`text-[12px] px-3 py-1 border rounded flex flex-col items-center ${
                      active ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-foreground border-border hover:border-orange-300'
                    }`}>
                    <span>{label}</span>
                    {variantPrice && <span className="text-[10px] font-semibold">₹{Number(variantPrice).toFixed(0)}</span>}
                  </button>
                );
              })}
            </div>
          )}
          <div className="mt-4 flex items-center justify-between">
            <div>
              <div className="text-lg font-bold">₹{Number(currentPrice).toFixed(2)}</div>
              {currentOriginalPrice && currentOriginalPrice > currentPrice && (
                <div className="text-sm text-muted-foreground line-through">₹{Number(currentOriginalPrice).toFixed(2)}</div>
              )}
            </div>
            <button 
              onClick={onAdd} 
              disabled={!inStock}
              className={`px-4 py-2 rounded-full text-sm shadow ${
                inStock 
                  ? 'bg-orange-500 text-white hover:bg-orange-600' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {inStock ? 'Add' : 'Out of Stock'}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

const DogFood = ({ initialActive = 'All Dog Food' }) => {
  const [active, setActive] = useState(initialActive);
  const [products, setProducts] = useState(sampleProducts);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  const { getCartItemCount, cartItems } = useCart();
  const navigate = useNavigate();
  const filterConfig = getFilterConfig('dogs', 'food');
  const sortOptions = getSortOptions('dogs', 'food');
  const filterSections = filterConfig.sections || [];
  const topFilters = (filterConfig.topFilters && filterConfig.topFilters.length > 0)
    ? filterConfig.topFilters
    : ['Brand', 'Dog/Cat', 'Life Stage', 'Breed Size', 'Product Type', 'Special Diet', 'Protein Source', 'Price', 'Weight', 'Size', 'Sub Category'];
  const [selectedTopFilter, setSelectedTopFilter] = useState(topFilters[0]);
  const topRef = useRef(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const drawerContentRef = useRef(null);
  const sectionRefs = useRef({});

  useEffect(() => {
    const fetchDogProducts = async () => {
      setLoadingProducts(true);
      try {
        // Get URL parameters with proper normalization
        const urlParams = new URLSearchParams(window.location.search);
        const cleanParams = getCleanUrlParams(urlParams);
        
        // Add active category to parameters if not 'All Dog Food'
        if (active && active !== 'All Dog Food') {
          cleanParams.sub = active;
        }
        
        console.log('DogFood: URL parameters:', cleanParams);
        
        // Fetch all Dog products - filtering will be done on frontend
        const apiData = await productApi.getCustomerProducts({ type: 'Dog' });
        console.log('DogFood: API response received:', (apiData || []).length, 'products');
        
        // Process and normalize products
        const normalizedProducts = (apiData || []).map((item) => {
          const normalizedProduct = normalizeProductFromApi(item);
          const filters = { ...(normalizedProduct.filters || {}) };
          const brand = normalizedProduct.brand || item?.brand || '';
          
          // Ensure brand is present in filters for filtering
          if (brand) {
            const list = Array.isArray(filters.brands) ? filters.brands.slice() : [];
            if (!list.map(v => `${v}`.toLowerCase()).includes(`${brand}`.toLowerCase())) {
              list.push(brand);
            }
            filters.brands = list;
          }
          
          return {
            ...normalizedProduct,
            image: resolveProductImage(normalizedProduct),
            filters
          };
        });
        
        console.log('DogFood: Processed products:', normalizedProducts.length);
        
        if (normalizedProducts.length > 0) {
          setProducts(normalizedProducts);
          setFetchError('');
          console.log('DogFood: Successfully loaded products from database');
        } else {
          console.log('DogFood: No products found in database, using sample data');
          setProducts(sampleProducts);
          setFetchError('No live dog food items yet. Showing featured picks.');
        }
      } catch (error) {
        console.error('DogFood: Failed to load products', error);
        setFetchError(`Unable to reach live catalog: ${error.message}. Showing featured picks.`);
        setProducts(sampleProducts);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchDogProducts();
  }, [active]);

  // Initialize brand filter from URL (?brand=...)
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlBrandRaw = urlParams.get('brand');
      if (urlBrandRaw) {
        const decoded = decodeURIComponent(urlBrandRaw).replace(/\+/g, ' ').trim();
        if (decoded) setActiveFilters((prev) => ({ ...prev, brands: [decoded] }));
      }
    } catch {}
  }, []);

  const displayedProducts = useMemo(() => {
    if (products.length === 0) return [];

    // Frontend handles ALL filtering - match by category and subcategory names
    const pageCategory = 'Dog Food'; // This page's category
    const urlParams = new URLSearchParams(window.location.search);
    const urlSub = urlParams.get('sub');
    const norm = s => String(s||'').toLowerCase().trim();

    let working = products;
    
    // Step 1: Filter by category (exact match, case-insensitive)
    working = working.filter(p => {
      const productCategory = norm(p.category || '');
      const targetCategory = norm(pageCategory);
      return productCategory === targetCategory || 
             productCategory.includes(targetCategory) ||
             targetCategory.includes(productCategory);
    });
    
    // Step 2: Filter by subcategory if specified (from URL or active pill)
    const activeSubcategory = urlSub || (active && !active.toLowerCase().includes('all') ? active : null);
    if (activeSubcategory && activeSubcategory.trim()) {
      const targetSub = norm(activeSubcategory);
      working = working.filter(p => {
        const productSub = norm(p.subcategory || '');
        return productSub === targetSub || 
               productSub.includes(targetSub) ||
               targetSub.includes(productSub);
      });
    }
    
    // Step 3: Apply activeFilters (brand, price, etc.)
    let filtered = working.filter((product) => productMatchesFilterSelections(product, activeFilters));
    
    return filtered;
  }, [products, activeFilters, active]);

  const openFilterAndScroll = (key) => {
    // open drawer then scroll to the section inside the drawer
    setSelectedTopFilter(key);
    setFilterOpen(true);

    const doScroll = () => {
      const container = drawerContentRef.current;
      const el = sectionRefs.current[key];
      if (container && el) {
        // compute offset so the section header is visible below the drawer header
        const drawerHeaderHeight = 64; // approximate header height (px)
        const top = el.offsetTop;
        const scrollTo = Math.max(0, top - drawerHeaderHeight - 8);
        container.scrollTo({ top: scrollTo, behavior: 'smooth' });

        // add temporary highlight class to draw attention (blink/pulse)
        try {
          el.classList.add('section-highlight');
          // remove after animation completes
          setTimeout(() => {
            el.classList.remove('section-highlight');
          }, 1400);
        } catch (err) {
          // ignore if DOM operations fail
        }
      }
    };

    // wait briefly for the drawer transition to finish (or run immediately)
    setTimeout(doScroll, 220);
  };

  const toggleFilter = (sectionId, option) => {
    const normalizedOption = option.toLowerCase();
    setActiveFilters((prev) => {
      const current = prev[sectionId] || [];
      const exists = current.includes(normalizedOption);
      const nextValues = exists ? current.filter((value) => value !== normalizedOption) : [...current, normalizedOption];
      const nextState = { ...prev };
      if (nextValues.length > 0) {
        nextState[sectionId] = nextValues;
      } else {
        delete nextState[sectionId];
      }
      return nextState;
    });
  };

  const isFilterActive = (sectionId, option) =>
    (activeFilters[sectionId] || []).includes(option.toLowerCase());

  const clearFilters = () => setActiveFilters({});

  const routeMap = {
    'All Dog Food': '/shop-for-dogs/dogfood/all-dog-food',
    'Dry Food': '/shop-for-dogs/dogfood/dry-food',
    'Wet Food': '/shop-for-dogs/dogfood/wet-food',
    'Grain Free': '/shop-for-dogs/dogfood/grain-free',
    'Puppy Food': '/shop-for-dogs/dogfood/puppy-food',
    'Hypoallergenic': '/shop-for-dogs/dogfood/hypoallergenic',
    'Veterinary Food': '/shop-for-dogs/dogfood/veterinary-food',
    'Food Toppers & Gravy': '/shop-for-dogs/dogfood/food-toppers-and-gravy'
  };

  const scrollTopLeft = () => {
    if (topRef.current) topRef.current.scrollBy({ left: -220, behavior: 'smooth' });
  };

  const scrollTopRight = () => {
    if (topRef.current) topRef.current.scrollBy({ left: 220, behavior: 'smooth' });
  };
  const leftRef = useRef(null);
  const rightRef = useRef(null);

  const handleLeftWheel = (e) => {
    // scroll the left column only
    if (leftRef.current) {
      e.preventDefault();
      leftRef.current.scrollTop += e.deltaY;
    }
  };

  const handleRightWheel = (e) => {
    // scroll the right column only
    if (rightRef.current) {
      e.preventDefault();
      rightRef.current.scrollTop += e.deltaY;
    }
  };

  return (
    <>
      <Helmet>
        <title>Shop for Dogs — Dog Food | PET&CO</title>
        <style>{`
          /* Hide scrollbars visually but keep scrolling functionality for this page */
          /* Scoped class for internal scroll containers */
          .thin-gold-scroll {
            scrollbar-width: none; /* Firefox */
            scrollbar-color: transparent transparent;
          }
          .thin-gold-scroll::-webkit-scrollbar { display: none; width: 0; height: 0; }
          .thin-gold-scroll::-webkit-scrollbar-track { background: transparent; }
          .thin-gold-scroll::-webkit-scrollbar-thumb { background: transparent; }

          /* Also hide global browser scrollbars for this page's body so outer scrollbar isn't visible */
          html, body, #root {
            scrollbar-width: none; /* Firefox */
            -ms-overflow-style: none; /* IE 10+ */
          }
          html::-webkit-scrollbar, body::-webkit-scrollbar, #root::-webkit-scrollbar {
            display: none; width: 0; height: 0;
          }

          /* hide scrollbar for horizontal top filters */
          .hide-scrollbar {
            -ms-overflow-style: none; /* IE and Edge */
            scrollbar-width: none; /* Firefox */
          }
          .hide-scrollbar::-webkit-scrollbar { display: none; }

          /* small scroll button styles (page-scoped) */
          .top-scroll-btn { width: 34px; height: 34px; border-radius: 9999px; }

          /* highlight animation for target section when opened from top pills */
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
        {fetchError && (
          <div className="mb-4 rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {fetchError}
          </div>
        )}
        <div className="grid grid-cols-12 gap-3 md:gap-6">
          {/* On small screens: give categories a little more room so icon+label are not cramped */}
          <aside className="col-span-3 lg:col-span-3 xl:col-span-2">
            <div
              ref={leftRef}
              onWheel={handleLeftWheel}
              className="bg-white rounded border border-border overflow-hidden thin-gold-scroll"
              style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 220px)' }}
            >
              <ul className="divide-y">
                {categories.map((c, idx) => (
                  <li key={c.id} className={`relative border-b ${active === c.label ? 'bg-[#fff6ee]' : ''}`}>
                    <button
                      onClick={() => { setActive(c.label); const p = routeMap[c.label]; if (p) navigate(p); }}
                      className="w-full text-center flex flex-col items-center gap-1 p-2 md:flex-row md:text-left md:items-center md:gap-3 md:p-4"
                    >
                      <div className={`w-12 h-12 rounded-full overflow-hidden flex items-center justify-center border ${active === c.label ? 'ring-2 ring-orange-400' : 'border-gray-100'}`}>
                        <img src={c.img} alt={c.label} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-xs md:text-sm font-medium text-gray-800 mt-1 md:mt-0">{c.label}</span>
                    </button>
                    {/* orange vertical accent on the right when active */}
                    {active === c.label && (
                      <div className="absolute right-0 top-0 h-full w-1 bg-orange-400" />
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <main
            ref={rightRef}
            onWheel={handleRightWheel}
            className="col-span-9 lg:col-span-9 xl:col-span-10"
            style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 220px)' }}
          >
            {/* top filter bar (simple placeholder matching ref) */}
            <div className="mb-4 flex items-center justify-between">
              {/* prevent the top pill row from causing page-level overflow; keep scrolling internal */}
              <div className="relative flex-1 overflow-hidden">
                {/* left scroll button */}
                <button
                  onClick={scrollTopLeft}
                  aria-label="Scroll left"
                  className="top-scroll-btn hidden md:inline-flex items-center justify-center border border-border bg-white ml-1 mr-2 absolute left-0 top-1/2 transform -translate-y-1/2 z-10"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* scrollable pill row */}
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

                {/* right scroll button */}
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

            {/* Filter drawer trigger (right side) */}
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

            {/* product grid: responsive columns for better layout */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {loadingProducts ? (
                <div className="col-span-full py-12 text-center text-muted-foreground">
                  Loading dog products...
                </div>
              ) : displayedProducts.length > 0 ? (
                displayedProducts.map((product) => <ProductCard key={product.id} p={product} />)
              ) : (
                <div className="col-span-full py-12 text-center text-muted-foreground">
                  No products match the selected filters yet.
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Right-side filter drawer */}
      <div aria-hidden={!filterOpen} className={`fixed inset-0 z-50 pointer-events-none ${filterOpen ? '' : ''}`}>
        {/* overlay */}
        <div
          onClick={() => setFilterOpen(false)}
          className={`absolute inset-0 bg-black/40 transition-opacity ${filterOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0'}`}
        />

        {/* drawer panel */}
        <aside
          role="dialog"
          aria-modal="true"
          className={`fixed top-0 right-0 h-full bg-white w-full sm:w-96 shadow-xl transform transition-transform pointer-events-auto ${filterOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="flex items-center justify-between p-4 border-b">
            <div>
              <div className="text-sm font-semibold">Filter</div>
              <div className="text-xs text-muted-foreground">250 products</div>
            </div>
            <div>
              <button onClick={() => setFilterOpen(false)} className="p-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 011.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          {/* scrollable content */}
          <div ref={drawerContentRef} className="px-4 pt-4 pb-32 hide-scrollbar overflow-y-auto" style={{ maxHeight: 'calc(100vh - 140px)' }}>
            {/* Sort By */}
            <section className="mb-6">
              <h4 className="text-sm font-medium mb-3">Sort By</h4>
              <div className="flex flex-wrap gap-2">
                {sortOptions.map(option => (
                  <button key={option} className="text-xs px-3 py-1 border border-border rounded bg-white">
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
                    {section.options.map(option => (
                      <button
                        key={option}
                    type="button"
                    onClick={() => toggleFilter(section.id, option)}
                    className={`text-xs px-3 py-1 border rounded transition ${
                      isFilterActive(section.id, option)
                        ? 'bg-orange-500 border-orange-500 text-white'
                        : 'bg-white border-border text-foreground'
                    }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Add options for {section.label}</p>
                )}
              </section>
            ))}
          </div>

          {/* footer actions */}
          <div className="fixed bottom-0 right-0 left-auto w-full sm:w-96 bg-white border-t p-4 flex items-center justify-between">
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm text-orange-500 hover:underline"
            >
              Clear All
            </button>
            <button
              type="button"
              onClick={() => setFilterOpen(false)}
              className="bg-orange-500 text-white px-5 py-2 rounded"
            >
              Apply Filters
            </button>
          </div>
        </aside>
      </div>

      {/* Footer */}
      <Footer />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </>
  );
};

export default DogFood;


