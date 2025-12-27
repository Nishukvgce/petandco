import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import ProductImageGallery from '../product-detail-page/components/ProductImageGallery';
import ProductInfo from '../product-detail-page/components/ProductInfo';
import ProductDetails from '../product-detail-page/components/ProductDetails';
import ProductFAQ from '../product-detail-page/components/ProductFAQ';
import ProductReviews from '../product-detail-page/components/ProductReviews';
import RelatedProducts from '../product-detail-page/components/RelatedProducts';
import productApi from '../../services/productApi';
import dataService from '../../services/dataService';
import apiClient from '../../services/api';

const ProductFullPage = () => {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const productId = params?.id || searchParams?.get('id') || '1';

  const { cartItems, addToCart, addToWishlist, removeFromWishlist, isInWishlist, getCartItemCount } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);

  const resolveImageUrl = (candidate) => {
    if (!candidate || typeof candidate !== 'string') return '';
    if (/^(https?:)?\/\//i.test(candidate) || candidate.startsWith('data:')) return candidate;
    if (/^[a-zA-Z]:\\/.test(candidate) || candidate.startsWith('\\\\') || candidate.startsWith('/') || candidate.includes('\\')) {
      const parts = candidate.split(/\\|\//);
      candidate = parts[parts.length - 1];
    }
    if (/^[^/]+\.[a-zA-Z0-9]+$/.test(candidate)) {
      candidate = `/admin/products/images/${candidate}`;
    }
    const base = apiClient?.defaults?.baseURL || '';
    return candidate.startsWith('/') ? `${base}${candidate}` : `${base}/${candidate}`;
  };

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        let productData = null;
        try {
          productData = await productApi.getById(productId);
        } catch (apiError) {
          const response = await dataService.getProducts();
          const products = response?.data || [];
          productData = products.find(p => p.id === productId || p.id === parseInt(productId));
          if (!productData) throw new Error(`Product with ID ${productId} not found`);
        }

        // Normalize product data and include metadata fields
        const normalizedProduct = {
          id: productData?.id,
          name: productData?.name || productData?.title,
          shortDescription: productData?.shortDescription || (productData?.description ? productData.description.substring(0, 100) + '...' : ''),
          description: productData?.description || 'No description available.',
          images: (() => {
            let imageUrls = [];
            
            if (productData?.images && Array.isArray(productData.images) && productData.images.length > 0) {
              imageUrls = productData.images.map(resolveImageUrl).filter(Boolean);
            } else if (productData?.gallery && Array.isArray(productData.gallery) && productData.gallery.length > 0) {
              imageUrls = productData.gallery.map(resolveImageUrl).filter(Boolean);
            } else if (productData?.imageUrl && productData.imageUrl.trim() !== '') {
              imageUrls = [resolveImageUrl(productData.imageUrl)];
            } else if (productData?.image && productData.image.trim() !== '') {
              imageUrls = [resolveImageUrl(productData.image)];
            } else if (productData?.thumbnailUrl && productData.thumbnailUrl.trim() !== '') {
              imageUrls = [resolveImageUrl(productData.thumbnailUrl)];
            }
            
            // Remove duplicate images using Set to ensure each image appears only once
            return [...new Set(imageUrls)];
          })(),
          variants: (() => {
            // If product has explicit variants with pricing, use them
            if (productData?.variants && Array.isArray(productData.variants) && productData.variants.length > 0) {
              return productData.variants.map((variant, index) => ({
                id: variant?.id || `variant-${index}`,
                weight: variant?.weight || variant?.size || `Option ${index + 1}`,
                size: variant?.size || variant?.weight || `Option ${index + 1}`,
                label: variant?.label || variant?.weight || variant?.size || `Option ${index + 1}`,
                price: parseFloat(variant?.price || productData?.price || 0),
                originalPrice: parseFloat(variant?.originalPrice || variant?.mrp || productData?.originalPrice || productData?.mrp || variant?.price || productData?.price || 0),
                stock: variant?.stock || productData?.stock || productData?.stockQuantity || 10,
                perUnit: variant?.perUnit || null,
                unitType: variant?.unitType || (variant?.size ? 'size' : 'weight')
              }));
            }
            
            // Check metadata for variants
            if (productData?.metadata?.variants && Array.isArray(productData.metadata.variants) && productData.metadata.variants.length > 0) {
              return productData.metadata.variants.map((variant, index) => ({
                id: variant?.id || `variant-${index}`,
                weight: variant?.weight || variant?.size || `Option ${index + 1}`,
                size: variant?.size || variant?.weight || `Option ${index + 1}`,
                label: variant?.label || variant?.weight || variant?.size || `Option ${index + 1}`,
                price: parseFloat(variant?.price || productData?.price || 0),
                originalPrice: parseFloat(variant?.originalPrice || variant?.mrp || productData?.originalPrice || productData?.mrp || variant?.price || productData?.price || 0),
                stock: variant?.stock || productData?.stock || productData?.stockQuantity || 10,
                perUnit: variant?.perUnit || null,
                unitType: variant?.unitType || (variant?.size ? 'size' : 'weight')
              }));
            }
            
            // Create default variant from main product data
            return [
              {
                id: "default",
                weight: productData?.weight || "Default",
                size: productData?.size || "Default", 
                label: productData?.weight || productData?.size || "Default",
                price: parseFloat(productData?.price || productData?.salePrice || 0),
                originalPrice: parseFloat(productData?.originalPrice || productData?.mrp || productData?.price || productData?.salePrice || 0),
                stock: productData?.stock || productData?.stockQuantity || 10,
                perUnit: null,
                unitType: productData?.size ? 'size' : 'weight'
              }
            ];
          })(),
          badges: productData?.badges || [],
          features: productData?.features || [],
          ingredients: productData?.ingredients || '',
          benefits: productData?.benefits || [],
          nutrition: productData?.nutrition || {},
          metadata: productData?.metadata || {},
          rating: productData?.rating || productData?.ratingValue || 0,
          reviewCount: productData?.reviewCount || 0,
          category: productData?.category || productData?.categoryId,
          brand: productData?.brand || productData?.manufacturer || 'Brand'
        };

        setProduct(normalizedProduct);

        // Load related products
        try {
          const all = await productApi.getAll();
          const items = Array.isArray(all) ? all : [];
          const sameCategory = items.filter(p => (p?.category || p?.categoryId) === normalizedProduct.category && p?.id !== normalizedProduct.id).slice(0, 8);
          const normalizedRelated = sameCategory.map(p => ({
            id: p?.id,
            name: p?.name || p?.title,
            image: resolveImageUrl(p?.image || p?.imageUrl || p?.thumbnailUrl),
            rating: p?.rating || 4.5,
            reviewCount: p?.reviewCount || 0,
            badges: p?.badges || [],
            variants: [{ id: 'default', weight: p?.weight || 'Default', price: parseFloat(p?.price ?? p?.salePrice ?? 0) || 0, originalPrice: parseFloat(p?.originalPrice ?? p?.price ?? p?.salePrice ?? 0) || 0 }]
          }));
          setRelatedProducts(normalizedRelated);
        } catch (e) {
          setRelatedProducts([]);
        }
      } catch (err) {
        console.error('Error loading product:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (productId) loadProduct();
  }, [productId]);

  const breadcrumbItems = [
    { label: 'Home', path: '/homepage' },
    { label: product?.category || 'Category', path: `/shop-for-dogs?category=${product?.category}` },
    { label: product?.name || 'Product', path: `/product-full/${productId}` }
  ];

  const handleAddToCart = (item) => {
    if (!product) return;
    const variant = product?.variants?.find(v => v?.id === item?.variantId) || product?.variants?.[0];
    if (!variant) return;
    addToCart({ id: product.id, productId: product.id, variantId: variant.id, name: product.name, variant: variant.weight || variant.size, price: parseFloat(variant.price) || 0, originalPrice: parseFloat(variant.originalPrice) || parseFloat(variant.price) || 0, image: product.images?.[0], category: product.category, brand: product.brand }, item?.quantity || 1);
  };

  const handleAddToWishlist = () => {
    if (!product) return;
    const isIn = isInWishlist(product.id);
    if (isIn) removeFromWishlist(product.id); else addToWishlist({ id: product.id, name: product.name, image: product.images?.[0], price: parseFloat(product?.variants?.[0]?.price) || 0 });
  };

  if (loading) return (<div className="min-h-screen bg-background"><Header cartItemCount={getCartItemCount()} cartItems={cartItems} onSearch={()=>{}} /><main className="container mx-auto px-4 py-6"><div className="text-center">Loading product details...</div></main></div>);
  if (error) return (<div className="min-h-screen bg-background"><Header cartItemCount={getCartItemCount()} cartItems={cartItems} onSearch={()=>{}} /><main className="container mx-auto px-4 py-6"><div className="text-center text-destructive">Error loading product: {error}</div></main></div>);
  if (!product) return (<div className="min-h-screen bg-background"><Header cartItemCount={getCartItemCount()} cartItems={cartItems} onSearch={()=>{}} /><main className="container mx-auto px-4 py-6"><div className="text-center">Product not found</div></main></div>);

  return (
    <div className="min-h-screen bg-background">
      <Header cartItemCount={getCartItemCount()} cartItems={cartItems} onSearch={()=>{}} />
      <main className="container mx-auto px-4 py-6">
        <Breadcrumb customItems={breadcrumbItems} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <ProductImageGallery images={product?.images} productName={product?.name} />
          </div>
          <div>
            <ProductInfo product={product} onAddToCart={handleAddToCart} onAddToWishlist={handleAddToWishlist} isInWishlist={isInWishlist(product.id)} />
          </div>
        </div>

        <div className="mb-12"><ProductDetails product={product} /></div>
        <div className="mb-12"><ProductFAQ faqs={[]} /></div>
        <div className="mb-12"><ProductReviews productId={product.id} /></div>
        <div className="mb-12"><RelatedProducts productId={product?.id} initial={relatedProducts} /></div>
      </main>
    </div>
  );
};

export default ProductFullPage;
