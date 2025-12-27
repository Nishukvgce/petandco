import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from '../components/ui/Header';
import Footer from './homepage/components/Footer';
import MobileBottomNav from '../components/ui/MobileBottomNav';

const ComingSoon = ({ title = "Coming Soon", message = "This page is under development." }) => {
  return (
    <>
      <Helmet>
        <title>{title} | Pet & Co</title>
        <meta name="description" content={message} />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Header />
        
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="mb-8">
              <div className="text-6xl font-bold text-muted-foreground mb-4">🚧</div>
              <h1 className="text-2xl font-bold text-foreground mb-2">{title}</h1>
              <p className="text-muted-foreground mb-6">{message}</p>
              <p className="text-sm text-muted-foreground mb-8">We're working hard to bring you something amazing!</p>
            </div>
            
            <div className="space-y-4">
              <Link
                to="/"
                className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-md font-semibold hover:bg-primary/90 transition-colors"
              >
                Back to Home
              </Link>
              
              <div className="text-sm text-muted-foreground">
                <p>In the meantime, explore our:</p>
                <div className="flex justify-center gap-4 mt-2">
                  <Link to="/cats" className="text-primary hover:underline">Cats</Link>
                  <Link to="/shop-for-dogs" className="text-primary hover:underline">Dogs</Link>
                  <Link to="/pharmacy" className="text-primary hover:underline">Pharmacy</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <Footer />
        <MobileBottomNav />
      </div>
    </>
  );
};

export default ComingSoon;