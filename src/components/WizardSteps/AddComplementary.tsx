
import React, { useState, useEffect } from "react";
import { useProject } from "@/context/ProjectContext";
import { useWizard } from "@/context/WizardContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Package, Search, Trash2 } from "lucide-react";
import { 
  Command, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList,
  CommandLoading
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { ComplementaryProductData, Product } from "@/types/box";
import { searchProducts } from "@/services/productService";

const AddComplementary: React.FC = () => {
  const { complementaryProducts, addComplementaryProduct, removeComplementaryProduct } = useProject();
  const { nextStep } = useWizard();
  
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [area, setArea] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Load initial products when popup is opened
  useEffect(() => {
    if (open && searchQuery.trim().length === 0) {
      const fetchInitialProducts = async () => {
        setIsLoading(true);
        try {
          const results = await searchProducts("", "none");
          setSearchResults(results);
        } catch (error) {
          console.error("Error loading initial products:", error);
          setSearchResults([]);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchInitialProducts();
    }
  }, [open]);
  
  // Handle search query changes with debounce
  useEffect(() => {
    const fetchProducts = async () => {
      if (open) {
        setIsLoading(true);
        try {
          const results = await searchProducts(searchQuery);
          setSearchResults(results);
        } catch (error) {
          console.error("Error searching products:", error);
          setSearchResults([]);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300); // Debounce search
    
    return () => clearTimeout(timer);
  }, [searchQuery, open]);
  
  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setOpen(false);
    setError("");
  };
  
  const handleAddProduct = () => {
    if (!selectedProduct) {
      setError("Please select a product");
      return;
    }
    
    if (quantity <= 0) {
      setError("Quantity must be greater than 0");
      return;
    }
    
    if (!area) {
      setError("Please specify the area or room");
      return;
    }
    
    const complementaryProduct: ComplementaryProductData = {
      sku: selectedProduct.sku,
      name: selectedProduct.name,
      quantity,
      area,
      description
    };
    
    addComplementaryProduct(complementaryProduct);
    
    // Reset form
    setSelectedProduct(null);
    setQuantity(1);
    setArea("");
    setDescription("");
    setError("");
  };
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'ILS' }).format(price);
  };
  
  const handleContinue = () => {
    nextStep();
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Add Complementary Products</CardTitle>
            <CardDescription>
              These products will be included in the project but are not installed in boxes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="productSearch">Search for a Product</Label>
              <div className="flex gap-2">
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      {selectedProduct ? (
                        <>
                          <Package className="mr-2 h-4 w-4" />
                          <span className="truncate">{selectedProduct.sku} - {selectedProduct.name}</span>
                        </>
                      ) : (
                        <>
                          <Search className="mr-2 h-4 w-4" />
                          <span>Search by SKU or name...</span>
                        </>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent 
                    className="p-0 w-[400px]" 
                    side="bottom" 
                    align="start" 
                    alignOffset={0}
                    sideOffset={4}
                  >
                    <Command shouldFilter={false}>
                      <CommandInput 
                        placeholder="Search by SKU or product name..." 
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                      />
                      <CommandList>
                        {isLoading ? (
                          <CommandLoading>Loading products...</CommandLoading>
                        ) : (
                          <>
                            <CommandEmpty>No products found. Try a different search term.</CommandEmpty>
                            <CommandGroup heading={`${searchResults.length} Search Results`}>
                              {searchResults.map((product) => (
                                <CommandItem
                                  key={product.sku}
                                  value={product.sku}
                                  onSelect={() => handleSelectProduct(product)}
                                >
                                  <div className="flex flex-col w-full">
                                    <div className="flex justify-between w-full">
                                      <span className="font-medium truncate">{product.name}</span>
                                      <span className="text-muted-foreground">
                                        {formatPrice(product.regularPrice)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between w-full text-sm text-muted-foreground">
                                      <span>{product.sku}</span>
                                      {product.attributes.moduleSize && (
                                        <span>{product.attributes.moduleSize} module{product.attributes.moduleSize !== 1 ? 's' : ''}</span>
                                      )}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                      {product.brand} | {product.series} 
                                      {product.attributes.color && ` | ${product.attributes.color}`}
                                    </div>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            {selectedProduct && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="area">Area / Room</Label>
                    <Input
                      id="area"
                      placeholder="e.g., Kitchen, Garden"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Additional notes about this product"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                  />
                </div>
                
                <Button 
                  onClick={handleAddProduct}
                  disabled={!selectedProduct || quantity <= 0 || !area}
                >
                  Add Complementary Product
                </Button>
                
                {error && <p className="text-sm text-red-500">{error}</p>}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Complementary Products List</CardTitle>
          </CardHeader>
          <CardContent>
            {complementaryProducts.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No complementary products added yet.
              </div>
            ) : (
              <div className="space-y-4">
                {complementaryProducts.map((item, index) => (
                  <div key={`${item.sku}-${index}`} className="flex items-center justify-between border-b pb-2">
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.sku} | Qty: {item.quantity} | Area: {item.area}
                      </div>
                      {item.description && (
                        <div className="text-sm text-muted-foreground">
                          Note: {item.description}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => removeComplementaryProduct(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <div className="w-full flex justify-end">
              <Button onClick={handleContinue}>
                Continue to Review
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AddComplementary;
