import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AdditionalServices = ({ onBookService }) => {
  const boardingService = {
    name: 'Pet Boarding (Per Day)',
    serviceType: 'pet-boarding',
    price: 799,
    duration: '24 hours',
    petType: 'dog', // default; form allows changing
  };

  const walkingOptions = [
    { name: 'Pet Walking - 30 mins', serviceType: 'pet-walking', price: 199, duration: '30 minutes' },
    { name: 'Pet Walking - 45 mins', serviceType: 'pet-walking', price: 279, duration: '45 minutes' },
    { name: 'Pet Walking - 60 mins', serviceType: 'pet-walking', price: 349, duration: '60 minutes' },
  ];

  return (
    <div className="space-y-8">
      {/* Pet Boarding */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="bg-gradient-to-r from-amber-100 to-orange-100 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Icon name="Home" size={28} className="text-amber-600" />
            <h3 className="text-2xl font-heading font-bold text-gray-800">Pet Boarding</h3>
          </div>
          <p className="text-sm text-gray-700 max-w-3xl">
            Safe, clean, and comfortable overnight stay for your pet with supervised care, regular meals, and playtime.
          </p>
        </div>
        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center gap-2 text-foreground"><Icon name="Shield" size={18} /><span>Hygienic kennels with daily sanitization</span></div>
            <div className="flex items-center gap-2 text-foreground"><Icon name="Utensils" size={18} /><span>Custom meal schedule (owner-provided food preferred)</span></div>
            <div className="flex items-center gap-2 text-foreground"><Icon name="Heart" size={18} /><span>Playtime and walks as per routine</span></div>
            <div className="flex items-center gap-2 text-foreground"><Icon name="Camera" size={18} /><span>Daily photo/video updates on WhatsApp</span></div>
          </div>
          <div className="bg-primary/5 rounded-lg p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-foreground">Starting at</span>
              <span className="text-2xl font-bold text-primary">₹{boardingService.price}/day</span>
            </div>
            <div className="text-sm text-muted-foreground mb-4">Includes 24 hours stay</div>
            <Button onClick={() => onBookService(boardingService)} className="w-full" iconName="Calendar" iconPosition="left">
              Book Boarding
            </Button>
          </div>
        </div>
      </div>

      {/* Pet Walking */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-100 to-teal-100 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Icon name="Footprints" size={28} className="text-emerald-600" />
            <h3 className="text-2xl font-heading font-bold text-gray-800">Pet Walking</h3>
          </div>
          <p className="text-sm text-gray-700 max-w-3xl">
            Daily walks tailored to your pet's energy and routine. Choose a session length below and book quickly.
          </p>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {walkingOptions.map((opt) => (
            <div key={opt.name} className="border border-border rounded-lg p-5 flex flex-col">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-foreground">{opt.name}</span>
                <span className="text-primary font-bold">₹{opt.price}</span>
              </div>
              <div className="text-sm text-muted-foreground mb-4">Duration: {opt.duration}</div>
              <Button onClick={() => onBookService(opt)} className="mt-auto" variant="outline" iconName="Calendar" iconPosition="left">
                Book Walk
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* PET&CO Outlet */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="bg-gradient-to-r from-sky-100 to-indigo-100 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Icon name="Store" size={28} className="text-sky-700" />
            <h3 className="text-2xl font-heading font-bold text-gray-800">PET&CO Outlet</h3>
          </div>
          <p className="text-sm text-gray-700 max-w-3xl">
            Visit our physical outlet for premium pet supplies, grooming products, and expert guidance. Try before you buy and get personalized recommendations.
          </p>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-foreground"><Icon name="MapPin" size={18} /><span>123 PET&CO Street, Your City</span></div>
            <div className="flex items-center gap-2 text-foreground"><Icon name="Clock" size={18} /><span>Mon-Fri: 9:30am-10pm, Sun: 10am-10:30pm</span></div>
            <div className="flex items-center gap-2 text-foreground"><Icon name="Phone" size={18} /><span>Call: 9008003996</span></div>
          </div>
          <div className="md:col-span-2 flex gap-3 md:justify-end">
            <a href="tel:9008003996" className="inline-flex items-center gap-2 border border-primary text-primary px-4 py-2 rounded-lg hover:bg-primary/10">
              <Icon name="Phone" size={18} /> Call Now
            </a>
            <a href="https://maps.google.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90">
              <Icon name="Navigation" size={18} /> Get Directions
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdditionalServices;
