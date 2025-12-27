import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!email?.trim()) return;

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubscribed(true);
      setIsLoading(false);
      setEmail('');
    }, 1500);
  };

  const benefits = [
    {
      icon: "Gift",
      title: "Exclusive Offers",
      description: "Get 10% off on your first order"
    },
    {
      icon: "Bell",
      title: "Early Access",
      description: "Be first to know about new products"
    },
    {
      icon: "Truck",
      title: "Free Shipping",
      description: "Special shipping deals for subscribers"
    }
  ];

  if (isSubscribed) {
    return (
      <section className="py-16 lg:py-20 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon name="Check" size={32} color="white" />
            </div>
            <h2 className="font-heading font-bold text-3xl text-foreground mb-4">
              Welcome to the Family!
            </h2>
            <p className="font-body text-lg text-muted-foreground mb-6">
              Thank you for subscribing! Check your email for a special welcome offer.
            </p>
            <Button
              variant="outline"
              onClick={() => setIsSubscribed(false)}
            >
              Subscribe Another Email
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 lg:py-20 bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Content */}
            <div className="text-center lg:text-left">
              <h2 className="font-heading font-bold text-3xl lg:text-4xl text-foreground mb-4">
                Join Our Natural Family
              </h2>
              <p className="font-body text-lg text-muted-foreground mb-6">
                Subscribe to our newsletter and get exclusive access to new products, special offers, and traditional recipes straight to your inbox.
              </p>

              {/* Benefits */}
              <div className="space-y-4 mb-8">
                {benefits?.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon name={benefit?.icon} size={20} className="text-primary" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-body font-semibold text-foreground">
                        {benefit?.title}
                      </h4>
                      <p className="font-caption text-sm text-muted-foreground">
                        {benefit?.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Newsletter Form */}
            <div className="bg-card border border-border rounded-2xl p-6 lg:p-8 shadow-warm-lg">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="Mail" size={24} className="text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-xl text-foreground mb-2">
                  Get 10% Off Your First Order
                </h3>
                <p className="font-body text-muted-foreground">
                  Plus exclusive recipes and health tips
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="email"
                  label="Email Address"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e?.target?.value)}
                  required
                  className="mb-4"
                />
                
                <Button
                  type="submit"
                  variant="default"
                  fullWidth
                  loading={isLoading}
                  iconName="ArrowRight"
                  iconPosition="right"
                  disabled={!email?.trim()}
                >
                  {isLoading ? 'Subscribing...' : 'Subscribe & Save 10%'}
                </Button>
              </form>

              <p className="font-caption text-xs text-muted-foreground text-center mt-4">
                By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.
              </p>

              {/* Trust Indicators */}
              <div className="flex items-center justify-center space-x-4 mt-6 pt-6 border-t border-border">
                <div className="flex items-center space-x-1">
                  <Icon name="Shield" size={16} className="text-success" />
                  <span className="font-caption text-xs text-muted-foreground">
                    Secure
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Icon name="Users" size={16} className="text-primary" />
                  <span className="font-caption text-xs text-muted-foreground">
                    5000+ Subscribers
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Icon name="X" size={16} className="text-muted-foreground" />
                  <span className="font-caption text-xs text-muted-foreground">
                    No Spam
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;