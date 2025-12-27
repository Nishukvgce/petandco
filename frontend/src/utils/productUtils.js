// Product filtering and normalization utilities

const ensureArray = (value) => {
  if (value === null || value === undefined) return [];
  if (Array.isArray(value)) {
    return value.filter((item) => item !== null && item !== undefined && `${item}`.trim() !== '');
  }
  const normalized = `${value}`.trim();
  return normalized ? [normalized] : [];
};

const safeJsonParse = (maybeJson) => {
  if (!maybeJson) return {};
  if (typeof maybeJson === 'object') return { ...maybeJson };
  try {
    return JSON.parse(maybeJson);
  } catch (error) {
    console.warn('productUtils: Failed to parse metadata JSON', error);
    return {};
  }
};

// Parameter normalization functions for consistent frontend-backend communication
export const normalizeUrlParameter = (param) => {
  if (!param) return null;
  
  try {
    // Decode URL parameters and normalize
    const decoded = decodeURIComponent(param.replace(/\+/g, ' ')).trim();
    return normalizeParameterValue(decoded);
  } catch (error) {
    console.warn('productUtils: Failed to decode parameter', param, error);
    return normalizeParameterValue(param.trim());
  }
};

export const normalizeParameterValue = (value) => {
  if (!value || typeof value !== 'string') return null;
  
  const normalized = value.toLowerCase().trim();
  
  // Type normalization
  const typeMapping = {
    'dog': 'Dog',
    'dogs': 'Dog',
    'canine': 'Dog',
    'cat': 'Cat', 
    'cats': 'Cat',
    'feline': 'Cat',
    'pharmacy': 'Pharmacy',
    'medicine': 'Pharmacy',
    'medical': 'Pharmacy',
    'outlet': 'Outlet',
    'clearance': 'Outlet'
  };
  
  if (typeMapping[normalized]) return typeMapping[normalized];
  
  // Category normalization
  const categoryMapping = {
    'dog-food': 'Dog Food',
    'dogfood': 'Dog Food',
    'food': 'Dog Food', // Default to Dog Food in dog context
    'cat-food': 'Cat Food',
    'catfood': 'Cat Food',
    'dog-treats': 'Dog Treats',
    'dogtreats': 'Dog Treats',
    'treats': 'Dog Treats', // Default to Dog Treats in dog context
    'cat-treats': 'Cat Treats',
    'cattreats': 'Cat Treats',
    'dog-toys': 'Dog Toys',
    'dogtoys': 'Dog Toys',
    'toys': 'Dog Toys', // Default to Dog Toys in dog context
    'cat-toys': 'Cat Toys',
    'cattoys': 'Cat Toys',
    'dog-grooming': 'Dog Grooming',
    'doggrooming': 'Dog Grooming',
    'grooming': 'Dog Grooming', // Default to Dog Grooming in dog context
    'cat-grooming': 'Cat Grooming',
    'catgrooming': 'Cat Grooming'
  };
  
  if (categoryMapping[normalized]) return categoryMapping[normalized];
  
  // Subcategory normalization
  const subcategoryMapping = {
    'dry': 'Dry Food',
    'dry-food': 'Dry Food',
    'wet': 'Wet Food',
    'wet-food': 'Wet Food', 
    'grain-free': 'Grain Free',
    'grainfree': 'Grain Free',
    'puppy': 'Puppy Food',
    'puppy-food': 'Puppy Food',
    'kitten': 'Kitten Food',
    'kitten-food': 'Kitten Food',
    'hypoallergenic': 'Hypoallergenic',
    'hypo': 'Hypoallergenic',
    'veterinary': 'Veterinary Food',
    'vet': 'Veterinary Food',
    'veterinary-food': 'Veterinary Food',
    'chicken-free': 'Chicken Free',
    'chickenfree': 'Chicken Free'
  };
  
  if (subcategoryMapping[normalized]) return subcategoryMapping[normalized];
  
  // Return title case for unknown values
  return toTitleCase(value);
};

