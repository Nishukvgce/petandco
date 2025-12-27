import React from 'react';

const filenames = [
  'toys.png',
  'travel supplies.png',
  'treat food.png',
  'walk essentials.png',
  'wellness.png',
  'Beds.png',
  'Bowls.png',
  'cat food.png',
  'clothing.png',
  'dog food.png',
  'food supplements.png',
  'fresh food.png',
  'grooming.png',
  'litter suppliers.png',
  'premium food.png',
  'prescription diet.png'
];

// labels intentionally removed — this component now renders images only

const Essential = () => {
  return (
    <section className="essential-section my-4">
      {/* add bottom padding so content at the end of this section isn't hidden behind
          any fixed/sticky bottom bars (mobile nav, etc) */}
      <div className="container mx-auto px-4 pb-24 md:pb-12">
        {/* Title (optional) */}
        <h2 className="text-center font-heading text-2xl font-bold mb-4">Everyday essentials</h2>

  {/* mobile: 4x4 grid; md+: 2x8 grid. 10px gap, no per-tile padding so images appear larger */}
  <div className="grid grid-cols-4 grid-rows-4 gap-x-[10px] gap-y-4 md:grid-cols-8 md:grid-rows-2 md:gap-y-6">
          {filenames.map((name) => {
            const src = `/assets/images/essential/${encodeURIComponent(name)}`;
            return (
              <div key={name} className="w-full rounded-2xl overflow-hidden">
                <div className="w-full aspect-square">
                  <img src={src} alt="" className="w-full h-full object-cover block" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Essential;
