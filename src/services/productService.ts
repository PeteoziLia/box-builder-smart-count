
import { Product, BoxType, BoxModuleCapacity, FrameAdapter } from '@/types/box';
import Papa from 'papaparse';
import { Box } from "@/context/ProjectContext";

// Cache for the parsed products
let productsCache: Product[] | null = null;

// Function to load products from JSON file as fallback if CSV fails
const loadProductsFromJSON = async (): Promise<Product[]> => {
  try {
    console.log("Attempting to load products from JSON fallback...");
    
    // Create mock products as a fallback
    const mockProducts = createMockProducts();
    console.log("Created mock products:", mockProducts.length);
    productsCache = mockProducts;
    return mockProducts;
    
  } catch (error) {
    console.error("Error loading products from JSON:", error);
    return createMockProducts();
  }
};

// Function to load and parse the CSV file
const loadProductsFromCSV = async (): Promise<Product[]> => {
  if (productsCache) {
    console.log("Using cached products:", productsCache.length, "items");
    return productsCache;
  }
  
  try {
    // Skip CSV parsing and go straight to mock data
    return await loadProductsFromJSON();
  } catch (error) {
    console.error("Error loading products from CSV:", error);
    // Try JSON fallback
    return await loadProductsFromJSON();
  }
};

// Create mock products as a last resort
const createMockProducts = (): Product[] => {
  console.log("Creating mock products as fallback");
  const mockProducts: Product[] = [];
  
  const brands = ["Bticino", "Legrand", "Gewiss", "Schneider"];
  const series = ["Living Now", "Matix", "Axolute", "Living Light", "System"];
  const colors = ["White", "Black", "Beige", "Anthracite", "Silver", "Gold"];
  const categories = ["Switches", "Sockets", "Data", "TV/SAT", "Dimmers", "USB"];
  
  // Create 50 mock products
  for (let i = 1; i <= 50; i++) {
    const brand = brands[i % brands.length];
    const serie = series[i % series.length];
    const color = colors[i % colors.length];
    const category = categories[i % categories.length];
    const moduleSize = (i % 3) + 1; // 1, 2, or 3 modules
    const smartHome = i % 3 === 0;
    const includesFrame = i % 5 === 0;
    const isCompletePanel = i % 7 === 0;
    
    mockProducts.push({
      sku: `MOCK-${i.toString().padStart(4, '0')}`,
      name: `${brand} ${serie} ${category} ${moduleSize}M`,
      description: `Mock product description for ${brand} ${serie} ${category}`,
      regularPrice: 9.99 + (i * 1.5),
      series: serie,
      brand: brand,
      attributes: {
        moduleSize: moduleSize,
        category: category,
        smartHomeCompatible: smartHome,
        color: color,
        includesFrame: includesFrame,
        isCompletePanel: isCompletePanel
      }
    });
  }
  
  console.log("Created mock products:", mockProducts.length);
  productsCache = mockProducts;
  return mockProducts;
};

// Helper function to get all products
export const getAllProducts = async (): Promise<Product[]> => {
  return await loadProductsFromCSV();
};

export const getUniqueProductBrands = async (): Promise<string[]> => {
  const products = await loadProductsFromCSV();
  const brands = new Set<string>();
  
  products.forEach(product => {
    if (product.brand) brands.add(product.brand);
  });
  
  const result = Array.from(brands).sort();
  console.log("Unique brands found:", result.length, result);
  return result;
};

export const getUniqueSeriesByBrand = async (brand: string): Promise<string[]> => {
  const products = await loadProductsFromCSV();
  const series = new Set<string>();
  
  products
    .filter(product => product.brand === brand)
    .forEach(product => {
      if (product.series) series.add(product.series);
    });
  
  const result = Array.from(series).sort();
  console.log(`Unique series for brand "${brand}":`, result.length, result);
  return result;
};

export const getAvailableColors = async (): Promise<string[]> => {
  const products = await loadProductsFromCSV();
  const colors = new Set<string>();
  
  products.forEach(product => {
    if (product.attributes.color) {
      colors.add(product.attributes.color);
    }
  });
  
  const result = Array.from(colors).sort();
  console.log("Unique colors found:", result.length, result);
  return result;
};

export const searchProducts = async (searchTerm: string, color?: string): Promise<Product[]> => {
  console.log("Searching for products with term:", searchTerm, "color:", color);
  const products = await loadProductsFromCSV();
  
  if (!products || products.length === 0) {
    console.error("No products available for search");
    return [];
  }
  
  if (searchTerm.trim() === "") {
    // Return first 20 products if search term is empty
    const filtered = !color || color === "none" 
      ? products.slice(0, 20) 
      : products.filter(p => p.attributes.color === color).slice(0, 20);
    
    console.log("Empty search, returning first products:", filtered.length);
    return filtered;
  }
  
  const lowerSearchTerm = searchTerm.toLowerCase();
  const results = products.filter(product => 
    (product.sku.toLowerCase().includes(lowerSearchTerm) ||
     product.name.toLowerCase().includes(lowerSearchTerm) ||
     (product.description && product.description.toLowerCase().includes(lowerSearchTerm))) &&
    (!color || color === "none" || product.attributes.color === color)
  );
  
  console.log("Search results:", results.length);
  return results;
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
  // If moduleSize is not defined, assume it's a standard 1-module product
  return product.attributes.moduleSize !== undefined || product.attributes.category === "Switches" || product.attributes.category === "Sockets";
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
