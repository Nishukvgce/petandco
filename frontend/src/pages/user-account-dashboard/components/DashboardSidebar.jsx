import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import Icon from '../../../components/AppIcon';

const DashboardSidebar = ({ user, onSectionChange, activeSection, pendingReviewsCount }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const menuItems = [
    {
      id: 'overview',
      label: 'Dashboard',
      icon: 'LayoutDashboard',
      description: 'Account overview'
    },
    {
      id: 'pet-services',
      label: 'My Pet Services',
      icon: 'PawPrint',
      description: 'Walking, boarding, grooming'
    },
    {
      id: 'orders',
      label: 'My Orders',
      icon: 'Package',
      description: 'Order history & tracking'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: 'User',
      description: 'Personal information'
    },
    {
      id: 'addresses',
      label: 'Address Book',
      icon: 'MapPin',
      description: 'Shipping addresses'
    },
    {
      id: 'wishlist',
      label: 'Wishlist',
      icon: 'Heart',
      description: 'Saved products'
    },
    {
      id: 'reviews',
      label: 'My Reviews',
      icon: 'Star',
      description: 'Product reviews'
    }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-6 h-fit sticky top-24">
      {/* User Info */}
      <div className="flex items-center space-x-3 mb-6 pb-6 border-b border-border">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <Icon name="User" size={24} className="text-primary" />
        </div>
        <div>
          <h3 className="font-heading font-semibold text-foreground">
            {user?.name}
          </h3>
          <p className="font-body text-sm text-muted-foreground">
            {user?.email}
          </p>
        </div>
      </div>
      {/* Navigation Menu */}
      <nav className="space-y-2">
        {menuItems?.map((item) => (
          <button
            key={item?.id}
            onClick={() => onSectionChange(item?.id)}
            className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200 text-left relative ${
              activeSection === item?.id
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted text-foreground'
            }`}
          >
            <Icon 
              name={item?.icon} 
              size={20} 
              className={activeSection === item?.id ? 'text-primary-foreground' : 'text-muted-foreground'}
            />
            <div className="flex-1">
              <div className={`font-body font-medium flex items-center justify-between ${
                activeSection === item?.id ? 'text-primary-foreground' : 'text-foreground'
              }`}>
                <span>{item?.label}</span>
                {/* Reviews badge */}
                {item?.id === 'reviews' && pendingReviewsCount > 0 && (
                  <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                    {pendingReviewsCount}
                  </span>
                )}
              </div>
              <div className={`font-caption text-xs ${
                activeSection === item?.id ? 'text-primary-foreground/80' : 'text-muted-foreground'
              }`}>
                {item?.description}
                {item?.id === 'reviews' && pendingReviewsCount > 0 && (
                  <span className="ml-1 text-yellow-400">• Action needed</span>
                )}
              </div>
            </div>
          </button>
        ))}
      </nav>
      {/* Logout Button */}
      <div className="mt-6 pt-6 border-t border-border">
        <button
          onClick={async () => {
            try {
              console.log('Logging out user...');
              
              // Show loading state if needed (optional)
              const button = event.target.closest('button');
              const originalText = button.querySelector('span').textContent;
              button.querySelector('span').textContent = 'Logging out...';
              button.disabled = true;
              
              const result = await signOut();
              if (!result.error) {
                console.log('Logout successful, redirecting to homepage');
                // Small delay to show feedback before redirect
                setTimeout(() => {
                  navigate('/homepage');
                }, 100);
              } else {
                console.error('Logout failed:', result.error);
                // Reset button state on error
                button.querySelector('span').textContent = originalText;
                button.disabled = false;
              }
            } catch (error) {
              console.error('Logout error:', error);
              // Reset button state on error
              const button = event.target.closest('button');
              button.querySelector('span').textContent = 'Logout';
              button.disabled = false;
            }
          }}
          className="w-full flex items-center space-x-3 p-3 rounded-lg text-destructive hover:bg-destructive/10 transition-colors duration-200 disabled:opacity-50"
        >
          <Icon name="LogOut" size={20} />
          <span className="font-body font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default DashboardSidebar;