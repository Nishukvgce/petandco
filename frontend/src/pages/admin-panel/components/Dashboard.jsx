import React, { useState, useEffect } from 'react';
import { 
  Package, Users, ShoppingCart, DollarSign, TrendingUp, TrendingDown, 
  AlertTriangle, Plus, BarChart3, Calendar, Eye, RefreshCw, Download, FileText, X
} from 'lucide-react';
import dataService from '../../../services/dataService';
import userApi from '../../../services/userApi';
import orderApi from '../../../services/orderApi';
import productApi from '../../../services/productApi';
import { 
  exportToCSV, 
  filterDataByDateRange, 
  formatOrdersForCSV, 
  formatUsersForCSV, 
  formatProductsForCSV, 
  formatRevenueDataForCSV,
  generateSummaryReport 
} from '../../../utils/csvExport';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: [],
    lowStockProducts: [],
    lowStockVariants: [],
    monthlyRevenue: 0,
    weeklyOrders: 0,
    topSellingProducts: [],
    pendingOrders: 0,
    completedOrders: 0,
    averageOrderValue: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [showVariantPicker, setShowVariantPicker] = useState(false);
  const [variantCandidates, setVariantCandidates] = useState([]);
  const [rawData, setRawData] = useState({
    products: [],
    users: [],
    orders: []
  });
  const [showExportMenu, setShowExportMenu] = useState(false);
  // Stock alert thresholds (can be moved to config or admin settings later)
  const VARIANT_OUT_OF_STOCK_THRESHOLD = 0; // exactly zero -> out of stock
  const VARIANT_LOW_STOCK_THRESHOLD = 5;   // <= this (and >0) -> low stock
  const PRODUCT_LOW_STOCK_THRESHOLD = 10;  // <= this -> low stock for non-variant products

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showExportMenu && !event.target.closest('.relative')) {
        setShowExportMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showExportMenu]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get all data from backend APIs
      const [productsResponse, usersResponse, ordersResponse, orderStats] = await Promise.all([
        dataService.getProducts(),
        // Users endpoint returns non-admin users from backend
        userApi.getAll().catch(() => []),
        // Orders endpoint returns list of orders (DTOs)
        orderApi.getAllOrders().catch(() => []),
        // Optional: order statistics for authoritative totals
        orderApi.getOrderStatistics().catch(() => null)
      ]);

      const products = productsResponse?.data || [];
      const users = Array.isArray(usersResponse) ? usersResponse : (usersResponse?.data || []);
      const orders = Array.isArray(ordersResponse) ? ordersResponse : (ordersResponse?.data || []);
      // Backend already returns non-admin users from /api/admin/users
      const customerUsers = users;
      
      // Store raw data for CSV export
      setRawData({
        products,
        users,
        orders
      });
      
      // Calculate revenue metrics
      const computedTotalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
      const totalRevenue = (orderStats && typeof orderStats.totalRevenue === 'number')
        ? orderStats.totalRevenue
        : computedTotalRevenue;
      const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
      
      // Calculate date-based metrics
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentWeek = getWeekNumber(now);
      
      const monthlyOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === now.getFullYear();
      });
      
      const weeklyOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return getWeekNumber(orderDate) === currentWeek && orderDate.getFullYear() === now.getFullYear();
      });
      
      const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      
      // Order status counts
      const pendingOrders = (orderStats && typeof orderStats.pendingOrders === 'number')
        ? orderStats.pendingOrders
        : orders.filter(order => (order.status || '').toLowerCase() === 'pending').length;
      const deliveredCount = (orderStats && typeof orderStats.deliveredOrders === 'number')
        ? orderStats.deliveredOrders
        : orders.filter(order => (order.status || '').toLowerCase() === 'delivered').length;
      const completedOrders = Math.max(deliveredCount, orders.filter(order => {
        const st = (order.status || '').toLowerCase();
        return st === 'delivered' || st === 'completed';
      }).length);
      
      // Product analytics with variant-aware stock checking
      const lowStockProducts = [];
      const lowStockVariants = [];
      const outOfStockVariants = [];

      products.forEach(product => {
        const variants = product.metadata?.variants || [];

        if (Array.isArray(variants) && variants.length > 0) {
          // For products with variants, check each variant's stock
          let hasLowStockVariant = false;
          // Compute total stock across numeric variant stocks
          let productVariantTotal = 0;

          variants.forEach(variant => {
            // Robust parse: treat missing or non-numeric stock as 'unknown' (null)
            let rawStock = variant?.stock;
            let stock = null;
            if (rawStock !== null && rawStock !== undefined && rawStock !== '') {
              const parsed = parseInt(rawStock, 10);
              if (!Number.isNaN(parsed)) stock = parsed;
            }

            const variantData = {
              id: `${product.id}-${variant.id}`,
              productId: product.id,
              productName: product.name,
              variantId: variant.id,
              variantName: variant.weight || variant.size || variant.name || 'Variant',
              price: parseFloat(variant.price) || parseFloat(product.price) || 0,
              originalPrice: parseFloat(variant.originalPrice) || parseFloat(product.originalPrice) || 0,
              stock: stock,
              product: product
            };

            // Accumulate numeric stock for product total
            if (typeof stock === 'number' && !Number.isNaN(stock)) {
              productVariantTotal += stock;
            }

            // Only flag variants when stock is explicitly provided as a number
            // and when variant has a valid price (> 0). This avoids placeholder
            // variants (no price) or missing stock from triggering alerts.
            const hasValidPrice = (variantData.price && variantData.price > 0) || (variantData.originalPrice && variantData.originalPrice > 0);
            if (hasValidPrice && stock === VARIANT_OUT_OF_STOCK_THRESHOLD) {
              outOfStockVariants.push(variantData);
              hasLowStockVariant = true;
            } else if (hasValidPrice && stock !== null && stock <= VARIANT_LOW_STOCK_THRESHOLD) {
              // stock > 0 implied because out-of-stock handled above
              lowStockVariants.push(variantData);
              hasLowStockVariant = true;
            }
          });

          // Attach computed total variant stock to the product for UI and reporting
          product.totalVariantStock = productVariantTotal;

          // If no variant was flagged low/out, decide product-level low stock using
          // the computed sum of numeric variant stocks (productVariantTotal) rather
          // than the possibly stale `product.stockQuantity` field.
          if (!hasLowStockVariant) {
            const total = (typeof productVariantTotal === 'number' && !Number.isNaN(productVariantTotal)) ? productVariantTotal : null;
            if (total !== null && total < PRODUCT_LOW_STOCK_THRESHOLD) {
              lowStockProducts.push(product);
            }
          }
        } else {
          // For products without variants, check main stock
          const mainStockRaw = product.stockQuantity;
          const mainStock = (mainStockRaw === null || mainStockRaw === undefined || mainStockRaw === '') ? null : parseInt(mainStockRaw, 10);
          if (!Number.isNaN(mainStock) && mainStock !== null && mainStock < PRODUCT_LOW_STOCK_THRESHOLD) {
            lowStockProducts.push(product);
          }
        }
      });
      
      // Combine low stock and out of stock variants for display
      const allLowStockVariants = [...lowStockVariants, ...outOfStockVariants];
      
      const recentOrders = [...orders]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      
      // Top selling products (based on order frequency)
      const productSales = {};
      orders.forEach(order => {
        if (order.items) {
          order.items.forEach(item => {
            const productId = item.productId || item.id;
            if (productId) {
              productSales[productId] = (productSales[productId] || 0) + (item.quantity || 1);
            }
          });
        }
      });
      
      const topSellingProducts = Object.entries(productSales)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([productId, quantity]) => {
          const product = products.find(p => p.id == productId);
          return product ? { ...product, soldQuantity: quantity } : null;
        })
        .filter(Boolean);
      
      setStats({
        totalProducts: products.length,
        // Customers are the non-admin users returned by backend
        totalUsers: users.length,
        totalOrders: (orderStats && typeof orderStats.totalOrders === 'number') ? orderStats.totalOrders : orders.length,
        totalRevenue,
        monthlyRevenue,
        weeklyOrders: weeklyOrders.length,
        averageOrderValue,
        pendingOrders,
        completedOrders,
        recentOrders,
        lowStockProducts,
        lowStockVariants: allLowStockVariants,
        outOfStockVariants: outOfStockVariants,
        topSellingProducts
      });
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  const getWeekNumber = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
  };
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
  };

  const handleQuickRestockProduct = async (productId) => {
    try {
      // Load current product details from backend
      const productsRes = await dataService.getProducts();
      const product = (productsRes?.data || []).find(p => p.id === productId);
      if (!product) {
        alert('Product not found. Please refresh and try again.');
        return;
      }

      const variants = product.metadata?.variants || [];

      // If product has variants, prefer variant-level restock flow
      if (Array.isArray(variants) && variants.length > 0) {
        // Try to find a low or out-of-stock variant to restock
        // Collect candidate variants which are low/out and have valid price
        const candidates = [];
        for (const v of variants) {
          const raw = v?.stock;
          let s = null;
          if (raw !== null && raw !== undefined && raw !== '') {
            const parsed = parseInt(raw, 10);
            if (!Number.isNaN(parsed)) s = parsed;
          }
          const price = parseFloat(v?.price) || parseFloat(product.price) || 0;
          const hasValidPrice = price > 0 || (parseFloat(v?.originalPrice) || 0) > 0;
          if (hasValidPrice && (s === VARIANT_OUT_OF_STOCK_THRESHOLD || (s !== null && s <= VARIANT_LOW_STOCK_THRESHOLD))) {
            candidates.push({ rawVariant: v, stock: s, price });
          }
        }

        if (candidates.length === 1) {
          const tv = candidates[0].rawVariant;
          const stockVal = candidates[0].stock ?? 0;
          const variantData = {
            id: `${product.id}-${tv.id}`,
            productId: product.id,
            productName: product.name,
            variantId: tv.id,
            variantName: tv.weight || tv.size || tv.name || 'Variant',
            price: candidates[0].price,
            originalPrice: parseFloat(tv?.originalPrice) || parseFloat(product.originalPrice) || 0,
            stock: stockVal,
            product
          };
          setSelectedVariant(variantData);
          setShowStockModal(true);
          return;
        }

        // If multiple or none, open variant picker showing either low candidates or all purchasable variants
        const pickerList = (candidates.length > 0 ? candidates.map(c => c.rawVariant) : variants)
          .filter(v => {
            const p = parseFloat(v?.price) || parseFloat(product.price) || 0;
            return p > 0 || (parseFloat(v?.originalPrice) || 0) > 0;
          })
          .map(v => ({
            id: `${product.id}-${v.id}`,
            productId: product.id,
            productName: product.name,
            variantId: v.id,
            variantName: v.weight || v.size || v.name || 'Variant',
            price: parseFloat(v?.price) || parseFloat(product.price) || 0,
            originalPrice: parseFloat(v?.originalPrice) || parseFloat(product.originalPrice) || 0,
            stock: (v?.stock !== null && v?.stock !== undefined && v?.stock !== '' && !Number.isNaN(parseInt(v.stock, 10))) ? parseInt(v.stock, 10) : null,
            product
          }));

        if (pickerList.length > 0) {
          setVariantCandidates(pickerList);
          setShowVariantPicker(true);
          return;
        }
      }

      // Fallback: restock main product stockQuantity
      const restockAmount = prompt('Enter quantity to add to stock:');
      if (restockAmount && !isNaN(restockAmount) && parseInt(restockAmount) > 0) {
        const newStock = (product.stockQuantity || 0) + parseInt(restockAmount, 10);
        const payload = { ...product, stockQuantity: newStock, inStock: newStock > 0 };

        // Persist to backend
        await productApi.update(productId, payload);

        await loadDashboardData(); // Refresh data from backend
        alert(`Stock updated! ${product.name} now has ${newStock} items in stock.`);
      }
    } catch (error) {
      console.error('Error updating stock:', error);
      alert('Failed to update stock. Please try again.');
    }
  };

  const handleQuickRestockVariant = (variant) => {
    setSelectedVariant(variant);
    setShowStockModal(true);
  };

  const handlePickVariant = (variant) => {
    setSelectedVariant(variant);
    setShowVariantPicker(false);
    setShowStockModal(true);
  };

  const handleUpdateVariantStock = async (newStock) => {
    if (!selectedVariant) return;
    
    try {
      const product = selectedVariant.product;
      const variants = product.metadata?.variants || [];
      
      // Update the specific variant stock
      const updatedVariants = variants.map(v => {
        if (v.id === selectedVariant.variantId) {
          return { ...v, stock: newStock };
        }
        return v;
      });
      
      // Update product metadata
      const updatedMetadata = { ...product.metadata, variants: updatedVariants };
      const payload = { ...product, metadata: updatedMetadata };
      
      // Persist to backend using variant-specific endpoint
      await productApi.updateVariantStock(selectedVariant.productId, selectedVariant.variantId, newStock);
      
      await loadDashboardData(); // Refresh data
      setShowStockModal(false);
      setSelectedVariant(null);
      alert(`Stock updated! ${selectedVariant.variantName} now has ${newStock} items in stock.`);
    } catch (error) {
      console.error('Error updating variant stock:', error);
      alert('Failed to update stock. Please try again.');
    }
  };

  
  const handleBulkRestock = () => {
    // Show modal or navigate to bulk stock management
    // alert('Bulk restock feature - would open a dedicated stock management interface');
  };

  // CSV Export Functions
  const handleExportOrders = (filterType) => {
    const filteredOrders = filterDataByDateRange(rawData.orders, filterType);
    const formattedData = formatOrdersForCSV(filteredOrders);
    const filename = `orders_${filterType}_${new Date().toISOString().split('T')[0]}`;
    exportToCSV(formattedData, filename);
    setShowExportMenu(false);
  };

  const handleExportUsers = (filterType) => {
    const filteredUsers = filterDataByDateRange(rawData.users.filter(u => u.role === 'customer'), filterType);
    const formattedData = formatUsersForCSV(filteredUsers);
    const filename = `users_${filterType}_${new Date().toISOString().split('T')[0]}`;
    exportToCSV(formattedData, filename);
    setShowExportMenu(false);
  };

  const handleExportProducts = () => {
    const formattedData = formatProductsForCSV(rawData.products);
    const filename = `products_${new Date().toISOString().split('T')[0]}`;
    exportToCSV(formattedData, filename);
    setShowExportMenu(false);
  };

  const handleExportRevenue = (filterType) => {
    const formattedData = formatRevenueDataForCSV(rawData.orders, filterType);
    const filename = `revenue_${filterType}_${new Date().toISOString().split('T')[0]}`;
    exportToCSV(formattedData, filename);
    setShowExportMenu(false);
  };

  const handleExportSummary = (filterType) => {
    const summaryData = generateSummaryReport(rawData.products, rawData.users, rawData.orders, filterType);
    const filename = `summary_report_${filterType}_${new Date().toISOString().split('T')[0]}`;
    exportToCSV(summaryData, filename);
    setShowExportMenu(false);
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, color = 'primary' }) => (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-body text-muted-foreground">{title}</p>
          <p className="text-2xl font-heading font-bold text-foreground mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}/10 flex-shrink-0`}>
          <Icon className={`w-6 h-6 text-${color}`} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening with your store.</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Export Button with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center space-x-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
            
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-card border border-border rounded-lg shadow-lg z-50">
                <div className="p-3">
                  <div className="space-y-3">
                    {/* Summary Report */}
                    <div className="border-b border-border pb-3">
                      <h3 className="font-medium text-foreground mb-2 flex items-center">
                        <FileText className="w-4 h-4 mr-2" />
                        Summary Report
                      </h3>
                      <div className="flex flex-wrap gap-1">
                        {['daily', 'weekly', 'monthly', 'yearly'].map(period => (
                          <button
                            key={period}
                            onClick={() => handleExportSummary(period)}
                            className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/80 transition-colors capitalize"
                          >
                            {period}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Orders */}
                    <div className="border-b border-border pb-3">
                      <h3 className="font-medium text-foreground mb-2">Orders</h3>
                      <div className="flex flex-wrap gap-1">
                        {['daily', 'weekly', 'monthly', 'yearly', 'all'].map(period => (
                          <button
                            key={period}
                            onClick={() => handleExportOrders(period)}
                            className="px-2 py-1 text-xs bg-accent text-accent-foreground rounded hover:bg-accent/80 transition-colors capitalize"
                          >
                            {period}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Users */}
                    <div className="border-b border-border pb-3">
                      <h3 className="font-medium text-foreground mb-2">Customers</h3>
                      <div className="flex flex-wrap gap-1">
                        {['daily', 'weekly', 'monthly', 'yearly', 'all'].map(period => (
                          <button
                            key={period}
                            onClick={() => handleExportUsers(period)}
                            className="px-2 py-1 text-xs bg-success text-success-foreground rounded hover:bg-success/80 transition-colors capitalize"
                          >
                            {period}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Revenue */}
                    <div className="border-b border-border pb-3">
                      <h3 className="font-medium text-foreground mb-2">Revenue</h3>
                      <div className="flex flex-wrap gap-1">
                        {['daily', 'weekly', 'monthly', 'yearly'].map(period => (
                          <button
                            key={period}
                            onClick={() => handleExportRevenue(period)}
                            className="px-2 py-1 text-xs bg-warning text-warning-foreground rounded hover:bg-warning/80 transition-colors capitalize"
                          >
                            {period}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Products */}
                    <div>
                      <h3 className="font-medium text-foreground mb-2">Products</h3>
                      <button
                        onClick={handleExportProducts}
                        className="px-3 py-1 text-sm bg-muted text-muted-foreground rounded hover:bg-muted/80 transition-colors"
                      >
                        Export All Products
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-2 border-t border-border">
                  <button
                    onClick={() => setShowExportMenu(false)}
                    className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
                  >
                    Close Menu
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          subtitle={`${stats.lowStockProducts.length} low stock`}
          icon={Package}
          color="primary"
        />
        <StatCard
          title="Total Customers"
          value={stats.totalUsers}
          subtitle="Active users"
          icon={Users}
          color="success"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          subtitle={`${stats.pendingOrders} pending`}
          icon={ShoppingCart}
          color="warning"
        />
        <StatCard
          title="Total Revenue"
          value={`₹${stats.totalRevenue.toLocaleString()}`}
          subtitle={`Avg: ₹${Math.round(stats.averageOrderValue)}`}
          icon={DollarSign}
          color="success"
        />
      </div>
      
      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Monthly Revenue"
          value={`₹${stats.monthlyRevenue.toLocaleString()}`}
          subtitle="This month"
          icon={BarChart3}
          color="primary"
        />
        <StatCard
          title="Weekly Orders"
          value={stats.weeklyOrders}
          subtitle="This week"
          icon={Calendar}
          color="success"
        />
        <StatCard
          title="Pending Orders"
          value={stats.pendingOrders}
          subtitle="Need attention"
          icon={AlertTriangle}
          color="warning"
        />
        <StatCard
          title="Completed Orders"
          value={stats.completedOrders}
          subtitle="Successfully delivered"
          icon={ShoppingCart}
          color="success"
        />
      </div>

      {/* Dashboard Sections - 2x2 Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Overview */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-heading font-semibold text-foreground">Revenue Overview</h2>
            <BarChart3 className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Revenue</span>
              <span className="font-semibold text-foreground">₹{stats.totalRevenue.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">This Month</span>
              <span className="font-semibold text-primary">₹{stats.monthlyRevenue.toLocaleString()}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div 
                className="bg-primary h-3 rounded-full transition-all duration-300"
                style={{ 
                  width: `${stats.totalRevenue > 0 ? Math.min((stats.monthlyRevenue / stats.totalRevenue) * 100, 100) : 0}%` 
                }}
              ></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-success/10 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Avg Order</p>
                <p className="font-semibold text-success">₹{Math.round(stats.averageOrderValue)}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="font-semibold text-primary">
                  {stats.totalOrders > 0 ? Math.round((stats.completedOrders / stats.totalOrders) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-heading font-semibold text-foreground">Top Selling</h2>
            <Eye className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            {stats.topSellingProducts.length > 0 ? (
              stats.topSellingProducts.slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-body font-medium text-foreground">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.weight || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-body font-bold text-primary">{product.soldQuantity} sold</p>
                    <p className="text-sm text-success">₹{product.price}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Eye className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No sales data yet</p>
              </div>
            )}
          </div>
        </div>
        {/* Stock Alerts */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-warning" />
              <h2 className="text-lg font-heading font-semibold text-foreground">Stock Alerts</h2>
              {(stats.lowStockProducts.length > 0 || stats.lowStockVariants.length > 0) && (
                <span className="ml-2 bg-warning text-warning-foreground px-2 py-1 rounded-full text-xs font-medium">
                  {stats.lowStockProducts.length + stats.lowStockVariants.length}
                </span>
              )}
            </div>
            <button
              onClick={handleBulkRestock}
              className="flex items-center space-x-2 px-3 py-1 bg-primary/10 text-primary rounded-md text-sm hover:bg-primary/20 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-3">
            {/* Low Stock Products */}
            {stats.lowStockProducts.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Low Stock Products</h3>
                {stats.lowStockProducts.slice(0, 3).map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-warning/10 rounded-lg mb-2">
                    <div className="flex-1">
                      <p className="font-body font-medium text-foreground">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.weight || 'N/A'}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        {(() => {
                          const total = (product.totalVariantStock !== undefined && product.totalVariantStock !== null)
                            ? product.totalVariantStock
                            : (product.stockQuantity || 0);
                          const destructive = total <= 5;
                          return (
                            <p className={`font-body font-bold ${destructive ? 'text-destructive' : 'text-warning'}`}>
                              {total} left
                            </p>
                          );
                        })()}
                      </div>
                      <button
                        onClick={() => handleQuickRestockProduct(product.id)}
                        className="px-3 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors text-sm"
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Low Stock & Out of Stock Variants */}
            {stats.lowStockVariants.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                  Variant Stock Alerts
                  <span className="ml-2 bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
                    {stats.lowStockVariants.length}
                  </span>
                  {stats.outOfStockVariants.length > 0 && (
                    <span className="ml-1 bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                      {stats.outOfStockVariants.length} Out
                    </span>
                  )}
                </h3>
                {stats.lowStockVariants.slice(0, 5).map((variant) => {
                  const isOutOfStock = variant.stock === 0;
                  const isLowStock = variant.stock <= 5 && variant.stock > 0;
                  
                  return (
                    <div key={variant.id} className={`flex items-center justify-between p-3 rounded-lg mb-2 border ${
                      isOutOfStock ? 'bg-red-50 border-red-200' : 
                      isLowStock ? 'bg-yellow-50 border-yellow-200' : 'bg-orange-50 border-orange-200'
                    }`}>
                      <div className="flex-1">
                        <p className="font-body font-medium text-foreground">{variant.productName}</p>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <span className="font-medium">{variant.variantName}</span>
                          <span className="text-gray-400">•</span>
                          <span className="font-semibold text-primary">₹{variant.price?.toFixed(2)}</span>
                          {variant.originalPrice && variant.originalPrice > variant.price && (
                            <span className="text-xs text-gray-400 line-through">
                              ₹{variant.originalPrice?.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <p className={`font-body font-bold ${
                            isOutOfStock ? 'text-red-600' : 
                            isLowStock ? 'text-yellow-600' : 'text-orange-600'
                          }`}>
                            {variant.stock} left
                          </p>
                          <p className={`text-xs ${
                            isOutOfStock ? 'text-red-500' : 
                            isLowStock ? 'text-yellow-500' : 'text-orange-500'
                          }`}>
                            {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'Very Low'}
                          </p>
                        </div>
                        <button
                          onClick={() => handleQuickRestockVariant(variant)}
                          className={`px-3 py-1 rounded hover:opacity-90 transition-colors text-sm font-medium ${
                            isOutOfStock ? 'bg-red-500 text-white' : 
                            isLowStock ? 'bg-yellow-500 text-white' : 'bg-orange-500 text-white'
                          }`}
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                  );
                })}
                
                {stats.lowStockVariants.length > 5 && (
                  <div className="text-center py-2">
                    <span className="text-sm text-muted-foreground">
                      +{stats.lowStockVariants.length - 5} more variants need attention
                    </span>
                  </div>
                )}
              </div>
            )}
            
            {stats.lowStockProducts.length === 0 && stats.lowStockVariants.length === 0 && (
              <div className="text-center py-8">
                <Package className="w-8 h-8 text-success mx-auto mb-2" />
                <p className="text-success font-medium">All products well stocked!</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-heading font-semibold text-foreground">Recent Orders</h2>
            <ShoppingCart className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            {stats.recentOrders.length > 0 ? (
              stats.recentOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
                  <div className="flex-1">
                    <p className="font-body font-medium text-foreground">#{order.id}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString('en-IN')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.shippingAddress?.firstName || order.customerName || 'Customer'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-body font-bold text-foreground">₹{(order.total || 0).toLocaleString()}</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium capitalize mt-1 ${
                      order.status === 'pending' ? 'bg-warning/20 text-warning' :
                      order.status === 'processing' ? 'bg-primary/20 text-primary' :
                      order.status === 'shipped' ? 'bg-blue-100 text-blue-600' :
                      order.status === 'delivered' || order.status === 'completed' ? 'bg-success/20 text-success' :
                      order.status === 'cancelled' ? 'bg-destructive/20 text-destructive' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <ShoppingCart className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No orders yet</p>
              </div>
            )}
          </div>
        </div>

      </div>
      
      {/* Stock Update Modal */}
      {showStockModal && selectedVariant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Update Stock</h3>
                <button
                  onClick={() => {
                    setShowStockModal(false);
                    setSelectedVariant(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mb-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium text-gray-900">{selectedVariant.productName}</p>
                  <p className="text-sm text-gray-600">{selectedVariant.variantName} - ₹{selectedVariant.price?.toFixed(2)}</p>
                  <p className="text-xs text-red-600 font-medium mt-1">Current stock: {selectedVariant.stock}</p>
                </div>
              </div>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const newStock = parseInt(formData.get('stock'));
                if (newStock >= 0) {
                  handleUpdateVariantStock(newStock);
                }
              }}>
                <div className="mb-4">
                  <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-2">
                    New Stock Quantity
                  </label>
                  <input
                    type="number"
                    id="stock"
                    name="stock"
                    min="0"
                    defaultValue={selectedVariant.stock}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the new stock quantity for this variant
                  </p>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowStockModal(false);
                      setSelectedVariant(null);
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors font-medium"
                  >
                    Update Stock
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Variant Picker Modal */}
      {showVariantPicker && variantCandidates && variantCandidates.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Select Variant to Update</h3>
              <button onClick={() => setShowVariantPicker(false)} className="text-gray-500 hover:text-gray-700">Close</button>
            </div>
            <div className="p-4 max-h-80 overflow-y-auto">
              {variantCandidates.map((v) => (
                <div key={v.id} className="flex items-center justify-between p-3 border-b">
                  <div>
                    <p className="font-medium text-foreground">{v.variantName}</p>
                    <p className="text-sm text-muted-foreground">Price: ₹{v.price?.toFixed?.(2) ?? v.price} • Stock: {v.stock === null ? 'N/A' : v.stock}</p>
                  </div>
                  <div>
                    <button onClick={() => handlePickVariant(v)} className="px-3 py-1 bg-orange-500 text-white rounded">Restock</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t flex justify-end">
              <button onClick={() => setShowVariantPicker(false)} className="px-4 py-2 bg-gray-200 rounded mr-2">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
