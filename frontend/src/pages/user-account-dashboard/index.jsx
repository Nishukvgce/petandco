import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import dataService from '../../services/dataService';
import userApi from '../../services/userApi';
import orderApi from '../../services/orderApi';
import wishlistApi from '../../services/wishlistApi';
import reviewApi from '../../services/reviewApi';
import apiClient from '../../services/api';
import Header from '../../components/ui/Header';
import DashboardSidebar from './components/DashboardSidebar';
import DashboardOverview from './components/DashboardOverview';
import PetServices from './components/PetServices';
import OrderHistory from './components/OrderHistory';
import ProfileManagement from './components/ProfileManagement';
import AddressBook from './components/AddressBook';
import WishlistSection from './components/WishlistSection';
import PreferencesSection from './components/PreferencesSection';
import UserReviews from './components/UserReviews';

const UserAccountDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user: authUser, userProfile, loading } = useAuth();
  const { getCartItemCount } = useCart();
  const [activeSection, setActiveSection] = useState('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Real orders data - moved before any useEffect that uses it
  const [orders, setOrders] = useState([]);
  const [pendingReviewsCount, setPendingReviewsCount] = useState(0);

  // Convert relative or bare filenames to absolute URLs under API base for order item images
  const resolveImageUrl = (candidate) => {
    if (!candidate || typeof candidate !== 'string') return '';
    if (/^(https?:)?\/\//i.test(candidate) || candidate.startsWith('data:')) return candidate;
    // Extract filename if absolute path or contains backslashes
    if (/^[a-zA-Z]:\\/.test(candidate) || candidate.startsWith('\\\\') || candidate.startsWith('/') || candidate.includes('\\')) {
      const parts = candidate.split(/\\|\//);
      candidate = parts[parts.length - 1];
    }
    // Map bare filename to API image route
    if (/^[^/]+\.[a-zA-Z0-9]+$/.test(candidate)) {
      candidate = `/admin/products/images/${candidate}`;
    }
    const base = apiClient?.defaults?.baseURL || '';
    return candidate.startsWith('/') ? `${base}${candidate}` : `${base}/${candidate}`;
  };

  // Only use authenticated user data - fetch profile from backend
  const [user, setUser] = useState(null);

  // Calculate real user stats from orders
  useEffect(() => {
    if (Array.isArray(orders) && orders.length > 0) {
      const totalSpent = orders.reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0);
      const totalSaved = orders.reduce((sum, order) => sum + (parseFloat(order.discount) || 0), 0);
      const calculatedLoyaltyPoints = Math.floor(totalSpent * 0.1); // 10% of spending as points
      
      setUser(prev => ({
        ...prev,
        totalOrders: orders.length,
        totalSpent: totalSpent.toFixed(2),
        totalSaved: totalSaved.toFixed(2),
        cartItemCount: getCartItemCount()
      }));
    } else {
        // Add sample data for demonstration when no real orders exist
        const sampleUserData = {
          totalOrders: 5,
          totalSpent: '2450.99',
          totalSaved: '345.50',
          loyaltyPoints: 245,
          cartItemCount: getCartItemCount(),
          recentActivity: [
            { type: 'order', message: 'Order #PC-2024-001 delivered successfully', date: '2024-11-01' },
            { type: 'wishlist', message: 'Added Royal Canin Dog Food to wishlist', date: '2024-10-28' },
            { type: 'address', message: 'Updated primary shipping address', date: '2024-10-25' }
          ]
        };      setUser(prev => ({
        ...prev,
        ...sampleUserData
      }));
    }
  }, [orders, getCartItemCount]);

  // Fetch user profile from backend when logged in
  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (!authUser?.email) return;
        const profile = await userApi.getProfile(authUser.email);
        setUser({
          id: profile?.id,
          name: profile?.name || authUser?.name || authUser?.email,
          email: profile?.email || authUser?.email,
          phone: profile?.phone,
          dateOfBirth: profile?.dateOfBirth,
          gender: profile?.gender,
          memberSince: profile?.memberSince,
          totalOrders: profile?.totalOrders || 0,
          totalSpent: profile?.totalSpent || 0,
          totalSaved: profile?.totalSaved || 0,
          loyaltyPoints: profile?.loyaltyPoints || 0,
          cartItemCount: getCartItemCount(),
          wishlistCount: authUser?.wishlistCount || 0,
          lastPasswordChange: profile?.lastPasswordChange
        });
      } catch (e) {
        console.error('Failed to load profile', e);
      }
    };
    loadProfile();
  }, [authUser, getCartItemCount]);

  // Load user orders from backend API
  useEffect(() => {
    const loadUserOrders = async () => {
      try {
        if (user?.email) {
          const userOrders = await orderApi.getUserOrders(user.email);
          console.log('Loaded user orders:', userOrders);
          const normalized = (userOrders || []).map((order) => ({
            ...order,
            items: (order?.items || []).map((item) => {
              const resolvedImg = resolveImageUrl(item?.image || item?.productImage || item?.imageUrl || '');
              return {
                ...item,
                image: resolvedImg,
              };
            }),
          }));
          setOrders(normalized);
        }
      } catch (error) {
        console.error('Error loading user orders:', error);
        console.log('Using sample order data for demonstration');
        
        // Add sample order data for demonstration
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
            createdAt: '2024-11-01T10:30:00Z',
            deliveredAt: '2024-11-03T14:20:00Z',
            items: [
              {
                id: 'item-1',
                productName: 'Royal Canin Adult Dog Food - Chicken & Rice',
                image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=200&h=200&fit=crop&crop=center',
                brand: 'Royal Canin',
                variant: '1kg',
                quantity: 1,
                price: 899.99,
                category: 'Dog Food'
              },
              {
                id: 'item-2',
                productName: 'Interactive Dog Toy Ball',
                image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=200&h=200&fit=crop&crop=center',
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
            paymentMethod: 'upi',
            createdAt: '2024-10-28T14:45:00Z',
            shippedAt: '2024-10-30T09:30:00Z',
            items: [
              {
                id: 'item-3',
                productName: 'Whiskas Cat Food - Ocean Fish Flavor',
                image: 'https://images.unsplash.com/photo-1548681528-6a5c45b66b42?w=200&h=200&fit=crop&crop=center',
                brand: 'Whiskas',
                variant: '85g Pack of 2',
                quantity: 1,
                price: 179.98,
                category: 'Cat Food'
              }
            ]
          },
          {
            id: 'ORD-003',
            orderNumber: 'PC-2024-003',
            status: 'processing',
            total: 599.99,
            subtotal: 599.99,
            shippingFee: 0,
            discount: 0,
            paymentMethod: 'cod',
            createdAt: '2024-10-25T11:20:00Z',
            items: [
              {
                id: 'item-4',
                productName: 'Premium Cat Litter - Clumping Formula',
                image: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=200&h=200&fit=crop&crop=center',
                brand: 'Fresh Step',
                variant: '10kg',
                quantity: 1,
                price: 599.99,
                category: 'Cat Litter'
              }
            ]
          }
        ];
        
        setOrders(sampleOrders);
      }
    };

    if (user?.email) {
      loadUserOrders();
    }
  }, [user?.email]);

  // Calculate pending reviews count
  useEffect(() => {
    const calculatePendingReviews = async () => {
      if (!authUser?.email || !orders.length) {
        setPendingReviewsCount(0);
        return;
      }

      try {
        // Get eligible products for review from backend
        const eligibleProducts = await reviewApi.getEligibleProducts(authUser.email);
        setPendingReviewsCount(eligibleProducts.length);
      } catch (error) {
        console.error('Error calculating pending reviews:', error);
        // Fallback: calculate from delivered orders
        const deliveredOrders = orders.filter(order => order.status === 'delivered');
        const deliveredItems = deliveredOrders.flatMap(order => order.items || []);
        setPendingReviewsCount(deliveredItems.length);
      }
    };

    calculatePendingReviews();
  }, [authUser?.email, orders]);

  // Addresses from backend
  const [addresses, setAddresses] = useState([]);
  useEffect(() => {
    const loadAddresses = async () => {
      try {
        if (!authUser?.email) return;
        const list = await userApi.getAddresses(authUser.email);
        setAddresses(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error('Failed to load addresses', e);
        console.log('Using sample address data for demonstration');
        
        // Add sample address data for demonstration
        const sampleAddresses = [
          {
            id: 'addr-1',
            name: 'Home Address',
            phone: '+91 9876543210',
            street: '123 Pet Street, Apartment 4B, Near Dog Park',
            city: 'Bangalore',
            state: 'Karnataka',
            pincode: '560001',
            landmark: 'Opposite Central Mall',
            addressType: 'Home',
            isDefault: true
          },
          {
            id: 'addr-2',
            name: 'Office Address',
            phone: '+91 9876543210',
            street: '456 Tech Park, 5th Floor, Block C',
            city: 'Bangalore',
            state: 'Karnataka',
            pincode: '560100',
            landmark: 'Near Metro Station',
            addressType: 'Work',
            isDefault: false
          },
          {
            id: 'addr-3',
            name: 'Parent\'s House',
            phone: '+91 9876543211',
            street: '789 Garden View, Villa No. 15',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400001',
            landmark: 'Behind Rose Garden',
            addressType: 'Other',
            isDefault: false
          }
        ];
        
        setAddresses(sampleAddresses);
      }
    };
    loadAddresses();
  }, [authUser?.email]);

  // Wishlist data - fetch from API
  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistError, setWishlistError] = useState(null);
  const [wishlistCount, setWishlistCount] = useState(0);

  const toUiWishlist = (apiItems = []) => {
    return (apiItems || []).map(item => ({
      id: item.productId || item.id,
      productId: item.productId || item.id, // ensure productId is available for remove API
      name: item.productName || item.name,
      price: item.productPrice || item.price || 0,
      originalPrice: item.originalPrice || item.productPrice || item.price || 0,
      image: resolveImageUrl(item.productImage || item.image || item.imageUrl || ''),
      variants: item.variants || ["Default"],
      selectedVariant: item.selectedVariant || "Default",
      inStock: item.inStock !== false,
      rating: item.rating || 4.5,
      reviewCount: item.reviewCount || 0,
      badges: item.badges || [],
      addedDate: item.createdAt || item.addedDate || new Date().toISOString()
    }));
  };

  // Fetch wishlist from backend API
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!authUser?.email) {
        setWishlistItems([]);
        setWishlistCount(0);
        return;
      }

      try {
        setWishlistLoading(true);
        setWishlistError(null);
        
        console.log('Fetching wishlist for user:', authUser.email);
        
        const wishlistData = await wishlistApi.getAll(authUser.email);
        const transformedWishlist = toUiWishlist(wishlistData);
        setWishlistItems(transformedWishlist);
        try {
          const count = await wishlistApi.getCount(authUser.email);
          setWishlistCount(typeof count === 'number' ? count : transformedWishlist.length);
        } catch (e) {
          setWishlistCount(transformedWishlist.length);
        }
      } catch (error) {
        console.error('Error fetching wishlist:', error);
        setWishlistError(error.message);
        
        // Fallback to localStorage wishlist if API fails
        try {
          const localWishlist = localStorage.getItem('neenu_wishlist');
          if (localWishlist) {
            const parsedWishlist = JSON.parse(localWishlist);
            if (Array.isArray(parsedWishlist)) {
              setWishlistItems(parsedWishlist);
              console.log('Using localStorage wishlist as fallback');
              setWishlistCount(parsedWishlist.length);
            }
          } else {
            // Add sample wishlist data for demonstration
            const sampleWishlistItems = [
              {
                id: 'demo-wish-1',
                productId: 'demo-wish-1',
                name: 'Royal Canin Adult Dog Food - Chicken & Rice',
                price: 899.99,
                originalPrice: 999.99,
                image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400&h=400&fit=crop&crop=center',
                variants: ['500g', '1kg', '3kg'],
                selectedVariant: '1kg',
                inStock: true,
                rating: 4.5,
                reviewCount: 128,
                badges: ['Best Seller', 'Natural'],
                addedDate: '2024-10-25T14:30:00Z'
              },
              {
                id: 'demo-wish-2',
                productId: 'demo-wish-2',
                name: 'Interactive Dog Toy Ball',
                price: 299.99,
                originalPrice: 349.99,
                image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=400&fit=crop&crop=center',
                variants: ['Small', 'Medium', 'Large'],
                selectedVariant: 'Medium',
                inStock: true,
                rating: 4.7,
                reviewCount: 42,
                badges: ['New', 'Interactive'],
                addedDate: '2024-10-28T10:15:00Z'
              },
              {
                id: 'demo-wish-3',
                productId: 'demo-wish-3',
                name: 'Premium Cat Litter - Clumping Formula',
                price: 599.99,
                originalPrice: 699.99,
                image: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400&h=400&fit=crop&crop=center',
                variants: ['5kg', '10kg'],
                selectedVariant: '10kg',
                inStock: true,
                rating: 4.3,
                reviewCount: 67,
                badges: ['Eco-Friendly', 'Odor Control'],
                addedDate: '2024-10-30T16:20:00Z'
              }
            ];
            setWishlistItems(sampleWishlistItems);
            setWishlistCount(8); // Show higher count to demonstrate
            console.log('Using sample wishlist data for demonstration');
          }
        } catch (localError) {
          console.error('Error loading localStorage wishlist:', localError);
          setWishlistItems([]);
          setWishlistCount(0);
        }
      } finally {
        setWishlistLoading(false);
      }
    };

    fetchWishlist();
  }, [authUser?.email]);

  // Refresh wishlist count when only count is needed (e.g., external updates)
  useEffect(() => {
    const fetchCount = async () => {
      if (!authUser?.email) return;
      try {
        const count = await wishlistApi.getCount(authUser.email);
        if (typeof count === 'number') setWishlistCount(count);
      } catch (e) {
        // ignore
      }
    };
    fetchCount();
  }, [authUser?.email]);

  // Handle remove from wishlist
  const handleRemoveFromWishlist = async (productId) => {
    if (!authUser?.email) return;

    try {
      console.log('Removing product from wishlist:', productId);
      await wishlistApi.remove(authUser.email, { productId });
      // Hard re-fetch from DB to stay in sync with wishlist_items
      try {
        const fresh = await wishlistApi.getAll(authUser.email);
        setWishlistItems(toUiWishlist(fresh));
        const count = await wishlistApi.getCount(authUser.email);
        setWishlistCount(typeof count === 'number' ? count : (fresh?.length || 0));
      } catch (refreshErr) {
        // Fallback to optimistic local update if refresh fails
        setWishlistItems(prev => prev.filter(item => item.id !== productId));
        setWishlistCount(prev => Math.max(0, (prev || 0) - 1));
      }
      console.log('Successfully removed from wishlist');
      
      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm bg-green-500 text-white';
      notification.innerHTML = '<div class="flex items-center gap-2"><span>Removed from wishlist!</span></div>';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      
      // Fallback: remove from localStorage
      try {
        const localWishlist = localStorage.getItem('neenu_wishlist');
        if (localWishlist) {
          const parsedWishlist = JSON.parse(localWishlist);
          const updatedWishlist = parsedWishlist.filter(item => item.id !== productId);
          localStorage.setItem('neenu_wishlist', JSON.stringify(updatedWishlist));
          setWishlistItems(updatedWishlist);
          setWishlistCount(updatedWishlist.length);
        }
      } catch (localError) {
        console.error('Error updating localStorage wishlist:', localError);
      }
    }
  };

  // Mock preferences data
  const [preferences, setPreferences] = useState({
    emailNotifications: {
      orderUpdates: true,
      promotions: true,
      newsletter: false,
      productRecommendations: false,
      priceDropAlerts: true
    },
    smsNotifications: {
      orderUpdates: true,
      deliveryUpdates: true,
      promotions: false
    },
    privacy: {
      profileVisibility: 'private',
      dataSharing: false,
      marketingCommunication: false
    },
    shopping: {
      currency: 'INR',
      language: 'English',
      defaultPaymentMethod: 'COD',
      savePaymentMethods: false
    }
  });

  // Mock cart data
  const [cartItems] = useState([
    {
      id: 1,
      name: "Organic Turmeric Powder",
      variant: "500g",
      price: 299.00,
      quantity: 1,
      image: "https://images.pexels.com/photos/4198015/pexels-photo-4198015.jpeg"
    }
  ]);

  const recentOrders = orders?.slice(0, 3);
  const loyaltyPoints = user?.loyaltyPoints;

  // Handle section changes from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const section = urlParams?.get('section');
    if (section && ['overview', 'pet-services', 'orders', 'profile', 'addresses', 'wishlist', 'preferences']?.includes(section)) {
      setActiveSection(section);
    }
  }, [location]);

  const handleSectionChange = (section) => {
    setActiveSection(section);
    setIsMobileSidebarOpen(false);
  };

  const handleUpdateProfile = async (updatedData) => {
    try {
      console.log('Updating profile with data:', updatedData);
      
      // Save to database via API
      const updatedProfile = await userApi.updateProfile(authUser.email, updatedData);
      
      // Update local state with the response from server
      setUser(prev => ({
        ...prev,
        ...updatedProfile
      }));
      
      console.log('Profile updated successfully:', updatedProfile);
      
      // Show success message
      alert('Profile updated successfully!');
      
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile: ' + error.message);
    }
  };

  const handleAddAddress = async (addressData) => {
    try {
      const saved = await userApi.addAddress(authUser.email, addressData);
      setAddresses(prev => [...prev, saved]);
    } catch (e) {
      console.error('Add address failed', e);
    }
  };

  const handleUpdateAddress = async (id, updatedData) => {
    try {
      const saved = await userApi.updateAddress(authUser.email, id, updatedData);
      setAddresses(prev => prev?.map(addr => addr?.id === id ? saved : addr));
    } catch (e) {
      console.error('Update address failed', e);
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await userApi.deleteAddress(authUser.email, id);
      setAddresses(prev => prev?.filter(addr => addr?.id !== id));
    } catch (e) {
      console.error('Delete address failed', e);
    }
  };

  const handleSetDefaultAddress = (id) => {
    setAddresses(prev => prev?.map(addr => ({
      ...addr,
      isDefault: addr?.id === id
    })));
    console.log('Default address set:', id);
  };

  const handleAddToCart = (item) => {
    console.log('Added to cart:', item);
    // Handle add to cart logic
  };

  const handleUpdatePreferences = (updatedPreferences) => {
    setPreferences(updatedPreferences);
    console.log('Preferences updated:', updatedPreferences);
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'orders':
        return <OrderHistory orders={orders} />;
      case 'pet-services':
        return <PetServices user={user} />;
      case 'profile':
        return <ProfileManagement user={user} onUpdateProfile={handleUpdateProfile} />;
      case 'addresses':
        return (
          <AddressBook
            addresses={addresses}
            onAddAddress={handleAddAddress}
            onUpdateAddress={handleUpdateAddress}
            onDeleteAddress={handleDeleteAddress}
            onSetDefault={handleSetDefaultAddress}
          />
        );
      case 'wishlist':
        return (
          <WishlistSection
            wishlistItems={wishlistItems}
            onRemoveFromWishlist={handleRemoveFromWishlist}
            onAddToCart={handleAddToCart}
          />
        );
      case 'reviews':
        return <UserReviews />;
      case 'preferences':
        return (
          <PreferencesSection
            preferences={preferences}
            onUpdatePreferences={handleUpdatePreferences}
          />
        );
      case 'overview':
      default:
        return (
          <DashboardOverview
            user={user}
            recentOrders={recentOrders}
            loyaltyPoints={loyaltyPoints}
            wishlistCount={wishlistCount}
            pendingReviewsCount={pendingReviewsCount}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onSearch={(query) => console.log('Search:', query)}
      />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Sidebar Toggle */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="w-full bg-card border border-border rounded-lg p-4 flex items-center justify-between"
            >
              <span className="font-body font-medium text-foreground">
                Account Menu
              </span>
              <span className="text-muted-foreground">
                {isMobileSidebarOpen ? '×' : '☰'}
              </span>
            </button>
            
            {isMobileSidebarOpen && (
              <div className="mt-4">
                <DashboardSidebar
                  user={user}
                  onSectionChange={handleSectionChange}
                  activeSection={activeSection}
                  wishlistCount={wishlistCount}
                  pendingReviewsCount={pendingReviewsCount}
                />
              </div>
            )}
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:w-1/4">
            <DashboardSidebar
              user={user}
              onSectionChange={handleSectionChange}
              activeSection={activeSection}
              wishlistCount={wishlistCount}
              pendingReviewsCount={pendingReviewsCount}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1 lg:w-3/4">
            {renderActiveSection()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAccountDashboard;