
import React, { useState, useEffect } from 'react';
import { Search, Eye, Package, Truck, CheckCircle, Download, Printer, AlertCircle, User, Mail, Phone, ChevronDown, ChevronUp } from 'lucide-react';
import orderApi from '../../../services/orderApi';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { downloadInvoice, printInvoice } from '../../../utils/invoiceGenerator';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingInvoice, setProcessingInvoice] = useState(null);
  const [expandedOrders, setExpandedOrders] = useState(new Set());

  // Helper: total units across all order items
  const getTotalUnits = (order) => {
    try {
      return (order?.items || []).reduce((sum, it) => sum + (parseInt(it?.quantity) || 0), 0);
    } catch {
      return order?.items?.length || 0;
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const allOrders = await orderApi.getAllOrders();
      setOrders(allOrders || []);
    } catch (err) {
      console.error('Error loading orders:', err);
      console.log('Admin Panel: Using sample order data for demonstration');
      
      // Create sample order data for demonstration
      const sampleOrders = [
        {
          id: 'ORD-001',
          orderNumber: 'PC-2024-001',
          status: 'delivered',
          total: 1299.99,
          subtotal: 1199.99,
          shippingFee: 100.00,
          discount: 0,
          paymentMethod: 'card',
          createdAt: '2024-11-05T10:30:00Z',
          user: {
            name: 'Sarah Johnson',
            email: 'sarah.johnson@email.com',
            phone: '+91 9876543210'
          },
          shipping: {
            name: 'Sarah Johnson',
            phone: '+91 9876543210',
            street: '123 Pet Street, Apt 4B',
            city: 'Bangalore',
            state: 'Karnataka',
            pincode: '560001'
          },
          items: [
            {
              id: 'item-1',
              productName: 'Royal Canin Adult Dog Food - Chicken & Rice',
              productImage: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=200&h=200&fit=crop&crop=center',
              brand: 'Royal Canin',
              variant: '1kg',
              quantity: 1,
              price: 899.99,
              category: 'Dog Food'
            },
            {
              id: 'item-2',
              productName: 'Interactive Dog Toy Ball',
              productImage: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=200&h=200&fit=crop&crop=center',
              brand: 'PetCo',
              variant: 'Medium',
              quantity: 1,
              price: 299.99,
              category: 'Dog Toys'
            }
          ]
        },
        {
          id: 'ORD-002',
          orderNumber: 'PC-2024-002',
          status: 'shipped',
          total: 189.98,
          subtotal: 179.98,
          shippingFee: 10.00,
          discount: 0,
          paymentMethod: 'cod',
          createdAt: '2024-11-03T14:45:00Z',
          user: {
            name: 'Raj Patel',
            email: 'raj.patel@gmail.com',
            phone: '+91 8765432109'
          },
          shipping: {
            name: 'Raj Patel',
            phone: '+91 8765432109',
            street: '456 Dog Avenue',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400001'
          },
          items: [
            {
              id: 'item-3',
              productName: 'Whiskas Cat Food - Ocean Fish Flavor',
              productImage: 'https://images.unsplash.com/photo-1548681528-6a5c45b66b42?w=200&h=200&fit=crop&crop=center',
              brand: 'Whiskas',
              variant: '85g',
              quantity: 2,
              price: 89.99,
              category: 'Cat Food'
            }
          ]
        },
        {
          id: 'ORD-003',
          orderNumber: 'PC-2024-003',
          status: 'processing',
          total: 1949.97,
          subtotal: 1849.97,
          shippingFee: 100.00,
          discount: 0,
          paymentMethod: 'upi',
          createdAt: '2024-11-02T09:15:00Z',
          user: {
            name: 'Priya Sharma',
            email: 'priya.sharma@yahoo.com',
            phone: '+91 7654321098'
          },
          shipping: {
            name: 'Priya Sharma',
            phone: '+91 7654321098',
            street: '789 Cat Lane',
            city: 'Chennai',
            state: 'Tamil Nadu',
            pincode: '600001'
          },
          items: [
            {
              id: 'item-4',
              productName: 'Comfortable Dog Bed - Memory Foam',
              productImage: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=200&h=200&fit=crop&crop=center',
              brand: 'ComfortPaws',
              variant: 'Large',
              quantity: 1,
              price: 1299.99,
              category: 'Dog Bedding'
            },
            {
              id: 'item-5',
              productName: 'Premium Cat Litter - Clumping Formula',
              productImage: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=200&h=200&fit=crop&crop=center',
              brand: 'Fresh Step',
              variant: '10kg',
              quantity: 1,
              price: 599.99,
              category: 'Cat Litter'
            }
          ]
        },
        {
          id: 'ORD-004',
          orderNumber: 'PC-2024-004',
          status: 'pending',
          total: 549.98,
          subtotal: 499.98,
          shippingFee: 50.00,
          discount: 0,
          paymentMethod: 'card',
          createdAt: '2024-11-01T16:20:00Z',
          user: {
            name: 'Mike Thompson',
            email: 'mike.thompson@outlook.com',
            phone: '+91 6543210987'
          },
          shipping: {
            name: 'Mike Thompson',
            phone: '+91 6543210987',
            street: '321 Pet Paradise',
            city: 'Hyderabad',
            state: 'Telangana',
            pincode: '500001'
          },
          items: [
            {
              id: 'item-6',
              productName: 'Natural Dog Treats - Chicken Jerky',
              productImage: 'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=200&h=200&fit=crop&crop=center',
              brand: 'NaturalBites',
              variant: '500g',
              quantity: 1,
              price: 449.99,
              category: 'Dog Treats'
            }
          ]
        },
        {
          id: 'ORD-005',
          orderNumber: 'PC-2024-005',
          status: 'cancelled',
          total: 799.98,
          subtotal: 799.98,
          shippingFee: 0.00,
          discount: 0,
          paymentMethod: 'wallet',
          createdAt: '2024-10-30T11:30:00Z',
          user: {
            name: 'Anita Kumar',
            email: 'anita.kumar@hotmail.com',
            phone: '+91 5432109876'
          },
          shipping: {
            name: 'Anita Kumar',
            phone: '+91 5432109876',
            street: '654 Animal Street',
            city: 'Pune',
            state: 'Maharashtra',
            pincode: '411001'
          },
          items: [
            {
              id: 'item-7',
              productName: 'Royal Canin Adult Dog Food - Chicken & Rice',
              productImage: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=200&h=200&fit=crop&crop=center',
              brand: 'Royal Canin',
              variant: '3kg',
              quantity: 1,
              price: 2199.99,
              category: 'Dog Food'
            }
          ]
        },
        {
          id: 'ORD-006',
          orderNumber: 'PC-2024-006',
          status: 'delivered',
          total: 359.97,
          subtotal: 349.97,
          shippingFee: 10.00,
          discount: 0,
          paymentMethod: 'cod',
          createdAt: '2024-10-28T13:45:00Z',
          user: {
            name: 'Lisa Anderson',
            email: 'lisa.anderson@gmail.com',
            phone: '+91 3210987654'
          },
          shipping: {
            name: 'Lisa Anderson',
            phone: '+91 3210987654',
            street: '159 Furry Friends Lane',
            city: 'Ahmedabad',
            state: 'Gujarat',
            pincode: '380001'
          },
          items: [
            {
              id: 'item-8',
              productName: 'Premium Cat Litter - Clumping Formula',
              productImage: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=200&h=200&fit=crop&crop=center',
              brand: 'Fresh Step',
              variant: '5kg',
              quantity: 1,
              price: 349.99,
              category: 'Cat Litter'
            }
          ]
        },
        {
          id: 'ORD-007',
          orderNumber: 'PC-2024-007',
          status: 'processing',
          total: 238.97,
          subtotal: 238.97,
          shippingFee: 0.00,
          discount: 0,
          paymentMethod: 'upi',
          createdAt: '2024-10-25T08:30:00Z',
          user: {
            name: 'Ramesh Gupta',
            email: 'ramesh.gupta@company.com',
            phone: '+91 2109876543'
          },
          shipping: {
            name: 'Ramesh Gupta',
            phone: '+91 2109876543',
            street: '753 Pet Supplies Street',
            city: 'Jaipur',
            state: 'Rajasthan',
            pincode: '302001'
          },
          items: [
            {
              id: 'item-9',
              productName: 'Natural Dog Treats - Chicken Jerky',
              productImage: 'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=200&h=200&fit=crop&crop=center',
              brand: 'NaturalBites',
              variant: '200g',
              quantity: 1,
              price: 199.99,
              category: 'Dog Treats'
            }
          ]
        }
      ];
      
      setOrders(sampleOrders);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = Array.isArray(orders) ? orders.filter(order => {
    const matchesSearch = order.id.toString().includes(searchTerm) ||
                         order.shipping?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) : [];

  const toggleOrderExpansion = (orderId) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await orderApi.updateOrderStatus(orderId, newStatus);
      // Reload orders to get updated data
      loadOrders();
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Failed to update order status: ' + (err.message || 'Unknown error'));
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Package className="w-4 h-4 text-warning" />;
      case 'processing':
        return <Package className="w-4 h-4 text-primary" />;
      case 'shipped':
        return <Truck className="w-4 h-4 text-primary" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-success" />;
      default:
        return <Package className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'text-yellow-800 bg-yellow-100';
      case 'processing':
        return 'text-blue-800 bg-blue-100';
      case 'shipped':
        return 'text-indigo-800 bg-indigo-100';
      case 'delivered':
        return 'text-green-800 bg-green-100';
      case 'cancelled':
        return 'text-red-800 bg-red-100';
      default:
        return 'text-gray-800 bg-gray-100';
    }
  };

  const handleDownloadInvoice = async (order) => {
    setProcessingInvoice(`download-${order.id}`);
    try {
      // Enhanced company settings
      const settings = {
        siteName: "PET&CO",
        companyAddress: "Natural & Organic Products Hub, Bangalore, India",
        companyPhone: "+91 9845651468",
        companyEmail: "info@petco.com"
      };
      
      // Enhanced customer data mapping with better fallbacks
      const customer = {
        name: order.shipping?.name || order.customerName || order.user?.name || 'Valued Customer',
        email: order.customerEmail || order.user?.email || order.shipping?.email || 'N/A',
        phone: order.shipping?.phone || order.customerPhone || order.user?.phone || 'N/A'
      };
      
      // Enhanced order data with proper formatting matching backend structure
      const enhancedOrder = {
        ...order,
        orderNumber: order.orderNumber || `NN-${new Date().getFullYear()}-${String(order.id).padStart(3, '0')}`,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        items: order.items || order.orderItems || [],
        subtotal: order.subtotal || 0,
        shippingFee: order.shippingFee || 0,
        discount: order.discount || 0,
        total: order.total || 0,
        paymentMethod: order.paymentMethod || 'Not specified',
        status: order.status || 'pending',
        shipping: order.shipping || {
          name: customer.name,
          phone: customer.phone,
          street: 'Address not provided',
          city: 'N/A',
          state: 'N/A',
          pincode: 'N/A'
        }
      };
      
      await new Promise(resolve => setTimeout(resolve, 500)); // Brief delay for UX
      downloadInvoice(enhancedOrder, customer, settings);
    } catch (error) {
      console.error('Error downloading invoice:', error);
      alert('Failed to download invoice. Please try again.');
    } finally {
      setProcessingInvoice(null);
    }
  };

  const handlePrintInvoice = async (order) => {
    setProcessingInvoice(`print-${order.id}`);
    try {
      // Enhanced company settings
      const settings = {
        siteName: "PET&CO",
        companyAddress: "Natural & Organic Products Hub, Bangalore, India",
        companyPhone: "+91 9845651468",
        companyEmail: "info@petco.com"
      };
      
      // Enhanced customer data mapping with better fallbacks
      const customer = {
        name: order.shipping?.name || order.customerName || order.user?.name || 'Valued Customer',
        email: order.customerEmail || order.user?.email || order.shipping?.email || 'N/A',
        phone: order.shipping?.phone || order.customerPhone || order.user?.phone || 'N/A'
      };
      
      // Enhanced order data with proper formatting matching backend structure
      const enhancedOrder = {
        ...order,
        orderNumber: order.orderNumber || `NN-${new Date().getFullYear()}-${String(order.id).padStart(3, '0')}`,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        items: order.items || order.orderItems || [],
        subtotal: order.subtotal || 0,
        shippingFee: order.shippingFee || 0,
        discount: order.discount || 0,
        total: order.total || 0,
        paymentMethod: order.paymentMethod || 'Not specified',
        status: order.status || 'pending',
        shipping: order.shipping || {
          name: customer.name,
          phone: customer.phone,
          street: 'Address not provided',
          city: 'N/A',
          state: 'N/A',
          pincode: 'N/A'
        }
      };
      
      await new Promise(resolve => setTimeout(resolve, 300)); // Brief delay for UX
      printInvoice(enhancedOrder, customer, settings);
    } catch (error) {
      console.error('Error printing invoice:', error);
      alert('Failed to print invoice. Please try again.');
    } finally {
      setProcessingInvoice(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Order Management</h1>
          <p className="text-muted-foreground">Track and manage customer orders</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Order Management</h1>
          <p className="text-muted-foreground">Track and manage customer orders</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Orders</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <Button variant="outline" onClick={loadOrders}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Order Management</h1>
        <p className="text-muted-foreground">Track and manage customer orders</p>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                placeholder="Search by order ID or customer name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-border bg-background text-foreground"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => {
          const isExpanded = expandedOrders.has(order.id);
          return (
            <div key={order.id} className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              {/* Order Header - Always Visible */}
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => toggleOrderExpansion(order.id)}
                      className="p-1 hover:bg-muted rounded-md transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </button>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">#{order.orderNumber || order.id}</h3>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</span>
                        <span>•</span>
                        <span>{order.shipping?.name || order.user?.name || 'N/A'}</span>
                        <span>•</span>
                        <span>{getTotalUnits(order)} unit(s)</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="ml-1 capitalize">{order.status}</span>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-bold text-foreground">₹{order.total?.toFixed(2) || '0.00'}</div>
                      <div className="text-sm text-muted-foreground capitalize">{order.paymentMethod || 'N/A'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expandable Order Details */}
              {isExpanded && (
                <div className="border-t border-border bg-muted/10">
                  <div className="p-4 space-y-6">
                    {/* Customer Info & Shipping Address */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-3">Customer Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center">
                            <User className="w-4 h-4 text-muted-foreground mr-2" />
                            <span className="font-medium">{order.shipping?.name || order.user?.name || 'N/A'}</span>
                          </div>
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 text-muted-foreground mr-2" />
                            <span>{order.user?.email || 'N/A'}</span>
                          </div>
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 text-muted-foreground mr-2" />
                            <span>{order.user?.phone || order.shipping?.phone || 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-3">Shipping Address</h4>
                        <div className="text-sm text-muted-foreground">
                          <div>{order.shipping?.street || 'Address not provided'}</div>
                          <div>{order.shipping?.city || 'N/A'}, {order.shipping?.state || 'N/A'} - {order.shipping?.pincode || 'N/A'}</div>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    {order.items && order.items.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-3">Order Items</h4>
                        <div className="space-y-3">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex items-center space-x-4 p-3 bg-background rounded-lg border border-border/50">
                              {item.productImage && (
                                <img 
                                  src={item.productImage} 
                                  alt={item.productName}
                                  className="w-12 h-12 object-cover rounded-md"
                                  onError={(e) => {
                                    e.target.src = 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=200&h=200&fit=crop&crop=center';
                                  }}
                                />
                              )}
                              <div className="flex-1">
                                <div className="font-medium text-foreground">{item.productName}</div>
                                <div className="text-sm text-muted-foreground">
                                  {item.brand ? `${item.brand} • ` : ''}{item.variant ? `${item.variant} • ` : ''}Qty: {parseInt(item.quantity) || 1}
                                </div>
                                <div className="text-sm text-primary font-medium">₹{item.price?.toFixed(2) || '0.00'}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Order Actions & Summary */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-border">
                      <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className="px-3 py-2 rounded border border-border bg-background text-foreground"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        
                        <button
                          onClick={() => handleDownloadInvoice(order)}
                          disabled={processingInvoice === `download-${order.id}`}
                          className={`flex items-center space-x-1 px-3 py-2 rounded transition-colors ${
                            processingInvoice === `download-${order.id}`
                              ? 'text-muted-foreground cursor-not-allowed'
                              : 'text-primary hover:text-primary/80 hover:bg-primary/5 border border-primary/20'
                          }`}
                          title="Download Invoice"
                        >
                          {processingInvoice === `download-${order.id}` ? (
                            <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                          <span>Invoice</span>
                        </button>

                        <button
                          onClick={() => handlePrintInvoice(order)}
                          disabled={processingInvoice === `print-${order.id}`}
                          className={`flex items-center space-x-1 px-3 py-2 rounded transition-colors ${
                            processingInvoice === `print-${order.id}`
                              ? 'text-muted-foreground cursor-not-allowed'
                              : 'text-primary hover:text-primary/80 hover:bg-primary/5 border border-primary/20'
                          }`}
                          title="Print Invoice"
                        >
                          {processingInvoice === `print-${order.id}` ? (
                            <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                          ) : (
                            <Printer className="w-4 h-4" />
                          )}
                          <span>Print</span>
                        </button>
                      </div>

                      <div className="text-right">
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtotal:</span>
                            <span className="text-foreground">₹{order.subtotal?.toFixed(2) || '0.00'}</span>
                          </div>
                          {order.shippingFee > 0 && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Shipping:</span>
                              <span className="text-foreground">₹{order.shippingFee?.toFixed(2) || '0.00'}</span>
                            </div>
                          )}
                          {order.discount > 0 && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Discount:</span>
                              <span className="text-green-600">-₹{order.discount?.toFixed(2) || '0.00'}</span>
                            </div>
                          )}
                          <div className="flex justify-between font-medium text-foreground border-t border-border pt-1">
                            <span>Total:</span>
                            <span>₹{order.total?.toFixed(2) || '0.00'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No orders found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
