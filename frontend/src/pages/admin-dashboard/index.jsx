
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { jsonDb } from '../../lib/jsonDb';
import AdminLogin from '../../components/AdminLogin';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const AdminDashboard = () => {
  const { user, isAdmin, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Product form state
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
    stock: '',
    featured: false
  });
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    if (isAdmin()) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [productsData, ordersData] = await Promise.all([
        jsonDb.getProducts(),
        jsonDb.getOrders()
      ]);
      setProducts(productsData);
      setOrders(ordersData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await jsonDb.updateProduct(editingProduct.id, {
          ...productForm,
          price: parseFloat(productForm.price),
          stock: parseInt(productForm.stock)
        });
      } else {
        await jsonDb.addProduct({
          ...productForm,
          price: parseFloat(productForm.price),
          stock: parseInt(productForm.stock)
        });
      }
      
      setProductForm({
        name: '',
        price: '',
        category: '',
        description: '',
        stock: '',
        featured: false
      });
      setEditingProduct(null);
      loadData();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleEditProduct = (product) => {
    setProductForm({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      description: product.description,
      stock: product.stock.toString(),
      featured: product.featured || false
    });
    setEditingProduct(product);
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await jsonDb.deleteProduct(id);
      loadData();
    }
  };

  if (!user) {
    return <AdminLogin onLoginSuccess={loadData} />;
  }

  if (!isAdmin()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don't have admin privileges.</p>
          <Button onClick={signOut}>Sign Out</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user.name}</p>
            </div>
            <Button variant="outline" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {['products', 'orders', 'analytics'].map((tab) => (
              <button
                key={tab}
                className={`${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm capitalize`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Product Form */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <form onSubmit={handleProductSubmit} className="space-y-4">
                  <Input
                    label="Product Name"
                    value={productForm.name}
                    onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                    required
                  />
                  <Input
                    label="Price (₹)"
                    type="number"
                    value={productForm.price}
                    onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                    required
                  />
                  <Input
                    label="Category"
                    value={productForm.category}
                    onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                    required
                  />
                  <Input
                    label="Description"
                    value={productForm.description}
                    onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                    required
                  />
                  <Input
                    label="Stock Quantity"
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                    required
                  />
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={productForm.featured}
                      onChange={(e) => setProductForm({...productForm, featured: e.target.checked})}
                      className="mr-2"
                    />
                    Featured Product
                  </label>
                  <div className="flex space-x-2">
                    <Button type="submit" className="flex-1">
                      {editingProduct ? 'Update' : 'Add'} Product
                    </Button>
                    {editingProduct && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setEditingProduct(null);
                          setProductForm({
                            name: '', price: '', category: '', description: '', stock: '', featured: false
                          });
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </div>
            </div>

            {/* Products List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold">Products ({products.length})</h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {products.map((product) => (
                    <div key={product.id} className="p-6 flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{product.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{product.category}</p>
                        <p className="text-sm text-gray-500 mt-1">{product.description}</p>
                        <div className="flex items-center mt-2 space-x-4">
                          <span className="text-lg font-semibold text-green-600">₹{product.price}</span>
                          <span className="text-sm text-gray-500">Stock: {product.stock}</span>
                          {product.featured && (
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                              Featured
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditProduct(product)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                  {products.length === 0 && (
                    <div className="p-6 text-center text-gray-500">
                      No products found. Add your first product using the form.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Recent Orders ({orders.length})</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {orders.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No orders found.
                </div>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">Order #{order.id}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900">Total Products</h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">{products.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900">Total Orders</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">{orders.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900">Featured Products</h3>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                {products.filter(p => p.featured).length}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
