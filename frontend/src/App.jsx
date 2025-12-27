import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import ErrorBoundary from './components/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';

// Import your page components
import Homepage from './pages/homepage';
import ProductDetailPage from './pages/product-detail-page';
import ProductFullPage from './pages/product-full';
import DogFood from './pages/shop-for-dogs/DogFood';
import DogGrooming from './pages/shop-for-dogs/dog-grooming/DogGrooming';
import BrushesAndCombs from './pages/shop-for-dogs/dog-grooming/BrushesAndCombs';
import DryBathWipesPerfume from './pages/shop-for-dogs/dog-grooming/DryBathWipesPerfume';
import EarEyePawCare from './pages/shop-for-dogs/dog-grooming/EarEyePawCare';
import OralCare from './pages/shop-for-dogs/dog-grooming/OralCare';
import ShampooConditioner from './pages/shop-for-dogs/dog-grooming/ShampooConditioner';
import TickFleaControl from './pages/shop-for-dogs/dog-grooming/TickFleaControl';
import ShoppingCart from './pages/shopping-cart';
import CheckoutProcess from './pages/checkout-process';
import UserAuth from './pages/user-auth';
import UserAccountDashboard from './pages/user-account-dashboard';
import AdminLogin from './pages/admin-login';
import AdminPanel from './pages/admin-panel';
import AdminDashboard from './pages/admin-dashboard';
import NotFound from './pages/NotFound';
import DogTreats from './pages/shop-for-dogs/DogTreats';
import DogToys from './pages/shop-for-dogs/DogToys';
import WalkEssentials from './pages/shop-for-dogs/WalkEssentials';
import DogBedding from './pages/shop-for-dogs/DogBedding';
import DogClothing from './pages/shop-for-dogs/DogClothing';
import DogBowlsDiners from './pages/shop-for-dogs/DogBowlsDiners';
import DogHealthHygiene from './pages/shop-for-dogs/DogHealthHygiene';
import DogTravelSupplies from './pages/shop-for-dogs/DogTravelSupplies';
import DogTrainingEssentials from './pages/shop-for-dogs/DogTrainingEssentials';
import ShopForDogsIndex from './pages/shop-for-dogs/ShopForDogsIndex';
import CatFood from './pages/shop-for-cats/CatFood';
import ShopForCatsIndex from './pages/shop-for-cats/ShopForCatsIndex';
import CatTreats from './pages/shop-for-cats/CatTreats';
import CatToys from './pages/shop-for-cats/CatToys';
import CatBedding from './pages/shop-for-cats/CatBedding';
import CatLitter from './pages/shop-for-cats/CatLitter';
import CatBowls from './pages/shop-for-cats/CatBowls';
import CatCollars from './pages/shop-for-cats/CatCollars';
import CatGrooming from './pages/shop-for-cats/CatGrooming';
import DogPharmacyPage from './pages/pharmacy/dogs';
import CatPharmacyPage from './pages/pharmacy/cats';
import PharmacyCollectionPage from './pages/pharmacy/PharmacyCollectionPage';
import PetServicesPage from './pages/pet-services';
import ComingSoon from './pages/ComingSoon';
import PetBoardingPage from './pages/pet-services/PetBoarding';
import PetWalkingPage from './pages/pet-services/PetWalking';
import PetCoOutletPage from './pages/pet-services/PetCoOutlet';
import BrandCollection from './pages/brands/BrandCollection';

// Outlet components
import ShopForOutletIndex from './pages/shop-for-outlet/ShopForOutletIndex';
import OutletFoodTreats from './pages/shop-for-outlet/OutletFoodTreats';
import OutletToys from './pages/shop-for-outlet/OutletToys';
import OutletGrooming from './pages/shop-for-outlet/OutletGrooming';
import OutletWalkingEssentials from './pages/shop-for-outlet/OutletWalkingEssentials';
import OutletFeedingEssentials from './pages/shop-for-outlet/OutletFeedingEssentials';
import OutletBedsComfort from './pages/shop-for-outlet/OutletBedsComfort';
import OutletTravelSafety from './pages/shop-for-outlet/OutletTravelSafety';
import OutletAccessories from './pages/shop-for-outlet/OutletAccessories';
import OutletLitterToilet from './pages/shop-for-outlet/OutletLitterToilet';
import OutletTrainingHygiene from './pages/shop-for-outlet/OutletTrainingHygiene';

// Pharmacy subpages - Dogs
import MedicinesForSkin from './pages/pharmacy/dogs/medicines-for-skin';
import JointAndMobility from './pages/pharmacy/dogs/joint-and-mobility';
import DigestiveCare from './pages/pharmacy/dogs/digestive-care';
import AllDogPharmacy from './pages/pharmacy/dogs/all-dog-pharmacy';

// Pharmacy subpages - Cats
import SkinCoatCare from './pages/pharmacy/cats/skin-coat-care';
import Worming from './pages/pharmacy/cats/worming';
import OralCareCat from './pages/pharmacy/cats/oral-care';
import AllCatPharmacy from './pages/pharmacy/cats/all-cat-pharmacy';

// Medicines
import Antibiotics from './pages/pharmacy/medicines/antibiotics';
import Antifungals from './pages/pharmacy/medicines/antifungals';
import AntiInflammatories from './pages/pharmacy/medicines/anti-inflammatories';
import PainRelief from './pages/pharmacy/medicines/pain-relief';
import AllMedicines from './pages/pharmacy/medicines/all-medicines';

// Supplements
import VitaminsMinerals from './pages/pharmacy/supplements/vitamins-minerals';
import JointSupplements from './pages/pharmacy/supplements/joint-supplements';
import ProbioticsGutHealth from './pages/pharmacy/supplements/probiotics-gut-health';
import SkinCoatSupplements from './pages/pharmacy/supplements/skin-coat-supplements';
import AllSupplements from './pages/pharmacy/supplements/all-supplements';

