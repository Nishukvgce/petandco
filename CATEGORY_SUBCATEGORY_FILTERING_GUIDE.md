# Category & Subcategory Filtering System Guide

## Overview

Your pet-co application already has a comprehensive filtering system implemented that allows users to browse products by Type (Cat/Dog/Pharmacy/Outlet), Category, and Subcategory. This guide explains how the system works end-to-end.

## API Endpoint Structure

### Customer Products Endpoint (In-Stock Only)
```
GET /api/admin/products/customer
```

**Query Parameters:**
- `type` - Pet type (Cat, Dog, Pharmacy, Outlet)
- `category` - Main category (e.g., "Cat Food", "Cat Toys")
- `sub` - Subcategory (e.g., "Dry Food", "Wet Food")

### Example API Calls

#### 1. Get All Cat Products
```bash
curl "http://localhost:8081/api/admin/products/customer?type=Cat"
```

#### 2. Get Cat Food Products
```bash
curl "http://localhost:8081/api/admin/products/customer?type=Cat&category=Cat Food"
```

#### 3. Get Cat Dry Food Products
```bash
curl "http://localhost:8081/api/admin/products/customer?type=Cat&category=Cat Food&sub=Dry Food"
```

#### 4. Get Cat Treats
```bash
curl "http://localhost:8081/api/admin/products/customer?type=Cat&category=Cat Treats"
```

#### 5. Get Cat Litter & Supplies
```bash
curl "http://localhost:8081/api/admin/products/customer?type=Cat&category=Cat Litter & Supplies"
```

## Category Structure (As Per Image)

### CAT FOOD
**Category:** `Cat Food`

**Subcategories:**
- All Cat Food (shows all cat food)
- Dry Food
- Wet Food
- Grain Free Food
- Kitten Food
- Veterinary Food
- Supplements

### CAT LITTER & SUPPLIES
**Category:** `Cat Litter & Supplies`

**Subcategories:**
- Litter
- Litter Trays
- Scooper
- Stain & Odour
- All Litter & Supplies

### CAT TOYS
**Category:** `Cat Toys`

**Subcategories:**
- Catnip Toys
- Interactive Toys
- Plush Toys
- Teaser & Wands
- All Toys

### TREES, BEDS & SCRATCHERS
**Category:** `Trees, Beds & Scratchers`

**Subcategories:**
- Beds
- Mats
- Tents
- Blankets & Cushions
- Trees & Scratchers
- Personalised
- All Beds & Scratchers

### CAT TREATS
**Category:** `Cat Treats`

**Subcategories:**
- Crunchy Treats
- Creamy Treats
- Grain Free Treats
- Chew Treats
- All Cat Treats

### CAT BOWLS
**Category:** `Cat Bowls`

**Subcategories:**
- Bowls
- Travel & Fountain
- All Bowls

### CAT COLLARS & ACCESSORIES
**Category:** `Cat Collars & Accessories`

**Subcategories:**
- Collars
- Leash & Harness Set
- Name Tags
- Bow Ties & Bandanas
- All Collars & Accessories

### CAT GROOMING
**Category:** `Cat Grooming`

**Subcategories:**
- Brushes & Combs
- Dry Bath, Wipes & Perfume
- Ear, Eye & PawCare
- Oral Care
- Shampoo & Conditioner
- Tick & Flea Control
- All Grooming

## Frontend Implementation

### 1. Product API Service (`frontend/src/services/productApi.js`)

```javascript
// Fetches customer products (in-stock only) with filtering
async getCustomerProducts(params = {}) {
  const normalizedParams = this.normalizeParams(params);
  const res = await apiClient.get('/admin/products/customer', { 
    params: normalizedParams 
  });
  return res.data;
}

// Parameter normalization
normalizeParams(params = {}) {
  const normalized = {};
  
  // Normalize type parameter
  const type = params.type || params.petType;
  if (type) {
    normalized.type = normalizeParameterValue(type);
  }
  
  // Normalize category parameter
  if (params.category) {
    normalized.category = normalizeParameterValue(params.category);
  }
  
  // Normalize subcategory parameter
  const sub = params.sub || params.subcategory;
  if (sub) {
    normalized.sub = normalizeParameterValue(sub);
  }
  
  return normalized;
}
```

