import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import { useCart } from '../../contexts/CartContext';
import Footer from '../homepage/components/Footer';
import MobileBottomNav from '../../components/ui/MobileBottomNav';
import api from '../../services/api';
import dataService from '../../services/dataService';
import productApi from '../../services/productApi';
import { normalizePrice } from '../../utils/priceNormalization';

const categories = [
  { id: 'festive-special', label: 'Festive Special', img: '/assets/images/dog/dc2.webp' },
  { id: 't-shirts-dresses', label: 'T-Shirts & Dresses', img: '/assets/images/dog/dc3.webp' },
  { id: 'sweatshirts', label: 'Sweatshirts', img: '/assets/images/dog/dc4.webp' },
  { id: 'sweaters', label: 'Sweaters', img: '/assets/images/dog/dc5.webp' },
  { id: 'bow-ties-bandanas', label: 'Bow Ties & Bandanas', img: '/assets/images/dog/dc6.webp' },
  { id: 'raincoats', label: 'Raincoats', img: '/assets/images/dog/dc7.webp' },
  { id: 'shoes-socks', label: 'Shoes & Socks', img: '/assets/images/dog/dc8.webp' },
  { id: 'jackets', label: 'Jackets', img: '/assets/images/dog/dc9.webp' },
  { id: 'personalised', label: 'Personalised', img: '/assets/images/dog/dc10.webp' },
  { id: 'all', label: 'All Dog Clothing', img: '/assets/images/dog/dc1.webp' }
];

const sampleProducts = [
  { id: 'c1', name: 'Festive Kurta - Small', image: '/assets/images/dog/dc2.webp', badges: ['Festive'], variants: ['S','M','L'], price: 699, brand: 'Hearty', animal: 'Dog', lifeStage: 'Adult', breedSize: 'Small', productType: 'Clothing', specialDiet: null, proteinSource: null, weight: '300 g', size: 'Pack of 1', subCategory: 'Festive Special' },
  { id: 'c2', name: 'Striped T-Shirt', image: '/assets/images/clothing/tshirt1.webp', badges: ['Popular'], variants: ['XS','S','M'], price: 349, brand: 'Applaws', animal: 'Dog', lifeStage: 'Puppy', breedSize: 'Medium', productType: 'T-Shirt', specialDiet: null, proteinSource: null, weight: '200 g', size: 'Pack of 1', subCategory: 'T-Shirts & Dresses' },
  { id: 'c3', name: 'Warm Jacket', image: '/assets/images/clothing/jacket1.webp', badges: ['Warm'], variants: ['M','L'], price: 899, brand: 'Drools', animal: 'Dog', lifeStage: 'Adult', breedSize: 'Large', productType: 'Jacket', specialDiet: null, proteinSource: null, weight: '500 g', size: 'Pack of 1', subCategory: 'Jackets' }
];

