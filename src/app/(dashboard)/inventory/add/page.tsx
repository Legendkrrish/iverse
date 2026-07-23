"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createProduct } from "@/app/actions/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

function AddProductForm() {
  const searchParams = useSearchParams();
  const [productType, setProductType] = useState("Accessories");
  const [inventoryType, setInventoryType] = useState(searchParams.get("type") || "GST");

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/inventory">
          <button type="button" className="p-2 border border-border rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Product</h1>
          <p className="text-muted-foreground mt-1">Add a new item to GST or Non-GST Inventory.</p>
        </div>
      </div>

      <form action={createProduct} className="space-y-6">
        <Card className="glass-panel rounded-2xl">
          <CardHeader>
            <CardTitle>Product & Inventory Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="inventoryType" className="font-bold">Inventory Type *</Label>
                <input type="hidden" name="inventoryType" value={inventoryType} />
                <Select value={inventoryType} onValueChange={(val) => val && setInventoryType(val)}>
                  <SelectTrigger className="bg-background font-semibold">
                    <SelectValue placeholder="Select inventory" />
                  </SelectTrigger>
                  <SelectContent className="glass-panel">
                    <SelectItem value="GST">GST Inventory (TAX INVOICE Only)</SelectItem>
                    <SelectItem value="NON_GST">Non-GST Inventory (INVOICE Only)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground">GST & Non-GST inventories are completely separate.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="productType">Product Category *</Label>
                <input type="hidden" name="productType" value={productType} />
                <Select value={productType} onValueChange={(val) => val && setProductType(val)}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="glass-panel">
                    <SelectItem value="iPhone">iPhone / Mobile Phone</SelectItem>
                    <SelectItem value="Android Phone">Android Phone</SelectItem>
                    <SelectItem value="Adapter">Charger / Adapter</SelectItem>
                    <SelectItem value="Cable">Cable / Wire</SelectItem>
                    <SelectItem value="Watch">Smart Watch</SelectItem>
                    <SelectItem value="AirPods">AirPods / Earbuds</SelectItem>
                    <SelectItem value="Accessories">Other Accessories</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input id="name" name="name" required placeholder="e.g. iPhone 15 Pro, 20W Adapter" className="bg-background" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Input id="brand" name="brand" placeholder="e.g. Apple, Samsung" className="bg-background" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU Code</Label>
                <Input id="sku" name="sku" placeholder="e.g. APP-20W-001" className="bg-background" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="barcode">Barcode</Label>
                <Input id="barcode" name="barcode" placeholder="e.g. 194252056461" className="bg-background" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hsnCode">HSN / SAC Code</Label>
                <Input id="hsnCode" name="hsnCode" defaultValue="8517" placeholder="e.g. 8517" className="bg-background" />
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Dynamic Fields for Phone or Accessories */}
        <Card className="glass-panel rounded-2xl border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Specific Serial / Item Details</span>
              <span className="text-xs font-normal text-muted-foreground">Auto-populates on bill selection</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {(productType === "iPhone" || productType === "Android Phone") ? (
              <div className="space-y-4">
                <p className="text-xs text-primary font-medium">Requirement 4: Phone Product Details (Brand, Model, Storage, IMEI)</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="storage">Storage Capacity *</Label>
                    <Input id="storage" name="storage" placeholder="e.g. 128GB, 256GB, 512GB" className="bg-background font-semibold" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <Input id="color" name="color" placeholder="e.g. Natural Titanium, Black" className="bg-background" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="imei1">IMEI Number (IMEI 1) *</Label>
                    <Input id="imei1" name="imei1" placeholder="3537XXXXXXXXXXX" className="bg-background font-mono font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="imei2">IMEI Number 2 (Optional)</Label>
                    <Input id="imei2" name="imei2" placeholder="3537XXXXXXXXXXX" className="bg-background font-mono" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-primary font-medium">Requirement 5: Accessories Details (Brand, Model, Serial Number)</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="modelNumber">Model Number</Label>
                    <Input id="modelNumber" name="modelNumber" placeholder="e.g. A2305" className="bg-background font-mono" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="serialNumber">Serial Number</Label>
                    <Input id="serialNumber" name="serialNumber" placeholder="e.g. HHY50XXXXXXX" className="bg-background font-mono font-bold" />
                  </div>
                </div>
              </div>
            )}

          </CardContent>
        </Card>

        {/* Pricing & Stock */}
        <Card className="glass-panel rounded-2xl">
          <CardHeader>
            <CardTitle>Pricing & Initial Stock</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <Label htmlFor="purchasePrice">Cost Price (₹)</Label>
                <Input id="purchasePrice" name="purchasePrice" type="number" step="0.01" defaultValue="0" className="bg-background" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mrp" className="font-bold">MRP / Selling Price (₹) *</Label>
                <Input id="mrp" name="mrp" type="number" step="0.01" required placeholder="0.00" className="bg-background font-bold text-lg" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gstPercentage">GST Rate (%)</Label>
                <Input id="gstPercentage" name="gstPercentage" type="number" step="0.1" defaultValue="18" className="bg-background" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">Initial Quantity</Label>
                <Input id="stock" name="stock" type="number" defaultValue="1" min="1" className="bg-background font-semibold" />
              </div>
            </div>

          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Link href="/inventory">
            <Button variant="outline" type="button" className="rounded-xl">Cancel</Button>
          </Link>
          <Button type="submit" size="lg" className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
            Save Product to {inventoryType === "GST" ? "GST Inventory" : "Non-GST Inventory"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function AddProductPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-muted-foreground">Loading form...</div>}>
      <AddProductForm />
    </Suspense>
  );
}
