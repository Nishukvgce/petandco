import React from 'react';
import Icon from '../../../components/AppIcon';

const TrustSignals = () => {
  const trustFeatures = [
    {
      icon: 'Shield',
      title: 'Secure Checkout',
      description: '256-bit SSL encryption'
    },
    {
      icon: 'Truck',
      title: 'Free Shipping',
      description: 'On orders above ₹499'
    },
    {
      icon: 'RotateCcw',
      title: 'Easy Returns',
      description: '7-day return policy'
    },
    {
      icon: 'Headphones',
      title: '24/7 Support',
      description: 'Customer service available'
    }
  ];

  const securityBadges = [
    {
      name: 'SSL Secured',
      icon: 'Lock',
      color: 'text-success'
    },
    {
      name: 'Payment Protected',
      icon: 'CreditCard',
      color: 'text-primary'
    },
    {
      name: 'Data Safe',
      icon: 'Database',
      color: 'text-accent'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Trust Features */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="font-heading font-semibold text-foreground mb-4">
          Why Shop With Us?
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {trustFeatures?.map((feature, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name={feature?.icon} size={16} className="text-primary" />
              </div>
              <div>
                <h4 className="font-body font-medium text-sm text-foreground">
                  {feature?.title}
                </h4>
                <p className="font-caption text-xs text-muted-foreground">
                  {feature?.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Security Badges */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="font-heading font-semibold text-foreground mb-4">
          Security & Trust
        </h3>
        <div className="flex flex-wrap gap-3">
          {securityBadges?.map((badge, index) => (
            <div
              key={index}
              className="flex items-center space-x-2 bg-muted/50 px-3 py-2 rounded-lg"
            >
              <Icon name={badge?.icon} size={14} className={badge?.color} />
              <span className="font-caption text-xs font-medium text-foreground">
                {badge?.name}
              </span>
            </div>
          ))}
        </div>
      </div>
      {/* Contact Information */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="font-heading font-semibold text-foreground mb-4">
          Need Help?
        </h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <Icon name="Phone" size={16} className="text-primary" />
            <div>
              <p className="font-body font-medium text-sm text-foreground">
                Call Us
              </p>
              <p className="font-data text-xs text-muted-foreground">
                +91 80-4567-8900
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Icon name="MessageCircle" size={16} className="text-success" />
            <div>
              <p className="font-body font-medium text-sm text-foreground">
                WhatsApp
              </p>
              <p className="font-data text-xs text-muted-foreground">
                +91 9845651468
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Icon name="Mail" size={16} className="text-accent" />
            <div>
              <p className="font-body font-medium text-sm text-foreground">
                Email Support
              </p>
              <p className="font-data text-xs text-muted-foreground">
                support@neenusnatural.com
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Return Policy Link */}
      <div className="text-center">
        <a
          href="/return-policy"
          className="font-body text-sm text-primary hover:underline inline-flex items-center space-x-1"
        >
          <Icon name="FileText" size={14} />
          <span>View Return & Refund Policy</span>
        </a>
      </div>
    </div>
  );
};

export default TrustSignals;