
import { Product, BoxType, BoxModuleCapacity, FrameAdapter } from '@/types/box';
import Papa from 'papaparse';
import { Box } from "@/context/ProjectContext";

// Cache for the parsed products
let productsCache: Product[] | null = null;

// Function to load products from JSON file as fallback if CSV fails
const loadProductsFromJSON = async (): Promise<Product[]> => {
  try {
    console.log("Attempting to load products from JSON fallback...");
    const response = await fetch('/products_full.json');
    
    if (!response.ok) {
      console.error("Failed to fetch JSON file:", response.status, response.statusText);
      return [];
    }
    
    const data = await response.json();
    console.log("JSON data loaded, items:", data.length);
    
    // Transform JSON data into our Product type format
    const products: Product[] = data.map((item: any) => ({
      sku: item.sku || "",
      name: item.name || "",
      description: item.description || "",
      regularPrice: parseFloat(item.price) || 0,
      series: item.series || "",
      brand: item.brand || "",
      attributes: {
        moduleSize: item.moduleSize ? parseInt(item.moduleSize) : 2, // Default module size
        category: item.category || undefined,
        smartHomeCompatible: item.smartHomeCompatible === true || item.smartHomeCompatible === "true",
        color: item.color || undefined,
        includesFrame: item.includesFrame === true || item.includesFrame === "true",
        isCompletePanel: item.isCompletePanel === true || item.isCompletePanel === "true"
      }
    }));
    
    console.log("Normalized JSON products:", products.length, "items");
    if (products.length > 0) {
      console.log("First product from JSON:", products[0]);
    }
    
    return products;
  } catch (error) {
    console.error("Error loading products from JSON:", error);
    return [];
  }
};

