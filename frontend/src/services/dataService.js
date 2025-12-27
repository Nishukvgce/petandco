// Import database data only as emergency fallback
import databaseData from '../data/database.json';
import productApi from './productApi';
import apiClient from './api';

// Simulate API delay for development
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Initialize empty users array since we removed hardcoded users
let users = [];

// Load additional users from localStorage if available
const loadUsersFromStorage = () => {
  try {
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
      const parsedUsers = JSON.parse(storedUsers);
      if (Array.isArray(parsedUsers)) {
        users = parsedUsers.map(user => ({
          ...user,
          id: parseInt(user.id),
          totalOrders: user.totalOrders || 0,
          totalSpent: user.totalSpent || 0,
          loyaltyPoints: user.loyaltyPoints || 0,
          totalSaved: user.totalSaved || 0
        }));
      }
    }
  } catch (error) {
    console.warn('Failed to load users from localStorage:', error);
    users = [];
  }
};

// Load users on initialization
loadUsersFromStorage();

// Mock orders data - load from localStorage if available
let orders = [];

// Load orders from localStorage if available
const loadOrdersFromStorage = () => {
  try {
    const storedOrders = localStorage.getItem('orders');
    if (storedOrders) {
      const parsedOrders = JSON.parse(storedOrders);
      if (Array.isArray(parsedOrders)) {
        orders = parsedOrders;
      }
    }
  } catch (error) {
    console.warn('Failed to load orders from localStorage:', error);
    orders = [];
  }
};

// Load orders on initialization
loadOrdersFromStorage();

// Save orders to localStorage
const saveOrdersToStorage = () => {
  try {
    localStorage.setItem('orders', JSON.stringify(orders));
  } catch (error) {
    console.warn('Failed to save orders to localStorage:', error);
  }
};

// Settings data
const settings = {
  siteName: "PET&CO",
  currency: "INR",
  shippingFee: 50,
  freeShippingThreshold: 500,
  taxRate: 0.18
};

