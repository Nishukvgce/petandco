import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import Footer from '../homepage/components/Footer';
import MobileBottomNav from '../../components/ui/MobileBottomNav';
import Icon from '../../components/AppIcon';
import ServicePackages from './components/ServicePackages';
import BookingForm from './components/BookingForm';
import ServiceHero from './components/ServiceHero';
import AdditionalServices from './components/AdditionalServices';

const PetServicesPage = () => {
  const [selectedService, setSelectedService] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);

  const handleBookService = (service) => {
    setSelectedService(service);
    setShowBookingForm(true);
  };

  return (
    <>
      <Helmet>
        <title>Pet Services - Professional Grooming & Care | PET&CO</title>
        <meta
          name="description"
          content="Professional pet grooming services for cats and dogs. Fresh packs, pampered packs, and full grooming services with add-on options. Book your appointment today!"
        />
        <meta name="keywords" content="pet grooming, dog grooming, cat grooming, pet bathing, nail clipping, pet care services" />
        <meta property="og:title" content="Pet Services - Professional Grooming & Care | PET&CO" />
        <meta property="og:description" content="Professional pet grooming services for cats and dogs. Book your appointment today!" />
      </Helmet>

      <Header />
      
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <ServiceHero />
        
        {/* Service Packages Section */}
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Our Pet Care Services
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Professional grooming and care services for your beloved pets. 
              We provide comprehensive packages to keep your pets healthy, happy, and looking their best.
            </p>
          </div>

          {/* Service Categories */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Cat Grooming Services */}
            <div className="bg-card rounded-lg border border-border overflow-hidden">
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Icon name="Cat" size={32} className="text-purple-600" />
                  <h3 className="text-2xl font-heading font-bold text-gray-800">
                    Cat Grooming Packages
                  </h3>
                </div>
              </div>
              <div className="p-6">
                <ServicePackages 
                  petType="cat" 
                  onBookService={handleBookService}
                />
              </div>
            </div>

            {/* Dog Grooming Services */}
            <div className="bg-card rounded-lg border border-border overflow-hidden">
              <div className="bg-gradient-to-r from-blue-100 to-green-100 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Icon name="Dog" size={32} className="text-blue-600" />
                  <h3 className="text-2xl font-heading font-bold text-gray-800">
                    Dog Grooming Packages
                  </h3>
                </div>
              </div>
              <div className="p-6">
                <ServicePackages 
                  petType="dog" 
                  onBookService={handleBookService}
                />
              </div>
            </div>
          </div>

          {/* Additional Services */}
          {/* <div className="mb-12">
            <h3 className="text-2xl font-heading font-bold text-foreground mb-4 text-center">More Services</h3>
            <AdditionalServices onBookService={handleBookService} />
          </div> */}

          {/* Features Section */}
          <div className="bg-card rounded-lg border border-border p-8 mb-8">
            <h3 className="text-2xl font-heading font-bold text-foreground mb-6 text-center">
              Why Choose Our Pet Services?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-primary/10 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <Icon name="Shield" size={24} className="text-primary" />
                </div>
                <h4 className="font-heading font-semibold text-foreground mb-2">Safe & Gentle</h4>
                <p className="text-sm text-muted-foreground">Professional care with gentle handling techniques</p>
              </div>
              
              <div className="text-center">
                <div className="bg-primary/10 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <Icon name="Clock" size={24} className="text-primary" />
                </div>
                <h4 className="font-heading font-semibold text-foreground mb-2">Convenient Hours</h4>
                <p className="text-sm text-muted-foreground">Monday-Friday: 9:30am-10pm, Sunday: 10am-10:30pm</p>
              </div>
              
              <div className="text-center">
                <div className="bg-primary/10 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <Icon name="Award" size={24} className="text-primary" />
                </div>
                <h4 className="font-heading font-semibold text-foreground mb-2">Expert Groomers</h4>
                <p className="text-sm text-muted-foreground">Trained professionals with years of experience</p>
              </div>
              
              <div className="text-center">
                <div className="bg-primary/10 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <Icon name="Phone" size={24} className="text-primary" />
                </div>
                <h4 className="font-heading font-semibold text-foreground mb-2">Easy Booking</h4>
                <p className="text-sm text-muted-foreground">Call 9008003996 or book online</p>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="text-center bg-primary/5 rounded-lg p-6">
            <h3 className="text-xl font-heading font-bold text-foreground mb-3">
              Ready to Book Your Pet's Grooming Session?
            </h3>
            <p className="text-muted-foreground mb-4">
              Contact us to schedule an appointment or get more information about our services.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a 
                href="tel:9008003996"
                className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Icon name="Phone" size={18} />
                Call 9008003996
              </a>
              <button 
                onClick={() => setShowBookingForm(true)}
                className="flex items-center gap-2 border border-primary text-primary px-6 py-3 rounded-lg hover:bg-primary/10 transition-colors"
              >
                <Icon name="Calendar" size={18} />
                Book Online
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Booking Form Modal */}
      {showBookingForm && (
        <BookingForm 
          service={selectedService}
          onClose={() => {
            setShowBookingForm(false);
            setSelectedService(null);
          }}
        />
      )}

      <Footer />
      <MobileBottomNav />
    </>
  );
};

export default PetServicesPage;