// Prescription food
import RenalSupport from './pages/pharmacy/prescription-food/renal-support';
import HypoallergenicDiets from './pages/pharmacy/prescription-food/hypoallergenic-diets';
import DigestiveSupport from './pages/pharmacy/prescription-food/digestive-support';
import WeightManagement from './pages/pharmacy/prescription-food/weight-management';
import AllPrescriptionFood from './pages/pharmacy/prescription-food/all-prescription-food';

// Protected Route Component
const ProtectedAdminRoute = ({ children }) => {
  const adminUser = JSON.parse(localStorage.getItem('adminUser') || 'null');
  const sessionData = localStorage.getItem('neenu_auth_session');
  
  let isValidAdmin = false;
  
  // Trust backend-issued admin role persisted at login
  if (adminUser && (adminUser.role || '').toLowerCase() === 'admin') {
    isValidAdmin = true;
  } else if (sessionData) {
    try {
      const session = JSON.parse(sessionData);
      // Minimal fallback; main trust is adminUser role
      isValidAdmin = !!session?.userId;
    } catch (error) {
      console.error('Invalid session data:', error);
    }
  }
  
  if (!isValidAdmin) {
    localStorage.removeItem('adminUser');
    localStorage.removeItem('neenu_auth_session');
    return <Navigate to="/admin-login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <div className="App">
            <ErrorBoundary>
              <ScrollToTop />
              <Routes>
                <Route path="/" element={<Homepage />} />
                <Route path="/homepage" element={<Homepage />} />
                
                {/* Pet Services */}
                <Route path="/pet-services" element={<PetServicesPage />} />
                <Route path="/pet-boarding" element={<PetBoardingPage />} />
                <Route path="/pet-walking" element={<PetWalkingPage />} />
                <Route path="/petco-outlet" element={<PetCoOutletPage />} />
                {/* Shop by brand */}
                <Route path="/brand/:brandSlug" element={<BrandCollection />} />
                <Route path="/brands/:brandSlug" element={<BrandCollection />} />
                
                {/* Product collection route: choose collection based on query param (walk-essentials, dogfood, dogtreats, etc.) */}
                <Route path="/shop-for-dogs" element={<ShopForDogsIndex />} />
                <Route path="/shop-for-dogs/dog-grooming" element={<DogGrooming />} />
                <Route path="/shop-for-dogs/dog-grooming/brushes-combs" element={<BrushesAndCombs />} />
                <Route path="/shop-for-dogs/dog-grooming/dry-bath-wipes-perfume" element={<DryBathWipesPerfume />} />
                <Route path="/shop-for-dogs/dog-grooming/ear-eye-pawcare" element={<EarEyePawCare />} />
                <Route path="/shop-for-dogs/dog-grooming/oral-care" element={<OralCare />} />
                <Route path="/shop-for-dogs/dog-grooming/shampoo-conditioner" element={<ShampooConditioner />} />
                <Route path="/shop-for-dogs/dog-grooming/tick-flea-control" element={<TickFleaControl />} />
                {/* dog treats */}
                <Route path="/shop-for-dogs/dogtreats" element={<DogTreats />} />
                {/* dog toys */}
                <Route path="/shop-for-dogs/dog-toys" element={<DogToys />} />
                <Route path="/shop-for-dogs/dog-toys/all-dog-toys" element={<DogToys initialActive="All Dog Toys" />} />
                <Route path="/shop-for-dogs/dog-toys/balls" element={<DogToys initialActive="Balls" />} />
                <Route path="/shop-for-dogs/dog-toys/chew-toys" element={<DogToys initialActive="Chew Toys" />} />
                <Route path="/shop-for-dogs/dog-toys/crinkle-toys" element={<DogToys initialActive="Crinkle Toys" />} />
                <Route path="/shop-for-dogs/dog-toys/fetch-toys" element={<DogToys initialActive="Fetch Toys" />} />
                <Route path="/shop-for-dogs/dog-toys/interactive-toys" element={<DogToys initialActive="Interactive Toys" />} />
                <Route path="/shop-for-dogs/dog-toys/plush-toys" element={<DogToys initialActive="Plush Toys" />} />
                <Route path="/shop-for-dogs/dog-toys/rope-toys" element={<DogToys initialActive="Rope Toys" />} />
                <Route path="/shop-for-dogs/dog-toys/squeaker-toys" element={<DogToys initialActive="Squeaker Toys" />} />
                {/* Walk Essentials - direct route (no index wrapper) */}
                <Route path="/shop-for-dogs/walk-essentials" element={<WalkEssentials />} />
                <Route path="/shop-for-dogs/walk-essentials/all-walk-essentials" element={<WalkEssentials initialActive="All Walk Essentials" />} />
                <Route path="/shop-for-dogs/walk-essentials/collar" element={<WalkEssentials initialActive="Collar" />} />
                <Route path="/shop-for-dogs/walk-essentials/leash" element={<WalkEssentials initialActive="Leash" />} />
                <Route path="/shop-for-dogs/walk-essentials/harness" element={<WalkEssentials initialActive="Harness" />} />
                <Route path="/shop-for-dogs/walk-essentials/name-tags" element={<WalkEssentials initialActive="Name Tags" />} />
                <Route path="/shop-for-dogs/walk-essentials/personalised" element={<WalkEssentials initialActive="Personalised" />} />
                <Route path="/shop-for-dogs/dogtreats/all-dog-treats" element={<DogTreats initialActive="All Dog Treats" />} />
                <Route path="/shop-for-dogs/dogtreats/biscuits-snacks" element={<DogTreats initialActive="Biscuits & Snacks" />} />
                <Route path="/shop-for-dogs/dogtreats/soft-chewy" element={<DogTreats initialActive="Soft & Chewy" />} />
                <Route path="/shop-for-dogs/dogtreats/natural-treats" element={<DogTreats initialActive="Natural Treats" />} />
                <Route path="/shop-for-dogs/dogtreats/puppy-treats" element={<DogTreats initialActive="Puppy Treats" />} />
                <Route path="/shop-for-dogs/dogtreats/vegetarian-treats" element={<DogTreats initialActive="Vegetarian Treats" />} />
                <Route path="/shop-for-dogs/dogtreats/dental-chew" element={<DogTreats initialActive="Dental Chew" />} />
                <Route path="/shop-for-dogs/dogtreats/grain-free-treat" element={<DogTreats initialActive="Grain Free Treat" />} />
                {/* dogfood sub-pages (render DogFood with a preselected active category) */}
                <Route path="/shop-for-dogs/dogfood/all-dog-food" element={<DogFood initialActive="All Dog Food" />} />
                {/* dog clothing & accessories */}
                <Route path="/shop-for-dogs/dog-clothing" element={<DogClothing />} />
                <Route path="/shop-for-dogs/dog-clothing/all-dog-clothing" element={<DogClothing initialActive="All Dog Clothing" />} />
                <Route path="/shop-for-dogs/dog-clothing/festive-special" element={<DogClothing initialActive="Festive Special" />} />
                <Route path="/shop-for-dogs/dog-clothing/t-shirts-dresses" element={<DogClothing initialActive="T-Shirts & Dresses" />} />
                <Route path="/shop-for-dogs/dog-clothing/sweatshirts" element={<DogClothing initialActive="Sweatshirts" />} />
                <Route path="/shop-for-dogs/dog-clothing/sweaters" element={<DogClothing initialActive="Sweaters" />} />
                <Route path="/shop-for-dogs/dog-clothing/bow-ties-bandanas" element={<DogClothing initialActive="Bow Ties & Bandanas" />} />
                <Route path="/shop-for-dogs/dog-clothing/raincoats" element={<DogClothing initialActive="Raincoats" />} />
                <Route path="/shop-for-dogs/dog-clothing/shoes-socks" element={<DogClothing initialActive="Shoes & Socks" />} />
                <Route path="/shop-for-dogs/dog-clothing/jackets" element={<DogClothing initialActive="Jackets" />} />
                <Route path="/shop-for-dogs/dog-clothing/personalised" element={<DogClothing initialActive="Personalised" />} />
                {/* dog bedding */}
                <Route path="/shop-for-dogs/dog-bedding" element={<DogBedding />} />
                <Route path="/shop-for-dogs/dog-bedding/all-dog-bedding" element={<DogBedding initialActive="All Dog Bedding" />} />
                <Route path="/shop-for-dogs/dog-bedding/beds" element={<DogBedding initialActive="Beds" />} />
                <Route path="/shop-for-dogs/dog-bedding/blankets-cushions" element={<DogBedding initialActive="Blankets & Cushions" />} />
                <Route path="/shop-for-dogs/dog-bedding/mats" element={<DogBedding initialActive="Mats" />} />
                <Route path="/shop-for-dogs/dog-bedding/personalised-bedding" element={<DogBedding initialActive="Personalised Bedding" />} />
                <Route path="/shop-for-dogs/dog-bedding/tents" element={<DogBedding initialActive="Tents" />} />
                {/* dog health & hygiene */}
                <Route path="/shop-for-dogs/dog-health-hygiene" element={<DogHealthHygiene />} />
                <Route path="/shop-for-dogs/dog-health-hygiene/all-dog-health-hygiene" element={<DogHealthHygiene initialActive="All Dog Health & Hygiene" />} />
                <Route path="/shop-for-dogs/dog-health-hygiene/oral-care" element={<DogHealthHygiene initialActive="Oral Care" />} />
                <Route path="/shop-for-dogs/dog-health-hygiene/supplements" element={<DogHealthHygiene initialActive="Supplements" />} />
                <Route path="/shop-for-dogs/dog-health-hygiene/tick-flea-control" element={<DogHealthHygiene initialActive="Tick & Flea Control" />} />
                {/* Pharmacy landing pages */}
                <Route path="/pharmacy" element={<PharmacyCollectionPage />} />
                <Route path="/pharmacy/dogs" element={<DogPharmacyPage />} />
                <Route path="/pharmacy/cats" element={<CatPharmacyPage />} />

                {/* Pharmacy subpages: dogs */}
                <Route path="/pharmacy/dogs/medicines-for-skin" element={<MedicinesForSkin />} />
                <Route path="/pharmacy/dogs/joint-mobility" element={<JointAndMobility />} />
                <Route path="/pharmacy/dogs/digestive-care" element={<DigestiveCare />} />
                <Route path="/pharmacy/dogs/all-dog-pharmacy" element={<AllDogPharmacy />} />

                {/* Pharmacy subpages: cats */}
                <Route path="/pharmacy/cats/skin-coat-care" element={<SkinCoatCare />} />
                <Route path="/pharmacy/cats/worming" element={<Worming />} />
                <Route path="/pharmacy/cats/oral-care" element={<OralCareCat />} />
                <Route path="/pharmacy/cats/all-cat-pharmacy" element={<AllCatPharmacy />} />

                {/* Medicines */}
                <Route path="/pharmacy/medicines/antibiotics" element={<Antibiotics />} />
                <Route path="/pharmacy/medicines/antifungals" element={<Antifungals />} />
                <Route path="/pharmacy/medicines/anti-inflammatories" element={<AntiInflammatories />} />
                <Route path="/pharmacy/medicines/pain-relief" element={<PainRelief />} />
                <Route path="/pharmacy/medicines/all-medicines" element={<AllMedicines />} />

                {/* Supplements */}
                <Route path="/pharmacy/supplements/vitamins-minerals" element={<VitaminsMinerals />} />
                <Route path="/pharmacy/supplements/joint-supplements" element={<JointSupplements />} />
                <Route path="/pharmacy/supplements/probiotics-gut-health" element={<ProbioticsGutHealth />} />
                <Route path="/pharmacy/supplements/skin-coat-supplements" element={<SkinCoatSupplements />} />
                <Route path="/pharmacy/supplements/all-supplements" element={<AllSupplements />} />

                {/* Prescription Food */}
                <Route path="/pharmacy/prescription-food/renal-support" element={<RenalSupport />} />
                <Route path="/pharmacy/prescription-food/hypoallergenic-diets" element={<HypoallergenicDiets />} />
                <Route path="/pharmacy/prescription-food/digestive-support" element={<DigestiveSupport />} />
                <Route path="/pharmacy/prescription-food/weight-management" element={<WeightManagement />} />
                <Route path="/pharmacy/prescription-food/all-prescription-food" element={<AllPrescriptionFood />} />
                {/* dog travel supplies */}
                <Route path="/shop-for-dogs/dog-travel-supplies" element={<DogTravelSupplies />} />
                <Route path="/shop-for-dogs/dog-travel-supplies/all-travel-supplies" element={<DogTravelSupplies initialActive="All Travel Supplies" />} />
                <Route path="/shop-for-dogs/dog-travel-supplies/carriers" element={<DogTravelSupplies initialActive="Carriers" />} />
                <Route path="/shop-for-dogs/dog-travel-supplies/travel-bowls" element={<DogTravelSupplies initialActive="Travel Bowls" />} />
                <Route path="/shop-for-dogs/dog-travel-supplies/travel-beds" element={<DogTravelSupplies initialActive="Travel Beds" />} />
                <Route path="/shop-for-dogs/dog-travel-supplies/water-bottles" element={<DogTravelSupplies initialActive="Water Bottles" />} />
                {/* dog bowls & diners */}
                <Route path="/shop-for-dogs/dog-bowls-diners" element={<DogBowlsDiners />} />
                <Route path="/shop-for-dogs/dog-bowls-diners/all-dog-bowls-diners" element={<DogBowlsDiners initialActive="All Dog Bowls & Diners" />} />
                <Route path="/shop-for-dogs/dog-bowls-diners/bowls" element={<DogBowlsDiners initialActive="Bowls" />} />
                <Route path="/shop-for-dogs/dog-bowls-diners/diners" element={<DogBowlsDiners initialActive="Diners" />} />
                <Route path="/shop-for-dogs/dog-bowls-diners/anti-spill-mats" element={<DogBowlsDiners initialActive="Anti Spill Mats" />} />
                <Route path="/shop-for-dogs/dog-bowls-diners/travel-fountain" element={<DogBowlsDiners initialActive="Travel & Fountain" />} />
                {/* dog training essentials */}
                <Route path="/shop-for-dogs/dog-training-essentials" element={<DogTrainingEssentials />} />
                <Route path="/shop-for-dogs/dog-training-essentials/all-training-essentials" element={<DogTrainingEssentials initialActive="All Training Essentials" />} />
                <Route path="/shop-for-dogs/dog-training-essentials/agility" element={<DogTrainingEssentials initialActive="Agility" />} />
                <Route path="/shop-for-dogs/dog-training-essentials/stain-odour" element={<DogTrainingEssentials initialActive="Stain & Odour" />} />
                <Route path="/shop-for-dogs/dogfood/dry-food" element={<DogFood initialActive="Dry Food" />} />
                <Route path="/shop-for-dogs/dogfood/wet-food" element={<DogFood initialActive="Wet Food" />} />
                <Route path="/shop-for-dogs/dogfood/grain-free" element={<DogFood initialActive="Grain Free" />} />
                <Route path="/shop-for-dogs/dogfood/puppy-food" element={<DogFood initialActive="Puppy Food" />} />
                <Route path="/shop-for-dogs/dogfood/hypoallergenic" element={<DogFood initialActive="Hypoallergenic" />} />
                <Route path="/shop-for-dogs/dogfood/veterinary-food" element={<DogFood initialActive="Veterinary Food" />} />
                <Route path="/shop-for-dogs/dogfood/food-toppers-and-gravy" element={<DogFood initialActive="Food Toppers & Gravy" />} />
                <Route path="/shop-for-dogs/dogfood/daily-meals" element={<DogFood initialActive="Daily Meals" />} />
                {/* Cats: route now handled by ShopForCatsIndex */}
                <Route path="/cats" element={<ShopForCatsIndex />} />
                <Route path="/cats/:category" element={<ShopForCatsIndex />} />
                {/* Shop for cats pages (mirrors dogs structure) */}
                <Route path="/shop-for-cats" element={<ShopForCatsIndex />} />
                
                {/* Shop for cats specific routes */}
                <Route path="/shop-for-cats/cat-food" element={<CatFood />} />
                <Route path="/shop-for-cats/cat-food/all-cat-food" element={<CatFood initialActive="All Cat Food" />} />
                <Route path="/shop-for-cats/cat-food/dry-food" element={<CatFood initialActive="Dry Food" />} />
                <Route path="/shop-for-cats/cat-food/wet-food" element={<CatFood initialActive="Wet Food" />} />
                <Route path="/shop-for-cats/cat-food/grain-free" element={<CatFood initialActive="Grain Free" />} />
                <Route path="/shop-for-cats/cat-food/kitten-food" element={<CatFood initialActive="Kitten Food" />} />
                <Route path="/shop-for-cats/cat-food/hypoallergenic" element={<CatFood initialActive="Hypoallergenic" />} />
                <Route path="/shop-for-cats/cat-food/veterinary-food" element={<CatFood initialActive="Veterinary Food" />} />
                <Route path="/shop-for-cats/cat-food/supplements" element={<CatFood initialActive="Supplements" />} />
                
                <Route path="/shop-for-cats/cat-treats" element={<CatTreats />} />
                <Route path="/shop-for-cats/cat-treats/all-cat-treats" element={<CatTreats initialActive="All Cat Treats" />} />
                <Route path="/shop-for-cats/cat-treats/crunchy-treats" element={<CatTreats initialActive="Crunchy Treats" />} />
                <Route path="/shop-for-cats/cat-treats/creamy-treats" element={<CatTreats initialActive="Creamy Treats" />} />
                <Route path="/shop-for-cats/cat-treats/grain-free-treats" element={<CatTreats initialActive="Grain Free Treats" />} />
                <Route path="/shop-for-cats/cat-treats/chew-treats" element={<CatTreats initialActive="Chew Treats" />} />
                <Route path="/shop-for-cats/cat-treats/soft-chewy" element={<CatTreats initialActive="Soft & Chewy" />} />
                
                <Route path="/shop-for-cats/cat-toys" element={<CatToys />} />
                <Route path="/shop-for-cats/cat-toys/all-cat-toys" element={<CatToys initialActive="All Cat Toys" />} />
                <Route path="/shop-for-cats/cat-toys/catnip-toys" element={<CatToys initialActive="Catnip Toys" />} />
                <Route path="/shop-for-cats/cat-toys/interactive-toys" element={<CatToys initialActive="Interactive Toys" />} />
                <Route path="/shop-for-cats/cat-toys/plush-toys" element={<CatToys initialActive="Plush Toys" />} />
                <Route path="/shop-for-cats/cat-toys/teaser-wands" element={<CatToys initialActive="Teaser & Wands" />} />
                <Route path="/shop-for-cats/cat-toys/all-toys" element={<CatToys initialActive="All Toys" />} />
                
                <Route path="/shop-for-cats/cat-bedding" element={<CatBedding />} />
                <Route path="/shop-for-cats/cat-bedding/all-beds-scratchers" element={<CatBedding initialActive="All Beds & Scratchers" />} />
                <Route path="/shop-for-cats/cat-bedding/beds" element={<CatBedding initialActive="Beds" />} />
                <Route path="/shop-for-cats/cat-bedding/mats" element={<CatBedding initialActive="Mats" />} />
                <Route path="/shop-for-cats/cat-bedding/tents" element={<CatBedding initialActive="Tents" />} />
                <Route path="/shop-for-cats/cat-bedding/blankets-cushions" element={<CatBedding initialActive="Blankets & Cushions" />} />
                <Route path="/shop-for-cats/cat-bedding/trees-scratchers" element={<CatBedding initialActive="Trees & Scratchers" />} />
                <Route path="/shop-for-cats/cat-bedding/personalised" element={<CatBedding initialActive="Personalised" />} />
                
                <Route path="/shop-for-cats/cat-litter" element={<CatLitter />} />
                <Route path="/shop-for-cats/cat-litter/all-litter-supplies" element={<CatLitter initialActive="All Litter & Supplies" />} />
                <Route path="/shop-for-cats/cat-litter/litter" element={<CatLitter initialActive="Litter" />} />
                <Route path="/shop-for-cats/cat-litter/litter-trays" element={<CatLitter initialActive="Litter Trays" />} />
                <Route path="/shop-for-cats/cat-litter/scooper" element={<CatLitter initialActive="Scooper" />} />
                <Route path="/shop-for-cats/cat-litter/stain-odour" element={<CatLitter initialActive="Stain & Odour" />} />
                
                <Route path="/shop-for-cats/cat-bowls" element={<CatBowls />} />
                <Route path="/shop-for-cats/cat-bowls/all-cat-bowls" element={<CatBowls initialActive="All Cat Bowls" />} />
                <Route path="/shop-for-cats/cat-bowls/bowls" element={<CatBowls initialActive="Bowls" />} />
                <Route path="/shop-for-cats/cat-bowls/travel-fountain" element={<CatBowls initialActive="Travel & Fountain" />} />
                
                <Route path="/shop-for-cats/cat-collars" element={<CatCollars />} />
                <Route path="/shop-for-cats/cat-collars/all-collars-accessories" element={<CatCollars initialActive="All Collars & Accessories" />} />
                <Route path="/shop-for-cats/cat-collars/collars" element={<CatCollars initialActive="Collars" />} />
                <Route path="/shop-for-cats/cat-collars/leash-harness" element={<CatCollars initialActive="Leash & Harness Set" />} />
                <Route path="/shop-for-cats/cat-collars/name-tags" element={<CatCollars initialActive="Name Tags" />} />
                <Route path="/shop-for-cats/cat-collars/bow-ties-bandanas" element={<CatCollars initialActive="Bow Ties & Bandanas" />} />
                
                <Route path="/shop-for-cats/cat-grooming" element={<CatGrooming />} />
                <Route path="/shop-for-cats/cat-grooming/all-grooming" element={<CatGrooming initialActive="All Grooming" />} />
                <Route path="/shop-for-cats/cat-grooming/brushes-combs" element={<CatGrooming initialActive="Brushes & Combs" />} />
                <Route path="/shop-for-cats/cat-grooming/dry-bath" element={<CatGrooming initialActive="Dry Bath, Wipes & Perfume" />} />
                <Route path="/shop-for-cats/cat-grooming/ear-eye-pawcare" element={<CatGrooming initialActive="Ear, Eye & PawCare" />} />
                <Route path="/shop-for-cats/cat-grooming/oral-care" element={<CatGrooming initialActive="Oral Care" />} />
                <Route path="/shop-for-cats/cat-grooming/shampoo-conditioner" element={<CatGrooming initialActive="Shampoo & Conditioner" />} />
                <Route path="/shop-for-cats/cat-grooming/tick-flea-control" element={<CatGrooming initialActive="Tick & Flea Control" />} />
                
                <Route path="/cats/cat-food" element={<CatFood />} />
                <Route path="/cats/cat-food/all-cat-food" element={<CatFood initialActive="All Cat Food" />} />
                <Route path="/cats/cat-food/dry-food" element={<CatFood initialActive="Dry Food" />} />
                <Route path="/cats/cat-food/wet-food" element={<CatFood initialActive="Wet Food" />} />
                <Route path="/cats/cat-food/grain-free" element={<CatFood initialActive="Grain Free" />} />
                <Route path="/cats/cat-food/kitten-food" element={<CatFood initialActive="Kitten Food" />} />
                <Route path="/cats/cat-food/hypoallergenic" element={<CatFood initialActive="Hypoallergenic" />} />
                <Route path="/cats/cat-food/veterinary-food" element={<CatFood initialActive="Veterinary Food" />} />
                <Route path="/cats/cat-food/supplements" element={<CatFood initialActive="Supplements" />} />
                {/* Cat additional categories */}
                <Route path="/cats/cat-treats" element={<CatTreats />} />
                <Route path="/cats/cat-treats/all-cat-treats" element={<CatTreats initialActive="All Cat Treats" />} />
                <Route path="/cats/cat-treats/crunchy-treats" element={<CatTreats initialActive="Crunchy Treats" />} />
                <Route path="/cats/cat-treats/creamy-treats" element={<CatTreats initialActive="Creamy Treats" />} />
                <Route path="/cats/cat-treats/grain-free-treats" element={<CatTreats initialActive="Grain Free Treats" />} />
                <Route path="/cats/cat-treats/chew-treats" element={<CatTreats initialActive="Chew Treats" />} />
                <Route path="/cats/cat-treats/soft-chewy" element={<CatTreats initialActive="Soft & Chewy" />} />

                <Route path="/cats/cat-toys" element={<CatToys />} />
                <Route path="/cats/cat-toys/all-cat-toys" element={<CatToys initialActive="All Cat Toys" />} />
                <Route path="/cats/cat-toys/catnip-toys" element={<CatToys initialActive="Catnip Toys" />} />
                <Route path="/cats/cat-toys/interactive-toys" element={<CatToys initialActive="Interactive Toys" />} />
                <Route path="/cats/cat-toys/plush-toys" element={<CatToys initialActive="Plush Toys" />} />
                <Route path="/cats/cat-toys/teaser-wands" element={<CatToys initialActive="Teaser & Wands" />} />
                <Route path="/cats/cat-toys/all-toys" element={<CatToys initialActive="All Toys" />} />

                <Route path="/cats/cat-bedding" element={<CatBedding />} />
                <Route path="/cats/cat-bedding/all-beds-scratchers" element={<CatBedding initialActive="All Beds & Scratchers" />} />
                <Route path="/cats/cat-bedding/beds" element={<CatBedding initialActive="Beds" />} />
                <Route path="/cats/cat-bedding/mats" element={<CatBedding initialActive="Mats" />} />
                <Route path="/cats/cat-bedding/tents" element={<CatBedding initialActive="Tents" />} />
                <Route path="/cats/cat-bedding/blankets-cushions" element={<CatBedding initialActive="Blankets & Cushions" />} />
                <Route path="/cats/cat-bedding/trees-scratchers" element={<CatBedding initialActive="Trees & Scratchers" />} />
                <Route path="/cats/cat-bedding/personalised" element={<CatBedding initialActive="Personalised" />} />

                <Route path="/cats/cat-litter" element={<CatLitter />} />
                <Route path="/cats/cat-litter/all-litter-supplies" element={<CatLitter initialActive="All Litter & Supplies" />} />
                <Route path="/cats/cat-litter/litter" element={<CatLitter initialActive="Litter" />} />
                <Route path="/cats/cat-litter/litter-trays" element={<CatLitter initialActive="Litter Trays" />} />
                <Route path="/cats/cat-litter/scooper" element={<CatLitter initialActive="Scooper" />} />
                <Route path="/cats/cat-litter/stain-odour" element={<CatLitter initialActive="Stain & Odour" />} />
                {/* Cat bowls, collars, grooming routes */}
                <Route path="/cats/cat-bowls" element={<CatBowls />} />
                <Route path="/cats/cat-bowls/all-cat-bowls" element={<CatBowls initialActive="All Cat Bowls" />} />
                <Route path="/cats/cat-bowls/bowls" element={<CatBowls initialActive="Bowls" />} />
                <Route path="/cats/cat-bowls/travel-fountain" element={<CatBowls initialActive="Travel & Fountain" />} />

                <Route path="/cats/cat-collars" element={<CatCollars />} />
                <Route path="/cats/cat-collars/all-collars-accessories" element={<CatCollars initialActive="All Collars & Accessories" />} />
                <Route path="/cats/cat-collars/collars" element={<CatCollars initialActive="Collars" />} />
                <Route path="/cats/cat-collars/leash-harness" element={<CatCollars initialActive="Leash & Harness Set" />} />
                <Route path="/cats/cat-collars/name-tags" element={<CatCollars initialActive="Name Tags" />} />
                <Route path="/cats/cat-collars/bow-ties-bandanas" element={<CatCollars initialActive="Bow Ties & Bandanas" />} />

                <Route path="/cats/cat-grooming" element={<CatGrooming />} />
                <Route path="/cats/cat-grooming/all-grooming" element={<CatGrooming initialActive="All Grooming" />} />
                <Route path="/cats/cat-grooming/brushes-combs" element={<CatGrooming initialActive="Brushes & Combs" />} />
                <Route path="/cats/cat-grooming/dry-bath" element={<CatGrooming initialActive="Dry Bath, Wipes & Perfume" />} />
                <Route path="/cats/cat-grooming/ear-eye-pawcare" element={<CatGrooming initialActive="Ear, Eye & PawCare" />} />
                <Route path="/cats/cat-grooming/oral-care" element={<CatGrooming initialActive="Oral Care" />} />
                <Route path="/cats/cat-grooming/shampoo-conditioner" element={<CatGrooming initialActive="Shampoo & Conditioner" />} />
                <Route path="/cats/cat-grooming/tick-flea-control" element={<CatGrooming initialActive="Tick & Flea Control" />} />
                
                {/* Outlet Routes - follow same pattern as dogs/cats */}
                <Route path="/shop-for-outlet" element={<ShopForOutletIndex />} />
                
                {/* Outlet Food & Treats */}
                <Route path="/shop-for-outlet/food-treats" element={<OutletFoodTreats />} />
                <Route path="/shop-for-outlet/food-treats/all-food-treats" element={<OutletFoodTreats initialActive="All Food & Treats" />} />
                <Route path="/shop-for-outlet/food-treats/raw-hide-bones" element={<OutletFoodTreats initialActive="Raw Hide Bones" />} />
                <Route path="/shop-for-outlet/food-treats/knotted-bones" element={<OutletFoodTreats initialActive="Knotted Bones" />} />
                <Route path="/shop-for-outlet/food-treats/munchies" element={<OutletFoodTreats initialActive="Munchies" />} />
                <Route path="/shop-for-outlet/food-treats/dental-treats" element={<OutletFoodTreats initialActive="Dental Treats" />} />
                <Route path="/shop-for-outlet/food-treats/calcium-treats" element={<OutletFoodTreats initialActive="Calcium Treats" />} />
                <Route path="/shop-for-outlet/food-treats/wet-food-gravy" element={<OutletFoodTreats initialActive="Wet Food / Gravy" />} />
                <Route path="/shop-for-outlet/food-treats/puppy-treats" element={<OutletFoodTreats initialActive="Puppy Treats" />} />
                
                {/* Outlet Toys */}
                <Route path="/shop-for-outlet/toys" element={<OutletToys />} />
                <Route path="/shop-for-outlet/toys/all-toys" element={<OutletToys initialActive="All Toys" />} />
                <Route path="/shop-for-outlet/toys/soft-toys" element={<OutletToys initialActive="Soft Toys" />} />
                <Route path="/shop-for-outlet/toys/rubber-toys" element={<OutletToys initialActive="Rubber Toys" />} />
                <Route path="/shop-for-outlet/toys/rope-toys" element={<OutletToys initialActive="Rope Toys" />} />
                <Route path="/shop-for-outlet/toys/squeaky-toys" element={<OutletToys initialActive="Squeaky Toys" />} />
                <Route path="/shop-for-outlet/toys/interactive-toys" element={<OutletToys initialActive="Interactive Toys" />} />
                
                {/* Outlet Grooming & Care */}
                <Route path="/shop-for-outlet/grooming-care" element={<OutletGrooming />} />
                <Route path="/shop-for-outlet/grooming-care/all-grooming-care" element={<OutletGrooming initialActive="All Grooming & Care" />} />
                <Route path="/shop-for-outlet/grooming-care/combs" element={<OutletGrooming initialActive="Combs" />} />
                <Route path="/shop-for-outlet/grooming-care/brushes" element={<OutletGrooming initialActive="Brushes" />} />
                <Route path="/shop-for-outlet/grooming-care/nail-clippers" element={<OutletGrooming initialActive="Nail Clippers" />} />
                <Route path="/shop-for-outlet/grooming-care/trimmers" element={<OutletGrooming initialActive="Trimmers" />} />
                
                {/* Outlet Walking Essentials */}
                <Route path="/shop-for-outlet/walking-essentials" element={<OutletWalkingEssentials />} />
                <Route path="/shop-for-outlet/walking-essentials/all-walking-essentials" element={<OutletWalkingEssentials initialActive="All Walking Essentials" />} />
                <Route path="/shop-for-outlet/walking-essentials/collars" element={<OutletWalkingEssentials initialActive="Collars" />} />
                <Route path="/shop-for-outlet/walking-essentials/leashes" element={<OutletWalkingEssentials initialActive="Leashes" />} />
                <Route path="/shop-for-outlet/walking-essentials/harnesses" element={<OutletWalkingEssentials initialActive="Harnesses" />} />
                
                {/* Outlet other categories */}
                <Route path="/shop-for-outlet/feeding-essentials" element={<OutletFeedingEssentials />} />
                <Route path="/shop-for-outlet/feeding-essentials/all-feeding-essentials" element={<OutletFeedingEssentials initialActive="All Feeding Essentials" />} />
                <Route path="/shop-for-outlet/feeding-essentials/bowls" element={<OutletFeedingEssentials initialActive="Bowls" />} />
                <Route path="/shop-for-outlet/feeding-essentials/slow-feeders" element={<OutletFeedingEssentials initialActive="Slow Feeders" />} />
                <Route path="/shop-for-outlet/feeding-essentials/water-dispensers" element={<OutletFeedingEssentials initialActive="Water Dispensers" />} />
                <Route path="/shop-for-outlet/feeding-essentials/feeding-mats" element={<OutletFeedingEssentials initialActive="Feeding Mats" />} />
                
                <Route path="/shop-for-outlet/travel-safety" element={<OutletTravelSafety />} />
                <Route path="/shop-for-outlet/travel-safety/all-travel-safety" element={<OutletTravelSafety initialActive="All Travel & Safety" />} />
                <Route path="/shop-for-outlet/travel-safety/carriers" element={<OutletTravelSafety initialActive="Carriers" />} />
                <Route path="/shop-for-outlet/travel-safety/travel-bowls" element={<OutletTravelSafety initialActive="Travel Bowls" />} />
                <Route path="/shop-for-outlet/travel-safety/safety-gear" element={<OutletTravelSafety initialActive="Safety Gear" />} />
                <Route path="/shop-for-outlet/travel-safety/car-accessories" element={<OutletTravelSafety initialActive="Car Accessories" />} />
                
                <Route path="/shop-for-outlet/beds-comfort" element={<OutletBedsComfort />} />
                <Route path="/shop-for-outlet/beds-comfort/all-beds-comfort" element={<OutletBedsComfort initialActive="All Beds & Comfort" />} />
                <Route path="/shop-for-outlet/beds-comfort/pet-beds" element={<OutletBedsComfort initialActive="Pet Beds" />} />
                <Route path="/shop-for-outlet/beds-comfort/blankets" element={<OutletBedsComfort initialActive="Blankets" />} />
                <Route path="/shop-for-outlet/beds-comfort/cushions" element={<OutletBedsComfort initialActive="Cushions" />} />
                <Route path="/shop-for-outlet/beds-comfort/mats" element={<OutletBedsComfort initialActive="Mats" />} />
                
                <Route path="/shop-for-outlet/accessories" element={<OutletAccessories />} />
                <Route path="/shop-for-outlet/accessories/all-accessories" element={<OutletAccessories initialActive="All Accessories" />} />
                <Route path="/shop-for-outlet/accessories/pet-accessories" element={<OutletAccessories initialActive="Pet Accessories" />} />
                <Route path="/shop-for-outlet/accessories/training-aids" element={<OutletAccessories initialActive="Training Aids" />} />
                <Route path="/shop-for-outlet/accessories/hygiene-products" element={<OutletAccessories initialActive="Hygiene Products" />} />
                <Route path="/shop-for-outlet/accessories/fashion-accessories" element={<OutletAccessories initialActive="Fashion Accessories" />} />
                
                <Route path="/shop-for-outlet/litter-toilet" element={<OutletLitterToilet />} />
                <Route path="/shop-for-outlet/training-hygiene" element={<OutletTrainingHygiene />} />
                
                <Route path="/product-full/:id" element={<ProductFullPage />} />
                <Route path="/product-detail-page/:id" element={<ProductDetailPage />} />
                <Route path="/product-detail-page" element={<ProductDetailPage />} />
                <Route path="/shopping-cart" element={<ShoppingCart />} />
                <Route 
                  path="/checkout-process" 
                  element={
                    <ProtectedRoute message="Please sign in to continue with checkout">
                      <CheckoutProcess />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/user-login" element={<UserAuth />} />
                <Route path="/user-register" element={<UserAuth />} />
                <Route 
                  path="/user-account-dashboard" 
                  element={
                    <ProtectedRoute message="Please sign in to access your account dashboard">
                      <UserAccountDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/admin-login" element={<AdminLogin />} />
                <Route 
                  path="/admin-dashboard" 
                  element={
                    <ProtectedAdminRoute>
                      <AdminDashboard />
                    </ProtectedAdminRoute>
                  } 
                />
                <Route 
                  path="/admin-panel" 
                  element={
                    <ProtectedAdminRoute>
                      <AdminPanel />
                    </ProtectedAdminRoute>
                  } 
                />
                
                {/* Additional navigation routes */}
                <Route path="/gift-cards" element={<ComingSoon title="Gift Cards" message="Digital gift cards are coming soon!" />} />
                <Route path="/outlet" element={<ComingSoon title="PET&CO Outlet" message="Amazing deals up to 60% off coming soon!" />} />
                <Route path="/spa" element={<ComingSoon title="PET&CO Spa" message="Pet grooming and spa services coming soon!" />} />
                <Route path="/hub" element={<ComingSoon title="PET&CO Hub" message="Community hub for pet lovers coming soon!" />} />
                <Route path="/locator" element={<ComingSoon title="Store & Spa Locator" message="Find stores and spa locations near you - coming soon!" />} />
                <Route path="/franchise" element={<ComingSoon title="Become a Franchisee" message="Franchise opportunities coming soon!" />} />
                <Route path="/birthday" element={<ComingSoon title="Birthday Club" message="Join our birthday club for special treats - coming soon!" />} />
                {/* replaced by dedicated PetBoardingPage route above */}
                <Route path="/adopt-a-pet" element={<ComingSoon title="Adopt a Pet" message="Pet adoption services coming soon!" />} />
                <Route path="/track-order" element={<ComingSoon title="Track Order" message="Order tracking system coming soon!" />} />
                <Route path="/contact" element={<ComingSoon title="Contact Us" message="Contact page coming soon! Email us at support@petco.com" />} />
                <Route path="/faqs" element={<ComingSoon title="FAQs & Exchange Policy" message="FAQ and exchange policy page coming soon!" />} />
                
                {/* Brand pages */}
                <Route path="/brands/sara" element={<ComingSoon title="Sara's Brand" message="Explore Sara's premium pet products - coming soon!" />} />
                <Route path="/brands/hearty" element={<ComingSoon title="Hearty Brand" message="Discover Hearty's nutritious pet food - coming soon!" />} />
                <Route path="/brands/meowsi" element={<ComingSoon title="Meowsi Brand" message="Browse Meowsi's cat essentials - coming soon!" />} />
                <Route path="/brands/fashi" element={<ComingSoon title="FashiDog Brand" message="Check out FashiDog's stylish accessories - coming soon!" />} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
              </ErrorBoundary>
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
