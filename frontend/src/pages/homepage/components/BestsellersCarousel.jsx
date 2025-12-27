import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import productApi from '../../../services/productApi';
import dataService from '../../../services/dataService';
import apiClient from '../../../services/api';

const BestsellersCarousel = ({ onAddToCart }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [Bestsellers, setBestsellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Resolve image URL from backend (handles relative paths like "/admin/products/images/xxx.jpg")
  const resolveImageUrl = (input) => {
    let candidate = typeof input === 'string'
      ? input
      : (input?.imageUrl || input?.image || input?.thumbnailUrl);
    if (!candidate) return '/assets/images/no_image.png';
    if (typeof candidate !== 'string') return '/assets/images/no_image.png';
    // Absolute URLs or data URIs
    if (/^(https?:)?\/\//i.test(candidate) || candidate.startsWith('data:')) return candidate;

    // If it's an absolute OS path (Windows/Unix) or contains backslashes, extract filename
    if (/^[a-zA-Z]:\\/.test(candidate) || candidate.startsWith('\\\\') || candidate.startsWith('/') || candidate.includes('\\')) {
      const parts = candidate.split(/\\|\//);
      candidate = parts[parts.length - 1];
    }

    // If it's a bare filename, map to API image route
    if (/^[^/]+\.[a-zA-Z0-9]+$/.test(candidate)) {
      candidate = `/admin/products/images/${candidate}`;
    }

    const base = apiClient?.defaults?.baseURL || '';
    return candidate.startsWith('/') ? `${base}${candidate}` : `${base}/${candidate}`;
  };

  useEffect(() => {
    const loadBestsellers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching bestselling products...');
        
        let bestsellerProducts = [];
        
        // Try to get Bestsellers from backend API
        try {
          const productsRes = await productApi.getAll();
          const allProducts = Array.isArray(productsRes) ? productsRes : (productsRes?.data || []);
          
          // Filter for Bestsellers or top-rated products
          bestsellerProducts = allProducts
            .filter(product => product.featured || product.bestseller || product.rating >= 4.5)
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, 8); // Limit to 8 Bestsellers
            
          if (bestsellerProducts.length === 0) {
            // Fallback: Take top products by rating
            bestsellerProducts = allProducts
              .sort((a, b) => (b.rating || 0) - (a.rating || 0))
              .slice(0, 6);
          }
          
        } catch (apiError) {
          console.warn('Backend API failed, falling back to dataService:', apiError?.message);
          
          // Fallback to dataService
          const response = await dataService.getProducts();
          const products = response?.data || [];
          bestsellerProducts = products
            .filter(product => product.featured || product.bestseller || product.rating >= 4.5)
            .slice(0, 6);
        }
        
        // Normalize product data for consistent display
        const normalizedProducts = bestsellerProducts.map(product => ({
          id: product.id,
          name: product.name || product.title,
          originalPrice: product.originalPrice || product.price || 0,
          salePrice: product.salePrice || product.price || 0,
          price: product.price || product.salePrice || 0,
          image: resolveImageUrl(product),
          rating: product.rating || 4.5,
          reviewCount: product.reviewCount || product.reviews || Math.floor(Math.random() * 200) + 50,
          badges: product.badges || product.tags || ["Quality Product"],
          weight: product.weight || product.size || product.variant || "250g",
          inStock: product.inStock !== false,
          quickAdd: true,
          category: product.category || product.categoryId
        }));
        
        setBestsellers(normalizedProducts);
        console.log('Successfully loaded Bestsellers:', normalizedProducts.length);
        
      } catch (err) {
        console.error('Error loading Bestsellers:', err);
        setError('Failed to load bestselling products');
        setBestsellers([]);
      } finally {
        setLoading(false);
      }
    };

    loadBestsellers();
  }, []);

  const itemsPerSlide = {
    mobile: 2,
    tablet: 3,
    desktop: 4
  };

  const totalSlides = Math.max(1, Math.ceil(Bestsellers?.length / itemsPerSlide?.desktop));

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const calculateSavings = (original, sale) => {
    if (!original || !sale || original <= sale) return 0;
    return Math.round(((original - sale) / original) * 100);
  };

  const handleQuickAdd = (product) => {
    if (onAddToCart) {
      onAddToCart({
        id: product?.id,
        name: product?.name,
        price: product?.price || product?.salePrice || 0,
        originalPrice: product?.originalPrice || product?.price || product?.salePrice || 0,
        image: product?.image,
        variant: product?.weight,
        quantity: 1
      });
    }
  };

  if (loading) { return null; }

  if (error) { return null; }

  if (Bestsellers.length === 0) { return null; }

  return null;
};

export default BestsellersCarousel;