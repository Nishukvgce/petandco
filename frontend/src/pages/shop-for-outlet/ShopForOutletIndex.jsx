import React from 'react';
import { useLocation } from 'react-router-dom';
import OutletMainLanding from './OutletMainLanding';
import OutletFoodTreats from './OutletFoodTreats';
import OutletToys from './OutletToys';
import OutletGrooming from './OutletGrooming';
import OutletWalkingEssentials from './OutletWalkingEssentials';
import OutletFeedingEssentials from './OutletFeedingEssentials';
import OutletBedsComfort from './OutletBedsComfort';
import OutletTravelSafety from './OutletTravelSafety';
import OutletAccessories from './OutletAccessories';
import OutletLitterToilet from './OutletLitterToilet';
import OutletTrainingHygiene from './OutletTrainingHygiene';

export default function ShopForOutletIndex() {
  const location = useLocation();
  const q = new URLSearchParams(location.search).get('category') || '';
  const sub = new URLSearchParams(location.search).get('sub') || '';
  const cat = q.toLowerCase();

  // If no category is specified, show the main outlet landing page
  if (!cat) {
    return <OutletMainLanding />;
  }

  let Page = OutletFoodTreats; // Default fallback

  if (cat === 'food-treats' || cat.includes('food') || cat.includes('treat')) {
    Page = OutletFoodTreats;
  } else if (cat.includes('toy')) {
    Page = () => <OutletToys initialActive={sub ? decodeURIComponent(sub) : undefined} />;
  } else if (cat.includes('groom')) {
    Page = () => <OutletGrooming initialActive={sub ? decodeURIComponent(sub) : undefined} />;
  } else if (cat.includes('walk')) {
    Page = () => <OutletWalkingEssentials initialActive={sub ? decodeURIComponent(sub) : undefined} />;
  } else if (cat.includes('feed')) {
    Page = () => <OutletFeedingEssentials initialActive={sub ? decodeURIComponent(sub) : undefined} />;
  } else if (cat.includes('bed') || cat.includes('comfort')) {
    Page = () => <OutletBedsComfort initialActive={sub ? decodeURIComponent(sub) : undefined} />;
  } else if (cat.includes('travel') || cat.includes('safety')) {
    Page = () => <OutletTravelSafety initialActive={sub ? decodeURIComponent(sub) : undefined} />;
  } else if (cat.includes('accessor')) {
    Page = () => <OutletAccessories initialActive={sub ? decodeURIComponent(sub) : undefined} />;
  } else if (cat.includes('litter') || cat.includes('toilet')) {
    Page = () => <OutletLitterToilet initialActive={sub ? decodeURIComponent(sub) : undefined} />;
  } else if (cat.includes('training') || cat.includes('hygiene')) {
    Page = () => <OutletTrainingHygiene initialActive={sub ? decodeURIComponent(sub) : undefined} />;
  }

  return <Page />;
}