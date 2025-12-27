import React from 'react';
import AppImage from '../../../components/AppImage';

const BoardingPlanCard = ({
  title,
  imageSrc,
  plans = [],
  petType = 'dog',
  onSelectPlan,
}) => {
  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      <div className="p-4 sm:p-6">
        <h3 className="text-2xl font-heading font-bold text-foreground text-center">
          {title}
        </h3>
      </div>

      {/* Image */}
      <div className="px-4 sm:px-6">
        <div className="rounded-xl overflow-hidden border border-muted">
          <AppImage
            src={imageSrc}
            alt={`${petType} boarding representative image`}
            className="w-full h-[220px] sm:h-[260px] object-cover"
            loading="lazy"
          />
        </div>
      </div>

      {/* Plans */}
      <div className="px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {plans.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectPlan?.(p)}
              className="group rounded-xl overflow-hidden border border-border text-left focus:outline-none focus:ring-2 focus:ring-primary"
            
            >
              <div className="px-5 py-4 bg-muted/60">
                <div className="text-lg font-semibold text-foreground">{p.name}</div>
                {p.subtitle && (
                  <div className="text-sm text-muted-foreground">{p.subtitle}</div>
                )}
              </div>
              <div className="px-5 py-4">
                <div className="text-xl font-bold text-primary">₹ {p.price}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BoardingPlanCard;