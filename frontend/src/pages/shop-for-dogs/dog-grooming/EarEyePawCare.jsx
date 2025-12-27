import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../../components/ui/Header';
import { useCart } from '../../../contexts/CartContext';

const sampleProducts = [
  { id: 'e1', name: 'Ear & Eye Care Drops', image: '/assets/images/grooming/ear-eye-product.webp', badges: [], variants: ['10 ml'], price: 199 }
];

const ProductCard = ({ p }) => (
  <article className="bg-white rounded-lg border border-border overflow-hidden shadow-sm">
    <div className="p-2 md:p-3">
      <div className="mt-2 h-36 md:h-44 flex items-center justify-center bg-[#f6f8fb] rounded">
        <img src={p.image} alt={p.name} className="max-h-32 md:max-h-40 object-contain" />
      </div>
      <h3 className="mt-2 text-xs md:text-sm font-semibold text-foreground">{p.name}</h3>
      <div className="mt-3 flex items-center justify-between">
        <div className="text-base md:text-lg font-bold">₹{p.price.toFixed(2)}</div>
        <button className="bg-orange-500 text-white px-3 py-1.5 rounded-full text-sm">Add</button>
      </div>
    </div>
  </article>
);

export default function EarEyePawCare() {
  const { getCartItemCount, cartItems } = useCart();
  return (
    <>
      <Helmet>
        <title>Ear, Eye & PawCare — Grooming | PET&CO</title>
      </Helmet>
      <Header cartItemCount={getCartItemCount()} cartItems={cartItems} onSearch={() => {}} />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-4">Ear, Eye & Paw Care</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {sampleProducts.map(p => <ProductCard key={p.id} p={p} />)}
        </div>
      </div>
    </>
  );
}
