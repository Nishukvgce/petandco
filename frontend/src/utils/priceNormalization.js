// Price normalization utility for components that need to handle variant prices
export const normalizePrice = (product) => {
  let price = parseFloat(product?.price ?? product?.salePrice ?? 0) || 0;
  let originalPrice = parseFloat(product?.originalPrice ?? product?.mrp ?? 0) || 0;
  
  // If main price is 0, check if variants have prices
  const variants = product?.variants || [];
  if (price === 0 && variants.length > 0) {
    const firstVariant = variants[0];
    if (firstVariant && typeof firstVariant === 'object' && firstVariant.price) {
      price = parseFloat(firstVariant.price) || 0;
      if (originalPrice === 0 && firstVariant.originalPrice) {
        originalPrice = parseFloat(firstVariant.originalPrice) || 0;
      }
    }
  }
  
  return { price, originalPrice };
};