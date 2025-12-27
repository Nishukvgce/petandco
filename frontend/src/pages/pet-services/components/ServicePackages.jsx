import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ServicePackages = ({ petType, onBookService }) => {
  // Cat Grooming Packages based on the image
  const catPackages = [
    {
      id: 'cat-fresh',
      name: 'Fresh Meow Pack',
      petType: 'cat',
      price: 999,
      duration: '1-2 hours',
      services: [
        'Bath With Shampoo',
        'Nail Clipping',
        'Ear Cleaning',
        'Mouth Spray',
        'Brushing/Combing',
        'Blow Drying',
        'Spritz of Perfume'
      ],
      addOns: [
        { name: 'Medicated Wash', price: 399 },
        { name: 'Flea & Tick Treatment', price: 499 },
        { name: 'Zero & Advance Trimming/Styling', price: 1299 }
      ],
      popular: false
    },
    {
      id: 'cat-pampered',
      name: 'Pampered Meow Pack',
      petType: 'cat',
      price: 1499,
      duration: '2-3 hours',
      services: [
        'Minor Hair Cut on Mouth, Paws & Sanitary Area',
        'Bath With Shampoo',
        'Nail Clipping',
        'Ear Cleaning',
        'Brushing/Combing',
        'Conditioning',
        'Blow Drying',
        'Spritz of Perfume',
        'Paw Massage',
        'Face Spray',
        'Mouth Spray'
      ],
      addOns: [
        { name: 'Medicated Wash', price: 399 },
        { name: 'Flea & Tick Treatment', price: 499 },
        { name: 'Zero & Advance Trimming/Styling', price: 1299 }
      ],
      popular: true
    }
  ];

  // Dog Grooming Packages based on the image
  const dogPackages = [
    {
      id: 'dog-fresh',
      name: 'Fresh Pack',
      petType: 'dog',
      price: 999,
      duration: '1-2 hours',
      services: [
        'Bathing With Shampoo',
        'Ear Cleaning',
        'Blow Drying',
        'Nail Clipping',
        'Eye Cleaning',
        'Mouth Spray',
        'Powder/Perfume',
        'Combing/Brushing'
      ],
      addOns: [
        { name: 'Medicated Wash', price: 399 },
        { name: 'Flea & Tick Treatment', price: 499 },
        { name: 'Zero & Advance Trimming', price: 1299 }
      ],
      popular: false
    },
    {
      id: 'dog-pampered',
      name: 'Pampered Pack',
      petType: 'dog',
      price: 1499,
      duration: '2-3 hours',
      services: [
        'Minor Hair Cut On Mouth, Paws & Sanitary Area',
        'Bathing & Combing',
        'Nail Clipping',
        'Blow Drying',
        'Conditioning',
        'Ear & Eye Cleaning',
        'Paw Massage',
        'Mouth Spray',
        'Powder/Perfume'
      ],
      addOns: [
        { name: 'Medicated Wash', price: 399 },
        { name: 'Flea & Tick Treatment', price: 499 },
        { name: 'Zero & Advance Trimming', price: 1299 }
      ],
      popular: true
    },
    {
      id: 'dog-full',
      name: 'Full Grooming',
      petType: 'dog',
      price: 1999,
      duration: '3-4 hours',
      services: [
        'Hair Cut & Styling',
        'Bathing & Combing',
        'Nail Clipping',
        'Ear Cleaning',
        'Eye Cleaning',
        'Conditioning',
        'Blow Drying',
        'Paw Massage',
        'Mouth Spray',
        'Powder & Perfume'
      ],
      addOns: [
        { name: 'Medicated Wash', price: 399 },
        { name: 'Flea & Tick Treatment', price: 499 },
        { name: 'Zero & Advance Trimming', price: 1299 }
      ],
      specialServices: [
        { name: 'Dematting', price: 699 },
        { name: 'Intense Dematting', price: 1499 }
      ],
      popular: false
    }
  ];

  const packages = petType === 'cat' ? catPackages : dogPackages;

  return (
    <div className="space-y-6">
      {packages.map((pkg) => (
        <div 
          key={pkg.id}
          className={`relative bg-card border rounded-lg p-6 hover:shadow-lg transition-shadow ${
            pkg.popular ? 'border-primary' : 'border-border'
          }`}
        >
          {pkg.popular && (
            <div className="absolute -top-3 left-6">
              <span className="bg-primary text-white text-sm font-medium px-4 py-1 rounded-full">
                Most Popular
              </span>
            </div>
          )}

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            {/* Package Header */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h4 className="text-xl font-heading font-bold text-foreground">
                  {pkg.name}
                </h4>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">₹{pkg.price}</div>
                  <div className="text-sm text-muted-foreground">{pkg.duration}</div>
                </div>
              </div>

              {/* Services List */}
              <div className="mb-4">
                <h5 className="font-semibold text-foreground mb-2">Services Included:</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                  {pkg.services.map((service, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Icon name="Check" size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{service}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add-ons */}
              {pkg.addOns && (
                <div className="mb-4">
                  <h5 className="font-semibold text-foreground mb-2">Available Add-ons:</h5>
                  <div className="space-y-1">
                    {pkg.addOns.map((addon, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">• {addon.name}</span>
                        <span className="font-medium text-foreground">+₹{addon.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Special Services for Full Grooming */}
              {pkg.specialServices && (
                <div className="mb-4">
                  <h5 className="font-semibold text-foreground mb-2">Special Services:</h5>
                  <div className="space-y-1">
                    {pkg.specialServices.map((service, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">• {service.name}</span>
                        <span className="font-medium text-foreground">₹{service.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Book Button */}
            <div className="flex flex-col gap-2 lg:ml-4">
              <Button
                variant={pkg.popular ? "default" : "outline"}
                onClick={() => onBookService({ ...pkg, petType })}
                className="w-full lg:w-auto whitespace-nowrap"
                iconName="Calendar"
                iconPosition="left"
              >
                Book Now
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full lg:w-auto text-primary hover:text-primary/80"
                iconName="Info"
                iconPosition="left"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      ))}

      {/* Business Hours Note */}
      <div className="bg-muted/50 rounded-lg p-4 mt-6">
        <h5 className="font-semibold text-foreground mb-2 flex items-center gap-2">
          <Icon name="Clock" size={16} />
          Business Hours
        </h5>
        <div className="text-sm text-muted-foreground space-y-1">
          <div>Monday - Friday: 9:30am - 10:00pm</div>
          <div>Sunday: 10:00am - 10:30pm</div>
          <div className="flex items-center gap-2 mt-2">
            <Icon name="Phone" size={14} />
            <span>Contact: 9008003996</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicePackages;