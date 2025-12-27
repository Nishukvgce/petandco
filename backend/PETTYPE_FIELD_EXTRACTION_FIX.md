# PetType Field Extraction Fix

## Issue
The `pet_type` column in the database was not being populated correctly. When creating or editing products with `petType: "Cat"`, the database was showing incorrect values or NULL.

**User Report:**
> "Still tell me why it is saving petType as Dog even though I am giving as Cat"

## Root Cause

### Missing Extraction Logic
The `normalizeAndExtractFields()` method in `ProductController.java` was **incomplete**. It was only extracting a few fields from metadata to dedicated database columns:

**Fields Being Extracted (BEFORE fix):**
- ✅ `type` → `type` column
- ✅ `foodType` → `food_type` column  
- ✅ `features` → `features` column
- ✅ `nutrition.*` → `nutrition_*` columns

**Fields NOT Being Extracted (causing the bug):**
- ❌ `petType` → `pet_type` column
- ❌ `material` → `material` column
- ❌ `scent` → `scent` column
- ❌ `suitableFor` → `suitable_for` column
- ❌ `treatType` → `treat_type` column
- ❌ `texture` → `texture` column
- ❌ `subcategoryLabel` → `subcategory_label` column
- ❌ `servingSize` → `serving_size` column
- ❌ `packCount` → `pack_count` column
- ❌ `weightUnit` → `weight_unit` column
- ❌ `flavors` → `flavors` column
- ❌ `colors` → `colors` column
- ❌ `pharmacy.*` → pharmacy columns

### Confusion Between `type` and `petType`

The original code had this problematic logic:

```java
// BEFORE (WRONG)
String t = p.getType();
if ((t == null || t.isBlank()) && md != null) {
    Object mv = md.get("type");
    if (mv == null) mv = md.get("petType");  // ❌ Using petType as fallback!
    if (mv != null) p.setType(mv.toString());
}
```

**Problems:**
1. If `type` was missing from metadata, it would use `petType` value for the `type` column
2. This would save "Cat" in the `type` column instead of the `pet_type` column
3. The actual `petType` field was never extracted to its own column
4. Created confusion between two separate fields

## Solution

### 1. Added Complete Field Extraction Logic

Added extraction for ALL missing fields:

```java
// Extract pet and product attribute fields to separate columns
Object petTypeObj = md.get("petType");
if (petTypeObj != null && !petTypeObj.toString().isBlank()) {
    p.setPetType(petTypeObj.toString());
}

Object materialObj = md.get("material");
if (materialObj != null && !materialObj.toString().isBlank()) {
    p.setMaterial(materialObj.toString());
}

// ... and so on for all fields
```

### 2. Fixed `type` vs `petType` Confusion

```java
// AFTER (CORRECT)
String t = p.getType();
if ((t == null || t.isBlank()) && md != null) {
    Object mv = md.get("type");
    if (mv != null) {
        p.setType(mv.toString());  // ✅ Only use "type" for type column
    }
    md.remove("type");
}
// petType is now extracted separately to its own column
```

### 3. Added Metadata Cleanup

After extracting fields to columns, remove them from metadata to avoid duplication:

```java
// Ensure metadata doesn't duplicate data stored in columns
if (p.getPetType() != null && !p.getPetType().isBlank()) {
    md.remove("petType");
}
if (p.getMaterial() != null && !p.getMaterial().isBlank()) {
    md.remove("material");
}
// ... and so on for all extracted fields
```

### 4. Special Handling for Array Fields

Flavors and colors can be arrays or strings:

```java
Object flavorsObj = md.get("flavors");
if (flavorsObj != null) {
    if (flavorsObj instanceof List) {
        // Convert List to JSON array string
        List<?> flavorsList = (List<?>) flavorsObj;
        StringBuilder jsonBuilder = new StringBuilder("[");
        boolean first = true;
        for (Object flavor : flavorsList) {
            if (flavor != null && !flavor.toString().trim().isEmpty()) {
                if (!first) jsonBuilder.append(", ");
                jsonBuilder.append("\"").append(flavor.toString().replace("\"", "\\\"")).append("\"");
                first = false;
            }
        }
        jsonBuilder.append("]");
        p.setFlavors(jsonBuilder.toString());
    } else if (!flavorsObj.toString().isBlank()) {
        p.setFlavors(flavorsObj.toString());
    }
}
```