const ProductCard = ({ p }) => {
  const [qty] = useState(1);
  return (
    <article className="bg-white rounded-lg border border-border overflow-hidden shadow-sm">
      <div className="p-3">
        <div className="h-8 flex items-center justify-start">
          <div className="bg-green-500 text-white text-xs px-3 py-1 rounded-t-md">{p.badges?.[0]}</div>
        </div>
        <div className="mt-3 h-44 flex items-center justify-center bg-[#f6f8fb] rounded">
          <img src={p.image} alt={p.name} className="max-h-40 object-contain" />
        </div>
        <h3 className="mt-3 text-sm font-semibold text-foreground">{p.name}</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {p.variants.map((v, i) => (
            <span key={i} className="text-xs px-2 py-1 border border-border rounded">{v}</span>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <div className="text-lg font-bold">₹{p.price.toFixed(2)}</div>
          </div>
          <button className="bg-orange-500 text-white px-4 py-2 rounded-full">Add</button>
        </div>
      </div>
    </article>
  );
};

export default function DogClothing({ initialActive = 'All Dog Clothing' }) {
  const [active, setActive] = useState(initialActive);
  const { getCartItemCount, cartItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const q = new URLSearchParams(location.search).get('sub') || new URLSearchParams(location.search).get('category');
      if (q) {
        const match = categories.find(c => c.label.toLowerCase() === q.toLowerCase() || c.id === q.toLowerCase());
        setActive(match ? match.label : q);
      }
    } catch (err) {}
  }, [location.search]);

  // Load products with enhanced URL parameter handling
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const cleanUrlParam = (param) => {
          if (!param) return '';
          try {
            let decoded = decodeURIComponent(param);
            return decoded.replace(/\+/g, ' ').trim();
          } catch (error) {
            return param.replace(/\+/g, ' ').replace(/%20/g, ' ').replace(/%2C/g, ',').replace(/%26/g, '&').trim();
          }
        };

        const categoryMap = {
          'dog-clothing': 'Dog Clothing & Accessories',
          'dogclothing': 'Dog Clothing & Accessories',
          'clothing': 'Dog Clothing & Accessories',
          'accessories': 'Dog Clothing & Accessories'
        };

        const subcategoryMap = {
          'all-dog-clothing': 'All Dog Clothing',
          'all': 'All Dog Clothing',
          'festive-special': 'Festive Special',
          'festive': 'Festive Special',
          't-shirts-dresses': 'T-Shirts & Dresses',
          'tshirts': 'T-Shirts & Dresses',
          'dresses': 'T-Shirts & Dresses',
          'sweatshirts': 'Sweatshirts',
          'sweatshirt': 'Sweatshirts',
          'sweaters': 'Sweaters',
          'sweater': 'Sweaters',
          'bow-ties-bandanas': 'Bow Ties & Bandanas',
          'bow-ties': 'Bow Ties & Bandanas',
          'bandanas': 'Bow Ties & Bandanas',
          'raincoats': 'Raincoats',
          'raincoat': 'Raincoats',
          'shoes-socks': 'Shoes & Socks',
          'shoes': 'Shoes & Socks',
          'socks': 'Shoes & Socks',
          'jackets': 'Jackets',
          'jacket': 'Jackets',
          'personalised': 'Personalised',
          'personalized': 'Personalised'
        };

        const urlParams = new URLSearchParams(location.search);
        const urlCategory = cleanUrlParam(urlParams.get('category')) || '';
        const urlSub = cleanUrlParam(urlParams.get('sub')) || '';

        let apiCategory = 'Dog Clothing & Accessories';
        let apiSubcategory = null;

        if (urlCategory) {
          const cleanCategory = urlCategory.toLowerCase();
          if (categoryMap[cleanCategory]) {
            apiCategory = categoryMap[cleanCategory];
          }
        }

        if (urlSub && urlSub.trim()) {
          const cleanSub = urlSub.toLowerCase().trim();
          if (subcategoryMap[cleanSub]) {
            apiSubcategory = subcategoryMap[cleanSub];
          } else {
            apiSubcategory = urlSub.trim();
          }
        }

        const finalSubcategory = apiSubcategory || (active && active !== 'All Dog Clothing' ? active : null);

        console.log('DogClothing: Fetching all Dog products');
        
        const response = await productApi.getCustomerProducts({ type: 'Dog'
        });
        const apiProducts = response?.data || [];

        const normalize = (p) => {
          const candidate = p?.imageUrl || p?.image || p?.thumbnailUrl || p?.image_path;
          const base = api?.defaults?.baseURL || '';
          const image = candidate ? (/(https?:)?\/(\/)/.test(candidate) || candidate.startsWith('data:') ? candidate : (candidate.startsWith('/') ? `${base}${candidate}` : `${base}/${candidate}`)) : '/assets/images/no_image.png';
          const { price, originalPrice } = normalizePrice(p);
          return {
            id: p?.id,
            name: p?.name || p?.title || 'Unnamed',
            image,
            badges: p?.badges || [],
            variants: p?.variants?.map(v => v?.weight || v?.label || v) || ['Default'],
            price,
            original: originalPrice,
            category: p?.category || '',
            subcategory: p?.subcategory || ''
          };
        };

        if (!mounted) return;
        const normalizedProducts = apiProducts.map(normalize);
        
        setProducts(normalizedProducts.length > 0 ? normalizedProducts : sampleProducts);
        console.log('DogClothing: Loaded', normalizedProducts.length, 'products');
        
      } catch (err) {
        console.error('Failed to load dog clothing products', err);
        if (mounted) setProducts(sampleProducts);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [active, location.search]);

  // Frontend filtering by category and subcategory
  useEffect(() => {
    if (products.length === 0) {
      setFilteredProducts([]);
      return;
    }

    const pageCategory = 'Dog Clothing & Accessories'; // This page's category
    const urlParams = new URLSearchParams(location.search);
    const urlSub = urlParams.get('sub');
    const norm = s => String(s||'').toLowerCase().trim();

    let working = products;
    
    // Filter by category
    working = working.filter(p => {
      const productCategory = norm(p.category || '');
      const targetCategory = norm(pageCategory);
      return productCategory === targetCategory || 
             productCategory.includes(targetCategory) ||
             targetCategory.includes(productCategory);
    });
    
    // Filter by subcategory if specified
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

  const routeMap = {
    'Festive Special': '/shop-for-dogs?category=dog-clothing&sub=Festive%20Special',
    'T-Shirts & Dresses': '/shop-for-dogs?category=dog-clothing&sub=T-Shirts%20%26%20Dresses',
    'Sweatshirts': '/shop-for-dogs?category=dog-clothing&sub=Sweatshirts',
    'Sweaters': '/shop-for-dogs?category=dog-clothing&sub=Sweaters',
    'Bow Ties & Bandanas': '/shop-for-dogs?category=dog-clothing&sub=Bow%20Ties%20%26%20Bandanas',
    'Raincoats': '/shop-for-dogs?category=dog-clothing&sub=Raincoats',
    'Shoes & Socks': '/shop-for-dogs?category=dog-clothing&sub=Shoes%20%26%20Socks',
    'Jackets': '/shop-for-dogs?category=dog-clothing&sub=Jackets',
    'Personalised': '/shop-for-dogs?category=dog-clothing&sub=Personalised',
    'All Dog Clothing': '/shop-for-dogs?category=dog-clothing&sub=All%20Dog%20Clothing'
  };

  const leftRef = useRef(null);
  const rightRef = useRef(null);
  const handleLeftWheel = (e) => { if (leftRef.current) { e.preventDefault(); leftRef.current.scrollTop += e.deltaY; } };
  const handleRightWheel = (e) => { if (rightRef.current) { e.preventDefault(); rightRef.current.scrollTop += e.deltaY; } };

  // top filter pills + drawer state
  const topFilters = ['Brand','Dog/Cat','Life Stage','Breed Size','Product Type','Special Diet','Protein Source','Price','Weight','Size','Sub Category'];
  const [selectedTopFilter, setSelectedTopFilter] = useState(topFilters[0]);
  const topRef = useRef(null);
  const scrollAmountRef = useRef(0);
  const [filterOpen, setFilterOpen] = useState(false);
  const drawerContentRef = useRef(null);
  const sectionRefs = useRef({});
  // compute scroll amount for pill container (show ~8 items)
  useEffect(() => {
    const update = () => {
      if (!topRef.current) return;
      const el = topRef.current;
      // target ~8 items visible of min width 140
      const itemMin = 140;
      const visible = Math.max(1, Math.floor(el.clientWidth / itemMin));
      const amount = Math.max(itemMin, Math.floor(el.clientWidth / Math.max(1, visible)));
      scrollAmountRef.current = Math.max(itemMin, amount);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const scrollPills = (dir = 'left') => {
    const el = topRef.current;
    if (!el) return;
    const amount = scrollAmountRef.current || Math.max(220, Math.floor(el.clientWidth * 0.6));
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
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
          setTimeout(() => el.classList.remove('section-highlight'), 1400);
        } catch (err) {}
      }
    };
    setTimeout(doScroll, 220);
  };

  // sample filter data
  const brands = ['Hearty','Royal Canin','Sara\'s','Farmina','Pedigree','Acana','Applaws','Drools'];
  const dogCat = ['Cat','Dog'];
  const lifeStages = ['Puppy','Adult','Senior'];
  const breedSizes = ['Small','Medium','Large','Giant'];
  const productTypes = ['Combo','Biscuits','Treat','Clothing','T-Shirt','Jacket'];
  const specialDiets = ['Gluten-Free','Grain Free'];
  const proteinSource = ['Chicken','Coconut','Egg','Fish','Fruits','Lamb','Milk','Vegetables'];
  const priceRanges = ['INR 10 - INR 300','INR 301 - INR 500','INR 501 - INR 1000','INR 1000 - INR 2000','INR 2000+'];
  const weights = ['200 g','300 g','500 g'];
  const sizes = ['Pack of 1','Pack of 2','Pack of 3','Pack of 5'];
  const subCategories = ['Festive Special','T-Shirts & Dresses','Jackets'];

  // selected filters: key -> Set(values)
  const [selectedFilters, setSelectedFilters] = useState(() => ({}));

  const toggleFilter = (key, value) => {
    setSelectedFilters(prev => {
      const copy = { ...prev };
      const setForKey = new Set(copy[key] || []);
      if (setForKey.has(value)) setForKey.delete(value);
      else setForKey.add(value);
      copy[key] = Array.from(setForKey);
      return copy;
    });
  };

  const clearFilters = () => setSelectedFilters({});

  // Apply additional filters (brand, price, etc.) on top of category/subcategory filtered products
  const displayedProducts = React.useMemo(() => {
    const keys = Object.keys(selectedFilters).filter(k => selectedFilters[k] && selectedFilters[k].length);
    if (!keys.length) return filteredProducts;
    return filteredProducts.filter(p => {
      for (const key of keys) {
        const values = selectedFilters[key];
        if (!values || !values.length) continue;
        let ok = false;
        // map UI keys to product properties
        if (key === 'Brand') ok = values.includes(p.brand);
        else if (key === 'Dog/Cat') ok = values.includes(p.animal);
        else if (key === 'Life Stage') ok = values.includes(p.lifeStage);
        else if (key === 'Breed Size') ok = values.includes(p.breedSize);
        else if (key === 'Product Type') ok = values.includes(p.productType);
        else if (key === 'Special Diet') ok = values.includes(p.specialDiet);
        else if (key === 'Protein Source') ok = values.includes(p.proteinSource);
        else if (key === 'Price') {
          // values are strings like 'INR 10 - INR 300'
          ok = values.some(v => {
            if (!p.price) return false;
            const parts = v.replace(/INR|\s/g, '').split('-');
            if (parts.length === 2) {
              const low = parseInt(parts[0]) || 0;
              const high = parseInt(parts[1]) || Number.MAX_SAFE_INTEGER;
              return p.price >= low && p.price <= high;
            }
            if (v.includes('+')) {
              const num = parseInt(v) || 0;
              return p.price >= num;
            }
            return false;
          });
        } else if (key === 'Weight') ok = values.includes(p.weight);
        else if (key === 'Size') ok = values.includes(p.size);
        else if (key === 'Sub Category') ok = values.includes(p.subCategory);
        else {
          // fallback: try matching property by lowercased key
          const prop = p[key?.toLowerCase?.()];
          if (Array.isArray(prop)) ok = prop.some(x => values.includes(x));
          else ok = values.includes(prop);
        }
        if (!ok) return false;
      }
      return true;
    });
  }, [selectedFilters, filteredProducts]);

  return (
    <div className="overflow-x-hidden pb-20 lg:pb-0">
      <Helmet>
        <title>{`Shop for Dogs — ${active} | PET&CO`}</title>
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
                onClick={() => scrollPills('left')}
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
                onClick={() => scrollPills('right')}
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
              <div className="col-span-full text-center py-8">Loading products...</div>
            ) : displayedProducts.length > 0 ? (
              displayedProducts.map(p=> (
                <ProductCard key={p.id} p={p} />
              ))
            ) : (
              <div className="col-span-full text-center py-8">No products found</div>
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
      {/* Footer (visible on all sizes). outer container has bottom padding to avoid
          the fixed mobile nav overlapping the footer on small screens */}
      <div>
        <Footer />
      </div>

      {/* Mobile bottom navigation for small screens */}
      <div className="lg:hidden">
        <MobileBottomNav />
      </div>
    </div>
  );
};