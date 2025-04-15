
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useProject } from "@/context/ProjectContext";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BoxFormProps {
  onComplete: () => void;
}

const BoxForm: React.FC<BoxFormProps> = ({ onComplete }) => {
  const { addBox } = useProject();
  const [boxName, setBoxName] = useState("");
  const [area, setArea] = useState("");
  const [description, setDescription] = useState("");
  const [moduleCapacity, setModuleCapacity] = useState<number>(3);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!boxName || !area || !moduleCapacity) {
      return;
    }

    addBox({
      name: boxName,
      area,
      description,
      moduleCapacity,
    });

    // Reset the form
    setBoxName("");
    setArea("");
    setDescription("");
    setModuleCapacity(3);
    onComplete();
  };

  const moduleOptions = [3, 4, 6, 8, 12, 18, 24];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Add New Box</CardTitle>
        <CardDescription>Create a new electrical box</CardDescription>
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
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Add any additional details about this box"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="moduleCapacity">Number of Modules</Label>
            <Select
              value={moduleCapacity.toString()}
              onValueChange={(value) => setModuleCapacity(Number(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select module capacity" />
              </SelectTrigger>
              <SelectContent>
                {moduleOptions.map((option) => (
                  <SelectItem key={option} value={option.toString()}>
                    {option} modules
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full">Create Box</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default BoxForm;