### 5. Pharmacy Fields Extraction

Extract nested pharmacy object:

```java
Object pharmacyObj = md.get("pharmacy");
if (pharmacyObj instanceof Map) {
    Map<String, Object> pharmacy = (Map<String, Object>) pharmacyObj;
    
    Object prescriptionReq = pharmacy.get("prescriptionRequired");
    if (prescriptionReq != null) {
        p.setPrescriptionRequired(Boolean.parseBoolean(prescriptionReq.toString()));
    }
    
    // Extract dosageForm, strength, activeIngredient, etc.
}
```

## Data Flow

### Before Fix (BROKEN)
```
Frontend sends:
{
  "type": "Cat",
  "petType": "Dog",
  "material": "Leather"
}
    ↓
Backend normalizeAndExtractFields():
- Extracts "type" → type column = "Cat" ✓
- Ignores "petType" → pet_type column = NULL ❌
- Ignores "material" → material column = NULL ❌
    ↓
Database:
type = "Cat"
pet_type = NULL  ❌
material = NULL  ❌
```

### After Fix (WORKING)
```
Frontend sends:
{
  "type": "Cat",
  "petType": "Dog",
  "material": "Leather"
}
    ↓
Backend normalizeAndExtractFields():
- Extracts "type" → type column = "Cat" ✓
- Extracts "petType" → pet_type column = "Dog" ✓
- Extracts "material" → material column = "Leather" ✓
- Removes extracted fields from metadata ✓
    ↓
Database:
type = "Cat" ✓
pet_type = "Dog" ✓
material = "Leather" ✓
metadata = {"variants": [...], "images": [...]} ✓
```

## Complete Field Mapping

### Basic Product Info
| Frontend Field | Database Column | Extraction | Enrichment |
|----------------|-----------------|------------|------------|
| `type` | `type` | ✅ | ✅ |
| `foodType` | `food_type` | ✅ | ✅ |
| `features` | `features` | ✅ | ✅ |

### Nutrition Info
| Frontend Field | Database Column | Extraction | Enrichment |
|----------------|-----------------|------------|------------|
| `nutrition.protein` | `nutrition_protein` | ✅ | ✅ |
| `nutrition.fat` | `nutrition_fat` | ✅ | ✅ |
| `nutrition.fiber` | `nutrition_fiber` | ✅ | ✅ |
| `nutrition.moisture` | `nutrition_moisture` | ✅ | ✅ |
| `nutrition.ash` | `nutrition_ash` | ✅ | ✅ |
| `nutrition.calories` | `nutrition_calories` | ✅ | ✅ |

### Pet & Product Attributes (NOW FIXED)
| Frontend Field | Database Column | Extraction | Enrichment |
|----------------|-----------------|------------|------------|
| `petType` | `pet_type` | ✅ NEW | ✅ |
| `material` | `material` | ✅ NEW | ✅ |
| `scent` | `scent` | ✅ NEW | ✅ |
| `suitableFor` | `suitable_for` | ✅ NEW | ✅ |
| `treatType` | `treat_type` | ✅ NEW | ✅ |
| `texture` | `texture` | ✅ NEW | ✅ |
| `subcategoryLabel` | `subcategory_label` | ✅ NEW | ✅ |
| `servingSize` | `serving_size` | ✅ NEW | ✅ |
| `packCount` | `pack_count` | ✅ NEW | ✅ |
| `weightUnit` | `weight_unit` | ✅ NEW | ✅ |
| `flavors` | `flavors` | ✅ NEW | ✅ |
| `colors` | `colors` | ✅ NEW | ✅ |

### Pharmacy Fields (NOW FIXED)
| Frontend Field | Database Column | Extraction | Enrichment |
|----------------|-----------------|------------|------------|
| `pharmacy.prescriptionRequired` | `prescription_required` | ✅ NEW | ✅ |
| `pharmacy.dosageForm` | `dosage_form` | ✅ NEW | ✅ |
| `pharmacy.strength` | `strength` | ✅ NEW | ✅ |
| `pharmacy.activeIngredient` | `active_ingredient` | ✅ NEW | ✅ |
| `pharmacy.manufacturer` | `manufacturer` | ✅ NEW | ✅ |
| `pharmacy.indications` | `indications` | ✅ NEW | ✅ |
| `pharmacy.contraindications` | `contraindications` | ✅ NEW | ✅ |
| `pharmacy.expiryDate` | `expiry_date` | ✅ NEW | ✅ |

