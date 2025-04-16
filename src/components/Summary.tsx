
import React from "react";
import { useProject } from "@/context/ProjectContext";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { FileDown, FileText } from "lucide-react";
import { BoxProduct } from "@/context/ProjectContext";

interface SkuSummary {
  sku: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

const Summary: React.FC = () => {
  const { clientName, boxes, complementaryProducts } = useProject();

  const generateSkuSummary = (): SkuSummary[] => {
    const summary: Record<string, SkuSummary> = {};
    
    boxes.forEach(box => {
      box.products.forEach(item => {
        const { sku, name, regularPrice } = item.product;
        
        if (summary[sku]) {
          summary[sku].quantity += item.quantity;
          summary[sku].totalPrice = summary[sku].quantity * regularPrice;
        } else {
          summary[sku] = {
            sku,
            productName: name,
            quantity: item.quantity,
            unitPrice: regularPrice,
            totalPrice: item.quantity * regularPrice
          };
        }
      });
    });

    // Add complementary products
    complementaryProducts.forEach(item => {
      const sku = item.sku;
      if (summary[sku]) {
        summary[sku].quantity += item.quantity;
        summary[sku].totalPrice = summary[sku].quantity * summary[sku].unitPrice;
      } else {
        // Find product details from inventory if available
        const product = boxes.flatMap(b => b.products).find(p => p.product.sku === sku)?.product;
        summary[sku] = {
          sku,
          productName: item.name,
          quantity: item.quantity,
          unitPrice: product?.regularPrice || 0, // Use 0 if price unknown
          totalPrice: (product?.regularPrice || 0) * item.quantity
        };
      }
    });
    
    return Object.values(summary).sort((a, b) => a.sku.localeCompare(b.sku));
  };

  const skuSummary = generateSkuSummary();
  
  const totalCost = skuSummary.reduce((sum, item) => sum + item.totalPrice, 0);
  
  const exportToCsv = () => {
    // Generate Summary by SKU CSV
    let skuCsv = 'SKU,Product Name,Quantity,Unit Price,Total Price\n';
    skuSummary.forEach(item => {
      skuCsv += `${item.sku},"${item.productName}",${item.quantity},${item.unitPrice.toFixed(2)},${item.totalPrice.toFixed(2)}\n`;
    });
    skuCsv += `,,,,${totalCost.toFixed(2)}\n\n`;
    
    // Generate Box Contents CSV
    skuCsv += 'Box Contents\n';
    skuCsv += 'Box Name,Area,Description,Products\n';
    
    boxes.forEach(box => {
      const productsString = box.products
        .map(item => `${item.product.sku} (${item.quantity}x, ${item.product.attributes.moduleSize} module${item.product.attributes.moduleSize > 1 ? 's' : ''})`)
        .join('; ');
      
      skuCsv += `"${box.name}","${box.area}","${box.description}","${productsString}"\n`;
    });

    // Add Complementary Products
    if (complementaryProducts.length > 0) {
      skuCsv += '\nComplementary Products\n';
      skuCsv += 'SKU,Product Name,Quantity,Area,Description\n';
      
      complementaryProducts.forEach(product => {
        skuCsv += `"${product.sku}","${product.name}",${product.quantity},"${product.area}","${product.description || ''}"\n`;
      });
    }
    
    // Add Client Name
    skuCsv = `Client: ${clientName}\n\n` + skuCsv;
    
    // Create and download the CSV file
    const blob = new Blob([skuCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${clientName || 'switch-project'}_summary.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'ILS' }).format(price);
  };  

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Project Summary</h2>
      
      <Card className="w-full">
        <CardHeader>
          <CardTitle>
            Summary by SKU
          </CardTitle>
          <CardDescription>
            Total cost: {formatPrice(totalCost)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {skuSummary.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No products added yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Total Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {skuSummary.map(item => (
                  <TableRow key={item.sku}>
                    <TableCell className="font-medium">{item.sku}</TableCell>
                    <TableCell>{item.productName}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{formatPrice(item.unitPrice)}</TableCell>
                    <TableCell>{formatPrice(item.totalPrice)}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={4} className="text-right font-medium">Total</TableCell>
                  <TableCell className="font-bold">{formatPrice(totalCost)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Box Contents</CardTitle>
        </CardHeader>
        <CardContent>
          {boxes.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No boxes added yet</p>
          ) : (
            <Accordion type="multiple" defaultValue={boxes.map(box => box.id)}>
              {boxes.map(box => (
                <AccordionItem key={box.id} value={box.id}>
                  <AccordionTrigger>
                    <div className="flex items-center justify-between w-full pr-4">
                      <span>{box.name} - {box.area}</span>
                      <span className="text-sm text-muted-foreground">
                        {box.products.length} product{box.products.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    {box.description && (
                      <p className="text-sm text-muted-foreground mb-2">{box.description}</p>
                    )}
                    {box.products.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No products in this box</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>SKU</TableHead>
                            <TableHead>Product</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Module Size</TableHead>
                            <TableHead>Total Modules</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {box.products.map(item => (
                            <TableRow key={item.product.sku}>
                              <TableCell className="font-medium">{item.product.sku}</TableCell>
                              <TableCell>{item.product.name}</TableCell>
                              <TableCell>{item.quantity}</TableCell>
                              <TableCell>{item.product.attributes.moduleSize}</TableCell>
                              <TableCell>{item.quantity * item.product.attributes.moduleSize}</TableCell>
                            </TableRow>
                          ))}
                          <TableRow>
                            <TableCell colSpan={4} className="text-right font-medium">
                              Total Modules
                            </TableCell>
                            <TableCell className="font-bold">
                              {box.products.reduce((sum, item) => 
                                sum + (item.quantity * item.product.attributes.moduleSize), 0
                              )} / {box.moduleCapacity}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button onClick={exportToCsv} disabled={boxes.length === 0 && complementaryProducts.length === 0}>
            <FileDown className="mr-2 h-4 w-4" />
            Export to CSV
          </Button>
          <Button variant="outline" disabled>
            <FileText className="mr-2 h-4 w-4" />
            Generate Quote via Green Invoice
          </Button>
        </CardFooter>
      </Card>

      {/* Complementary Products Section */}
      {complementaryProducts.length > 0 && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Complementary Products</CardTitle>
            <CardDescription>
              Products not installed in boxes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Area</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {complementaryProducts.map((product, index) => (
                  <TableRow key={`${product.sku}-${index}`}>
                    <TableCell className="font-medium">{product.sku}</TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.quantity}</TableCell>
                    <TableCell>{product.area}</TableCell>
                    <TableCell>{product.description || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Summary;
