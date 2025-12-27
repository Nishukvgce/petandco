import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import Footer from '../homepage/components/Footer';
import MobileBottomNav from '../../components/ui/MobileBottomNav';
import { useCart } from '../../contexts/CartContext';
import productApi from '../../services/productApi';
import dataService from '../../services/dataService';
import apiClient from '../../services/api';
import { getFilterConfig, getSortOptions } from '../../data/categoryFilters';
import { normalizePrice } from '../../utils/priceNormalization';
import { normalizeProductFromApi, productMatchesFilterSelections, isDogProduct, isFoodProduct } from '../../utils/productUtils';

const categories = [
  { id: 'all-cat-food', label: 'All Cat Food', img: '/assets/images/cat/cf1.webp' },
  { id: 'dry-food', label: 'Dry Food', img: '/assets/images/cat/cf2.webp' },
  { id: 'wet-food', label: 'Wet Food', img: '/assets/images/cat/cf3.webp' },
  { id: 'grain-free', label: 'Grain Free Food', img: '/assets/images/cat/cf4.webp' },
  { id: 'kitten-food', label: 'Kitten Food', img: '/assets/images/cat/cf5.webp' },
  { id: 'veterinary-food', label: 'Veterinary Food', img: '/assets/images/cat/cf7.webp' },
  { id: 'supplements', label: 'Supplements', img: '/assets/images/cat/cf8.webp' }
];

// reuse sampleProducts from DogFood layout but with cat-centric names/images
const sampleProducts = [
  {
    id: 'c1',
    name: 'Persian Choice Wet Cat Food',
    image: '/assets/images/essential/meowsi.webp',
    badges: ['Extra 3% OFF'],
    variants: ['85 g', '170 g', 'Pack Of 3'],
    price: 199
  },
  {
    id: 'c2',
    name: 'Royal Canin Cat Adult Dry Food',
    image: '/assets/images/essential/royal canin.webp',
    badges: ['Get Extra 5% OFF'],
    variants: ['1 kg', '2.5 kg', '10 kg'],
    price: 862.40,
    original: 980
  },
  {
    id: 'c3',
    name: 'Whiskas Classic Chicken & Rice',
    image: '/assets/images/essential/whiskas.webp',
    badges: ['Get Extra 5% OFF'],
    variants: ['100 g', '300 g', 'Pack Of 7'],
    price: 99
  }
];

