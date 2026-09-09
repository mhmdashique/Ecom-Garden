// Variant pricing logic for Lucky Bamboo and generic products
// Data structure: { productId, name, variants: [{id,label,priceMin,priceMax}] }

export function getDisplayPrice(variant) {
  return variant.priceMin === variant.priceMax
    ? `₹${variant.priceMin}`
    : `₹${variant.priceMin}–₹${variant.priceMax}`;
}

export function renderVariantOptions(product) {
  if (!product?.variants) return [];
  return product.variants.map((v) => ({
    id: v.id,
    label: v.label,
    priceText: getDisplayPrice(v),
  }));
}

export function selectVariantAndPrice(product, variantId, chosenPrice) {
  const variant = product.variants.find((v) => v.id === variantId);
  if (!variant) throw new Error("Invalid variant");
  const price = Number(chosenPrice);
  if (price < variant.priceMin || price > variant.priceMax) {
    throw new Error(
      `Price must be between ₹${variant.priceMin}–₹${variant.priceMax} for "${variant.label}"`,
    );
  }
  return {
    variant: variant.label,
    variantId: variant.id,
    unitPrice: price,
    priceMin: variant.priceMin,
    priceMax: variant.priceMax,
  };
}

export function calculateTotal(unitPrice, quantity) {
  return unitPrice * quantity;
}

// Helper to get product display for Lucky Bamboo default
export const luckyBambooProduct = {
  productId: "lucky-bamboo",
  name: "Lucky Bamboo",
  variants: [
    {
      id: "plastic-pot",
      label: "With Plastic Pot",
      priceMin: 150,
      priceMax: 150,
    },
    { id: "cutting", label: "Cutting", priceMin: 50, priceMax: 50 },
    {
      id: "cutting-cover",
      label: "Cutting + Plastic Cover",
      priceMin: 95,
      priceMax: 95,
    },
  ],
};

// Variant UI helper: decides if customer picks price or seller finalizes
// Change this flag to switch mode
export const PRICING_MODE = {
  CUSTOMER_PICKS: "customer", // customer selects exact price via slider/input within range
  SELLER_FINALIZES: "seller", // customer sees range, seller/admin sets final price after order
};
