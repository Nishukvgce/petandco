import apiClient from './api';
import cache from './simpleCache';
import { buildApiParameters, normalizeParameterValue } from '../utils/productUtils';

const productApi = {
  async getAll(params = {}) {
    try {
      // Normalize parameters for consistent API calls
      const normalizedParams = this.normalizeParams(params);
      const cacheKey = `products:${JSON.stringify(normalizedParams)}`;
      
      const { cached, fresh } = cache.staleWhileRevalidate(cacheKey, async () => {
        console.log('ProductAPI: Fetching all products with normalized params:', normalizedParams);
        const res = await apiClient.get('/admin/products', { params: normalizedParams });
        console.log('ProductAPI: Successfully fetched products:', res.data?.length || 0);
        return res.data;
      }, 30 * 1000, true);

      if (cached) return cached;
      return await fresh;
    } catch (error) {
      console.error('ProductAPI: Failed to fetch products:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        params
      });
      
      // Provide meaningful error message
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to fetch products';
      
      throw new Error(`Unable to load products: ${errorMessage}`);
    }
  },

  async getCustomerProducts(params = {}) {
    try {
      // Normalize parameters for consistent API calls
      const normalizedParams = this.normalizeParams(params);
      const cacheKey = `customer-products:${JSON.stringify(normalizedParams)}`;
      
      const { cached, fresh } = cache.staleWhileRevalidate(cacheKey, async () => {
        console.log('ProductAPI: Fetching customer products (in-stock only) with normalized params:', normalizedParams);
        const res = await apiClient.get('/admin/products/customer', { params: normalizedParams });
        console.log('ProductAPI: Successfully fetched customer products:', res.data?.length || 0);
        return res.data;
      }, 30 * 1000, true);

      if (cached) return cached;
      return await fresh;
    } catch (error) {
      console.error('ProductAPI: Failed to fetch customer products:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        params
      });
      
      // Provide meaningful error message
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to fetch customer products';
      
      throw new Error(`Unable to load customer products: ${errorMessage}`);
    }
  },

  // Parameter normalization method
  normalizeParams(params = {}) {
    const normalized = {};
    
    // Normalize type parameter (prioritize 'type' over 'petType')
    const type = params.type || params.petType;
    if (type) {
      normalized.type = normalizeParameterValue(type);
    }
    
    // Normalize category parameter
    if (params.category) {
      normalized.category = normalizeParameterValue(params.category);
    }
    
    // Normalize subcategory parameter
    const sub = params.sub || params.subcategory;
    if (sub) {
      normalized.sub = normalizeParameterValue(sub);
    }
    
    // Pass through other parameters
    Object.keys(params).forEach(key => {
      if (!['type', 'petType', 'category', 'sub', 'subcategory'].includes(key)) {
        normalized[key] = params[key];
      }
    });
    
    return normalized;
  },

  // Enhanced product fetching with context-aware parameter building
  async getProductsByContext(urlParams = {}, context = 'dog') {
    try {
      // Build API parameters using context
      const apiParams = buildApiParameters(urlParams, context);
      console.log('ProductAPI: Context-aware request:', { urlParams, context, apiParams });
      
      return await this.getCustomerProducts(apiParams);
    } catch (error) {
      console.error('ProductAPI: Context-aware fetch failed:', error);
      throw error;
    }
  },

  async getById(productId) {
    try {
      if (!productId) {
        throw new Error('Product ID is required');
      }
      
      const cacheKey = `product:${productId}`;
      const { cached, fresh } = cache.staleWhileRevalidate(cacheKey, async () => {
        console.log('ProductAPI: Fetching product by ID:', productId);
        const res = await apiClient.get(`/admin/products/${productId}`);
        console.log('ProductAPI: Successfully fetched product:', res.data?.name || res.data?.id);
        return res.data;
      }, 30 * 1000, true);

      if (cached) return cached;
      return await fresh;
    } catch (error) {
      console.error('ProductAPI: Failed to fetch product by ID:', productId, {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      if (error.response?.status === 404) {
        throw new Error(`Product with ID ${productId} not found`);
      }
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to fetch product';
      
      throw new Error(`Unable to load product: ${errorMessage}`);
    }
  },

  async add(productPayload) {
    try {
      if (!productPayload) {
        throw new Error('Product data is required');
      }
      
      console.log('ProductAPI: Adding new product:', productPayload.name || 'Unnamed Product');
      const res = await apiClient.post('/admin/products', productPayload);
      console.log('ProductAPI: Successfully added product:', res.data?.id);
      return res.data;
    } catch (error) {
      console.error('ProductAPI: Failed to add product:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        payload: productPayload
      });
      
      if (error.response?.status === 400) {
        const validationErrors = error.response?.data?.errors || error.response?.data?.message;
        throw new Error(`Invalid product data: ${validationErrors || 'Please check all required fields'}`);
      }
      
      if (error.response?.status === 403) {
        throw new Error('You do not have permission to add products');
      }
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to add product';
      
      throw new Error(`Unable to add product: ${errorMessage}`);
    }
  },

  async update(productId, productPayload) {
    try {
      if (!productId) {
        throw new Error('Product ID is required');
      }
      if (!productPayload) {
        throw new Error('Product data is required');
      }
      
      console.log('ProductAPI: Updating product:', productId, productPayload.name || 'Unnamed Product');
      
      // Create FormData for multipart/form-data request
      const formData = new FormData();
      
      // Add product data as JSON blob
      const productBlob = new Blob([JSON.stringify(productPayload)], {
        type: 'application/json'
      });
      formData.append('product', productBlob);
      
      // Let the axios client set the Content-Type with proper boundary
      const res = await apiClient.put(`/admin/products/${productId}`, formData);
      console.log('ProductAPI: Successfully updated product:', productId);
      
      // Clear cache for this product and all products
      cache.delete(`product:${productId}`);
      cache.deletePattern('products:');
      
      return res.data;
    } catch (error) {
      console.error('ProductAPI: Failed to update product:', productId, {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        payload: productPayload
      });
      
      if (error.response?.status === 404) {
        throw new Error(`Product with ID ${productId} not found`);
      }
      
      if (error.response?.status === 400) {
        const validationErrors = error.response?.data?.errors || error.response?.data?.message;
        throw new Error(`Invalid product data: ${validationErrors || 'Please check all required fields'}`);
      }
      
      if (error.response?.status === 403) {
        throw new Error('You do not have permission to update products');
      }
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to update product';
      
      throw new Error(`Unable to update product: ${errorMessage}`);
    }
  },

  async updateVariantStock(productId, variantId, stock) {
    try {
      if (!productId || !variantId) throw new Error('Product and variant id required');
      console.log('ProductAPI: Updating variant stock', { productId, variantId, stock });
      const res = await apiClient.patch(`/admin/products/${productId}/variant/${variantId}/stock`, null, {
        params: { stock }
      });

      // Clear affected caches
      cache.delete(`product:${productId}`);
      cache.deletePattern('products:');

      return res.data;
    } catch (error) {
      console.error('ProductAPI: Failed to update variant stock:', error?.response?.data || error.message || error);
      throw error;
    }
  },

  async remove(productId) {
    try {
      if (!productId) {
        throw new Error('Product ID is required');
      }
      
      console.log('ProductAPI: Removing product:', productId);
      const res = await apiClient.delete(`/admin/products/${productId}`);
      console.log('ProductAPI: Successfully removed product:', productId);
      return res.data;
    } catch (error) {
      console.error('ProductAPI: Failed to remove product:', productId, {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      if (error.response?.status === 404) {
        throw new Error(`Product with ID ${productId} not found`);
      }
      
      if (error.response?.status === 403) {
        throw new Error('You do not have permission to delete products');
      }
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to delete product';
      
      throw new Error(`Unable to delete product: ${errorMessage}`);
    }
  }
};

export default productApi;
