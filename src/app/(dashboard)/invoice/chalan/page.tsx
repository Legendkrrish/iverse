"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Printer, FileDown, Eye, X } from "lucide-react";
import { ProductSearchInput } from "@/components/invoice/ProductSearchInput";
import { InvoicePrintTemplate, InvoiceData } from "@/components/invoice/InvoicePrintTemplate";
import { generatePdfFromElement } from "@/lib/pdf";
import { saveInvoice } from "@/app/actions/invoice";
import { getStoreSettings } from "@/app/actions/settings";

export default function ChalanPage() {
  const [chalanNumber, setChalanNumber] = useState("INV-NGST-1001");
  const [chalanDate, setChalanDate] = useState(new Date().toISOString().split("T")[0]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [storeSettings, setStoreSettings] = useState<any>(undefined);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setChalanNumber(`INV-NGST-${Math.floor(1000 + Math.random() * 9000)}`);
    getStoreSettings().then(setStoreSettings);
  }, []);

  const [extraDiscount, setExtraDiscount] = useState<number>(0);
  const [items, setItems] = useState<Array<{
    id: number;
    name: string;
    brand?: string | null;
    modelNumber?: string | null;
    storage?: string | null;
    imei1?: string | null;
    serialNumber?: string | null;
    inventoryItemId?: string;
    qty: number;
    rate: number;
    discount: number;
    amount: number;
  }>>([{ id: 1, name: "", qty: 1, rate: 0, discount: 0, amount: 0 }]);

  const [showPreview, setShowPreview] = useState(false);

  const handleSaveAndDownload = async () => {
    setIsSaving(true);
    try {
      const res = await saveInvoice(invoiceData);
      if (res.success) {
        await generatePdfFromElement("printable-invoice", `${chalanNumber}.pdf`);
        alert("Non-GST Invoice saved successfully & stock updated!");
      } else {
        alert(`Note: ${res.error}`);
        await generatePdfFromElement("printable-invoice", `${chalanNumber}.pdf`);
      }
    } catch (e) {
      await generatePdfFromElement("printable-invoice", `${chalanNumber}.pdf`);
    } finally {
      setIsSaving(false);
    }
  };

  const addItem = () => {
    setItems([...items, { id: Date.now(), name: "", qty: 1, rate: 0, discount: 0, amount: 0 }]);
  };

  const removeItem = (id: number) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: number, field: string, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleSelectProduct = (id: number, selected: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        return {
          ...item,
          name: selected.name || selected.displayName,
          brand: selected.brand,
          modelNumber: selected.modelNumber,
          storage: selected.storage,
          color: selected.color,
          imei1: selected.imei1,
          serialNumber: selected.serialNumber,
          rate: selected.mrp || 0,
          discount: 0
        };
      }
      return item;
    }));
  };

  const subTotal = items.reduce((sum, item) => sum + ((item.qty || 1) * (item.rate || 0)), 0);
  const itemDiscounts = items.reduce((sum, item) => sum + ((item.qty || 1) * (item.discount || 0)), 0);
  const totalDiscount = itemDiscounts + (extraDiscount || 0);
  const grandTotal = Math.max(0, Math.round(subTotal - totalDiscount));

  const invoiceData: InvoiceData = {
    invoiceNumber: chalanNumber,
    invoiceDate: chalanDate,
    paymentMode: "Cash",
    customerName,
    customerPhone,
    customerAddress,
    items: items.map(item => ({
      name: item.name,
      brand: item.brand,
      modelNumber: item.modelNumber,
      storage: item.storage,
      color: (item as any).color,
      imei1: item.imei1,
      serialNumber: item.serialNumber,
      qty: item.qty || 1,
      mrp: item.rate || 0,
      discount: item.discount || 0,
      gst: 0
    })),
    subTotal,
    taxableAmount: grandTotal,
    cgst: 0,
    sgst: 0,
    roundOff: 0,
    grandTotal,
    notes,
    storeSettings,
    type: "NON_GST"
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    generatePdfFromElement("printable-invoice", `${chalanNumber}.pdf`);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Invoice</h1>
          <p className="text-muted-foreground mt-1">Generate a quick invoice & PDF.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowPreview(true)} className="rounded-xl glass border-primary text-primary">
            <Eye className="h-4 w-4 mr-2" />
            Preview Invoice
          </Button>
          <Button onClick={handleSaveAndDownload} disabled={isSaving} className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground px-6">
            <FileDown className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save & Generate PDF"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass-panel rounded-2xl border-none shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Customer & Invoice Remarks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Mobile Number</Label>
                  <Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="Enter 10-digit number" className="bg-black/5 dark:bg-white/5 border-none" />
                </div>
                <div className="space-y-2">
                  <Label>Customer Name</Label>
                  <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="e.g. John Doe" className="bg-black/5 dark:bg-white/5 border-none" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Address</Label>
                  <Input value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} placeholder="Complete Address" className="bg-black/5 dark:bg-white/5 border-none" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Note / Remarks (Optional)</Label>
                  <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. 15-day warranty applicable, Payment via Cash" className="bg-black/5 dark:bg-white/5 border-none" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel rounded-2xl border-none shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Product Details (Non-GST Inventory Only)</CardTitle>
              <Button onClick={addItem} size="sm" variant="outline" className="rounded-xl h-8">
                <Plus className="h-4 w-4 mr-1" /> Add Row
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-black/5 dark:bg-white/5">
                    <TableRow>
                      <TableHead className="w-[45%]">Particulars (Product / IMEI)</TableHead>
                      <TableHead className="w-[80px] text-center">Qty</TableHead>
                      <TableHead className="w-[120px] text-right">Rate (₹)</TableHead>
                      <TableHead className="w-[120px] text-right">Discount (₹)</TableHead>
                      <TableHead className="text-right">Amount (₹)</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => {
                      const itemTotal = ((item.qty || 1) * ((item.rate || 0) - (item.discount || 0)));
                      return (
                      <TableRow key={item.id} className="border-b border-border/50">
                        <TableCell className="p-2">
                          <ProductSearchInput 
                            value={item.name}
                            invoiceType="NON_GST"
                            onChange={(val) => updateItem(item.id, 'name', val)}
                            onSelectProduct={(selected) => handleSelectProduct(item.id, selected)}
                            placeholder="Search Non-GST inventory..."
                          />
                        </TableCell>
                        <TableCell className="p-2">
                          <Input 
                            type="number" 
                            min="1"
                            value={item.qty || ""}
                            onChange={(e) => updateItem(item.id, 'qty', parseFloat(e.target.value) || 0)}
                            className="h-9 text-center border-none bg-black/5 dark:bg-white/5" 
                          />
                        </TableCell>
                        <TableCell className="p-2">
                          <Input 
                            type="number" 
                            min="0"
                            value={item.rate || ""}
                            onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                            className="h-9 text-right border-none bg-black/5 dark:bg-white/5" 
                          />
                        </TableCell>
                        <TableCell className="p-2">
                          <Input 
                            type="number" 
                            min="0"
                            value={item.discount || ""}
                            onChange={(e) => updateItem(item.id, 'discount', parseFloat(e.target.value) || 0)}
                            className="h-9 text-right border-none bg-black/5 dark:bg-white/5 font-semibold text-destructive" 
                            placeholder="0"
                          />
                        </TableCell>
                        <TableCell className="p-2 text-right font-medium align-middle">
                          ₹{Math.max(0, itemTotal).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="p-2 text-center align-middle">
                          <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} className="h-8 w-8 text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )})}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="glass-panel rounded-2xl border-none shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Invoice Settings & Extra Discount</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Invoice Number</Label>
                <Input value={chalanNumber} readOnly className="bg-black/5 dark:bg-white/5 border-none font-mono text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={chalanDate} onChange={(e) => setChalanDate(e.target.value)} className="bg-black/5 dark:bg-white/5 border-none" />
              </div>
              <div className="space-y-2">
                <Label className="text-destructive font-bold">Extra Flat Discount (₹)</Label>
                <Input 
                  type="number" 
                  min="0"
                  value={extraDiscount || ""} 
                  onChange={(e) => setExtraDiscount(parseFloat(e.target.value) || 0)} 
                  placeholder="e.g. 500" 
                  className="bg-destructive/10 border-destructive/30 text-destructive font-bold text-base" 
                />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel rounded-2xl border-none shadow-sm bg-primary/5">
            <CardContent className="p-6">
              <div className="flex flex-col space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">₹{subTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between items-center text-sm text-destructive font-semibold">
                    <span>Total Discount Given</span>
                    <span>- ₹{totalDiscount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="border-t border-border/50 pt-2 flex justify-between items-center">
                  <span className="text-lg font-bold">Total Amount</span>
                  <span className="text-3xl font-black text-primary">₹{grandTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Printable Invoice Element for PDF/Print Generation */}
      <div style={{ position: "absolute", left: "-9999px", top: 0, width: "210mm" }}>
        <InvoicePrintTemplate data={invoiceData} />
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto text-black">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-xl font-bold">Invoice Preview</h2>
              <div className="flex items-center gap-2">
                <Button onClick={handlePrint} variant="outline" size="sm">
                  <Printer className="mr-2 h-4 w-4" /> Print
                </Button>
                <Button onClick={handleDownloadPdf} size="sm">
                  <FileDown className="mr-2 h-4 w-4" /> Save PDF
                </Button>
                <button type="button" onClick={() => setShowPreview(false)} className="p-1.5 hover:bg-gray-100 rounded-full">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="py-2">
              <InvoicePrintTemplate data={invoiceData} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
