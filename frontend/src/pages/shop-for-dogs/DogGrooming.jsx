import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import Footer from '../homepage/components/Footer';
import MobileBottomNav from '../../components/ui/MobileBottomNav';
import QuickViewModal from '../../components/ui/QuickViewModal.jsx';
import { useCart } from '../../contexts/CartContext';
import { normalizeProductFromApi, productMatchesFilterSelections, isDogProduct, isGroomingProduct } from '../../utils/productUtils';
import { normalizePrice } from '../../utils/priceNormalization';
import dataService from '../../services/dataService';
import apiClient from '../../services/api';
import productApi from '../../services/productApi';

import { Dog } from 'lucide-react';

const categories = [
  { id: 'brushes-combs', label: 'Brushes & Combs', img: '/assets/images/dog/dg1.webp' },
  { id: 'dry-bath-wipes-perfume', label: 'Dry Bath, Wipes & Perfume', img: '/assets/images/dog/dg2.webp' },
  { id: 'ear-eye-pawcare', label: 'Ear, Eye & PawCare', img: '/assets/images/dog/dg3.webp' },
  { id: 'oral-care', label: 'Oral Care', img: '/assets/images/dog/dg4.webp' },
  { id: 'shampoo-conditioner', label: 'Shampoo & Conditioner', img: '/assets/images/dog/dg5.webp' },
  { id: 'tick-flea-control', label: 'Tick & Flea Control', img: '/assets/images/dog/dg6.webp' },
  { id: 'all-dog-grooming', label: 'All Dog Grooming', img: '/assets/images/dog/dg7.webp' }
];

const sampleProducts = [
  { id: 'b1', name: 'Cozy Cat Bed', image: '/assets/images/essential/meowsi.webp', badges: ['Comfort'], variants: ['Small', 'Large'], price: 1299 },
  { id: 'b2', name: 'Washable Mat', image: '/assets/images/essential/whiskas.webp', badges: ['Durable'], variants: ['50x50 cm', '70x70 cm'], price: 799 },
  { id: 'b3', name: 'Play Tent', image: '/assets/images/essential/sheba.webp', badges: ['Fun'], variants: ['One Size'], price: 1599 }
];

