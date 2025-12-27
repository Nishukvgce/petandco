import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import Footer from '../homepage/components/Footer';
import MobileBottomNav from '../../components/ui/MobileBottomNav';

const OutletMainLanding = () => {
  const outletCategories = [
    {
      title: 'OUTLET FOOD & TREATS',
      items: [
        'Raw Hide Bones',
        'Knotted Bones', 
        'Munchies',
        'Dental Treats',
        'Calcium Treats',
        'Wet Food / Gravy',
        'Puppy Treats',
        'All Food & Treats'
      ],
      path: '/shop-for-outlet/food-treats',
      badge: 'Up to 60% Off'
    },
    {
      title: 'OUTLET TOYS',
      items: [
        'Soft Toys',
        'Rubber Toys',
        'Rope Toys', 
        'Squeaky Toys',
        'Interactive Toys',
        'All Toys'
      ],
      path: '/shop-for-outlet/toys',
      badge: 'Special Deals'
    },
    {
      title: 'OUTLET GROOMING & CARE',
      items: [
        'Combs',
        'Brushes',
        'Nail Clippers',
        'Trimmers',
        'All Grooming'
      ],
      path: '/shop-for-outlet/grooming-care',
      badge: 'Limited Stock'
    },
    {
      title: 'OUTLET WALKING ESSENTIALS',
      items: [
        'Collars',
        'Leashes', 
        'Harnesses',
        'All Walking Essentials'
      ],
      path: '/shop-for-outlet/walking-essentials',
      badge: 'Best Sellers'
    },
    {
      title: 'OUTLET FEEDING ESSENTIALS',
      items: [
        'Bowls',
        'Slow Feeders',
        'Water Dispensers',
        'All Feeding Essentials'
      ],
      path: '/shop-for-outlet/feeding-essentials',
      badge: 'Coming Soon'
    },
    {
      title: 'OUTLET BEDS & COMFORT',
      items: [
        'Pet Beds',
        'Blankets',
        'Cushions',
        'All Beds & Comfort'
      ],
      path: '/shop-for-outlet/beds-comfort',
      badge: 'Coming Soon'
    },
    {
      title: 'OUTLET TRAVEL & SAFETY',
      items: [
        'Carriers',
        'Travel Bowls',
        'Safety Gear',
        'All Travel & Safety'
      ],
      path: '/shop-for-outlet/travel-safety',
      badge: 'Coming Soon'
    },
    {
      title: 'OUTLET ACCESSORIES',
      items: [
        'Pet Accessories',
        'Training Aids',
        'Hygiene Products',
        'All Accessories'
      ],
      path: '/shop-for-outlet/accessories',
      badge: 'Coming Soon'
    }
  ];

  return (
    <>
      <Helmet>
        <title>PET&CO Outlet - Amazing Deals | PET&CO</title>
        <meta name="description" content="Explore amazing deals up to 60% off at PET&CO Outlet. Premium pet supplies at unbeatable prices." />
      </Helmet>
      <Header />
      
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-orange-100 to-red-100">
          <div className="container mx-auto px-4 py-12">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-heading font-bold text-gray-800 mb-4">
                PET&CO Outlet
              </h1>
              <p className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto">
                Premium pet supplies at amazing outlet prices. Limited stock, maximum savings!
              </p>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <span className="bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-full">
                  Up to 60% OFF
                </span>
                <span className="bg-orange-500 text-white text-sm font-semibold px-4 py-2 rounded-full">
                  Limited Time
                </span>
                <span className="bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-full">
                  While Stocks Last
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-heading font-bold text-gray-800 text-center mb-12">
              Outlet Categories
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {outletCategories.map((category, index) => (
                <Link 
                  key={index} 
                  to={category.path}
                  className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 hover:border-orange-400"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-800 group-hover:text-orange-600 transition-colors">
                        {category.title}
                      </h3>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        category.badge === 'Up to 60% Off' ? 'bg-red-100 text-red-700' :
                        category.badge === 'Special Deals' ? 'bg-orange-100 text-orange-700' :
                        category.badge === 'Limited Stock' ? 'bg-yellow-100 text-yellow-700' :
                        category.badge === 'Best Sellers' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {category.badge}
                      </span>
                    </div>
                    <ul className="space-y-2">
                      {category.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="text-sm text-gray-600 flex items-center">
                          <span className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-2 flex-shrink-0"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 text-orange-600 font-medium text-sm group-hover:text-orange-700">
                      Shop Now →
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Special Offer Banner */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-8">
          <div className="container mx-auto px-4 text-center">
            <h3 className="text-2xl font-bold mb-2">Don't Miss Out!</h3>
            <p className="text-lg mb-4">Visit our physical outlet store for even more exclusive deals</p>
            <div className="flex items-center justify-center gap-2 text-sm">
              <span>📍</span>
              <span>Find our outlet location in store locator</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </>
  );
};

export default OutletMainLanding;