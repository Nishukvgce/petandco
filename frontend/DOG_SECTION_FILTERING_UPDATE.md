# Dog Section Frontend Filtering Update

## Overview

Applying the same frontend filtering pattern to all Dog shop pages as implemented for Cat pages.

## Pattern to Apply

### API Call (Change From → To)

**BEFORE:**
```javascript
const apiData = await productApi.getProductsByContext(cleanParams, 'dog');
// or
const apiData = await productApi.getCustomerProducts({ type: 'Dog', category: 'X', sub: 'Y' });
```

**AFTER:**
```javascript
// Fetch all Dog products - filtering will be done on frontend
const apiData = await productApi.getCustomerProducts({ type: 'Dog' });
```

### Frontend Filtering Logic

**Standard Pattern:**
```javascript
const displayedProducts = useMemo(() => {
  if (products.length === 0) return [];

  // Frontend handles ALL filtering - match by category and subcategory names
  const pageCategory = 'Dog Food'; // CHANGE THIS PER PAGE
  const urlParams = new URLSearchParams(window.location.search);
  const urlSub = urlParams.get('sub');
  const norm = s => String(s||'').toLowerCase().trim();

  let working = products;
  
  // Step 1: Filter by category (exact match, case-insensitive)
  working = working.filter(p => {
    const productCategory = norm(p.category || '');
    const targetCategory = norm(pageCategory);
    return productCategory === targetCategory || 
           productCategory.includes(targetCategory) ||
           targetCategory.includes(productCategory);
  });
  
  // Step 2: Filter by subcategory if specified
  const activeSubcategory = urlSub || (active && !active.toLowerCase().includes('all') ? active : null);
  if (activeSubcategory && activeSubcategory.trim()) {
    const targetSub = norm(activeSubcategory);
    working = working.filter(p => {
      const productSub = norm(p.subcategory || '');
      return productSub === targetSub || 
             productSub.includes(targetSub) ||
             targetSub.includes(productSub);
    });
  }
  
  // Step 3: Apply additional filters (if using filter system)
  let filtered = working.filter((product) => productMatchesFilterSelections(product, activeFilters));
  
  return filtered;
}, [products, activeFilters, active]);
```

## Dog Category Names

Use these **exact category names** in database for products:

| Page | Category Name (use in DB) |
|------|---------------------------|
| Dog Food | `Dog Food` |
| Dog Grooming | `Dog Grooming` |
| Walk Essentials | `Walk Essentials` |
| Dog Treats | `Dog Treats` |
| Dog Toys | `Dog Toys` |
| Dog Bedding | `Dog Bedding` |
| Dog Clothing & Accessories | `Dog Clothing & Accessories` |
| Dog Bowls & Diners | `Dog Bowls & Diners` |
| Dog Health & Hygiene | `Dog Health & Hygiene` |
| Dog Training Essentials | `Dog Training Essentials` |
| Travel Essentials | `Travel Essentials` |

## Dog Subcategory Reference

### DOG FOOD
- All Dog Food
- Daily Meals
- Dry Food
- Wet Food
- Grain Free
- Puppy Food
- Hypoallergenic
- Veterinary Food
- Food Toppers & Gravy
- Chicken Free

### DOG GROOMING
- All Dog Grooming
- Brushes & Combs
- Dry Bath, Wipes & Perfume
- Ear, Eye & PawCare
- Oral Care
- Shampoo & Conditioner
- Tick & Flea Control

### WALK ESSENTIALS
- All Walk Essentials
- Collar
- Leash
- Harness
- Name Tags
- Personalised

### DOG TREATS
- All Dog Treats
- Biscuits & Snacks
- Soft & Chewy
- Natural Treats
- Puppy Treats
- Vegetarian Treats
- Dental Chew
- Grain Free Treat

### DOG TOYS
- All Dog Toys
- Balls
- Chew Toys
- Crinkle Toys
- Fetch Toys
- Interactive Toys
- Plush Toys
- Rope Toys
- Squeaker Toys

### DOG BEDDING
- All Dog Bedding
- Beds
- Blankets & Cushions
- Mats
- Personalised Bedding
- Tents

### DOG CLOTHING & ACCESSORIES
- All Dog Clothing
- Festive Special
- T-Shirts & Dresses
- Sweatshirts
- Sweaters
- Bow Ties & Bandanas
- Raincoats
- Shoes & Socks
- Jackets
- Personalised

### DOG BOWLS & DINERS
- All Dog Bowls & Diners
- Bowls
- Diners
- Anti Spill Mats
- Travel & Fountain

