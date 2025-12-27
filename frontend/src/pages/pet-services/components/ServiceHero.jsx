import React from 'react';
import Icon from '../../../components/AppIcon';

const ServiceHero = () => {
  return (
    <div className="relative bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 py-16">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-foreground mb-6">
            Professional Pet <span className="text-primary">Grooming</span> Services
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8">
            Keep your furry friends looking and feeling their best with our comprehensive grooming packages. 
            Professional care for cats and dogs with experienced groomers.
          </p>
          {/* Key Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="flex flex-col items-center p-4">
              <div className="bg-primary/20 rounded-full p-3 mb-3">
                <Icon name="Heart" size={24} className="text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-foreground mb-2">Gentle Care</h3>
              <p className="text-sm text-muted-foreground text-center">
                Safe and loving handling for your pet's comfort
              </p>
            </div>
            <div className="flex flex-col items-center p-4">
              <div className="bg-secondary/20 rounded-full p-3 mb-3">
                <Icon name="Scissors" size={24} className="text-secondary" />
              </div>
              <h3 className="font-heading font-semibold text-foreground mb-2">Expert Grooming</h3>
              <p className="text-sm text-muted-foreground text-center">
                Professional styling and grooming techniques
              </p>
            </div>
            <div className="flex flex-col items-center p-4">
              <div className="bg-primary/20 rounded-full p-3 mb-3">
                <Icon name="Sparkles" size={24} className="text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-foreground mb-2">Premium Products</h3>
              <p className="text-sm text-muted-foreground text-center">
                High-quality shampoos and grooming products
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Decorative Elements: Removed Heart and Paw icons for cleaner look */}
    </div>
  );
};

export default ServiceHero;