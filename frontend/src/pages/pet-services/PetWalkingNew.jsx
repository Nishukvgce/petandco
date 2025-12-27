import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import Footer from '../homepage/components/Footer';
import MobileBottomNav from '../../components/ui/MobileBottomNav';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import AppImage from '../../components/AppImage';
import WalkingBookingForm from './components/WalkingBookingForm';

const PetWalkingPage = () => {
  const [selectedService, setSelectedService] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const walkingOptions = [
    { name: 'Quick Walk - 30 mins', serviceType: 'pet-walking', price: 199, duration: '30 minutes', description: 'Perfect for busy schedules' },
    { name: 'Standard Walk - 45 mins', serviceType: 'pet-walking', price: 279, duration: '45 minutes', description: 'Balanced exercise & fun', popular: true },
    { name: 'Extended Walk - 60 mins', serviceType: 'pet-walking', price: 349, duration: '60 minutes', description: 'Maximum exercise & exploration' },
  ];
  
  const handleBook = (service) => { setSelectedService(service); setShowBookingForm(true); };

  return (
    <>
      <Helmet>
        <title>Premium Pet Walking Services | PET&CO</title>
        <meta name="description" content="Professional pet walking with GPS tracking, certified walkers, and real-time updates. Book your pet's perfect walk today!" />
      </Helmet>
      
      <Header />
      
      {/* Modern Hero Section */}
      <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
        <section className="relative py-24 overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-300/10 rounded-full blur-3xl animate-pulse delay-500"></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Content */}
              <div className="space-y-10">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 px-6 py-3 rounded-full border border-blue-200">
                    <Icon name="Award" size={18} className="text-blue-600" />
                    <span className="text-sm font-bold text-gray-700">India's #1 Pet Walking Service</span>
                  </div>
                  
                  <h1 className="text-6xl lg:text-7xl font-black leading-none">
                    <span className="block text-gray-800">Your Pet's</span>
                    <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                      Perfect Walk
                    </span>
                    <span className="block text-gray-800">Awaits</span>
                  </h1>
                  
                  <p className="text-xl text-gray-600 leading-relaxed max-w-xl">
                    GPS-tracked walks with certified professionals. Real-time updates, flexible scheduling, and complete peace of mind for busy pet parents.
                  </p>
                </div>
                
                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="xl"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-5 text-lg font-bold shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 transition-all duration-300 rounded-2xl"
                    iconName="Footprints"
                    onClick={() => handleBook(walkingOptions[1])}
                  >
                    Book Premium Walk ₹279
                  </Button>
                  
                  <Button
                    size="xl"
                    variant="outline"
                    className="border-2 border-gray-300 hover:border-purple-400 px-10 py-5 text-lg font-bold hover:bg-purple-50 transition-all duration-300 rounded-2xl group"
                    iconName="Video"
                  >
                    <span className="group-hover:text-purple-600 transition-colors">See How It Works</span>
                  </Button>
                </div>
                
                {/* Trust indicators */}
                <div className="grid grid-cols-3 gap-8 pt-8">
                  <div className="text-center group">
                    <div className="text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                      2L+
                    </div>
                    <div className="text-sm font-semibold text-gray-500 mt-1">Happy Walks</div>
                  </div>
                  <div className="text-center group">
                    <div className="text-3xl font-black bg-gradient-to-r from-green-600 to-cyan-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                      4.9★
                    </div>
                    <div className="text-sm font-semibold text-gray-500 mt-1">Pet Parent Rating</div>
                  </div>
                  <div className="text-center group">
                    <div className="text-3xl font-black bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                      24/7
                    </div>
                    <div className="text-sm font-semibold text-gray-500 mt-1">Live Support</div>
                  </div>
                </div>
              </div>
              
              {/* Hero Image */}
              <div className="relative">
                <div className="relative z-10 group">
                  {/* Main card */}
                  <div className="bg-white rounded-3xl shadow-2xl p-8 transform rotate-2 group-hover:rotate-0 transition-all duration-700 hover:shadow-3xl">
                    <AppImage
                      src="/assets/images/dog/db1.webp"
                      alt="Professional pet walking service"
                      className="w-full h-96 object-cover rounded-2xl"
                    />
                    
                    {/* Live tracking notification */}
                    <div className="absolute -bottom-6 -left-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl shadow-2xl px-6 py-4 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                        <div>
                          <div className="font-bold text-sm">Walk in Progress</div>
                          <div className="text-xs opacity-90">2.3 km • 22 mins remaining</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Quality badge */}
                    <div className="absolute -top-6 -right-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl shadow-2xl px-6 py-3 transform rotate-6 hover:rotate-3 transition-transform duration-300">
                      <div className="flex items-center gap-2">
                        <Icon name="Shield" size={18} />
                        <span className="text-sm font-bold">Certified Walker</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Floating elements */}
                  <div className="absolute top-10 -left-10 bg-blue-100 rounded-full p-4 shadow-lg animate-bounce">
                    <Icon name="Heart" size={24} className="text-blue-600" />
                  </div>
                  
                  <div className="absolute bottom-10 -right-10 bg-green-100 rounded-full p-4 shadow-lg animate-bounce delay-1000">
                    <Icon name="Star" size={24} className="text-green-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Walking Options */}
        <section className="py-20 relative">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 to-blue-100 px-6 py-3 rounded-full border border-green-200 mb-6">
                <Icon name="Clock" size={18} className="text-green-600" />
                <span className="text-sm font-bold text-gray-700">Choose Your Perfect Duration</span>
              </div>
              
              <h2 className="text-5xl font-black text-gray-800 mb-4">
                Tailored Walking
                <span className="block bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  Packages
                </span>
              </h2>
              
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Every dog is unique. Choose the walking duration that matches your pet's energy level and exercise needs.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {walkingOptions.map((option, index) => (
                <div
                  key={option.name}
                  className={`relative group transform hover:-translate-y-4 transition-all duration-500 ${
                    option.popular ? 'scale-105 z-10' : ''
                  }`}
                >
                  {/* Popular badge */}
                  {option.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg z-20">
                      🔥 Most Popular
                    </div>
                  )}
                  
                  <div className={`bg-white rounded-3xl shadow-xl p-8 border-2 group-hover:shadow-2xl transition-all duration-300 ${
                    option.popular 
                      ? 'border-orange-200 bg-gradient-to-br from-orange-50 to-red-50' 
                      : 'border-gray-100 group-hover:border-blue-200'
                  }`}>
                    {/* Duration badge */}
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-6 ${
                      option.popular 
                        ? 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-700'
                        : 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700'
                    }`}>
                      <Icon name="Timer" size={16} />
                      {option.duration}
                    </div>
                    
                    <h3 className="text-2xl font-black text-gray-800 mb-3">{option.name}</h3>
                    <p className="text-gray-600 mb-6">{option.description}</p>
                    
                    <div className="flex items-end justify-between mb-8">
                      <div>
                        <span className="text-4xl font-black text-gray-800">₹{option.price}</span>
                        <span className="text-gray-500 ml-2">per walk</span>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                        option.popular 
                          ? 'bg-orange-100 text-orange-600'
                          : 'bg-green-100 text-green-600'
                      }`}>
                        GPS Tracked
                      </div>
                    </div>
                    
                    <Button
                      className={`w-full py-4 text-lg font-bold rounded-2xl transition-all duration-300 ${
                        option.popular
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-xl hover:shadow-2xl'
                          : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl'
                      }`}
                      onClick={() => handleBook(option)}
                      iconName="Calendar"
                    >
                      Book This Walk
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 bg-gradient-to-r from-gray-50 to-blue-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-black text-gray-800 mb-4">
                Why Choose
                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  PET&CO Walking?
                </span>
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: "MapPin",
                  title: "Live GPS Tracking",
                  description: "Follow your pet's walk in real-time with precise location updates",
                  gradient: "from-blue-500 to-cyan-500"
                },
                {
                  icon: "Shield",
                  title: "Certified Walkers",
                  description: "Background-checked professionals who love pets as much as you do",
                  gradient: "from-green-500 to-emerald-500"
                },
                {
                  icon: "Camera",
                  title: "Photo Updates",
                  description: "Receive adorable photos and videos of your pet during walks",
                  gradient: "from-purple-500 to-pink-500"
                },
                {
                  icon: "Clock",
                  title: "Flexible Scheduling",
                  description: "Book walks that fit your schedule - daily, weekly, or as needed",
                  gradient: "from-orange-500 to-red-500"
                }
              ].map((feature, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-lg p-8 text-center transform hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 group"
                >
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon name={feature.icon} size={32} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-black text-gray-800 mb-4">
                Happy Pet Parents
                <span className="block bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                  Love Us!
                </span>
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: "Priya Sharma",
                  location: "Mumbai",
                  rating: 5,
                  comment: "Absolutely amazing service! The walker sends photos and updates throughout. My dog Buddy loves his walks!",
                  avatar: "P"
                },
                {
                  name: "Arjun Patel",
                  location: "Bangalore",
                  rating: 5,
                  comment: "Professional and reliable. GPS tracking gives me peace of mind when I'm at work. Highly recommend!",
                  avatar: "A"
                },
                {
                  name: "Sneha Gupta",
                  location: "Delhi",
                  rating: 5,
                  comment: "Best decision ever! My elderly dog gets the exercise he needs with gentle, caring walkers.",
                  avatar: "S"
                }
              ].map((testimonial, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-lg p-8 transform hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">{testimonial.name}</h4>
                      <p className="text-gray-500 text-sm">{testimonial.location}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Icon key={i} name="Star" size={16} className="text-yellow-500 fill-current" />
                    ))}
                  </div>
                  
                  <p className="text-gray-600 italic">"{testimonial.comment}"</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-5xl font-black mb-6">Ready to Give Your Pet the Perfect Walk?</h2>
            <p className="text-xl mb-10 max-w-2xl mx-auto">
              Join thousands of happy pet parents who trust PET&CO for their furry friend's exercise and happiness.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button
                size="xl"
                className="bg-white text-blue-600 hover:bg-gray-100 px-10 py-5 text-lg font-bold rounded-2xl transform hover:-translate-y-1 transition-all duration-300 shadow-2xl"
                iconName="Footprints"
                onClick={() => handleBook(walkingOptions[1])}
              >
                Book Your First Walk
              </Button>
              
              <Button
                size="xl"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-10 py-5 text-lg font-bold rounded-2xl transition-all duration-300"
                iconName="Phone"
              >
                Call Us: +91-98765-43210
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Booking Form */}
      {showBookingForm && (
        <WalkingBookingForm 
          service={selectedService} 
          options={walkingOptions} 
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

export default PetWalkingPage;