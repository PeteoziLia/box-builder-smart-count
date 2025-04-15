
import React, { useState } from "react";
import { useProject } from "@/context/ProjectContext";
import { searchProducts, isBoxCompatibleProduct } from "@/services/productService";
import { ComplementaryProductData } from "@/types/box";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Package, Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { searchProducts } from "@/data/sampleSwitchData";

const ComplementaryProducts = () => {
  const { complementaryProducts, addComplementaryProduct, removeComplementaryProduct } = useProject();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<{
    sku: string;
    name: string;
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
  };

  const searchResults = searchQuery
    ? searchProducts(searchQuery).filter(p => !isBoxCompatibleProduct(p))
    : [];

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
                <Input
                  placeholder="Search by SKU or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchResults.length > 0 && (
                  <Card>
                    <CardContent className="p-2">
                      <div className="max-h-40 overflow-y-auto space-y-2">
                        {searchResults.map((product) => (
                          <Button
                            key={product.sku}
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => {
                              setSelectedProduct({
                                sku: product.sku,
                                name: product.productName,
                              });
                              setSearchQuery("");
                            }}
                          >
                            <Package className="mr-2 h-4 w-4" />
                            {product.sku} - {product.productName}
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {selectedProduct && (
                <>
                  <div className="space-y-2">
                    <Label>Selected Product</Label>
                    <div className="p-2 border rounded">
                      {selectedProduct.sku} - {selectedProduct.name}
                    </div>
                  </div>

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
          {complementaryProducts.map((product, index) => (
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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ComplementaryProducts;
