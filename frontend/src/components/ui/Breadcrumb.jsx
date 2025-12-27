import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

const Breadcrumb = ({ customItems = null }) => {
  const location = useLocation();
  
  const pathMap = {
    '/homepage': 'Home',
    '/shop-for-dogs': 'Products',
    '/product-detail-page': 'Product Details',
    '/product-details': 'Product Details',
    '/shopping-cart': 'Shopping Cart',
    '/user-account-dashboard': 'My Account',
    '/checkout-process': 'Checkout'
  };

  const generateBreadcrumbs = () => {
    if (customItems) return customItems;
    
    const pathSegments = location?.pathname?.split('/')?.filter(Boolean);
    const breadcrumbs = [{ label: 'Home', path: '/homepage' }];
    
    let currentPath = '';
    pathSegments?.forEach((segment) => {
      currentPath += `/${segment}`;
      const label = pathMap?.[currentPath] || segment?.replace(/-/g, ' ')?.replace(/\b\w/g, l => l?.toUpperCase());
      breadcrumbs?.push({ label, path: currentPath });
    });
    
    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  if (breadcrumbs?.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className="py-4">
      <ol className="flex items-center space-x-2 text-sm">
        {breadcrumbs?.map((crumb, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <Icon 
                name="ChevronRight" 
                size={16} 
                className="text-muted-foreground mx-2" 
              />
            )}
            {index === breadcrumbs?.length - 1 ? (
              <span className="font-body font-medium text-foreground">
                {crumb?.label}
              </span>
            ) : (
              <Link
                to={crumb?.path}
                className="font-body text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                {crumb?.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;