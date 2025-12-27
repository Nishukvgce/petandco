import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from '../../../components/ui/Header';
import MobileBottomNav from '../../../components/ui/MobileBottomNav';
import { useCart } from '../../../contexts/CartContext';
import productApi from '../../../services/productApi';
import dataService from '../../../services/dataService';

const categories = [
  { id: 'brushes-combs', label: 'Brushes & Combs', img: '/assets/images/dog/dg1.webp' },
  { id: 'dry-bath-wipes-perfume', label: 'Dry Bath, Wipes & Perfume', img: '/assets/images/dog/dg2.webp' },
  { id: 'ear-eye-pawcare', label: 'Ear, Eye & PawCare', img: '/assets/images/dog/dg3.webp' },
  { id: 'oral-care', label: 'Oral Care', img: '/assets/images/dog/dg4.webp' },
  { id: 'shampoo-conditioner', label: 'Shampoo & Conditioner', img: '/assets/images/dog/dg5.webp' },
  { id: 'tick-flea-control', label: 'Tick & Flea Control', img: '/assets/images/dog/dg6.webp' },
  { id: 'all-dog-grooming', label: 'All Dog Grooming', img: '/assets/images/dog/dg7.webp' }
];

const ProductCard = ({ p }) => {
  const [qty] = useState(1);
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
          {p.variants?.map((v, i) => (
            <span key={i} className="text-[11px] px-2 py-0.5 border border-border rounded">{v}</span>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div>
            <div className="text-base md:text-lg font-bold">₹{(p.price || 0).toFixed(2)}</div>
            {p.original && <div className="text-sm text-muted-foreground line-through">₹{p.original}</div>}
          </div>
          <button className="bg-orange-500 text-white px-3 py-1.5 rounded-full text-sm">Add</button>
        </div>
      </div>
    </article>
  );
};

export default function DogGrooming() {
  const [active, setActive] = useState(categories[0].label);
  const { getCartItemCount, cartItems } = useCart();
  const navigate = useNavigate();

  const leftRef = useRef(null);
  const rightRef = useRef(null);
  const handleLeftWheel = (e) => { if (leftRef.current) { e.preventDefault(); leftRef.current.scrollTop += e.deltaY; } };
  const handleRightWheel = (e) => { if (rightRef.current) { e.preventDefault(); rightRef.current.scrollTop += e.deltaY; } };

  const routeMap = {
    'Brushes & Combs': '/shop-for-dogs/dog-grooming/brushes-combs',
    'Dry Bath, Wipes & Perfume': '/shop-for-dogs/dog-grooming/dry-bath-wipes-perfume',
    'Ear, Eye & PawCare': '/shop-for-dogs/dog-grooming/ear-eye-pawcare',
    'Oral Care': '/shop-for-dogs/dog-grooming/oral-care',
    'Shampoo & Conditioner': '/shop-for-dogs/dog-grooming/shampoo-conditioner',
    'Tick & Flea Control': '/shop-for-dogs/dog-grooming/tick-flea-control',
    'All Dog Grooming': '/shop-for-dogs/dog-grooming/all-dog-grooming'
  };

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  const topFilters = ['Brand','Dog/Cat','Life Stage','Breed Size','Product Type','Special Diet','Protein Source','Price','Weight','Size','Sub Category'];
  const [selectedTopFilter, setSelectedTopFilter] = useState(topFilters[0]);
  const topRef = useRef(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const drawerContentRef = useRef(null);
  const sectionRefs = useRef({});

  const [selectedFilters, setSelectedFilters] = useState({
    brands: [], catKitten: [], lifeStages: [], breedSizes: [], productTypes: [], specialDiets: [], proteinSource: [], priceRanges: [], weights: [], sizes: [], subCategories: [], sortBy: ''
  });

  const toggleFilter = (category, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(value) ? prev[category].filter(item => item !== value) : [...prev[category], value]
    }));
  };

  const clearAllFilters = () => {
    setSelectedFilters({
      brands: [], catKitten: [], lifeStages: [], breedSizes: [], productTypes: [], specialDiets: [], proteinSource: [], priceRanges: [], weights: [], sizes: [], subCategories: [], sortBy: ''
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
        try { el.classList.add('section-highlight'); setTimeout(() => el.classList.remove('section-highlight'), 1400); } catch (err) {}
      }
    };
    setTimeout(doScroll, 220);
  };

  const brands = ['Hearty','Royal Canin','Drools','Pedigree','Farmina'];
  const dogCat = ['Dog'];
  const lifeStages = ['Puppy','Adult','Senior'];
  const breedSizes = ['Small','Medium','Large','Giant'];
  const productTypes = ['Brushes & Combs','Dry Bath & Wipes','Oral Care','Shampoo & Conditioner','Tick & Flea'];
  const specialDiets = ['Fragrance-Free','Hypoallergenic'];
  const proteinSource = ['N/A'];
  const priceRanges = ['INR 10 - INR 300','INR 301 - INR 500','INR 501 - INR 1000','INR 1000+'];
  const weights = ['Light','Medium','Heavy'];
  const sizes = ['One Size','Small','Medium','Large'];
  const subCategories = ['Brushes & Combs','Dry Bath, Wipes & Perfume','Ear, Eye & PawCare','Oral Care','Shampoo & Conditioner','Tick & Flea Control'];

  const scrollTopLeft = () => { if (topRef.current) topRef.current.scrollBy({ left: -220, behavior: 'smooth' }); };
  const scrollTopRight = () => { if (topRef.current) topRef.current.scrollBy({ left: 220, behavior: 'smooth' }); };

  const resolveImageUrl = (p) => {
    const candidate = p?.imageUrl || p?.image || p?.thumbnailUrl || p?.image_path;
    if (!candidate) return '/assets/images/no_image.png';
    if (/^(https?:)?\/\//i.test(candidate) || candidate.startsWith('data:')) return candidate;
    const base = '';
    return candidate.startsWith('/') ? `${base}${candidate}` : `${base}/${candidate}`;
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        let apiProducts = [];
        try { const res = await (productApi?.getAll?.()); apiProducts = Array.isArray(res) ? res : res?.data || []; } catch (e) { const r = await dataService.getProducts(); apiProducts = r?.data || []; }

        const normalized = apiProducts.map(p => ({
          id: p?.id,
          name: p?.name || p?.title,
          category: p?.category || p?.categoryId || p?.subcategory || '',
          subcategory: p?.subcategory || '',
          brand: p?.brand || p?.manufacturer || 'Brand',
          price: parseFloat(p?.price ?? p?.salePrice ?? 0) || 0,
          original: parseFloat(p?.originalPrice ?? p?.mrp ?? p?.price ?? 0) || 0,
          image: resolveImageUrl(p),
          badges: p?.badges || [],
          variants: p?.variants?.map(v => v?.weight || v?.label) || ['Default'],
          tags: p?.tags || [],
          lifeStage: p?.lifeStage || p?.age_group || '',
          breedSize: p?.breedSize || p?.breed || '',
          productType: p?.productType || p?.type || '',
          specialDiet: p?.specialDiet || '',
          proteinSource: p?.proteinSource || p?.protein || '',
          weight: p?.weight || '',
          size: p?.size || ''
        }));

        if (!mounted) return;
        setProducts(normalized);
      } catch (err) { console.error('Failed to load grooming products', err); setProducts([]); }
    };
    load();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (products.length === 0) return;
    const target = (active || '').toLowerCase().replace(/\s+/g,'-');
    const norm = s => String(s||'').toLowerCase().replace(/\s+/g,'-').replace(/[^\w-]/g,'');

    let working = products.filter(p => {
      const c = norm(p.category) || '';
      const sc = norm(p.subcategory) || '';
      return c.includes('groom') || sc.includes('groom') || c === target || sc === target || true;
    });
    // apply selected filters (minimal)
    setFilteredProducts(working);
  }, [products, selectedFilters, active]);

  return (
    <>
      <Helmet>
        <title>Shop for Dogs — Grooming | PET&CO</title>
      </Helmet>
      <Header cartItemCount={getCartItemCount()} cartItems={cartItems} onSearch={() => {}} />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-12 gap-3 md:gap-6">
          <aside className="col-span-3 lg:col-span-3 xl:col-span-2">
            <div ref={leftRef} onWheel={handleLeftWheel} className="bg-white rounded border border-border overflow-hidden thin-gold-scroll" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 220px)' }}>
              <ul className="divide-y">
                {categories.map((c) => (
                  <li key={c.id} className={`relative border-b ${active === c.label ? 'bg-[#fff6ee]' : ''}`}>
                    <button onClick={() => { setActive(c.label); const p = routeMap[c.label]; if (p) navigate(p); }} className="w-full text-center flex flex-col items-center gap-1 p-2 md:flex-row md:text-left md:items-center md:gap-3 md:p-4">
                      <div className={`w-12 h-12 rounded-full overflow-hidden flex items-center justify-center border ${active === c.label ? 'ring-2 ring-orange-400' : 'border-gray-100'}`}>
                        <img src={c.img} alt={c.label} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-xs md:text-sm font-medium text-gray-800 mt-1 md:mt-0">{c.label}</span>
                    </button>
                    {active === c.label && <div className="absolute right-0 top-0 h-full w-1 bg-orange-400" />}
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <main ref={rightRef} onWheel={handleRightWheel} className="col-span-9 lg:col-span-9 xl:col-span-10" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 220px)' }}>
            <div className="mb-4 flex items-center justify-between">
              <div className="relative flex-1 overflow-hidden">
                <button onClick={scrollTopLeft} aria-label="Scroll left" className="top-scroll-btn hidden md:inline-flex items-center justify-center border border-border bg-white ml-1 mr-2 absolute left-0 top-1/2 transform -translate-y-1/2 z-10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>

                <div ref={topRef} className="hide-scrollbar overflow-x-auto pl-10 pr-10" style={{ whiteSpace: 'nowrap' }}>
                  <div className="inline-flex items-center gap-2">
                    {topFilters.map((t) => (
                      <button key={t} onClick={() => openFilterAndScroll(t)} className={`flex items-center gap-2 text-sm px-3 py-1 border border-border rounded-full bg-white ${selectedTopFilter === t ? 'ring-1 ring-orange-300' : ''}`} style={{ whiteSpace: 'nowrap' }}>
                        {selectedTopFilter === t ? <span className="inline-flex items-center justify-center w-4 h-4 bg-gray-100 rounded-sm"><span className="w-2 h-2 bg-green-500 rounded" /></span> : <span className="inline-flex items-center justify-center w-4 h-4 bg-transparent rounded-sm" />}
                        <span>{t}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={scrollTopRight} aria-label="Scroll right" className="top-scroll-btn hidden md:inline-flex items-center justify-center border border-border bg-white ml-2 mr-1 absolute right-0 top-1/2 transform -translate-y-1/2 z-10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {(filteredProducts.length ? filteredProducts : []).map(p => <ProductCard key={p.id} p={p} />)}
            </div>
          </main>
        </div>
      </div>

      <div aria-hidden={!filterOpen} className={`fixed inset-0 z-50 pointer-events-none ${filterOpen ? '' : ''}`}>
        <div onClick={() => setFilterOpen(false)} className={`absolute inset-0 bg-black/40 transition-opacity ${filterOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0'}`} />
        <aside role="dialog" aria-modal="true" className={`fixed top-0 right-0 h-full bg-white w-full sm:w-96 shadow-xl transform transition-transform pointer-events-auto ${filterOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex items-center justify-between p-4 border-b">
            <div>
              <div className="text-sm font-semibold">Filter</div>
              <div className="text-xs text-muted-foreground">{(filteredProducts.length || products.length) + ' products'}</div>
            </div>
            <div>
              <button onClick={() => setFilterOpen(false)} className="p-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 011.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg></button>
            </div>
          </div>
          <div ref={drawerContentRef} className="px-4 pt-4 pb-32 hide-scrollbar overflow-y-auto" style={{ maxHeight: 'calc(100vh - 140px)' }}>
            <section className="mb-6"><h4 className="text-sm font-medium mb-3">Sort By</h4><div className="flex flex-wrap gap-2">{['Featured','Best selling','Alphabetically, A-Z','Alphabetically, Z-A','Price, low to high','Price, high to low','Date, old to new','Date, new to old'].map(s=> <button key={s} className="text-xs px-3 py-1 border border-border rounded bg-white">{s}</button>)}</div></section>
            <section ref={el => sectionRefs.current['Brand'] = el} className="mb-6"><h4 className="text-sm font-medium mb-3">Brand</h4><div className="flex flex-wrap gap-2">{brands.map(b=> (<button key={b} className="text-xs px-3 py-1 border border-border rounded bg-white">{b}</button>))}</div></section>
            <section ref={el => sectionRefs.current['Dog/Cat'] = el} className="mb-6"><h4 className="text-sm font-medium mb-3">Dog/cat</h4><div className="flex flex-wrap gap-2">{dogCat.map(d=> (<button key={d} className="text-xs px-3 py-1 border border-border rounded bg-white">{d}</button>))}</div></section>
            <section ref={el => sectionRefs.current['Life Stage'] = el} className="mb-6"><h4 className="text-sm font-medium mb-3">Life stage</h4><div className="flex flex-wrap gap-2">{lifeStages.map(l=> (<button key={l} className="text-xs px-3 py-1 border border-border rounded bg-white">{l}</button>))}</div></section>
            <section ref={el => sectionRefs.current['Breed Size'] = el} className="mb-6"><h4 className="text-sm font-medium mb-3">Breed size</h4><div className="flex flex-wrap gap-2">{breedSizes.map(b=> (<button key={b} className="text-xs px-3 py-1 border border-border rounded bg-white">{b}</button>))}</div></section>
            <section ref={el => sectionRefs.current['Product Type'] = el} className="mb-6"><h4 className="text-sm font-medium mb-3">Product type</h4><div className="flex flex-wrap gap-2">{productTypes.map(p=> (<button key={p} className="text-xs px-3 py-1 border border-border rounded bg-white">{p}</button>))}</div></section>
            <section ref={el => sectionRefs.current['Price'] = el} className="mb-6"><h4 className="text-sm font-medium mb-3">Price</h4><div className="flex flex-wrap gap-2">{priceRanges.map(r=> (<button key={r} className="text-xs px-3 py-1 border border-border rounded bg-white">{r}</button>))}</div></section>
            <section ref={el => sectionRefs.current['Weight'] = el} className="mb-6"><h4 className="text-sm font-medium mb-3">Weight</h4><div className="flex flex-wrap gap-2">{weights.map(w=> (<button key={w} className="text-xs px-3 py-1 border border-border rounded bg-white">{w}</button>))}</div></section>
            <section ref={el => sectionRefs.current['Size'] = el} className="mb-6"><h4 className="text-sm font-medium mb-3">Size</h4><div className="flex flex-wrap gap-2">{sizes.map(s=> (<button key={s} className="text-xs px-3 py-1 border border-border rounded bg-white">{s}</button>))}</div></section>
            <section ref={el => sectionRefs.current['Sub Category'] = el} className="mb-6"><h4 className="text-sm font-medium mb-3">Sub category</h4><div className="flex flex-wrap gap-2">{subCategories.map(s=> (<button key={s} className="text-xs px-3 py-1 border border-border rounded bg-white">{s}</button>))}</div></section>
          </div>
          <div className="fixed bottom-0 right-0 left-auto w-full sm:w-96 bg-white border-t p-4 flex items-center justify-between">
            <button onClick={clearAllFilters} className="text-sm text-orange-500">Clear All</button>
            <button className="bg-orange-500 text-white px-5 py-2 rounded">Continue</button>
          </div>
        </aside>
      </div>
      <MobileBottomNav />
    </>
  );
}


