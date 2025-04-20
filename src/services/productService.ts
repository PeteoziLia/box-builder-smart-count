
import { Product, BoxType, BoxModuleCapacity, FrameAdapter } from '@/types/box';
import Papa from 'papaparse';
import { Box } from "@/context/ProjectContext";

// Cache for the parsed products
let productsCache: Product[] | null = null;

// Function to load and parse the CSV file
const loadProductsFromCSV = async (): Promise<Product[]> => {
  if (productsCache) return productsCache;
  
  try {
    const response = await fetch('/products_full.csv');
    const csvText = await response.text();
    
    const result = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
    });
    
    // Transform CSV data into our Product type format
    const products: Product[] = result.data.map((row: any) => ({
      sku: row.sku || "",
      name: row.name || "",
      description: row.description || "",
      regularPrice: parseFloat(row.regularPrice) || 0,
      series: row.series || "",
      brand: row.brand || "",
      attributes: {
        moduleSize: row.moduleSize ? parseInt(row.moduleSize) : undefined,
        category: row.category || undefined,
        smartHomeCompatible: row.smartHomeCompatible === "true" || row.smartHomeCompatible === "1",
        color: row.color || undefined,
        includesFrame: row.includesFrame === "true" || row.includesFrame === "1",
        isCompletePanel: row.isCompletePanel === "true" || row.isCompletePanel === "1",
      }
    }));
    
    productsCache = products;
    return products;
  } catch (error) {
    console.error("Error loading products from CSV:", error);
    return [];
  }
};

// Helper function to get all products
export const getAllProducts = async (): Promise<Product[]> => {
  return await loadProductsFromCSV();
};

export const getUniqueProductBrands = async (): Promise<string[]> => {
  const products = await loadProductsFromCSV();
  const brands = new Set<string>();
  products.forEach(product => brands.add(product.brand));
  return Array.from(brands);
};

export const getUniqueSeriesByBrand = async (brand: string): Promise<string[]> => {
  const products = await loadProductsFromCSV();
  const series = new Set<string>();
  products
    .filter(product => product.brand === brand)
    .forEach(product => series.add(product.series));
  return Array.from(series);
};

export const getAvailableColors = async (): Promise<string[]> => {
  const products = await loadProductsFromCSV();
  const colors = new Set<string>();
  products.forEach(product => {
    if (product.attributes.color) {
      colors.add(product.attributes.color);
    }
  });
  return Array.from(colors);
};

export const searchProducts = async (searchTerm: string, color?: string): Promise<Product[]> => {
  const products = await loadProductsFromCSV();
  const lowerSearchTerm = searchTerm.toLowerCase();
  return products.filter(product => 
    (product.sku.toLowerCase().includes(lowerSearchTerm) ||
     product.name.toLowerCase().includes(lowerSearchTerm) ||
     product.description.toLowerCase().includes(lowerSearchTerm)) &&
    (!color || color === "none" || product.attributes.color === color)
  );
};

export const filterProductsByBrandAndSeries = async (brand: string, series: string, color?: string): Promise<Product[]> => {
  const products = await loadProductsFromCSV();
  return products.filter(product => 
    product.brand === brand && 
    (series === "" || product.series === series) &&
    (!color || color === "none" || product.attributes.color === color)
  );
};

export const getProductBySku = async (sku: string): Promise<Product | undefined> => {
  const products = await loadProductsFromCSV();
  return products.find(product => product.sku === sku);
};

// Function to determine if a product can be installed in a box
export const isBoxCompatibleProduct = (product: Product): boolean => {
  return product.attributes.moduleSize !== undefined;
};

// Function to find products that match a specific color
export const getProductsByColor = async (color: string): Promise<Product[]> => {
  const products = await loadProductsFromCSV();
  return products.filter(product => 
    product.attributes.color === color && isBoxCompatibleProduct(product)
  );
};

// Function to find a frame for a box
export const getFrameForBox = async (box: Box): Promise<FrameAdapter | null> => {
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
export const getAdapterForBox = async (box: Box): Promise<FrameAdapter | null> => {
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
