
import React, { useState, useEffect } from "react";
import { useProject } from "@/context/ProjectContext";
import { Button } from "@/components/ui/button";
import { FileDown, FileText } from "lucide-react";
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
import { getProductBySku } from "@/services/productService";
import { FrameAdapter } from "@/types/box";

interface SkuSummary {
  sku: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  isFrameOrAdapter?: boolean;
}

const Review: React.FC = () => {
  const { clientName, boxes, complementaryProducts, getFramesAndAdapters } = useProject();
  const [skuSummary, setSkuSummary] = useState<SkuSummary[]>([]);
  const [totalCost, setTotalCost] = useState(0);
  const [framesAndAdapters, setFramesAndAdapters] = useState<FrameAdapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFramesAndAdapters = async () => {
      try {
        const frames = await getFramesAndAdapters();
        setFramesAndAdapters(frames);
      } catch (error) {
        console.error("Error fetching frames and adapters:", error);
        setFramesAndAdapters([]);
      }
    };
    
    fetchFramesAndAdapters();
  }, [boxes, getFramesAndAdapters]);

  useEffect(() => {
    const generateSkuSummary = async () => {
      setIsLoading(true);
      const summary: Record<string, SkuSummary> = {};
      
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
      
      for (const item of complementaryProducts) {
        const sku = item.sku;
        if (summary[sku]) {
          summary[sku].quantity += item.quantity;
          summary[sku].totalPrice = summary[sku].quantity * summary[sku].unitPrice;
        } else {
          try {
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
    let skuCsv = 'SKU,Product Name,Quantity,Unit Price,Total Price\n';
    skuSummary.forEach(item => {
      skuCsv += `${item.sku},"${item.productName}",${item.quantity},${item.unitPrice.toFixed(2)},${item.totalPrice.toFixed(2)}\n`;
    });
    skuCsv += `,,,,${totalCost.toFixed(2)}\n\n`;
    
    skuCsv += 'Box Contents\n';
    skuCsv += 'Box Name,Area,Description,Color,Products\n';
    
    boxes.forEach(box => {
      const productsString = box.products
        .map(item => `${item.product.sku} (${item.quantity}x, ${item.product.attributes.moduleSize} module${item.product.attributes.moduleSize > 1 ? 's' : ''})`)
        .join('; ');
      
      skuCsv += `"${box.name}","${box.area}","${box.description || ''}","${box.color || 'None'}","${productsString}"\n`;
    });

    if (framesAndAdapters.length > 0) {
      skuCsv += '\nFrames and Adapters\n';
      skuCsv += 'Type,SKU,Name,For Box,Module Capacity,Color\n';
      
      framesAndAdapters.forEach(item => {
        skuCsv += `"${item.type}","${item.sku}","${item.name}","${item.forBoxType}",${item.moduleCapacity},"${item.color || 'None'}"\n`;
      });
    }

    if (complementaryProducts.length > 0) {
      skuCsv += '\nComplementary Products\n';
      skuCsv += 'SKU,Product Name,Quantity,Area,Description\n';
      
      complementaryProducts.forEach(product => {
        skuCsv += `"${product.sku}","${product.name}",${product.quantity},"${product.area}","${product.description || ''}"\n`;
      });
    }
    
    skuCsv = `Client: ${clientName}\n\n` + skuCsv;
    
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
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">Project Quote Summary</h2>
          <p className="text-gray-500">Client: {clientName}</p>
          <p className="text-gray-500">Date: {new Date().toLocaleDateString()}</p>
          <div className="mt-2 font-bold text-xl">
            Total: {formatPrice(totalCost)}
          </div>
        </div>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold mb-4">Products Summary</h3>
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
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={4} className="text-right font-medium">Total</TableCell>
                    <TableCell className="font-bold">{formatPrice(totalCost)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            )}
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Box Details</h3>
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
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium">Area:</p>
                            <p className="text-sm">{box.area}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Box Type:</p>
                            <p className="text-sm">{box.boxType} ({box.moduleCapacity} modules)</p>
                          </div>
                          {box.color && box.color !== "none" && (
                            <div>
                              <p className="text-sm font-medium">Color:</p>
                              <p className="text-sm">{box.color}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium">קו אפס:</p>
                            <p className="text-sm">עם קו אפס</p>
                          </div>
                        </div>
                        
                        {box.description && (
                          <div>
                            <p className="text-sm font-medium">Description:</p>
                            <p className="text-sm">{box.description}</p>
                          </div>
                        )}
                        
                        <div>
                          <p className="text-sm font-medium">Products:</p>
                          <div className="mt-2">
                            {box.products.length === 0 ? (
                              <p className="text-sm text-muted-foreground">No products in this box</p>
                            ) : (
                              <div className="space-y-2">
                                {box.products.map(item => (
                                  <div key={item.product.sku} className="flex justify-between p-2 bg-muted/50 rounded-md">
                                    <div>
                                      <p className="font-medium text-sm">{item.product.name}</p>
                                      <p className="text-xs text-muted-foreground">{item.product.sku}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm">{item.quantity} × {item.product.attributes.moduleSize} modules</p>
                                      <p className="text-xs text-muted-foreground">
                                        {formatPrice(item.product.regularPrice * item.quantity)}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {framesAndAdapters.filter(item => 
                          item.forBoxType === box.boxType && 
                          item.moduleCapacity === box.moduleCapacity &&
                          (!item.color || item.color === box.color)
                        ).length > 0 && (
                          <div>
                            <p className="text-sm font-medium">Additional Components:</p>
                            <div className="mt-2 space-y-2">
                              {framesAndAdapters.filter(item => 
                                item.forBoxType === box.boxType && 
                                item.moduleCapacity === box.moduleCapacity &&
                                (!item.color || item.color === box.color)
                              ).map(item => (
                                <div key={item.sku} className="flex justify-between p-2 bg-muted/50 rounded-md">
                                  <div>
                                    <p className="font-medium text-sm">{item.name}</p>
                                    <p className="text-xs text-muted-foreground">{item.sku}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm capitalize">{item.type}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {formatPrice(item.regularPrice)}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
          
          {complementaryProducts.length > 0 && (
            <div>
              <h3 className="text-lg font-bold mb-4">Complementary Products</h3>
              <div className="space-y-2">
                {complementaryProducts.map((product, index) => (
                  <div key={`${product.sku}-${index}`} className="flex justify-between p-3 bg-muted/50 rounded-md">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.sku}</p>
                      {product.description && (
                        <p className="text-sm mt-1">{product.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{product.quantity} units</p>
                      <p className="text-xs text-muted-foreground">Area: {product.area}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-8 flex justify-between">
          <Button onClick={exportToCsv} disabled={boxes.length === 0 && complementaryProducts.length === 0}>
            <FileDown className="mr-2 h-4 w-4" />
            Export to CSV
          </Button>
          <Button variant="outline" disabled>
            <FileText className="mr-2 h-4 w-4" />
            Export PDF Quote
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Review;
