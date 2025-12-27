import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import Header from '../../components/ui/Header';
import Footer from '../homepage/components/Footer';
import MobileBottomNav from '../../components/ui/MobileBottomNav';
import Icon from '../../components/AppIcon';
import productApi from '../../services/productApi';
import apiClient from '../../services/api';
import { useCart } from '../../contexts/CartContext';

const resolveImage = (product) => {
  // Prefer images array, then explicit URL, then filename -> server path
  let candidate = product?.images?.[0]?.url || product?.imageUrl || product?.image || '';
  if (!candidate) return '/assets/images/no_image.png';
  if (/^(https?:)?\/\//i.test(candidate) || candidate.startsWith('data:')) return candidate;
  // If Windows-like or plain filename, map to admin images route
  if (/^[a-zA-Z]:\\/.test(candidate) || candidate.includes('\\')) {
    const parts = candidate.split(/\\|\//);
    candidate = parts[parts.length - 1];
  }
  if (/^[^/]+\.[a-zA-Z0-9]+$/.test(candidate)) {
    candidate = `/admin/products/images/${candidate}`;
  }
  const base = apiClient?.defaults?.baseURL || '';
  return candidate.startsWith('http') ? candidate : `${base}${candidate.startsWith('/') ? candidate : `/${candidate}`}`;
};

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const img = resolveImage(product);
  const name = product?.name || 'Unnamed Product';
  const brand = product?.brand || '';
  const rating = product?.rating || 4.5;
  const variants = Array.isArray(product?.variants) && product.variants.length > 0
    ? product.variants
    : [{ id: 'default', weight: product?.weight || product?.size || 'Default', price: product?.price ?? product?.mrp ?? 0, originalPrice: product?.originalPrice || product?.mrp }];
  const [variantIdx, setVariantIdx] = useState(0);
  const v = variants[variantIdx] || variants[0];
  const currentPrice = Number(v?.price ?? product?.price ?? 0);
  const originalPrice = Number(v?.originalPrice ?? product?.originalPrice ?? 0);
  const discount = originalPrice > currentPrice ? Math.round(100 - (currentPrice / originalPrice) * 100) : 0;
  const inStock = product?.inStock !== false;

  const onAdd = () => {
    try {
      const variantLabel = v?.weight || v?.size || v?.label || '';
      addToCart({
        id: product.id,
        productId: product.id,
        variantId: v?.id || `v${variantIdx}`,
        name: product.name,
        variant: variantLabel,
        price: currentPrice,
        image: img,
        category: product.category,
        subcategory: product.subcategory,
        brand: product.brand
      }, 1);
    } catch (e) {
      console.warn('Add to cart failed', e);
    }
  };

  return (
    <article className="bg-white rounded-lg border border-border overflow-hidden shadow hover:shadow-lg transition-shadow">
      <div className="p-3">
        <div className="relative">
          <div className="absolute top-2 left-2 z-20 flex flex-col gap-1">
            {discount > 0 && (
              <div className="bg-red-600 text-white text-[11px] px-2 py-0.5 rounded">{discount}% OFF</div>
            )}
            <div className="bg-amber-500 text-white text-[11px] px-2 py-0.5 rounded">OUTLET</div>
            {!inStock && (
              <div className="bg-gray-500 text-white text-[11px] px-2 py-0.5 rounded">Out of Stock</div>
            )}
          </div>
          <div className="mt-2 h-56 md:h-64 flex items-center justify-center bg-[#f6f8fb] rounded-lg overflow-hidden shadow-sm">
            {img && <img src={img} alt={name} className="max-h-56 md:max-h-64 object-contain relative z-0" onError={(e)=>{e.currentTarget.src='/assets/images/no_image.png';}} />}
            <Link to={`/product-full/${product.id}`} className="absolute inset-0 z-10" aria-label={`Open ${name} full page`} />
          </div>
        </div>

        <div className="mt-3">
          <h3 className="text-sm font-semibold text-foreground line-clamp-2">{name}</h3>
          <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
            {brand && <span>by {brand}</span>}
            {(product?.subcategory || product?.sub) && (
              <span className="text-right">{product.subcategory || product.sub}</span>
            )}
          </div>

          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center text-yellow-500">
                <Star size={14} />
                <span className="text-sm text-foreground ml-1">{rating}</span>
              </div>
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
                  const p = Number(opt?.price ?? currentPrice);
                  const active = i === variantIdx;
                  return (
                    <button key={i} onClick={() => setVariantIdx(i)}
                      className={`text-[12px] px-3 py-1 border rounded flex flex-col items-center ${active ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-foreground border-border hover:border-orange-300'}`}>
                      <span>{label}</span>
                      {!!p && <span className="text-[10px] font-semibold">₹{p.toFixed(0)}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between">
            <button onClick={onAdd} disabled={!inStock}
              className={`px-4 py-2 rounded-full text-sm shadow ${inStock ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
              {inStock ? 'Add to Cart' : 'Out of Stock'}
            </button>
            <Link to={`/product-full/${product.id}`} className="text-xs text-primary hover:underline ml-4">View details</Link>
          </div>
        </div>
      </div>
    </article>
  );
};

const PetCoOutletPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('All');
  const sidebarItems = [
    {
      key: 'All',
      label: 'All Products',
      img: '/assets/images/essential/all%20dog%20food.webp'
    },
    {
      key: 'Food',
      label: 'Food',
      img: '/assets/images/essential/dry%20food.webp'
    },
    {
      key: 'Toys',
      label: 'Toys',
      img: '/assets/images/essential/toys.png'
    },
    {
      key: 'Training Material',
      label: 'Training Material',
      img: '/assets/images/essential/walk%20essentials.png'
    }
  ];

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        console.log('PetCoOutlet: Loading products with type-based filtering for section:', activeSection);
        
        // Map sidebar to subcategory and query backend with type first, then category/subcategory
        const subMap = {
          All: null,
          Food: 'food',
          Toys: 'toys',
          'Training Material': 'training'
        };
        const sub = subMap[activeSection] || null;
        const params = { type: 'Outlet', sub };
        
        console.log('PetCoOutlet: API parameters:', params);
        const res = await productApi.getCustomerProducts(params);
        const all = Array.isArray(res) ? res : [];
        
        console.log('PetCoOutlet: Received', all.length, 'outlet products from database');
        if (mounted) setProducts(all);
      } catch (e) {
        console.error('PetCoOutlet: Failed to load products:', e);
        setError(e.message || 'Failed to load outlet products');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [activeSection]);

  return (
    <>
      <Helmet>
        <title>PET&CO Outlet | PET&CO</title>
        <meta name="description" content="Explore curated products available at the PET&CO Outlet. In-store availability and exclusive offers." />
      </Helmet>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="bg-gradient-to-r from-sky-100 to-indigo-100 p-6">
              <div className="flex items-center gap-3 mb-2">
                <Icon name="Store" size={28} className="text-sky-700" />
                <h1 className="text-3xl font-heading font-bold text-gray-800">PET&CO Outlet</h1>
              </div>
              <p className="text-sm text-gray-700 max-w-3xl">
                Visit our physical outlet for premium pet supplies and exclusive in-store offers.
              </p>
            </div>
            <div className="p-6">
              {error && (
                <div className="text-red-600 mb-4">{error}</div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar */}
                <aside className="lg:col-span-1">
                  <div className="bg-white border border-border rounded-lg overflow-hidden">
                    <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                      <Icon name="List" size={18} className="text-primary" />
                      <span className="font-semibold text-foreground">Outlet Categories</span>
                    </div>
                    <nav className="p-2 space-y-2">
                      {sidebarItems.map((item) => {
                        const isActive = activeSection === item.key;
                        return (
                          <button
                            key={item.key}
                            onClick={() => setActiveSection(item.key)}
                            className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 border ${isActive ? 'bg-[#fff6e6] border-orange-300' : 'bg-white border-border hover:bg-muted'}`}
                          >
                            <div className={`w-10 h-10 rounded-full overflow-hidden ring-2 bg-muted ${isActive ? 'ring-orange-400' : 'ring-transparent'}`}>
                              <img src={item.img} alt={item.label} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                              {!item.img && (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Icon name="CircleAlert" size={18} className="text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div className={`text-sm font-medium ${isActive ? 'text-foreground' : 'text-foreground'}`}>{item.label}</div>
                          </button>
                        );
                      })}
                    </nav>
                  </div>
                </aside>

                {/* Products Grid */}
                <section className="lg:col-span-3">
                  {loading ? (
                    <div className="text-muted-foreground">Loading products...</div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {products
                        .filter((p) => {
                          if (activeSection === 'All') return true;
                          const name = String(p?.name || p?.title || '').toLowerCase();
                          const category = String(p?.category || p?.subcategory || p?.collection || '').toLowerCase();
                          const breadcrumbs = String(p?.breadcrumbs || '').toLowerCase();
                          const combine = `${name} ${category} ${breadcrumbs}`;
                          if (activeSection === 'Food') return /(food|meal|diet|treat|gravy|wet|dry)/.test(combine);
                          if (activeSection === 'Toys') return /(toy|ball|chew|rope|plush|squeaker|interactive)/.test(combine);
                          if (activeSection === 'Training Material') return /(training|leash|harness|collar|tag|agility)/.test(combine);
                          return true;
                        })
                        .map((p) => (
                          <ProductCard key={p.id || p.sku || p.name} product={p} />
                        ))}
                    </div>
                  )}
                </section>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <MobileBottomNav />
    </>
  );
};

export default PetCoOutletPage;
