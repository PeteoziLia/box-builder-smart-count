import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, FileDown } from "lucide-react";
import { useProject } from "@/context/ProjectContext";
import BoxForm from "./BoxForm";
import BoxContent from "./BoxContent";
import ProductSearch from "./ProductSearch";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const BoxManager: React.FC = () => {
  const { boxes, deleteBox } = useProject();
  const [isNewBoxDialogOpen, setIsNewBoxDialogOpen] = useState(false);
  const [activeBoxId, setActiveBoxId] = useState<string | null>(null);

  const handleBoxCreated = () => {
    setIsNewBoxDialogOpen(false);
    // Set the newly created box as active if no box is active
    if (boxes.length > 0 && !activeBoxId) {
      setActiveBoxId(boxes[boxes.length - 1].id);
    }
  };

  const handleDeleteBox = (boxId: string) => {
    deleteBox(boxId);
    if (activeBoxId === boxId) {
      setActiveBoxId(boxes.length > 1 ? boxes[0].id : null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Boxes</h2>
        <Dialog open={isNewBoxDialogOpen} onOpenChange={setIsNewBoxDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New Box
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Box</DialogTitle>
            </DialogHeader>
            <BoxForm onComplete={handleBoxCreated} />
          </DialogContent>
        </Dialog>
      </div>

      {boxes.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Boxes Added</CardTitle>
            <CardDescription>Start by adding a new box to your project</CardDescription>
          </CardHeader>
          <CardFooter>
            <Dialog>
              <DialogTrigger asChild>
                <Button onClick={() => setIsNewBoxDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Box
                </Button>
              </DialogTrigger>
            </Dialog>
          </CardFooter>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {boxes.map((box) => (
              <Card 
                key={box.id}
                className={`cursor-pointer hover:shadow-md transition-shadow ${
                  activeBoxId === box.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setActiveBoxId(box.id)}
              >
                <CardHeader>
                  <div className="flex justify-between">
                    <CardTitle>{box.name}</CardTitle>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteBox(box.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardDescription>{box.area}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    {box.moduleCapacity} modules total
                  </div>
                  <div className="text-sm">
                    {box.products.length} product{box.products.length !== 1 ? 's' : ''}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {activeBoxId && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <BoxContent box={boxes.find((b) => b.id === activeBoxId)!} />
              </div>
              <div className="space-y-6">
                <ProductSearch boxId={activeBoxId} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BoxManager;