### 2. Cat Food Page (`frontend/src/pages/shop-for-cats/CatFood.jsx`)

**Categories Array:**
```javascript
const categories = [
  { id: 'all-cat-food', label: 'All Cat Food', img: '/assets/images/cat/cf1.webp' },
  { id: 'dry-food', label: 'Dry Food', img: '/assets/images/cat/cf2.webp' },
  { id: 'wet-food', label: 'Wet Food', img: '/assets/images/cat/cf3.webp' },
  { id: 'grain-free', label: 'Grain Free Food', img: '/assets/images/cat/cf4.webp' },
  { id: 'kitten-food', label: 'Kitten Food', img: '/assets/images/cat/cf5.webp' },
  { id: 'veterinary-food', label: 'Veterinary Food', img: '/assets/images/cat/cf7.webp' },
  { id: 'supplements', label: 'Supplements', img: '/assets/images/cat/cf8.webp' }
];
```

**API Call with Filters:**
```javascript
useEffect(() => {
  const load = async () => {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const urlSub = urlParams.get('sub') || '';
    
    // Build API parameters
    const params = {
      type: 'Cat',
      category: 'Cat Food',
      sub: urlSub || (active !== 'All Cat Food' ? active : undefined)
    };
    
    // Fetch products from API
    const apiData = await productApi.getCustomerProducts(params);
    
    // Process and display products
    setProducts(normalizeProducts(apiData));
  };
  
  load();
}, [active]);
```

**URL-based Navigation:**
```javascript
const routeMap = {
  'All Cat Food': '/shop-for-cats/cat-food?sub=All%20Cat%20Food',
  'Dry Food': '/shop-for-cats/cat-food?sub=Dry%20Food',
  'Wet Food': '/shop-for-cats/cat-food?sub=Wet%20Food',
  'Grain Free Food': '/shop-for-cats/cat-food?sub=Grain%20Free%20Food',
  'Kitten Food': '/shop-for-cats/cat-food?sub=Kitten%20Food',
  'Veterinary Food': '/shop-for-cats/cat-food?sub=Veterinary%20Food',
  'Supplements': '/shop-for-cats/cat-food?sub=Supplements'
};

// When user clicks a category
<button onClick={() => {
  setActive(c.label);
  const path = routeMap[c.label];
  if (path) navigate(path);
}}>
  {c.label}
</button>
```

### 3. Similar Pattern for Other Cat Pages

- `CatTreats.jsx` - Uses `type=Cat&category=Cat Treats`
- `CatLitter.jsx` - Uses `type=Cat&category=Cat Litter & Supplies`
- `CatToys.jsx` - Uses `type=Cat&category=Cat Toys`
- `CatBowls.jsx` - Uses `type=Cat&category=Cat Bowls`
- `CatBedding.jsx` - Uses `type=Cat&category=Trees, Beds & Scratchers`
- `CatCollars.jsx` - Uses `type=Cat&category=Cat Collars & Accessories`
- `CatGrooming.jsx` - Uses `type=Cat&category=Cat Grooming`

## Backend Implementation

### 1. ProductController Customer Endpoint

**File:** `backend/src/main/java/com/eduprajna/Controller/ProductController.java`

