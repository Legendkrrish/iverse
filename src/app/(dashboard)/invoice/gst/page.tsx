"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Search, Printer, FileDown, Eye, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductSearchInput } from "@/components/invoice/ProductSearchInput";
import { InvoicePrintTemplate, InvoiceData } from "@/components/invoice/InvoicePrintTemplate";
import { generatePdfFromElement } from "@/lib/pdf";
import { saveInvoice } from "@/app/actions/invoice";
import { getStoreSettings } from "@/app/actions/settings";

export default function GSTInvoicePage() {
  const [invoiceNumber, setInvoiceNumber] = useState("INV-GST-1001");
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentMode, setPaymentMode] = useState("cash");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerGst, setCustomerGst] = useState("");
  const [notes, setNotes] = useState("");
  const [storeSettings, setStoreSettings] = useState<any>(undefined);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setInvoiceNumber(`INV-GST-${Math.floor(1000 + Math.random() * 9000)}`);
    getStoreSettings().then(setStoreSettings);
  }, []);

  const [items, setItems] = useState([
    { id: 1, name: "", qty: 1, mrp: 0, discount: 0, gst: 18, hsnCode: "8517", inventoryItemId: undefined }
  ]);

  const [showPreview, setShowPreview] = useState(false);

  const handleSaveAndDownload = async () => {
    setIsSaving(true);
    try {
      const res = await saveInvoice({
        invoiceNumber,
        type: "GST",
        customerName,
        customerPhone,
        customerAddress,
        customerGst,
        paymentMode,
        items,
        subTotal: totals.grandTotal,
        taxableAmount: totals.taxableAmount,
        cgst,
        sgst,
        roundOff,
        grandTotal,
        notes,
      });
      if (res.success) {
        await generatePdfFromElement("printable-invoice", `${invoiceNumber}.pdf`);
        alert("Invoice saved successfully & stock updated!");
      } else {
        alert(`Note: ${res.error}`);
        await generatePdfFromElement("printable-invoice", `${invoiceNumber}.pdf`);
      }
    } catch (e) {
      await generatePdfFromElement("printable-invoice", `${invoiceNumber}.pdf`);
    } finally {
      setIsSaving(false);
    }
  };

  const addItem = () => {
    setItems([...items, { id: Date.now(), name: "", qty: 1, mrp: 0, discount: 0, gst: 18, hsnCode: "8517", inventoryItemId: undefined }]);
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
          mrp: selected.mrp || 0,
          gst: selected.gstPercentage || 18,
          hsnCode: selected.hsnCode || "8517",
          inventoryItemId: selected.inventoryItemId,
          brand: selected.brand,
          modelNumber: selected.modelNumber,
          storage: selected.storage,
          imei1: selected.imei1,
          serialNumber: selected.serialNumber,
        };
      }
      return item;
    }));
  };

  // Calculations based on MRP (GST Inclusive)
  const calculateItemTotals = (item: any) => {
    const discountedMrp = (item.mrp || 0) - (item.discount || 0);
    const taxableValue = discountedMrp / (1 + ((item.gst || 0) / 100));
    const totalGstForItem = discountedMrp - taxableValue;
    const itemTotal = discountedMrp * (item.qty || 1);
    return { taxableValue: taxableValue * (item.qty || 1), totalGstForItem: totalGstForItem * (item.qty || 1), itemTotal };
  };

  const totals = items.reduce((acc, item) => {
    const { taxableValue, totalGstForItem, itemTotal } = calculateItemTotals(item);
    return {
      taxableAmount: acc.taxableAmount + taxableValue,
      totalGst: acc.totalGst + totalGstForItem,
      grandTotal: acc.grandTotal + itemTotal
    };
  }, { taxableAmount: 0, totalGst: 0, grandTotal: 0 });

  const cgst = totals.totalGst / 2;
  const sgst = totals.totalGst / 2;
  
  const rawTotal = totals.grandTotal;
  const grandTotal = Math.round(rawTotal);
  const roundOff = grandTotal - rawTotal;

  const invoiceData: InvoiceData = {
    invoiceNumber,
    invoiceDate,
    paymentMode,
    customerName,
    customerPhone,
    customerAddress,
    customerGst,
    items,
    subTotal: totals.grandTotal,
    taxableAmount: totals.taxableAmount,
    cgst,
    sgst,
    roundOff,
    grandTotal,
    notes,
    storeSettings,
    type: "GST"
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    generatePdfFromElement("printable-invoice", `${invoiceNumber}.pdf`);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create GST Invoice</h1>
          <p className="text-muted-foreground mt-1">Generate a professional tax invoice & PDF.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowPreview(true)} className="rounded-xl border-primary text-primary hover:bg-primary/5">
            <Eye className="mr-2 h-4 w-4" /> Preview Invoice
          </Button>
          <Button onClick={handleSaveAndDownload} disabled={isSaving} className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
            <FileDown className="mr-2 h-4 w-4" /> {isSaving ? "Saving..." : "Save & Generate PDF"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Customer & Invoice Details */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="glass-panel rounded-2xl">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-lg">Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-2">
                <Label>Invoice Number</Label>
                <Input value={invoiceNumber} readOnly className="bg-muted/50 font-mono" />
              </div>
              <div className="space-y-2">
                <Label>Invoice Date</Label>
                <Input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} className="bg-background" />
              </div>
              <div className="space-y-2">
                <Label>Payment Mode</Label>
                <Select value={paymentMode} onValueChange={(val) => val && setPaymentMode(val)}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Note / Remarks (Optional)</Label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Payment via UPI, GPay"
                  className="bg-background"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel rounded-2xl">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-lg">Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-2">
                <Label>Customer Name</Label>
                <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Enter name" className="bg-background" />
              </div>
              <div className="space-y-2">
                <Label>Mobile Number</Label>
                <Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="Enter mobile" className="bg-background" />
              </div>
              <div className="space-y-2">
                <Label>GSTIN (Optional)</Label>
                <Input value={customerGst} onChange={(e) => setCustomerGst(e.target.value)} placeholder="Enter GST number" className="bg-background uppercase" />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} placeholder="Enter billing address" className="bg-background" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Products & Totals */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass-panel rounded-2xl overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/50 bg-card/50">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Items</CardTitle>
                <Button variant="outline" size="sm" onClick={addItem} className="h-8 rounded-lg">
                  <Plus className="mr-1 h-3 w-3" /> Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="w-[40%]">Product / Device (IMEI)</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead className="w-[100px] text-right">MRP</TableHead>
                      <TableHead className="w-[100px] text-right">Discount</TableHead>
                      <TableHead className="w-[80px] text-center">GST %</TableHead>
                      <TableHead className="w-[120px] text-right">Taxable</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => {
                      const { taxableValue, itemTotal } = calculateItemTotals(item);
                      return (
                      <TableRow key={item.id} className="border-b border-border/50">
                        <TableCell className="p-2">
                          <ProductSearchInput 
                            value={item.name}
                            invoiceType="GST"
                            onChange={(val) => updateItem(item.id, 'name', val)}
                            onSelectProduct={(selected) => handleSelectProduct(item.id, selected)}
                            placeholder="Type iPhone name, IMEI, SN..."
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
                            value={item.mrp || ""}
                            onChange={(e) => updateItem(item.id, 'mrp', parseFloat(e.target.value) || 0)}
                            className="h-9 text-right border-none bg-black/5 dark:bg-white/5" 
                          />
                        </TableCell>
                        <TableCell className="p-2">
                          <Input 
                            type="number" 
                            min="0"
                            value={item.discount || ""}
                            onChange={(e) => updateItem(item.id, 'discount', parseFloat(e.target.value) || 0)}
                            className="h-9 text-right border-none bg-black/5 dark:bg-white/5" 
                          />
                        </TableCell>
                        <TableCell className="p-2">
                          <Input 
                            type="number" 
                            min="0"
                            value={item.gst || ""}
                            onChange={(e) => updateItem(item.id, 'gst', parseFloat(e.target.value) || 0)}
                            className="h-9 text-center border-none bg-black/5 dark:bg-white/5" 
                          />
                        </TableCell>
                        <TableCell className="p-2 text-right font-medium align-middle text-muted-foreground">
                          ₹{(taxableValue).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="p-2 text-right font-medium align-middle">
                          ₹{(itemTotal).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
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

          <Card className="glass-panel rounded-2xl bg-gradient-to-br from-card to-card/50">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row justify-end">
                <div className="w-full sm:w-1/2 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Taxable Amount</span>
                    <span className="font-medium">₹{totals.taxableAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">CGST</span>
                    <span className="font-medium">₹{cgst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">SGST</span>
                    <span className="font-medium">₹{sgst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Round Off</span>
                    <span className="font-medium">{roundOff >= 0 ? '+' : '-'} ₹{Math.abs(roundOff).toFixed(2)}</span>
                  </div>
                  <hr className="border-border border-dashed" />
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-lg font-bold">Grand Total</span>
                    <span className="text-3xl font-black text-primary">₹{grandTotal.toLocaleString("en-IN")}</span>
                  </div>
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
