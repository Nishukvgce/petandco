import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Star } from 'lucide-react';
import Header from '../../components/ui/Header';
import Footer from '../homepage/components/Footer';
import MobileBottomNav from '../../components/ui/MobileBottomNav';
import productApi from '../../services/productApi';
import { useCart } from '../../contexts/CartContext';
import apiClient from '../../services/api';

const toSlug = (s='') => s.toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
const normalizeBrand = (s='') => s.trim();

const BRAND_SYNONYMS = {
  'me-o': 'Me-O',
  'meo': 'Me-O',
  'royal-canin': 'Royal Canin',
  'whiskas': 'Whiskas',
  'pedigree': 'Pedigree',
  'nutriwag': 'NutriWag',
  'matisse': 'Matisse',
  'kennell-kitchen': 'Kennel Kitchen',
  'kennel-kitchen': 'Kennel Kitchen',
  'pro-plan': 'Pro Plan'
};

const resolveCanonicalBrand = (slugOrName='') => {
  const slug = toSlug(slugOrName);
  return BRAND_SYNONYMS[slug] || slugOrName;
};

const resolveImage = (product) => {
  let candidate = product?.images?.[0]?.url || product?.imageUrl || product?.image || '';
  if (!candidate) return '/assets/images/no_image.png';
  if (/^(https?:)?\/\//i.test(candidate) || candidate.startsWith('data:')) return candidate;
  if (/^[a-zA-Z]:\\/.test(candidate) || candidate.includes('\\')) {
    const parts = candidate.split(/\\|\//);
    candidate = parts[parts.length - 1];
  }
  if (/^[^/]+\.[a-zA-Z0-9]+$/.test(candidate)) candidate = `/admin/products/images/${candidate}`;
  const base = apiClient?.defaults?.baseURL || '';
  return candidate.startsWith('http') ? candidate : `${base}${candidate.startsWith('/') ? candidate : `/${candidate}`}`;
};

const ProductCard = ({ p }) => {
  const { addToCart } = useCart();
  const img = resolveImage(p);
  const name = p?.name || 'Unnamed Product';
  const brand = p?.brand || p?.metadata?.brand || '';
  const variants = Array.isArray(p?.variants) && p.variants.length ? p.variants : [{ id:'default', weight: p?.weight || p?.size || 'Default', price: p?.price ?? p?.mrp ?? 0, originalPrice: p?.originalPrice || p?.mrp }];
  const [idx, setIdx] = useState(0);
  const v = variants[idx] || variants[0];
  const currentPrice = Number(v?.price ?? p?.price ?? 0);
  const originalPrice = Number(v?.originalPrice ?? p?.originalPrice ?? 0);
  const discount = originalPrice > currentPrice ? Math.round(100 - (currentPrice / originalPrice) * 100) : 0;
  // Ratings: prefer backend-provided fields; avoid hard-coded fallback
  const ratingValue = (
    typeof p?.rating === 'number' ? p.rating :
    typeof p?.averageRating === 'number' ? p.averageRating :
    (p?.reviews && typeof p.reviews?.avg === 'number' ? p.reviews.avg : null)
  );
  const ratingCount = (
    typeof p?.ratingCount === 'number' ? p.ratingCount :
    (Array.isArray(p?.reviews) ? p.reviews.length :
      (p?.reviews && typeof p.reviews?.count === 'number' ? p.reviews.count : null))
  );
  const inStock = p?.inStock !== false;

  const onAdd = () => {
    try {
      addToCart({ id: p.id, productId: p.id, variantId: v?.id || `v${idx}`, name: p.name, variant: v?.weight || v?.size || '', price: currentPrice, image: img, category: p.category, subcategory: p.subcategory, brand: p.brand }, 1);
    } catch {}
  };

  return (
    <article className="bg-white rounded-lg border border-border overflow-hidden shadow hover:shadow-lg transition-shadow">
      <div className="p-3">
        <div className="relative">
          <div className="absolute top-2 left-2 z-20 flex flex-col gap-1">
            {discount > 0 && <div className="bg-red-600 text-white text-[11px] px-2 py-0.5 rounded">{discount}% OFF</div>}
          </div>
          <div className="mt-2 h-56 md:h-64 flex items-center justify-center bg-[#f6f8fb] rounded-lg overflow-hidden shadow-sm">
            {img && <img src={img} alt={name} className="max-h-56 md:max-h-64 object-contain relative z-0" onError={(e)=>{e.currentTarget.src='/assets/images/no_image.png';}} />}
            <Link to={`/product-full/${p.id}`} className="absolute inset-0 z-10" aria-label={`Open ${name} full page`} />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-sm font-semibold text-foreground line-clamp-2">{name}</h3>
          <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
            {brand && <span>by {brand}</span>}
            {p.subcategory && <span className="text-right">{p.subcategory}</span>}
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {ratingValue != null && (
                <div className="flex items-center text-yellow-500">
                  <Star size={14} />
                  <span className="text-sm text-foreground ml-1">{Number(ratingValue).toFixed(1)}</span>
                  {ratingCount != null && (
                    <span className="text-xs text-muted-foreground ml-2">({ratingCount})</span>
                  )}
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-lg font-bold">₹{currentPrice.toFixed(2)}</div>
              {originalPrice > currentPrice && (
                <div className="text-sm text-muted-foreground line-through">₹{originalPrice.toFixed(2)}</div>
              )}
            </div>
          </div>
          {variants.length > 1 && (
            <div className="mt-3">
              <div className="text-xs text-muted-foreground mb-2">Available sizes/weights:</div>
              <div className="flex flex-wrap gap-2">
                {variants.map((opt, i) => {
                  const label = opt?.weight || opt?.size || opt?.label || `#${i+1}`;
                  const pz = Number(opt?.price ?? currentPrice);
                  const active = i === idx;
                  return (
                    <button key={i} onClick={()=>setIdx(i)} className={`text-[12px] px-3 py-1 border rounded flex flex-col items-center ${active ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-foreground border-border hover:border-orange-300'}`}>
                      <span>{label}</span>
                      {!!pz && <span className="text-[10px] font-semibold">₹{pz.toFixed(0)}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          <div className="mt-4 flex items-center justify-between">
            <button onClick={onAdd} disabled={!inStock} className={`px-4 py-2 rounded-full text-sm shadow ${inStock ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
              {inStock ? 'Add to Cart' : 'Out of Stock'}
            </button>
            <Link to={`/product-full/${p.id}`} className="text-xs text-primary hover:underline ml-4">View details</Link>
          </div>
        </div>
      </div>
    </article>
  );
};

const BrandCollection = () => {
  const { brandSlug } = useParams();
  const [search] = useSearchParams();
  const select = search.get('brand') || brandSlug || '';
  const canonical = resolveCanonicalBrand(select);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [items, setItems] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        // Fetch in-stock products; filter by brand on client
        const data = await productApi.getCustomerProducts({});
        const norm = (v) => toSlug(normalizeBrand(v || ''));
        const wanted = toSlug(canonical);
        const filtered = (Array.isArray(data) ? data : []).filter(p => {
          const b = p?.brand || p?.metadata?.brand || (p?.filters?.brands?.[0]) || '';
          return norm(b) === wanted;
        });
        if (mounted) setItems(filtered);
      } catch (e) {
        setError(e.message || 'Failed to load products');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [canonical]);

  return (
    <>
      <Helmet>
        <title>{canonical ? `${canonical} — Shop by Brand | PET&CO` : 'Shop by Brand | PET&CO'}</title>
        <meta name="description" content={`Discover ${canonical} products at PET&CO`} />
      </Helmet>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground">{canonical}</h1>
            <Link to="/" className="text-primary text-sm hover:underline">Back to Home</Link>
          </div>
          {error && <div className="text-red-600 mb-4">{error}</div>}
          {loading ? (
            <div className="text-muted-foreground">Loading products…</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {items.map(p => (
                <ProductCard key={p.id} p={p} />
              ))}
              {items.length === 0 && (
                <div className="col-span-full text-muted-foreground">No products found for this brand.</div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
      <MobileBottomNav />
    </>
  );
};

export default BrandCollection;
