-- Add columns for EnhancedProductForm data storage
-- Features column for storing feature list as JSON or text
ALTER TABLE product ADD COLUMN IF NOT EXISTS features TEXT;

-- Nutrition information columns
ALTER TABLE product ADD COLUMN IF NOT EXISTS nutrition_protein VARCHAR(50);
ALTER TABLE product ADD COLUMN IF NOT EXISTS nutrition_fat VARCHAR(50);
ALTER TABLE product ADD COLUMN IF NOT EXISTS nutrition_fiber VARCHAR(50);
ALTER TABLE product ADD COLUMN IF NOT EXISTS nutrition_moisture VARCHAR(50);
ALTER TABLE product ADD COLUMN IF NOT EXISTS nutrition_ash VARCHAR(50);
ALTER TABLE product ADD COLUMN IF NOT EXISTS nutrition_calories VARCHAR(50);

