import React from 'react';
import { Link } from 'react-router-dom';

const winterCollection = [
  {
    name: 'Sweaters',
    src: '/assets/images/essential/sweaters.png',
  },
  {
    name: 'Sweatshirts',
    src: '/assets/images/essential/Sweatshirts.png',
  },
  
  {
    name: 'Beds & Mats',
    src: '/assets/images/essential/Beds_Mats.png',
  },
  {
    name: 'Blankets',
    src: '/assets/images/essential/blankets.png',
  },
];

const WinterCollection = () => {
  const toPath = (name) => {
    switch (name) {
      case 'Sweaters':
        return '/shop-for-dogs?category=dog-clothing&sub=Sweaters';
      case 'Sweatshirts':
        return '/shop-for-dogs?category=dog-clothing&sub=Sweatshirts';
      case 'Beds & Mats':
        // Route to Beds within Dog Bedding; page supports active sub via ?sub=
        return '/shop-for-dogs?category=dog-bedding&sub=Beds';
      case 'Blankets':
        return '/shop-for-dogs?category=dog-bedding&sub=Blankets%20%26%20Cushions';
      default:
        return '/shop-for-dogs';
    }
  };
  return (
    <section className="winter-collection-section my-4">
      <div className="container mx-auto px-4">
        <h2 className="text-center font-heading text-2xl font-bold mb-4">Making Winter'25 Magical</h2>
        <p className="text-center text-lg mb-6">Our latest collection for our favourite season!</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {winterCollection.map((item) => (
            <div key={item.name} className="relative rounded-2xl overflow-hidden">
              <Link to={toPath(item.name)} className="block">
                <div className="w-full aspect-square">
                  <img src={item.src} alt={item.name} className="w-full h-full object-cover block" />
                </div>
                <p className="text-center mt-2 font-medium">{item.name}</p>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WinterCollection;