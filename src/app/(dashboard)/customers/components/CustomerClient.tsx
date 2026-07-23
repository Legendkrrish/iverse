"use client";

import { useState } from "react";
import {
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerInvoices,
} from "@/app/actions/customer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Receipt,
  FileText,
  Printer,
  History,
  Phone,
  MapPin,
} from "lucide-react";
import { InvoicePrintTemplate } from "@/components/invoice/InvoicePrintTemplate";
import { generatePdfFromElement } from "@/lib/pdf";

interface Customer {
  id: string;
  name: string;
  mobile: string | null;
  address: string | null;
  state: string | null;
  pinCode: string | null;
  gstNumber: string | null;
  invoiceCount: number;
  totalSpent: number;
  invoices: Array<{
    id: string;
    invoiceNumber: string;
    date: Date;
    type: string;
    totalAmount: number;
    paymentMode: string;
    notes: string | null;
  }>;
}

export function CustomerClient({ initialCustomers }: { initialCustomers: Customer[] }) {
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);

  // Dialog States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);
  const [historyCustomer, setHistoryCustomer] = useState<Customer | null>(null);
  const [customerInvoices, setCustomerInvoices] = useState<any[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [selectedInvoiceToPrint, setSelectedInvoiceToPrint] = useState<any | null>(null);

  // Filtered List
  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.mobile && c.mobile.includes(search)) ||
      (c.gstNumber && c.gstNumber.toLowerCase().includes(search.toLowerCase())) ||
      (c.address && c.address.toLowerCase().includes(search.toLowerCase()))
  );

  // Add Customer Action
  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const res = await createCustomer(formData);
    if (res.success && res.customer) {
      setCustomers([
        { ...res.customer, invoiceCount: 0, totalSpent: 0, invoices: [] },
        ...customers,
      ]);
      setIsAddOpen(false);
    } else {
      alert(res.error || "Failed to add customer");
    }
  };

  // Edit Customer Action
  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingCustomer) return;
    const formData = new FormData(e.currentTarget);
    const res = await updateCustomer(editingCustomer.id, formData);
    if (res.success && res.customer) {
      setCustomers(
        customers.map((c) =>
          c.id === editingCustomer.id ? { ...c, ...res.customer } : c
        )
      );
      setEditingCustomer(null);
    } else {
      alert(res.error || "Failed to update customer");
    }
  };

  // Delete Customer Action
  const handleDeleteConfirm = async () => {
    if (!deletingCustomer) return;
    const res = await deleteCustomer(deletingCustomer.id);
    if (res.success) {
      setCustomers(customers.filter((c) => c.id !== deletingCustomer.id));
      setDeletingCustomer(null);
    } else {
      alert(res.error || "Failed to delete customer");
    }
  };

  // Open History Modal
  const handleOpenHistory = async (customer: Customer) => {
    setHistoryCustomer(customer);
    setLoadingInvoices(true);
    const res = await getCustomerInvoices(customer.id);
    if (res.success && res.invoices) {
      setCustomerInvoices(res.invoices);
    } else {
      setCustomerInvoices([]);
    }
    setLoadingInvoices(false);
  };

  // Print Past Bill
  const handlePrintPastInvoice = (inv: any) => {
    const printData = {
      invoiceNumber: inv.invoiceNumber,
      invoiceDate: new Date(inv.date).toISOString().split("T")[0],
      paymentMode: inv.paymentMode || "Cash",
      customerName: historyCustomer?.name || "Walk-in Customer",
      customerPhone: historyCustomer?.mobile || "",
      customerAddress: historyCustomer?.address || "",
      customerGst: historyCustomer?.gstNumber || undefined,
      items: inv.items.map((item: any) => ({
        name: item.inventoryItem?.product?.name || "Item",
        brand: item.inventoryItem?.product?.brand,
        modelNumber: item.inventoryItem?.modelNumber,
        storage: item.inventoryItem?.storage,
        imei1: item.inventoryItem?.imei1,
        serialNumber: item.inventoryItem?.serialNumber,
        hsnCode: item.inventoryItem?.product?.hsnCode || "8517",
        qty: item.quantity || 1,
        mrp: item.rate + item.discount,
        discount: item.discount || 0,
        gst: item.gstPercentage || 0,
      })),
      subTotal: inv.subTotal,
      taxableAmount: inv.taxableAmount,
      cgst: inv.cgst,
      sgst: inv.sgst,
      roundOff: inv.roundOff,
      grandTotal: inv.totalAmount,
      notes: inv.notes || undefined,
      type: inv.type as "GST" | "NON_GST",
    };

    setSelectedInvoiceToPrint(printData);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Printable template offscreen for history reprint */}
      {selectedInvoiceToPrint && (
        <div className="hidden print:block">
          <InvoicePrintTemplate data={selectedInvoiceToPrint} />
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Database</h1>
          <p className="text-muted-foreground mt-1">
            Store customer profiles, edit details, and retrieve previous bills anytime.
          </p>
        </div>
        <Button
          onClick={() => setIsAddOpen(true)}
          className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 px-5"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Customer
        </Button>
      </div>

      {/* Search Input */}
      <div className="glass-panel p-4 rounded-2xl flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, mobile, address, GSTIN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-background border-none h-10 w-full"
          />
        </div>
        <div className="text-xs text-muted-foreground font-medium">
          Total: <span className="text-foreground font-bold">{filteredCustomers.length}</span> Customers
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-border/50">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-semibold text-foreground">Customer Name</TableHead>
              <TableHead className="font-semibold text-foreground">Mobile Number</TableHead>
              <TableHead className="font-semibold text-foreground">Address / Location</TableHead>
              <TableHead className="font-semibold text-foreground">GSTIN</TableHead>
              <TableHead className="font-semibold text-foreground text-center">Past Invoices</TableHead>
              <TableHead className="text-right font-semibold text-foreground w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  No customer records found. Click "Add Customer" to save new customer details.
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((customer) => (
                <TableRow key={customer.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium">
                    <div className="font-bold text-foreground">{customer.name}</div>
                  </TableCell>
                  <TableCell>
                    {customer.mobile ? (
                      <div className="flex items-center gap-1.5 font-mono text-sm">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                        {customer.mobile}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {customer.address ? (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground max-w-xs truncate">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        {customer.address}
                        {customer.state ? `, ${customer.state}` : ""}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {customer.gstNumber ? (
                      <Badge variant="outline" className="font-mono text-xs border-primary/30 text-primary">
                        {customer.gstNumber}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenHistory(customer)}
                      className="rounded-lg text-xs font-semibold hover:bg-primary/10 hover:text-primary"
                    >
                      <History className="h-3.5 w-3.5 mr-1" />
                      {customer.invoiceCount || customer.invoices?.length || 0} Bills
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="h-8 w-8 p-0 rounded-lg flex items-center justify-center hover:bg-muted cursor-pointer border-none outline-none">
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="glass-panel rounded-xl w-48">
                        <DropdownMenuItem
                          onClick={() => handleOpenHistory(customer)}
                          className="cursor-pointer"
                        >
                          <Receipt className="h-4 w-4 mr-2 text-primary" /> View Past Bills
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setEditingCustomer(customer)}
                          className="cursor-pointer"
                        >
                          <Edit className="h-4 w-4 mr-2" /> Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeletingCustomer(customer)}
                          className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Delete Customer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 1. Add Customer Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="glass-panel rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
            <DialogDescription>Save customer details for fast billing & invoice retrieval.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Customer Name *</Label>
              <Input id="name" name="name" required placeholder="e.g. Mohit Saini" className="bg-background" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number</Label>
              <Input id="mobile" name="mobile" placeholder="10-digit mobile number" className="bg-background font-mono" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" name="address" placeholder="e.g. Alwar, Rajasthan" className="bg-background" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" name="state" defaultValue="Rajasthan" className="bg-background" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pinCode">Pin Code</Label>
                <Input id="pinCode" name="pinCode" placeholder="301001" className="bg-background font-mono" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gstNumber">GSTIN Number (Optional)</Label>
              <Input id="gstNumber" name="gstNumber" placeholder="e.g. 08AAAAA0000A1Z5" className="bg-background font-mono uppercase" />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button type="submit" className="rounded-xl bg-primary text-primary-foreground">
                Save Customer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 2. Edit Customer Dialog */}
      <Dialog open={!!editingCustomer} onOpenChange={(open) => !open && setEditingCustomer(null)}>
        <DialogContent className="glass-panel rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Customer Profile</DialogTitle>
            <DialogDescription>Update name, mobile, address, or GSTIN details.</DialogDescription>
          </DialogHeader>
          {editingCustomer && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Customer Name *</Label>
                <Input
                  id="edit-name"
                  name="name"
                  required
                  defaultValue={editingCustomer.name}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-mobile">Mobile Number</Label>
                <Input
                  id="edit-mobile"
                  name="mobile"
                  defaultValue={editingCustomer.mobile || ""}
                  className="bg-background font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-address">Address</Label>
                <Input
                  id="edit-address"
                  name="address"
                  defaultValue={editingCustomer.address || ""}
                  className="bg-background"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-state">State</Label>
                  <Input
                    id="edit-state"
                    name="state"
                    defaultValue={editingCustomer.state || "Rajasthan"}
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-pinCode">Pin Code</Label>
                  <Input
                    id="edit-pinCode"
                    name="pinCode"
                    defaultValue={editingCustomer.pinCode || ""}
                    className="bg-background font-mono"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-gstNumber">GSTIN Number</Label>
                <Input
                  id="edit-gstNumber"
                  name="gstNumber"
                  defaultValue={editingCustomer.gstNumber || ""}
                  className="bg-background font-mono uppercase"
                />
              </div>
              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingCustomer(null)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl bg-primary text-primary-foreground">
                  Update Changes
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* 3. Delete Confirmation Dialog */}
      <Dialog open={!!deletingCustomer} onOpenChange={(open) => !open && setDeletingCustomer(null)}>
        <DialogContent className="glass-panel rounded-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Customer</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-bold text-foreground">{deletingCustomer?.name}</span>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeletingCustomer(null)}
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
              Delete Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 4. Customer Invoice History Dialog */}
      <Dialog open={!!historyCustomer} onOpenChange={(open) => !open && setHistoryCustomer(null)}>
        <DialogContent className="glass-panel rounded-2xl max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" /> Past Bills — {historyCustomer?.name}
            </DialogTitle>
            <DialogDescription>
              Retrieve and print previous bills for customer duplicate invoice requests.
            </DialogDescription>
          </DialogHeader>

          {loadingInvoices ? (
            <div className="p-8 text-center text-muted-foreground animate-pulse">
              Loading past bills...
            </div>
          ) : customerInvoices.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No bills found for this customer.
            </div>
          ) : (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Invoice No.</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right">Total Amount (₹)</TableHead>
                    <TableHead className="text-right w-[100px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerInvoices.map((inv) => (
                    <TableRow key={inv.id} className="hover:bg-muted/30">
                      <TableCell className="font-mono font-bold">{inv.invoiceNumber}</TableCell>
                      <TableCell>{new Date(inv.date).toISOString().split("T")[0]}</TableCell>
                      <TableCell>
                        <Badge variant={inv.type === "GST" ? "default" : "secondary"}>
                          {inv.type === "GST" ? "TAX INVOICE" : "NON-GST"}
                        </Badge>
                      </TableCell>
                      <TableCell className="capitalize">{inv.paymentMode}</TableCell>
                      <TableCell className="text-right font-mono font-bold text-primary">
                        ₹{inv.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePrintPastInvoice(inv)}
                          className="rounded-lg h-8"
                        >
                          <Printer className="h-3.5 w-3.5 mr-1" /> Print Bill
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
