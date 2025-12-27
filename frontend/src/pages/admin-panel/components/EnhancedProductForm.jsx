import React, { useState, useEffect } from 'react';
import apiClient from '../../../services/api';
import { X, Plus, Trash2, Upload, Star } from 'lucide-react';
import dataService from '../../../services/dataService';
import categoryApi from '../../../services/categoryApi';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { buildFiltersFromForm } from '../../../utils/productUtils';

// Remove empty strings / empty arrays / empty objects recursively.
// Keeps: numbers (including 0), booleans (including false), non-empty strings, Dates, Files/Blobs.
const pruneEmptyDeep = (value) => {
  const isBlobLike =
    (typeof Blob !== 'undefined' && value instanceof Blob) ||
    (typeof File !== 'undefined' && value instanceof File);

  if (value === null || value === undefined) return undefined;
  if (isBlobLike) return value;
  if (value instanceof Date) return value;

  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length === 0 ? undefined : trimmed;
  }

  if (Array.isArray(value)) {
    const cleaned = value
      .map(pruneEmptyDeep)
      .filter((v) => v !== undefined);
    return cleaned.length === 0 ? undefined : cleaned;
  }

  if (typeof value === 'object') {
    const out = {};
    Object.entries(value).forEach(([k, v]) => {
      const cleaned = pruneEmptyDeep(v);
      if (cleaned !== undefined) out[k] = cleaned;
    });
    return Object.keys(out).length === 0 ? undefined : out;
  }

  return value;
};