// Function to load and parse the CSV file
const loadProductsFromCSV = async (): Promise<Product[]> => {
  if (productsCache) {
    console.log("Using cached products:", productsCache.length, "items");
    return productsCache;
  }
  
  try {
    console.log("Fetching CSV file...");
    const response = await fetch('/products_full.csv');
    
    if (!response.ok) {
      console.error("Failed to fetch CSV file:", response.status, response.statusText);
      console.log("Falling back to JSON data");
      return await loadProductsFromJSON();
    }
    
    const csvText = await response.text();
    console.log("CSV text loaded, length:", csvText.length);
    
    // Check if what we got looks like HTML instead of CSV (common error)
    if (csvText.trim().startsWith('<!DOCTYPE html>') || csvText.trim().startsWith('<html>')) {
      console.error("Received HTML instead of CSV, falling back to JSON");
      return await loadProductsFromJSON();
    }
    
    const result = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
    });
    
    console.log("CSV parse result:", result.meta);
    
    if (result.errors && result.errors.length > 0) {
      console.error("CSV parsing errors:", result.errors);
    }
    
    if (!result.data || result.data.length === 0) {
      console.error("No data parsed from CSV, falling back to JSON");
      return await loadProductsFromJSON();
    }
    
    // Transform CSV data into our Product type format with improved normalization
    const products: Product[] = [];
    
    result.data.forEach((row: any) => {
      try {
        // Skip empty rows or rows without essential data
        if (!row || (!row.sku && !row.name)) {
          return;
        }
        
        // Extract and normalize data
        const product: Product = {
          sku: row.sku?.trim() || "",
          name: row.name?.trim() || "",
          description: row.description?.trim() || "",
          regularPrice: parseFloat(row.regularPrice) || 0,
          series: row.series?.trim() || "",
          brand: row.brand?.trim() || "",
          attributes: {
            moduleSize: row.moduleSize ? parseInt(row.moduleSize) : undefined,
            category: row.category?.trim() || undefined,
            smartHomeCompatible: row.smartHomeCompatible === "true" || row.smartHomeCompatible === "1",
            color: row.color?.trim() || undefined,
            includesFrame: row.includesFrame === "true" || row.includesFrame === "1",
            isCompletePanel: row.isCompletePanel === "true" || row.isCompletePanel === "1",
          }
        };
        
        // Process dynamic attribute columns
        Object.keys(row).forEach(key => {
          // Handle attributes with pattern "Attribute X name" and "Attribute X value"
          if (key.match(/Attribute \d+ name/i)) {
            const attrNumMatch = key.match(/Attribute (\d+) name/i);
            if (attrNumMatch) {
              const attrNum = attrNumMatch[1];
              const attrValueKey = `Attribute ${attrNum} value`;
              const attrName = row[key]?.trim();
              const attrValue = row[attrValueKey]?.trim();
              
              if (attrName && attrValue) {
                // Normalize specific attributes we care about
                if (attrName.toLowerCase().includes("color") || 
                    attrName.toLowerCase().includes("צבע") || 
                    attrName.toLowerCase().includes("colour")) {
                  product.attributes.color = attrValue;
                } 
                else if (attrName.toLowerCase().includes("series") || 
                         attrName.toLowerCase().includes("סדרה")) {
                  product.series = attrValue;
                }
                else if (attrName.toLowerCase().includes("brand") || 
                         attrName.toLowerCase().includes("מותג")) {
                  product.brand = attrValue;
                }
                else if (attrName.toLowerCase().includes("module") || 
                         attrName.toLowerCase().includes("יחידות מודול") || 
                         attrName.toLowerCase().includes("מקום") ||
                         attrName.toLowerCase().includes("גודל")) {
                  const moduleSize = parseInt(attrValue);
                  if (!isNaN(moduleSize)) {
                    product.attributes.moduleSize = moduleSize;
                  }
                } 
                else {
                  // Store any other attributes
                  if (!product.attributes[attrName]) {
                    product.attributes[attrName] = attrValue;
                  }
                }
              }
            }
          }
        });
        
        // Default module size if not found
        if (product.attributes.moduleSize === undefined) {
          product.attributes.moduleSize = 2; // Default to 2 modules if not specified
        }
        
        // Only add products with essential information
        if (product.sku && product.name) {
          products.push(product);
        }
      } catch (error) {
        console.error("Error processing product row:", error, row);
      }
    });
    
    console.log("Normalized products:", products.length, "items");
    if (products.length > 0) {
      console.log("First product sample:", products[0]);
    }
    
    // If no products were parsed successfully, fall back to JSON
    if (products.length === 0) {
      console.error("No valid products parsed from CSV, falling back to JSON");
      return await loadProductsFromJSON();
    }
    
    // Create mock products if all else fails
    if (products.length === 0) {
      console.error("Both CSV and JSON loading failed. Creating mock products");
      return createMockProducts();
    }
    
    productsCache = products;
    return products;
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
  
  const brands = ["Bticino", "Legrand", "Gewiss"];
  const series = ["Living Now", "Matix", "Axolute"];
  const colors = ["White", "Black", "Beige", "Anthracite"];
  
  // Create 50 mock products
  for (let i = 1; i <= 50; i++) {
    const brand = brands[i % brands.length];
    const serie = series[i % series.length];
    const color = colors[i % colors.length];
    const moduleSize = (i % 3) + 1; // 1, 2, or 3 modules
    
    mockProducts.push({
      sku: `MOCK-${i.toString().padStart(4, '0')}`,
      name: `${brand} ${serie} ${i % 2 === 0 ? "Switch" : "Socket"} ${moduleSize}M`,
      description: `Mock product description for testing`,
      regularPrice: 9.99 + (i * 1.5),
      series: serie,
      brand: brand,
      attributes: {
        moduleSize: moduleSize,
        category: i % 2 === 0 ? "Switches" : "Sockets",
        smartHomeCompatible: i % 3 === 0,
        color: color,
        includesFrame: i % 5 === 0,
        isCompletePanel: i % 7 === 0
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
     product.description.toLowerCase().includes(lowerSearchTerm)) &&
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
