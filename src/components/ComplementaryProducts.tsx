
import React, { useState } from "react";
import { useProject } from "@/context/ProjectContext";
import { searchProducts, isBoxCompatibleProduct, getProductBySku } from "@/services/productService";
import { ComplementaryProductData, Product } from "@/types/box";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Package, Plus, Trash2, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const ComplementaryProducts = () => {
  const { complementaryProducts, addComplementaryProduct, removeComplementaryProduct } = useProject();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<{
    sku: string;
    name: string;
    series: string;
    brand: string;
  } | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [area, setArea] = useState("");
  const [description, setDescription] = useState("");

  const handleAddProduct = () => {
    if (!selectedProduct || !area) return;

    addComplementaryProduct({
      sku: selectedProduct.sku,
      name: selectedProduct.name,
      quantity,
      area,
      description,
    });

    setIsDialogOpen(false);
    setSelectedProduct(null);
    setQuantity(1);
    setArea("");
    setDescription("");
    setSearchQuery("");
  };

  const searchResults = searchQuery
    ? searchProducts(searchQuery).filter(p => !isBoxCompatibleProduct(p))
    : [];

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct({
      sku: product.sku,
      name: product.name,
      series: product.series,
      brand: product.brand,
    });
    setOpen(false);
    setSearchQuery("");
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'ILS' }).format(price);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Complementary Products</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Complementary Product</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Search Product</Label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      {selectedProduct ? (
                        <>
                          <Package className="mr-2 h-4 w-4" />
                          <span>{selectedProduct.sku} - {selectedProduct.name}</span>
                        </>
                      ) : (
                        <>
                          <Search className="mr-2 h-4 w-4" />
                          <span>Search by SKU or name...</span>
                        </>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-[400px]">
                    <Command shouldFilter={false}>
                      <CommandInput 
                        placeholder="Search by SKU or product name..." 
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                      />
                      <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup heading="Search Results">
                          {searchResults.map((product) => (
                            <CommandItem
                              key={product.sku}
                              value={product.sku}
                              onSelect={() => handleSelectProduct(product)}
                            >
                              <div className="flex flex-col w-full">
                                <div className="flex justify-between w-full">
                                  <span className="font-medium">{product.name}</span>
                                  <span className="text-muted-foreground">
                                    {formatPrice(product.regularPrice)}
                                  </span>
                                </div>
                                <div className="flex justify-between w-full text-sm text-muted-foreground">
                                  <span>{product.sku}</span>
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {product.brand} | {product.series}
                                </div>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {selectedProduct && (
                <>
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
                    <Label htmlFor="area">Area</Label>
                    <Input
                      id="area"
                      placeholder="E.g., Living Room, Kitchen"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Add any additional details"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  <Button onClick={handleAddProduct} className="w-full">
                    Add Product
                  </Button>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {complementaryProducts.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Complementary Products Added</CardTitle>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {complementaryProducts.map((product, index) => {
            const productDetail = getProductBySku(product.sku);
            return (
              <Card key={`${product.sku}-${index}`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeComplementaryProduct(index)}
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">SKU:</span> {product.sku}</p>
                    <p><span className="font-medium">Quantity:</span> {product.quantity}</p>
                    <p><span className="font-medium">Area:</span> {product.area}</p>
                    {product.description && (
                      <p><span className="font-medium">Description:</span> {product.description}</p>
                    )}
                    {productDetail && (
                      <>
                        <p><span className="font-medium">Price:</span> {formatPrice(productDetail.regularPrice)}</p>
                        <p><span className="font-medium">Brand:</span> {productDetail.brand}</p>
                        <p><span className="font-medium">Series:</span> {productDetail.series}</p>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ComplementaryProducts;
