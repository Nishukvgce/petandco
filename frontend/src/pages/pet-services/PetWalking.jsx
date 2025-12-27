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
      <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
        <section className="relative py-16 overflow-hidden">
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
        <section className="py-16 relative">
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

        {/* Benefits section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Image collage */}
            <div className="relative">
              <div className="absolute -top-6 -left-6 h-16 w-16 rounded-full bg-orange-200/50 blur-md" />
              <div className="grid grid-cols-2 gap-6">
                <AppImage src="/assets/images/dog/db1.webp" alt="Walker running with dog" className="w-full h-40 md:h-52 lg:h-64 object-cover rounded-2xl" />
                <AppImage src="/assets/images/dog/db2.webp" alt="Dog being groomed" className="w-full h-40 md:h-52 lg:h-64 object-cover rounded-2xl" />
                <AppImage src="/assets/images/dog/db3.webp" alt="Owner with happy dog" className="w-full h-40 md:h-52 lg:h-64 object-cover rounded-2xl" />
                <AppImage src="/assets/images/dog/db4.webp" alt="Walker with small dog" className="w-full h-40 md:h-52 lg:h-64 object-cover rounded-2xl" />
              </div>
            </div>

            {/* Benefits list */}
            <div>
              <h3 className="text-3xl font-heading font-bold text-orange-500 leading-tight">Benefits of dog walking with PET&CO</h3>
              <p className="mt-2 text-2xl font-heading font-semibold text-orange-500">pet&co</p>
              <ul className="mt-6 space-y-4">
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-8 w-8 inline-flex items-center justify-center rounded-full bg-orange-100 text-orange-600"><Icon name="MapPin" size={18} /></span>
                  <p className="text-foreground">Live updates + walk history, all in-app.</p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-8 w-8 inline-flex items-center justify-center rounded-full bg-orange-100 text-orange-600"><Icon name="Dog" size={18} /></span>
                  <p className="text-foreground">Trained walkers who treat your dog like their own.</p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-8 w-8 inline-flex items-center justify-center rounded-full bg-orange-100 text-orange-600"><Icon name="Phone" size={18} /></span>
                  <p className="text-foreground">Cancel, reschedule, or book — your way.</p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-8 w-8 inline-flex items-center justify-center rounded-full bg-orange-100 text-orange-600"><Icon name="Clock" size={18} /></span>
                  <p className="text-foreground">Support from 10 am to 7 pm, every day.</p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-8 w-8 inline-flex items-center justify-center rounded-full bg-orange-100 text-orange-600"><Icon name="RefreshCcw" size={18} /></span>
                  <p className="text-foreground">If your walker can’t make it, we’ll find a replacement or give you an extra walk.</p>
                </li>
              </ul>
            </div>
            </div>
          </div>
        </section>

        {/* Reviews & Stats */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-center text-3xl font-heading font-bold text-orange-500">OUR REVIEWS</h2>

            {/* Rating + Google */}
            <div className="mt-6 grid grid-cols-1 xl:grid-cols-4 gap-6 items-stretch">
              <div className="bg-white rounded-2xl border border-border shadow-sm p-6 flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all">
                <div className="flex flex-col items-center text-center">
                  <div className="h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center text-2xl">🐶</div>
                  <p className="mt-3 font-semibold">PET&CO – Dog walking and grooming services</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-2xl font-bold">4.2</span>
                    <div className="flex text-yellow-500">
                      <Icon name="Star" size={18} />
                      <Icon name="Star" size={18} />
                      <Icon name="Star" size={18} />
                      <Icon name="Star" size={18} />
                      <Icon name="StarHalf" size={18} />
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">powered by Google</p>
                </div>
                <div className="mt-4 flex justify-center">
                  <a href="https://www.google.com/search?q=PET%26CO+dog+walking+reviews" target="_blank" rel="noreferrer">
                    <Button size="sm" variant="secondary" iconName="ExternalLink">Review us on Google</Button>
                  </a>
                </div>
              </div>

              {/* Review cards */}
              {[{
                name: 'Pattabiram', time: 'a month ago', text: 'Good service for my 3 pets. Nail clipping & teeth cleaning were great. Live updates were helpful.'
              }, {
                name: 'Bhawna Joshi', time: '5 months ago', text: 'Exceptional service. Proactive, professional and safe. Highly recommend for busy pet parents.'
              }, {
                name: 'Abhilasha M.', time: '5 months ago', text: 'Wonderful services. My dog feels extremely happy post walks. Walkers are professional and punctual.'
              }].map((r, i) => (
                <div key={i} className="bg-white rounded-2xl border border-border shadow-sm p-6 hover:shadow-md hover:-translate-y-0.5 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center font-semibold">{r.name.charAt(0)}</div>
                      <div>
                        <p className="font-medium">{r.name}</p>
                        <p className="text-xs text-muted-foreground">{r.time}</p>
                      </div>
                    </div>
                    <div className="flex text-yellow-500">
                      <Icon name="Star" size={16} />
                      <Icon name="Star" size={16} />
                      <Icon name="Star" size={16} />
                      <Icon name="Star" size={16} />
                      <Icon name="Star" size={16} />
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-foreground">{r.text}</p>
                  <a className="mt-3 inline-block text-sm text-primary hover:underline" href="https://www.google.com/search?q=PET%26CO+dog+walking+reviews" target="_blank" rel="noreferrer">View Full Review</a>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {[
                { value: '2,00,000+', label: 'dog walks delivered' },
                { value: '5,000+', label: 'dogs walked' },
                { value: '1,300+', label: 'family of dog parents' },
                { value: '83,000 kms', label: 'tracked on the app' },
              ].map((s, idx) => (
                <div key={idx} className="bg-white rounded-2xl border border-border shadow-sm p-6 text-center">
                  <div className="text-3xl font-heading font-bold text-orange-500">{s.value}</div>
                  <div className="mt-2 text-sm text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      {showBookingForm && (
        <WalkingBookingForm service={selectedService} options={walkingOptions} onClose={() => setShowBookingForm(false)} />
      )}
      <Footer />
      <MobileBottomNav />
    </>
  );
};

export default PetWalkingPage;
