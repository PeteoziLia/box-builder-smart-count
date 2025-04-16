
import productData from '@/products_full.json';
import { Product, BoxType, BoxModuleCapacity, FrameAdapter, Box } from '@/types/box';

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

export const getAvailableColors = (): string[] => {
  const colors = new Set<string>();
  products.forEach(product => {
    if (product.attributes.color) {
      colors.add(product.attributes.color);
    }
  });
  return Array.from(colors);
};

export const searchProducts = (searchTerm: string, color?: string): Product[] => {
  const lowerSearchTerm = searchTerm.toLowerCase();
  return products.filter(product => 
    (product.sku.toLowerCase().includes(lowerSearchTerm) ||
     product.name.toLowerCase().includes(lowerSearchTerm) ||
     product.description.toLowerCase().includes(lowerSearchTerm)) &&
    (!color || product.attributes.color === color)
  );
};

export const filterProductsByBrandAndSeries = (brand: string, series: string, color?: string): Product[] => {
  return products.filter(product => 
    product.brand === brand && 
    (series === "" || product.series === series) &&
    (!color || product.attributes.color === color)
  );
};

export const getProductBySku = (sku: string): Product | undefined => {
  return products.find(product => product.sku === sku);
};

// Function to determine if a product can be installed in a box
export const isBoxCompatibleProduct = (product: Product): boolean => {
  return product.attributes.moduleSize !== undefined;
};

// Function to find products that match a specific color
export const getProductsByColor = (color: string): Product[] => {
  return products.filter(product => 
    product.attributes.color === color && isBoxCompatibleProduct(product)
  );
};

// Function to find a frame for a box
export const getFrameForBox = (box: Box): FrameAdapter | null => {
  // Check if the box needs a frame
  const needsFrame = box.products.length > 0 && 
    !box.products.some(item => 
      item.product.attributes.includesFrame || 
      item.product.attributes.isCompletePanel
    );
  
  if (!needsFrame) {
    return null;
  }
  
  // Find the appropriate frame based on box type, module capacity, and color
  const frameSku = `FRAME-${box.boxType}-${box.moduleCapacity}${box.color ? `-${box.color}` : ''}`;
  
  // This is a simplified version - in a real app, you would search the actual products
  // for a matching frame based on attributes
  const frame: FrameAdapter = {
    type: 'frame',
    sku: frameSku,
    name: `Frame for ${box.boxType} (${box.moduleCapacity} modules)${box.color ? ` - ${box.color}` : ''}`,
    regularPrice: 15.99, // Example price
    forBoxType: box.boxType,
    moduleCapacity: box.moduleCapacity,
    color: box.color
  };
  
  return frame;
};

// Function to find an adapter for a box
export const getAdapterForBox = (box: Box): FrameAdapter | null => {
  // Find the appropriate adapter based on box type and module capacity
  const adapterSku = `ADAPTER-${box.boxType}-${box.moduleCapacity}`;
  
  // This is a simplified version - in a real app, you would search the actual products
  // for a matching adapter based on attributes
  const adapter: FrameAdapter = {
    type: 'adapter',
    sku: adapterSku,
    name: `Adapter for ${box.boxType} (${box.moduleCapacity} modules)`,
    regularPrice: 8.99, // Example price
    forBoxType: box.boxType,
    moduleCapacity: box.moduleCapacity
  };
  
  return adapter;
};
