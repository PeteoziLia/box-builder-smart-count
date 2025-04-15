
import React from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Minus, Plus } from "lucide-react";
import { useProject } from "@/context/ProjectContext";
import { Box } from "@/context/ProjectContext";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import BoxForm from "./BoxForm";

interface BoxContentProps {
  box: Box;
}

const BoxContent: React.FC<BoxContentProps> = ({ box }) => {
  const { 
    getUsedModules, 
    getRemainingModules, 
    removeProductFromBox,
    updateProductQuantity
  } = useProject();

  const usedModules = getUsedModules(box.id);
  const remainingModules = getRemainingModules(box.id);

  const handleIncreaseQuantity = (productSku: string, currentQuantity: number) => {
    const product = box.products.find(p => p.product.sku === productSku)?.product;
    if (product) {
      updateProductQuantity(box.id, productSku, currentQuantity + 1);
    }
  };

  const handleDecreaseQuantity = (productSku: string, currentQuantity: number) => {
    if (currentQuantity > 1) {
      updateProductQuantity(box.id, productSku, currentQuantity - 1);
    } else {
      removeProductFromBox(box.id, productSku);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            {box.name} - {box.area}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Edit2 className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <BoxForm 
                  onComplete={() => {}} 
                  initialData={{
                    id: box.id,
                    name: box.name,
                    area: box.area,
                    description: box.description,
                    boxType: box.boxType,
                    moduleCapacity: box.moduleCapacity,
                  }}
                />
              </DialogContent>
            </Dialog>
          </CardTitle>
          <div className="text-sm font-normal text-muted-foreground">
            {box.boxType} - {box.moduleCapacity} modules
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {box.description && (
          <p className="text-sm text-muted-foreground mb-4">{box.description}</p>
        )}

        <div className="mb-4">
          <div className="w-full bg-secondary h-4 rounded-full overflow-hidden">
            <div 
              className={`h-full ${usedModules === box.moduleCapacity ? 'bg-orange-500' : 'bg-primary'}`}
              style={{ width: `${(usedModules / box.moduleCapacity) * 100}%` }}
            ></div>
          </div>
          <div className="text-sm mt-1 text-muted-foreground">
            {remainingModules} module{remainingModules !== 1 ? 's' : ''} remaining
          </div>
        </div>

        {/* Mobile product list */}
        <div className="block md:hidden space-y-4">
          {box.products.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No products added yet</p>
          ) : (
            box.products.map((item) => (
              <div key={item.product.sku} className="border rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">{item.product.productName}</span>
                  <span>{formatPrice(item.product.price)}</span>
                </div>
                <div className="text-sm text-muted-foreground">SKU: {item.product.sku}</div>
                <div className="text-sm text-muted-foreground">
                  Modules: {item.product.moduleSize * item.quantity}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleDecreaseQuantity(item.product.sku, item.quantity)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleIncreaseQuantity(item.product.sku, item.quantity)}
                      disabled={item.product.moduleSize > remainingModules}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => removeProductFromBox(box.id, item.product.sku)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-right font-medium">
                  Total: {formatPrice(item.product.price * item.quantity)}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop table view */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Modules</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {box.products.map((item) => (
                <TableRow key={item.product.sku}>
                  <TableCell className="font-medium">{item.product.sku}</TableCell>
                  <TableCell>{item.product.productName}</TableCell>
                  <TableCell>{item.product.moduleSize * item.quantity}</TableCell>
                  <TableCell>{formatPrice(item.product.price)}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center">
                      <span>{item.quantity}</span>
                    </div>
                  </TableCell>
                  <TableCell>{formatPrice(item.product.price * item.quantity)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-7 w-7"
                        onClick={() => handleDecreaseQuantity(item.product.sku, item.quantity)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-7 w-7"
                        onClick={() => handleIncreaseQuantity(item.product.sku, item.quantity)}
                        disabled={item.product.moduleSize > remainingModules}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => removeProductFromBox(box.id, item.product.sku)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default BoxContent;
