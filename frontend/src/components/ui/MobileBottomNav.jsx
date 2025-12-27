import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';

const MobileBottomNav = () => {
    const location = useLocation();
    const { getCartItemCount } = useCart();
    const cartCount = getCartItemCount();

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    const navItems = [
        {
            path: '/',
            icon: (active) => (
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${active ? 'text-orange-500' : 'text-gray-600'}`} fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            ),
            label: 'Home'
        },
        {
            path: '/pharmacy',
            icon: (active) => (
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${active ? 'text-orange-500' : 'text-gray-600'}`} fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
            label: 'Pharmacy'
        },
        {
            path: '/shopping-cart',
            icon: (active) => (
                <div className="relative">
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${active ? 'text-orange-500' : 'text-gray-600'}`} fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {cartCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                            {cartCount}
                        </span>
                    )}
                </div>
            ),
            label: 'Cart'
        },
        {
            path: '/user-account-dashboard',
            icon: (active) => (
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${active ? 'text-orange-500' : 'text-gray-600'}`} fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            ),
            label: 'Account'
        }
    ];

    return (
        <>
            {/* Spacer removed: footer/padding should be handled by individual pages */}

            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
                <div className="flex items-center justify-around h-16">
                    {navItems.map((item) => {
                        const active = isActive(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className="flex flex-col items-center justify-center flex-1 h-full"
                            >
                                {item.icon(active)}
                                <span className={`text-xs mt-1 ${active ? 'text-orange-500 font-medium' : 'text-gray-600'}`}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </>
    );
};

export default MobileBottomNav;
