import React from 'react';
import { useLocation } from 'react-router-dom';
import CatFood from './CatFood';
import CatsLanding from './CatsLanding';
import CatTreats from './CatTreats';
import CatToys from './CatToys';
import CatBedding from './CatBedding';
import CatLitter from './CatLitter';
import CatBowls from './CatBowls';
import CatCollars from './CatCollars';
import CatGrooming from './CatGrooming';
import MobileBottomNav from '../../components/ui/MobileBottomNav';

export default function ShopForCatsIndex() {
  const location = useLocation();
  const pathname = (location.pathname || '').replace(/\\/g, '/');
  const q = new URLSearchParams(location.search).get('category') || '';
  const sub = new URLSearchParams(location.search).get('sub') || '';
  const cat = q.toLowerCase();

  // If visiting /cats exactly without query params, show the landing navigation
  if ((pathname === '/cats' || pathname === '/cats/') && !q) {
    return <CatsLanding />;
  }

  // Handle query parameter routing for shop-for-cats
  if (pathname === '/shop-for-cats' && q) {
    let Page = CatFood; // Default fallback

    if (cat.includes('food') || cat === 'cat-food') {
      Page = () => <CatFood initialActive={sub ? decodeURIComponent(sub) : undefined} />;
    } else if (cat.includes('treat') || cat === 'cat-treats') {
      Page = () => <CatTreats initialActive={sub ? decodeURIComponent(sub) : undefined} />;
    } else if (cat.includes('toy') || cat === 'cat-toys') {
      Page = () => <CatToys initialActive={sub ? decodeURIComponent(sub) : undefined} />;
    } else if (cat.includes('bedding') || cat === 'cat-bedding') {
      Page = () => <CatBedding initialActive={sub ? decodeURIComponent(sub) : undefined} />;
    } else if (cat.includes('litter') || cat === 'cat-litter') {
      Page = () => <CatLitter initialActive={sub ? decodeURIComponent(sub) : undefined} />;
    } else if (cat.includes('bowl') || cat === 'cat-bowls') {
      Page = () => <CatBowls initialActive={sub ? decodeURIComponent(sub) : undefined} />;
    } else if (cat.includes('collar') || cat === 'cat-collars') {
      Page = () => <CatCollars initialActive={sub ? decodeURIComponent(sub) : undefined} />;
    } else if (cat.includes('groom') || cat === 'cat-grooming') {
      Page = () => <CatGrooming initialActive={sub ? decodeURIComponent(sub) : undefined} />;
    }

    return (
      <>
        <Page />
        <MobileBottomNav />
      </>
    );
  }

  // For deeper cat routes (/cats/...), delegate to CatFood which handles subcategory query/path
  return <CatFood />;
}