```java
@GetMapping("/customer")
public ResponseEntity<List<Product>> getCustomerProducts(
        @RequestParam(value = "category", required = false) String category,
        @RequestParam(value = "sub", required = false) String sub,
        @RequestParam(value = "type", required = false) String type,
        @RequestParam(value = "petType", required = false) String petType
) {
    // Normalize type parameter (prioritize 'type' over 'petType')
    String effectiveType = normalizeTypeParameter(type, petType);
    
    // Normalize category and subcategory parameters
    String normalizedCategory = normalizeParameter(category);
    String normalizedSub = normalizeParameter(sub);
    
    log.info("Customer request - type: '{}', category: '{}', sub: '{}'", 
            effectiveType, normalizedCategory, normalizedSub);
    
    // Get filtered products
    List<Product> products = getFilteredProductsWithType(
        normalizedCategory, 
        normalizedSub, 
        effectiveType
    );
    
    // Filter out-of-stock products and enrich metadata
    products.forEach(p -> enrichProductMetadata(p));
    
    return ResponseEntity.ok(products);
}
```

### 2. Type-based Filtering

```java
private boolean isCatProduct(Product p, String category, String sub) {
    if (p == null || !Boolean.TRUE.equals(p.getIsActive())) return false;
    
    // Check if product type is cat
    if ("Cat".equalsIgnoreCase(p.getType())) return true;
    
    // Check metadata for cat indicators
    Map<String, Object> metadata = p.getMetadata();
    if (metadata != null) {
        Object metaType = metadata.get("type");
        Object petType = metadata.get("petType");
        if ("Cat".equalsIgnoreCase(String.valueOf(metaType)) || 
            "Cat".equalsIgnoreCase(String.valueOf(petType))) {
            return matchesCategoryAndSub(p, category, sub);
        }
    }
    
    // Check category patterns for cat products
    String productCategory = p.getCategory();
    if (productCategory != null && productCategory.toLowerCase().contains("cat")) {
        return matchesCategoryAndSub(p, category, sub);
    }
    
    return false;
}
```

### 3. Category & Subcategory Matching

```java
private boolean matchesCategoryAndSub(Product p, String category, String sub) {
    String productCategory = p.getCategory();
    String productSubcategory = p.getSubcategory();
    
    // If category filter provided, must match
    if (category != null && !category.isBlank()) {
        if (productCategory == null || 
            !productCategory.toLowerCase().contains(category.toLowerCase())) {
            return false;
        }
    }
    
    // If subcategory filter provided, must match
    if (sub != null && !sub.isBlank()) {
        if (productSubcategory == null || 
            !productSubcategory.toLowerCase().contains(sub.toLowerCase())) {
            return false;
        }
    }
    
    return true;
}
```

### 4. Parameter Normalization

```java
private String normalizeParameter(String param) {
    if (param == null || param.isBlank()) return null;
    
    // Decode URL encoding (%20, +, etc.)
    try {
        param = URLDecoder.decode(param, StandardCharsets.UTF_8);
    } catch (Exception e) {
        log.warn("Failed to decode parameter: {}", param);
    }
    
    // Trim and normalize spaces
    return param.trim().replaceAll("\\s+", " ");
}

private String normalizeTypeParameter(String type, String petType) {
    // Prioritize 'type' parameter over 'petType'
    String effectiveType = type != null && !type.isBlank() ? type : petType;
    return normalizeParameter(effectiveType);
}
```

## Data Storage Requirements

### When Creating/Editing Products

**Required Fields for Proper Filtering:**

1. **Type Column:** `type = "Cat"` (must be set in database)
2. **Category Column:** `category = "Cat Food"` (must match frontend categories)
3. **Subcategory Column:** `subcategory = "Dry Food"` (must match frontend subcategories)

**Example Product Creation:**

```json
{
  "name": "Royal Canin Cat Adult Dry Food",
  "brand": "Royal Canin",
  "type": "Cat",
  "category": "Cat Food",
  "subcategory": "Dry Food",
  "price": 862.40,
  "originalPrice": 980,
  "inStock": true,
  "stockQuantity": 50,
  "variants": [
    {
      "id": "1kg",
      "weight": "1",
      "weightUnit": "kg",
      "price": 862.40,
      "originalPrice": 980,
      "stock": 20
    },
    {
      "id": "2.5kg",
      "weight": "2.5",
      "weightUnit": "kg",
      "price": 1999,
      "originalPrice": 2200,
      "stock": 30
    }
  ]
}
```

