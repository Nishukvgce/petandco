import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import Footer from '../homepage/components/Footer';
import MobileBottomNav from '../../components/ui/MobileBottomNav';

const OutletLitterToilet = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet><title>Outlet Litter & Toilet Care - Pet & Co</title></Helmet>
      <Header />
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold">Outlet Litter & Toilet Care</h1>
        <div className="mt-8 text-center text-muted-foreground">Coming Soon - Discounted litter and toilet care products!</div>
      </div>
      <Footer /><MobileBottomNav />
    </div>
  );
};
export default OutletLitterToilet;