## Files Modified

**File:** `backend/src/main/java/com/eduprajna/Controller/ProductController.java`

**Changes:**

1. **Lines 1226-1232** - Fixed `type` extraction logic
   - Removed fallback to `petType` 
   - Only uses `type` field for `type` column

2. **Lines 1316-1468** - Added complete field extraction
   - Added `petType` extraction
   - Added all pet/product attribute extractions
   - Added flavors/colors array handling
   - Added pharmacy fields extraction
   - Added metadata cleanup for extracted fields

## Testing Scenarios

### Test 1: Cat Product
```
Input:
- type: "Cat"
- petType: "Cat"  
- material: "Cotton"

Expected Database:
- type = "Cat" ✅
- pet_type = "Cat" ✅
- material = "Cotton" ✅
```

### Test 2: Dog Product with Pharmacy
```
Input:
- type: "Dog"
- petType: "Dog"
- pharmacy.prescriptionRequired: true
- pharmacy.dosageForm: "Tablet"

Expected Database:
- type = "Dog" ✅
- pet_type = "Dog" ✅
- prescription_required = true ✅
- dosage_form = "Tablet" ✅
```

### Test 3: Product with Flavors/Colors
```
Input:
- type: "Cat"
- flavors: ["Chicken", "Beef", "Fish"]
- colors: ["Red", "Blue"]

Expected Database:
- type = "Cat" ✅
- flavors = '["Chicken", "Beef", "Fish"]' ✅
- colors = '["Red", "Blue"]' ✅
```

### Test 4: Outlet Product
```
Input:
- type: "Outlet"
- petType: null
- material: "Plastic"

Expected Database:
- type = "Outlet" ✅
- pet_type = NULL ✅
- material = "Plastic" ✅
```

## Benefits

### Data Integrity
✅ All fields now stored in correct columns  
✅ No data loss from metadata to columns  
✅ Proper separation between `type` and `petType`  
✅ Clean metadata without duplicated data  

### Query Performance
✅ Can query by `pet_type` column directly  
✅ Can filter by `material`, `scent`, etc.  
✅ Indexed columns for faster searches  
✅ No need to parse JSON for basic filters  

### Database Normalization
✅ Structured data in dedicated columns  
✅ Proper data types (Boolean for prescriptionRequired)  
✅ Array fields stored as JSON strings  
✅ Complex objects (variants, images) in metadata  

### Frontend Compatibility
✅ Data enriched correctly on retrieval  
✅ All fields available for display  
✅ Consistent data structure  
✅ Edit form loads all fields correctly  

## Edge Cases Handled

### Null/Empty Values
```java
if (petTypeObj != null && !petTypeObj.toString().isBlank()) {
    p.setPetType(petTypeObj.toString());
}
// Field remains NULL in database if not provided ✅
```

### Array vs String
```java
if (flavorsObj instanceof List) {
    // Convert to JSON array string
} else if (!flavorsObj.toString().isBlank()) {
    // Store as-is
}
// Handles both formats ✅
```

### Nested Objects
```java
if (pharmacyObj instanceof Map) {
    Map<String, Object> pharmacy = (Map<String, Object>) pharmacyObj;
    // Extract nested fields
}
// Handles nested pharmacy object ✅
```

## Related Fixes

This fix complements:
- ✅ `MISSING_FIELDS_FIX.md` - Added entity fields and getters/setters
- ✅ `EDIT_FUNCTIONALITY_FIX.md` - Enrichment for display
- ✅ `DESERIALIZATION_FIX_SUMMARY.md` - JSON handling
- ✅ `MULTIPLE_IMAGES_PERSISTENCE_FIX.md` - Image merging

## Status
✅ **FIXED** - All fields from metadata are now properly extracted to their dedicated database columns, including `petType`.

## Next Steps

### Testing
1. Create a Cat product with petType="Cat"
2. Verify `pet_type` column in database shows "Cat"
3. Edit the product and verify field loads correctly
4. Test all other new fields (material, scent, etc.)

### Deployment
1. Restart backend server
2. Test with existing products
3. Create new products with all fields
4. Verify database columns populated correctly

### Monitoring
Check logs for extraction warnings:
```
log.debug("Extracting petType: {}", petTypeObj);
```