### DOG HEALTH & HYGIENE
- All Dog Health & Hygiene
- Oral Care
- Supplements
- Tick & Flea Control

### DOG TRAINING ESSENTIALS
- All Training Essentials
- Agility
- Stain & Odour

### TRAVEL ESSENTIALS
- All Travel Supplies
- Carriers
- Travel Bowls
- Travel Beds
- Water Bottles

## Pages to Update

### Main Category Pages (Priority)
1. ✅ **DogFood.jsx** - Updated
2. **DogGrooming.jsx**
3. **WalkEssentials.jsx**
4. **DogTreats.jsx**
5. **DogToys.jsx**
6. **DogBedding.jsx**
7. **DogClothing.jsx**
8. **DogBowlsDiners.jsx**
9. **DogHealthHygiene.jsx**
10. **DogTrainingEssentials.jsx**
11. **DogTravelSupplies.jsx**

### Subcategory Pages (Optional)
These can be updated later if they exist as separate pages.

## Database Requirements

### Example Dog Food Product
```sql
INSERT INTO product (name, type, category, subcategory, is_active, in_stock, stock_quantity)
VALUES (
  'Royal Canin Maxi Adult Dry Dog Food',
  'Dog',                    -- ✅ Matches type filter
  'Dog Food',               -- ✅ Matches DogFood page
  'Dry Food',               -- ✅ Matches subcategory
  true,
  true,
  50
);
```

### Example Dog Toy Product
```sql
INSERT INTO product (name, type, category, subcategory, is_active, in_stock, stock_quantity)
VALUES (
  'Interactive Fetch Ball',
  'Dog',                    -- ✅ Matches type filter
  'Dog Toys',               -- ✅ Matches DogToys page
  'Fetch Toys',             -- ✅ Matches subcategory
  true,
  true,
  100
);
```

### Example Walk Essentials Product
```sql
INSERT INTO product (name, type, category, subcategory, is_active, in_stock, stock_quantity)
VALUES (
  'Premium Leather Collar',
  'Dog',                    -- ✅ Matches type filter
  'Walk Essentials',        -- ✅ Matches WalkEssentials page
  'Collar',                 -- ✅ Matches subcategory
  true,
  true,
  75
);
```

## Testing Checklist

### Test Each Dog Page

1. **Visit page:** `http://localhost:3000/shop-for-dogs/dog-food`
   - ✅ Only Dog Food products display
   - ❌ No Dog Toys, Treats, or other categories

2. **Test subcategory:** `http://localhost:3000/shop-for-dogs/dog-food?sub=Dry Food`
   - ✅ Only Dry Food products display
   - ❌ No Wet Food or other subcategories

3. **Test navigation:** Click between categories
   - ✅ Each category shows only its products
   - ✅ No mixing of categories

4. **Test filters:** Apply brand, price filters
   - ✅ Filters work correctly
   - ✅ Products match all selected filters

## Benefits

### Same as Cat Section
✅ Single API call per pet type  
✅ Fast frontend filtering  
✅ Easy to maintain  
✅ Consistent behavior  
✅ Better user experience  

### Dog-Specific
✅ Handles complex dog product hierarchy  
✅ Works with existing filter system  
✅ Compatible with `productMatchesFilterSelections`  
✅ Supports nested subcategory pages  

## Migration Status

### Completed
- ✅ DogFood.jsx - Updated with new pattern

### Pending
- ⏳ DogGrooming.jsx
- ⏳ WalkEssentials.jsx
- ⏳ DogTreats.jsx
- ⏳ DogToys.jsx
- ⏳ DogBedding.jsx
- ⏳ DogClothing.jsx
- ⏳ DogBowlsDiners.jsx
- ⏳ DogHealthHygiene.jsx
- ⏳ DogTrainingEssentials.jsx
- ⏳ DogTravelSupplies.jsx

## Next Steps

1. Update remaining main dog category pages
2. Test each page thoroughly
3. Verify database has correct category/subcategory values
4. Update subcategory pages if needed
5. Apply same pattern to Pharmacy and Outlet sections

## Notes

- Dog pages may use different filter systems (`activeFilters`, `productMatchesFilterSelections`)
- Keep existing filter logic in Step 3
- Only change:
  1. API call (use `type: 'Dog'` only)
  2. Add category/subcategory filtering (Steps 1 & 2)
- Test thoroughly as dog section has more complex navigation

## Status

🔄 **IN PROGRESS** - DogFood.jsx updated, remaining pages pending.

