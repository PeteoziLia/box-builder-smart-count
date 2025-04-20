
import React, { useState } from "react";
import { useProject } from "@/context/ProjectContext";
import { useWizard } from "@/context/WizardContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BoxType, BoxModuleCapacity, BOX_MODULE_CAPACITIES } from "@/types/box";

const CreateBox: React.FC = () => {
  const { addBox, boxes } = useProject();
  const { nextStep, defaultColor, setActiveBoxId } = useWizard();
  
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [description, setDescription] = useState("");
  const [boxType, setBoxType] = useState<BoxType>("55 Box");
  const [moduleCapacity, setModuleCapacity] = useState<BoxModuleCapacity>(1);
  const [color, setColor] = useState(defaultColor);
  
  const availableModuleCapacities = BOX_MODULE_CAPACITIES[boxType];
  
  const handleBoxTypeChange = (value: string) => {
    const newBoxType = value as BoxType;
    setBoxType(newBoxType);
    // Set the first available module capacity for the new box type
    setModuleCapacity(BOX_MODULE_CAPACITIES[newBoxType][0]);
  };
  
  const handleAddBox = () => {
    if (!name || !area) return;
    
    const newBox = {
      name,
      area,
      description,
      boxType,
      moduleCapacity,
      color: color === "none" ? undefined : color
    };
    
    addBox(newBox);
    
    // Set the newly created box as active
    setTimeout(() => {
      const lastBoxId = boxes[boxes.length]?.id;
      if (lastBoxId) {
        setActiveBoxId(lastBoxId);
      }
      nextStep();
    }, 0);
  };
  
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Box Name</Label>
          <Input
            id="name"
            placeholder="Enter box name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="area">Area / Room</Label>
          <Input
            id="area"
            placeholder="e.g., Living Room, Kitchen"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          placeholder="Enter any additional details about this box"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="boxType">Box Type</Label>
          <Select value={boxType} onValueChange={handleBoxTypeChange}>
            <SelectTrigger id="boxType">
              <SelectValue placeholder="Select box type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="55 Box">55 Box</SelectItem>
              <SelectItem value="Rectangular Box">Rectangular Box</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="moduleCapacity">Module Capacity</Label>
          <Select
            value={moduleCapacity.toString()}
            onValueChange={(value) => setModuleCapacity(parseInt(value) as BoxModuleCapacity)}
          >
            <SelectTrigger id="moduleCapacity">
              <SelectValue placeholder="Select capacity" />
            </SelectTrigger>
            <SelectContent>
              {availableModuleCapacities.map((capacity) => (
                <SelectItem key={capacity} value={capacity.toString()}>
                  {capacity} module{capacity !== 1 ? "s" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="color">Color</Label>
          <Select value={color} onValueChange={setColor}>
            <SelectTrigger id="color">
              <SelectValue placeholder="Select color" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No color (Any)</SelectItem>
              <SelectItem value="White">White</SelectItem>
              <SelectItem value="Black">Black</SelectItem>
              <SelectItem value="Silver">Silver</SelectItem>
              <SelectItem value="Gold">Gold</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button 
          onClick={handleAddBox}
          disabled={!name || !area}
        >
          Create Box and Continue
        </Button>
      </div>
    </div>
  );
};

export default CreateBox;
