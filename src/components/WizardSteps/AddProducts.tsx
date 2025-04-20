import React, { useState, useEffect } from "react";
import { useProject } from "@/context/ProjectContext";
import { useWizard } from "@/context/WizardContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Package, Search, Plus, Minus, Trash2, AlertCircle, Loader2 } from "lucide-react";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Product } from "@/types/box";
import { searchProducts, isBoxCompatibleProduct } from "@/services/productService";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

const AddProducts: React.FC = () => {
  const { boxes, getBoxById, addProductToBox, updateProductQuantity, removeProductFromBox, getRemainingModules, getUsedModules } = useProject();
  const { activeBoxId, nextStep } = useWizard();
  const { toast } = useToast();
  
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [noColorMatchWarning, setNoColorMatchWarning] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  
  const box = activeBoxId ? getBoxById(activeBoxId) : null;
  
  // Initial load of products when component mounts
  useEffect(() => {
    const loadInitialProducts = async () => {
      if (!initialLoadDone && box) {
        setIsLoading(true);
        try {
          // Pre-load initial products
          const results = await searchProducts("", box.color);
          const filteredResults = results.filter(isBoxCompatibleProduct);
          console.log("Preloaded initial products in AddProducts:", filteredResults.length);
          setSearchResults(filteredResults);
          setInitialLoadDone(true);
        } catch (error) {
          console.error("Error preloading products:", error);
          toast({
            title: "Error loading products",
            description: "Please try refreshing the page",
            variant: "destructive"
          });
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadInitialProducts();
  }, [box, initialLoadDone, toast]);
  
  // Load initial products when popup is opened
  useEffect(() => {
    if (open && box) {
      const fetchInitialProducts = async () => {
        setIsLoading(true);
        try {
          const results = await searchProducts("", box.color);
          const filteredResults = results.filter(isBoxCompatibleProduct);
          console.log("Initial product results on popup open:", filteredResults.length);
          setSearchResults(filteredResults);
          setNoColorMatchWarning(false);
        } catch (error) {
          console.error("Error loading initial products:", error);
          setSearchResults([]);
          toast({
            title: "Error loading products",
            description: "Please try searching with different terms",
            variant: "destructive"
          });
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchInitialProducts();
    }
  }, [open, box, toast]);
  
  // Handle search query changes with debounce
  useEffect(() => {
    const fetchProducts = async () => {
      if (open && box) {
        setIsLoading(true);
        try {
          const results = await searchProducts(searchQuery, box.color);
          const filteredResults = results.filter(isBoxCompatibleProduct);
          console.log("Search results:", filteredResults.length);
          setSearchResults(filteredResults);
          
          // Check if we need to show a color mismatch warning
          if (box.color && box.color !== "none" && filteredResults.length === 0 && searchQuery.trim().length > 0) {
            // Try searching without the color filter to see if there are any matches
            const allResults = await searchProducts(searchQuery);
            const filteredAllResults = allResults.filter(isBoxCompatibleProduct);
            
            if (filteredAllResults.length > 0) {
              setNoColorMatchWarning(true);
            } else {
              setNoColorMatchWarning(false);
            }
          } else {
            setNoColorMatchWarning(false);
          }
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
  }, [searchQuery, box, open]);
  
  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setOpen(false);
    setError("");
  };
  
  const handleAddProduct = () => {
    if (!activeBoxId || !selectedProduct) {
      setError("Please select a product");
      return;
    }
    
    if (quantity <= 0) {
      setError("Quantity must be greater than 0");
      return;
    }
    
    const success = addProductToBox(activeBoxId, selectedProduct, quantity);
    if (!success) {
      setError(`Not enough module space. Only ${getRemainingModules(activeBoxId)} modules available.`);
      return;
    }
    
    setSelectedProduct(null);
    setQuantity(1);
    setError("");
  };
  
  const handleUpdateQuantity = (productSku: string, newQuantity: number) => {
    if (!activeBoxId) return;
    
    if (newQuantity <= 0) {
      removeProductFromBox(activeBoxId, productSku);
      return;
    }
    
    const success = updateProductQuantity(activeBoxId, productSku, newQuantity);
    if (!success) {
      setError(`Not enough module space. Only ${getRemainingModules(activeBoxId)} modules available.`);
    }
  };
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'ILS' }).format(price);
  };
  
  const handleContinue = () => {
    if (box && box.products.length > 0) {
      nextStep();
    } else {
      setError("Please add at least one product to the box before continuing.");
    }
  };
  
  if (!box) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium mb-2">No box selected</h3>
        <p className="text-muted-foreground">Go back and create a box first.</p>
      </div>
    );
  }
  
  const usedModules = getUsedModules(activeBoxId);
  const remainingModules = getRemainingModules(activeBoxId);
  const modulePercentage = (usedModules / box.moduleCapacity) * 100;
  
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between items-center">
            <Label>Module Usage</Label>
            <span className="text-sm font-medium">
              {usedModules} / {box.moduleCapacity} modules
            </span>
          </div>
          <Progress value={modulePercentage} className="h-2" />
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Search Products</CardTitle>
            {box.color && box.color !== "none" && (
              <CardDescription>
                Showing products compatible with {box.color} color
              </CardDescription>
            )}
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
                        {noColorMatchWarning && (
                          <div className="p-2">
                            <Alert variant="warning">
                              <AlertCircle className="h-4 w-4" />
                              <AlertTitle>No color match</AlertTitle>
                              <AlertDescription>
                                No products found matching "{box.color}" color. Try changing the box color.
                              </AlertDescription>
                            </Alert>
                          </div>
                        )}
                        {isLoading ? (
                          <CommandLoading>
                            <div className="flex items-center justify-center py-6">
                              <Loader2 className="h-8 w-8 animate-spin text-primary" />
                              <span className="ml-2">Loading products...</span>
                            </div>
                          </CommandLoading>
                        ) : (
                          <>
                            {searchResults.length === 0 ? (
                              <CommandEmpty>
                                <div className="py-6 text-center">
                                  <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                                  <h3 className="mt-2 text-lg font-semibold">No products found</h3>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    Try a different search term or remove filters
                                  </p>
                                </div>
                              </CommandEmpty>
                            ) : (
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
                                        <span>{product.attributes.moduleSize} module{product.attributes.moduleSize !== 1 ? 's' : ''}</span>
                                      </div>
                                      <div className="text-xs text-muted-foreground mt-1">
                                        {product.brand} | {product.series} 
                                        {product.attributes.color && ` | ${product.attributes.color}`}
                                      </div>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            )}
                          </>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            {selectedProduct && (
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <div className="flex gap-2">
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  />
                  <Button onClick={handleAddProduct}>Add</Button>
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                
                <div className="mt-2 text-sm">
                  <div className="mb-1">
                    <span className="font-medium">Selected Product:</span> {selectedProduct.name}
                  </div>
                  <div className="mb-1">
                    <span className="font-medium">SKU:</span> {selectedProduct.sku}
                  </div>
                  <div className="mb-1">
                    <span className="font-medium">Module Size:</span> {selectedProduct.attributes.moduleSize}
                  </div>
                  <div className="mb-1">
                    <span className="font-medium">Price:</span> {formatPrice(selectedProduct.regularPrice)}
                  </div>
                  {selectedProduct.attributes.color && (
                    <div className="mb-1">
                      <span className="font-medium">Color:</span> {selectedProduct.attributes.color}
                    </div>
                  )}
                  <div className="mb-1">
                    <span className="font-medium">Modules Needed:</span> {selectedProduct.attributes.moduleSize * quantity}
                  </div>
                  <div>
                    <span className="font-medium">Modules Remaining in Box:</span> {remainingModules}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Box Contents</CardTitle>
            <CardDescription>
              {box.name} - {box.area} ({box.moduleCapacity} modules)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {box.products.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No products added to this box yet.
              </div>
            ) : (
              <div className="space-y-4">
                {box.products.map((item) => (
                  <div key={item.product.sku} className="flex items-center justify-between border-b pb-2">
                    <div className="flex-1">
                      <div className="font-medium">{item.product.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.product.sku} | {item.product.attributes.moduleSize} module{item.product.attributes.moduleSize !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleUpdateQuantity(item.product.sku, item.quantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleUpdateQuantity(item.product.sku, item.quantity + 1)}
                        disabled={item.product.attributes.moduleSize * (item.quantity + 1) > item.product.attributes.moduleSize * item.quantity + remainingModules}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => removeProductFromBox(activeBoxId, item.product.sku)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <div>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
            <Button 
              onClick={handleContinue} 
              disabled={box.products.length === 0}
            >
              Continue
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AddProducts;
