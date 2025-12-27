import React from 'react';
import { Link } from 'react-router-dom';

const CatsLanding = () => {
  const col = (title, items) => (
    <div>
      <h4 className="text-sm font-semibold text-foreground mb-2">{title}</h4>
      <ul className="space-y-1 text-sm text-muted-foreground">
        {items.map((t, i) => (
          <li key={i}>
            <Link to={t.path} className="block py-1 hover:text-primary" >{t.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded shadow-sm border border-border p-6">
        <div className="mb-4 text-sm font-medium">PET&amp;CO Spa <span className="ml-3 inline-block bg-[#ff9f43] text-white text-xs px-2 py-0.5 rounded">NEW</span>  PET&amp;CO Outlet <span className="ml-2 inline-block bg-[#ff7a00] text-white text-xs px-2 py-0.5 rounded">60% Off</span></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          {col('TREES, BEDS & SCRATCHERS', [
            { label: 'Beds', path: '/cats/cat-bedding?sub=Beds' },
            { label: 'Mats', path: '/cats/cat-bedding?sub=Mats' },
            { label: 'Tents', path: '/cats/cat-bedding?sub=Tents' },
            { label: 'Blankets & Cushions', path: '/cats/cat-bedding?sub=Blankets%20%26%20Cushions' },
            { label: 'Trees & Scratchers', path: '/cats/cat-bedding?sub=Trees%20%26%20Scratchers' },
            { label: 'Personalised', path: '/cats/cat-bedding?sub=Personalised' },
            { label: 'All Beds & Scratchers', path: '/cats/cat-bedding?sub=All%20Beds%20%26%20Scratchers' }
          ])}

          {col('CAT BOWLS', [
            { label: 'Bowls', path: '/cats/cat-bowls?sub=Bowls' },
            { label: 'Travel & Fountain', path: '/cats/cat-bowls?sub=Travel%20%26%20Fountain' }
          ])}

          {col('CAT COLLARS & ACCESSORIES', [
            { label: 'Collars', path: '/cats/cat-collars?sub=Collars' },
            { label: 'Leash & Harness Set', path: '/cats/cat-collars?sub=Leash%20%26%20Harness%20Set' },
            { label: 'Name Tags', path: '/cats/cat-collars?sub=Name%20Tags' },
            { label: 'Bow Ties & Bandanas', path: '/cats/cat-collars?sub=Bow%20Ties%20%26%20Bandanas' },
            { label: 'All Collars & Accessories', path: '/cats/cat-collars?sub=All%20Collars%20%26%20Accessories' }
          ])}

          {col('CAT GROOMING', [
            { label: 'Brushes & Combs', path: '/cats/cat-grooming?sub=Brushes%20%26%20Combs' },
            { label: 'Dry Bath, Wipes & Perfume', path: '/cats/cat-grooming?sub=Dry%20Bath%2C%20Wipes%20%26%20Perfume' },
            { label: 'Ear, Eye & PawCare', path: '/cats/cat-grooming?sub=Ear%2C%20Eye%20%26%20PawCare' },
            { label: 'Oral Care', path: '/cats/cat-grooming?sub=Oral%20Care' },
            { label: 'Shampoo & Conditioner', path: '/cats/cat-grooming?sub=Shampoo%20%26%20Conditioner' },
            { label: 'Tick & Flea Control', path: '/cats/cat-grooming?sub=Tick%20%26%20Flea%20Control' },
            { label: 'All Grooming', path: '/cats/cat-grooming?sub=All%20Grooming' }
          ])}

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">PET LOVERS</h4>
            <div>
              <Link to="/gift-cards" className="inline-block bg-[#ff7a00] text-white px-3 py-2 rounded text-sm font-semibold">GIFT CARDS</Link>
            </div>
          </div>

          <div />
        </div>
      </div>
    </div>
  );
};

export default CatsLanding;
