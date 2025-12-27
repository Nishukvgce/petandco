import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Filter, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import dataService from '../../../services/dataService';
import productApi from '../../../services/productApi';
import apiClient from '../../../services/api';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import EnhancedProductForm from './EnhancedProductForm';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [backendStatus, setBackendStatus] = useState('checking'); // 'online', 'offline', 'checking'

  // Check backend connectivity
  const checkBackendHealth = async () => {
    try {
      await apiClient.get('/categories');
      setBackendStatus('online');
      return true;
    } catch (error) {
      console.warn('Backend health check failed:', error);
      setBackendStatus('offline');
      return false;
    }
  };

  // Helper: resolve image URL coming from backend (relative like "/admin/products/images/xxx.jpg")
  const resolveImageUrl = (p) => {
    let candidate = p?.imageUrl || p?.image || p?.image_path || p?.thumbnailUrl;
    if (!candidate) return '/assets/images/no_image.png';
    if (typeof candidate !== 'string') return '/assets/images/no_image.png';
    
    // Absolute URLs or data URIs - return as is
    if (/^(https?:)?\/\//i.test(candidate) || candidate.startsWith('data:')) {
      return candidate;
    }

    // If it's an absolute OS path (Windows or Unix), extract filename
    if (/^[a-zA-Z]:\\/.test(candidate) || candidate.startsWith('\\\\') || candidate.startsWith('/') || candidate.includes('\\')) {
      const parts = candidate.split(/\\|\//);
      candidate = parts[parts.length - 1];
    }

    // If it's a bare filename (e.g., "photo.jpg"), map to API image route
    if (/^[^/]+\.[a-zA-Z0-9]+$/.test(candidate)) {
      candidate = `/admin/products/images/${candidate}`;
    }

    const base = apiClient?.defaults?.baseURL || 'https://nishmitha-roots-7.onrender.com/api';
    const fullUrl = candidate.startsWith('/') ? `${base}${candidate}` : `${base}/${candidate}`;
    
    // Log for debugging
    console.log('Resolving image URL:', { original: p?.imageUrl, resolved: fullUrl });
    
    return fullUrl;
  };

  // Handle image load errors
  const handleImageError = (e, productName) => {
    console.warn(`Image failed to load for product: ${productName}`, e.target.src);
    e.target.src = '/assets/images/no_image.png';
  };

  useEffect(() => {
    const initializeData = async () => {
      await checkBackendHealth();
      await loadProducts();
    };
    initializeData();
  }, []);

  const navigate = useNavigate();

  const loadProducts = async (retryCount = 0) => {
    try {
      setLoading(true);
      // Load products from backend API
      let apiProducts = [];
      try {
        console.log('Admin Panel: Fetching products from backend API...');
        const response = await productApi.getAll();
        // Spring Boot API returns array directly (not response.data)
        apiProducts = Array.isArray(response) ? response : [];
        console.log('Admin Panel: Successfully loaded products from API:', apiProducts.length);
      } catch (apiError) {
        console.warn('Admin Panel: Backend API failed:', apiError?.message);
        
        // Retry once if it's a network error and this is the first attempt
        if (retryCount < 1 && (apiError?.message?.includes('Network Error') || apiError?.code === 'ERR_NETWORK')) {
          console.log('Admin Panel: Retrying API call...');
          setTimeout(() => loadProducts(retryCount + 1), 2000);
          return;
        }
        
        // Fallback to hardcoded data from dataService
        const fallbackResponse = await dataService.getProducts();
        apiProducts = fallbackResponse?.data || [];
        console.log('Admin Panel: Loaded products from fallback data:', apiProducts.length);
        
        // If no fallback products, create some sample products for demonstration
        if (apiProducts.length === 0) {
          apiProducts = [
            // {
            //   id: 'demo-1',
            //   name: 'Royal Canin Adult Dog Food - Chicken & Rice',
            //   shortDescription: 'Complete nutrition for adult dogs with high-quality chicken and rice formula.',
            //   description: 'Royal Canin Adult Dog Food provides complete and balanced nutrition for adult dogs. Made with high-quality chicken as the first ingredient and easily digestible rice. Key Features: High-quality protein, Enhanced digestive health, Immune system support, Optimal weight management.',
            //   brand: 'Royal Canin',
            //   category: { id: 'dog-food', name: 'Dog Food' },
            //   subcategory: 'Dry Food',
            //   productType: 'Dry Food',
            //   lifeStage: 'Adult',
            //   breedSize: 'All Breeds',
            //   proteinSource: 'Chicken',
            //   specialDiet: 'Natural',
            //   price: 899.99,
            //   originalPrice: 999.99,
            //   stockQuantity: 25,
            //   inStock: true,
            //   weight: '1kg',
            //   imageUrl: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400&h=400&fit=crop&crop=center',
            //   badges: ['Best Seller', 'Natural'],
            //   features: [
            //     'High-quality chicken protein',
            //     'Enhanced digestive health',
            //     'Immune system support',
            //     'Optimal weight management'
            //   ],
            //   ingredients: 'Chicken, Rice, Corn, Chicken Fat, Wheat, Beet Pulp',
            //   benefits: 'Complete nutrition, Digestive health, Strong immunity, Healthy weight',
            //   nutrition: {
            //     protein: '25%',
            //     fat: '12%',
            //     fiber: '4%',
            //     moisture: '10%'
            //   },
            //   variants: [
            //     { id: 'v1', weight: '500g', price: 499.99, originalPrice: 549.99, stock: 15 },
            //     { id: 'v2', weight: '1kg', price: 899.99, originalPrice: 999.99, stock: 25 },
            //     { id: 'v3', weight: '3kg', price: 2199.99, originalPrice: 2399.99, stock: 10 }
            //   ],
            //   rating: 4.5,
            //   reviewCount: 128,
            //   tags: ['dog', 'food', 'adult', 'chicken', 'royal-canin'],
            //   createdAt: '2024-01-15T10:30:00Z'
            // },
            // {
            //   id: 'demo-2',
            //   name: 'Whiskas Cat Food - Ocean Fish Flavor',
            //   shortDescription: 'Delicious ocean fish flavored wet food for cats with complete nutrition.',
            //   description: 'Whiskas Ocean Fish provides complete and balanced nutrition for cats. Made with real fish for a taste cats love. Key Features: Real ocean fish, Complete nutrition, High moisture content, Supports urinary health.',
            //   brand: 'Whiskas',
            //   category: { id: 'cat-food', name: 'Cat Food' },
            //   subcategory: 'Wet Food',
            //   productType: 'Wet Food',
            //   lifeStage: 'Adult',
            //   proteinSource: 'Fish',
            //   specialDiet: 'Natural',
            //   price: 89.99,
            //   originalPrice: 99.99,
            //   stockQuantity: 50,
            //   inStock: true,
            //   weight: '85g',
            //   imageUrl: 'https://images.unsplash.com/photo-1548681528-6a5c45b66b42?w=400&h=400&fit=crop&crop=center',
            //   badges: ['Popular', 'High Protein'],
            //   features: [
            //     'Real ocean fish',
            //     'Complete nutrition',
            //     'High moisture content',
            //     'Supports urinary health'
            //   ],
            //   ingredients: 'Fish, Water, Carrots, Rice, Vitamins, Minerals',
            //   benefits: 'Complete nutrition, Hydration, Urinary health, Great taste',
            //   nutrition: {
            //     protein: '8%',
            //     fat: '4%',
            //     fiber: '1%',
            //     moisture: '82%'
            //   },
            //   variants: [
            //     { id: 'v1', weight: '85g', price: 89.99, originalPrice: 99.99, stock: 50 },
            //     { id: 'v2', weight: 'Pack of 12', price: 999.99, originalPrice: 1099.99, stock: 20 }
            //   ],
            //   rating: 4.2,
            //   reviewCount: 95,
            //   tags: ['cat', 'food', 'fish', 'wet', 'whiskas'],
            //   createdAt: '2024-01-20T14:15:00Z'
            // },
            // {
            //   id: 'demo-3',
            //   name: 'Interactive Dog Toy Ball',
            //   shortDescription: 'Engaging interactive ball toy for dogs that promotes mental stimulation.',
            //   description: 'Interactive Dog Toy Ball designed to keep your dog entertained and mentally stimulated. Features treat-dispensing capability and durable construction. Key Features: Treat dispensing, Durable rubber, Mental stimulation, Suitable for all sizes.',
            //   brand: 'PetCo',
            //   category: { id: 'dog-toys', name: 'Dog Toys' },
            //   subcategory: 'Interactive Toys',
            //   productType: 'Toys',
            //   lifeStage: 'All Life Stages',
            //   breedSize: 'All Breeds',
            //   price: 299.99,
            //   stockQuantity: 0,
            //   inStock: false,
            //   weight: 'Medium',
            //   imageUrl: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=400&fit=crop&crop=center',
            //   badges: ['New', 'Interactive'],
            //   features: [
            //     'Treat dispensing mechanism',
            //     'Durable rubber construction',
            //     'Promotes mental stimulation',
            //     'Easy to clean'
            //   ],
            //   ingredients: 'Natural Rubber, Non-toxic materials',
            //   benefits: 'Mental stimulation, Reduces boredom, Dental health, Exercise',
            //   variants: [
            //     { id: 'v1', weight: 'Small', price: 249.99, stock: 0 },
            //     { id: 'v2', weight: 'Medium', price: 299.99, stock: 0 },
            //     { id: 'v3', weight: 'Large', price: 349.99, stock: 0 }
            //   ],
            //   rating: 4.7,
            //   reviewCount: 42,
            //   tags: ['dog', 'toy', 'interactive', 'treat', 'ball'],
            //   createdAt: '2024-02-01T09:45:00Z'
            // },
            // {
            //   id: 'demo-4',
            //   name: 'Premium Cat Litter - Clumping Formula',
            //   shortDescription: 'Ultra-clumping cat litter with odor control for multiple cats.',
            //   description: 'Premium cat litter made from natural clay with superior clumping action and odor control. Perfect for multi-cat households with long-lasting freshness.',
            //   brand: 'Fresh Step',
            //   category: { id: 'cat-litter', name: 'Cat Litter' },
            //   subcategory: 'Clumping Litter',
            //   productType: 'Litter',
            //   lifeStage: 'All Life Stages',
            //   specialDiet: 'Dust-Free',
            //   price: 599.99,
            //   originalPrice: 699.99,
            //   stockQuantity: 15,
            //   inStock: true,
            //   weight: '10kg',
            //   imageUrl: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400&h=400&fit=crop&crop=center',
            //   badges: ['Eco-Friendly', 'Odor Control'],
            //   features: [
            //     'Superior clumping action',
            //     '99% dust-free formula',
            //     'Advanced odor control',
            //     'Natural clay materials'
            //   ],
            //   ingredients: 'Natural Clay, Baking Soda, Natural Minerals',
            //   benefits: 'Easy cleanup, Odor elimination, Low dust, Long lasting',
            //   variants: [
            //     { id: 'v1', weight: '5kg', price: 349.99, originalPrice: 399.99, stock: 20 },
            //     { id: 'v2', weight: '10kg', price: 599.99, originalPrice: 699.99, stock: 15 }
            //   ],
            //   rating: 4.3,
            //   reviewCount: 67,
            //   tags: ['cat', 'litter', 'clumping', 'odor-control'],
            //   createdAt: '2024-01-25T11:20:00Z'
            // },
            // {
            //   id: 'demo-5',
            //   name: 'Comfortable Dog Bed - Memory Foam',
            //   shortDescription: 'Orthopedic memory foam dog bed for ultimate comfort and joint support.',
            //   description: 'Luxurious memory foam dog bed designed for maximum comfort and joint support. Features washable cover and non-slip bottom for stability.',
            //   brand: 'ComfortPaws',
            //   category: { id: 'dog-bedding', name: 'Dog Bedding' },
            //   subcategory: 'Beds',
            //   productType: 'Bedding',
            //   lifeStage: 'All Life Stages',
            //   breedSize: 'Large Breed',
            //   specialDiet: 'Orthopedic',
            //   price: 1299.99,
            //   originalPrice: 1499.99,
            //   stockQuantity: 8,
            //   inStock: true,
            //   weight: 'Large',
            //   imageUrl: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=400&fit=crop&crop=center',
            //   badges: ['Premium', 'Orthopedic'],
            //   features: [
            //     'Memory foam construction',
            //     'Washable removable cover',
            //     'Non-slip bottom',
            //     'Joint support design'
            //   ],
            //   ingredients: 'Memory Foam, Cotton Cover, Non-slip Rubber Base',
            //   benefits: 'Joint support, Comfort, Easy maintenance, Durability',
            //   variants: [
            //     { id: 'v1', weight: 'Medium', price: 999.99, originalPrice: 1199.99, stock: 12 },
            //     { id: 'v2', weight: 'Large', price: 1299.99, originalPrice: 1499.99, stock: 8 },
            //     { id: 'v3', weight: 'XL', price: 1599.99, originalPrice: 1799.99, stock: 5 }
            //   ],
            //   rating: 4.8,
            //   reviewCount: 34,
            //   tags: ['dog', 'bed', 'memory-foam', 'orthopedic', 'comfort'],
            //   createdAt: '2024-02-05T16:45:00Z'
            // },
            // {
            //   id: 'demo-6',
            //   name: 'Natural Dog Treats - Chicken Jerky',
            //   shortDescription: 'All-natural chicken jerky treats made from premium ingredients.',
            //   description: 'Premium all-natural chicken jerky treats made from free-range chicken. No artificial preservatives or additives. Perfect for training and rewards.',
            //   brand: 'NaturalBites',
            //   category: { id: 'dog-treats', name: 'Dog Treats' },
            //   subcategory: 'Jerky Treats',
            //   productType: 'Treats',
            //   lifeStage: 'All Life Stages',
            //   breedSize: 'All Breeds',
            //   proteinSource: 'Chicken',
            //   specialDiet: 'Natural',
            //   price: 199.99,
            //   originalPrice: 249.99,
            //   stockQuantity: 35,
            //   inStock: true,
            //   weight: '200g',
            //   imageUrl: 'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=400&h=400&fit=crop&crop=center',
            //   badges: ['Natural', 'Training Treats'],
            //   features: [
            //     'Free-range chicken',
            //     'No artificial preservatives',
            //     'High protein content',
            //     'Perfect for training'
            //   ],
            //   ingredients: 'Chicken Breast, Natural Flavoring',
            //   benefits: 'High protein, Natural ingredients, Training aid, Healthy reward',
            //   variants: [
            //     { id: 'v1', weight: '100g', price: 119.99, originalPrice: 149.99, stock: 25 },
            //     { id: 'v2', weight: '200g', price: 199.99, originalPrice: 249.99, stock: 35 },
            //     { id: 'v3', weight: '500g', price: 449.99, originalPrice: 549.99, stock: 18 }
            //   ],
            //   rating: 4.6,
            //   reviewCount: 89,
            //   tags: ['dog', 'treats', 'chicken', 'natural', 'training'],
            //   createdAt: '2024-01-30T09:15:00Z'
            // }
          ];
          console.log('Admin Panel: Created sample products for demonstration');
        }
      }

      // Normalize backend products for admin panel
      const normalizedProducts = apiProducts.map((p) => {
        // Extract variants from metadata if available
        const variantsFromMetadata = p?.metadata?.variants || [];
        const processedVariants = variantsFromMetadata.map(variant => ({
          id: variant.id || 'default',
          name: variant.weight || variant.size || variant.name || 'Default',
          weight: variant.weight,
          size: variant.size,
          price: parseFloat(variant.price) || 0,
          originalPrice: parseFloat(variant.originalPrice) || 0,
          stock: parseInt(variant.stock) || 0,
          inStock: (parseInt(variant.stock) || 0) > 0
        }));
        
        // Also check if variants exist in p.variants (fallback)
        const fallbackVariants = p?.variants || [];
        if (processedVariants.length === 0 && fallbackVariants.length > 0) {
          fallbackVariants.forEach(variant => {
            processedVariants.push({
              id: variant.id || 'default',
              name: variant.weight || variant.size || variant.name || 'Default',
              weight: variant.weight,
              size: variant.size,
              price: parseFloat(variant.price) || parseFloat(p?.price) || 0,
              originalPrice: parseFloat(variant.originalPrice) || parseFloat(p?.originalPrice) || 0,
              stock: parseInt(variant.stock) || 0,
              inStock: (parseInt(variant.stock) || 0) > 0
            });
          });
        }
        
        return {
          id: p?.id,
          name: p?.name || p?.title || 'Unnamed Product',
          category: p?.category || p?.categoryId || p?.subcategory || 'misc',
          subcategory: p?.subcategory,
          brand: p?.brand || p?.manufacturer || 'Brand',
          price: p?.price ?? p?.salePrice ?? p?.mrp ?? 0,
          originalPrice: p?.originalPrice ?? p?.mrp ?? p?.price ?? 0,
          rating: p?.rating ?? p?.ratingValue ?? 0,
          image: resolveImageUrl(p),
          imageUrl: p?.imageUrl || null, // keep original relative URL for edit form
          description: p?.description || 'No description available',
          inStock: p?.inStock !== false, // Default to true if not specified
          weight: p?.weight || 'N/A',
          stockQuantity: p?.stockQuantity ?? p?.quantity ?? 0,
          variants: processedVariants,
          hasVariants: processedVariants.length > 0,
          metadata: p?.metadata || {} // Keep full metadata for reference
        };
      });

      setProducts(normalizedProducts);
    } catch (error) {
      console.error('Admin Panel: Error loading products:', error);
      // Set empty array as fallback
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Format variant label consistently: prefer explicit units (g/kg) when weight is numeric
  const formatVariantLabel = (variant) => {
    const raw = String(variant?.weight || variant?.size || variant?.name || '').trim();
    if (!raw) return 'Variant';

    const lower = raw.toLowerCase();
    // If weight already mentions kg explicitly
    const numericStr = String(raw).replace(/[^0-9.]/g, '');
    const n = Number(numericStr);

    if (lower.includes('kg')) {
      // normalize: extract number if present
      if (!Number.isNaN(n) && n > 0) return `${n} kg`;
      return raw.replace(/kg/i, 'kg').trim();
    }
    if (lower.includes('g') || lower.includes('gram')) {
      if (!Number.isNaN(n) && n > 0) return `${n} g`;
      return raw.replace(/grams?/i, 'g').trim();
    }

    // If raw is purely numeric, infer units: >=1000 => kg, else g
    if (!Number.isNaN(n) && n > 0) {
      if (n >= 1000) {
        const kg = (n / 1000).toString().replace(/\.0+$/, '');
        return `${kg} kg`;
      }
      return `${n} g`;
    }

    // Fallback: return original
    return raw;
  };

  // Remove stray text nodes that are just '0' inside the product grid (cleanup for legacy stray renders)
  useEffect(() => {
    const grid = document.querySelector('.grid.grid-cols-2');
    if (!grid) return;
    // iterate child nodes and remove text nodes that equal '0' when trimmed
    for (const node of Array.from(grid.childNodes || [])) {
      for (const child of Array.from(node.childNodes || [])) {
        if (child.nodeType === Node.TEXT_NODE) {
          if (child.textContent && child.textContent.trim() === '0') {
            child.parentNode.removeChild(child);
          }
        }
      }
    }
  }, [products]);

  // Additional pass: remove any element that contains only the text '0' (no child elements)
  useEffect(() => {
    try {
      const grid = document.querySelector('.grid.grid-cols-2');
      if (!grid) return;
      const all = grid.querySelectorAll('*');
      for (const el of Array.from(all)) {
        if (el.children && el.children.length === 0) {
          const txt = (el.textContent || '').trim();
          if (txt === '0') {
            el.parentNode && el.parentNode.removeChild(el);
          }
        }
      }
    } catch (e) {}
  }, [products]);

  const filteredProducts = (products || []).filter(product => {
    const matchesSearch = (product?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product?.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product?.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // section can be 'dogs' | 'cats' | 'pharmacy' or undefined
  const handleAddProduct = (section) => {
    setEditingProduct(null);
    setShowProductForm(true);
    // store the section in editingProduct for the form to pick up (null product means new)
    setEditingProduct({ __newSection: section });
  };

  const handleEditProduct = async (product) => {
    try {
      setLoading(true);
      // Fetch authoritative product data directly (bypass cache) so the edit form sees latest DB state
      const resp = await apiClient.get(`/admin/products/${product.id}`);
      const full = resp?.data || product;
      setEditingProduct(full);
      setShowProductForm(true);
    } catch (err) {
      console.error('Failed to load product for editing:', err);
      alert('Failed to load product details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    const confirmMessage = 'Are you sure you want to delete this product? This will permanently remove the product and all its related data (cart items, order history, wishlist entries).';
    
    if (window.confirm(confirmMessage)) {
      try {
        setLoading(true);
        await dataService.deleteProduct(productId);
        console.log('Product deleted successfully:', productId);
        await loadProducts(); // Reload products after successful deletion
      } catch (error) {
        console.error('Error deleting product:', error);
        
        // Show user-friendly error message
        if (error.message?.includes('Internal Server Error')) {
          alert('Server error occurred while deleting the product. Please try again or contact support.');
        } else if (error.message?.includes('404')) {
          alert('Product not found. It may have already been deleted.');
          await loadProducts(); // Refresh the list
        } else {
          alert('Failed to delete product: ' + error.message);
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleProductSaved = () => {
    setShowProductForm(false);
    setEditingProduct(null);
    loadProducts();
  };

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await dataService.getCategories();
        setCategories(response.data);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    loadCategories();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-heading font-bold text-foreground">Product Management</h1>
            <div className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs ${
              backendStatus === 'online' ? 'bg-green-100 text-green-800' : 
              backendStatus === 'offline' ? 'bg-red-100 text-red-800' : 
              'bg-yellow-100 text-yellow-800'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                backendStatus === 'online' ? 'bg-green-600' : 
                backendStatus === 'offline' ? 'bg-red-600' : 
                'bg-yellow-600'
              }`}></div>
              <span>{backendStatus === 'online' ? 'Online' : backendStatus === 'offline' ? 'Offline' : 'Checking...'}</span>
            </div>
          </div>
          <p className="text-muted-foreground">
            Manage your product catalog
            {backendStatus === 'offline' && ' (Using local fallback data)'}
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => handleAddProduct('dogs')} className="flex items-center space-x-2" disabled={loading}>
            <Plus size={18} />
            <span>Add Product</span>
          </Button>
          {/* <Button onClick={() => handleAddProduct('cats')} className="flex items-center space-x-2" disabled={loading}>
            <Plus size={18} />
            <span>Add Cat Product</span>
          </Button> */}
          {/* <Button onClick={() => handleAddProduct('pharmacy')} className="flex items-center space-x-2" disabled={loading}>
            <Plus size={18} />
            <span>Add Pharmacy Product</span>
          </Button> */}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-border bg-background text-foreground"
            >
              <option value="" key="all-categories">All Categories</option>
              {categories.map((category, index) => (
                <option key={index} value={category.id || category}>
                  {category.name || category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-md transition-all duration-200 h-fit">
            {/* Product Image */}
            <div className="aspect-square bg-muted relative group">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                onError={(e) => handleImageError(e, product.name)}
              />
              {/* Product Badges */}
              {product.badges && product.badges.length > 0 && (
                <div className="absolute top-1 left-1">
                  <span className="bg-primary text-primary-foreground px-1.5 py-0.5 text-xs rounded">
                    {product.badges[0]}
                  </span>
                </div>
              )}
              {/* Action Buttons */}
              <div className="absolute top-1 right-1 flex space-x-1">
                <button
                  onClick={() => handleEditProduct(product)}
                  className="p-1.5 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-sm"
                  title="Edit Product"
                >
                  <Edit size={14} className="text-primary" />
                </button>
               
                <button
                  onClick={() => handleDeleteProduct(product.id)}
                  disabled={loading}
                  className="p-1.5 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  title="Delete Product"
                >
                  <Trash2 size={14} className="text-destructive" />
                </button>
              </div>
            </div>

            {/* Product Details */}
            <div className="p-2.5">
              {/* Product Name and Price Row */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm text-foreground line-clamp-2 leading-tight mb-1">
                    {product.name}
                  </h3>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-sm font-bold text-primary">
                      ₹{product.price?.toFixed(2) || '0.00'}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-xs text-muted-foreground line-through">
                        ₹{product.originalPrice?.toFixed(0)}
                      </span>
                    )}
                  </div>
                </div>
                {product.hasVariants && (
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium ml-2">
                    {product.variants.length} variants
                  </span>
                )}
              </div>

              {/* Category and Brand */}
              <div className="flex items-center justify-between mb-2 text-xs">
                {product.category && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                    {typeof product.category === 'object' ? product.category.name : product.category}
                  </span>
                )}
                {product.brand && (
                  <span className="text-muted-foreground font-medium">{product.brand}</span>
                )}
              </div>

              {/* Variants - Compact Display */}
              {product.hasVariants && product.variants.length > 0 ? (
                <div className="mb-2">
                  {/* Variant Summary Bar */}
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                    <div className="flex items-center space-x-3 text-xs">
                      <span className="font-medium text-gray-700">
                        ₹{Math.min(...product.variants.map(v => v.price)).toFixed(0)} - ₹{Math.max(...product.variants.map(v => v.price)).toFixed(0)}
                      </span>
                      <span className="text-gray-500">•</span>
                      <span className={`font-medium ${
                        product.variants.reduce((sum, v) => sum + v.stock, 0) > 10 ? 'text-green-600' :
                        product.variants.reduce((sum, v) => sum + v.stock, 0) > 0 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {product.variants.reduce((sum, v) => sum + v.stock, 0)} total stock
                      </span>
                    </div>
                    {product.variants.some(v => v.stock === 0) && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                        {product.variants.filter(v => v.stock === 0).length} out
                      </span>
                    )}
                  </div>
                  
                  {/* Top Variants - Horizontal Pills */}
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {product.variants.slice(0, 4).map((variant, index) => (
                      <div key={variant.id || index} className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs border ${
                        variant.stock > 0 
                          ? 'bg-green-50 border-green-200 text-green-800'
                          : 'bg-red-50 border-red-200 text-red-800'
                      }`}>
                        <span className="font-medium">{formatVariantLabel(variant)}</span>
                        <span className="text-xs font-bold">{variant.stock}</span>
                      </div>
                    ))}
                    {product.variants.length > 4 && (
                      <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                        +{product.variants.length - 4}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                /* No Variants - Stock Display */
                <div className="mb-2">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                    <span className="text-xs text-gray-600 font-medium">
                      Main Product Stock
                    </span>
                    {product.stockQuantity > 0 ? (
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        product.stockQuantity > 10 ? 'bg-green-100 text-green-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {product.stockQuantity} units
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">&nbsp;</span>
                    )}
                  </div>
                </div>
              )}

              {/* Footer - Rating (ID removed from UI) */}
              <div className="flex items-center justify-end text-xs text-muted-foreground border-t pt-2">
                {product.rating && (
                  <div className="flex items-center space-x-1">
                    <span className="text-yellow-500">⭐</span>
                    <span className="font-medium">{product.rating?.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="col-span-full text-center py-8">
          <p className="text-muted-foreground">No products found matching your criteria.</p>
        </div>
      )}

      {/* Enhanced Product Form Modal */}
      {showProductForm && (
        <EnhancedProductForm
          product={editingProduct}
          onSave={handleProductSaved}
          onCancel={() => { setShowProductForm(false); setEditingProduct(null); }}
          // Pass the full categories list to the form; the form will filter by pet type internally.
          allowedCategories={categories}
          defaultSection={editingProduct && editingProduct.__newSection}
        />
      )}
    </div>
  );
};

export default ProductManagement;