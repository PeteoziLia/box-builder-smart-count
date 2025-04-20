
import React from "react";
import { useWizard } from "@/context/WizardContext";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const DefaultSelection: React.FC = () => {
  const {
    defaultBrand,
    setDefaultBrand,
    defaultSeries,
    setDefaultSeries,
    defaultColor,
    setDefaultColor,
    availableBrands,
    availableSeries,
    availableColors,
    loadingOptions,
    nextStep
  } = useWizard();
  
  const handleContinue = () => {
    nextStep();
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="defaultBrand">Default Brand</Label>
          {loadingOptions ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Loading brands...</span>
            </div>
          ) : (
            <Select value={defaultBrand} onValueChange={setDefaultBrand}>
              <SelectTrigger id="defaultBrand">
                <SelectValue placeholder="Select brand" />
              </SelectTrigger>
              <SelectContent>
                {availableBrands.map((brand) => (
                  <SelectItem key={brand} value={brand}>
                    {brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <p className="text-sm text-muted-foreground">
            Select the default brand to use for all new products.
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="defaultSeries">Default Series</Label>
          {loadingOptions ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Loading series...</span>
            </div>
          ) : (
            <Select value={defaultSeries} onValueChange={setDefaultSeries}>
              <SelectTrigger id="defaultSeries">
                <SelectValue placeholder="Select series" />
              </SelectTrigger>
              <SelectContent>
                {availableSeries.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No series available for selected brand
                  </SelectItem>
                ) : (
                  availableSeries.map((series) => (
                    <SelectItem key={series} value={series}>
                      {series}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          )}
          <p className="text-sm text-muted-foreground">
            Select the default series to use for all new products.
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="defaultColor">Default Color</Label>
          {loadingOptions ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Loading colors...</span>
            </div>
          ) : (
            <Select value={defaultColor} onValueChange={setDefaultColor}>
              <SelectTrigger id="defaultColor">
                <SelectValue placeholder="Select color" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No color (Any)</SelectItem>
                {availableColors.map((color) => (
                  <SelectItem key={color} value={color}>
                    {color}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <p className="text-sm text-muted-foreground">
            Select the default color for all new boxes.
          </p>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button onClick={handleContinue}>
          Continue
        </Button>
      </div>
    </div>
  );
};

export default DefaultSelection;
