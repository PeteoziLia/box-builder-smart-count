
import productData from '@/products_full.json';
import { Product } from '@/types/box';

const products: Product[] = productData;

export const getUniqueProductBrands = (): string[] => {
  const brands = new Set<string>();
  products.forEach(product => brands.add(product.brand));
  return Array.from(brands);
};

export const getUniqueSeriesByBrand = (brand: string): string[] => {
  const series = new Set<string>();
  products
    .filter(product => product.brand === brand)
    .forEach(product => series.add(product.series));
  return Array.from(series);
};

export const searchProducts = (searchTerm: string): Product[] => {
  const lowerSearchTerm = searchTerm.toLowerCase();
  return products.filter(product => 
    product.sku.toLowerCase().includes(lowerSearchTerm) ||
    product.name.toLowerCase().includes(lowerSearchTerm) ||
    product.description.toLowerCase().includes(lowerSearchTerm)
  );
};

export const filterProductsByBrandAndSeries = (brand: string, series: string): Product[] => {
  return products.filter(product => 
    product.brand === brand && 
    (series === "" || product.series === series)
  );
};

export const getProductBySku = (sku: string): Product | undefined => {
  return products.find(product => product.sku === sku);
};

// Function to determine if a product can be installed in a box
export const isBoxCompatibleProduct = (product: Product): boolean => {
  return product.attributes.moduleSize !== undefined;
};