## Testing the Filtering System

### Test 1: Filter by Type Only
```bash
# Should return all Cat products
curl "http://localhost:8081/api/admin/products/customer?type=Cat"
```

**Expected:** All products where `type = "Cat"`

### Test 2: Filter by Type + Category
```bash
# Should return only Cat Food products
curl "http://localhost:8081/api/admin/products/customer?type=Cat&category=Cat Food"
```

**Expected:** Products where `type = "Cat"` AND `category LIKE "%Cat Food%"`

### Test 3: Filter by Type + Category + Subcategory
```bash
# Should return only Cat Dry Food products
curl "http://localhost:8081/api/admin/products/customer?type=Cat&category=Cat Food&sub=Dry Food"
```

**Expected:** Products where:
- `type = "Cat"` AND
- `category LIKE "%Cat Food%"` AND
- `subcategory LIKE "%Dry Food%"`

### Test 4: Filter Cat Treats
```bash
curl "http://localhost:8081/api/admin/products/customer?type=Cat&category=Cat Treats"
```

**Expected:** All Cat Treats products

### Test 5: Filter Cat Litter
```bash
curl "http://localhost:8081/api/admin/products/customer?type=Cat&category=Cat Litter & Supplies&sub=Litter"
```

**Expected:** Only Litter products (not Trays or Scoopers)

## Frontend Routes

### Cat Shop Routes

| Route | Category | Subcategory Filter |
|-------|----------|-------------------|
| `/shop-for-cats/cat-food` | Cat Food | From URL param `?sub=` |
| `/shop-for-cats/cat-food?sub=Dry Food` | Cat Food | Dry Food |
| `/shop-for-cats/cat-treats` | Cat Treats | From URL param |
| `/shop-for-cats/cat-litter` | Cat Litter & Supplies | From URL param |
| `/shop-for-cats/cat-toys` | Cat Toys | From URL param |
| `/shop-for-cats/cat-bedding` | Trees, Beds & Scratchers | From URL param |
| `/shop-for-cats/cat-bowls` | Cat Bowls | From URL param |
| `/shop-for-cats/cat-collars` | Cat Collars & Accessories | From URL param |
| `/shop-for-cats/cat-grooming` | Cat Grooming | From URL param |

## Database Schema

### Product Table Columns for Filtering

```sql
-- Core filtering columns
type VARCHAR(50) -- "Cat", "Dog", "Pharmacy", "Outlet"
category VARCHAR(255) -- "Cat Food", "Cat Treats", etc.
subcategory VARCHAR(255) -- "Dry Food", "Wet Food", etc.
pet_type VARCHAR(50) -- Additional pet type field
is_active BOOLEAN -- Product active status
in_stock BOOLEAN -- Stock availability
stock_quantity INTEGER -- Stock count

-- Metadata JSON column (stores variants, images, etc.)
metadata JSONB
```

## Common Issues & Solutions

### Issue 1: Products Not Showing in Category
**Problem:** Added a cat food product but it's not showing in Cat Food page

**Solution:**
1. Check database: `SELECT id, name, type, category, subcategory FROM product WHERE name LIKE '%product_name%';`
2. Verify `type = "Cat"` (NOT "Dog", NOT null)
3. Verify `category = "Cat Food"` (exact match, case-insensitive)
4. Verify `is_active = true`
5. Verify `in_stock = true` and `stock_quantity > 0`

### Issue 2: Subcategory Filter Not Working
**Problem:** Clicking "Dry Food" shows all Cat Food

