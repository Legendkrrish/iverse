"use client";

import { useState } from "react";
import { updateProduct, deleteProduct } from "@/app/actions/product";
import { Plus, Search, MoreVertical, Edit, Trash2, PackagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  brand: string | null;
  category: string | null;
  productType?: string | null;
  inventoryType?: string | null;
  sku: string | null;
  barcode: string | null;
  hsnCode?: string | null;
  purchasePrice: number;
  mrp?: number;
  sellingPrice?: number;
  gstPercentage: number;
  stock: number;
  minStock: number;
}

export function InventoryClient({ initialProducts, inventoryType }: { initialProducts: Product[]; inventoryType: string }) {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    (p.sku && p.sku.toLowerCase().includes(search.toLowerCase())) ||
    (p.barcode && p.barcode.toLowerCase().includes(search.toLowerCase())) ||
    (p.brand && p.brand.toLowerCase().includes(search.toLowerCase()))
  );

  const isGST = inventoryType === "GST";
  const title = isGST ? "GST Inventory" : "Non-GST Inventory";
  const subtitle = isGST 
    ? "Products here are accessible ONLY from TAX Invoice (GST)." 
    : "Products here are accessible ONLY from Non-GST Invoice.";

  // Handle Edit Submit
  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingProduct) return;
    const formData = new FormData(e.currentTarget);
    const res = await updateProduct(editingProduct.id, formData);
    if (res.success && res.product) {
      const addStock = parseInt(formData.get("addStockQty") as string) || 0;
      setProducts(products.map(p => {
        if (p.id === editingProduct.id) {
          return {
            ...p,
            name: (formData.get("name") as string) || p.name,
            brand: (formData.get("brand") as string) || p.brand,
            sku: (formData.get("sku") as string) || p.sku,
            barcode: (formData.get("barcode") as string) || p.barcode,
            hsnCode: (formData.get("hsnCode") as string) || p.hsnCode,
            mrp: parseFloat(formData.get("mrp") as string) || p.mrp,
            purchasePrice: parseFloat(formData.get("purchasePrice") as string) || p.purchasePrice,
            gstPercentage: parseFloat(formData.get("gstPercentage") as string) || p.gstPercentage,
            minStock: parseInt(formData.get("minStock") as string) || p.minStock,
            stock: p.stock + addStock,
          };
        }
        return p;
      }));
      setEditingProduct(null);
    } else {
      alert(res.error || "Failed to update product");
    }
  };

  // Handle Delete Confirm
  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return;
    const res = await deleteProduct(deletingProduct.id);
    if (res.success) {
      setProducts(products.filter(p => p.id !== deletingProduct.id));
      setDeletingProduct(null);
    } else {
      alert(res.error || "Failed to delete product");
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground mt-1">{subtitle}</p>
        </div>
        <Link href={`/inventory/add?type=${inventoryType}`}>
          <Button className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" /> Add {isGST ? "GST" : "Non-GST"} Product
          </Button>
        </Link>
      </div>

      {/* Inventory Type Switcher Tabs */}
      <div className="flex gap-2">
        <Link href="/inventory?type=GST">
          <Button variant={isGST ? "default" : "outline"} className="rounded-xl font-semibold">
            GST Inventory
          </Button>
        </Link>
        <Link href="/inventory?type=NON_GST">
          <Button variant={!isGST ? "default" : "outline"} className="rounded-xl font-semibold">
            Non-GST Inventory
          </Button>
        </Link>
      </div>

      {/* Table Panel */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-border/50">
        <div className="p-3 sm:p-4 border-b border-border/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-card/50">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder={`Search ${isGST ? "GST" : "Non-GST"} products by Name, SKU, Barcode...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-background border-none rounded-lg focus-visible:ring-1 focus-visible:ring-primary text-sm"
            />
          </div>
          <div className="text-xs font-semibold text-muted-foreground self-end sm:self-auto">
            Total Products: <span className="text-foreground font-bold">{filteredProducts.length}</span>
          </div>
        </div>
        
        <div className="overflow-x-auto w-full">
          <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-semibold">Product Name</TableHead>
              <TableHead className="font-semibold">Category</TableHead>
              <TableHead className="font-semibold">SKU Code</TableHead>
              <TableHead className="font-semibold">In-Stock Qty</TableHead>
              <TableHead className="text-right font-semibold">{isGST ? "MRP (GST Incl.)" : "Selling Price"}</TableHead>
              {isGST && <TableHead className="text-center font-semibold">GST %</TableHead>}
              <TableHead className="w-[80px] text-right font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isGST ? 7 : 6} className="text-center h-28 text-muted-foreground">
                  No {isGST ? "GST" : "Non-GST"} products found. Click "Add Product" to add stock.
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => {
                const price = product.mrp ?? product.sellingPrice ?? 0;
                return (
                  <TableRow key={product.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-bold text-foreground">{product.name}</div>
                        {product.brand && <span className="text-xs text-muted-foreground">{product.brand}</span>}
                      </div>
                    </TableCell>
                    <TableCell>{product.productType || product.category || "-"}</TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">{product.sku || "-"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{product.stock}</span>
                        {product.stock <= product.minStock && (
                          <Badge variant="destructive" className="text-[10px] px-1.5 py-0 uppercase tracking-wider">
                            Low Stock
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-bold text-primary font-mono">
                      ₹{price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </TableCell>
                    {isGST && (
                      <TableCell className="text-center">
                        <Badge variant="outline" className="font-mono">{product.gstPercentage}%</Badge>
                      </TableCell>
                    )}
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="h-8 w-8 p-0 rounded-lg flex items-center justify-center hover:bg-muted cursor-pointer border-none outline-none">
                          <MoreVertical className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="glass-panel rounded-xl w-44">
                          <DropdownMenuItem
                            onClick={() => setEditingProduct(product)}
                            className="cursor-pointer"
                          >
                            <Edit className="mr-2 h-4 w-4" /> Edit Product
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeletingProduct(product)}
                            className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Product
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        </div>
      </div>

      {/* Edit Product Modal */}
      <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
        <DialogContent className="glass-panel rounded-2xl max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Product — {editingProduct?.name}</DialogTitle>
            <DialogDescription>Update pricing, stock count, and codes for this item.</DialogDescription>
          </DialogHeader>
          {editingProduct && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-prod-name">Product Name *</Label>
                <Input
                  id="edit-prod-name"
                  name="name"
                  required
                  defaultValue={editingProduct.name}
                  className="bg-background font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-brand">Brand</Label>
                  <Input
                    id="edit-brand"
                    name="brand"
                    defaultValue={editingProduct.brand || ""}
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-sku">SKU Code</Label>
                  <Input
                    id="edit-sku"
                    name="sku"
                    defaultValue={editingProduct.sku || ""}
                    className="bg-background font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-barcode">Barcode</Label>
                  <Input
                    id="edit-barcode"
                    name="barcode"
                    defaultValue={editingProduct.barcode || ""}
                    className="bg-background font-mono text-xs"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-hsnCode">HSN / SAC Code</Label>
                  <Input
                    id="edit-hsnCode"
                    name="hsnCode"
                    defaultValue={editingProduct.hsnCode || "8517"}
                    className="bg-background font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-mrp">MRP / Price (₹) *</Label>
                  <Input
                    id="edit-mrp"
                    name="mrp"
                    type="number"
                    step="0.01"
                    required
                    defaultValue={editingProduct.mrp || editingProduct.sellingPrice || 0}
                    className="bg-background font-bold text-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-purchasePrice">Cost Price (₹)</Label>
                  <Input
                    id="edit-purchasePrice"
                    name="purchasePrice"
                    type="number"
                    step="0.01"
                    defaultValue={editingProduct.purchasePrice || 0}
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-gstPercentage">GST %</Label>
                  <Input
                    id="edit-gstPercentage"
                    name="gstPercentage"
                    type="number"
                    step="0.1"
                    defaultValue={editingProduct.gstPercentage || 0}
                    className="bg-background font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/50">
                <div className="space-y-2">
                  <Label htmlFor="edit-minStock">Low Stock Alert Level</Label>
                  <Input
                    id="edit-minStock"
                    name="minStock"
                    type="number"
                    defaultValue={editingProduct.minStock || 5}
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-addStock" className="flex items-center gap-1 text-emerald-600 font-bold">
                    <PackagePlus className="h-4 w-4" /> Add Stock Units
                  </Label>
                  <Input
                    id="edit-addStock"
                    name="addStockQty"
                    type="number"
                    defaultValue="0"
                    min="0"
                    placeholder="+0 Units"
                    className="bg-background font-bold border-emerald-500/50 text-emerald-600"
                  />
                </div>
              </div>

              <DialogFooter className="pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingProduct(null)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl bg-primary text-primary-foreground">
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Product Confirmation Modal */}
      <Dialog open={!!deletingProduct} onOpenChange={(open) => !open && setDeletingProduct(null)}>
        <DialogContent className="glass-panel rounded-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-bold text-foreground">{deletingProduct?.name}</span>? This will remove available stock items from inventory.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeletingProduct(null)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteConfirm}
              className="rounded-xl"
            >
              Delete Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
