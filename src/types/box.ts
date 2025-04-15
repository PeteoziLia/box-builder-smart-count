
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
}

export interface ComplementaryProductData {
  sku: string;
  name: string;
  quantity: number;
  area: string;
  description?: string;
}

