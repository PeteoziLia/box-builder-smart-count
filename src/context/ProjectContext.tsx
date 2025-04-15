
import React, { createContext, useContext, useState, ReactNode } from "react";
import { SwitchProduct } from "../data/sampleSwitchData";

export interface BoxProduct {
  product: SwitchProduct;
  quantity: number;
}

export interface Box {
  id: string;
  name: string;
  area: string;
  description: string;
  moduleCapacity: number;
  products: BoxProduct[];
}

interface ProjectContextType {
  clientName: string;
  setClientName: (name: string) => void;
  boxes: Box[];
  addBox: (box: Omit<Box, 'id' | 'products'>) => void;
  updateBox: (boxId: string, boxData: Partial<Omit<Box, 'id' | 'products'>>) => void;
  deleteBox: (boxId: string) => void;
  addProductToBox: (boxId: string, product: SwitchProduct, quantity: number) => boolean;
  removeProductFromBox: (boxId: string, productSku: string) => void;
  updateProductQuantity: (boxId: string, productSku: string, quantity: number) => boolean;
  getUsedModules: (boxId: string) => number;
  getRemainingModules: (boxId: string) => number;
  getBoxById: (boxId: string) => Box | undefined;
  getCurrentProject: () => { clientName: string; boxes: Box[] };
  resetProject: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [clientName, setClientName] = useState<string>("");
  const [boxes, setBoxes] = useState<Box[]>([]);

  const addBox = (boxData: Omit<Box, 'id' | 'products'>) => {
    const newBox: Box = {
      ...boxData,
      id: Date.now().toString(),
      products: [],
    };
    setBoxes([...boxes, newBox]);
  };

  const updateBox = (boxId: string, boxData: Partial<Omit<Box, 'id' | 'products'>>) => {
    setBoxes(
      boxes.map((box) =>
        box.id === boxId ? { ...box, ...boxData } : box
      )
    );
  };

  const deleteBox = (boxId: string) => {
    setBoxes(boxes.filter((box) => box.id !== boxId));
  };

  const getUsedModules = (boxId: string): number => {
    const box = boxes.find((b) => b.id === boxId);
    if (!box) return 0;
    
    return box.products.reduce(
      (total, item) => total + (item.product.moduleSize * item.quantity),
      0
    );
  };

  const getRemainingModules = (boxId: string): number => {
    const box = boxes.find((b) => b.id === boxId);
    if (!box) return 0;
    
    const usedModules = getUsedModules(boxId);
    return box.moduleCapacity - usedModules;
  };

  const addProductToBox = (boxId: string, product: SwitchProduct, quantity: number): boolean => {
    const box = boxes.find((b) => b.id === boxId);
    if (!box) return false;

    const totalModulesNeeded = product.moduleSize * quantity;
    const remainingModules = getRemainingModules(boxId);

    if (totalModulesNeeded > remainingModules) {
      return false; // Not enough space
    }

    const existingProductIndex = box.products.findIndex(
      (p) => p.product.sku === product.sku
    );

    const updatedBoxes = boxes.map((b) => {
      if (b.id !== boxId) return b;

      const updatedProducts = [...b.products];
      
      if (existingProductIndex >= 0) {
        updatedProducts[existingProductIndex] = {
          ...updatedProducts[existingProductIndex],
          quantity: updatedProducts[existingProductIndex].quantity + quantity,
        };
      } else {
        updatedProducts.push({ product, quantity });
      }

      return { ...b, products: updatedProducts };
    });

    setBoxes(updatedBoxes);
    return true;
  };

  const updateProductQuantity = (boxId: string, productSku: string, quantity: number): boolean => {
    const box = boxes.find((b) => b.id === boxId);
    if (!box) return false;

    const productIndex = box.products.findIndex(
      (p) => p.product.sku === productSku
    );
    if (productIndex === -1) return false;

    const product = box.products[productIndex].product;
    const currentQuantity = box.products[productIndex].quantity;
    const currentModules = product.moduleSize * currentQuantity;
    const newModules = product.moduleSize * quantity;
    const moduleDifference = newModules - currentModules;

    // Check if there's enough space
    const remainingModules = getRemainingModules(boxId);
    if (moduleDifference > remainingModules) {
      return false;
    }

    const updatedBoxes = boxes.map((b) => {
      if (b.id !== boxId) return b;

      const updatedProducts = [...b.products];
      updatedProducts[productIndex] = {
        ...updatedProducts[productIndex],
        quantity,
      };

      // Remove product if quantity is 0
      if (quantity === 0) {
        updatedProducts.splice(productIndex, 1);
      }

      return { ...b, products: updatedProducts };
    });

    setBoxes(updatedBoxes);
    return true;
  };

  const removeProductFromBox = (boxId: string, productSku: string) => {
    setBoxes(
      boxes.map((box) => {
        if (box.id !== boxId) return box;
        return {
          ...box,
          products: box.products.filter((p) => p.product.sku !== productSku),
        };
      })
    );
  };

  const getBoxById = (boxId: string) => {
    return boxes.find((box) => box.id === boxId);
  };

  const getCurrentProject = () => {
    return {
      clientName,
      boxes,
    };
  };

  const resetProject = () => {
    setClientName("");
    setBoxes([]);
  };

  return (
    <ProjectContext.Provider
      value={{
        clientName,
        setClientName,
        boxes,
        addBox,
        updateBox,
        deleteBox,
        addProductToBox,
        removeProductFromBox,
        updateProductQuantity,
        getUsedModules,
        getRemainingModules,
        getBoxById,
        getCurrentProject,
        resetProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
};
