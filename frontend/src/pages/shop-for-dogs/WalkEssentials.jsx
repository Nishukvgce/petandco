import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import { useCart } from '../../contexts/CartContext';
import Footer from '../homepage/components/Footer';
import MobileBottomNav from '../../components/ui/MobileBottomNav';
import api from '../../services/api';
import productApi from '../../services/productApi';
import dataService from '../../services/dataService';
import { normalizePrice } from '../../utils/priceNormalization';


const categories = [
  { id: 'all', label: 'All Walk Essentials', img: '/assets/images/dog/walk_essentials_eae662d4-1b94-46f2-ba9d-d0338a125746.webp' },
  { id: 'collar', label: 'Collar', img: '/assets/images/dog/Fil_collar.webp' },
  { id: 'leash', label: 'Leash', img: '/assets/images/dog/Fil_leash.webp' },
  { id: 'harness', label: 'Harness', img: '/assets/images/dog/Fil_harness.webp' },
  { id: 'name-tags', label: 'Name Tags', img: '/assets/images/dog/Fil_nametags.webp' },
  { id: 'personalised', label: 'Personalised', img: '/assets/images/dog/Fil_personalised.webp' }
];

const sampleProducts = [
  { id: 'w1', name: 'Comfort Collar - Medium', image: '/assets/images/walk/collar1.webp', badges: ['Best Seller'], variants: ['S','M','L'], price: 299 },
  { id: 'w2', name: 'Reflective Leash', image: '/assets/images/walk/leash1.webp', badges: ['New'], variants: ['120 cm'], price: 349 },
  { id: 'w3', name: 'Soft Harness', image: '/assets/images/walk/harness1.webp', badges: ['Comfort'], variants: ['M','L'], price: 499 }
];

