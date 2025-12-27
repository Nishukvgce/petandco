import React from 'react';
import Icon from '../../../components/AppIcon';

const CheckoutProgress = ({ currentStep = 1, totalSteps = 4 }) => {
  const steps = [
    { id: 1, label: 'Shipping', icon: 'Truck' },
    { id: 2, label: 'Delivery', icon: 'Clock' },
    { id: 3, label: 'Payment', icon: 'CreditCard' },
    { id: 4, label: 'Review', icon: 'CheckCircle' }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        {steps?.map((step, index) => (
          <React.Fragment key={step?.id}>
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-200 ${
                step?.id <= currentStep 
                  ? 'bg-primary border-primary text-primary-foreground' 
                  : 'bg-background border-border text-muted-foreground'
              }`}>
                {step?.id < currentStep ? (
                  <Icon name="Check" size={16} />
                ) : (
                  <Icon name={step?.icon} size={16} />
                )}
              </div>
              <span className={`mt-2 text-xs font-caption font-medium ${
                step?.id <= currentStep ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                {step?.label}
              </span>
            </div>
            {index < steps?.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 ${
                step?.id < currentStep ? 'bg-primary' : 'bg-border'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default CheckoutProgress;