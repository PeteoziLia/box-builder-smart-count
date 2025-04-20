
export type BoxType = '55 Box' | 'Rectangular Box';

export const BOX_MODULE_CAPACITIES = {
  '55 Box': [1, 2],
  'Rectangular Box': [1, 2, 3, 4, 5, 6]
} as const;

export type BoxModuleCapacity = (typeof BOX_MODULE_CAPACITIES)[BoxType][number];

export interface BoxFormData {
  name: string;
  area: string;
  description: string;
  boxType: BoxType;
  moduleCapacity: BoxModuleCapacity;
  color?: string; // Added color field
}

export interface ProductAttributes {
  moduleSize?: number;
  category?: string;
  smartHomeCompatible?: boolean;
  color?: string; // Added color attribute
  includesFrame?: boolean; // Indicates if product includes a frame
  isCompletePanel?: boolean; // Indicates if product is a complete panel
  [key: string]: any; // Allow for additional attributes
}

export interface Product {
  sku: string;  
  name: string;
  description: string;
  regularPrice: number;
  series: string;
  brand: string;
  attributes: ProductAttributes;
}

export interface ComplementaryProductData {
  sku: string;
  name: string;
  quantity: number;
  area: string;
  description?: string;
}

export interface FrameAdapter {
  type: 'frame' | 'adapter';
  sku: string;
  name: string;
  regularPrice: number;
  forBoxType: BoxType;
  moduleCapacity: BoxModuleCapacity;
  color?: string;
}