const dataService = {
  // Add a new product to backend
  async addProduct(formData, isFormData = false) {
    try {
      if (isFormData) {
        // Let the browser set Content-Type (including boundary) when sending FormData
        const res = await apiClient.post('/admin/products', formData);
        return res.data;
      } else {
        // Use productApi for regular JSON data
        return await productApi.add(formData);
      }
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  },

  async getAllUsers() {
    try {
      const res = await fetch('https://nishmitha-roots-7.onrender.com/api/admin/users');
      if (!res.ok) throw new Error('Failed to fetch users');
      return await res.json();
    } catch (error) {
      console.error('Error fetching users from API, using fallback:', error);
      return users;
    }
  },

  // Update an existing product in backend
  async updateProduct(productId, productData) {
    try {
      return await productApi.update(productId, productData);
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  // Update an existing product with image in backend
  async updateProductWithImage(productId, formData) {
    try {
      // Let the browser/axios set Content-Type (with boundary) for FormData
      const res = await apiClient.put(`/admin/products/${productId}`, formData);
      return res.data;
    } catch (error) {
      console.error('Error updating product with image:', error);
      throw error;
    }
  },

  // Delete a product in backend (also deletes its image file server-side)
  async deleteProduct(productId) {
    try {
      await productApi.remove(productId);
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  // Authentication methods
  authenticate(emailOrUsername, password) {
    console.log('Authenticating user:', emailOrUsername);
    const user = users.find(u => 
      (u.email === emailOrUsername || u.username === emailOrUsername) && 
      u.password === password
    );
    return user || null;
  },

  // User management
  getUser(id) {
    return users.find(u => u.id === parseInt(id));
  },

  getUserByEmail(email) {
    return users.find(u => u.email === email);
  },

  getUsers() {
    return users;
  },

  addUser(userData) {
    const newUser = {
      ...userData,
      id: Math.max(...users.map(u => u.id), 0) + 1,
      createdAt: new Date().toISOString(),
      addresses: [],
      orders: [],
      wishlist: []
    };
    users.push(newUser);
    loadUsersFromStorage();
    console.log('New user added:', newUser);
    return newUser;
  },

  updateUser(id, updates) {
    const userIndex = users.findIndex(u => u.id === parseInt(id));
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updates };
      loadUsersFromStorage();
      return users[userIndex];
    }
    return null;
  },

  // Order management  
  getOrders() {
    return orders;
  },

  getOrdersByUserId(userId) {
    return orders.filter(o => o.userId === parseInt(userId));
  },

  getOrder(id) {
    return orders.find(o => o.id === parseInt(id));
  },

  updateOrder(id, updates) {
    const orderIndex = orders.findIndex(o => o.id === parseInt(id));
    if (orderIndex !== -1) {
      orders[orderIndex] = { ...orders[orderIndex], ...updates };
      saveOrdersToStorage();
      return orders[orderIndex];
    }
    return null;
  },

  addOrder(orderData) {
    const newOrder = {
      ...orderData,
      id: Math.max(...orders.map(o => o.id), 0) + 1,
      orderId: orderData.orderId || `NN${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString()
    };
    orders.push(newOrder);
    saveOrdersToStorage();
    
    // Update user's order history and stats
    if (orderData.userId) {
      const user = users.find(u => u.id === parseInt(orderData.userId));
      if (user) {
        user.totalOrders = (user.totalOrders || 0) + 1;
        user.totalSpent = (user.totalSpent || 0) + (orderData.total || 0);
        loadUsersFromStorage();
      }
    }
    
    console.log('Order added to database:', newOrder);
    return newOrder;
  },

  // Settings management
  getSettings() {
    return settings;
  },

  updateSettings(newSettings) {
    Object.assign(settings, newSettings);
    return settings;
  },

  // Get all products from backend API
  async getProducts(filters = {}) {
    try {
      console.log('Fetching products from backend API...');
      const products = await productApi.getAll(filters);
      console.log('Successfully loaded products from API:', products.length);
      
      return {
        data: Array.isArray(products) ? products : [],
        total: Array.isArray(products) ? products.length : 0
      };
    } catch (error) {
      console.error('Error fetching products from API, using fallback:', error);
      
      // Fallback to database.json data only if API fails
      const fallbackProducts = databaseData.products || [];
      console.log('Using fallback products:', fallbackProducts.length);
      
      return {
        data: fallbackProducts,
        total: fallbackProducts.length
      };
    }
  },

  // Get product by ID from backend API
  async getProductById(id) {
    try {
      console.log('Fetching product by ID from backend API:', id);
      const product = await productApi.getById(id);
      console.log('Successfully loaded product from API:', product);
      
      return { data: product };
    } catch (error) {
      console.error('Error fetching product from API, using fallback:', error);
      
      // Fallback to database.json data only if API fails
      const fallbackProduct = databaseData.products?.find(p => p.id === parseInt(id));
      if (!fallbackProduct) {
        throw new Error('Product not found');
      }
      
      return { data: fallbackProduct };
    }
  },

  // Get categories from backend API
  async getCategories() {
    try {
      console.log('Fetching categories from backend API...');
      const res = await apiClient.get('/categories');
      const categories = res.data;
      console.log('Successfully loaded categories from API:', categories.length);
      
      return { data: Array.isArray(categories) ? categories : [] };
    } catch (error) {
      console.error('Error fetching categories from API:', error);
      
      // Return empty array if API fails - no hardcoded fallback
      return { data: [] };
    }
  },

  // Get featured products from backend API
  async getFeaturedProducts(limit = 8) {
    try {
      console.log('Fetching featured products from backend API...');
      const products = await productApi.getAll({ featured: true, limit });
      const featured = Array.isArray(products) ? products.slice(0, limit) : [];
      console.log('Successfully loaded featured products from API:', featured.length);
      
      return { data: featured };
    } catch (error) {
      console.error('Error fetching featured products from API:', error);
      return { data: [] };
    }
  },

  // Get Bestsellers from backend API
  async getBestsellers(limit = 6) {
    try {
      console.log('Fetching Bestsellers from backend API...');
      const products = await productApi.getAll({ bestseller: true, limit });
      const Bestsellers = Array.isArray(products) ? products.slice(0, limit) : [];
      console.log('Successfully loaded Bestsellers from API:', Bestsellers.length);
      
      return { data: Bestsellers };
    } catch (error) {
      console.error('Error fetching Bestsellers from API:', error);
      return { data: [] };
    }
  },

  // Get related products from backend API
  async getRelatedProducts(productId, limit = 4) {
    try {
      console.log('Fetching related products from backend API for product:', productId);
      
      // First get the product to find its category
      const product = await productApi.getById(productId);
      if (!product) return { data: [] };
      
      // Then get products from the same category
      const products = await productApi.getAll({ category: product.category, limit: limit + 1 });
      const related = Array.isArray(products) 
        ? products.filter(p => p.id !== parseInt(productId)).slice(0, limit)
        : [];
      
      console.log('Successfully loaded related products from API:', related.length);
      return { data: related };
    } catch (error) {
      console.error('Error fetching related products from API:', error);
      return { data: [] };
    }
  }
};

export default dataService;