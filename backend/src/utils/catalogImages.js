const canonicalImagesBySku = {
  "GN-CAL-002": ["/calathea plant.jpg", "/red calathea.jpg"],
  "GN-PATH-004": ["/paathi pull.jpg"],
  "GN-AREC-006": ["/palm.jpg"],
  "GN-LUCK-005": ["/lucky bamboo.jpg"],
};

export function applyCatalogImageOverrides(plant) {
  const images = canonicalImagesBySku[plant?.sku];
  return images ? { ...plant, images: [...images] } : plant;
}
