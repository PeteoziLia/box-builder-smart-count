
import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Search, Package, AlertCircle } from "lucide-react";
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
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Product } from "@/types/box";
import { searchProducts, isBoxCompatibleProduct } from "@/services/productService";
import { useProject } from "@/context/ProjectContext";

interface ProductSearchProps {
  boxId: string;
}

const ProductSearch: React.FC<ProductSearchProps> = ({ boxId }) => {
  const { addProductToBox, getRemainingModules, getBoxById } = useProject();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");
  const [noColorMatchWarning, setNoColorMatchWarning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const box = getBoxById(boxId);

  // Load initial products when popup is opened
  useEffect(() => {
    if (open && searchQuery.trim().length === 0) {
      const fetchInitialProducts = async () => {
        setIsLoading(true);
        try {
          // Get initial products (searchProducts will return first 20 with empty search)
          const results = await searchProducts("", box?.color);
          console.log("Initial product results:", results.length);
          const filteredResults = results.filter(isBoxCompatibleProduct);
          setSearchResults(filteredResults);
          setNoColorMatchWarning(false);
        } catch (error) {
          console.error("Error loading initial products:", error);
          setSearchResults([]);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchInitialProducts();
    }
  }, [open, box?.color]);

  // Handle search query changes
  useEffect(() => {
    const fetchProducts = async () => {
      if (open) {
        setIsLoading(true);
        try {
          // Search with color filter
          console.log("Searching with query:", searchQuery);
          const results = await searchProducts(searchQuery, box?.color);
          const filteredResults = results.filter(isBoxCompatibleProduct);
          setSearchResults(filteredResults);
          
          // Check if we need to show a color mismatch warning
          if (box?.color && box.color !== "none" && filteredResults.length === 0 && searchQuery.trim().length > 0) {
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
  }, [searchQuery, box?.color, open]);

  const handleSelectProduct = (product: Product) => {
    console.log("Selected product:", product);
    setSelectedProduct(product);
    setOpen(false);
    setSearchQuery("");
    setQuantity(1);
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

    console.log("Adding product to box:", selectedProduct, "quantity:", quantity);
    const success = addProductToBox(boxId, selectedProduct, quantity);
    if (!success) {
      setError(`Not enough module space. Only ${getRemainingModules(boxId)} modules available.`);
      return;
    }

    setSelectedProduct(null);
    setQuantity(1);
    setError("");
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'ILS' }).format(price);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Add Products</CardTitle>
        {box?.color && box.color !== "none" && (
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
                    ref={searchInputRef}
                  />
                  <CommandList>
                    {noColorMatchWarning && (
                      <div className="p-2">
                        <Alert variant="warning">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>No color match</AlertTitle>
                          <AlertDescription>
                            No products found matching "{box?.color}" color. Try changing the box color.
                          </AlertDescription>
                        </Alert>
                      </div>
                    )}
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
                                  <span>{product.attributes.moduleSize} module{product.attributes.moduleSize > 1 ? 's' : ''}</span>
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
                <span className="font-medium">Modules Remaining in Box:</span> {getRemainingModules(boxId)}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductSearch;
