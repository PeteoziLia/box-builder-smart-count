
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useProject } from "@/context/ProjectContext";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BoxType, BOX_MODULE_CAPACITIES, BoxModuleCapacity } from "@/types/box";

interface BoxFormProps {
  onComplete: () => void;
  initialData?: {
    id: string;
    name: string;
    area: string;
    description: string;
    boxType: BoxType;
    moduleCapacity: BoxModuleCapacity;
  };
}

const BoxForm: React.FC<BoxFormProps> = ({ onComplete, initialData }) => {
  const { addBox, updateBox } = useProject();
  const [boxName, setBoxName] = useState(initialData?.name || "");
  const [area, setArea] = useState(initialData?.area || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [boxType, setBoxType] = useState<BoxType>(initialData?.boxType || "Rectangular Box");
  const [moduleCapacity, setModuleCapacity] = useState<BoxModuleCapacity>(
    initialData?.moduleCapacity || 3 as BoxModuleCapacity
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!boxName || !area || !moduleCapacity) {
      return;
    }

    const boxData = {
      name: boxName,
      area,
      description,
      boxType,
      moduleCapacity,
    };

    if (initialData) {
      updateBox(initialData.id, boxData);
    } else {
      addBox(boxData);
    }

    // Reset the form
    if (!initialData) {
      setBoxName("");
      setArea("");
      setDescription("");
      setBoxType("Rectangular Box");
      setModuleCapacity(3 as BoxModuleCapacity);
    }
    
    onComplete();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{initialData ? 'Edit Box' : 'Add New Box'}</CardTitle>
        <CardDescription>{initialData ? 'Modify box details' : 'Create a new electrical box'}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="boxName">Box Name</Label>
            <Input
              id="boxName"
              placeholder="E.g., Box 1, Main Box"
              value={boxName}
              onChange={(e) => setBoxName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="area">Area</Label>
            <Input
              id="area"
              placeholder="E.g., Living Room, Kitchen"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="boxType">Box Type</Label>
            <Select
              value={boxType}
              onValueChange={(value: BoxType) => {
                setBoxType(value);
                // Reset module capacity to a valid value for the new box type
                setModuleCapacity(BOX_MODULE_CAPACITIES[value][0]);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select box type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="55 Box">55 Box</SelectItem>
                <SelectItem value="Rectangular Box">Rectangular Box</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="moduleCapacity">Number of Modules</Label>
            <Select
              value={moduleCapacity.toString()}
              onValueChange={(value) => setModuleCapacity(Number(value) as BoxModuleCapacity)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select module capacity" />
              </SelectTrigger>
              <SelectContent>
                {BOX_MODULE_CAPACITIES[boxType].map((capacity) => (
                  <SelectItem key={capacity} value={capacity.toString()}>
                    {capacity} modules
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Add any additional details about this box"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full">
            {initialData ? 'Save Changes' : 'Create Box'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default BoxForm;
