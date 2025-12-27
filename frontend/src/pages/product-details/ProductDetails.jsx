import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import ProductImageGallery from '../product-detail-page/components/ProductImageGallery';
import ProductInfo from '../product-detail-page/components/ProductInfo';
import ProductDetails from '../product-detail-page/components/ProductDetails';
import RelatedProducts from '../product-detail-page/components/RelatedProducts';
import productApi from '../../services/productApi';
import dataService from '../../services/dataService';
import apiClient from '../../services/api';

const ProductDetailsPage = () => {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const productId = params?.id || searchParams?.get('id') || '1';

  const { cartItems, addToCart, addToWishlist, removeFromWishlist, isInWishlist, getCartItemCount } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

        const normalized = {
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
          variants: productData?.variants || [{ id: 'default', weight: productData?.weight || 'Default', price: productData?.price || 0, originalPrice: productData?.originalPrice || productData?.mrp || 0, stock: productData?.stock || 10 }],
          badges: productData?.badges || [],
          features: productData?.features || [],
          ingredients: productData?.ingredients || '',
          benefits: productData?.benefits || [],
          nutrition: productData?.nutrition || {},
          rating: productData?.rating || 0,
          reviewCount: productData?.reviewCount || 0,
          category: productData?.category || productData?.categoryId,
          brand: productData?.brand || productData?.manufacturer || 'Brand'
        };

        setProduct(normalized);
      } catch (err) {
        console.error('Error loading product:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (productId) loadProduct();
  }, [productId]);

  if (loading) return (<div className="min-h-screen"><Header cartItemCount={getCartItemCount()} cartItems={cartItems} onSearch={()=>{}} /><main className="container mx-auto px-4 py-6"><div className="text-center">Loading...</div></main></div>);
  if (error) return (<div className="min-h-screen"><Header cartItemCount={getCartItemCount()} cartItems={cartItems} onSearch={()=>{}} /><main className="container mx-auto px-4 py-6"><div className="text-center text-destructive">Error: {error}</div></main></div>);
  if (!product) return (<div className="min-h-screen"><Header cartItemCount={getCartItemCount()} cartItems={cartItems} onSearch={()=>{}} /><main className="container mx-auto px-4 py-6"><div className="text-center">Product not found</div></main></div>);

  const breadcrumbItems = [
    { label: 'Home', path: '/homepage' },
    { label: product?.category || 'Category', path: `/shop-for-dogs?category=${product?.category}` },
    { label: product?.name || 'Product', path: `/product-details/${productId}` }
  ];

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
            <ProductInfo product={product} onAddToCart={()=>{}} onAddToWishlist={()=>{}} isInWishlist={false} />
          </div>
        </div>
        <div className="mb-12"><ProductDetails product={product} /></div>
        <div className="mb-12"><RelatedProducts productId={product?.id} /></div>
      </main>
    </div>
  );
};

export default ProductDetailsPage;
