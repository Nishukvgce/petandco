import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import categoryApi from '../../../services/categoryApi';
import productApi from '../../../services/productApi';
import apiClient from '../../../services/api';

const CategoryTiles = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const resolveImageUrl = (candidate) => {
    if (!candidate || typeof candidate !== 'string') return '';
    if (/^(https?:)?\/\//i.test(candidate) || candidate.startsWith('data:')) return candidate;
    // Extract filename if absolute path
    if (/^[a-zA-Z]:\\/.test(candidate) || candidate.startsWith('\\\\') || candidate.startsWith('/') || candidate.includes('\\')) {
      const parts = candidate.split(/\\|\//);
      candidate = parts[parts.length - 1];
    }
    // Map bare filename to API route
    if (/^[^/]+\.[a-zA-Z0-9]+$/.test(candidate)) {
      candidate = `/admin/products/images/${candidate}`;
    }
    const base = apiClient?.defaults?.baseURL || '';
    return candidate.startsWith('/') ? `${base}${candidate}` : `${base}/${candidate}`;
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching categories from backend API...');
        
        // Try to get categories from backend API
        const categoriesRes = await categoryApi.getAll();
        let categoriesData = categoriesRes?.data || categoriesRes || [];
        
        // Additionally, fetch products to derive category images when missing
        let products = [];
        try {
          const productsRes = await productApi.getAll();
          products = Array.isArray(productsRes) ? productsRes : (productsRes?.data || []);
        } catch {}
        const firstImageByCategory = {};
        products.forEach((p) => {
          const catKey = p?.category || p?.categoryId;
          if (!catKey) return;
          if (!firstImageByCategory[catKey]) {
            const candidate = p?.imageUrl || p?.image || p?.image_path || p?.thumbnailUrl;
            const resolved = resolveImageUrl(candidate);
            if (resolved) firstImageByCategory[catKey] = resolved;
          }
        });
        
        // Process categories to ensure proper format
        const processedCategories = categoriesData.map(category => {
          const id = category.id || category.name?.toLowerCase().replace(/\s+/g, '-');
          const name = category.name || category.categoryName || id;
          const derivedImage = firstImageByCategory[id] || firstImageByCategory[name] || '';
          const finalImage = resolveImageUrl(category.image || category.imageUrl || derivedImage);
          return {
            id,
            name,
            description: category.description || `Quality ${name} products`,
            image: finalImage || '/assets/images/no_image.png',
            link: `/?category=${id}`,
            productCount: category.productCount ? `${category.productCount}+ Products` : "Products Available",
            featured: category.featured || false,
          };
        });
        
        // Build a set of category ids/names that appear in the products list
        const productCategorySet = new Set();
        products.forEach(p => {
          const catKey = p?.category || p?.categoryId || p?.category_name || p?.categoryName;
          if (catKey) productCategorySet.add(String(catKey).toLowerCase());
        });

        // Filter processed categories to only those that exist in products
        const filtered = processedCategories.filter(cat => {
          if (!cat || !cat.id) return false;
          const idLower = String(cat.id).toLowerCase();
          const nameLower = String(cat.name || '').toLowerCase();
          return productCategorySet.has(idLower) || productCategorySet.has(nameLower);
        });

        setCategories(filtered);
        console.log('Successfully loaded categories:', processedCategories.length);
        
      } catch (err) {
        console.error('Error loading categories:', err);
        setError('Failed to load categories');
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  if (loading) {
    return null;
  }

  if (error) {
    return null;
  }

  return null;
};

export default CategoryTiles;