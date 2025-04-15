
// This is sample data to emulate the CSV structure
export interface SwitchProduct {
  sku: string;
  productName: string;
  description: string;
  moduleSize: number;
  series: string;
  brand: string;
  color: string;
  price: number;
  imageUrl?: string;
}

export const sampleSwitchData: SwitchProduct[] = [
  {
    sku: "HD4001",
    productName: "1-Way Switch",
    description: "1-module one-way switch",
    moduleSize: 1,
    series: "Axolute",
    brand: "Bticino",
    color: "White",
    price: 12.50,
  },
  {
    sku: "HD4003",
    productName: "2-Way Switch",
    description: "1-module two-way switch",
    moduleSize: 1,
    series: "Axolute",
    brand: "Bticino",
    color: "White",
    price: 14.75,
  },
  {
    sku: "HD4004",
    productName: "Cross Switch",
    description: "1-module cross switch",
    moduleSize: 1,
    series: "Axolute",
    brand: "Bticino",
    color: "White",
    price: 19.99,
  },
  {
    sku: "HD4012",
    productName: "Pushbutton",
    description: "1-module pushbutton",
    moduleSize: 1,
    series: "Axolute", 
    brand: "Bticino",
    color: "White",
    price: 15.25,
  },
  {
    sku: "HD4027",
    productName: "Socket",
    description: "2-module power socket",
    moduleSize: 2,
    series: "Axolute",
    brand: "Bticino",
    color: "White",
    price: 22.50,
  },
  {
    sku: "LN4001",
    productName: "1-Way Switch",
    description: "1-module one-way switch",
    moduleSize: 1,
    series: "Living Light",
    brand: "Bticino",
    color: "Tech",
    price: 10.50,
  },
  {
    sku: "LN4003",
    productName: "2-Way Switch",
    description: "1-module two-way switch",
    moduleSize: 1,
    series: "Living Light",
    brand: "Bticino",
    color: "Tech",
    price: 12.25,
  },
  {
    sku: "LN4027",
    productName: "Socket",
    description: "2-module power socket",
    moduleSize: 2,
    series: "Living Light",
    brand: "Bticino",
    color: "Tech",
    price: 18.75,
  },
  {
    sku: "GW12501",
    productName: "1-Way Switch",
    description: "1-module one-way switch",
    moduleSize: 1,
    series: "System",
    brand: "Gewiss",
    color: "White",
    price: 9.99,
  },
  {
    sku: "GW12503",
    productName: "2-Way Switch",
    description: "1-module two-way switch",
    moduleSize: 1,
    series: "System",
    brand: "Gewiss",
    color: "White",
    price: 11.50,
  }
];

// Helper function to get unique brands from the data
export const getUniqueBrands = (): string[] => {
  const brands = new Set<string>();
  sampleSwitchData.forEach(product => brands.add(product.brand));
  return Array.from(brands);
};

// Helper function to get unique series by brand
export const getUniqueSeriesByBrand = (brand: string): string[] => {
  const series = new Set<string>();
  sampleSwitchData
    .filter(product => product.brand === brand)
    .forEach(product => series.add(product.series));
  return Array.from(series);
};

// Helper function to filter products by search term
export const searchProducts = (searchTerm: string): SwitchProduct[] => {
  const lowerSearchTerm = searchTerm.toLowerCase();
  return sampleSwitchData.filter(product => 
    product.sku.toLowerCase().includes(lowerSearchTerm) ||
    product.productName.toLowerCase().includes(lowerSearchTerm) ||
    product.description.toLowerCase().includes(lowerSearchTerm)
  );
};

// Helper function to filter products by brand and series
export const filterProductsByBrandAndSeries = (brand: string, series: string): SwitchProduct[] => {
  return sampleSwitchData.filter(product => 
    product.brand === brand && 
    (series === "" || product.series === series)
  );
};