const ProductCard = ({ p, onQuickView }) => {
  const [qty] = useState(1);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const { addToCart } = useCart();
  
  // Ensure variants is always an array
  const variants = Array.isArray(p.variants) && p.variants.length > 0 ? p.variants : [p.weight || p.size || 'Default'];
  const selectedVariant = variants[selectedVariantIdx] || variants[0];
  
  // Calculate pricing with variants
  const currentPrice = (typeof selectedVariant === 'object' ? selectedVariant.price : null) || p.price || 0;
  const currentOriginalPrice = (typeof selectedVariant === 'object' ? selectedVariant.originalPrice : null) || p.original || 0;
  const discount = currentOriginalPrice && currentOriginalPrice > currentPrice ? 
    Math.round(100 - (currentPrice / currentOriginalPrice) * 100) : 0;
  
  const inStock = p.inStock !== false;
  const rating = p.rating || 4.5;

  const onAdd = () => {
    try {
      addToCart({
        id: p.id,
        productId: p.id,
        variantId: typeof selectedVariant === 'object' ? selectedVariant.id : `v${selectedVariantIdx}`,
        name: p.name,
        variant: typeof selectedVariant === 'string' ? selectedVariant : (selectedVariant.weight || selectedVariant.size || ''),
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
      <div className="p-2 md:p-3">
        {/* Enhanced badges section */}
        <div className="h-6 flex items-center justify-between">
          <div className="flex gap-1">
            {p.badges?.[0] && (
              <div className="bg-green-500 text-white text-[11px] px-2 py-0.5 rounded">{p.badges[0]}</div>
            )}
            {discount > 0 && (
              <div className="bg-red-600 text-white text-[11px] px-2 py-0.5 rounded">{discount}% OFF</div>
            )}
          </div>
          {!inStock && (
            <div className="bg-gray-500 text-white text-[11px] px-2 py-0.5 rounded">Out of Stock</div>
          )}
        </div>
        
        <div className="mt-2 h-36 md:h-44 flex items-center justify-center bg-[#f6f8fb] rounded relative">
          <Link to={`/product-detail/${p.id}`} className="absolute inset-0 z-10" aria-label={`Open ${p.name} details`} />
          <img src={p.image} alt={p.name} className="max-h-32 md:max-h-40 object-contain" />
        </div>
        
        {/* Product name and details */}
        <h3 className="mt-2 text-xs md:text-sm font-semibold text-foreground line-clamp-2">{p.name}</h3>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
          {p.brand && <span>by {p.brand}</span>}
          {p.subcategory && <span className="text-right">{p.subcategory}</span>}
        </div>
        
        {/* Short description if available */}
        {p.shortDescription && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.shortDescription}</p>
        )}
        
        {/* Features display */}
        {Array.isArray(p.features) && p.features.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {p.features.slice(0, 2).map((feature, idx) => (
              <span key={idx} className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                {feature}
              </span>
            ))}
            {p.features.length > 2 && (
              <span className="text-[10px] text-muted-foreground">+{p.features.length - 2} more</span>
            )}
          </div>
        )}
        
        {/* Rating */}
        <div className="mt-2 flex items-center gap-1">
          <div className="flex items-center text-yellow-500">
            <span className="text-xs">★</span>
            <span className="text-xs text-foreground ml-1">{rating}</span>
          </div>
        </div>

        {/* Enhanced variant chips with pricing */}
        {variants.length > 1 && (
          <div className="mt-2">
            <div className="text-xs text-muted-foreground mb-1">Available options:</div>
            <div className="flex flex-wrap gap-1">
              {variants.map((v, i) => {
                const label = typeof v === 'string' ? v : (v.weight || v.size || v.label || `Option ${i + 1}`);
                const variantPrice = typeof v === 'object' ? v.price : currentPrice;
                const active = i === selectedVariantIdx;
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedVariantIdx(i)}
                    className={`text-[11px] px-2 py-1 border rounded flex flex-col items-center ${
                      active ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-border hover:border-orange-300'
                    }`}
                  >
                    <span>{label}</span>
                    {variantPrice && <span className="font-semibold">₹{Number(variantPrice).toFixed(0)}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Price and action section */}
        <div className="mt-3 flex items-center justify-between">
          <div>
            <div className="text-base md:text-lg font-bold">₹{Number(currentPrice).toFixed(2)}</div>
            {currentOriginalPrice && currentOriginalPrice > currentPrice && (
              <div className="text-sm text-muted-foreground line-through">₹{Number(currentOriginalPrice).toFixed(2)}</div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={onAdd}
              disabled={!inStock}
              className={`px-3 py-1.5 rounded-full text-sm ${
                inStock 
                  ? 'bg-orange-500 text-white hover:bg-orange-600' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {inStock ? 'Add' : 'Out of Stock'}
            </button>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="mt-2 flex justify-between text-xs">
          <button 
            onClick={() => onQuickView(p)}
            className="text-primary hover:underline"
          >
            Quick View
          </button>
          <Link to={`/product-detail/${p.id}`} className="text-primary hover:underline">
            View Details
          </Link>
        </div>
        
        {/* Additional product characteristics */}
        {(p.petType || p.lifeStage || p.productType) && (
          <div className="mt-2 text-xs text-muted-foreground flex flex-wrap gap-1">
            {p.petType && <span className="bg-gray-100 px-2 py-0.5 rounded">{p.petType}</span>}
            {p.lifeStage && <span className="bg-gray-100 px-2 py-0.5 rounded">{p.lifeStage}</span>}
            {p.productType && <span className="bg-gray-100 px-2 py-0.5 rounded">{p.productType}</span>}
          </div>
        )}
      </div>
    </article>
  );
}

const DogGroomingPage = ({ initialActive = 'All Dog Grooming' }) => {
  const [active, setActive] = useState(initialActive);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const { getCartItemCount, cartItems, addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useCart();
  const navigate = useNavigate();
  const leftRef = useRef(null);
  const rightRef = useRef(null);
  const handleLeftWheel = (e) => { if (leftRef.current) { e.preventDefault(); leftRef.current.scrollTop += e.deltaY; } };
  const handleRightWheel = (e) => { if (rightRef.current) { e.preventDefault(); rightRef.current.scrollTop += e.deltaY; } };
  const routeMap = {
    'Brushes & Combs': '/shop-for-dogs?category=dog-grooming&sub=Brushes%20%26%20Combs',
    'Dry Bath, Wipes & Perfume': '/shop-for-dogs?category=dog-grooming&sub=Dry%20Bath%2C%20Wipes%20%26%20Perfume',
    'Ear, Eye & PawCare': '/shop-for-dogs?category=dog-grooming&sub=Ear%2C%20Eye%20%26%20PawCare',
    'Oral Care': '/shop-for-dogs?category=dog-grooming&sub=Oral%20Care',
    'Shampoo & Conditioner': '/shop-for-dogs?category=dog-grooming&sub=Shampoo%20%26%20Conditioner',
    'Tick & Flea Control': '/shop-for-dogs?category=dog-grooming&sub=Tick%20%26%20Flea%20Control',
    'All Dog Grooming': '/shop-for-dogs?category=dog-grooming&sub=All%20Dog%20Grooming'
  };
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  const handleQuickView = (product) => {
    setQuickViewProduct(product);
    setIsQuickViewOpen(true);
  };

  const handleCloseQuickView = () => {
    setIsQuickViewOpen(false);
    setQuickViewProduct(null);
  };

  const handleQuickViewAddToCart = (cartItem) => {
    addToCart(cartItem, cartItem.quantity || 1);
    handleCloseQuickView();
  };

  // Filter bar state
  const topFilters = ['Brand', 'Dog/Cat', 'Life Stage', 'Breed Size', 'Product Type', 'Special Diet', 'Protein Source', 'Price', 'Weight', 'Size', 'Sub Category'];
  const [selectedTopFilter, setSelectedTopFilter] = useState(topFilters[0]);
  const topRef = useRef(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const drawerContentRef = useRef(null);
  const sectionRefs = useRef({});

  // Filter selection state
  const [selectedFilters, setSelectedFilters] = useState({
    brands: [],
    catKitten: [],
    lifeStages: [],
    breedSizes: [],
    productTypes: [],
    specialDiets: [],
    proteinSource: [],
    priceRanges: [],
    weights: [],
    sizes: [],
    subCategories: [],
    sortBy: ''
  });

  const toggleFilter = (category, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(item => item !== value)
        : [...prev[category], value]
    }));
  };

  const clearAllFilters = () => {
    setSelectedFilters({
      brands: [],
      catKitten: [],
      lifeStages: [],
      breedSizes: [],
      productTypes: [],
      specialDiets: [],
      proteinSource: [],
      priceRanges: [],
      weights: [],
      sizes: [],
      subCategories: [],
      sortBy: ''
    });
  };

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

  // grooming specific filter data (defaults; can be expanded)
  const brands = ['Hearty', 'Royal Canin', 'Drools', 'Pedigree', 'Farmina'];
  const dogCat = ['Dog'];
  const lifeStages = ['Puppy', 'Adult', 'Senior'];
  const breedSizes = ['Small', 'Medium', 'Large', 'Giant'];
  const productTypes = ['Brushes & Combs', 'Dry Bath & Wipes', 'Oral Care', 'Shampoo & Conditioner', 'Tick & Flea'];
  const specialDiets = ['Fragrance-Free', 'Hypoallergenic'];
  const proteinSource = ['N/A'];
  const priceRanges = ['INR 10 - INR 300', 'INR 301 - INR 500', 'INR 501 - INR 1000', 'INR 1000+'];
  const weights = ['Light', 'Medium', 'Heavy'];
  const sizes = ['One Size', 'Small', 'Medium', 'Large'];
  const subCategories = ['Brushes & Combs', 'Dry Bath, Wipes & Perfume', 'Ear, Eye & PawCare', 'Oral Care', 'Shampoo & Conditioner', 'Tick & Flea Control'];

  const scrollTopLeft = () => { if (topRef.current) topRef.current.scrollBy({ left: -220, behavior: 'smooth' }); };
  const scrollTopRight = () => { if (topRef.current) topRef.current.scrollBy({ left: 220, behavior: 'smooth' }); };

  const resolveImageUrl = (p) => {
    const candidate = p?.imageUrl || p?.image || p?.thumbnailUrl || p?.image_path;
    if (!candidate) return '/assets/images/no_image.png';
    if (/^(https?:)?\/\//i.test(candidate) || candidate.startsWith('data:')) return candidate;
    const base = apiClient?.defaults?.baseURL || '';
    return candidate.startsWith('/') ? `${base}${candidate}` : `${base}/${candidate}`;
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        console.log('DogGrooming: Fetching all Dog products');
        
        // Fetch all Dog products - filtering will be done on frontend
        const apiData = await productApi.getCustomerProducts({ type: 'Dog' });
        console.log('DogGrooming: API response received:', apiData.length, 'products');

        // Process products
        const normalizedProducts = apiData.map(p => {
          const { price, originalPrice } = normalizePrice(p);
          
          return {
            id: p?.id,
            name: p?.name || p?.title,
            category: p?.category || '',
            subcategory: p?.subcategory || '',
            brand: p?.brand || 'Brand',
            price,
            original: originalPrice,
            image: resolveImageUrl(p),
            badges: Array.isArray(p?.badges) ? p.badges : [],
            variants: Array.isArray(p?.variants) ? p.variants.map(v => v?.weight || v?.label) : ['Default'],
            tags: Array.isArray(p?.tags) ? p.tags : [],
            lifeStage: p?.lifeStage || '',
            breedSize: p?.breedSize || '',
            productType: p?.productType || '',
            specialDiet: p?.specialDiet || '',
            proteinSource: p?.proteinSource || '',
            weight: p?.weight || '',
            size: p?.size || '',
            shortDescription: p?.shortDescription || p?.description || '',
            features: (() => {
              if (Array.isArray(p?.features)) return p.features;
              if (typeof p?.features === 'string') {
                try {
                  const parsed = JSON.parse(p.features);
                  return Array.isArray(parsed) ? parsed : [];
                } catch {
                  return [];
                }
              }
              return [];
            })(),
            petType: p?.petType || 'Dog'
          };
        });

        if (mounted) {
          setProducts(normalizedProducts.length > 0 ? normalizedProducts : sampleProducts);
          console.log('DogGrooming: Loaded', normalizedProducts.length, 'products');
        }
      } catch (err) { 
        console.error('DogGrooming: Failed to load products', err); 
        if (mounted) setProducts([]); 
      }
      finally { 
        if (mounted) setLoading(false); 
      }
    };
    load();
    return () => { mounted = false; };
  }, [active, location.search]);

  // Apply filters and category filtering
  useEffect(() => {
    if (products.length === 0) {
      setFilteredProducts([]);
      return;
    }

    // Frontend handles ALL filtering - match by category and subcategory names
    const pageCategory = 'Dog Grooming'; // This page's category
    const urlParams = new URLSearchParams(location.search);
    const urlSub = urlParams.get('sub');
    
    // Enhanced normalization: lowercase, trim, remove extra spaces and special chars
    const norm = s => String(s||'')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')      // Replace multiple spaces with single space
      .replace(/[&]/g, 'and')    // Replace & with 'and'
      .replace(/[^\w\s-]/g, ''); // Remove special characters except spaces and hyphens

    let working = products;
    
    // Step 1: Filter by category (exact match only, case-insensitive)
    working = working.filter(p => {
      const productCategory = norm(p.category || '');
      const targetCategory = norm(pageCategory);
      // Only exact match after normalization
      return productCategory === targetCategory;
    });
    
    console.log(`DogGrooming: After category filter (${pageCategory}): ${working.length} products`);
    
    // Step 2: Filter by subcategory if specified (from URL or active pill)
    const activeSubcategory = urlSub || (active && !active.toLowerCase().includes('all') ? active : null);
    if (activeSubcategory && activeSubcategory.trim()) {
      const targetSub = norm(activeSubcategory);
      working = working.filter(p => {
        const productSub = norm(p.subcategory || '');
        // Exact match or contains for subcategory (more flexible)
        return productSub === targetSub || 
               productSub.includes(targetSub.replace(/-/g, '')) ||
               targetSub.includes(productSub.replace(/-/g, ''));
      });
      console.log(`DogGrooming: After subcategory filter (${activeSubcategory}): ${working.length} products`);
    }
    
    // Step 3: Apply additional filters (brand, price, etc.)

    // Apply selected filters (brands, productTypes, priceRanges, sizes) - keep original logic
    if (selectedFilters?.brands?.length > 0) {
      working = working.filter((p) => selectedFilters.brands.includes(p.brand));
    }
    if (selectedFilters?.productTypes?.length > 0) {
      working = working.filter((p) =>
        selectedFilters.productTypes.some((pt) =>
          String(p.productType || '').toLowerCase().includes(pt.toLowerCase()) ||
          String(p.subcategory || '').toLowerCase().includes(pt.toLowerCase()) ||
          String(p.name || '').toLowerCase().includes(pt.toLowerCase())
        )
      );
    }
    if (selectedFilters?.priceRanges?.length > 0) {
      working = working.filter((p) => {
        const price = p.price || 0;
        return selectedFilters.priceRanges.some((range) => {
          if (range === 'INR 200 - INR 500') return price >= 200 && price <= 500;
          if (range === 'INR 501 - INR 1000') return price >= 501 && price <= 1000;
          if (range === 'INR 1001 - INR 2000') return price >= 1001 && price <= 2000;
          if (range === 'INR 2000+') return price > 2000;
          return true;
        });
      });
    }
    if (selectedFilters?.sizes?.length > 0) {
      working = working.filter((p) =>
        selectedFilters.sizes.some((s) =>
          String(p.size || '').toLowerCase().includes(s.toLowerCase()) ||
          (p.variants || []).some((variant) => String(variant).toLowerCase().includes(s.toLowerCase()))
        )
      );
    }

    // Apply sorting
    switch (selectedFilters?.sortBy) {
      case 'Price, low to high':
        working.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'Price, high to low':
        working.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'Alphabetically, A-Z':
        working.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'Alphabetically, Z-A':
        working.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
        break;
      default:
        break;
    }

    console.log(`DogGrooming: Final filtered products: ${working.length}`);
    if (working.length > 0) {
      console.log('Sample products:', working.slice(0, 3).map(p => ({ name: p.name, category: p.category, subcategory: p.subcategory })));
    }
    
    setFilteredProducts(working);
  }, [
    products, 
    active, 
    location.search,
    selectedFilters?.brands?.length,
    selectedFilters?.productTypes?.length,
    selectedFilters?.priceRanges?.length,
    selectedFilters?.sizes?.length,
    selectedFilters?.sortBy,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    JSON.stringify(selectedFilters)
  ]);
  return (
    <>
      <Helmet>
        <title>Shop for Dogs — Dog Grooming</title>
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

      <div className="container mx-auto px-4 py-8 pb-20 lg:pb-0">
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

            {/* product grid: keep 2 columns on mobile, expand on md and up; tighter gaps on mobile */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {loading ? (
                <div className="col-span-2 md:col-span-4 p-6 text-center">Loading products…</div>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map(p => <ProductCard key={p.id} p={p} onQuickView={handleQuickView} />)
              ) : (
                <div className="col-span-2 md:col-span-4 p-8 text-center">
                  <div className="text-gray-500 mb-2">
                    <Dog className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold mb-2">No products found</h3>
                    <p className="text-sm">No Dog Grooming products match your current filters.</p>
                    <p className="text-xs mt-2 text-gray-400">Try selecting a different subcategory or clearing filters.</p>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Footer and mobile nav */}
      <div className="mb-20 lg:mb-0">
        <Footer />
      </div>
      <div className="lg:hidden">
        <MobileBottomNav />
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
                {['Featured', 'Best selling', 'Alphabetically, A-Z', 'Alphabetically, Z-A', 'Price, low to high', 'Price, high to low', 'Date, old to new', 'Date, new to old'].map(s => (
                  <button key={s} className="text-xs px-3 py-1 border border-border rounded bg-white">{s}</button>
                ))}
              </div>
            </section>

            {/* Brand */}
            <section ref={el => sectionRefs.current['Brand'] = el} className="mb-6">
              <h4 className="text-sm font-medium mb-3">Brand</h4>
              <div className="flex flex-wrap gap-2">
                {brands.map(b => (<button key={b} className="text-xs px-3 py-1 border border-border rounded bg-white">{b}</button>))}
              </div>
            </section>

            {/* Dog/cat */}
            <section ref={el => sectionRefs.current['Dog/Cat'] = el} className="mb-6">
              <h4 className="text-sm font-medium mb-3">Dog/cat</h4>
              <div className="flex flex-wrap gap-2">{dogCat.map(d => (<button key={d} className="text-xs px-3 py-1 border border-border rounded bg-white">{d}</button>))}</div>
            </section>

            {/* Life stage */}
            <section ref={el => sectionRefs.current['Life Stage'] = el} className="mb-6">
              <h4 className="text-sm font-medium mb-3">Life stage</h4>
              <div className="flex flex-wrap gap-2">{lifeStages.map(l => (<button key={l} className="text-xs px-3 py-1 border border-border rounded bg-white">{l}</button>))}</div>
            </section>

            {/* Breed size */}
            <section ref={el => sectionRefs.current['Breed Size'] = el} className="mb-6">
              <h4 className="text-sm font-medium mb-3">Breed size</h4>
              <div className="flex flex-wrap gap-2">{breedSizes.map(b => (<button key={b} className="text-xs px-3 py-1 border border-border rounded bg-white">{b}</button>))}</div>
            </section>

            {/* Product type */}
            <section ref={el => sectionRefs.current['Product Type'] = el} className="mb-6">
              <h4 className="text-sm font-medium mb-3">Product type</h4>
              <div className="flex flex-wrap gap-2">{productTypes.map(p => (<button key={p} className="text-xs px-3 py-1 border border-border rounded bg-white">{p}</button>))}</div>
            </section>

            {/* Special diet */}
            <section ref={el => sectionRefs.current['Special Diet'] = el} className="mb-6">
              <h4 className="text-sm font-medium mb-3">Special diet</h4>
              <div className="flex flex-wrap gap-2">{specialDiets.map(s => (<button key={s} className="text-xs px-3 py-1 border border-border rounded bg-white">{s}</button>))}</div>
            </section>

            {/* Protein source */}
            <section ref={el => sectionRefs.current['Protein Source'] = el} className="mb-6">
              <h4 className="text-sm font-medium mb-3">Protein source</h4>
              <div className="flex flex-wrap gap-2">{proteinSource.map(p => (<button key={p} className="text-xs px-3 py-1 border border-border rounded bg-white">{p}</button>))}</div>
            </section>

            {/* Price */}
            <section ref={el => sectionRefs.current['Price'] = el} className="mb-6">
              <h4 className="text-sm font-medium mb-3">Price</h4>
              <div className="flex flex-wrap gap-2">{priceRanges.map(r => (<button key={r} className="text-xs px-3 py-1 border border-border rounded bg-white">{r}</button>))}</div>
            </section>

            {/* Weight */}
            <section ref={el => sectionRefs.current['Weight'] = el} className="mb-6">
              <h4 className="text-sm font-medium mb-3">Weight</h4>
              <div className="flex flex-wrap gap-2">{weights.map(w => (<button key={w} className="text-xs px-3 py-1 border border-border rounded bg-white">{w}</button>))}</div>
            </section>

            {/* Size */}
            <section ref={el => sectionRefs.current['Size'] = el} className="mb-6">
              <h4 className="text-sm font-medium mb-3">Size</h4>
              <div className="flex flex-wrap gap-2">{sizes.map(s => (<button key={s} className="text-xs px-3 py-1 border border-border rounded bg-white">{s}</button>))}</div>
            </section>

            {/* Sub category */}
            <section ref={el => sectionRefs.current['Sub Category'] = el} className="mb-6">
              <h4 className="text-sm font-medium mb-3">Sub category</h4>
              <div className="flex flex-wrap gap-2">{subCategories.map(s => (<button key={s} className="text-xs px-3 py-1 border border-border rounded bg-white">{s}</button>))}</div>
            </section>
          </div>

          {/* footer actions */}
          <div className="fixed bottom-0 right-0 left-auto w-full sm:w-96 bg-white border-t p-4 flex items-center justify-between">
            <button className="text-sm text-orange-500">Clear All</button>
            <button className="bg-orange-500 text-white px-5 py-2 rounded">Continue</button>
          </div>
        </aside>
      </div>

      {/* QuickView Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={isQuickViewOpen}
        onClose={handleCloseQuickView}
        onAddToCart={handleQuickViewAddToCart}
        onAddToWishlist={addToWishlist}
        isInWishlist={isInWishlist}
      />
    </>
  );
};


export default DogGroomingPage;
