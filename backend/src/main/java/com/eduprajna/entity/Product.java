package com.eduprajna.entity;


import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.eduprajna.converter.JsonMapConverter;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;


@Entity
@Table(name = "product")
public class Product {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 255)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    private Double price;
    private Double originalPrice;
    
    @Column(length = 100)
    private String category;
    
    @Column(length = 100)
    private String subcategory;
    
    @Column(length = 500)
    private String imageUrl; // Store image as Base64 string or URL

    @Column(length = 255)
    private String imagePublicId; // Cloudinary public_id for deletion
    
    @Column(length = 50)
    private String weight;
    
    private Integer stockQuantity;
    
    @Column(columnDefinition = "TEXT")
    private String ingredients; // Comma-separated string
    
    @Column(columnDefinition = "TEXT")
    private String benefits;    // Comma-separated string
    
    @Column(length = 500)
    private String shortDescription;

    @Column(length = 150)
    private String brand;

    private Boolean inStock;
    
    @Column(nullable = false)
    private Boolean isActive = true;


    @Column(length = 50)
    private String foodType; // Veg, Non-Veg

    @Column(length = 50)
    private String type; // Dog, Cat, Pharmacy, Outlet
    
    // Features stored as JSON array (comma-separated or JSON)
    @Column(name = "features", columnDefinition = "TEXT")
    private String features; // JSON array of feature strings
    
    // Nutrition information
    @Column(name = "nutrition_protein", length = 50)
    private String nutritionProtein; // Protein percentage
    
    @Column(name = "nutrition_fat", length = 50)
    private String nutritionFat; // Fat percentage
    
    @Column(name = "nutrition_fiber", length = 50)
    private String nutritionFiber; // Fiber percentage
    
    @Column(name = "nutrition_moisture", length = 50)
    private String nutritionMoisture; // Moisture percentage
    
    @Column(name = "nutrition_ash", length = 50)
    private String nutritionAsh; // Ash percentage
    
    @Column(name = "nutrition_calories", length = 50)
    private String nutritionCalories; // Calories per kg
    
    // Pet and Product Attribute Fields
    @Column(name = "pet_type", length = 50)
    private String petType; // Dog, Cat, etc.
    
    @Column(name = "material", length = 255)
    private String material; // Product material
    
    @Column(name = "scent", length = 255)
    private String scent; // Product scent
    
    @Column(name = "suitable_for", length = 255)
    private String suitableFor; // Suitable for (e.g., "All Life Stages")
    
    @Column(name = "treat_type", length = 255)
    private String treatType; // Type of treat
    
    @Column(name = "texture", length = 255)
    private String texture; // Product texture
    
    @Column(name = "subcategory_label", length = 255)
    private String subcategoryLabel; // Subcategory display label
    
    @Column(name = "serving_size", length = 255)
    private String servingSize; // Serving size information
    
    @Column(name = "pack_count", length = 50)
    private String packCount; // Number of items in pack
    
    @Column(name = "weight_unit", length = 10)
    private String weightUnit; // g, kg, ml, l, etc.
    
    @Column(name = "flavors", columnDefinition = "TEXT")
    private String flavors; // Flavors (comma-separated or JSON)
    
    @Column(name = "colors", columnDefinition = "TEXT")
    private String colors; // Colors (comma-separated or JSON)
    
    // Pharmacy-specific Fields
    @Column(name = "prescription_required")
    private Boolean prescriptionRequired; // Whether prescription is required
    
    @Column(name = "dosage_form", length = 255)
    private String dosageForm; // Tablet, Syrup, Injection, etc.
    
    @Column(name = "strength", length = 255)
    private String strength; // Dosage strength
    
    @Column(name = "active_ingredient", length = 255)
    private String activeIngredient; // Active pharmaceutical ingredient
    
    @Column(name = "manufacturer", length = 255)
    private String manufacturer; // Manufacturer name
    
    @Column(name = "indications", columnDefinition = "TEXT")
    private String indications; // Medical indications
    
    @Column(name = "contraindications", columnDefinition = "TEXT")
    private String contraindications; // Medical contraindications
    
    @Column(name = "expiry_date", length = 255)
    private String expiryDate; // Expiry date
    
    public String getFoodType() {
        return foodType;
    }

    public void setFoodType(String foodType) {
        this.foodType = foodType;
    }

    @Convert(converter = JsonMapConverter.class)
    @Column(columnDefinition = "LONGTEXT")
    private Map<String, Object> metadata = new HashMap<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public Double getOriginalPrice() {
        return originalPrice;
    }

    public void setOriginalPrice(Double originalPrice) {
        this.originalPrice = originalPrice;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getSubcategory() {
        return subcategory;
    }

    public void setSubcategory(String subcategory) {
        this.subcategory = subcategory;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getImagePublicId() {
        return imagePublicId;
    }

    public void setImagePublicId(String imagePublicId) {
        this.imagePublicId = imagePublicId;
    }

    public String getWeight() {
        return weight;
    }

    public void setWeight(String weight) {
        this.weight = weight;
    }

    public Integer getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(Integer stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    public String getIngredients() {
        return ingredients;
    }

    public void setIngredients(String ingredients) {
        this.ingredients = ingredients;
    }

    public String getBenefits() {
        return benefits;
    }

    public void setBenefits(String benefits) {
        this.benefits = benefits;
    }

    public String getShortDescription() {
        return shortDescription;
    }

    public void setShortDescription(String shortDescription) {
        this.shortDescription = shortDescription;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public Boolean getInStock() {
        return inStock;
    }

    public void setInStock(Boolean inStock) {
        this.inStock = inStock;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Map<String, Object> getMetadata() {
        if (metadata == null) {
            metadata = new HashMap<>();
        }
        return metadata;
    }

    public void setMetadata(Map<String, Object> metadata) {
        this.metadata = metadata;
    }
    
    // Handle unknown properties (like badges, tags when sent as direct fields) by storing them in metadata
    @JsonAnySetter
    public void handleUnknownProperty(String key, Object value) {
        if (this.metadata == null) {
            this.metadata = new HashMap<>();
        }
        // Don't overwrite if the value is already in metadata
        if (!this.metadata.containsKey(key)) {
            this.metadata.put(key, value);
        }
    }

    // Provide a transient 'images' property for convenience so frontend can read product.images
    @Transient
    @SuppressWarnings("unchecked")
    public List<String> getImages() {
        if (this.metadata != null) {
            Object imgs = this.metadata.get("images");
            if (imgs instanceof List) {
                return (List<String>) imgs;
            }
        }
        List<String> single = new ArrayList<>();
        if (this.imageUrl != null && !this.imageUrl.isEmpty()) {
            single.add(this.imageUrl);
            return single;
        }
        return new ArrayList<>();
    }

    @Transient
    public void setImages(List<String> images) {
        if (this.metadata == null) this.metadata = new HashMap<>();
        this.metadata.put("images", images);
        if (images != null && !images.isEmpty()) {
            this.imageUrl = images.get(0);
        }
    }
    
    // Variant helper methods
    @Transient
    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> getVariants() {
        if (this.metadata != null) {
            Object variants = this.metadata.get("variants");
            if (variants instanceof List) {
                return (List<Map<String, Object>>) variants;
            }
        }
        return new ArrayList<>();
    }
    
    @Transient
    public void setVariants(List<Map<String, Object>> variants) {
        if (this.metadata == null) this.metadata = new HashMap<>();
        this.metadata.put("variants", variants);
    }
    
    @Transient
    public boolean hasVariants() {
        List<Map<String, Object>> variants = getVariants();
        return variants != null && !variants.isEmpty();
    }
    
    @Transient
    @SuppressWarnings("unchecked")
    public Map<String, Object> getVariantById(String variantId) {
        if (variantId == null || variantId.isEmpty()) return null;
        List<Map<String, Object>> variants = getVariants();
        for (Map<String, Object> variant : variants) {
            if (variantId.equals(variant.get("id"))) {
                return variant;
            }
        }
        return null;
    }
    
    @Transient
    public Integer getVariantStock(String variantId) {
        Map<String, Object> variant = getVariantById(variantId);
        if (variant != null) {
            Object stock = variant.get("stock");
            if (stock instanceof Number) {
                return ((Number) stock).intValue();
            } else if (stock instanceof String) {
                try {
                    return Integer.parseInt((String) stock);
                } catch (NumberFormatException e) {
                    return null;
                }
            }
        }
        return null;
    }
    
    @Transient
    public boolean isVariantInStock(String variantId) {
        Map<String, Object> variant = getVariantById(variantId);
        if (variant != null) {
            Integer stock = getVariantStock(variantId);
            return stock != null && stock > 0;
        }
        return false;
    }
    
    // Getters and setters for features
    public String getFeatures() {
        // Return from column if available, otherwise try metadata for backward compatibility
        if (features != null && !features.isEmpty()) {
            return features;
        }
        if (metadata != null) {
            Object featuresObj = metadata.get("features");
            if (featuresObj instanceof List) {
                try {
                    StringBuilder jsonBuilder = new StringBuilder("[");
                    boolean first = true;
                    for (Object feature : (List<?>) featuresObj) {
                        if (feature != null && !feature.toString().trim().isEmpty()) {
                            if (!first) jsonBuilder.append(", ");
                            jsonBuilder.append("\"").append(feature.toString().replace("\"", "\\\"")).append("\"");
                            first = false;
                        }
                    }
                    jsonBuilder.append("]");
                    return jsonBuilder.toString();
                } catch (Exception e) {
                    return null;
                }
            } else if (featuresObj instanceof String) {
                return (String) featuresObj;
            }
        }
        return features;
    }
    
    public void setFeatures(String features) {
        this.features = features;
    }
    
    // Handle features as array from frontend
    @JsonSetter("features")
    public void setFeaturesFromArray(Object featuresObj) {
        if (featuresObj == null) {
            this.features = null;
        } else if (featuresObj instanceof List) {
            try {
                this.features = new ObjectMapper().writeValueAsString(featuresObj);
            } catch (JsonProcessingException e) {
                this.features = null;
            }
        } else if (featuresObj instanceof String) {
            this.features = (String) featuresObj;
        }
    }
    
    // Transient getter for nutrition map (for backward compatibility)
    @Transient
    @SuppressWarnings("unchecked")
    public Map<String, String> getNutrition() {
        Map<String, String> nutrition = new HashMap<>();
        if (nutritionProtein != null) nutrition.put("protein", nutritionProtein);
        if (nutritionFat != null) nutrition.put("fat", nutritionFat);
        if (nutritionFiber != null) nutrition.put("fiber", nutritionFiber);
        if (nutritionMoisture != null) nutrition.put("moisture", nutritionMoisture);
        if (nutritionAsh != null) nutrition.put("ash", nutritionAsh);
        if (nutritionCalories != null) nutrition.put("calories", nutritionCalories);
        
        // If columns are empty, try metadata for backward compatibility
        if (nutrition.isEmpty() && metadata != null) {
            Object nutritionObj = metadata.get("nutrition");
            if (nutritionObj instanceof Map) {
                Map<String, Object> metaNutrition = (Map<String, Object>) nutritionObj;
                for (Map.Entry<String, Object> entry : metaNutrition.entrySet()) {
                    if (entry.getValue() != null) {
                        nutrition.put(entry.getKey(), entry.getValue().toString());
                    }
                }
            }
        }
        return nutrition;
    }
    
    // Getters and setters for nutrition
    public String getNutritionProtein() {
        return nutritionProtein;
    }
    
    public void setNutritionProtein(String nutritionProtein) {
        this.nutritionProtein = nutritionProtein;
    }
    
    public String getNutritionFat() {
        return nutritionFat;
    }
    
    public void setNutritionFat(String nutritionFat) {
        this.nutritionFat = nutritionFat;
    }
    
    public String getNutritionFiber() {
        return nutritionFiber;
    }
    
    public void setNutritionFiber(String nutritionFiber) {
        this.nutritionFiber = nutritionFiber;
    }
    
    public String getNutritionMoisture() {
        return nutritionMoisture;
    }
    
    public void setNutritionMoisture(String nutritionMoisture) {
        this.nutritionMoisture = nutritionMoisture;
    }
    
    public String getNutritionAsh() {
        return nutritionAsh;
    }
    
    public void setNutritionAsh(String nutritionAsh) {
        this.nutritionAsh = nutritionAsh;
    }
    
    public String getNutritionCalories() {
        return nutritionCalories;
    }
    
    public void setNutritionCalories(String nutritionCalories) {
        this.nutritionCalories = nutritionCalories;
    }
    
    // Getters and setters for pet and product attribute fields
    public String getPetType() {
        return petType;
    }
    
    public void setPetType(String petType) {
        this.petType = petType;
    }
    
    public String getMaterial() {
        return material;
    }
    
    public void setMaterial(String material) {
        this.material = material;
    }
    
    public String getScent() {
        return scent;
    }
    
    public void setScent(String scent) {
        this.scent = scent;
    }
    
    public String getSuitableFor() {
        return suitableFor;
    }
    
    public void setSuitableFor(String suitableFor) {
        this.suitableFor = suitableFor;
    }
    
    public String getTreatType() {
        return treatType;
    }
    
    public void setTreatType(String treatType) {
        this.treatType = treatType;
    }
    
    public String getTexture() {
        return texture;
    }
    
    public void setTexture(String texture) {
        this.texture = texture;
    }
    
    public String getSubcategoryLabel() {
        return subcategoryLabel;
    }
    
    public void setSubcategoryLabel(String subcategoryLabel) {
        this.subcategoryLabel = subcategoryLabel;
    }
    
    public String getServingSize() {
        return servingSize;
    }
    
    public void setServingSize(String servingSize) {
        this.servingSize = servingSize;
    }
    
    public String getPackCount() {
        return packCount;
    }
    
    public void setPackCount(String packCount) {
        this.packCount = packCount;
    }
    
    public String getWeightUnit() {
        return weightUnit;
    }
    
    public void setWeightUnit(String weightUnit) {
        this.weightUnit = weightUnit;
    }
    
    public String getFlavors() {
        return flavors;
    }
    
    public void setFlavors(String flavors) {
        this.flavors = flavors;
    }
    
    public String getColors() {
        return colors;
    }
    
    public void setColors(String colors) {
        this.colors = colors;
    }
    
    // Getters and setters for pharmacy fields
    public Boolean getPrescriptionRequired() {
        return prescriptionRequired;
    }
    
    public void setPrescriptionRequired(Boolean prescriptionRequired) {
        this.prescriptionRequired = prescriptionRequired;
    }
    
    public String getDosageForm() {
        return dosageForm;
    }
    
    public void setDosageForm(String dosageForm) {
        this.dosageForm = dosageForm;
    }
    
    public String getStrength() {
        return strength;
    }
    
    public void setStrength(String strength) {
        this.strength = strength;
    }
    
    public String getActiveIngredient() {
        return activeIngredient;
    }
    
    public void setActiveIngredient(String activeIngredient) {
        this.activeIngredient = activeIngredient;
    }
    
    public String getManufacturer() {
        return manufacturer;
    }
    
    public void setManufacturer(String manufacturer) {
        this.manufacturer = manufacturer;
    }
    
    public String getIndications() {
        return indications;
    }
    
    public void setIndications(String indications) {
        this.indications = indications;
    }
    
    public String getContraindications() {
        return contraindications;
    }
    
    public void setContraindications(String contraindications) {
        this.contraindications = contraindications;
    }
    
    public String getExpiryDate() {
        return expiryDate;
    }
    
    public void setExpiryDate(String expiryDate) {
        this.expiryDate = expiryDate;
    }
}