const ProductCard = ({ p }) => {
  const [qty] = useState(1);
  const initialVariant = Array.isArray(p.variants) && p.variants.length > 0
    ? (typeof p.variants[0] === 'object' ? p.variants[0] : { id: 'default', weight: String(p.variants[0] || 'Default'), price: p.price })
    : { id: 'default', weight: 'Default', price: p.price };
  const [selectedVariant, setSelectedVariant] = useState(initialVariant);
  const { addToCart, addToWishlist, isInWishlist, removeFromWishlist } = useCart();
  const navigate = useNavigate();

  const handleAdd = () => {
    const productToAdd = {
      id: p.id,
      productId: p.id,
      variantId: selectedVariant?.id || 'default',
      name: p.name,
      image: p.image,
      price: parseFloat(selectedVariant?.price ?? p.price ?? 0),
      originalPrice: parseFloat(selectedVariant?.originalPrice ?? p.original ?? selectedVariant?.price ?? p.price ?? 0),
      variant: selectedVariant?.weight || selectedVariant?.size || selectedVariant?.label || String(selectedVariant || 'Default'),
      category: p.category || 'cat-food',
      brand: p.brand || 'Brand'
    };
    addToCart(productToAdd, 1);
  };

  const handleWishlist = () => {
    if (isInWishlist(p.id)) {
      removeFromWishlist(p.id);
    } else {
      addToWishlist({ id: p.id, name: p.name, image: p.image, price: p.price });
    }
  };

  return (
    <article className="bg-white rounded-lg border border-border overflow-hidden shadow-sm">
      <div className="p-3">
        <div className="h-8 flex items-center justify-start">
          <div className="bg-green-500 text-white text-xs px-3 py-1 rounded-t-md">{p.badges?.[0]}</div>
        </div>
        <button onClick={() => navigate(`/product-detail-page?id=${p.id}`)} className="mt-3 h-44 flex items-center justify-center bg-[#f6f8fb] rounded w-full">
          <img src={p.image} alt={p.name} className="max-h-40 object-contain" />
        </button>
        <div className="mt-3">
          <h3 onClick={() => navigate(`/product-detail-page?id=${p.id}`)} className="text-sm font-semibold text-foreground cursor-pointer inline-block mr-2">{p.name}</h3>
          <button onClick={() => navigate(`/product-full/${p.id}`)} className="text-xs text-primary hover:underline">Full</button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {(p.variants || []).map((v, i) => {
            const label = typeof v === 'object' ? (v.weight || v.size || v.label || 'Option') : String(v);
            const active = (typeof v === 'object') ? (selectedVariant?.id === v.id) : (String(selectedVariant?.weight || selectedVariant) === String(v));
            return (
              <button key={i} onClick={() => setSelectedVariant(typeof v === 'object' ? v : { id: 'default', weight: String(v), price: p.price })} className={`text-xs px-2 py-1 border border-border rounded ${active ? 'bg-green-600 text-white' : 'bg-white'}`}>{label}</button>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <div className="text-lg font-bold">₹{Number(selectedVariant?.price ?? p.price ?? 0).toFixed(2)}</div>
            {(selectedVariant?.originalPrice || p.original) && (
              <div className="text-sm text-muted-foreground line-through">₹{Number(selectedVariant?.originalPrice ?? p.original).toFixed(2)}</div>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <button onClick={handleAdd} className="bg-orange-500 text-white px-4 py-2 rounded-full">Add</button>
          </div>
        </div>
      </div>
    </article>
  );
}

const CatFood = ({ initialActive = 'All Cat Food' }) => {
  const [active, setActive] = useState(initialActive);
  const [products, setProducts] = useState(sampleProducts);
  const [serverFiltered, setServerFiltered] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  const { getCartItemCount, cartItems } = useCart();
  const navigate = useNavigate();
  const [filteredProducts, setFilteredProducts] = useState([]);
  const filterConfig = getFilterConfig('cats', 'food');
  const sortOptions = getSortOptions('cats', 'food');
  const filterSections = filterConfig.sections || [];
  const topFilters = (filterConfig.topFilters && filterConfig.topFilters.length > 0)
    ? filterConfig.topFilters
    : ['Brand', 'Cat/Kitten', 'Life Stage', 'Breed Size', 'Product Type', 'Special Diet', 'Protein Source', 'Price', 'Weight', 'Size', 'Sub Category'];
  const [selectedTopFilter, setSelectedTopFilter] = useState(topFilters[0] || '');
  const topRef = useRef(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const drawerContentRef = useRef(null);
  const sectionRefs = useRef({});

  // Filter state management
  const initialSortOption = sortOptions[0] || 'Featured';
  const buildEmptyFilterState = useCallback(() => {
    const base = { sortBy: initialSortOption };
    filterSections.forEach(section => {
      base[section.id] = [];
    });
    return base;
  }, [filterSections, initialSortOption]);

  const [selectedFilters, setSelectedFilters] = useState(() => buildEmptyFilterState());

  // Handle URL parameter for active category selection
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlSub = urlParams.get('sub');
      if (urlSub) {
        const decoded = decodeURIComponent(urlSub).trim();
        const match = categories.find(c => c.label.toLowerCase() === decoded.toLowerCase() || c.id === decoded.toLowerCase());
        setActive(match ? match.label : decoded);
      }
    } catch (err) {
      console.warn('Failed to parse URL parameters:', err);
    }
  }, []);

  useEffect(() => {
    setSelectedFilters(buildEmptyFilterState());
  }, [buildEmptyFilterState]);

  const toggleFilter = (category, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [category]: (prev[category] || []).includes(value)
        ? prev[category].filter(item => item !== value)
        : [...(prev[category] || []), value]
    }));
  };

  const setSortBy = (sortValue) => {
    setSelectedFilters(prev => ({ ...prev, sortBy: sortValue }));
  };

  const clearAllFilters = () => {
    setSelectedFilters(buildEmptyFilterState());
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

  const routeMap = {
    'All Cat Food': '/shop-for-cats/cat-food?sub=All%20Cat%20Food',
    'Dry Food': '/shop-for-cats/cat-food?sub=Dry%20Food',
    'Wet Food': '/shop-for-cats/cat-food?sub=Wet%20Food',
    'Grain Free Food': '/shop-for-cats/cat-food?sub=Grain%20Free%20Food',
    'Kitten Food': '/shop-for-cats/cat-food?sub=Kitten%20Food',
    'Hypoallergenic': '/shop-for-cats/cat-food?sub=Hypoallergenic',
    'Veterinary Food': '/shop-for-cats/cat-food?sub=Veterinary%20Food',
    'Supplements': '/shop-for-cats/cat-food?sub=Supplements'
  };

  // extend routeMap to include other cat category landing paths
  Object.assign(routeMap, {
    'Cat Treats': '/shop-for-cats/cat-treats',
    'Cat Litter & Supplies': '/shop-for-cats/cat-litter',
    'Cat Toys': '/shop-for-cats/cat-toys',
    'Trees, Beds & Scratchers': '/shop-for-cats/cat-bedding',
    'Cat Bowls': '/shop-for-cats/cat-bowls',
    'Cat Collars & Accessories': '/shop-for-cats/cat-collars',
    'Cat Grooming': '/shop-for-cats/cat-grooming'
  });

  const scrollTopLeft = () => { if (topRef.current) topRef.current.scrollBy({ left: -220, behavior: 'smooth' }); };
  const scrollTopRight = () => { if (topRef.current) topRef.current.scrollBy({ left: 220, behavior: 'smooth' }); };
  const leftRef = useRef(null);
  const rightRef = useRef(null);

  // Wheel handlers to keep wheel events scoped to the internal containers
  const handleLeftWheel = (e) => {
    const el = leftRef.current;
    if (!el) return;
    // if horizontal scroll or shift-key, scroll horizontally
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey) {
      el.scrollBy({ left: e.deltaX || e.deltaY, behavior: 'auto' });
    } else {
      // otherwise scroll vertically inside the left column
      el.scrollBy({ top: e.deltaY, behavior: 'auto' });
    }
    e.stopPropagation();
  };

  const handleRightWheel = (e) => {
    const el = rightRef.current;
    if (!el) return;
    // scroll the right content vertically
    el.scrollBy({ top: e.deltaY, behavior: 'auto' });
    e.stopPropagation();
  };

  // resolve API image urls
  const resolveImageUrl = (p) => {
    const candidate = p?.imageUrl || p?.image || p?.thumbnailUrl || p?.image_path;
    if (!candidate) return '/assets/images/no_image.png';
    if (/^(https?:)?\/\//i.test(candidate) || candidate.startsWith('data:')) return candidate;
    const base = apiClient?.defaults?.baseURL || '';
    return candidate.startsWith('/') ? `${base}${candidate}` : `${base}/${candidate}`;
  };

  // Load products from backend with enhanced URL parameter handling
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoadingProducts(true);
      try {
        // Enhanced URL parameter handling for all URL encoding formats
        const cleanUrlParam = (param) => {
          if (!param) return '';
          try {
            // First decode URI components (handles %20, %2C, %26, etc.)
            let decoded = decodeURIComponent(param);
            // Then handle + encoding for spaces (common in query parameters)
            decoded = decoded.replace(/\+/g, ' ');
            return decoded.trim();
          } catch (error) {
            // Fallback: if decoding fails, try basic replacements
            return param.replace(/\+/g, ' ').replace(/%20/g, ' ').replace(/%2C/g, ',').replace(/%26/g, '&').trim();
          }
        };
        
        // Create comprehensive category mapping for Cat Food
        const categoryMap = {
          'cat-food': 'Cat Food',
          'catfood': 'Cat Food',
          'food': 'Cat Food',
          'pet-food': 'Cat Food'
        };
        
        // Create subcategory mapping for better matching
        const subcategoryMap = {
          'all-cat-food': 'All Cat Food',
          'all': 'All Cat Food',
          'dry-food': 'Dry Food',
          'dry': 'Dry Food',
          'wet-food': 'Wet Food', 
          'wet': 'Wet Food',
          'grain-free': 'Grain Free Food',
          'grain-free-food': 'Grain Free Food',
          'grainfree': 'Grain Free Food',
          'kitten-food': 'Kitten Food',
          'kitten': 'Kitten Food',
          'veterinary-food': 'Veterinary Food',
          'vet': 'Veterinary Food',
          'veterinary': 'Veterinary Food',
          'supplements': 'Supplements',
          'supplement': 'Supplements'
        };
        
        // Get URL parameters from current page
        const urlParams = new URLSearchParams(window.location.search);
        const urlCategory = cleanUrlParam(urlParams.get('category')) || '';
        const urlSub = cleanUrlParam(urlParams.get('sub')) || '';
        
        const urlBrand = cleanUrlParam(urlParams.get('brand')) || '';
        console.log('CatFood: URL parameters - category:', urlCategory, 'sub:', urlSub, 'brand:', urlBrand);
        
        // Build API parameters with intelligent mapping
        let apiCategory = 'Cat Food'; // Always use Cat Food for this page
        let apiSubcategory = null;
        
        // Map URL category to backend category (but always use Cat Food for this page)
        if (urlCategory) {
          const cleanCategory = urlCategory.toLowerCase();
          if (categoryMap[cleanCategory]) {
            apiCategory = categoryMap[cleanCategory];
          } else if (cleanCategory.includes('food')) {
            apiCategory = 'Cat Food';
          }
        }
        
        // Map URL subcategory to backend subcategory
        if (urlSub && urlSub.trim()) {
          const cleanSub = urlSub.toLowerCase().trim();
          if (subcategoryMap[cleanSub]) {
            apiSubcategory = subcategoryMap[cleanSub];
          } else {
            // Use the cleaned subcategory directly
            apiSubcategory = urlSub.trim();
          }
        }
        
        // Also handle active pill state for subcategory filtering
        const finalSubcategory = apiSubcategory || (active && active !== 'All Cat Food' ? active : null);
        
        console.log('CatFood: API parameters - category:', apiCategory, 'sub:', finalSubcategory);
        
        // Request ALL Cat products from backend - filtering will be done on frontend
        const params = {
          type: 'Cat'
        };
        console.log('CatFood: Calling productApi.getCustomerProducts with params:', params);
        const apiData = await productApi.getCustomerProducts(params);
        console.log('CatFood: API response received:', (apiData || []).length, 'products');
        
        // Process and filter the products from API (same as DogFood.jsx)
        const normalizedProducts = (apiData || []).map((item) => {
          const { price, originalPrice } = normalizePrice(item);
          const apiVariants = Array.isArray(item?.variants) ? item.variants : [];
          const variants = apiVariants.length > 0
            ? apiVariants.map((v, idx) => ({
                id: v?.id || v?.variantId || v?.code || `variant-${idx}`,
                weight: v?.weight || v?.size || v?.label || `Option ${idx + 1}`,
                size: v?.size || v?.weight || v?.label || `Option ${idx + 1}`,
                label: v?.label || v?.weight || v?.size || `Option ${idx + 1}`,
                price: parseFloat(v?.price ?? item?.price ?? 0) || 0,
                originalPrice: parseFloat(v?.originalPrice ?? v?.mrp ?? item?.originalPrice ?? item?.mrp ?? v?.price ?? item?.price ?? 0) || 0,
                stock: v?.stock ?? null
              }))
            : [{ id: 'default', weight: item?.weight || 'Default', size: item?.size || 'Default', label: item?.weight || item?.size || 'Default', price: parseFloat(item?.price ?? 0) || 0, originalPrice: parseFloat(item?.originalPrice ?? item?.mrp ?? item?.price ?? 0) || 0, stock: item?.stock || item?.stockQuantity || null }];
          return {
            id: item?.id,
            name: item?.name || item?.title,
            category: item?.category || item?.categoryId || item?.subcategory || '',
            subcategory: item?.subcategory || '',
            brand: item?.brand || item?.manufacturer || 'Brand',
            price,
            original: originalPrice,
            image: resolveImageUrl(item),
            badges: item?.badges || [],
            variants,
            tags: item?.tags || [],
            lifeStage: item?.lifeStage || item?.age_group || '',
            breedSize: item?.breedSize || item?.breed || '',
            productType: item?.productType || item?.type || '',
            specialDiet: item?.specialDiet || '',
            proteinSource: item?.proteinSource || item?.protein || '',
            weight: item?.weight || ''
          };
        });
        
        // Filter server results defensively to ensure only food products are shown
        const foodProducts = normalizedProducts.filter(isFoodProduct);

        // Apply brand filter from URL if present (case-insensitive, matches product.brand)
        let filteredProducts = (foodProducts.length > 0 ? foodProducts : normalizedProducts);
        if (urlBrand) {
          const wanted = urlBrand.toLowerCase();
          filteredProducts = filteredProducts.filter(p => (p.brand || '').toLowerCase() === wanted);
        }

        // Mark that results are server-filtered when we have explicit category/sub
        setServerFiltered(Boolean(apiCategory) || Boolean(finalSubcategory));

        console.log('CatFood: normalized products:', normalizedProducts.length, 'food-classified:', foodProducts.length, 'after-brand-filter:', filteredProducts.length);

        if (filteredProducts.length > 0 && foodProducts.length > 0) {
          setProducts(filteredProducts);
          setFetchError('');
          console.log('CatFood: Loaded food products from database');
        } else if (foodProducts.length === 0 && normalizedProducts.length > 0) {
          // API returned items but none classified as food — show sample picks and warn in console
          console.warn('CatFood: API returned products but none classified as food. Falling back to featured picks.');
          setProducts(sampleProducts);
          setFetchError('No live cat food items found. Showing featured picks.');
        } else if (normalizedProducts.length === 0) {
          console.log('CatFood: No products found in database, using sample data');
          setProducts(sampleProducts);
          setFetchError('No live cat food items yet. Showing featured picks.');
        }
      } catch (error) {
        console.error('CatFood: Failed to load products', error);
        setFetchError(`Unable to reach live catalog: ${error.message}. Showing featured picks.`);
        setProducts(sampleProducts);
      } finally {
        setLoadingProducts(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, [active]);

  // Apply filters and category filtering
  useEffect(() => {
    if (products.length === 0) {
      setFilteredProducts([]);
      return;
    }

    // Frontend handles ALL filtering - match by category and subcategory names
    const pageCategory = 'Cat Food'; // This page's category
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
    
    // Step 3: Apply additional filters (brand, price, etc.)

    // Apply selected filters
    if ((selectedFilters.brands || []).length > 0) {
      working = working.filter(p => selectedFilters.brands.includes(p.brand));
    }

    if ((selectedFilters.catKitten || []).length > 0) {
      working = working.filter(p => selectedFilters.catKitten.some(ck =>
        String(p.lifeStage || '').toLowerCase().includes(ck.toLowerCase()) ||
        String(p.category || '').toLowerCase().includes(ck.toLowerCase())
      ));
    }

    if ((selectedFilters.lifeStages || []).length > 0) {
      working = working.filter(p => selectedFilters.lifeStages.some(ls =>
        String(p.lifeStage || '').toLowerCase().includes(ls.toLowerCase()) ||
        String(p.name || '').toLowerCase().includes(ls.toLowerCase())
      ));
    }

    if ((selectedFilters.breedSizes || []).length > 0) {
      working = working.filter(p => selectedFilters.breedSizes.some(bs =>
        String(p.breedSize || '').toLowerCase().includes(bs.toLowerCase()) ||
        String(p.name || '').toLowerCase().includes(bs.toLowerCase())
      ));
    }

    if ((selectedFilters.productTypes || []).length > 0) {
      working = working.filter(p => selectedFilters.productTypes.some(pt =>
        String(p.productType || '').toLowerCase().includes(pt.toLowerCase()) ||
        String(p.subcategory || '').toLowerCase().includes(pt.toLowerCase()) ||
        String(p.name || '').toLowerCase().includes(pt.toLowerCase())
      ));
    }

    if ((selectedFilters.specialDiets || []).length > 0) {
      working = working.filter(p => selectedFilters.specialDiets.some(sd =>
        String(p.specialDiet || '').toLowerCase().includes(sd.toLowerCase()) ||
        String(p.name || '').toLowerCase().includes(sd.toLowerCase()) ||
        (p.tags || []).some(tag => String(tag).toLowerCase().includes(sd.toLowerCase()))
      ));
    }

    if ((selectedFilters.proteinSource || []).length > 0) {
      working = working.filter(p => selectedFilters.proteinSource.some(ps =>
        String(p.proteinSource || '').toLowerCase().includes(ps.toLowerCase()) ||
        String(p.name || '').toLowerCase().includes(ps.toLowerCase())
      ));
    }

    if ((selectedFilters.priceRanges || []).length > 0) {
      working = working.filter(p => {
        const price = p.price || 0;
        return selectedFilters.priceRanges.some(range => {
          if (range === 'INR 10 - INR 300') return price >= 10 && price <= 300;
          if (range === 'INR 301 - INR 500') return price >= 301 && price <= 500;
          if (range === 'INR 501 - INR 1000') return price >= 501 && price <= 1000;
          if (range === 'INR 1000 - INR 2000') return price >= 1000 && price <= 2000;
          if (range === 'INR 2000+') return price > 2000;
          return true;
        });
      });
    }

    if ((selectedFilters.weights || []).length > 0) {
      working = working.filter(p => selectedFilters.weights.some(w =>
        String(p.weight || '').toLowerCase().includes(w.toLowerCase()) ||
        (p.variants || []).some(variant => String(variant).toLowerCase().includes(w.toLowerCase()))
      ));
    }

    if ((selectedFilters.subCategories || []).length > 0) {
      working = working.filter(p => selectedFilters.subCategories.some(sc =>
        String(p.subcategory || '').toLowerCase().includes(sc.toLowerCase()) ||
        String(p.category || '').toLowerCase().includes(sc.toLowerCase())
      ));
    }

    // Apply sorting
    switch (selectedFilters.sortBy) {
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
        // Featured - keep original order
        break;
    }

    setFilteredProducts(working);
  }, [products, selectedFilters, initialActive]);

  const displayedProducts = useMemo(() => {
    // If server already filtered, render as-is to avoid hiding valid items
    if (serverFiltered) return products;
    let filtered = products;
    if (active && active !== 'All Cat Food') {
      const activeFilter = active.toLowerCase();
      filtered = filtered.filter((product) => {
        const productSubcategory = (product.subcategory || '').toLowerCase();
        const productName = (product.name || '').toLowerCase();
        const productTags = (product.tags || []).map(tag => tag.toLowerCase());
        const productType = (product.productType || '').toLowerCase();
        const categoryMatchers = {
          'dry food': ['dry', 'kibble'],
          'wet food': ['wet', 'canned', 'pouch'],
          'grain free': ['grain free', 'grain-free', 'no grain'],
          'kitten food': ['kitten', 'junior', 'young'],
          'hypoallergenic': ['hypoallergenic', 'sensitive', 'limited ingredient'],
          'veterinary food': ['veterinary', 'prescription', 'therapeutic', 'vet'],
          'food toppers & gravy': ['topper', 'gravy', 'sauce', 'mix-in']
        };
        const matchers = categoryMatchers[activeFilter] || [activeFilter];
        return matchers.some(matcher => 
          productSubcategory.includes(matcher) ||
          productName.includes(matcher) ||
          productTags.some(tag => tag.includes(matcher)) ||
          productType.includes(matcher)
        );
      });
    }
    return filtered;
  }, [products, active, serverFiltered]);

  return (
    <>
      <Helmet>
        <title>Shop for Cats — Cat Food</title>
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
              {loadingProducts ? (
                <div className="col-span-full py-12 text-center text-muted-foreground">
                  Loading cat food products...
                </div>
              ) : displayedProducts.length > 0 ? (
                displayedProducts.map((product) => <ProductCard key={product.id} p={product} />)
              ) : (
                <div className="col-span-full py-12 text-center text-muted-foreground">
                  No cat food products match the selected filters yet.
                  {fetchError && <div className="text-xs mt-2 text-orange-600">{fetchError}</div>}
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
              <div className="text-xs text-muted-foreground">{displayedProducts.length} products</div>
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
                {sortOptions.map(option => {
                  const isSelected = selectedFilters.sortBy === option;
                  return (
                    <button
                      key={option}
                      onClick={() => setSortBy(option)}
                      className={`text-xs px-3 py-1 border border-border rounded ${isSelected ? 'bg-green-600 text-white border-green-600' : 'bg-white'}`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Brand & filter sections */}
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
                      const isSelected = (selectedFilters[section.id] || []).includes(option);
                      return (
                        <button
                          key={option}
                          onClick={() => toggleFilter(section.id, option)}
                          className={`text-xs px-3 py-1 border border-border rounded ${isSelected ? 'bg-green-600 text-white border-green-600' : 'bg-white'}`}
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

          {/* footer actions */}
          <div className="fixed bottom-0 right-0 left-auto w-full sm:w-96 bg-white border-t p-4 flex items-center justify-between">
            <button className="text-sm text-orange-500">Clear All</button>
            <button className="bg-orange-500 text-white px-5 py-2 rounded">Continue</button>
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

export default CatFood;
