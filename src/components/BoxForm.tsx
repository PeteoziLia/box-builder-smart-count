
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProject } from "@/context/ProjectContext";
import { BoxType, BOX_MODULE_CAPACITIES, BoxFormData } from "@/types/box";
import { getAvailableColors } from "@/services/productService";

const formSchema = z.object({
  name: z.string().min(1, "Box name is required"),
  area: z.string().min(1, "Area is required"),
  description: z.string().optional(),
  boxType: z.enum(["55 Box", "Rectangular Box"]),
  moduleCapacity: z.number().min(1),
  color: z.string().optional(),
});

interface BoxFormProps {
  onComplete: () => void;
  initialData?: Partial<BoxFormData>;
  boxId?: string;
}

const BoxForm: React.FC<BoxFormProps> = ({ onComplete, initialData, boxId }) => {
  const { addBox, updateBox } = useProject();
  const [availableModules, setAvailableModules] = useState<number[]>([]);
  const [availableColors, setAvailableColors] = useState<string[]>([]);
  
  const form = useForm<BoxFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      area: initialData?.area || "",
      description: initialData?.description || "",
      boxType: initialData?.boxType || "Rectangular Box",
      moduleCapacity: initialData?.moduleCapacity || 4,
      color: initialData?.color || "",
    },
  });

  const boxType = form.watch("boxType") as BoxType;

  useEffect(() => {
    // Convert the readonly array to a regular array using Array.from()
    setAvailableModules(Array.from(BOX_MODULE_CAPACITIES[boxType]));
    
    // Reset module capacity if the current one isn't available
    const currentCapacity = form.getValues("moduleCapacity");
    if (!BOX_MODULE_CAPACITIES[boxType].includes(currentCapacity as any)) {
      form.setValue("moduleCapacity", BOX_MODULE_CAPACITIES[boxType][0]);
    }
  }, [boxType, form]);

  useEffect(() => {
    // Fetch available colors
    setAvailableColors(getAvailableColors());
  }, []);

  const onSubmit = (data: BoxFormData) => {
    if (boxId) {
      updateBox(boxId, data);
    } else {
      addBox(data);
    }
    onComplete();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Box Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter a name for this box" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="area"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Area</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Living Room, Kitchen" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Add any additional details about this box" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="boxType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Box Type</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a box type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="55 Box">55 Box</SelectItem>
                    <SelectItem value="Rectangular Box">Rectangular Box</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="moduleCapacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Module Capacity</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  value={field.value.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select capacity" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableModules.map((modules) => (
                      <SelectItem key={modules} value={modules.toString()}>
                        {modules} {modules === 1 ? "module" : "modules"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color (Optional)</FormLabel>
                <Select 
                  onValueChange={field.onChange}
                  value={field.value || ""}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a color" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">Any Color</SelectItem>
                    {availableColors.map((color) => (
                      <SelectItem key={color} value={color}>
                        {color}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <Button type="submit" className="w-full">
          {boxId ? "Update Box" : "Create Box"}
        </Button>
      </form>
    </Form>
  );
};

export default BoxForm;