const ProductCard = ({p}) => {
  const [qty] = useState(1);
  return (
    <article className="bg-white rounded-lg border border-border overflow-hidden shadow-sm">
      <div className="p-2 md:p-3">
        {/* green badge */}
        <div className="h-6 flex items-center justify-start">
          <div className="bg-green-500 text-white text-[11px] px-2 py-0.5 rounded-t-md">{p.badges?.[0]}</div>
        </div>
        <div className="mt-2 h-36 md:h-44 flex items-center justify-center bg-[#f6f8fb] rounded">
          <img src={p.image} alt={p.name} className="max-h-32 md:max-h-40 object-contain" />
        </div>
        <h3 className="mt-2 text-xs md:text-sm font-semibold text-foreground">{p.name}</h3>

        {/* variant chips */}
        <div className="mt-2 flex flex-wrap gap-2">
          {p.variants.map((v,i)=>(
            <span key={i} className="text-[11px] px-2 py-0.5 border border-border rounded">{v}</span>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div>
            <div className="text-base md:text-lg font-bold">₹{p.price.toFixed(2)}</div>
            {p.original && <div className="text-sm text-muted-foreground line-through">₹{p.original}</div>}
          </div>
          <button className="bg-orange-500 text-white px-3 py-1.5 rounded-full text-sm">Add</button>
        </div>
      </div>
    </article>
  );
}
export default function WalkEssentials({ initialActive = 'All Walk Essentials' }) {
  const [active, setActive] = useState(initialActive);
  const { getCartItemCount, cartItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const q = new URLSearchParams(location.search).get('category');
      if (q) {
        const match = categories.find(c => c.label.toLowerCase() === q.toLowerCase());
        setActive(match ? match.label : q);
      }
    } catch (err) {}
  }, [location.search]);

  // Load products for the current walk-essentials section with enhanced URL parameter handling
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
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

        // Create comprehensive category mapping for Walk Essentials
        const categoryMap = {
          'walk-essentials': 'Walk Essentials',
          'walkessentials': 'Walk Essentials',
          'walk': 'Walk Essentials',
          'walking': 'Walk Essentials',
          'leash': 'Walk Essentials',
          'collar': 'Walk Essentials'
        };

        // Create subcategory mapping for better matching
        const subcategoryMap = {
          'all-walk-essentials': 'All Walk Essentials',
          'all': 'All Walk Essentials',
          'collar': 'Collar',
          'collars': 'Collar',
          'dog-collar': 'Collar',
          'leash': 'Leash',
          'leashes': 'Leash',
          'dog-leash': 'Leash',
          'harness': 'Harness',
          'harnesses': 'Harness',
          'dog-harness': 'Harness',
          'name-tags': 'Name Tags',
          'nametags': 'Name Tags',
          'tags': 'Name Tags',
          'id-tags': 'Name Tags',
          'personalised': 'Personalised',
          'personalized': 'Personalised',
          'custom': 'Personalised'
        };

        // Get URL parameters
        const urlParams = new URLSearchParams(location.search);
        const urlCategory = cleanUrlParam(urlParams.get('category')) || '';
        const urlSub = cleanUrlParam(urlParams.get('sub')) || '';

        console.log('WalkEssentials: URL parameters - category:', urlCategory, 'sub:', urlSub);

        // Build API parameters with intelligent mapping
        let apiCategory = 'Walk Essentials'; // Always use Walk Essentials for this page
        let apiSubcategory = null;

        // Map URL category to backend category (but always use Walk Essentials for this page)
        if (urlCategory) {
          const cleanCategory = urlCategory.toLowerCase();
          if (categoryMap[cleanCategory]) {
            apiCategory = categoryMap[cleanCategory];
          } else if (cleanCategory.includes('walk') || cleanCategory.includes('leash') || cleanCategory.includes('collar')) {
            apiCategory = 'Walk Essentials';
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

        // Also handle active pill state and pathname-based subcategory determination
        if (!apiSubcategory) {
          // determine sub param from pathname last segment or active label
          const parts = location.pathname.split('/').filter(Boolean);
          const last = parts[parts.length - 1] || '';
          // if last equals 'walk-essentials' then use active label
          if (last && last !== 'walk-essentials') {
            // map slug id to human label
            const found = categories.find(c => c.id === last || c.id === last.toLowerCase());
            apiSubcategory = found ? found.label : last.replace(/-/g, ' ');
          } else {
            apiSubcategory = (active && active !== 'All Walk Essentials') ? active : '';
          }
        }

        const finalSubcategory = apiSubcategory || (active && active !== 'All Walk Essentials' ? active : null);

        console.log('WalkEssentials: Fetching all Dog products');

        // Fetch all Dog products - filtering will be done on frontend
        const response = await productApi.getCustomerProducts({ type: 'Dog' });
        const apiProducts = response || [];

        const normalize = (p) => {
          const candidate = p?.imageUrl || p?.image || p?.thumbnailUrl || p?.image_path;
          const base = api?.defaults?.baseURL || '';
          const image = candidate ? (/(https?:)?\/\//i.test(candidate) || candidate.startsWith('data:') ? candidate : (candidate.startsWith('/') ? `${base}${candidate}` : `${base}/${candidate}`)) : '/assets/images/no_image.png';
          
          // Use centralized price normalization
          const { price, originalPrice } = normalizePrice(p);
          
          return {
            id: p?.id,
            name: p?.name || p?.title || 'Unnamed',
            image,
            badges: p?.badges || [],
            variants: p?.variants?.map(v => v?.weight || v?.label || v) || ['Default'], // Fixed: use p.variants instead of undefined variants
            price,
            original: originalPrice,
            brand: p?.brand || p?.manufacturer || '',
            category: p?.category || '',
            subcategory: p?.subcategory || p?.subcategoryLabel || ''
          };
        };

        if (!mounted) return;
        
        const normalizedProducts = apiProducts.map(normalize);
        
        if (mounted) {
          setProducts(normalizedProducts.length > 0 ? normalizedProducts : sampleProducts);
          console.log('WalkEssentials: Loaded', normalizedProducts.length, 'products');
        }
        
      } catch (err) {
        console.error('Failed to load walk essentials products', err);
        if (mounted) setProducts(sampleProducts); // Fallback to sample products on error
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [active, location.pathname, location.search]); // Added location.search to dependencies

  // Frontend filtering by category and subcategory
  useEffect(() => {
    if (products.length === 0) {
      setFilteredProducts([]);
      return;
    }

    // Frontend handles ALL filtering - match by category and subcategory names
    const pageCategory = 'Walk Essentials'; // This page's category
    const urlParams = new URLSearchParams(location.search);
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
    
    setFilteredProducts(working);
  }, [products, active, location.search]);

  const topFilters = ['Brand','Dog/Cat','Life Stage','Breed Size','Product Type','Special Diet','Protein Source','Price','Weight','Size','Sub Category'];
  const [selectedTopFilter, setSelectedTopFilter] = useState(topFilters[0]);
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
        try { el.classList.add('section-highlight'); setTimeout(() => el.classList.remove('section-highlight'), 1400); } catch (e) {}
      }
    };
    setTimeout(doScroll, 220);
  };

    // sample filter data for the drawer (walk essentials specific)
    const brands = ['Hearty','Royal Canin','Sara\'s','Farmina','Pedigree','Acana','Applaws','Drools'];
    const dogCat = ['Dog'];
    const lifeStages = ['Puppy','Adult','Senior'];
    const breedSizes = ['Small','Medium','Large','Giant'];
    const productTypes = ['Collar','Leash','Harness','Name Tags','ID Tags'];
    const specialDiets = ['Waterproof','Reflective','Padded'];
    const proteinSource = ['N/A'];
    const priceRanges = ['INR 10 - INR 300','INR 301 - INR 500','INR 501 - INR 1000','INR 1000 - INR 2000','INR 2000+'];
    const weights = ['Light','Medium','Heavy'];
    const sizes = ['XS','S','M','L','XL','XXL'];
    const subCategories = ['Collar','Leash','Harness','Name Tags','Personalised','Training Accessories'];

  const routeMap = {
    'All Walk Essentials': '/shop-for-dogs?category=walk-essentials&sub=All%20Walk%20Essentials',
    'Collar': '/shop-for-dogs?category=walk-essentials&sub=Collar',
    'Leash': '/shop-for-dogs?category=walk-essentials&sub=Leash',
    'Harness': '/shop-for-dogs?category=walk-essentials&sub=Harness',
    'Name Tags': '/shop-for-dogs?category=walk-essentials&sub=Name%20Tags',
    'Personalised': '/shop-for-dogs?category=walk-essentials&sub=Personalised'
  };

  const leftRef = useRef(null);
  const rightRef = useRef(null);
  const scrollAmountRef = useRef(0);

  const scrollTopLeft = () => {
    if (topRef.current) {
      const amount = scrollAmountRef.current || topRef.current.clientWidth || 800;
      topRef.current.scrollBy({ left: -amount, behavior: 'smooth' });
    }
  };

  const scrollTopRight = () => {
    if (topRef.current) {
      const amount = scrollAmountRef.current || topRef.current.clientWidth || 800;
      topRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };
  // update scroll amount to the visible width of the top pill container
  useEffect(() => {
    const update = () => {
      if (topRef.current) scrollAmountRef.current = topRef.current.clientWidth;
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  const handleLeftWheel = (e) => { if (leftRef.current) { e.preventDefault(); leftRef.current.scrollTop += e.deltaY; } };
  const handleRightWheel = (e) => { if (rightRef.current) { e.preventDefault(); rightRef.current.scrollTop += e.deltaY; } };

  return (
    <>
      <Helmet>
        <title>Shop for Dogs — Walk Essentials | PET&CO</title>
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
      <Header cartItemCount={getCartItemCount()} cartItems={cartItems} onSearch={() => {}} />

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
              {categories.map((c, idx)=> (
                <li key={c.id} className={`relative border-b ${active===c.label ? 'bg-[#fff6ee]' : ''}`}>
                  <button
                    onClick={() => { setActive(c.label); const p = routeMap[c.label]; if (p) navigate(p); }}
                    className="w-full text-center flex flex-col items-center gap-1 p-2 md:flex-row md:text-left md:items-center md:gap-3 md:p-4"
                  >
                    <div className={`w-12 h-12 rounded-full overflow-hidden flex items-center justify-center border ${active===c.label ? 'ring-2 ring-orange-400' : 'border-gray-100'}`}>
                      <img src={c.img} alt={c.label} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-xs md:text-sm font-medium text-gray-800 mt-1 md:mt-0">{c.label}</span>
                  </button>
                  {/* orange vertical accent on the right when active */}
                  {active===c.label && (
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
            ) : (filteredProducts && filteredProducts.length > 0 ? (
              filteredProducts.map(p => <ProductCard key={p.id} p={p} />)
            ) : (
              sampleProducts.map(p => <ProductCard key={p.id} p={p} />)
            ))}
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
              {['Featured','Best selling','Alphabetically, A-Z','Alphabetically, Z-A','Price, low to high','Price, high to low','Date, old to new','Date, new to old'].map(s=> (
                <button key={s} className="text-xs px-3 py-1 border border-border rounded bg-white">{s}</button>
              ))}
            </div>
          </section>

          {/* Brand */}
          <section ref={el => sectionRefs.current['Brand'] = el} className="mb-6">
            <h4 className="text-sm font-medium mb-3">Brand</h4>
            <div className="flex flex-wrap gap-2">
              {brands.map(b=> (<button key={b} className="text-xs px-3 py-1 border border-border rounded bg-white">{b}</button>))}
            </div>
          </section>

          {/* Dog/cat */}
          <section ref={el => sectionRefs.current['Dog/Cat'] = el} className="mb-6">
            <h4 className="text-sm font-medium mb-3">Dog/cat</h4>
            <div className="flex flex-wrap gap-2">{dogCat.map(d=> (<button key={d} className="text-xs px-3 py-1 border border-border rounded bg-white">{d}</button>))}</div>
          </section>

          {/* Life stage */}
          <section ref={el => sectionRefs.current['Life Stage'] = el} className="mb-6">
            <h4 className="text-sm font-medium mb-3">Life stage</h4>
            <div className="flex flex-wrap gap-2">{lifeStages.map(l=> (<button key={l} className="text-xs px-3 py-1 border border-border rounded bg-white">{l}</button>))}</div>
          </section>

          {/* Breed size */}
          <section ref={el => sectionRefs.current['Breed Size'] = el} className="mb-6">
            <h4 className="text-sm font-medium mb-3">Breed size</h4>
            <div className="flex flex-wrap gap-2">{breedSizes.map(b=> (<button key={b} className="text-xs px-3 py-1 border border-border rounded bg-white">{b}</button>))}</div>
          </section>

          {/* Product type */}
          <section ref={el => sectionRefs.current['Product Type'] = el} className="mb-6">
            <h4 className="text-sm font-medium mb-3">Product type</h4>
            <div className="flex flex-wrap gap-2">{productTypes.map(p=> (<button key={p} className="text-xs px-3 py-1 border border-border rounded bg-white">{p}</button>))}</div>
          </section>

          {/* Special diet */}
          <section ref={el => sectionRefs.current['Special Diet'] = el} className="mb-6">
            <h4 className="text-sm font-medium mb-3">Special diet</h4>
            <div className="flex flex-wrap gap-2">{specialDiets.map(s=> (<button key={s} className="text-xs px-3 py-1 border border-border rounded bg-white">{s}</button>))}</div>
          </section>

          {/* Protein source */}
          <section ref={el => sectionRefs.current['Protein Source'] = el} className="mb-6">
            <h4 className="text-sm font-medium mb-3">Protein source</h4>
            <div className="flex flex-wrap gap-2">{proteinSource.map(p=> (<button key={p} className="text-xs px-3 py-1 border border-border rounded bg-white">{p}</button>))}</div>
          </section>

          {/* Price */}
          <section ref={el => sectionRefs.current['Price'] = el} className="mb-6">
            <h4 className="text-sm font-medium mb-3">Price</h4>
            <div className="flex flex-wrap gap-2">{priceRanges.map(r=> (<button key={r} className="text-xs px-3 py-1 border border-border rounded bg-white">{r}</button>))}</div>
          </section>

          {/* Weight */}
          <section ref={el => sectionRefs.current['Weight'] = el} className="mb-6">
            <h4 className="text-sm font-medium mb-3">Weight</h4>
            <div className="flex flex-wrap gap-2">{weights.map(w=> (<button key={w} className="text-xs px-3 py-1 border border-border rounded bg-white">{w}</button>))}</div>
          </section>

          {/* Size */}
          <section ref={el => sectionRefs.current['Size'] = el} className="mb-6">
            <h4 className="text-sm font-medium mb-3">Size</h4>
            <div className="flex flex-wrap gap-2">{sizes.map(s=> (<button key={s} className="text-xs px-3 py-1 border border-border rounded bg-white">{s}</button>))}</div>
          </section>

          {/* Sub category */}
          <section ref={el => sectionRefs.current['Sub Category'] = el} className="mb-6">
            <h4 className="text-sm font-medium mb-3">Sub category</h4>
            <div className="flex flex-wrap gap-2">{subCategories.map(s=> (<button key={s} className="text-xs px-3 py-1 border border-border rounded bg-white">{s}</button>))}</div>
          </section>
        </div>

        {/* footer actions */}
        <div className="fixed bottom-0 right-0 left-auto w-full sm:w-96 bg-white border-t p-4 flex items-center justify-between">
          <button className="text-sm text-orange-500">Clear All</button>
          <button className="bg-orange-500 text-white px-5 py-2 rounded">Continue</button>
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