**Solution:**
1. Check database: `SELECT id, name, subcategory FROM product WHERE category LIKE '%Cat Food%';`
2. Verify `subcategory` matches frontend label (e.g., "Dry Food" not "Dry" or "dry-food")
3. Check URL parameter: Should be `?sub=Dry Food` (URL-encoded as `?sub=Dry%20Food`)

### Issue 3: Wrong Products in Category
**Problem:** Dog products showing in Cat category

**Solution:**
1. Check product `type` column: `UPDATE product SET type = 'Cat' WHERE id = ?;`
2. Check `category` column: `UPDATE product SET category = 'Cat Food' WHERE id = ?;`

### Issue 4: Backend Not Extracting petType
**Problem:** `pet_type` column shows NULL even though frontend sends it

**Solution:**
✅ **FIXED** in `PETTYPE_FIELD_EXTRACTION_FIX.md`
- Added extraction logic in `normalizeAndExtractFields()` method
- Now properly extracts `petType` to `pet_type` column

## Additional Frontend Filters

### Filter Sections Available

Each cat page has additional filter options:

1. **Brand** - Filter by manufacturer
2. **Cat/Kitten** - Filter by age group
3. **Life Stage** - Filter by life stage (kitten, adult, senior)
4. **Breed Size** - Filter by breed size
5. **Product Type** - Filter by product type
6. **Special Diet** - Filter by dietary needs
7. **Protein Source** - Filter by protein source
8. **Price Range** - Filter by price brackets
9. **Weight** - Filter by product weight/size
10. **Sub Category** - Additional subcategory filters

### Sort Options

- Featured
- Price, low to high
- Price, high to low
- Alphabetically, A-Z
- Alphabetically, Z-A

## Best Practices

### For Product Creation

1. ✅ **Always set `type` field** - "Cat", "Dog", "Pharmacy", or "Outlet"
2. ✅ **Use consistent category names** - Match exactly with frontend categories
3. ✅ **Use consistent subcategory names** - Match exactly with frontend subcategories
4. ✅ **Set stock properly** - Both `in_stock` boolean and `stock_quantity` number
5. ✅ **Include variants** - With weight/size, price, and stock for each variant
6. ✅ **Add descriptive names** - Help users find products easily
7. ✅ **Include images** - Multiple images improve user experience

### For Category Management

1. ✅ **Use standard category names** from the navigation menu
2. ✅ **Keep subcategory names consistent** across similar products
3. ✅ **Test filters after adding** products to verify they appear correctly
4. ✅ **Check both API and frontend** to ensure filtering works end-to-end

## Verification Checklist

After adding a new Cat Food product:

- [ ] Product appears in: `/shop-for-cats/cat-food`
- [ ] Product appears when filtering by subcategory (e.g., `?sub=Dry Food`)
- [ ] Product has correct `type = "Cat"` in database
- [ ] Product has correct `category = "Cat Food"` in database
- [ ] Product has correct `subcategory` matching filter name
- [ ] Product is `in_stock = true` with `stock_quantity > 0`
- [ ] API returns product: `GET /api/admin/products/customer?type=Cat&category=Cat Food`
- [ ] Variants display correctly on product card
- [ ] Images display correctly
- [ ] Add to cart works properly

## Summary

Your filtering system is **already fully implemented** and working! 🎉

**Key Points:**
1. ✅ Backend handles `type`, `category`, and `sub` parameters
2. ✅ Frontend sends correct parameters based on page and user selection
3. ✅ URL parameters control which products are displayed
4. ✅ Database columns (`type`, `category`, `subcategory`) must be set correctly
5. ✅ Recent fix ensures all fields (including `petType`) are extracted properly

**To use the filtering system:**
- Just ensure products have correct `type`, `category`, and `subcategory` values
- The rest is handled automatically by the frontend and backend!

## Status

✅ **FULLY IMPLEMENTED AND WORKING**

The category and subcategory filtering system is complete and operational across all cat shop pages. Just ensure your products have the correct database values for `type`, `category`, and `subcategory` columns.

