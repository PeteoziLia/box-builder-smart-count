
import React, { useState, useEffect } from "react";
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
import { getProductBySku, getFrameForBox, getAdapterForBox } from "@/services/productService";
import { FrameAdapter } from "@/types/box";

interface SkuSummary {
  sku: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  isFrameOrAdapter?: boolean;
}

const Summary: React.FC = () => {
  const { clientName, boxes, complementaryProducts } = useProject();
  const [skuSummary, setSkuSummary] = useState<SkuSummary[]>([]);
  const [totalCost, setTotalCost] = useState(0);
  const [framesAndAdapters, setFramesAndAdapters] = useState<FrameAdapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFramesAndAdapters = async () => {
      const frames: FrameAdapter[] = [];
      
      for (const box of boxes) {
        try {
          const frame = await getFrameForBox(box);
          const adapter = await getAdapterForBox(box);
          
          if (frame) frames.push(frame);
          if (adapter) frames.push(adapter);
        } catch (error) {
          console.error(`Error getting frames/adapters for box ${box.id}:`, error);
        }
      }
      
      setFramesAndAdapters(frames);
    };
    
    fetchFramesAndAdapters();
  }, [boxes]);

  useEffect(() => {
    const generateSkuSummary = async () => {
      setIsLoading(true);
      const summary: Record<string, SkuSummary> = {};
      
      // Add box products
      for (const box of boxes) {
        for (const item of box.products) {
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
        }
      }
      
      // Add complementary products
      for (const item of complementaryProducts) {
        const sku = item.sku;
        if (summary[sku]) {
          summary[sku].quantity += item.quantity;
          summary[sku].totalPrice = summary[sku].quantity * summary[sku].unitPrice;
        } else {
          try {
            // Find product details from inventory
            const product = await getProductBySku(sku);
            if (product) {
              summary[sku] = {
                sku,
                productName: item.name,
                quantity: item.quantity,
                unitPrice: product.regularPrice,
                totalPrice: product.regularPrice * item.quantity
              };
            } else {
              // Use placeholder data if product not found
              summary[sku] = {
                sku,
                productName: item.name,
                quantity: item.quantity,
                unitPrice: 0,
                totalPrice: 0
              };
            }
          } catch (error) {
            console.error(`Error getting product details for ${sku}:`, error);
            // Use placeholder data if there's an error
            summary[sku] = {
              sku,
              productName: item.name,
              quantity: item.quantity,
              unitPrice: 0,
              totalPrice: 0
            };
          }
        }
      }
      
      // Add frames and adapters
      for (const item of framesAndAdapters) {
        const sku = item.sku;
        if (summary[sku]) {
          summary[sku].quantity += 1;
          summary[sku].totalPrice = summary[sku].quantity * item.regularPrice;
        } else {
          summary[sku] = {
            sku,
            productName: item.name,
            quantity: 1,
            unitPrice: item.regularPrice,
            totalPrice: item.regularPrice,
            isFrameOrAdapter: true
          };
        }
      }
      
      const summaryArray = Object.values(summary).sort((a, b) => a.sku.localeCompare(b.sku));
      setSkuSummary(summaryArray);
      
      const total = summaryArray.reduce((sum, item) => sum + item.totalPrice, 0);
      setTotalCost(total);
      setIsLoading(false);
    };
    
    generateSkuSummary();
  }, [boxes, complementaryProducts, framesAndAdapters]);
  
  const exportToCsv = () => {
    // Generate Summary by SKU CSV
    let skuCsv = 'SKU,Product Name,Quantity,Unit Price,Total Price\n';
    skuSummary.forEach(item => {
      skuCsv += `${item.sku},"${item.productName}",${item.quantity},${item.unitPrice.toFixed(2)},${item.totalPrice.toFixed(2)}\n`;
    });
    skuCsv += `,,,,${totalCost.toFixed(2)}\n\n`;
    
    // Generate Box Contents CSV
    skuCsv += 'Box Contents\n';
    skuCsv += 'Box Name,Area,Description,Color,Products\n';
    
    boxes.forEach(box => {
      const productsString = box.products
        .map(item => `${item.product.sku} (${item.quantity}x, ${item.product.attributes.moduleSize} module${item.product.attributes.moduleSize > 1 ? 's' : ''})`)
        .join('; ');
      
      skuCsv += `"${box.name}","${box.area}","${box.description || ''}","${box.color || 'None'}","${productsString}"\n`;
    });

    // Add Frames and Adapters
    if (framesAndAdapters.length > 0) {
      skuCsv += '\nFrames and Adapters\n';
      skuCsv += 'Type,SKU,Name,For Box,Module Capacity,Color\n';
      
      framesAndAdapters.forEach(item => {
        skuCsv += `"${item.type}","${item.sku}","${item.name}","${item.forBoxType}",${item.moduleCapacity},"${item.color || 'None'}"\n`;
      });
    }

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
          {isLoading ? (
            <div className="py-10 text-center">Loading summary data...</div>
          ) : skuSummary.length === 0 ? (
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
                  <TableHead>Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {skuSummary.map(item => (
                  <TableRow key={item.sku} className={item.isFrameOrAdapter ? "bg-muted/50" : ""}>
                    <TableCell className="font-medium">{item.sku}</TableCell>
                    <TableCell>{item.productName}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{formatPrice(item.unitPrice)}</TableCell>
                    <TableCell>{formatPrice(item.totalPrice)}</TableCell>
                    <TableCell>{item.isFrameOrAdapter ? "Auto-added" : "User-selected"}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={4} className="text-right font-medium">Total</TableCell>
                  <TableCell className="font-bold">{formatPrice(totalCost)}</TableCell>
                  <TableCell></TableCell>
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
                      <span>{box.name} - {box.area} {box.color && box.color !== "none" ? `(${box.color})` : ''}</span>
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
                            {box.color && box.color !== "none" && <TableHead>Color</TableHead>}
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
                              {box.color && box.color !== "none" && <TableCell>{item.product.attributes.color || 'N/A'}</TableCell>}
                            </TableRow>
                          ))}
                          <TableRow>
                            <TableCell colSpan={box.color && box.color !== "none" ? 4 : 3} className="text-right font-medium">
                              Total Modules
                            </TableCell>
                            <TableCell className="font-bold">
                              {box.products.reduce((sum, item) => 
                                sum + (item.quantity * item.product.attributes.moduleSize), 0
                              )} / {box.moduleCapacity}
                            </TableCell>
                            {box.color && box.color !== "none" && <TableCell></TableCell>}
                          </TableRow>
                        </TableBody>
                      </Table>
                    )}
                    
                    {/* Show frames and adapters for this box */}
                    {framesAndAdapters.filter(item => 
                      item.forBoxType === box.boxType && 
                      item.moduleCapacity === box.moduleCapacity &&
                      (!item.color || item.color === box.color)
                    ).length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">Auto-added Components:</h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Type</TableHead>
                              <TableHead>SKU</TableHead>
                              <TableHead>Name</TableHead>
                              <TableHead>Color</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {framesAndAdapters.filter(item => 
                              item.forBoxType === box.boxType && 
                              item.moduleCapacity === box.moduleCapacity &&
                              (!item.color || item.color === box.color)
                            ).map(item => (
                              <TableRow key={item.sku}>
                                <TableCell className="capitalize">{item.type}</TableCell>
                                <TableCell>{item.sku}</TableCell>
                                <TableCell>{item.name}</TableCell>
                                <TableCell>{item.color || 'N/A'}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
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

      {/* Frames and Adapters Summary Section */}
      {framesAndAdapters.length > 0 && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Frames and Adapters</CardTitle>
            <CardDescription>
              Automatically added based on box configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>For Box Type</TableHead>
                  <TableHead>Module Capacity</TableHead>
                  <TableHead>Color</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {framesAndAdapters.map((item) => (
                  <TableRow key={item.sku}>
                    <TableCell className="capitalize">{item.type}</TableCell>
                    <TableCell>{item.sku}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.forBoxType}</TableCell>
                    <TableCell>{item.moduleCapacity}</TableCell>
                    <TableCell>{item.color || 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

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
