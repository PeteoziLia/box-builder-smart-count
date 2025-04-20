
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useProject } from "@/context/ProjectContext";
import { getUniqueProductBrands, getUniqueSeriesByBrand, getAvailableColors } from "@/services/productService";

export type WizardStep = 
  | "client-info" 
  | "default-selection" 
  | "create-box" 
  | "add-products" 
  | "add-complementary" 
  | "review";

interface WizardContextType {
  currentStep: WizardStep;
  goToStep: (step: WizardStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
  activeBoxId: string | null;
  setActiveBoxId: (id: string | null) => void;
  defaultBrand: string;
  setDefaultBrand: (brand: string) => void;
  defaultSeries: string;
  setDefaultSeries: (series: string) => void;
  defaultColor: string;
  setDefaultColor: (color: string) => void;
  availableBrands: string[];
  availableSeries: string[];
  availableColors: string[];
  loadingOptions: boolean;
}

const WizardContext = createContext<WizardContextType | undefined>(undefined);

export const WizardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { boxes } = useProject();
  const [currentStep, setCurrentStep] = useState<WizardStep>("client-info");
  const [activeBoxId, setActiveBoxId] = useState<string | null>(null);
  const [defaultBrand, setDefaultBrand] = useState<string>("");
  const [defaultSeries, setDefaultSeries] = useState<string>("");
  const [defaultColor, setDefaultColor] = useState<string>("");
  
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [availableSeries, setAvailableSeries] = useState<string[]>([]);
  const [availableColors, setAvailableColors] = useState<string[]>([]);
  const [loadingOptions, setLoadingOptions] = useState<boolean>(false);
  
  const steps: WizardStep[] = [
    "client-info",
    "default-selection",
    "create-box",
    "add-products",
    "add-complementary",
    "review"
  ];
  
  const currentStepIndex = steps.indexOf(currentStep);
  const canGoNext = currentStepIndex < steps.length - 1;
  const canGoPrev = currentStepIndex > 0;
  
  const goToStep = (step: WizardStep) => {
    setCurrentStep(step);
  };
  
  const nextStep = () => {
    if (canGoNext) {
      setCurrentStep(steps[currentStepIndex + 1]);
    }
  };
  
  const prevStep = () => {
    if (canGoPrev) {
      setCurrentStep(steps[currentStepIndex - 1]);
    }
  };
  
  // Load available brands when component mounts
  useEffect(() => {
    const loadBrands = async () => {
      setLoadingOptions(true);
      try {
        const brands = await getUniqueProductBrands();
        setAvailableBrands(brands);
        if (brands.length > 0 && !defaultBrand) {
          setDefaultBrand(brands[0]);
        }
      } catch (error) {
        console.error("Error loading brands:", error);
      } finally {
        setLoadingOptions(false);
      }
    };
    
    loadBrands();
  }, []);
  
  // Load available series when brand changes
  useEffect(() => {
    if (!defaultBrand) return;
    
    const loadSeries = async () => {
      setLoadingOptions(true);
      try {
        const series = await getUniqueSeriesByBrand(defaultBrand);
        setAvailableSeries(series);
        if (series.length > 0) {
          setDefaultSeries(series[0]);
        } else {
          setDefaultSeries("");
        }
      } catch (error) {
        console.error("Error loading series:", error);
      } finally {
        setLoadingOptions(false);
      }
    };
    
    loadSeries();
  }, [defaultBrand]);
  
  // Load available colors
  useEffect(() => {
    const loadColors = async () => {
      setLoadingOptions(true);
      try {
        const colors = await getAvailableColors();
        setAvailableColors(colors);
        if (colors.length > 0 && !defaultColor) {
          setDefaultColor(colors[0]);
        }
      } catch (error) {
        console.error("Error loading colors:", error);
      } finally {
        setLoadingOptions(false);
      }
    };
    
    loadColors();
  }, []);
  
  // Set the active box when boxes change
  useEffect(() => {
    if (boxes.length > 0 && !activeBoxId) {
      setActiveBoxId(boxes[0].id);
    } else if (boxes.length === 0) {
      setActiveBoxId(null);
    } else if (activeBoxId && !boxes.some(box => box.id === activeBoxId)) {
      setActiveBoxId(boxes[0].id);
    }
  }, [boxes, activeBoxId]);
  
  return (
    <WizardContext.Provider
      value={{
        currentStep,
        goToStep,
        nextStep,
        prevStep,
        canGoNext,
        canGoPrev,
        activeBoxId,
        setActiveBoxId,
        defaultBrand,
        setDefaultBrand,
        defaultSeries,
        setDefaultSeries,
        defaultColor,
        setDefaultColor,
        availableBrands,
        availableSeries,
        availableColors,
        loadingOptions
      }}
    >
      {children}
    </WizardContext.Provider>
  );
};

export const useWizard = (): WizardContextType => {
  const context = useContext(WizardContext);
  if (context === undefined) {
    throw new Error("useWizard must be used within a WizardProvider");
  }
  return context;
};