const EnhancedProductForm = ({ product, onSave, onCancel, allowedCategories, defaultSection }) => {
  const [formData, setFormData] = useState({
    // Basic Information
    name: '',
    description: '',
    shortDescription: '',
    brand: '',
    category: '',
    subcategory: '',
    
    // Pricing and Stock
    price: '',
    originalPrice: '',
    stockQuantity: '',
    inStock: true,
    
    // Product Details
    features: [''],
    ingredients: '',
    benefits: '',
    nutrition: {
      protein: '',
      fat: '',
      fiber: '',
      moisture: '',
      ash: '',
      calories: ''
    },
    
    // Product Variants
    variants: [
      {
        id: 'default',
        weight: '',
        // unitType: 'weight' | 'size' | '' (optional) - for flexibility across product types
        unitType: '',
        // if unitType === 'size', `size` can hold numeric values with unit
        size: '',
        weightUnit: 'g',
        sizeUnit: 'cm',
        label: '',
        price: '',
        originalPrice: '',
        stock: ''
      }
    ],
    
    // Product Metadata
    badges: [''],
    tags: '',
    lifeStage: '',
    breedSize: '',
    productType: '',
    // High-level product type (Dog/Cat/Pharmacy/Outlet) stored in a single DB column
    type: '',
    foodType: '', // Veg/Non-Veg field
    specialDiet: '',
    proteinSource: '',
    petType: 'Dog',
    subcategoryLabel: '',
    colors: '',
    // subcategory-specific fields
    material: '',
    scent: '',
    suitableFor: '',
    treatType: '',
    texture: '',
    // Pharmacy / medicine specific fields
    prescriptionRequired: false,
    dosageForm: '',
    strength: '',
    activeIngredient: '',
    manufacturer: '',
    indications: '',
    contraindications: '',
    expiryDate: '',
    // Dog-specific higher-level fields
    servingSize: '',
    packCount: '',
    weightUnit: 'g',
    flavors: '',
    
    // Rating (for new products)
    rating: '',
    reviewCount: ''
  });

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [categorySearch, setCategorySearch] = useState('');
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [subcategorySearch, setSubcategorySearch] = useState('');
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('basic');

  // Type-based subcategory mapping
  const typeSubcategoryMapping = {
    'Dog': [
      // Dog Food
      { id: 'daily-meals', name: 'Daily Meals' },
      { id: 'dry-food', name: 'Dry Food' },
      { id: 'wet-food', name: 'Wet Food' },
      { id: 'grain-free', name: 'Grain Free' },
      { id: 'puppy-food', name: 'Puppy Food' },
      { id: 'hypoallergenic', name: 'Hypoallergenic' },
      { id: 'veterinary-food', name: 'Veterinary Food' },
      { id: 'food-toppers-gravy', name: 'Food Toppers & Gravy' },
      { id: 'all-dog-food', name: 'All Dog Food' },
      
      // Dog Grooming
      { id: 'brushes-combs', name: 'Brushes & Combs' },
      { id: 'dry-bath-wipes-perfume', name: 'Dry Bath, Wipes & Perfume' },
      { id: 'ear-eye-pawcare', name: 'Ear, Eye & PawCare' },
      { id: 'oral-care', name: 'Oral Care' },
      { id: 'shampoo-conditioner', name: 'Shampoo & Conditioner' },
      { id: 'tick-flea-control', name: 'Tick & Flea Control' },
      { id: 'all-dog-grooming', name: 'All Dog Grooming' },
      
      // Walk Essentials
      { id: 'collar', name: 'Collar' },
      { id: 'leash', name: 'Leash' },
      { id: 'harness', name: 'Harness' },
      { id: 'name-tags', name: 'Name Tags' },
      { id: 'personalised-walk', name: 'Personalised' },
      { id: 'all-walk-essentials', name: 'All Walk Essentials' },
      
      // Dog Treats
      { id: 'biscuits-snacks', name: 'Biscuits & Snacks' },
      { id: 'soft-chewy', name: 'Soft & Chewy' },
      { id: 'natural-treats', name: 'Natural Treats' },
      { id: 'puppy-treats', name: 'Puppy Treats' },
      { id: 'vegetarian-treats', name: 'Vegetarian Treats' },
      { id: 'dental-chew', name: 'Dental Chew' },
      { id: 'grain-free-treat', name: 'Grain Free Treat' },
      { id: 'all-dog-treats', name: 'All Dog Treats' },
      
      // Dog Toys
      { id: 'balls', name: 'Balls' },
      { id: 'chew-toys', name: 'Chew Toys' },
      { id: 'crinkle-toys', name: 'Crinkle Toys' },
      { id: 'fetch-toys', name: 'Fetch Toys' },
      { id: 'interactive-toys', name: 'Interactive Toys' },
      { id: 'plush-toys', name: 'Plush Toys' },
      { id: 'rope-toys', name: 'Rope Toys' },
      { id: 'squeaker-toys', name: 'Squeaker Toys' },
      { id: 'all-dog-toys', name: 'All Dog Toys' },
      
      // Dog Bedding
      { id: 'beds', name: 'Beds' },
      { id: 'blankets-cushions', name: 'Blankets & Cushions' },
      { id: 'mats', name: 'Mats' },
      { id: 'personalised-bedding', name: 'Personalised Bedding' },
      { id: 'tents', name: 'Tents' },
      { id: 'all-dog-bedding', name: 'All Dog Bedding' },
      
      // Dog Clothing & Accessories
      { id: 'festive-special', name: 'Festive Special' },
      { id: 'tshirts-dresses', name: 'T-Shirts & Dresses' },
      { id: 'sweatshirts', name: 'Sweatshirts' },
      { id: 'sweaters', name: 'Sweaters' },
      { id: 'bow-ties-bandanas', name: 'Bow Ties & Bandanas' },
      { id: 'raincoats', name: 'Raincoats' },
      { id: 'shoes-socks', name: 'Shoes & Socks' },
      { id: 'jackets', name: 'Jackets' },
      { id: 'personalised-clothing', name: 'Personalised' },
      { id: 'all-dog-clothing', name: 'All Dog Clothing' },
      
      // Dog Bowls & Diners
      { id: 'all-dog-bowls-diners', name: 'All Dog Bowls & Diners' },
      { id: 'bowls', name: 'Bowls' },
      { id: 'diners', name: 'Diners' },
      { id: 'anti-spill-mats', name: 'Anti Spill Mats' },
      { id: 'travel-fountain', name: 'Travel & Fountain' },
      
      // Dog Health & Hygiene
      { id: 'oral-care-health', name: 'Oral Care' },
      { id: 'supplements', name: 'Supplements' },
      { id: 'tick-flea-control-health', name: 'Tick & Flea Control' },
      { id: 'all-dog-health-hygiene', name: 'All Dog Health & Hygiene' },
      
      // Dog Training Essentials
      { id: 'agility', name: 'Agility' },
      { id: 'all-training-essentials', name: 'All Training Essentials' },
      { id: 'stain-odour', name: 'Stain & Odour' },
      
      // Travel Essentials
      { id: 'all-travel-supplies', name: 'All Travel Supplies' },
      { id: 'carriers', name: 'Carriers' },
      { id: 'travel-bowls', name: 'Travel Bowls' },
      { id: 'travel-beds', name: 'Travel Beds' },
      { id: 'water-bottles', name: 'Water Bottles' }
    ],
    'Cat': [
      // Cat Food
      { id: 'daily-meals-cat', name: 'Daily Meals' },
      { id: 'dry-food-cat', name: 'Dry Food' },
      { id: 'wet-food-cat', name: 'Wet Food' },
      { id: 'grain-free-cat', name: 'Grain Free' },
      { id: 'kitten-food', name: 'Kitten Food' },
      { id: 'hypoallergenic-cat', name: 'Hypoallergenic' },
      { id: 'veterinary-food-cat', name: 'Veterinary Food' },
      { id: 'food-toppers-gravy-cat', name: 'Food Toppers & Gravy' },
      { id: 'senior-cat-food', name: 'Senior Cat Food' },
      { id: 'all-cat-food', name: 'All Cat Food' },
      
      // Cat Treats
      { id: 'crunchy-treats-cat', name: 'Crunchy Treats' },
      { id: 'soft-chewy-cat', name: 'Soft & Chewy' },
      { id: 'natural-treats-cat', name: 'Natural Treats' },
      { id: 'kitten-treats', name: 'Kitten Treats' },
      { id: 'freeze-dried-treats', name: 'Freeze Dried Treats' },
      { id: 'dental-treats-cat', name: 'Dental Treats' },
      { id: 'catnip-treats', name: 'Catnip Treats' },
      { id: 'all-cat-treats', name: 'All Cat Treats' },
      
      // Cat Toys
      { id: 'interactive-toys-cat', name: 'Interactive Toys' },
      { id: 'feather-wand-toys', name: 'Feather & Wand Toys' },
      { id: 'balls-mice-toys', name: 'Balls & Mice Toys' },
      { id: 'catnip-toys', name: 'Catnip Toys' },
      { id: 'laser-toys', name: 'Laser Toys' },
      { id: 'puzzle-toys-cat', name: 'Puzzle Toys' },
      { id: 'plush-toys-cat', name: 'Plush Toys' },
      { id: 'tunnel-toys', name: 'Tunnel Toys' },
      { id: 'all-cat-toys', name: 'All Cat Toys' },
      
      // Cat Litter & Hygiene
      { id: 'clumping-litter', name: 'Clumping Litter' },
      { id: 'non-clumping-litter', name: 'Non-Clumping Litter' },
      { id: 'natural-litter', name: 'Natural Litter' },
      { id: 'scented-litter', name: 'Scented Litter' },
      { id: 'crystal-litter', name: 'Crystal Litter' },
      { id: 'litter-boxes', name: 'Litter Boxes' },
      { id: 'litter-mats', name: 'Litter Mats' },
      { id: 'litter-scoops', name: 'Litter Scoops' },
      { id: 'litter-deodorizers', name: 'Litter Deodorizers' },
      { id: 'all-cat-litter', name: 'All Cat Litter' },
      
      // Cat Scratchers & Furniture
      { id: 'scratching-posts', name: 'Scratching Posts' },
      { id: 'scratching-pads', name: 'Scratching Pads' },
      { id: 'cat-trees', name: 'Cat Trees' },
      { id: 'cat-condos', name: 'Cat Condos' },
      { id: 'wall-scratchers', name: 'Wall Scratchers' },
      { id: 'cardboard-scratchers', name: 'Cardboard Scratchers' },
      { id: 'sisal-scratchers', name: 'Sisal Scratchers' },
      { id: 'all-cat-scratchers', name: 'All Cat Scratchers' },
      
      // Cat Bedding & Comfort
      { id: 'cat-beds', name: 'Cat Beds' },
      { id: 'cat-blankets', name: 'Cat Blankets' },
      { id: 'heated-beds', name: 'Heated Beds' },
      { id: 'cave-beds', name: 'Cave Beds' },
      { id: 'window-perches', name: 'Window Perches' },
      { id: 'cat-mats', name: 'Cat Mats' },
      { id: 'cat-cushions', name: 'Cat Cushions' },
      { id: 'all-cat-bedding', name: 'All Cat Bedding' },
      
      // Cat Grooming
      { id: 'cat-brushes', name: 'Cat Brushes' },
      { id: 'deshedding-tools', name: 'Deshedding Tools' },
      { id: 'nail-clippers-cat', name: 'Nail Clippers' },
      { id: 'cat-shampoo', name: 'Cat Shampoo' },
      { id: 'grooming-wipes-cat', name: 'Grooming Wipes' },
      { id: 'ear-cleaning-cat', name: 'Ear Cleaning' },
      { id: 'dental-care-cat', name: 'Dental Care' },
      { id: 'all-cat-grooming', name: 'All Cat Grooming' },
      
      // Cat Accessories
      { id: 'cat-collars', name: 'Cat Collars' },
      { id: 'cat-harnesses', name: 'Cat Harnesses' },
      { id: 'cat-leashes', name: 'Cat Leashes' },
      { id: 'id-tags-cat', name: 'ID Tags' },
      { id: 'cat-clothing', name: 'Cat Clothing' },
      { id: 'cat-bowls-feeders', name: 'Cat Bowls & Feeders' },
      { id: 'automatic-feeders', name: 'Automatic Feeders' },
      { id: 'water-fountains-cat', name: 'Water Fountains' },
      { id: 'all-cat-accessories', name: 'All Cat Accessories' },
      
      // Cat Carriers & Travel
      { id: 'hard-carriers', name: 'Hard Carriers' },
      { id: 'soft-carriers', name: 'Soft Carriers' },
      { id: 'airline-approved-carriers', name: 'Airline Approved Carriers' },
      { id: 'backpack-carriers', name: 'Backpack Carriers' },
      { id: 'travel-accessories-cat', name: 'Travel Accessories' },
      { id: 'all-cat-carriers', name: 'All Cat Carriers' },
      
      // Cat Health & Supplements
      { id: 'vitamins-cat', name: 'Vitamins' },
      { id: 'joint-supplements-cat', name: 'Joint Supplements' },
      { id: 'hairball-remedies', name: 'Hairball Remedies' },
      { id: 'digestive-health-cat', name: 'Digestive Health' },
      { id: 'calming-supplements', name: 'Calming Supplements' },
      { id: 'flea-tick-cat', name: 'Flea & Tick Control' },
      { id: 'all-cat-health', name: 'All Cat Health' }
    ],
    'Pharmacy': [
      // Pharmacy for Dogs
      { id: 'medicines-for-skin', name: 'Medicines for Skin' },
      { id: 'joint-mobility', name: 'Joint & Mobility' },
      { id: 'digestive-care', name: 'Digestive Care' },
      { id: 'all-dog-pharmacy', name: 'All Dog Pharmacy' },
      
      // Pharmacy for Cats
      { id: 'skin-coat-care', name: 'Skin & Coat Care' },
      { id: 'worming', name: 'Worming' },
      { id: 'oral-care', name: 'Oral Care' },
      { id: 'all-cat-pharmacy', name: 'All Cat Pharmacy' },
      
      // Medicines
      { id: 'antibiotics', name: 'Antibiotics' },
      { id: 'antifungals', name: 'Antifungals' },
      { id: 'anti-inflammatories', name: 'Anti Inflammatories' },
      { id: 'pain-relief', name: 'Pain Relief' },
      { id: 'all-medicines', name: 'All Medicines' },
      
      // Supplements
      { id: 'vitamins-minerals', name: 'Vitamins & Minerals' },
      { id: 'joint-supplements', name: 'Joint Supplements' },
      { id: 'probiotics-gut-health', name: 'Probiotics & Gut Health' },
      { id: 'skin-coat-supplements', name: 'Skin & Coat Supplements' },
      { id: 'all-supplements', name: 'All Supplements' },
      
      // Prescription Food
      { id: 'renal-support', name: 'Renal Support' },
      { id: 'hypoallergenic-diets', name: 'Hypoallergenic Diets' },
      { id: 'digestive-support', name: 'Digestive Support' },
      { id: 'weight-management', name: 'Weight Management' },
      { id: 'all-prescription-food', name: 'All Prescription Food' }
    ],
    'Outlet': [
      // Food & Treats
      { id: 'raw-hide-bones', name: 'Raw Hide Bones' },
      { id: 'knotted-bones', name: 'Knotted Bones' },
      { id: 'munchies', name: 'Munchies' },
      { id: 'dental-treats', name: 'Dental Treats' },
      { id: 'calcium-treats', name: 'Calcium Treats' },
      { id: 'wet-food-gravy', name: 'Wet Food / Gravy' },
      { id: 'puppy-treats', name: 'Puppy Treats' },
      { id: 'all-food-treats', name: 'All Food & Treats' },
      
      // Toys
      { id: 'soft-toys', name: 'Soft Toys' },
      { id: 'rubber-toys', name: 'Rubber Toys' },
      { id: 'rope-toys', name: 'Rope Toys' },
      { id: 'squeaky-toys', name: 'Squeaky Toys' },
      { id: 'interactive-toys', name: 'Interactive Toys' },
      { id: 'all-toys', name: 'All Toys' },
      
      // Grooming & Care
      { id: 'combs', name: 'Combs' },
      { id: 'brushes', name: 'Brushes' },
      { id: 'nail-clippers', name: 'Nail Clippers' },
      { id: 'trimmers', name: 'Trimmers' },
      { id: 'all-grooming', name: 'All Grooming' },
      
      // Walking Essentials
      { id: 'collars', name: 'Collars' },
      { id: 'leashes', name: 'Leashes' },
      { id: 'harnesses', name: 'Harnesses' },
      { id: 'all-walking-essentials', name: 'All Walking Essentials' },
      
      // Feeding Essentials
      { id: 'bowls', name: 'Bowls' },
      { id: 'slow-feeders', name: 'Slow Feeders' },
      { id: 'water-dispensers', name: 'Water Dispensers' },
      { id: 'all-feeding-essentials', name: 'All Feeding Essentials' },
      
      // Beds & Comfort
      { id: 'pet-beds', name: 'Pet Beds' },
      { id: 'blankets', name: 'Blankets' },
      { id: 'cushions', name: 'Cushions' },
      { id: 'all-beds-comfort', name: 'All Beds & Comfort' },
      
      // Travel & Safety
      { id: 'carriers', name: 'Carriers' },
      { id: 'travel-bowls', name: 'Travel Bowls' },
      { id: 'safety-gear', name: 'Safety Gear' },
      { id: 'all-travel-safety', name: 'All Travel & Safety' },
      
      // Accessories
      { id: 'pet-accessories', name: 'Pet Accessories' },
      { id: 'training-aids', name: 'Training Aids' },
      { id: 'hygiene-products', name: 'Hygiene Products' },
      { id: 'all-accessories', name: 'All Accessories' }
    ]
  };

  // Predefined options for dropdowns
  const lifeStageOptions = ['All Life Stages', 'Puppy', 'Adult', 'Senior', 'Kitten'];
  const breedSizeOptions = ['All Breeds', 'Small Breed', 'Medium Breed', 'Large Breed', 'Extra Large Breed'];
  const productTypeOptions = [
    'Dry Food', 'Wet Food', 'Treats', 'Supplements', 'Toys', 'Accessories',
    'Grooming', 'Health & Hygiene', 'Bedding', 'Bowls & Feeders', 'Litter',
    'Training', 'Travel Supplies', 'Clothing'
  ];
  const specialDietOptions = [
    'None', 'Grain-Free', 'Limited Ingredient', 'Weight Management', 'Sensitive Stomach',
    'Hypoallergenic', 'Organic', 'Natural', 'Veterinary Diet'
  ];
  const proteinSourceOptions = [
    'Chicken', 'Beef', 'Fish', 'Lamb', 'Turkey', 'Duck', 'Venison', 
    'Salmon', 'Tuna', 'Vegetarian', 'Mixed Protein'
  ];

  const resolveImageUrl = (candidate) => {
    if (!candidate || typeof candidate !== 'string') return '/assets/images/no_image.png';
    
    // Return absolute URLs and data URIs as-is
    if (/^(https?:)?\/\//i.test(candidate) || candidate.startsWith('data:')) {
      return candidate;
    }

    // If it's an absolute OS path (Windows or Unix), extract filename
    if (/^[a-zA-Z]:\\/.test(candidate) || candidate.startsWith('\\\\') || candidate.startsWith('/') || candidate.includes('\\')) {
      const parts = candidate.split(/\\|\//); 
      candidate = parts[parts.length - 1];
    }

    // If it's a bare filename (e.g., "photo.jpg"), map to API image route
    if (/^[^/]+\.[a-zA-Z0-9]+$/.test(candidate)) {
      candidate = `/admin/products/images/${candidate}`;
    }

    const base = apiClient?.defaults?.baseURL || 'https://nishmitha-roots-7.onrender.com/api';
    const fullUrl = candidate.startsWith('/') ? `${base}${candidate}` : `${base}/${candidate}`;
    
    console.log('EnhancedProductForm: Resolving image URL:', { original: candidate, resolved: fullUrl });
    
    return fullUrl;
  };

  // Infer a category type from category id or name to decide which filters to render
  const inferCategoryType = (categoryIdOrName) => {
    if (!categoryIdOrName) return 'generic';
    const s = categoryIdOrName.toString().toLowerCase();
    if (s.includes('dog')) return 'dog';
    if (s.includes('cat')) return 'cat';
    if (s.includes('pharm') || s.includes('medicine') || s.includes('med')) return 'pharmacy';
    return 'generic';
  };

  useEffect(() => {
    loadCategories();
    if (product) {
      populateFormFromProduct(product);
    }
  }, [product]);

  const filterCategoriesByPetType = (petType) => {
    if (!petType) return categories;
    const s = (petType || '').toString().trim().toLowerCase();

    const getTypeForCategory = (c) => {
      // category can be string or object
      const raw = (c && typeof c === 'object') ? (c.name || c.label || c.slug || c.id || '') : (c || '');
      const v = String(raw).replace(/\s+/g, ' ').trim().toLowerCase();
      if (!v) return 'generic';
      if (v.includes('dog')) return 'dog';
      if (v.includes('cat')) return 'cat';
      if (v.includes('pharm') || v.includes('med') || v.includes('medicine')) return 'pharmacy';
      return 'generic';
    };

    const matches = categories.filter(c => getTypeForCategory(c) === s);
    // If we didn't find any strict matches, show non-generic categories as a helpful fallback
    return matches.length > 0 ? matches : categories.filter(c => getTypeForCategory(c) !== 'generic');
  };

  const loadCategories = async () => {
    try {
      const response = await dataService.getCategories();
      let cats = response?.data || [];

      // If parent provided an allowedCategories array, intersect with the loaded categories
      if (Array.isArray(allowedCategories) && allowedCategories.length > 0) {
        const allowedIds = new Set(allowedCategories.map(c => (c.id || c).toString()));
        cats = cats.filter(c => allowedIds.has((c.id || c).toString()));
      }

      setCategories(cats);
      // Initialize filtered categories with all categories
      setFilteredCategories(cats);
    } catch (error) {
      console.error('Failed to load categories:', error);
      // Fallback categories
      const fallback = [
        { id: 'dog-food', name: 'Dog Food' },
        { id: 'cat-food', name: 'Cat Food' },
        { id: 'dog-treats', name: 'Dog Treats' },
        { id: 'cat-treats', name: 'Cat Treats' },
        { id: 'toys', name: 'Toys' },
        { id: 'accessories', name: 'Accessories' }
      ];

      const finalCats = Array.isArray(allowedCategories) && allowedCategories.length > 0
        ? (() => {
            const allowedIds = new Set(allowedCategories.map(c => (c.id || c).toString()));
            return fallback.filter(c => allowedIds.has(c.id));
          })()
        : fallback;

      setCategories(finalCats);
      // Initialize filtered categories with fallback categories
      setFilteredCategories(finalCats);
    }
  };

  const populateFormFromProduct = (product) => {
    console.log('populateFormFromProduct - Full product data:', product);
    const metadata = typeof product.metadata === 'object' ? product.metadata || {} : {};
    const filters = metadata.filters || {};
    const pharmacy = metadata.pharmacy || {};
    
    // Debug variant sources
    console.log('metadata.variants:', metadata.variants);
    console.log('product.variants:', product.variants);
    
    const existingVariants =
      (Array.isArray(metadata.variants) && metadata.variants.length > 0
        ? metadata.variants
        : product.variants) || [];
    
    console.log('existingVariants selected:', existingVariants);

    const normalizedVariants =
      existingVariants.length > 0
        ? existingVariants.map((variant, idx) => {
            console.log(`Processing variant ${idx}:`, variant);
            
            // Start with defaults
            let unitType = variant?.unitType || '';
            let weight = '';
            let size = '';
            let weightUnit = 'g';
            let sizeUnit = 'cm';
            let label = '';
            
            // Check multiple possible field names for the variant value
            if (variant?.weight) {
              weight = variant.weight.toString();
              if (!unitType) unitType = 'weight';
            } else if (variant?.size) {
              size = variant.size.toString();
              if (!unitType) unitType = 'size';
            } else if (variant?.value) {
              // If value exists, determine if it's weight (numeric) or size (text)
              if (typeof variant.value === 'number' || /^\d+(\.\d+)?$/.test(variant.value)) {
                weight = variant.value.toString();
                if (!unitType) unitType = 'weight';
              } else {
                size = variant.value.toString();
                if (!unitType) unitType = 'size';
              }
            } else if (variant?.amount) {
              weight = variant.amount.toString();
              if (!unitType) unitType = 'weight';
            } else if (variant?.quantity) {
              weight = variant.quantity.toString();
              if (!unitType) unitType = 'weight';
            }
            
            // Handle label for variants without weight/size
            if (variant?.label) {
              label = variant.label.toString();
            }
            
            // Handle unit field mapping for weight
            if (variant?.weightUnit) {
              weightUnit = variant.weightUnit;
            } else if (variant?.unit && unitType === 'weight') {
              weightUnit = variant.unit;
            } else if (variant?.units && unitType === 'weight') {
              weightUnit = variant.units;
            }
            
            // Handle unit field mapping for size
            if (variant?.sizeUnit) {
              sizeUnit = variant.sizeUnit;
            } else if (variant?.unit && unitType === 'size') {
              sizeUnit = variant.unit;
            } else if (variant?.units && unitType === 'size') {
              sizeUnit = variant.units;
            }
            
            const mappedVariant = {
              id: variant?.id || variant?.variantId || `variant-${idx}`,
              weight,
              unitType,
              size,
              weightUnit,
              sizeUnit,
              label,
              price: (variant?.price || variant?.salePrice || '')?.toString() || '',
              originalPrice: (variant?.originalPrice || variant?.regularPrice || variant?.mrp || '')?.toString() || '',
              stock: (variant?.stock || variant?.stockQuantity || variant?.inventory || '')?.toString() || ''
            };
            
            console.log(`Mapped variant ${idx}:`, { original: variant, mapped: mappedVariant });
            
            return mappedVariant;
          })
        : [
            {
              id: 'default',
              weight: product.weight || '',
              unitType: product.weight ? 'weight' : '',
              size: '',
              weightUnit: 'g',
              sizeUnit: 'cm',
              label: '',
              price: product.price?.toString() || '',
              originalPrice: product.originalPrice?.toString() || '',
              stock: product.stockQuantity?.toString() || ''
            }
          ];

    // Ensure features is always an array
    let features = [''];
    if (Array.isArray(metadata.features) && metadata.features.length > 0) {
      features = metadata.features;
    } else if (Array.isArray(product.features) && product.features.length > 0) {
      features = product.features;
    } else if (typeof product.features === 'string' && product.features) {
      // Handle case where features is a string (shouldn't happen but safety check)
      try {
        features = JSON.parse(product.features);
        if (!Array.isArray(features)) features = [product.features];
      } catch {
        features = [product.features];
      }
    } else if (typeof metadata.features === 'string' && metadata.features) {
      // Handle case where metadata.features is a string
      try {
        features = JSON.parse(metadata.features);
        if (!Array.isArray(features)) features = [metadata.features];
      } catch {
        features = [metadata.features];
      }
    }
    // Ensure badges is always an array
    let badges = [''];
    if (Array.isArray(metadata.badges) && metadata.badges.length > 0) {
      badges = metadata.badges;
    } else if (Array.isArray(product.badges) && product.badges.length > 0) {
      badges = product.badges;
    } else if (typeof product.badges === 'string' && product.badges) {
      try {
        badges = JSON.parse(product.badges);
        if (!Array.isArray(badges)) badges = [product.badges];
      } catch {
        badges = [product.badges];
      }
    } else if (typeof metadata.badges === 'string' && metadata.badges) {
      try {
        badges = JSON.parse(metadata.badges);
        if (!Array.isArray(badges)) badges = [metadata.badges];
      } catch {
        badges = [metadata.badges];
      }
    }
    const nutrition = metadata.nutrition || product.nutrition || {
      protein: '',
      fat: '',
      fiber: '',
      moisture: '',
      ash: '',
      calories: ''
    };
    const indications = Array.isArray(pharmacy.indications)
      ? pharmacy.indications.join(', ')
      : Array.isArray(product.indications)
        ? product.indications.join(', ')
        : product.indications || '';
    const contraindications = Array.isArray(pharmacy.contraindications)
      ? pharmacy.contraindications.join(', ')
      : Array.isArray(product.contraindications)
        ? product.contraindications.join(', ')
        : product.contraindications || '';

    setFormData({
      name: product.name || '',
      description: product.description || metadata.description || '',
      shortDescription: product.shortDescription || metadata.shortDescription || '',
      brand: product.brand || metadata.brand || '',
      category: product.category?.id || product.category || '',
      subcategory: product.subcategory?.id || product.subcategory || '',
      subcategoryLabel: metadata.subcategoryLabel || product.subcategoryLabel || product.subcategory || '',

      price: product.price?.toString() || '',
      originalPrice: product.originalPrice?.toString() || '',
      stockQuantity: product.stockQuantity?.toString() || '',
      inStock: product.inStock ?? true,

      features: features.length > 0 ? features : [''],
      ingredients: Array.isArray(product.ingredients?.primary)
        ? product.ingredients.primary.join(', ')
        : product.ingredients || '',
      benefits: Array.isArray(product.benefits) ? product.benefits.join(', ') : product.benefits || '',
      nutrition,

      variants: normalizedVariants,

      badges,
      tags: Array.isArray(metadata.tags || product.tags)
        ? (metadata.tags || product.tags).join(', ')
        : product.tags || '',
      lifeStage: filters.lifeStages?.[0] || product.lifeStage || '',
      breedSize: filters.breedSizes?.[0] || product.breedSize || '',
      productType: filters.productTypes?.[0] || product.productType || '',
      type: product.type || (metadata.type || metadata.petType || ''),
      foodType: product.foodType || metadata.foodType || '',
      specialDiet: filters.specialDiets?.[0] || product.specialDiet || '',
      proteinSource: filters.proteinSource?.[0] || product.proteinSource || '',
      petType: filters.dogCat?.[0] || filters.petTypes?.[0] || metadata.petType || product.petType || 'Dog',
      material: metadata.material || product.material || '',
      scent: metadata.scent || product.scent || '',
      suitableFor: metadata.suitableFor || product.suitableFor || '',
      treatType: metadata.treatType || product.treatType || '',
      texture: metadata.texture || product.texture || '',
      servingSize: metadata.servingSize || product.servingSize || '',
      packCount: metadata.packCount || product.packCount || '',
      weightUnit: metadata.weightUnit || product.weightUnit || 'g',
      flavors: Array.isArray(metadata.flavors) ? metadata.flavors.join(', ') : product.flavors || metadata.flavors || '',
      colors: Array.isArray(metadata.colors) ? metadata.colors.join(', ') : product.colors || metadata.colors || '',
      // Pharmacy fields
      prescriptionRequired: pharmacy.prescriptionRequired ?? product.prescriptionRequired ?? false,
      dosageForm: pharmacy.dosageForm || product.dosageForm || '',
      strength: pharmacy.strength || product.strength || '',
      activeIngredient: pharmacy.activeIngredient || product.activeIngredient || '',
      manufacturer: pharmacy.manufacturer || product.manufacturer || '',
      indications,
      contraindications,
      expiryDate: pharmacy.expiryDate || product.expiryDate || '',

      rating: product.rating?.toString() || '',
      reviewCount: product.reviewCount?.toString() || ''
    });

    // Handle existing images - check multiple sources
    let imagesToLoad = [];
    
    // Check for images array first (stored in metadata or direct property)
    if (metadata.images && Array.isArray(metadata.images) && metadata.images.length > 0) {
      imagesToLoad = metadata.images;
    } else if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      imagesToLoad = product.images;
    } else if (product.imageUrl || product.image) {
      imagesToLoad = [product.imageUrl || product.image];
    }
    
    // Resolve all image URLs and set them
    if (imagesToLoad.length > 0) {
      const resolvedImages = imagesToLoad.map(img => resolveImageUrl(img)).filter(img => img && img !== '/assets/images/no_image.png');
      
      // Remove duplicate images (in case backend has duplicates)
      const uniqueImages = [...new Set(resolvedImages)];
      
      setExistingImages(uniqueImages);
      console.log('EnhancedProductForm: Loaded existing images:', { 
        original: imagesToLoad, 
        resolved: resolvedImages,
        unique: uniqueImages,
        removedDuplicates: resolvedImages.length - uniqueImages.length
      });
    } else {
      setExistingImages([]);
      console.log('EnhancedProductForm: No existing images found for product');
    }
  };

  // Filter categories based on search
  useEffect(() => {
    if (!categorySearch.trim()) {
      setFilteredCategories(categories);
    } else {
      const filtered = categories.filter(cat => {
        const label = (cat && typeof cat === 'object') ? (cat.name || cat.label || cat.slug || String(cat)) : String(cat);
        return label.toLowerCase().includes(categorySearch.toLowerCase());
      });
      setFilteredCategories(filtered);
    }
  }, [categories, categorySearch]);

  // Filter subcategories based on search
  useEffect(() => {
    if (!subcategorySearch.trim()) {
      setFilteredSubcategories(subcategories);
    } else {
      const filtered = subcategories.filter(sub => 
        sub.name.toLowerCase().includes(subcategorySearch.toLowerCase())
      );
      setFilteredSubcategories(filtered);
    }
  }, [subcategories, subcategorySearch]);

  // Load subcategories when type changes
  useEffect(() => {
    const loadSubcats = async () => {
      const selectedType = formData.type;
      if (!selectedType) {
        setSubcategories([]);
        setFilteredSubcategories([]); // Also clear filtered subcategories
        setSubcategorySearch(''); // Clear search when no type selected
        return;
      }

      console.log('EnhancedProductForm: Loading subcategories for type:', selectedType);
      
      // Clear search when type changes
      setSubcategorySearch('');
      
      // Get subcategories based on type from mapping
      const typeSubcats = typeSubcategoryMapping[selectedType] || [];
      console.log(`EnhancedProductForm: Found ${typeSubcats.length} subcategories for type '${selectedType}':`, typeSubcats);
      
      if (typeSubcats.length > 0) {
        setSubcategories(typeSubcats);
        setFilteredSubcategories(typeSubcats); // Initialize filtered subcategories
        console.log('EnhancedProductForm: Loaded subcategories from mapping:', typeSubcats);
        return;
      }

      // Fallback: try to find subcategories from categories if mapping is empty
      const catId = formData.category;
      if (catId) {
        const parent = categories.find(c => (c.id || c).toString() === catId.toString());
        if (parent) {
          const kids = parent.subcategories || parent.children || parent.options || [];
          if (Array.isArray(kids) && kids.length > 0) {
            setSubcategories(kids);
            setFilteredSubcategories(kids); // Initialize filtered subcategories
            return;
          }
        }

        // API fallback
        try {
          const detail = await categoryApi.getById(catId);
          const kids = detail?.subcategories || detail?.children || detail?.options || [];
          const kidsArray = Array.isArray(kids) ? kids : [];
          setSubcategories(kidsArray);
          setFilteredSubcategories(kidsArray); // Initialize filtered subcategories
        } catch (err) {
          console.warn('Failed to load subcategories for', catId, err);
          setSubcategories([]);
          setFilteredSubcategories([]); // Also clear filtered subcategories
        }
      }
    };
    loadSubcats();
  }, [formData.type, formData.category, categories]);

  // Infer subcategory type by matching keywords in subcategory id/name
  const inferSubcategoryType = (subcatIdOrName) => {
    if (!subcatIdOrName) return 'generic';
    const s = subcatIdOrName.toString().toLowerCase();
    if (s.includes('food')) return 'food';
    if (s.includes('groom')) return 'grooming';
    if (s.includes('toy') || s.includes('toys')) return 'toys';
    if (s.includes('bedding')) return 'bedding';
    if (s.includes('treat')) return 'treats';
    if (s.includes('supplement')) return 'supplement';
    if (s.includes('medicine') || s.includes('pharm') || s.includes('prescription')) return 'medicine';
    return 'generic';
  };

  // If this form was opened for a specific section (dogs/cats/pharmacy) and it's a new product,
  // attempt to preselect a reasonable category once categories are loaded.
  useEffect(() => {
    if (!product && defaultSection && categories.length > 0) {
      const section = defaultSection;
      const matched = categories.find(cat => {
        const candidate = ((cat && typeof cat === 'object') ? (cat.id || cat.name || cat.slug) : cat || '').toString().toLowerCase();
        if (section === 'dogs') return candidate.includes('dog');
        if (section === 'cats') return candidate.includes('cat');
        if (section === 'pharmacy') return candidate.includes('pharm') || candidate.includes('med') || candidate.includes('medicine');
        return false;
      });
      if (matched) {
        const matchedId = (matched && typeof matched === 'object') ? (matched.id || matched.slug || matched.name) : matched;
        setFormData(prev => ({ ...prev, category: matchedId }));
      }
    }
  }, [defaultSection, categories, product]);

  useEffect(() => {
    if (product) return;
    if (defaultSection === 'cats') {
      setFormData(prev => ({ ...prev, petType: 'Cat' }));
    } else if (defaultSection === 'dogs') {
      setFormData(prev => ({ ...prev, petType: 'Dog' }));
    }
  }, [defaultSection, product]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else if (name === 'type') {
      // Clear subcategory when type changes
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
        subcategory: '', // Clear subcategory when type changes
        subcategoryLabel: ''
      }));
    } else if (name === 'subcategory') {
      const nextValue = type === 'checkbox' ? checked : value;
      setFormData(prev => ({
        ...prev,
        subcategory: nextValue,
        subcategoryLabel: typeof nextValue === 'string' ? nextValue : prev.subcategoryLabel
      }));
    } else if (name === 'category') {
      const nextValue = type === 'checkbox' ? checked : value;
      setFormData(prev => ({
        ...prev,
        category: nextValue
      }));
      // Update search input for category selection
      if (nextValue) {
        const selected = categories.find(cat => {
          const id = (cat && typeof cat === 'object') ? (cat.id || cat.slug || cat.name) : cat;
          return id?.toString() === nextValue?.toString();
        });
        const label = (selected && typeof selected === 'object') ? (selected.name || selected.label || selected.slug || String(selected)) : String(selected || nextValue);
        setCategorySearch(label);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubcategorySelect = (e) => {
    const { value } = e.target;
    const selected =
      subcategories.find((sc) => (sc.id || sc).toString() === value.toString()) ||
      subcategories.find((sc) => (sc.name || sc).toString() === value.toString());
    const label = selected?.name || selected?.label || value;
    
    // Update form data
    setFormData((prev) => ({
      ...prev,
      subcategory: value,
      subcategoryLabel: label
    }));
    
    // Update search input to show selected value
    if (value) {
      setSubcategorySearch(label);
    }
  };

  const handleArrayFieldChange = (fieldName, index, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayField = (fieldName) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: [...prev[fieldName], '']
    }));
  };

  const removeArrayField = (fieldName, index) => {
    if (formData[fieldName].length > 1) {
      setFormData(prev => ({
        ...prev,
        [fieldName]: prev[fieldName].filter((_, i) => i !== index)
      }));
    }
  };

  const handleVariantChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((variant, i) => 
        i === index ? { ...variant, [field]: value } : variant
      )
    }));
  };

  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, {
        id: Date.now().toString(),
        weight: '',
        unitType: '',
        size: '',
        weightUnit: prev.weightUnit || 'g',
        sizeUnit: 'cm',
        label: '',
        price: '',
        originalPrice: '',
        stock: ''
      }]
    }));
  };

  const removeVariant = (index) => {
    if (formData.variants.length > 1) {
      setFormData(prev => ({
        ...prev,
        variants: prev.variants.filter((_, i) => i !== index)
      }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImages(prev => [...prev, ...files]);
  };

  const removeNewImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const compressImage = (file, maxWidth = 800, maxHeight = 600, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate field lengths
    if (formData.description.length > 10000) {
      setError('Description must be less than 10,000 characters.');
      setLoading(false);
      return;
    }

    if (formData.ingredients.length > 10000) {
      setError('Ingredients must be less than 10,000 characters.');
      setLoading(false);
      return;
    }

    if (formData.benefits.length > 10000) {
      setError('Benefits must be less than 10,000 characters.');
      setLoading(false);
      return;
    }

    try {
      // Prepare product data
      const productData = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        originalPrice: parseFloat(formData.originalPrice) || 0,
        // NOTE: EnhancedProductForm doesn't show a stockQuantity field in the UI.
        // We will reconcile stockQuantity from variants (authoritative) below.
        stockQuantity: parseInt(formData.stockQuantity) || 0,
        rating: parseFloat(formData.rating) || 0,
        reviewCount: parseInt(formData.reviewCount) || 0,
        
        // Process features
        features: formData.features.filter(f => f.trim()),
        
        // Process badges
        badges: formData.badges.filter(b => b.trim()),
        
        // Process tags
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
        
        // Process variants
        variants: formData.variants.map(v => ({
          ...v,
          price: parseFloat(v.price) || 0,
          originalPrice: parseFloat(v.originalPrice) || 0,
          stock: parseInt(v.stock) || 0
        }))
      };

      // If main price is 0 99se first variant's price
      if (productData.price === 0 && productData.variants.length > 0 && productData.variants[0].price > 0) {
        productData.price = productData.variants[0].price;
        if (productData.originalPrice === 0 && productData.variants[0].originalPrice > 0) {
          productData.originalPrice = productData.variants[0].originalPrice;
        }
      }

      if (product?.id) {
        productData.id = product.id;
      }

      // Reconcile stockQuantity + inStock from variants (variants are the source of truth).
      // This prevents inconsistent states like stockQuantity=0 but variant stock > 0.
      const totalVariantStock = Array.isArray(productData.variants)
        ? productData.variants.reduce((sum, v) => sum + (Number.isFinite(v?.stock) ? v.stock : 0), 0)
        : 0;
      if (Array.isArray(productData.variants) && productData.variants.length > 0) {
        productData.stockQuantity = totalVariantStock;
        productData.inStock = totalVariantStock > 0;
      } else {
        productData.inStock = (productData.stockQuantity || 0) > 0;
      }

      const filtersPayload = buildFiltersFromForm({
        ...formData,
        variants: productData.variants
      });

      // Normalize category and subcategory to a textual value (slug/name/id)
      const selectedCategory = categories.find(c => (c.id || c).toString() === `${formData.category}`);
      const normalizedCategory = selectedCategory ? (selectedCategory.slug || selectedCategory.name || selectedCategory.id) : formData.category;
      const selectedSubcat = subcategories.find(sc => (sc.id || sc).toString() === `${formData.subcategory}`) || subcategories.find(sc => (sc.name || sc).toString() === `${formData.subcategory}`);
      const normalizedSubcategory = selectedSubcat ? (selectedSubcat.slug || selectedSubcat.name || selectedSubcat.id) : formData.subcategory;

      // Ensure pet type and subcategory are present in filters for server-side matching
      if (formData.petType) {
        if (!filtersPayload.dogCat) filtersPayload.dogCat = [];
        if (!filtersPayload.petTypes) filtersPayload.petTypes = [];
        if (!filtersPayload.dogCat.includes(formData.petType)) filtersPayload.dogCat.push(formData.petType);
        if (!filtersPayload.petTypes.includes(formData.petType)) filtersPayload.petTypes.push(formData.petType);
      }
      if (formData.subcategoryLabel || normalizedSubcategory) {
        if (!filtersPayload.subCategories) filtersPayload.subCategories = [];
        const subLabel = formData.subcategoryLabel || normalizedSubcategory;
        if (!filtersPayload.subCategories.includes(subLabel)) filtersPayload.subCategories.push(subLabel);
      }

      const indications = formData.indications.split(',').map(s => s.trim()).filter(s => s);
      const contraindications = formData.contraindications.split(',').map(s => s.trim()).filter(s => s);

      const baseMetadata = (productData.metadata && typeof productData.metadata === 'object') ? productData.metadata : {};

      // attach normalized category/subcategory and metadata
      productData.category = normalizedCategory || productData.category;
      productData.subcategory = normalizedSubcategory || productData.subcategory;
      // ensure top-level type is set for DB column
      productData.type = formData.type || productData.type || '';

      productData.metadata = {
        ...baseMetadata,
        filters: filtersPayload,
        features: productData.features,
        badges: productData.badges,
        tags: productData.tags,
        variants: productData.variants,
        nutrition: productData.nutrition,
        petType: formData.petType,
        material: formData.material,
        scent: formData.scent,
        suitableFor: formData.suitableFor,
        treatType: formData.treatType,
        texture: formData.texture,
        subcategoryLabel: formData.subcategoryLabel || normalizedSubcategory || '',
        servingSize: formData.servingSize,
        packCount: formData.packCount,
        weightUnit: formData.weightUnit,
        flavors: formData.flavors ? formData.flavors.split(',').map(s => s.trim()).filter(s => s) : [],
        colors: formData.colors ? formData.colors.split(',').map(s => s.trim()).filter(s => s) : [],
        pharmacy: {
          prescriptionRequired: !!formData.prescriptionRequired,
          dosageForm: formData.dosageForm,
          strength: formData.strength,
          activeIngredient: formData.activeIngredient,
          manufacturer: formData.manufacturer,
          indications,
          contraindications,
          expiryDate: formData.expiryDate
        }
      };

      // Prune empty metadata so DB doesn't get lots of "" / [] / {} noise.
      // Keep existing baseMetadata values if they were meaningful.
      const pruned = pruneEmptyDeep(productData.metadata);
      productData.metadata = pruned || {};

      // Build final payload. We keep variants only inside metadata to avoid any
      // JSON key ordering pitfalls during backend binding (metadata vs variants).
      const productPayload = { ...productData };
      delete productPayload.variants;

      // Always use FormData for create/update so backend receives multipart/form-data
      const form = new FormData();
      
      // Include existing images in metadata so they are preserved
      if (existingImages.length > 0) {
        productPayload.metadata = productPayload.metadata || {};
        productPayload.metadata.images = existingImages;
        // Also set the primary imageUrl to the first existing image if no new images
        if (images.length === 0 && existingImages.length > 0) {
          productPayload.imageUrl = existingImages[0];
        }
      }
      
      form.append('product', new Blob([JSON.stringify(productPayload)], { type: 'application/json' }));
      for (let i = 0; i < images.length; i++) {
        const compressedImage = await compressImage(images[i]);
        form.append('images', compressedImage);
      }

      if (product?.id) {
        // Update with form (works with and without images)
        await dataService.updateProductWithImage(product.id, form);
      } else {
        // Create new product
        await dataService.addProduct(form, true);
      }

      onSave();
    } catch (err) {
      console.error('Error saving product:', err);
      setError(err.message || 'Failed to save product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'details', label: 'Product Details' },
    { id: 'variants', label: 'Variants & Pricing' },
    { id: 'images', label: 'Images' },
    { id: 'metadata', label: 'Categories & Tags' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-heading font-bold text-foreground">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 120px)' }}>
          <div className="p-6 space-y-6">
            
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Product Name *
                    </label>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Enter product name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Brand *
                    </label>
                    <Input
                      name="brand"
                      value={formData.brand}
                      onChange={handleChange}
                      required
                      placeholder="Enter brand name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Veg/Non-Veg *</label>
                    <select
                      name="foodType"
                      value={formData.foodType}
                      onChange={handleChange}
                      required
                      className="w-full h-10 px-3 rounded-md border border-border bg-background text-foreground"
                    >
                      <option value="">Select</option>
                      <option value="VEG">Veg</option>
                      <option value="NON_VEG">Non-Veg</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Short Description *
                  </label>
                  <Input
                    name="shortDescription"
                    value={formData.shortDescription}
                    onChange={handleChange}
                    required
                    placeholder="Brief product description (appears in product cards)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Full Description * ({formData.description.length}/10000 characters)
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={5}
                    maxLength={10000}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                    placeholder="Detailed product description"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Price *
                    </label>
                    <Input
                      name="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      placeholder="0.00"
                    />
                  </div> */}

                  {/* <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Original Price
                    </label>
                    <Input
                      name="originalPrice"
                      type="number"
                      step="0.01"
                      value={formData.originalPrice}
                      onChange={handleChange}
                      placeholder="0.00"
                    />
                  </div> */}

                  {/* <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Stock Quantity *
                    </label>
                    <Input
                      name="stockQuantity"
                      type="number"
                      value={formData.stockQuantity}
                      onChange={handleChange}
                      required
                      placeholder="0"
                    />
                  </div> */}
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="inStock"
                    checked={formData.inStock}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary border-border rounded"
                  />
                  <label className="text-sm font-medium text-foreground">
                    In Stock
                  </label>
                </div>
              </div>
            )}

            {/* Product Details Tab */}
            {activeTab === 'details' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Key Features
                  </label>
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <Input
                        value={feature}
                        onChange={(e) => handleArrayFieldChange('features', index, e.target.value)}
                        placeholder="Enter a key feature"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeArrayField('features', index)}
                        disabled={formData.features.length === 1}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayField('features')}
                  >
                    <Plus size={16} className="mr-1" />
                    Add Feature
                  </Button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Ingredients (comma-separated) ({formData.ingredients.length}/10000 characters)
                  </label>
                  <textarea
                    name="ingredients"
                    value={formData.ingredients}
                    onChange={handleChange}
                    rows={3}
                    maxLength={10000}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                    placeholder="Chicken, Rice, Vegetables, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Benefits (comma-separated) ({formData.benefits.length}/10000 characters)
                  </label>
                  <textarea
                    name="benefits"
                    value={formData.benefits}
                    onChange={handleChange}
                    rows={3}
                    maxLength={10000}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                    placeholder="High protein, Supports digestive health, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Nutrition Information
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Protein %</label>
                      <Input
                        name="nutrition.protein"
                        value={formData.nutrition.protein}
                        onChange={handleChange}
                        placeholder="25"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Fat %</label>
                      <Input
                        name="nutrition.fat"
                        value={formData.nutrition.fat}
                        onChange={handleChange}
                        placeholder="15"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Fiber %</label>
                      <Input
                        name="nutrition.fiber"
                        value={formData.nutrition.fiber}
                        onChange={handleChange}
                        placeholder="4"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Moisture %</label>
                      <Input
                        name="nutrition.moisture"
                        value={formData.nutrition.moisture}
                        onChange={handleChange}
                        placeholder="10"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Ash %</label>
                      <Input
                        name="nutrition.ash"
                        value={formData.nutrition.ash}
                        onChange={handleChange}
                        placeholder="8"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Calories/kg</label>
                      <Input
                        name="nutrition.calories"
                        value={formData.nutrition.calories}
                        onChange={handleChange}
                        placeholder="3500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Variants Tab */}
            {activeTab === 'variants' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Product Variants</h3>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addVariant}
                  >
                    <Plus size={16} className="mr-1" />
                    Add Variant
                  </Button>
                </div>

                {formData.variants.map((variant, index) => (
                  <div key={variant.id} className="border border-border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium">Variant {index + 1}</h4>
                      {formData.variants.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeVariant(index)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Type</label>
                        <select
                          value={variant.unitType || 'weight'}
                          onChange={(e) => handleVariantChange(index, 'unitType', e.target.value)}
                          className="w-full h-10 px-3 rounded-md border border-border bg-background text-foreground"
                        >
                          <option value="">No Unit (Optional)</option>
                          <option value="weight">Weight</option>
                          <option value="size">Size</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                          Value {!variant.unitType && <span className="text-xs text-muted-foreground">(Optional)</span>}
                        </label>
                        {variant.unitType === 'size' ? (
                          <div className="flex gap-2">
                            <Input
                              value={variant.size}
                              onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                              placeholder="10"
                            />
                            <select
                              value={variant.sizeUnit || 'cm'}
                              onChange={(e) => handleVariantChange(index, 'sizeUnit', e.target.value)}
                              className="h-10 px-2 rounded-md border border-border bg-background text-foreground"
                            >
                              <option value="mm">mm</option>
                              <option value="cm">cm</option>
                              <option value="m">m</option>
                              <option value="inch">inch</option>
                              <option value="ft">ft</option>
                            </select>
                          </div>
                        ) : variant.unitType === 'weight' ? (
                          <div className="flex gap-2">
                            <Input
                              value={variant.weight}
                              onChange={(e) => handleVariantChange(index, 'weight', e.target.value)}
                              placeholder="500"
                            />
                            <select
                              value={variant.weightUnit || formData.weightUnit || 'g'}
                              onChange={(e) => handleVariantChange(index, 'weightUnit', e.target.value)}
                              className="h-10 px-2 rounded-md border border-border bg-background text-foreground"
                            >
                              <option value="g">g</option>
                              <option value="kg">kg</option>
                              <option value="ml">ml</option>
                              <option value="l">l</option>
                              <option value="oz">oz</option>
                              <option value="lb">lb</option>
                            </select>
                          </div>
                        ) : (
                          <Input
                            value={variant.label || ''}
                            onChange={(e) => handleVariantChange(index, 'label', e.target.value)}
                            placeholder="e.g., Standard, Premium"
                          />
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                          Price
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          value={variant.price}
                          onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                          Original Price
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          value={variant.originalPrice}
                          onChange={(e) => handleVariantChange(index, 'originalPrice', e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                          Stock
                        </label>
                        <Input
                          type="number"
                          value={variant.stock}
                          onChange={(e) => handleVariantChange(index, 'stock', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Images Tab */}
            {activeTab === 'images' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Product Images
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  />
                </div>

                {/* Existing Images */}
                {existingImages.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-2">Current Images</h4>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                      {existingImages.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image}
                            alt={`Current ${index + 1}`}
                            className="w-full h-20 object-cover rounded border"
                            onError={(e) => { 
                              console.error('Failed to load existing image:', image);
                              e.currentTarget.src = '/assets/images/no_image.png'; 
                            }}
                            onLoad={() => console.log('Successfully loaded existing image:', image)}
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Images */}
                {images.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-2">New Images</h4>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                      {images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`New ${index + 1}`}
                            className="w-full h-20 object-cover rounded border"
                          />
                          <button
                            type="button"
                            onClick={() => removeNewImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Metadata Tab */}
            {activeTab === 'metadata' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1"> Type</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full h-10 px-3 rounded-md border border-border bg-background text-foreground mb-3"
                    >
                      <option value="">Select Type</option>
                      <option value="Dog">Dog</option>
                      <option value="Cat">Cat</option>
                      <option value="Pharmacy">Pharmacy</option>
                      <option value="Outlet">Outlet</option>
                    </select>

                    <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                    <div className="bg-gray-50 p-4 rounded-lg border space-y-3">
                      {/* Search Input */}
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <Input
                          type="text"
                          placeholder={formData.category ? "Selected category" : "Search categories..."}
                          value={formData.category ? (() => {
                            const selected = categories.find(cat => {
                              const id = (cat && typeof cat === 'object') ? (cat.id || cat.slug || cat.name) : cat;
                              return id?.toString() === formData.category?.toString();
                            });
                            return (selected && typeof selected === 'object') ? (selected.name || selected.label || selected.slug || String(selected)) : String(selected || formData.category);
                          })() : categorySearch}
                          onChange={(e) => {
                            const searchValue = e.target.value;
                            setCategorySearch(searchValue);
                            // Clear selection if user starts typing a new search
                            if (formData.category) {
                              const currentLabel = (() => {
                                const selected = categories.find(cat => {
                                  const id = (cat && typeof cat === 'object') ? (cat.id || cat.slug || cat.name) : cat;
                                  return id?.toString() === formData.category?.toString();
                                });
                                return (selected && typeof selected === 'object') ? (selected.name || selected.label || selected.slug || String(selected)) : String(selected || formData.category);
                              })();
                              if (searchValue !== currentLabel) {
                                setFormData(prev => ({ ...prev, category: '' }));
                              }
                            }
                          }}
                          className="pl-10 w-full bg-white shadow-sm border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                        {formData.category && (
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, category: '' }));
                              setCategorySearch('');
                            }}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                      
                      {/* Results Summary */}
                      <div className="flex justify-between items-center text-sm">
                        {categorySearch ? (
                          <span className="text-blue-600 font-medium">
                            {filteredCategories.length} results for "{categorySearch}"
                          </span>
                        ) : (
                          <span className="text-gray-500">{categories.length} categories available</span>
                        )}
                        {categorySearch && (
                          <button 
                            onClick={() => setCategorySearch('')}
                            className="text-gray-400 hover:text-gray-600 text-xs underline"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      
                      {/* Dropdown - only show when searching and no item selected */}
                      {(!formData.category && filteredCategories.length > 0) && (
                        <select
                          name="category"
                          value={""}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          size={Math.max(3, Math.min(filteredCategories.length + 1, 10))}
                        >
                          <option value="">Choose a category...</option>
                          {filteredCategories.map((category, idx) => {
                            const id = (category && typeof category === 'object') ? (category.id || category.slug || category.name) : category || `cat-${idx}`;
                            const label = (category && typeof category === 'object') ? (category.name || category.label || category.slug || String(category)) : String(category);
                            return (
                              <option 
                                key={id} 
                                value={id}
                              >
                                {label}
                              </option>
                            );
                          })}
                        </select>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Subcategory {!formData.type && <span className="text-sm font-normal text-gray-400">(Select Type first)</span>}
                    </label>
                    {formData.type && subcategories && subcategories.length > 0 ? (
                      <div className="bg-gray-50 p-4 rounded-lg border space-y-3">
                        {/* Search Input */}
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>
                          <Input
                            type="text"
                            placeholder={formData.subcategory ? "Selected subcategory" : "Search subcategories..."}
                            value={formData.subcategory ? (formData.subcategoryLabel || formData.subcategory) : subcategorySearch}
                            onChange={(e) => {
                              const searchValue = e.target.value;
                              setSubcategorySearch(searchValue);
                              // Clear selection if user starts typing a new search
                              if (formData.subcategory && searchValue !== (formData.subcategoryLabel || formData.subcategory)) {
                                setFormData(prev => ({ ...prev, subcategory: '', subcategoryLabel: '' }));
                              }
                            }}
                            className="pl-10 w-full bg-white shadow-sm border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500"
                          />
                          {formData.subcategory && (
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, subcategory: '', subcategoryLabel: '' }));
                                setSubcategorySearch('');
                              }}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                        
                        {/* Results Summary */}
                        <div className="flex justify-between items-center text-sm">
                          {subcategorySearch ? (
                            <span className="text-green-600 font-medium">
                              {filteredSubcategories.length} results for "{subcategorySearch}"
                            </span>
                          ) : (
                            <span className="text-gray-500">{subcategories.length} subcategories available</span>
                          )}
                          {subcategorySearch && (
                            <button 
                              onClick={() => setSubcategorySearch('')}
                              className="text-gray-400 hover:text-gray-600 text-xs underline"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                        
                        {/* Dropdown - only show when searching and no item selected */}
                        {(!formData.subcategory && filteredSubcategories.length > 0) && (
                          <select
                            name="subcategory"
                            value={""}
                            onChange={handleSubcategorySelect}
                            className="w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            size={Math.max(3, Math.min(filteredSubcategories.length + 1, 10))}
                          >
                            <option value="">Choose a subcategory...</option>
                            {filteredSubcategories.map((sub, idx) => {
                              const id = (sub && typeof sub === 'object') ? (sub.id || sub.slug || sub.name) : sub || `sub-${idx}`;
                              const label = (sub && typeof sub === 'object') ? (sub.name || sub.label || String(sub)) : String(sub);
                              return (
                                <option 
                                  key={id} 
                                  value={id}
                                >
                                  {label}
                                </option>
                              );
                            })}
                          </select>
                        )}
                      </div>
                    ) : !formData.type ? (
                      <div className="w-full h-12 px-4 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-gray-500 flex items-center justify-center">
                        <span className="text-sm">Please select a Type first to see subcategories</span>
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-4 rounded-lg border">
                        <Input 
                          name="subcategory" 
                          value={formData.subcategory} 
                          onChange={handleChange} 
                          placeholder="Enter custom subcategory" 
                          className="w-full bg-white shadow-sm border-gray-300 focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Dynamic filters per category type */}
                {(() => {
                  // Resolve the selected category object (the select stores an id/slug)
                  const selectedCategory = categories.find(c => {
                    if (!c) return false;
                    const key = (c && typeof c === 'object') ? (c.id || c.slug || c.name) : c;
                    return key != null && key.toString() === `${formData.category}`;
                  });
                  // Use a human-friendly label (name/label/slug) for type inference
                  const selectedCategoryLabel = selectedCategory ? (selectedCategory.name || selectedCategory.label || selectedCategory.slug || selectedCategory.id) : (formData.category || '');
                  const type = inferCategoryType(selectedCategoryLabel || '');
                  // Derive subtype from the selected CATEGORY label (not numeric id)
                  const categorySubType = inferSubcategoryType(selectedCategoryLabel || '') || 'generic';
                  
                  const sections = [];

                  // Pet-specific filters for dog/cat categories
                  if (type === 'dog' || type === 'cat') {
                    sections.push(
                      <div key="pet-specific" className="space-y-4">
                        <h4 className="text-sm font-medium text-foreground">Pet-specific Filters</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Life Stage</label>
                            <select
                              name="lifeStage"
                              value={formData.lifeStage}
                              onChange={handleChange}
                              className="w-full h-10 px-3 rounded-md border border-border bg-background text-foreground"
                            >
                              <option value="">Select Life Stage</option>
                              {lifeStageOptions.map(option => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Breed Size</label>
                            <select
                              name="breedSize"
                              value={formData.breedSize}
                              onChange={handleChange}
                              className="w-full h-10 px-3 rounded-md border border-border bg-background text-foreground"
                            >
                              <option value="">Select Breed Size</option>
                              {breedSizeOptions.map(option => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Protein Source</label>
                            <select
                              name="proteinSource"
                              value={formData.proteinSource}
                              onChange={handleChange}
                              className="w-full h-10 px-3 rounded-md border border-border bg-background text-foreground"
                            >
                              <option value="">Select Protein Source</option>
                              {proteinSourceOptions.map(option => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Special Diet</label>
                            <select
                              name="specialDiet"
                              value={formData.specialDiet}
                              onChange={handleChange}
                              className="w-full h-10 px-3 rounded-md border border-border bg-background text-foreground"
                            >
                              <option value="">Select Special Diet</option>
                              {specialDietOptions.map(option => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">Colors (comma-separated)</label>
                          <Input name="colors" value={formData.colors} onChange={handleChange} placeholder="Brown, Black, White" />
                        </div>
                      </div>
                    );
                  }

                  // Pharmacy-specific filters
                  if (type === 'pharmacy') {
                    sections.push(
                      <div key="pharmacy-specific" className="space-y-4">
                        <h4 className="text-sm font-medium text-foreground">Pharmacy / Medicine Filters</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Prescription Required</label>
                            <input type="checkbox" name="prescriptionRequired" checked={!!formData.prescriptionRequired} onChange={handleChange} className="w-4 h-4" />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Dosage Form</label>
                            <Input name="dosageForm" value={formData.dosageForm} onChange={handleChange} placeholder="Tablet / Syrup / Ointment" />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Strength</label>
                            <Input name="strength" value={formData.strength} onChange={handleChange} placeholder="500mg" />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Active Ingredient</label>
                            <Input name="activeIngredient" value={formData.activeIngredient} onChange={handleChange} placeholder="Paracetamol" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">Manufacturer</label>
                          <Input name="manufacturer" value={formData.manufacturer} onChange={handleChange} placeholder="Manufacturer name" />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">Indications (comma-separated)</label>
                          <Input name="indications" value={formData.indications} onChange={handleChange} placeholder="Fever, Pain" />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">Contraindications (comma-separated)</label>
                          <Input name="contraindications" value={formData.contraindications} onChange={handleChange} placeholder="Pregnancy, Allergy" />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">Expiry Date</label>
                          <Input name="expiryDate" type="date" value={formData.expiryDate} onChange={handleChange} />
                        </div>
                      </div>
                    );
                  }

                  // Category subtype-specific filters
                  if (categorySubType && categorySubType !== 'generic') {
                    if (categorySubType === 'food') {
                      sections.push(
                        <div key="food-specific" className="space-y-4">
                          <h4 className="text-sm font-medium text-foreground">Food-specific Filters</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-foreground mb-1">Serving Size</label>
                              <Input name="servingSize" value={formData.servingSize} onChange={handleChange} placeholder="e.g., 50g per serving" />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-foreground mb-1">Pack Count</label>
                              <Input name="packCount" value={formData.packCount} onChange={handleChange} placeholder="e.g., 12" />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-foreground mb-1">Weight Unit</label>
                              <select name="weightUnit" value={formData.weightUnit} onChange={handleChange} className="w-full h-10 px-3 rounded-md border border-border bg-background text-foreground">
                                <option value="g">g</option>
                                <option value="kg">kg</option>
                                <option value="oz">oz</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-foreground mb-1">Flavors (comma-separated)</label>
                              <Input name="flavors" value={formData.flavors} onChange={handleChange} placeholder="Chicken, Lamb, Fish" />
                            </div>
                          </div>
                        </div>
                      );
                    }

                    if (categorySubType === 'grooming') {
                      sections.push(
                        <div key="grooming-specific" className="space-y-4">
                          <h4 className="text-sm font-medium text-foreground">Grooming / Care Filters</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-foreground mb-1">Material / Base</label>
                              <Input name="material" value={formData.material} onChange={handleChange} placeholder="e.g., Natural oils, Clay" />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-foreground mb-1">Scent / Fragrance</label>
                              <Input name="scent" value={formData.scent} onChange={handleChange} placeholder="e.g., Lavender, Unscented" />
                            </div>
                          </div>
                        </div>
                      );
                    }

                    if (categorySubType === 'toys') {
                      sections.push(
                        <div key="toys-specific" className="space-y-4">
                          <h4 className="text-sm font-medium text-foreground">Toy-specific Filters</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-foreground mb-1">Material</label>
                              <Input name="material" value={formData.material} onChange={handleChange} placeholder="Rubber, Plush, Rope" />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-foreground mb-1">Suitable For</label>
                              <Input name="suitableFor" value={formData.suitableFor} onChange={handleChange} placeholder="Puppy, Adult, Chewers" />
                            </div>
                          </div>
                        </div>
                      );
                    }

                    if (categorySubType === 'bedding') {
                      sections.push(
                        <div key="bedding-specific" className="space-y-4">
                          <h4 className="text-sm font-medium text-foreground">Bedding Filters</h4>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Material</label>
                            <Input name="material" value={formData.material} onChange={handleChange} placeholder="Cotton, Memory Foam" />
                          </div>
                        </div>
                      );
                    }

                    if (categorySubType === 'treats') {
                      sections.push(
                        <div key="treats-specific" className="space-y-4">
                          <h4 className="text-sm font-medium text-foreground">Treats-specific Filters</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-foreground mb-1">Treat Type</label>
                              <Input name="treatType" value={formData.treatType} onChange={handleChange} placeholder="Training, Dental, Reward" />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-foreground mb-1">Texture</label>
                              <Input name="texture" value={formData.texture} onChange={handleChange} placeholder="Soft, Crunchy, Chewy" />
                            </div>
                          </div>
                        </div>
                      );
                    }

                    if (categorySubType === 'supplement') {
                      sections.push(
                        <div key="supplement-specific" className="space-y-4">
                          <h4 className="text-sm font-medium text-foreground">Supplement Filters</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-foreground mb-1">Active Ingredient</label>
                              <Input name="activeIngredient" value={formData.activeIngredient} onChange={handleChange} placeholder="Glucosamine" />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-foreground mb-1">Manufacturer</label>
                              <Input name="manufacturer" value={formData.manufacturer} onChange={handleChange} placeholder="Manufacturer" />
                            </div>
                          </div>
                        </div>
                      );
                    }

                    if (categorySubType === 'medicine') {
                      sections.push(
                        <div key="medicine-specific" className="space-y-4">
                          <h4 className="text-sm font-medium text-foreground">Medicine Filters</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-foreground mb-1">Active Ingredient</label>
                              <Input name="activeIngredient" value={formData.activeIngredient} onChange={handleChange} placeholder="Medicine ingredient" />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-foreground mb-1">Dosage Form</label>
                              <Input name="dosageForm" value={formData.dosageForm} onChange={handleChange} placeholder="Tablet, Liquid, Injection" />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Prescription Required</label>
                            <input type="checkbox" name="prescriptionRequired" checked={!!formData.prescriptionRequired} onChange={handleChange} className="w-4 h-4" />
                          </div>
                        </div>
                      );
                    }
                  }

                  return sections.length > 0 ? <>{sections}</> : null;
                })()}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Life Stage
                    </label>
                    <select
                      name="lifeStage"
                      value={formData.lifeStage}
                      onChange={handleChange}
                      className="w-full h-10 px-3 rounded-md border border-border bg-background text-foreground"
                    >
                      <option value="">Select Life Stage</option>
                      {lifeStageOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div> */}

                  {/* <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Breed Size
                    </label>
                    <select
                      name="breedSize"
                      value={formData.breedSize}
                      onChange={handleChange}
                      className="w-full h-10 px-3 rounded-md border border-border bg-background text-foreground"
                    >
                      <option value="">Select Breed Size</option>
                      {breedSizeOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div> */}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Product Type
                    </label>
                    <select
                      name="productType"
                      value={formData.productType}
                      onChange={handleChange}
                      className="w-full h-10 px-3 rounded-md border border-border bg-background text-foreground"
                    >
                      <option value="">Select Product Type</option>
                      {productTypeOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div> */}

                  {/* <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Special Diet
                    </label>
                    <select
                      name="specialDiet"
                      value={formData.specialDiet}
                      onChange={handleChange}
                      className="w-full h-10 px-3 rounded-md border border-border bg-background text-foreground"
                    >
                      <option value="">Select Special Diet</option>
                      {specialDietOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div> */}
                </div>

                {/* <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Protein Source
                  </label>
                  <select
                    name="proteinSource"
                    value={formData.proteinSource}
                    onChange={handleChange}
                    className="w-full h-10 px-3 rounded-md border border-border bg-background text-foreground"
                  >
                    <option value="">Select Protein Source</option>
                    {proteinSourceOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div> */}


                

              
              </div>
            )}

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 p-6 border-t border-border">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Product'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnhancedProductForm;