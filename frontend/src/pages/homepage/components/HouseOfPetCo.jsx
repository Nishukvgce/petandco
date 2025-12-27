import React from 'react';
import { Link } from 'react-router-dom';

const items = [
  { src: '/assets/images/essential/Meowsi_.png', label: 'Meowsi' },
  { src: '/assets/images/essential/hearty.png', label: 'Hearty' },
  { src: '/assets/images/essential/Sara.png', label: "Sara's" },
  { src: '/assets/images/essential/dash dog.png', label: 'Dash Dog' }
];

const HouseOfPetCo = () => {
  const toSlug = (s='') => s.toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
  const brandType = {
    'meowsi': 'cat',
    'hearty': 'dog',
    "sara-s": 'dog',
    'sara': 'dog',
    'dash-dog': 'dog'
  };
  return (
    <section className="py-10 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="font-heading text-3xl lg:text-4xl font-bold text-foreground mb-3">From the House of PET&CO</h2>
        <p className="text-lg text-muted-foreground mb-6">Crafted with love, backed by science</p>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
          {items.map((it) => {
            const slug = toSlug(it.label);
            const type = brandType[slug] || 'dog';
            const to = type === 'cat'
              ? `/shop-for-cats?category=cat-food&brand=${encodeURIComponent(it.label)}`
              : `/shop-for-dogs?category=dogfood&brand=${encodeURIComponent(it.label)}`;
            return (
              <div key={it.label} className="text-center">
                <Link to={to} className="block rounded-2xl overflow-hidden bg-white shadow-sm">
                  <div className="w-full aspect-square">
                    <img
                      src={it.src}
                      alt={it.label}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/assets/images/no_image.png'; }}
                    />
                  </div>
                </Link>
                <div className="mt-3 text-base font-semibold text-foreground">{it.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HouseOfPetCo;
