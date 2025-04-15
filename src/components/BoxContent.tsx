
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
import { Trash2, Minus, Plus } from "lucide-react";
import { useProject } from "@/context/ProjectContext";
import { Box } from "@/context/ProjectContext";

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
      <CardHeader>
        <CardTitle>
          {box.name} - {box.area}
          <span className="text-sm font-normal ml-2 text-muted-foreground">
            ({usedModules}/{box.moduleCapacity} modules used)
          </span>
        </CardTitle>
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

        {box.products.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No products added yet</p>
        ) : (
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
        )}
      </CardContent>
    </Card>
  );
};

export default BoxContent;