export const toTitleCase = (input) => {
  if (!input || typeof input !== 'string') return input;
  
  return input
    .split(/[\s-_]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Enhanced parameter building for API calls
export const buildApiParameters = (urlParams = {}, context = 'dog') => {
  const params = {};
  
  // Extract and normalize parameters
  const type = urlParams.type || urlParams.petType;
  const category = urlParams.category;
  const sub = urlParams.sub || urlParams.subcategory;
  
  // Set type parameter
  if (type) {
    params.type = normalizeParameterValue(type);
  } else {
    // Default type based on context
    params.type = context === 'cat' ? 'Cat' : 'Dog';
  }
  
  // Set category parameter
  if (category) {
    params.category = normalizeParameterValue(category);
  }
  
  // Set subcategory parameter
  if (sub) {
    params.sub = normalizeParameterValue(sub);
  }
  
  return params;
};

// URL parameter extraction utilities
export const getCleanUrlParams = (searchParams) => {
  const params = {};
  
  for (const [key, value] of searchParams) {
    if (value && value.trim()) {
      params[key] = normalizeUrlParameter(value);
    }
  }
  
  return params;
};

const PRICE_BUCKETS = [
  { min: 0, max: 300, label: 'INR 10 - INR 300' },
  { min: 301, max: 500, label: 'INR 301 - INR 500' },
  { min: 501, max: 1000, label: 'INR 501 - INR 1000' },
  { min: 1001, max: 2000, label: 'INR 1000 - INR 2000' },
  { min: 2001, max: Number.POSITIVE_INFINITY, label: 'INR 2000+' }
];

export const derivePriceRangeLabel = (price) => {
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  if (Number.isNaN(numericPrice) || numericPrice === null || numericPrice === undefined) return '';
  const bucket = PRICE_BUCKETS.find((range) => numericPrice >= range.min && numericPrice <= range.max);
  return bucket ? bucket.label : '';
};

export const buildFiltersFromForm = (formData = {}) => {
  const filters = {};
  const addValue = (key, value) => {
    const arr = ensureArray(value);
    if (arr.length) {
      filters[key] = arr;
    }
  };

  addValue('brands', formData.brand);
  addValue('lifeStages', formData.lifeStage);
  addValue('breedSizes', formData.breedSize);
  addValue('productTypes', formData.productType);
  addValue('specialDiets', formData.specialDiet);
  addValue('proteinSource', formData.proteinSource);
  addValue('dogCat', formData.petType || formData.petCategory);
  addValue('petTypes', formData.petType || formData.petCategory);
  addValue('materials', formData.material);
  addValue('suitableFor', formData.suitableFor);
  addValue('sizes', formData.size);
  addValue('colors', formData.colors);
  addValue('subCategories', formData.subcategoryLabel || formData.subcategory);

  // Collect sizes from variants when variants use size as unitType
  if (Array.isArray(formData.variants) && formData.variants.length) {
    const variantSizes = formData.variants
      .map((variant) => variant?.size)
      .filter((s) => s && `${s}`.trim() !== '');
    if (variantSizes.length) addValue('sizes', variantSizes);
  }

  if (Array.isArray(formData.variants) && formData.variants.length) {
    addValue(
      'weights',
      formData.variants
        .map((variant) => variant?.weight)
        .filter((weight) => weight && `${weight}`.trim() !== '')
    );
  } else {
    addValue('weights', formData.weight);
  }

  // Get price for price range calculation
  let priceForRange = formData.price;
  
  // If main price is 0, null, undefined, or empty, use first variant's price
  if (!priceForRange || priceForRange <= 0) {
    if (Array.isArray(formData.variants) && formData.variants.length > 0 && formData.variants[0].price) {
      priceForRange = formData.variants[0].price;
    }
  }

  const priceBucket = derivePriceRangeLabel(priceForRange);
  if (priceBucket) {
    addValue('priceRanges', priceBucket);
  }

  return filters;
};

export const normalizeProductFromApi = (product = {}) => {
  const metadata = safeJsonParse(product.metadata);
  const rawFilters = metadata.filters || metadata.filterAttributes || {};
  const normalizedFilters = Object.entries(rawFilters).reduce((acc, [key, value]) => {
    acc[key] = ensureArray(value);
    return acc;
  }, {});

  const variants = ensureArray(metadata.variants || product.variants).map((variant, idx) => ({
    id: variant?.id || `variant-${idx}`,
    weight: variant?.weight || '',
    unitType: variant?.unitType || variant?.size ? 'size' : 'weight',
    size: variant?.size || '',
    weightUnit: variant?.weightUnit || '',
    price: variant?.price ?? '',
    originalPrice: variant?.originalPrice ?? '',
    stock: variant?.stock ?? ''
  }));

  // Parse main product price
  let price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
  let originalPrice = typeof product.originalPrice === 'string' ? parseFloat(product.originalPrice) : product.originalPrice;
  
  // If main product price is 0, null, undefined, or NaN, use first variant's price
  if (!price || Number.isNaN(price) || price <= 0) {
    if (variants.length > 0 && variants[0].price) {
      const variantPrice = typeof variants[0].price === 'string' ? parseFloat(variants[0].price) : variants[0].price;
      if (!Number.isNaN(variantPrice) && variantPrice > 0) {
        price = variantPrice;
      }
    }
  }

  // If main product originalPrice is 0, null, undefined, or NaN, use first variant's originalPrice
  if (!originalPrice || Number.isNaN(originalPrice) || originalPrice <= 0) {
    if (variants.length > 0 && variants[0].originalPrice) {
      const variantOriginalPrice = typeof variants[0].originalPrice === 'string' ? parseFloat(variants[0].originalPrice) : variants[0].originalPrice;
      if (!Number.isNaN(variantOriginalPrice) && variantOriginalPrice > 0) {
        originalPrice = variantOriginalPrice;
      }
    }
  }

  const stockQuantity =
    typeof product.stockQuantity === 'string' ? parseInt(product.stockQuantity, 10) : product.stockQuantity;

  return {
    ...product,
    price: Number.isNaN(price) ? 0 : price,
    originalPrice: Number.isNaN(originalPrice) ? 0 : originalPrice,
    stockQuantity: Number.isNaN(stockQuantity) ? 0 : stockQuantity,
    metadata,
    filters: normalizedFilters,
    features: ensureArray(metadata.features || product.features),
    badges: ensureArray(metadata.badges || product.badges),
    tags: ensureArray(metadata.tags || product.tags),
    variants,
    nutrition: metadata.nutrition || product.nutrition || {},
    brand: product.brand || metadata.brand || '',
    shortDescription: product.shortDescription || metadata.shortDescription || product.description || '',
    subcategoryLabel: metadata.subcategoryLabel || product.subcategoryLabel || product.subcategory || '',
    petType: metadata.petType || normalizedFilters.dogCat?.[0] || '',
    description: product.description || metadata.description || '',
    imageUrl: product.imageUrl || metadata.imageUrl || ''
  };
};

export const productMatchesFilterSelections = (product, activeFilters = {}) => {
  const productFilters = product?.filters || {};

  return Object.entries(activeFilters).every(([sectionId, selections]) => {
    if (!Array.isArray(selections) || selections.length === 0) return true;
    const normalizedSelections = selections.map((value) => value.toLowerCase());
    const productValues = ensureArray(productFilters[sectionId]).map((value) => value.toLowerCase());
    if (productValues.length === 0) return false;
    return normalizedSelections.some((selection) => productValues.includes(selection));
  });
};

export const isDogProduct = (product = {}) => {
  const category = (product.category || '').toString().toLowerCase();
  const subcategory = (product.subcategory || product.subcategoryLabel || '').toString().toLowerCase();
  const name = (product.name || '').toString().toLowerCase();

  const petFilters = [
    ...ensureArray(product.filters?.dogCat),
    ...ensureArray(product.filters?.petTypes),
    product.petType,
    product.petTypeLabel
  ]
    .filter(Boolean)
    .map((value) => value.toString().toLowerCase());

  const productTypes = [
    ...ensureArray(product.filters?.productTypes),
    ...ensureArray(product.productType),
    ...ensureArray(product.type)
  ].map((v) => `${v}`.toLowerCase());

  const tags = ensureArray(product.tags).map((v) => `${v}`.toLowerCase());

  const dogKeywords = ['dog', 'dogs', 'canine', 'puppy', 'pup'];

  const haystack = [category, subcategory, name, ...petFilters, ...productTypes, ...tags].filter(Boolean);
  return haystack.some((str) => dogKeywords.some((k) => str.includes(k)));
};

export const isFoodProduct = (product = {}) => {
  const subcategory = (product.subcategory || product.subcategoryLabel || '')
    .toString()
    .toLowerCase();
  const category = (product.category || '').toString().toLowerCase();
  const productTypes = [
    ...ensureArray(product.filters?.productTypes),
    ...(ensureArray(product.productType)),
    ...(ensureArray(product.type))
  ].map((v) => `${v}`.toLowerCase());
  const tags = ensureArray(product.tags).map((v) => `${v}`.toLowerCase());

  // Keywords indicating food products
  const foodKeywords = ['food', 'dry food', 'wet food', 'can', 'canned', 'toppers', 'gravy', 'treat', 'treats', 'edible'];

  if (category.includes('food') || subcategory.includes('food')) return true;
  if (productTypes.some((pt) => foodKeywords.some((k) => pt.includes(k)))) return true;
  if (tags.some((t) => foodKeywords.some((k) => t.includes(k)))) return true;

  // Fallback: product name may contain food-related keywords
  const name = (product.name || '').toString().toLowerCase();
  if (foodKeywords.some((k) => name.includes(k))) return true;

  return false;
};

export const isGroomingProduct = (product = {}) => {
  const subcategory = (product.subcategory || product.subcategoryLabel || '')
    .toString()
    .toLowerCase();
  const category = (product.category || '').toString().toLowerCase();
  const productTypes = [
    ...ensureArray(product.filters?.productTypes),
    ...(ensureArray(product.productType)),
    ...(ensureArray(product.type)),
    ...(ensureArray(product.subcategory)),
    ...(ensureArray(product.subcategoryLabel))
  ].map((v) => `${v}`.toLowerCase());
  const tags = ensureArray(product.tags).map((v) => `${v}`.toLowerCase());

  const groomingKeywords = ['groom', 'brush', 'shampoo', 'comb', 'wipes', 'bath', 'perfume', 'paw', 'ear', 'oral', 'tooth', 'clipper', 'nail', 'trimmer', 'tick', 'flea', 'grooming', 'brushes', 'conditioner'];

  if (category.includes('groom') || subcategory.includes('groom')) return true;
  if (productTypes.some((pt) => groomingKeywords.some((k) => pt.includes(k)))) return true;
  if (tags.some((t) => groomingKeywords.some((k) => t.includes(k)))) return true;

  const name = (product.name || '').toString().toLowerCase();
  if (groomingKeywords.some((k) => name.includes(k))) return true;

  return false;
};

