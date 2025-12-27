import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

// CSV Export Utility Functions
export const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) {
    alert('No data available to export');
    return;
  }

  // Get headers from the first object
  const headers = Object.keys(data[0]);
  
  // Convert data to CSV format
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle nested objects and arrays
        if (typeof value === 'object' && value !== null) {
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        }
        // Handle strings with commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      }).join(',')
    )
  ].join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Filter data by date range
export const filterDataByDateRange = (data, filterType, dateField = 'createdAt') => {
  const now = new Date();
  let startDate, endDate;

  switch (filterType) {
    case 'daily':
      startDate = startOfDay(now);
      endDate = endOfDay(now);
      break;
    case 'weekly':
      startDate = startOfWeek(now);
      endDate = endOfWeek(now);
      break;
    case 'monthly':
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
      break;
    case 'yearly':
      startDate = startOfYear(now);
      endDate = endOfYear(now);
      break;
    case 'all':
    default:
      return data;
  }

  return data.filter(item => {
    const itemDate = new Date(item[dateField]);
    return itemDate >= startDate && itemDate <= endDate;
  });
};

// Format order data for CSV export
export const formatOrdersForCSV = (orders) => {
  return orders.map(order => ({
    'Order ID': order.orderId || order.id,
    'Customer Name': order.customerName || order.customer?.name || '',
    'Customer Email': order.customerEmail || order.customer?.email || '',
    'Order Date': order.createdAt ? format(new Date(order.createdAt), 'yyyy-MM-dd HH:mm:ss') : '',
    'Status': order.status || '',
    'Total Amount': order.total || 0,
    'Items Count': order.items ? order.items.length : 0,
    'Items Details': order.items ? order.items.map(item => `${item.name} (Qty: ${item.quantity})`).join('; ') : '',
    'Payment Method': order.paymentMethod || '',
    'Payment Status': order.paymentStatus || '',
    'Shipping Address': order.shippingAddress ? `${order.shippingAddress.fullName}, ${order.shippingAddress.addressLine1}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}` : '',
    'Phone Number': order.shippingAddress?.phoneNumber || order.phoneNumber || ''
  }));
};

// Format user data for CSV export
export const formatUsersForCSV = (users) => {
  return users.map(user => ({
    'User ID': user.id,
    'Full Name': user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
    'Email': user.email,
    'Username': user.username || '',
    'Role': user.role || 'customer',
    'Phone Number': user.phoneNumber || '',
    'Registration Date': user.createdAt ? format(new Date(user.createdAt), 'yyyy-MM-dd HH:mm:ss') : '',
    'Total Orders': user.totalOrders || 0,
    'Total Spent': user.totalSpent || 0,
    'Status': user.isActive ? 'Active' : 'Inactive',
    'Address Count': user.addresses ? user.addresses.length : 0
  }));
};

// Format product data for CSV export
export const formatProductsForCSV = (products) => {
  return products.map(product => ({
    'Product ID': product.id,
    'Product Name': product.name,
    'Category': product.category || '',
    'Brand': product.brand || '',
    'Price': product.price || 0,
    'Original Price': product.originalPrice || product.price || 0,
    'Stock Quantity': product.stockQuantity || 0,
    'Stock Status': (product.stockQuantity || 0) > 0 ? 'In Stock' : 'Out of Stock',
    'Rating': product.rating || 0,
    'Review Count': product.reviewCount || 0,
    'Description': product.description ? product.description.replace(/\n/g, ' ').substring(0, 200) : '',
    'Tags': product.tags ? product.tags.join('; ') : '',
    'Created Date': product.createdAt ? format(new Date(product.createdAt), 'yyyy-MM-dd HH:mm:ss') : '',
    'Updated Date': product.updatedAt ? format(new Date(product.updatedAt), 'yyyy-MM-dd HH:mm:ss') : ''
  }));
};

// Format revenue data for CSV export
export const formatRevenueDataForCSV = (orders, filterType) => {
  const filteredOrders = filterDataByDateRange(orders, filterType);
  
  const revenueByDate = {};
  
  filteredOrders.forEach(order => {
    const orderDate = format(new Date(order.createdAt), 'yyyy-MM-dd');
    if (!revenueByDate[orderDate]) {
      revenueByDate[orderDate] = {
        date: orderDate,
        totalRevenue: 0,
        orderCount: 0,
        averageOrderValue: 0
      };
    }
    revenueByDate[orderDate].totalRevenue += order.total || 0;
    revenueByDate[orderDate].orderCount += 1;
  });

  // Calculate average order values
  return Object.values(revenueByDate).map(data => ({
    ...data,
    averageOrderValue: data.orderCount > 0 ? data.totalRevenue / data.orderCount : 0
  })).sort((a, b) => a.date.localeCompare(b.date));
};

// Generate summary report
export const generateSummaryReport = (products, users, orders, filterType = 'all') => {
  const filteredOrders = filterDataByDateRange(orders, filterType);
  const filteredUsers = filterDataByDateRange(users.filter(u => u.role === 'customer'), filterType);
  
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.total || 0), 0);
  const averageOrderValue = filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0;
  
  const pendingOrders = filteredOrders.filter(order => order.status === 'pending').length;
  const completedOrders = filteredOrders.filter(order => order.status === 'delivered' || order.status === 'completed').length;
  const cancelledOrders = filteredOrders.filter(order => order.status === 'cancelled').length;
  
  const lowStockProducts = products.filter(p => (p.stockQuantity || 0) < 10).length;
  const outOfStockProducts = products.filter(p => (p.stockQuantity || 0) === 0).length;

  return [{
    'Report Period': filterType.charAt(0).toUpperCase() + filterType.slice(1),
    'Report Generated': format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
    'Total Products': products.length,
    'Low Stock Products': lowStockProducts,
    'Out of Stock Products': outOfStockProducts,
    'Total Users': users.filter(u => u.role === 'customer').length,
    'New Users (Period)': filteredUsers.length,
    'Total Orders (Period)': filteredOrders.length,
    'Pending Orders': pendingOrders,
    'Completed Orders': completedOrders,
    'Cancelled Orders': cancelledOrders,
    'Total Revenue (Period)': totalRevenue.toFixed(2),
    'Average Order Value': averageOrderValue.toFixed(2),
    'Revenue Per User': filteredUsers.length > 0 ? (totalRevenue / filteredUsers.length).toFixed(2) : 0
  }];
};